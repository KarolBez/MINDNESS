export default function AgendaComprovante({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="rounded border p-4 bg-white">
      <h3 className="font-semibold mb-2">Agendamento confirmado</h3>
      <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
