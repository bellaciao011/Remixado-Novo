import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { Product } from '@workspace/api-client-react';
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
  const translation = product.translations[locale] || product.translations['pt-BR'];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const translationsMap: Record<string, { name: string }> = {};
    for (const [lang, tr] of Object.entries(product.translations)) {
      if (tr && typeof tr.name === 'string') {
        translationsMap[lang] = { name: tr.name };
      }
    }

    addItem({
      productId: product.id,
      priceId: product.priceId,
      quantity: 1,
      name: translation.name,
      translations: translationsMap,
      price: product.price / 100,
      originalPrice: product.originalPrice ? product.originalPrice / 100 : undefined,
      image: product.images[0] || '',
      currency: product.currency,
    });

    toast({
      title: t('cart.addedTitle'),
      description: `${translation.name} ${t('cart.addedDesc')}`,
    });
  };

  const price = product.price / 100;
  const originalPrice = product.originalPrice ? product.originalPrice / 100 : null;
  const discountPct = originalPrice && originalPrice > price
    ? Math.round((originalPrice - price) / originalPrice * 100)
    : null;

  const cur = product.currency.toUpperCase();
  const formatPrice = (val: number) =>
    new Intl.NumberFormat(
      cur === 'EUR' ? 'de-DE' : 'pt-BR',
      { style: 'currency', currency: cur }
    ).format(val);

  return (
    <Link href={`/produtos/${product.id}`}>
      <div className="panini-card group cursor-pointer flex flex-col h-full bg-white border border-[#e0e0e0] hover:border-[#999] transition-colors duration-200">
        {/* Image area */}
        <div className="relative bg-white p-4 flex items-center justify-center" style={{ minHeight: '220px' }}>
          {product.badge && (
            <span className="absolute top-2 left-2 z-10 bg-[#FFD600] text-black text-[11px] font-bold px-2 py-0.5 uppercase tracking-wide">
              {t(`labels.${product.badge}`)}
            </span>
          )}
          {discountPct && (
            <span className="absolute top-2 right-2 z-10 bg-[#e00] text-white text-[11px] font-bold px-2 py-0.5 uppercase tracking-wide">
              -{discountPct}%
            </span>
          )}
          <img
            src={product.images[0]}
            alt={translation.name}
            className="max-h-[200px] w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            width="200"
            height="200"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Info area */}
        <div className="flex flex-col flex-grow px-4 pt-3 pb-0">
          <h3 className="text-[14px] font-semibold text-[#1a1a1a] leading-snug mb-1 line-clamp-3">
            {translation.name}
          </h3>
          <p className="text-[12px] text-[#666] mb-2">{t('labels.collectables')}</p>
          <div className="mt-auto pb-3">
            {originalPrice && originalPrice > price && (
              <span className="block text-[12px] text-[#999] line-through mb-0.5">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-[16px] font-bold text-[#1a1a1a]">
              {formatPrice(price)}
            </span>
          </div>
        </div>

        {/* Yellow Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-bold uppercase tracking-wider transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#FFD600', color: '#1a1a1a' }}
        >
          <ShoppingCart className="h-4 w-4 flex-shrink-0" />
          {product.inStock ? t('buttons.addToCart') : t('labels.outOfStock')}
        </button>
      </div>
    </Link>
  );
}
