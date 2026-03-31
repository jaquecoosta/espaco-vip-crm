// api/auth.js — Autenticação do Espaço VIP CRM
// Variáveis de ambiente necessárias no Vercel:
//   CRM_USUARIO  → ex: admin
//   CRM_SENHA    → ex: MinhaS3nhaForte!
//   CRM_SECRET   → string aleatória longa para assinar o token

const SECRET = process.env.CRM_SECRET || 'fallback-dev-secret-trocar-em-producao';
const SESSION_HOURS = 8;

// ---- Mini JWT (sem dependência externa) ----
function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function hmacSha256(key, data) {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', key).update(data).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function criarToken(usuario) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub: usuario,
    iat: Date.now(),
    exp: Date.now() + SESSION_HOURS * 3600 * 1000
  }));
  const sig = hmacSha256(SECRET, header + '.' + payload);
  return header + '.' + payload + '.' + sig;
}

function verificarToken(token) {
  try {
    const [header, payload, sig] = token.split('.');
    const expectedSig = hmacSha256(SECRET, header + '.' + payload);
    if (sig !== expectedSig) return null;
    const dados = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (Date.now() > dados.exp) return null;
    return dados;
  } catch (e) {
    return null;
  }
}

// ---- Handler principal ----
export default function handler(req, res) {
  // Headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  // POST /api/auth — Login
  if (req.method === 'POST') {
    const { usuario, senha } = req.body || {};

    const usuarioCorreto = process.env.CRM_USUARIO || 'admin';
    const senhaCorreta   = process.env.CRM_SENHA   || 'senha123';

    if (!usuario || !senha) {
      return res.status(400).json({ erro: 'Credenciais obrigatórias' });
    }

    // Comparação em tempo constante para evitar timing attacks
    const crypto = require('crypto');
    const bufUser = Buffer.from(usuario);
    const bufCorrectUser = Buffer.from(usuarioCorreto);
    const bufPass = Buffer.from(senha);
    const bufCorrectPass = Buffer.from(senhaCorreta);

    const userOk = bufUser.length === bufCorrectUser.length &&
      crypto.timingSafeEqual(bufUser, bufCorrectUser);
    const passOk = bufPass.length === bufCorrectPass.length &&
      crypto.timingSafeEqual(bufPass, bufCorrectPass);

    if (!userOk || !passOk) {
      // Delay para dificultar brute force
      return setTimeout(() => {
        res.status(401).json({ erro: 'Credenciais inválidas' });
      }, 500);
    }

    const token = criarToken(usuario);
    return res.status(200).json({ token, expira: SESSION_HOURS + 'h' });
  }

  // GET /api/auth — Verificar token
  if (req.method === 'GET') {
    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return res.status(401).json({ erro: 'Token ausente' });

    const dados = verificarToken(token);
    if (!dados) return res.status(401).json({ erro: 'Token inválido ou expirado' });

    return res.status(200).json({ ok: true, usuario: dados.sub });
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
