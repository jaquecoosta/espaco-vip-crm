# 🍽 Espaço VIP CRM — Guia de Instalação

## O que você vai ter ao final
- CRM completo acessível de **qualquer celular ou computador**
- Dados salvos na **nuvem** (não se perdem)
- **Integração automática com WhatsApp** Business
- URL própria: `espaco-vip-crm.vercel.app` (gratuita)

---

## Passo a Passo — Hospedagem no Vercel (15 minutos)

### 1. Criar conta no GitHub (gratuito)
1. Acesse https://github.com e crie uma conta
2. Clique em **New repository**
3. Nome: `espaco-vip-crm`
4. Deixe como **Private** (privado)
5. Clique em **Create repository**

### 2. Fazer upload dos arquivos
Após criar o repositório, clique em **uploading an existing file** e envie todos os arquivos desta pasta:
```
espaco-vip-crm/
├── package.json
├── vercel.json
├── api/
│   ├── leads.js
│   ├── lead-update.js
│   └── whatsapp.js
└── public/
    └── index.html
```

### 3. Criar conta no Vercel (gratuito)
1. Acesse https://vercel.com
2. Clique em **Sign up with GitHub**
3. Autorize o Vercel acessar sua conta

### 4. Importar o projeto
1. No Vercel, clique em **Add New Project**
2. Selecione o repositório `espaco-vip-crm`
3. Clique em **Deploy**
4. Aguarde ~1 minuto — seu site estará no ar!

### 5. Criar o banco de dados (Vercel KV)
1. No painel do Vercel, vá em **Storage**
2. Clique em **Create Database** → escolha **KV**
3. Nome: `espaco-vip-db`
4. Clique em **Connect to Project** e selecione seu projeto
5. As variáveis de ambiente serão adicionadas automaticamente

### 6. Fazer o redeploy
1. No painel do projeto, vá em **Deployments**
2. Clique nos 3 pontos do último deploy → **Redeploy**
3. Pronto! O CRM está funcionando com banco de dados real.

---

## Integração WhatsApp Business (opcional)

### Pré-requisitos
- Número de telefone dedicado ao negócio
- Conta no Meta for Developers: https://developers.facebook.com

### Configuração
1. No painel do Vercel → **Settings** → **Environment Variables**
2. Adicione:
   ```
   WHATSAPP_VERIFY_TOKEN = espaco-vip-token-2024
   ```
3. No Meta for Developers:
   - Crie um app → **WhatsApp** → **Webhooks**
   - URL do webhook: `https://SEU-PROJETO.vercel.app/api/whatsapp`
   - Token de verificação: `espaco-vip-token-2024`
   - Selecione o evento: `messages`
4. Pronto! Toda mensagem recebida no WhatsApp Business cria um lead automaticamente.

---

## Como usar o CRM

### Cadastrar cliente manualmente
1. Preencha o formulário à esquerda
2. Clique em **+ Cadastrar cliente**
3. O dado é salvo na nuvem imediatamente

### Leads automáticos do WhatsApp
- Quando alguém manda mensagem no seu WhatsApp Business, um lead é criado automaticamente com nome e número
- Filtre por **📱 WA** para ver leads vindos do WhatsApp
- Qualifique o lead: mude o tipo de evento e status conforme avança na conversa

### Sincronização
- Os dados atualizam automaticamente a cada 30 segundos
- Clique em **↻ Sincronizar** para atualizar na hora

---

## Precisa de ajuda?
Volte ao Claude e peça suporte — basta copiar a mensagem de erro que aparece.
