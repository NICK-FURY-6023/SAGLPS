const express = require('express');
const authMiddleware = require('../middleware/auth');
const supabase = require('../services/supabase');
const { generateLabelPDF } = require('../services/pdf');

const router = express.Router();

// All template routes require authentication
router.use(authMiddleware);

// GET /api/templates
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// POST /api/templates
router.post('/', async (req, res) => {
  const { name, label_data } = req.body;

  if (!name || !label_data) {
    return res.status(400).json({ error: 'name and label_data are required' });
  }

  const { data, error } = await supabase
    .from('templates')
    .insert({ name, label_data })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// GET /api/templates/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }

  res.json(data);
});

// PUT /api/templates/:id
router.put('/:id', async (req, res) => {
  const { name, label_data } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (label_data !== undefined) updates.label_data = label_data;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const { data, error } = await supabase
    .from('templates')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }

  res.json(data);
});

// DELETE /api/templates/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('templates').delete().eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send();
});

// POST /api/templates/:id/pdf
router.post('/:id/pdf', async (req, res) => {
  const { data: template, error: fetchError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (fetchError) {
    return res.status(fetchError.code === 'PGRST116' ? 404 : 500).json({ error: fetchError.message });
  }

  try {
    const publicUrl = await generateLabelPDF(template.label_data);
    res.json({ url: publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
