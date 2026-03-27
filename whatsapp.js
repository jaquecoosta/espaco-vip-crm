import { kv } from '@vercel/kv';

// Webhook do WhatsApp Business API (Meta)
// Configure este endpoint no painel da Meta: https://developers.facebook.com
// URL: https://SEU-DOMINIO.vercel.app/api/whatsapp
// Token de verificação: defina WHATSAPP_VERIFY_TOKEN no Vercel Environment Variables

export default async function handler(req, res) {
  // ── Verificação do webhook (GET - exigido pela Meta) ──────────────────────
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso!');
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Token inválido' });
  }

  // ── Recebimento de mensagens (POST) ────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const body = req.body;

      // Verificar se é uma mensagem válida
      if (body.object !== 'whatsapp_business_account') {
        return res.status(400).json({ error: 'Payload inválido' });
      }

      const entry   = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value   = changes?.value;
      const message = value?.messages?.[0];

      if (!message) return res.status(200).json({ ok: true }); // sem mensagem, ignorar

      const from    = message.from;   // número do remetente (ex: 5511999999999)
      const nome    = value?.contacts?.[0]?.profile?.name || 'Desconhecido';
      const texto   = message.text?.body || '';
      const agora   = new Date().toISOString();

      // Verificar se lead já existe pelo número
      const leads = await kv.get('leads') || [];
      const jaExiste = leads.find(l => l.wa && l.wa.replace(/\D/g,'') === from);

      if (!jaExiste) {
        // Criar novo lead automaticamente
        const novoLead = {
          id: Date.now().toString(),
          nome,
          tipo: 'Outros',          // será qualificado depois
          status: 'Lead',
          wa: from,
          email: '',
          data: '',
          conv: '',
          obs: `Primeira mensagem via WhatsApp:\n"${texto.slice(0, 300)}"`,
          foto: '',
          parcelas: [],
          origemWhatsApp: true,
          criadoEm: agora,
        };

        leads.push(novoLead);
        await kv.set('leads', leads);
        console.log(`Novo lead criado via WhatsApp: ${nome} (${from})`);
      } else {
        // Atualizar observações com nova mensagem
        const idx = leads.findIndex(l => l.wa && l.wa.replace(/\D/g,'') === from);
        if (idx !== -1 && texto) {
          leads[idx].obs = (leads[idx].obs || '') + `\n[${new Date().toLocaleDateString('pt-BR')}] ${texto.slice(0, 200)}`;
          await kv.set('leads', leads);
        }
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Erro no webhook WhatsApp:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
