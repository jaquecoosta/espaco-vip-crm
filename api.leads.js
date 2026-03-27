import { kv } from '@vercel/kv';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - listar todos os leads
  if (req.method === 'GET') {
    try {
      const leads = await kv.get('leads') || [];
      return res.status(200).json(leads);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST - criar lead
  if (req.method === 'POST') {
    try {
      const lead = req.body;
      lead.id = lead.id || Date.now().toString();
      lead.criadoEm = lead.criadoEm || new Date().toISOString();
      const leads = await kv.get('leads') || [];
      leads.push(lead);
      await kv.set('leads', leads);
      return res.status(201).json(lead);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // DELETE - remover lead por id (?id=xxx)
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      let leads = await kv.get('leads') || [];
      leads = leads.filter(l => l.id !== id);
      await kv.set('leads', leads);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
