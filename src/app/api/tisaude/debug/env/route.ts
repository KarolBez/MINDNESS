export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  const pub = (process.env.NEXT_PUBLIC_TISAUDE_SENHA_PARCEIRO || "").trim();
  const priv = (process.env.TISAUDE_SENHA_PARCEIRO || "").trim();
  return Response.json({
    hasPublic: !!pub,  publicLen: pub.length,
    hasPrivate: !!priv, privateLen: priv.length,
  });
}
