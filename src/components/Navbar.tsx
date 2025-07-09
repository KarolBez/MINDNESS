'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './navbar.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className={pathname === '/' ? 'nav-link active' : 'nav-link'}>Página 1</Link>
      <Link href="/sobre" className={pathname === '/sobre' ? 'nav-link active' : 'nav-link'}>Sobre</Link>
      <Link href="/services" className={pathname === '/services' ? 'nav-link active' : 'nav-link'}>Serviços</Link>
      <Link href="/blog" className={pathname === '/blog' ? 'nav-link active' : 'nav-link'}>Nosso Blog</Link>
      <Link href="/login" className={pathname === '/login' ? 'nav-link active login-link' : 'nav-link login-link'}>Login</Link>
    </nav>
  );
}
