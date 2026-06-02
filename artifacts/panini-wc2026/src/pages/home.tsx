import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useGetFeaturedProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import bannerImg from '@assets/banner-worldcup-de_1780421326604.webp';

export default function Home() {
  const { t } = useTranslation();
  const { data: featuredProducts, isLoading, isError } = useGetFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner — full width, no text overlay */}
      <section className="w-full">
        <img
          src={bannerImg}
          alt="FIFA World Cup 2026"
          className="w-full h-auto block"
          style={{ maxHeight: '500px', objectFit: 'cover', objectPosition: 'center' }}
        />
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-background">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2 md:mb-0">
              {t('labels.featured')}
            </h2>
            <Button variant="outline" asChild className="font-semibold border border-border hover:bg-muted text-sm h-9">
              <Link href="/produtos">
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
