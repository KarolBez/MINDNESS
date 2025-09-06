import { NextResponse } from "next/server";
import { BASE, getHash, onlyDigits } from "../utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function tryLogin(cpf: string, senha_parceiro: string) {
  const url = `${BASE}/rest/login?hash=${getHash()}`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // sem Authorization
    cache: "no-store",
    body: JSON.stringify({ cpf, senha_parceiro }),
  });
  const text = await upstream.text();
  let raw: any = null; try { raw = text ? JSON.parse(text) : null; } catch { raw = { raw: text }; }
  return { ok: upstream.ok && !!raw?.access_token, status: upstream.status, raw };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const cpf = onlyDigits(body?.cpf || "");
    if (!cpf) return NextResponse.json({ ok:false, error:"CPF é obrigatório" }, { status:400 });

    // 1) se vier no body, usa direto
    const senhaFromBody = (body?.senha_parceiro ?? "").toString().trim();
    if (senhaFromBody) {
      const r = await tryLogin(cpf, senhaFromBody);
      if (r.ok) {
        return NextResponse.json({ ok:true, data: r.raw });
      }
      return NextResponse.json({ ok:false, error: r.raw?.mensagem || r.raw?.message || r.raw?.error || "Falha no login", upstream: r.raw }, { status: r.status || 409 });
    }

    // 2) tenta com env privada e pública
    const priv = (process.env.TISAUDE_SENHA_PARCEIRO || "").trim();
    const pub  = (process.env.NEXT_PUBLIC_TISAUDE_SENHA_PARCEIRO || "").trim();

    // tenta primeiro a privada
    if (priv) {
      const r = await tryLogin(cpf, priv);
      if (r.ok) return NextResponse.json({ ok:true, data: r.raw });
    }
    // depois a pública
    if (pub && pub !== priv) {
      const r = await tryLogin(cpf, pub);
      if (r.ok) return NextResponse.json({ ok:true, data: r.raw });
    }

    // 3) diagnóstico claro
    return NextResponse.json({
      ok: false,
      error: "Credenciais Inválidas. Verifique a senha do parceiro.",
      debug: {
        hasPrivateEnv: !!priv, privateLen: priv.length,
        hasPublicEnv:  !!pub,  publicLen:  pub.length,
        hint: "Defina TISAUDE_SENHA_PARCEIRO no .env.local e reinicie o dev server."
      }
    }, { status: 401 });

  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message || "Erro no login" }, { status:500 });
  }
}
