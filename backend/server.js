// server.js
// Backend local compatível com o seu front.
// NÃO exige .env (usa defaults do seu .env.local do front), mas aceita process.env se quiser sobrescrever.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ============================
// Configuração (com defaults)
// ============================

// Porta
const PORT = process.env.PORT || 3001;

// Origem permitida (ajuste se necessário)
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000';

// Valores que você tem no .env.local do front (copiados como fallback)
const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const NEXT_PUBLIC_TISAUDE_HASH = process.env.NEXT_PUBLIC_TISAUDE_HASH || '72d5204a08ccf04c44f29f65c3e86202';
const TISAUDE_SENHA_PARCEIRO   = process.env.TISAUDE_SENHA_PARCEIRO   || '0101Bravo#65';
const NEXT_PUBLIC_TISAUDE_SENHA_PARCEIRO = process.env.NEXT_PUBLIC_TISAUDE_SENHA_PARCEIRO || TISAUDE_SENHA_PARCEIRO;

const NEXT_PUBLIC_TISAUDE_LOGIN_URL = process.env.NEXT_PUBLIC_TISAUDE_LOGIN_URL || 'https://app.tisaude.com/api/rest/login';
const NEXT_PUBLIC_TISAUDE_BASE_URL  = process.env.NEXT_PUBLIC_TISAUDE_BASE_URL  || 'https://app.tisaude.com/api/rest';

// Token da clínica (fallback para chamadas específicas server-to-server — ajuste a validade!)
const TISAUDE_CLINIC_BEARER = process.env.TISAUDE_CLINIC_BEARER || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjc5NTAsImlzcyI6Imh0dHBzOlwvXC9hcHAudGlzYXVkZS5jb21cL2FwaVwvbG9naW4iLCJpYXQiOjE3NTUxMTYxOTYsImV4cCI6MTc1NzUzNTM5NiwibmJmIjoxNzU1MTE2MTk2LCJqdGkiOiJYWWZ5YWJZN0tmZjlPeW9DIn0.cgh-tqDOz5o_tEXLHzxFybI738vWUmdd9Bcj2qcIIoo';

// IDs padrão que seu front usa
const NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID = String(process.env.NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID || '85025');
const NEXT_PUBLIC_TISAUDE_LOCAL_ID        = String(process.env.NEXT_PUBLIC_TISAUDE_LOCAL_ID        || '1');
const NEXT_PUBLIC_TISAUDE_TIPO_ID         = String(process.env.NEXT_PUBLIC_TISAUDE_TIPO_ID         || '1');

// ============================
// Endpoints do TiSaúde (ajuste se o seu contrato for diferente)
// ============================

// 1) Login do paciente
const URL_LOGIN = NEXT_PUBLIC_TISAUDE_LOGIN_URL; // POST { cpf, senha, (opcional) hash }

// 2) Listar profissionais
//    -> AJUSTE CONFORME SEU CONTRATO
const URL_LISTAR_PROFISSIONAIS = `${NEXT_PUBLIC_TISAUDE_BASE_URL}/profissional/listar`;

// 3) Datas disponíveis por procedimento
//    -> AJUSTE CONFORME SEU CONTRATO
const URL_DATAS = `${NEXT_PUBLIC_TISAUDE_BASE_URL}/agenda/datas`;

// 4) Horas disponíveis por procedimento+data
//    -> AJUSTE CONFORME SEU CONTRATO
const URL_HORAS = `${NEXT_PUBLIC_TISAUDE_BASE_URL}/agenda/horas`;

// 5) Criar agendamento
//    -> AJUSTE CONFORME SEU CONTRATO
const URL_CRIAR_CONSULTA = `${NEXT_PUBLIC_TISAUDE_BASE_URL}/consulta/adicionar`;

// 6) Cadastro de paciente (você já usava)
const URL_CADASTRO = `${NEXT_PUBLIC_TISAUDE_BASE_URL}/paciente/adicionar`;

app.use(cors({
  origin: FRONT_ORIGIN,
  credentials: false
}));
app.use(express.json());

function onlyDigits(s) { return String(s || '').replace(/\D+/g, ''); }

function bearerFromReq(req) {

  const h = req.headers || {};
  const auth = h['authorization'] || h['Authorization'];
  if (auth) return auth;
  return `Bearer ${TISAUDE_CLINIC_BEARER}`;
}

function xCpfFromReq(req) {
  const h = req.headers || {};
  return h['x-patient-cpf'] || h['X-Patient-CPF'] || '';
}

function required(v, name) {
  if (!v) throw new Error(`${name} é obrigatório`);
  return v;
}


app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', ts: new Date().toISOString() });
});

