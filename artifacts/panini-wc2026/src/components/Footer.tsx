import React from 'react';
import logo from '@assets/Panini-logo_1780421261996.webp';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-card border-t py-8 md:py-12">
      <div className="container mx-auto px-6 md:px-8 flex flex-col items-center gap-5 md:gap-7">
        <img src={logo} alt="Panini Logo" className="h-10 md:h-14 w-auto object-contain opacity-80" />
        <p className="text-center text-muted-foreground font-medium text-sm md:text-base max-w-md leading-relaxed">
          {t('general.brandTrust')}
        </p>
        <div className="text-xs md:text-sm text-muted-foreground text-center max-w-2xl leading-relaxed opacity-75">
          {t('general.legalNotice')}
        </div>
      </div>
    </footer>
  );
}
