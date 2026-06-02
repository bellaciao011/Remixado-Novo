import React from 'react';
import logo from '@assets/Panini-logo_1780421261996.webp';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-card border-t py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 flex flex-col items-center gap-8">
        <img src={logo} alt="Panini Logo" className="h-16 w-auto object-contain opacity-80" />
        <p className="text-center text-muted-foreground font-medium max-w-lg">
          {t('general.brandTrust')}
        </p>
        <div className="text-sm text-muted-foreground mt-8">
          © 2026 Panini S.p.A. FIFA, FIFA's Official Licensed Product Logos, and the Emblems, Mascots, Posters and Trophies of the FIFA World Cup™ tournaments are copyrights and/or trademarks of FIFA.
        </div>
      </div>
    </footer>
  );
}
