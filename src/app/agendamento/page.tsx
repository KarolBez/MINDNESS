'use client';
import { useState, useEffect } from 'react';
import './agendamento.css';
import { toast } from 'react-hot-toast';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function Agendamento() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState('');
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(false);

  const horariosDisponiveis = ['09:00', '10:30', '14:00', '16:00'];

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Você precisa estar logado para agendar.');
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Carregando autenticação...</p>;
  }

  const confirmarAgendamento = () => {
    toast.success('Agendamento confirmado com sucesso!');
  };

  const pagarComCartao = async () => {
    try {
      const res = await fetch('/api/checkout-session', { method: 'POST' });
      if (!res.ok) throw new Error('Erro ao criar sessão Stripe');

      const data = await res.json();
      const stripe = await stripePromise;

      await stripe?.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      toast.error('Erro ao redirecionar para o Stripe');
      console.error(error);
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

        {/* Profissional (somente se data for selecionada) */}
        {data && (
          <div className="profissional-container">
            <h2>Escolha sua profissional</h2>
            <div className="card-profissional">
              <img
                src="/avatar-psicologa.png"
                alt="Psicóloga"
                className="avatar"
              />
              <h3>Thays Fernandes</h3>
              <p>Psicóloga especializada em saúde emocional no ambiente corporativo. Atendimento humanizado e acolhedor.</p>
              <button
                className="botao-selecionar"
                onClick={() => setProfissionalSelecionado(true)}
              >
                Selecionar profissional
              </button>
            </div>
          </div>
        )}

        {/* Horários (somente se profissional foi selecionado) */}
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

        {/* Forma de pagamento */}
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

        {/* Pagamento com Pix */}
        {formaPagamento === 'PIX' && (
          <div className="qr-pix-container">
            <h4>Escaneie o QR Code para pagar R$ 65,00</h4>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126580014BR.GOV.BCB.PIX011300558899247262925020365.005802BR5922THAYS%20FERNANDES%20SERV6009FORTALEZA62070525"
              alt="Pix R$ 65,00 – THAYS FERNANDES SERV"
              className="qr-pix"
            />
            <p>Chave Pix: <strong>(88) 99247-2629</strong></p>
          </div>
        )}

        {/* Pagamento com Boleto */}
        {formaPagamento === 'Boleto' && (
          <p className="boleto-info">
            O boleto será gerado e enviado para o e-mail cadastrado.
          </p>
        )}

        {/* Pagamento com Cartão */}
        {formaPagamento === 'Cartão' && (
          <div className="cartao-info">
            <p>Você será redirecionado para o pagamento com cartão via TI Saúde.</p>
            <button className="confirmar" onClick={pagarComCartao}>
              Pagar com Cartão
            </button>
          </div>
        )}

        {/* Botão final */}
        {['PIX', 'Boleto'].includes(formaPagamento) && (
          <button className="confirmar" onClick={confirmarAgendamento}>
            Confirmar e Redirecionar
          </button>
        )}
      </div>
    </div>
  );
}
