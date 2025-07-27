'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import './navbar.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo-link">
          <Image src="/logo1.png" alt="Mindness Logo" width={160} height={60} priority />
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">Página Inicial</Link>
          <Link href="/#sobre" className="nav-link">Sobre</Link>
          <Link href="/#servicos" className="nav-link">Serviços</Link>
          <Link href="/blog" className={`nav-link ${pathname === '/blog' ? 'active' : ''}`}>Nosso Blog</Link>
          <Link href="/login" className="nav-link login-link">Login</Link>
        </div>
      </div>
    </nav>
  );
}
