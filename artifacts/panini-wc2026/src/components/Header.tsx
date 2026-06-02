import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Menu, Globe } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import logo from '@assets/Panini-logo_1780421261996.webp';

const languages = [
  { code: 'pt-BR', label: 'Português', flag: 'PT' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const { totalItems, setIsCartOpen } = useCart();

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <img src={logo} alt="Panini Logo" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary text-foreground/80">
              {t('nav.home')}
            </Link>
            <Link href="/produtos" className="transition-colors hover:text-primary text-foreground/80">
              {t('nav.catalog')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-16 px-2 text-sm font-bold flex gap-2">
                <Globe className="h-4 w-4" />
                {currentLang.flag}
                <span className="sr-only">Toggle language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className="cursor-pointer flex items-center gap-2 font-medium"
                >
                  <span className="text-muted-foreground w-6">{lang.flag}</span>
                  <span>{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
            <span className="sr-only">Cart</span>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
