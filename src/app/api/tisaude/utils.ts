// src/app/api/tisaude/utils.ts

function stripRest(u?: string) {
  if (!u) return "https://app.tisaude.com/api";
  return u.endsWith("/rest") ? u.slice(0, -5) : u;
}

export const BASE =
  stripRest(process.env.NEXT_PUBLIC_TISAUDE_BASE_URL) || "https://app.tisaude.com/api";

const REST_SEGMENT = "/rest";

/** Hash público exigido pelo TI.Saúde */
export function getHash(): string {
  const h = process.env.NEXT_PUBLIC_TISAUDE_HASH || "";
  if (!h) throw new Error("NEXT_PUBLIC_TISAUDE_HASH ausente no .env.local");
  return h;
}

/** Senha do parceiro: prioriza env privada no server e faz fallback para a pública; sempre com trim() */
export function getSenhaParceiro(): string {
  const v =
    (process.env.TISAUDE_SENHA_PARCEIRO ??
      process.env.NEXT_PUBLIC_TISAUDE_SENHA_PARCEIRO ??
      "")
      .toString()
      .trim();

  if (!v) {
    throw new Error(
      "Senha do parceiro ausente. Defina TISAUDE_SENHA_PARCEIRO ou NEXT_PUBLIC_TISAUDE_SENHA_PARCEIRO no .env.local"
    );
  }
  return v;
}

/** Mantém apenas dígitos (útil para CPF/telefone) */
export function onlyDigits(s: string): string {
  return (s || "").replace(/\D+/g, "");
}

/** Heurística simples para detectar erro no payload do upstream */
export function hasUpstreamError(raw: any): boolean {
  if (!raw) return true;
  if (raw.error) return true;
  const msg = (raw.mensagem || raw.message || "").toString().toLowerCase();
  if (!msg) return false;
  return (
    msg.includes("erro") ||
    ((msg.includes("nao") || msg.includes("não")) && msg.includes("dispon")) ||
    msg.includes("obrigat")
  );
}

/** Monta URL do TI.Saúde sempre com ?hash= na query */
export function tiUrl(
  path: string,
  qs?: Record<string, string | number | boolean | null | undefined>
) {
  const url = new URL(`${BASE}${REST_SEGMENT}${path}`);
  url.searchParams.set("hash", getHash());
  if (qs) {
    for (const [k, v] of Object.entries(qs)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/** Escolhe token do request/ambiente (Authorization do cliente > patient env > clinic env) */
export function chooseToken(req?: Request): string | null {
  if (req) {
    const auth = req.headers.get("authorization");
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const token = auth.slice(7).trim();
      if (token) return token;
    }
    const xTok = req.headers.get("x-patient-token");
    if (xTok) return xTok.trim();
  }

  const patientEnv = process.env.TISAUDE_PATIENT_BEARER;
  if (patientEnv) return patientEnv.trim();

  const clinicEnv = process.env.TISAUDE_CLINIC_BEARER;
  if (clinicEnv) return clinicEnv.trim();

  return null;
}

/** Constrói headers com JSON + Bearer (se existir) */
export function buildHeaders(req?: Request, extra?: HeadersInit): Headers {
  const headers = new Headers(extra || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = chooseToken(req);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

/** Headers somente com o bearer de paciente do .env (para testes) */
export function authHeadersPatient(): HeadersInit {
  const bearer = process.env.TISAUDE_PATIENT_BEARER || "";
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (bearer) h.Authorization = `Bearer ${bearer}`;
  return h;
}

/** Headers somente com o bearer da clínica do .env (fallback recomendado) */
export function authHeadersClinic(): HeadersInit {
  const bearer = process.env.TISAUDE_CLINIC_BEARER || "";
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (bearer) h.Authorization = `Bearer ${bearer}`;
  return h;
}

/** Tenta parsear JSON com segurança */
function safeJson(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

/**
 * Faz a chamada ao upstream e normaliza a resposta
 * Retorna:
 *  - { ok:true, data, items } em sucesso
 *  - { ok:false, status, error, upstream } em erro
 */
export async function fetchUpstream(
  req: Request,
  path: string,
  init?: RequestInit,
  qs?: Record<string, string | number | boolean | null | undefined>
) {
  const url = tiUrl(path, qs);
  const headers = buildHeaders(req, init?.headers);
  const res = await fetch(url, { ...init, headers, cache: "no-store" });

  const text = await res.text();
  const json = safeJson(text);

  if (!res.ok) {
    return Response.json(
      {
        ok: false,
        status: res.status,
        error:
          json?.message ||
          json?.mensagem ||
          json?.error ||
          text ||
          res.statusText,
        upstream: json,
      },
      { status: res.status }
    );
  }

  const items = Array.isArray(json)
    ? json
    : Array.isArray(json?.items)
    ? json.items
    : json && typeof json === "object"
    ? Object.values(json)
    : [];

  return Response.json({ ok: true, data: json, items });
}
