'use client';
import { useState, useEffect } from 'react';
import './agendamento.css';
import { toast } from 'react-hot-toast';
import VoltarHomeButton from '@/components/VoltaHomeButton';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function Agendamento() {
  const [data, setData] = useState('');
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');

  const horariosDisponiveis = ['09:00', '10:30', '14:00', '16:00'];

  useEffect(() => {
    console.log('Chave pública Stripe:', process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
  }, []);

  const confirmarAgendamento = () => {
    toast.success('Agendamento confirmado com sucesso!');
    // window.location.href = '/sucesso';
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
          }}
        />

        {data && (
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
              alt="Pix R$ 65,00 – THAYS FERNANDES SERV"
              className="qr-pix"
            />
            <p>Chave Pix: <strong>(88) 99247-2629</strong></p>
          </div>
        )}

        {formaPagamento === 'Boleto' && (
          <p className="boleto-info">
            O boleto será gerado e enviado para o e-mail cadastrado.
          </p>
        )}

        {formaPagamento === 'Cartão' && (
          <div className="cartao-info">
            <p>Você será redirecionado para o pagamento com cartão via TI Saúder.</p>
            <button className="confirmar" onClick={pagarComCartao}>
              Pagar com Cartão
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
