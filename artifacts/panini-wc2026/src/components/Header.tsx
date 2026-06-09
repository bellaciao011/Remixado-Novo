import React from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import logo from '@assets/Panini-logo_1780421261996.webp';

export function Header() {
  const { t } = useTranslation();
  const { totalItems, setIsCartOpen } = useCart();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    queryClient.invalidateQueries();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <a href="/" onClick={handleHomeClick} className="flex items-center space-x-2 cursor-pointer">
            <img src={logo} alt="Panini Logo" className="header-logo" />
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="/" onClick={handleHomeClick} className="transition-colors hover:text-primary text-foreground/80 cursor-pointer">
              {t('nav.home')}
            </a>
            <Link href="/productos" className="transition-colors hover:text-primary text-foreground/80">
              {t('nav.catalog')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
            <span className="sr-only">{t('nav.cart')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
