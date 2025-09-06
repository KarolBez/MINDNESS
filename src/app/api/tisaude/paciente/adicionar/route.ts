// src/app/api/tisaude/paciente/adicionar/route.ts
import { NextResponse } from "next/server";
import { BASE } from "../../utils";
import {
  getHash,
  getSenhaParceiro,
  authHeadersClinic,
  onlyDigits,
} from "../../utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * Espera no body:
 * {
 *   cpf: "97069159072",
 *   nome: "EMANUEL TESTE",
 *   nascimento?: "01/01/1988" (ou timestamp/ISO que o upstream aceite),
 *   celular?: "81998174642",
 *   email?: "EMANUEL@TISAUDE.COM",
 *   sexo?: "M"|"F"|null,
 *   ddd?: "81"|null
 * }
 * Obs: campos extras serão repassados ao upstream se fizer sentido.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const cpf = onlyDigits(body?.cpf || "");
    if (!cpf) {
      return NextResponse.json(
        { ok: false, error: "CPF é obrigatório" },
        { status: 400 }
      );
    }

    // 1) Cadastro/atualização no upstream (usa BEARER DA CLÍNICA)
    const cadastroUrl = `${BASE}/rest/paciente/adicionar`;
    const payloadCadastro: any = {
      senha_parceiro: getSenhaParceiro(),
      hash: getHash(),
      cpf,
      nome: body?.nome,
      nascimento: body?.nascimento, // opcional, se tiver
      ddd: body?.ddd ?? null,
      celular: onlyDigits(body?.celular || ""),
      email: body?.email,
      sexo: body?.sexo ?? null,
      // adicione aqui outros campos aceitos quando precisar
    };

    const cadastroRes = await fetch(cadastroUrl, {
      method: "POST",
      headers: authHeadersClinic(),
      cache: "no-store",
      body: JSON.stringify(payloadCadastro),
    });

    const cadastro = await cadastroRes.json().catch(() => ({}));

    if (!cadastroRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Falha no cadastro", upstream: { cadastro } },
        { status: cadastroRes.status }
      );
    }

    // 2) Login automático do paciente (gera access_token)
    const loginUrl = `${BASE}/rest/login?hash=${getHash()}`;
    const payloadLogin = {
      cpf,
      senha_parceiro: getSenhaParceiro(),
    };

    const loginRes = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payloadLogin),
    });

    const login = await loginRes.json().catch(() => ({}));

    if (!loginRes.ok || !login?.access_token) {
      return NextResponse.json(
        {
          ok: false,
          error: "Não foi possível autenticar o paciente após o cadastro.",
          upstream: { cadastro, login },
        },
        { status: 409 }
      );
    }

    // 3) Sucesso total
    return NextResponse.json({
      ok: true,
      data: {
        cadastro,
        login: {
          access_token: login.access_token,
          token_type: login.token_type,
          expires_in: login.expires_in,
          paciente: login.paciente,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "Erro ao cadastrar/login paciente",
      },
      { status: 500 }
    );
  }
}
