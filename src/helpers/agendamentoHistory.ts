// helpers/agendamentoHistory.ts
export function saveBookingToHistoryPerCPF(jsonResposta: any) {
  try {
    const paciente = JSON.parse(localStorage.getItem('TISAUDE_PACIENTE') || 'null');
    const cpfDigits: string = paciente?.cpf ? String(paciente.cpf).replace(/\D+/g, '') : '';
    if (!cpfDigits) return;

    const KEY = `TISAUDE_MEUS_AGENDAMENTOS_${cpfDigits}`;
    const hist = JSON.parse(localStorage.getItem(KEY) || '[]');

    // Formato compatível com a leitura na Agenda (usa .data.*)
    const item = {
      criadoEm: new Date().toISOString(),
      data: jsonResposta, // ← mantenha bruto, a Agenda procura .data.agendamento / .data.consulta
    };

    const novo = [item, ...hist].slice(0, 20);
    localStorage.setItem(KEY, JSON.stringify(novo));
    // opcional para debug:
    // console.log('HIST salvo em', KEY, novo);
  } catch (e) {
    // console.warn('Falha ao salvar histórico', e);
  }
}