app.post('/api/tisaude/login', async (req, res) => {
  try {
    const cpf = onlyDigits(required(req.body?.cpf, 'cpf'));
    const senha = NEXT_PUBLIC_TISAUDE_SENHA_PARCEIRO;

    const body = { cpf, senha };
    

    const r = await axios.post(URL_LOGIN, body, {
      headers: { 'Content-Type': 'application/json' }
    });

    
    const data = r.data || {};

    const access_token = data?.access_token || data?.token || data?.data?.access_token;
    const paciente = data?.paciente || data?.data?.paciente || { cpf };

    if (!access_token) {
      return res.status(400).json({ ok: false, error: 'Login sem token. Verifique URL_LOGIN e credenciais.' });
    }

    return res.json({
      ok: true,
      data: {
        access_token,
        paciente,
        first_access: data?.first_access || false,
        is_new: data?.is_new || false
      }
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const payload = err.response?.data || { error: err.message || 'Erro no login' };
    return res.status(status).json({ ok: false, ...payload });
  }
});


app.post('/api/tisaude/has-agendamento', async (req, res) => {
  try {
    const cpf = onlyDigits(required(req.body?.cpf, 'cpf'));
    return res.json({ ok: true, data: { hasAgenda: false, cpf } });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
});


app.get('/api/tisaude/profissionais', async (req, res) => {
  try {
    const auth = bearerFromReq(req);
    const hash = NEXT_PUBLIC_TISAUDE_HASH;

    const r = await axios.get(URL_LISTAR_PROFISSIONAIS, {
      params: { hash },
      headers: { Authorization: auth }
    });

    const items = r.data?.items || r.data?.data || r.data || [];
    return res.json({ ok: true, items });
  } catch (err) {
    const status = err.response?.status || 500;
    const payload = err.response?.data || { error: err.message };
    return res.status(status).json({ ok: false, ...payload });
  }
});

app.get('/api/tisaude/datas', async (req, res) => {
  try {
    const auth = bearerFromReq(req);
    const hash = NEXT_PUBLIC_TISAUDE_HASH;
    const procedimentoId = String(req.query?.procedimentoId || NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID);

    const r = await axios.get(URL_DATAS, {
      params: { hash, procedimentoId },
      headers: { Authorization: auth }
    });

    const items = r.data?.items || r.data?.data || r.data || [];
    return res.json({ ok: true, items });
  } catch (err) {
    const status = err.response?.status || 500;
    const payload = err.response?.data || { error: err.message };
    return res.status(status).json({ ok: false, ...payload });
  }
});


app.get('/api/tisaude/horas', async (req, res) => {
  try {
    const auth = bearerFromReq(req);
    const hash = NEXT_PUBLIC_TISAUDE_HASH;
    const procedimentoId = String(req.query?.procedimentoId || NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID);
    const dataISO = String(required(req.query?.data, 'data'));

    const r = await axios.get(URL_HORAS, {
      params: { hash, procedimentoId, data: dataISO },
      headers: { Authorization: auth }
    });

    const items = r.data?.items || r.data?.data || r.data || [];
    return res.json({ ok: true, items });
  } catch (err) {
    const status = err.response?.status || 500;
    const payload = err.response?.data || { error: err.message };
    return res.status(status).json({ ok: false, ...payload });
  }
});


app.post('/api/tisaude/consulta', async (req, res) => {
  try {
    const auth = bearerFromReq(req);
    const hash = NEXT_PUBLIC_TISAUDE_HASH;

    const procedimentoId = String(req.body?.procedimentoId || NEXT_PUBLIC_TISAUDE_PROCEDIMENTO_ID);
    const dataISO        = String(required(req.body?.data, 'data')); 
    const hora           = String(required(req.body?.hora, 'hora')); 

    const payload = {
      procedimento_id: procedimentoId,
      data: dataISO,
      hora,
      local_id: NEXT_PUBLIC_TISAUDE_LOCAL_ID,
      tipo_id: NEXT_PUBLIC_TISAUDE_TIPO_ID
    };

    const r = await axios.post(`${URL_CRIAR_CONSULTA}?hash=${encodeURIComponent(hash)}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth
      }
    });

 
    const data = r.data || {};
    return res.json({ ok: true, data });
  } catch (err) {
    const status = err.response?.status || 500;
    const payload = err.response?.data || { error: err.message };
    return res.status(status).json({ ok: false, ...payload });
  }
});

app.post('/api/cadastro', async (req, res) => {
  try {
    const hash = NEXT_PUBLIC_TISAUDE_HASH;
    const auth = bearerFromReq(req);

   
    const { hash: _drop, ...body } = req.body || {};
    const url = `${URL_CADASTRO}?hash=${encodeURIComponent(hash)}`;

    const r = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth
      }
    });

    return res.json(r.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const payload = error.response?.data || { error: 'Erro ao cadastrar paciente' };
    console.error('Cadastro ERROR:', payload);
    return res.status(status).json({ ok: false, ...payload });
  }
});


app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
  console.log(`Front origin liberada: ${FRONT_ORIGIN}`);
  console.log(`TiSaúde BASE: ${NEXT_PUBLIC_TISAUDE_BASE_URL}`);
});
