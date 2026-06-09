import React from 'react';
import { useTranslation } from 'react-i18next';
import { useListProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';

export default function Catalog() {
  const { t } = useTranslation();
  const { data: products, isLoading, isError } = useListProducts();

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight mb-4">
            {t('nav.catalog')}
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl">
            {t('catalog.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[420px] bg-muted/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-muted/10 rounded-2xl">
            <p className="text-destructive font-medium text-lg">{t('general.error')}</p>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/10 rounded-2xl">
            <p className="text-muted-foreground font-medium text-lg">{t('catalog.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
