'use client';
import { useState, useEffect } from 'react';
import './agendamento.css';
import { toast } from 'react-hot-toast';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { useRouter } from 'next/navigation';

const TISAUDE_CHECKOUT_URL = process.env.NEXT_PUBLIC_TISAUDE_URL || 'https://app.tisaude.com/'; 

export default function Agendamento() {
  const router = useRouter();

  const [data, setData] = useState('');
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(false);

  const horariosDisponiveis = ['09:00', '10:30', '14:00', '16:00'];

  useEffect(() => {}, []);

  async function salvarAgendamento() {
    const res = await fetch('/api/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente: 'paciente-demo',           
        horario: horaSelecionada,
        servico: 'Sessão Mindness',
        formaPagamento,
      }),
    });
    const resp = await res.json();
    if (!res.ok || resp?.ok === false) throw new Error(resp?.message || 'Erro ao agendar');
    return resp;
  }

  const confirmarAgendamento = async () => {
    try {
      await salvarAgendamento();
      toast.success('Agendamento confirmado!');
      router.push('/');
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao salvar agendamento');
    }
  };

  const pagarComCartaoTISaude = async () => {
    try {
      await salvarAgendamento();
      window.location.href = TISAUDE_CHECKOUT_URL;
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao salvar agendamento');
    }
  };

  return (
    <div className="agendamento-container">
      <div className="agendamento-box">
        <VoltarHomeButton />
        <h1>Agendar Sessão</h1>

        <label htmlFor="data">Selecione a data:</label>
        <input
          type="date"
          id="data"
          value={data}
          onChange={(e) => {
            setData(e.target.value);
            setHoraSelecionada('');
            setFormaPagamento('');
            setProfissionalSelecionado(false);
          }}
        />

        {data && (
          <div className="profissional-container">
            <h2>Escolha sua profissional</h2>
            <div className="card-profissional novo">
              <img
                src="/avatar_thays.png"
                alt="Psicóloga Thays Fernandes"
                className="avatar pequeno"
                width={64}
                height={64}
              />
              <div className="prof-info">
                <h3>Thays Fernandes</h3>
                <p>
                  Psicóloga especializada em saúde emocional no ambiente corporativo.
                  Atendimento humanizado e acolhedor.
                </p>
              </div>
              <button
                className="botao-selecionar primario"
                onClick={() => setProfissionalSelecionado(true)}
              >
                Selecionar
              </button>
            </div>
          </div>
        )}

        {data && profissionalSelecionado && (
          <div className="horarios-section">
            <h3>Horários disponíveis</h3>
            <div className="horarios">
              {horariosDisponiveis.map((hora) => (
                <button
                  key={hora}
                  className={horaSelecionada === hora ? 'ativo' : ''}
                  onClick={() => {
                    setHoraSelecionada(hora);
                    setFormaPagamento('');
                  }}
                >
                  {hora}
                </button>
              ))}
            </div>
          </div>
        )}

        {horaSelecionada && (
          <div className="pagamento-section">
            <h3>Forma de pagamento</h3>
            <div className="pagamentos">
              {['PIX', 'Boleto', 'Cartão'].map((forma) => (
                <button
                  key={forma}
                  className={formaPagamento === forma ? 'ativo' : ''}
                  onClick={() => setFormaPagamento(forma)}
                >
                  {forma}
                </button>
              ))}
            </div>
          </div>
        )}

        {formaPagamento === 'PIX' && (
          <div className="qr-pix-container">
            <h4>Escaneie o QR Code para pagar R$ 65,00</h4>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126580014BR.GOV.BCB.PIX011300558899247262925020365.005802BR5922THAYS%20FERNANDES%20SERV6009FORTALEZA62070525"
              alt="Pix R$ 65,00 – THAYS FERNANDES SERV"
              className="qr-pix"
            />
            <p>Chave Pix: <strong>(88) 99247-2629</strong></p>
            <p>Banco: <strong>Inter</strong></p>
          </div>
        )}

        {formaPagamento === 'Boleto' && (
          <p className="boleto-info">O boleto será gerado e enviado para o e-mail cadastrado.</p>
        )}

        {formaPagamento === 'Cartão' && (
          <div className="cartao-info">
            <p>Você será redirecionado para a plataforma TI Saúde.</p>
            <button className="confirmar" onClick={pagarComCartaoTISaude}>
              Confirmar e Redirecionar
            </button>
          </div>
        )}

        {['PIX', 'Boleto'].includes(formaPagamento) && (
          <button className="confirmar" onClick={confirmarAgendamento}>
            Confirmar e Redirecionar
          </button>
        )}
      </div>
    </div>
  );
}
