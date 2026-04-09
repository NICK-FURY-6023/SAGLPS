const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    supabase = createClient(url, key);
  }
  return supabase;
}

// Check if error is "table not found" — means user hasn't run setup SQL yet
function isTableMissing(error) {
  return error?.code === 'PGRST205' || error?.code === '42P01' ||
    (error?.message || '').includes('does not exist');
}

const TABLE_MISSING_MSG = 'Templates table not found. Run the setup SQL in Supabase Dashboard — see scripts/setup-db.sql';
const DRAFT_TABLE_MISSING = 'Drafts table not found. Run the setup SQL in Supabase Dashboard — see scripts/setup-db.sql';
const HISTORY_TABLE_MISSING = 'History table not found. Run the setup SQL in Supabase Dashboard — see scripts/setup-db.sql';

const db = {
  async listTemplates() {
    const sb = getSupabase();
    const { data, error } = await sb.from('templates').select('*').order('created_at', { ascending: false });
    if (error) {
      if (isTableMissing(error)) return []; // graceful: return empty list
      throw new Error(error.message);
    }
    return data || [];
  },

  async getTemplate(id) {
    const sb = getSupabase();
    const { data, error } = await sb.from('templates').select('*').eq('id', id).single();
    if (error) {
      if (isTableMissing(error)) throw new Error(TABLE_MISSING_MSG);
      throw new Error(error.message || 'Not found');
    }
    return data;
  },

  async createTemplate(name, label_data) {
    const sb = getSupabase();
    const { data, error } = await sb.from('templates').insert([{ name, label_data }]).select().single();
    if (error) {
      if (isTableMissing(error)) throw new Error(TABLE_MISSING_MSG);
      throw new Error(error.message);
    }
    return data;
  },

  async updateTemplate(id, name, label_data) {
    const sb = getSupabase();
    const { data, error } = await sb.from('templates').update({ name, label_data }).eq('id', id).select().single();
    if (error) {
      if (isTableMissing(error)) throw new Error(TABLE_MISSING_MSG);
      throw new Error(error.message);
    }
    return data;
  },

  async deleteTemplate(id) {
    const sb = getSupabase();
    const { error } = await sb.from('templates').delete().eq('id', id);
    if (error) {
      if (isTableMissing(error)) throw new Error(TABLE_MISSING_MSG);
      throw new Error(error.message);
    }
  },

  // ── Drafts ──
  async getDraft() {
    const sb = getSupabase();
    const { data, error } = await sb.from('drafts').select('*').eq('id', 'default').maybeSingle();
    if (error) {
      if (isTableMissing(error)) return null;
      throw new Error(error.message);
    }
    return data;
  },

  async upsertDraft(draftData) {
    const sb = getSupabase();
    const { data, error } = await sb.from('drafts').upsert({
      id: 'default',
      data: draftData,
      updated_at: new Date().toISOString(),
    }).select().single();
    if (error) {
      if (isTableMissing(error)) throw new Error(DRAFT_TABLE_MISSING);
      throw new Error(error.message);
    }
    return data;
  },

  // ── History ──
  async listHistory(limit = 30) {
    const sb = getSupabase();
    const { data, error } = await sb.from('history').select('*')
      .order('created_at', { ascending: false }).limit(limit);
    if (error) {
      if (isTableMissing(error)) return [];
      throw new Error(error.message);
    }
    return data || [];
  },

  async addHistory(entry) {
    const sb = getSupabase();
    const { data, error } = await sb.from('history').insert([entry]).select().single();
    if (error) {
      if (isTableMissing(error)) throw new Error(HISTORY_TABLE_MISSING);
      throw new Error(error.message);
    }
    // Prune old entries beyond 30
    try {
      const { data: all } = await sb.from('history').select('id')
        .order('created_at', { ascending: false });
      if (all && all.length > 30) {
        const idsToDelete = all.slice(30).map(r => r.id);
        await sb.from('history').delete().in('id', idsToDelete);
      }
    } catch { /* ignore pruning errors */ }
    return data;
  },

  async deleteHistoryEntry(id) {
    const sb = getSupabase();
    const { error } = await sb.from('history').delete().eq('id', id);
    if (error) {
      if (isTableMissing(error)) throw new Error(HISTORY_TABLE_MISSING);
      throw new Error(error.message);
    }
  },

  async clearHistory() {
    const sb = getSupabase();
    const { error } = await sb.from('history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      if (isTableMissing(error)) throw new Error(HISTORY_TABLE_MISSING);
      throw new Error(error.message);
    }
  },
};

module.exports = { db };
