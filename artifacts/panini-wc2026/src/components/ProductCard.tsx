import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { Product } from '@workspace/api-client-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const { toast } = useToast();

  const locale = i18n.language as keyof Product['translations'];
  // Fallback to pt-BR if locale not found
  const translation = product.translations[locale] || product.translations['pt-BR'];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      priceId: product.priceId,
      quantity: 1,
      name: translation.name,
      price: product.price / 100, // assuming Stripe price in cents
      image: product.images[0] || '',
    });

    toast({
      title: t('cart.addedTitle'),
      description: `${translation.name} ${t('cart.addedDesc')}`,
    });
  };

  const price = product.price / 100;
  const originalPrice = product.originalPrice ? product.originalPrice / 100 : null;

  return (
    <Link href={`/produtos/${product.id}`}>
      <Card className="h-full overflow-hidden hover-elevate transition-all duration-300 group cursor-pointer border-transparent hover:border-primary/20 bg-card flex flex-col relative">
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-secondary text-secondary-foreground font-bold px-3 py-1 text-xs shadow-md">
              {product.badge}
            </Badge>
          </div>
        )}
        
        <div className="aspect-square w-full overflow-hidden bg-muted/30 p-6 flex items-center justify-center">
          <img 
            src={product.images[0]} 
            alt={translation.name} 
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 drop-shadow-lg"
          />
        </div>
        
        <CardContent className="p-5 flex-grow flex flex-col">
          <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {translation.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
            {translation.shortDescription}
          </p>
        </CardContent>
        
        <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through decoration-destructive">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(originalPrice)}
              </span>
            )}
            <span className="font-black text-xl text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
            </span>
          </div>
          
          <Button 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-md hover:scale-105 transition-transform" 
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">{t('buttons.addToCart')}</span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
