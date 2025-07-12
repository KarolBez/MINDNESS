'use client'
import Link from 'next/link';

export default function VoltarHomeButton() {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <Link href="/">
        <button style={{
          backgroundColor: '#90c8f0',
          color: 'white',
          padding: '10px 16px',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}>
          ← Página Inicial
        </button>
      </Link>
    </div>
  );
}
