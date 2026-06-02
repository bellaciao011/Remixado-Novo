import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCreateCheckoutSession } from '@workspace/api-client-react';

export function CartDrawer() {
  const { t, i18n } = useTranslation();
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, totalPrice } = useCart();
  const createCheckout = useCreateCheckoutSession();

  const handleCheckout = () => {
    createCheckout.mutate(
      {
        data: {
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
          })),
          successUrl: `${window.location.origin}/pedido/confirmado?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/produtos`,
          locale: i18n.language,
        }
      },
      {
        onSuccess: (data) => {
          window.location.href = data.url;
        }
      }
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold">{t('cart.title')}</SheetTitle>
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
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold line-clamp-2">{item.name}</h4>
                        <p className="text-primary font-bold mt-1">{formatPrice(item.price)}</p>
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
              <div className="flex justify-between items-center mb-6 text-lg font-bold">
                <span>{t('labels.total')}</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <Button 
                className="w-full h-14 text-lg font-bold shadow-lg" 
                onClick={handleCheckout}
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? t('general.loading') : t('buttons.checkout')}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
