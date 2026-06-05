import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useCart, CartItem } from '../contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, X } from 'lucide-react';

const formatPrice = (price: number, currency = 'eur') => {
  const cur = currency.toUpperCase();
  const locale = cur === 'EUR' ? 'de-DE' : 'pt-BR';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: cur }).format(price);
};

const getItemName = (item: CartItem, lang: string): string => {
  if (item.translations) {
    return item.translations[lang]?.name
      || item.translations['en']?.name
      || item.translations['pt-BR']?.name
      || item.name;
  }
  return item.name;
};

export function CartDrawer() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, totalPrice } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const totalCurrency = items.length > 0 ? (items[0].currency || 'eur') : 'eur';

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 h-[100dvh] [&>button:first-child]:hidden">
        <SheetHeader className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">{t('cart.title')}</SheetTitle>
            <button
              onClick={() => setIsCartOpen(false)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SheetDescription className="sr-only">{t('cart.title')}</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">{t('cart.empty')}</p>
            <Button onClick={() => setIsCartOpen(false)}>{t('buttons.continueShopping')}</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={getItemName(item, i18n.language)} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold line-clamp-2">{getItemName(item, i18n.language)}</h4>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-[12px] text-[#999] line-through leading-none">
                            {formatPrice(item.originalPrice, item.currency)}
                          </p>
                        )}
                        <p className="text-primary font-bold mt-0.5">{formatPrice(item.price, item.currency)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 border-t bg-muted/30">
              {(() => {
                const totalOriginal = items.reduce((sum, item) =>
                  sum + ((item.originalPrice ?? item.price) * item.quantity), 0);
                const savings = totalOriginal - totalPrice;
                const hasDiscount = savings > 0.001;
                return (
                  <div className="space-y-1 mb-4">
                    {hasDiscount && (
                      <div className="flex justify-between items-center text-[#999] text-sm">
                        <span>{t('checkout.originalTotal')}</span>
                        <span className="line-through">{formatPrice(totalOriginal, totalCurrency)}</span>
                      </div>
                    )}
                    {hasDiscount && (
                      <div className="flex justify-between items-center text-[#e00] text-sm font-semibold">
                        <span>{t('checkout.youSave')}</span>
                        <span>- {formatPrice(savings, totalCurrency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t text-lg font-bold">
                      <span>{t('labels.total')}</span>
                      <div className="text-right">
                        <span className="text-primary">{formatPrice(totalPrice, totalCurrency)}</span>
                        {hasDiscount && (
                          <span className="block text-[11px] font-bold text-[#e00] uppercase tracking-wide">
                            {Math.round(savings / totalOriginal * 100)}% {t('checkout.offLabel')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
              <Button
                className="w-full h-14 text-lg font-bold shadow-lg"
                onClick={handleCheckout}
              >
                {t('buttons.checkout')}
              </Button>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 mt-3 py-2 text-[13px] font-semibold text-[#555] hover:text-[#1a1a1a] transition-colors underline underline-offset-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('buttons.continueShopping')}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
