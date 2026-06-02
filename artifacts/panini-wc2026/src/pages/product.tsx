import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useGetProduct, getGetProductQueryKey } from '@workspace/api-client-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const { data: product, isLoading, isError } = useGetProduct(id || '', { 
    query: { 
      enabled: !!id,
      queryKey: getGetProductQueryKey(id || '')
    } 
  });

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 aspect-square bg-muted/20 rounded-2xl" />
          <div className="w-full md:w-1/2 space-y-6">
            <div className="h-10 bg-muted/20 rounded w-3/4" />
            <div className="h-6 bg-muted/20 rounded w-1/4" />
            <div className="h-32 bg-muted/20 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container px-4 py-24 text-center">
        <p className="text-destructive font-medium text-xl">{t('general.error')}</p>
      </div>
    );
  }

  const locale = i18n.language as keyof typeof product.translations;
  const translation = product.translations[locale] || product.translations['pt-BR'];
  
  const price = product.price / 100;
  const originalPrice = product.originalPrice ? product.originalPrice / 100 : null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      priceId: product.priceId,
      quantity,
      name: translation.name,
      price: price,
      image: product.images[0] || '',
    });

    toast({
      title: t('cart.addedTitle'),
      description: `${quantity}x ${translation.name} ${t('cart.addedDesc')}`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-square bg-white rounded-3xl border shadow-sm p-8 flex items-center justify-center relative overflow-hidden">
              {product.badge && (
                <div className="absolute top-6 left-6 z-10">
                  <Badge className="bg-secondary text-secondary-foreground font-black px-4 py-2 text-sm shadow-lg tracking-wider">
                    {product.badge}
                  </Badge>
                </div>
              )}
              <img 
                src={product.images[activeImage]} 
                alt={translation.name}
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "w-24 h-24 rounded-xl border-2 bg-white p-2 flex-shrink-0 transition-all",
                      activeImage === index ? "border-primary shadow-md" : "border-transparent hover:border-primary/30"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tight leading-tight mb-4">
                {translation.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col">
                  {originalPrice && originalPrice > price && (
                    <span className="text-lg text-muted-foreground line-through decoration-destructive">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
                    </span>
                  )}
                  <span className="text-4xl font-black text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                  </span>
                </div>
                
                {product.inStock ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto h-8 px-3">
                    {t('labels.inStock')}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="ml-auto h-8 px-3">
                    {t('labels.outOfStock')}
                  </Badge>
                )}
              </div>
              
              <div className="prose prose-blue max-w-none text-muted-foreground">
                <p className="whitespace-pre-line leading-relaxed text-lg">
                  {translation.description}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t space-y-8">
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl">
                <ShieldCheck className="text-primary h-8 w-8 flex-shrink-0" />
                <p className="text-sm font-medium">{t('labels.originalProduct')} - {t('product.trustBadge')}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between border-2 border-input rounded-lg px-2 h-14 bg-background w-full sm:w-40">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.inStock || quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  className="h-14 flex-1 text-lg font-bold shadow-xl hover:scale-[1.02] transition-transform"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  {t('buttons.addToCart')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
