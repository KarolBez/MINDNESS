'use client';
import { useState } from 'react';
import './agendamento.css';
import { toast } from 'react-hot-toast';
import VoltarHomeButton from '@/components/VoltaHomeButton';

export default function Agendamento() {
  const [data, setData] = useState('');
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');

  const horariosDisponiveis = ['09:00', '10:30', '14:00', '16:00'];

  const confirmarAgendamento = () => {
    toast.success('Agendamento confirmado com sucesso!');

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

        {formaPagamento && (
          <button className="confirmar" onClick={confirmarAgendamento}>
            Confirmar e Redirecionar
          </button>
        )}
      </div>
    </div>
  );
}
