'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import './navbar.css';

export default function Navbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0.1,
    });

    const sections = ['sobre', 'servicos'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo-link">
          <img src="/logo1.png" alt="Mindness Logo" className="logo-img" />
        </Link>

        <div className="nav-links">
          <div className="nav-item-button">
            <Link href="/" className="nav-link">Página Inicial</Link>
          </div>
          <div className="nav-item-button">
            <Link href="/#sobre" className="nav-link">Sobre</Link>
          </div>
          <div className="nav-item-button">
            <Link href="/#servicos" className="nav-link">Serviços</Link>
          </div>
          <div className="nav-item-button">
            <Link href="/blog" className="nav-link">Nosso Blog</Link>
          </div>
          <div className="nav-item-button">
            <Link href="/login" className="nav-link">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
