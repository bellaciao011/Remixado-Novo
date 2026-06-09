import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useGetFeaturedProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
const HERO_URL = '/assets/PAN-INT-WC-STK-BANNER-1920X500-INT_EN_(1)_1780517958151.webp';

export default function Home() {
  const { t } = useTranslation();
  const { data: featuredProducts, isLoading, isError } = useGetFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner — full width, fully visible */}
      <section className="w-full bg-black">
        <img
          src={HERO_URL}
          alt="FIFA World Cup 2026"
          className="w-full h-auto block mx-auto"
          width="1920"
          height="500"
          fetchPriority="high"
          decoding="sync"
        />
      </section>

      {/* Featured Products */}
      <section className="py-6 md:py-10 bg-background">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="flex flex-row justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-foreground">
              {t('labels.featured')}
            </h2>
            <Button variant="outline" asChild className="font-semibold border border-border hover:bg-muted text-sm h-9 flex-shrink-0">
              <Link href="/productos">
                {t('buttons.viewMore')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[400px] bg-muted/20 animate-pulse rounded" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive font-medium">{t('general.error')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
