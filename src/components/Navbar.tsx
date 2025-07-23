'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './navbar.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="nav-link">Página Inicial</Link>
      <Link href="/sobre" className="nav-link">Sobre</Link>
      <Link href="/#servicos">Serviços</Link>
      <Link href="/blog" className="nav-link">Nosso Blog</Link>
      <Link href="/login" className="nav-link login-link">Login</Link>
    </nav>
  );
}
