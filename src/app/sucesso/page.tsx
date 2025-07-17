'use client';
import Link from 'next/link';

export default function SucessoPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8f8f6] text-center px-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Agendamento Confirmado!</h1>
        <p className="text-gray-700 mb-6">
          Sua sessão foi agendada com sucesso.<br />
          Entraremos em contato por WhatsApp para confirmar os detalhes.
        </p>

        <Link href="/" className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition">
          Voltar para Página Inicial
        </Link>
      </div>
    </div>
  );
}
