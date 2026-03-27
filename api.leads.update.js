import { kv } from '@vercel/kv';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  // PUT - atualizar lead (ex: marcar parcela como paga)
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const updated = req.body;
      let leads = await kv.get('leads') || [];
      leads = leads.map(l => l.id === id ? { ...l, ...updated } : l);
      await kv.set('leads', leads);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
