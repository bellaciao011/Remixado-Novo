import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useGetFeaturedProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trophy, ShieldCheck, Star } from 'lucide-react';
import bannerImg from '@assets/banner-worldcup-de_1780421326604.webp';

export default function Home() {
  const { t } = useTranslation();
  const { data: featuredProducts, isLoading, isError } = useGetFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={bannerImg} 
            alt="FIFA World Cup 2026 Banner" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        </div>
        
        <div className="container relative z-10 px-4 md:px-8">
          <div className="max-w-2xl text-left">
            <Badge className="mb-4 bg-primary text-primary-foreground border-none font-bold tracking-wider px-3 py-1 shadow-lg">
              {t('labels.originalProduct')}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 uppercase tracking-tight leading-[1.1] drop-shadow-sm">
              <span className="block text-primary">{t('home.heroLine1')}</span>
              <span className="block">{t('home.heroLine2')}</span>
              <span className="block text-secondary">{t('home.heroLine3')}</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-lg font-medium">
              {t('home.heroSubtitle')}
            </p>
            <Button size="lg" asChild className="h-14 px-8 text-lg font-bold shadow-xl hover:scale-105 transition-transform bg-primary text-primary-foreground">
              <Link href="/produtos">
                {t('buttons.buyNow')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features/Trust Section */}
      <section className="py-12 bg-card border-y">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex flex-col items-center p-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('home.feature1Title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.feature1Desc')}</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('home.feature2Title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.feature2Desc')}</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('home.feature3Title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tight mb-2">
                {t('labels.featured')}
              </h2>
              <p className="text-muted-foreground font-medium">{t('home.featuredSubtitle')}</p>
            </div>
            <Button variant="outline" asChild className="mt-4 md:mt-0 font-bold border-2 hover:bg-primary/5">
              <Link href="/produtos">
                {t('buttons.viewMore')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[400px] bg-muted/20 animate-pulse rounded-xl" />
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
