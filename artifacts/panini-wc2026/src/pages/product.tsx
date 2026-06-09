import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useGetProduct, getGetProductQueryKey, useListProducts } from '@workspace/api-client-react';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { fbq, sendCapiEvent } from '@/lib/tracking';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, isError } = useGetProduct(id || '', {
    query: {
      enabled: !!id,
      queryKey: getGetProductQueryKey(id || ''),
    },
  });

  const { data: allProducts } = useListProducts();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!product) return;
    const locale = i18n.language as keyof typeof product.translations;
    const tr = product.translations[locale] || product.translations['en'] || product.translations['pt-BR'];
    const price = product.price / 100;
    fbq('ViewContent', {
      content_ids: [product.id],
      content_name: tr.name,
      value: price,
      currency: 'EUR',
    });
    sendCapiEvent('ViewContent', {
      contentIds: [product.id],
      value: price,
      currency: 'EUR',
      eventSourceUrl: window.location.href,
    });
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="container px-4 md:px-8 py-12 max-w-screen-xl mx-auto animate-pulse">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/2 aspect-square bg-muted/20 rounded" />
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-muted/20 rounded w-3/4" />
            <div className="h-5 bg-muted/20 rounded w-1/4" />
            <div className="h-24 bg-muted/20 rounded w-full" />
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

  const relatedProducts = allProducts
    ? allProducts.filter(p => p.id !== product?.id).slice(0, 4)
    : [];

  const locale = i18n.language as keyof typeof product.translations;
  const translation = product.translations[locale] || product.translations['en'] || product.translations['pt-BR'];

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

  const handleAddToCart = () => {
    const translationsMap: Record<string, { name: string }> = {};
    for (const [lang, tr] of Object.entries(product.translations)) {
      if (tr && typeof tr.name === 'string') {
        translationsMap[lang] = { name: tr.name };
      }
    }
    addItem({
      productId: product.id,
      priceId: product.priceId,
      quantity,
      name: translation.name,
      translations: translationsMap,
      price,
      originalPrice: originalPrice ?? undefined,
      image: product.images[0] || '',
      currency: product.currency,
    });
    toast({
      title: t('cart.addedTitle'),
      description: `${quantity}x ${translation.name} ${t('cart.addedDesc')}`,
    });
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-[#666] mb-6">
          <Link href="/" className="hover:underline">{t('nav.home')}</Link>
          <span className="mx-2">›</span>
          <Link href="/productos" className="hover:underline">{t('nav.catalog')}</Link>
          <span className="mx-2">›</span>
          <span className="text-[#1a1a1a]">{translation.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left — Image gallery */}
          <div className="w-full lg:w-[52%] flex flex-col gap-3">
            {/* Main image */}
            <div className="bg-white border border-[#e0e0e0] flex items-center justify-center p-6" style={{ minHeight: '420px' }}>
              <img
                src={product.images[activeImage]}
                alt={translation.name}
                className="max-h-[420px] w-auto object-contain"
              />
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      'w-[80px] h-[80px] border-2 flex-shrink-0 bg-white flex items-center justify-center p-1 transition-colors',
                      activeImage === index ? 'border-[#1a1a1a]' : 'border-[#e0e0e0] hover:border-[#999]'
                    )}
                  >
                    <img src={img} alt="" className="max-h-full w-auto object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product info */}
          <div className="w-full lg:w-[48%]">
            {/* Title */}
            <h1 className="text-[26px] md:text-[30px] font-bold text-[#1a1a1a] leading-tight mb-5">
              {translation.name}
            </h1>

            <hr className="border-[#e0e0e0] mb-5" />

            {/* Qty + Price */}
            <div className="flex items-center gap-5 mb-3">
              {/* Quantity stepper */}
              <div className="flex items-center border border-[#ccc]">
                <button
                  className="w-9 h-9 flex items-center justify-center text-[#1a1a1a] hover:bg-[#f5f5f5] disabled:opacity-40 text-lg font-bold"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.inStock || quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-[15px] font-semibold text-[#1a1a1a]">{quantity}</span>
                <button
                  className="w-9 h-9 flex items-center justify-center text-[#1a1a1a] hover:bg-[#f5f5f5] disabled:opacity-40 text-lg font-bold"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.inStock}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Price */}
              <div>
                {originalPrice && originalPrice > price && (
                  <span className="block text-[13px] text-[#999] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[22px] font-bold text-[#1a1a1a]">{formatPrice(price)}</span>
                  {discountPct && (
                    <span className="bg-[#e00] text-white text-[12px] font-bold px-2 py-0.5 uppercase">
                      -{discountPct}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stock status */}
            {!product.inStock && (
              <p className="text-[13px] font-semibold text-[#c00] mb-4 uppercase tracking-wide">
                {t('labels.outOfStock')}
              </p>
            )}

            {/* Add to cart button */}
            <button
              className="w-full flex items-center justify-center gap-3 py-4 text-[14px] font-bold uppercase tracking-widest mt-4 mb-6 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FFD600', color: '#1a1a1a' }}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-5 w-5 flex-shrink-0" />
              {t('buttons.addToCart')}
            </button>

            <hr className="border-[#e0e0e0] mb-6" />

            {/* Description */}
            <div>
              <h2 className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-3">
                {t('product.descriptionLabel')}
              </h2>
              <div className="text-[14px] text-[#444] leading-relaxed whitespace-pre-line">
                {translation.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-[#e0e0e0] mt-12 pt-10 pb-16">
          <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
            <h2 className="text-[16px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-6">
              {t('product.relatedProducts')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
