// src/lib/tisaude.ts
const BASE = process.env.NEXT_PUBLIC_TISAUDE_BASE_URL || "https://app.tisaude.com/api/rest";
const HASH = process.env.NEXT_PUBLIC_TISAUDE_HASH!;
const CLINIC_BEARER = process.env.TISAUDE_CLINIC_BEARER || ""; // server-only

/**
 * Monta URL do TI.Saúde já com ?hash=...
 */
export function tiUrl(path: string, qs?: Record<string, string | number | undefined>) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("hash", HASH);
  if (qs) {
    Object.entries(qs).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

/**
 * Escolhe o token a usar na chamada (prioridade: header x-patient-token -> Bearer do Authorization -> env clinic/patient)
 */
export function pickAuthToken(req: Request) {
  // 1) token enviado pelo cliente num header custom
  const patientFromHeader = req.headers.get("x-patient-token");
  if (patientFromHeader) return patientFromHeader;

  // 2) Authorization: Bearer ...
  const auth = req.headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7);
  }

  // 3) Fallback (server): clinic bearer do .env
  if (CLINIC_BEARER) return CLINIC_BEARER;

  // 4) (opcional) patient bearer em .env (se quiser manter temporariamente)
  const patientEnv = process.env.TISAUDE_PATIENT_BEARER;
  if (patientEnv) return patientEnv;

  return null;
}

/**
 * Faz fetch ao TI.Saúde com Bearer escolhido automaticamente
 */
export async function tiFetchUpstream(
  req: Request,
  path: string,
  init?: RequestInit,
  qs?: Record<string, string | number | undefined>
) {
  const url = tiUrl(path, qs);
  const token = pickAuthToken(req);
  const headers = new Headers(init?.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* keep raw text if JSON parse fails */ }

  if (!res.ok) {
    return Response.json(
      { ok: false, status: res.status, error: json?.message || json?.error || text || res.statusText },
      { status: res.status }
    );
  }
  return Response.json({ ok: true, data: json, items: json?.items ?? json });
}
