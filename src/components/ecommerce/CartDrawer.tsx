import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';
import { useCitrinoStore } from '../../services/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCheckout: () => void;
  onNavigateCatalog: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onGoToCheckout,
  onNavigateCatalog,
}) => {
  const {
    cart,
    cartSubtotal,
    cartTotal,
    discountAmount,
    appliedCoupon,
    updateCartQuantity,
    updateCartWarranty,
    removeFromCart,
    applyCouponCode,
    companySettings,
  } = useCitrinoStore();

  const [couponInput, setCouponInput] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const freeShippingNeeded = Math.max(0, companySettings.freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / companySettings.freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const res = applyCouponCode(couponInput);
      setCouponFeedback(res);
      if (res.success) setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center justify-between bg-[#FAF8F4]">
            <div className="flex items-center gap-3">
              <img
                src="/citrino-icon.jpg"
                alt="Citrino"
                className="w-8 h-8 rounded-full object-cover border border-[#C9A84C]/50 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="font-serif-luxury text-lg font-medium text-[#1C1C1C] leading-tight">
                  Sua Sacola
                </h2>
                <span className="text-[9px] tracking-widest text-[#C9A84C] uppercase font-semibold block">
                  Citrino Semijoias
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-[#1C1C1C] hover:bg-black/5 transition"
              aria-label="Fechar Sacola"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#FAF4EB] border-b border-[#EADFCB] px-6 py-3">
            <div className="flex items-center justify-between text-xs text-[#555] mb-1.5">
              <span className="flex items-center gap-1 font-medium">
                <Truck className="w-3.5 h-3.5 text-[#C9A84C]" />
                {freeShippingNeeded <= 0 ? (
                  <strong className="text-emerald-700">Parabéns! Você ganhou Frete Grátis!</strong>
                ) : (
                  <>Faltam <strong>R$ {freeShippingNeeded.toFixed(2)}</strong> para Frete Grátis</>
                )}
              </span>
              <span className="text-[10px] font-bold text-[#C9A84C]">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9A84C] transition-all duration-300 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F4] flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-8 h-8 text-[#C9A84C]" />
                </div>
                <h3 className="font-serif-luxury text-lg text-[#1C1C1C]">
                  Sua sacola ainda está vazia
                </h3>
                <p className="text-xs text-[#777] max-w-xs">
                  Descubra nossas coleções exclusivas banhadas em ouro 18k e escolha suas semijoias favoritas.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateCatalog();
                  }}
                  className="bg-[#1C1C1C] hover:bg-[#C9A84C] text-white text-xs font-semibold px-6 py-2.5 rounded uppercase tracking-wider transition"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const itemPrice = item.product.promoPrice || item.product.price;
                return (
                  <div key={`${item.product.id}-${item.selectedVariation || idx}`} className="py-4 flex gap-4">
                    {/* Item Photo */}
                    <div className="w-18 h-18 rounded-lg overflow-hidden bg-[#FAF8F4] border border-[#E8E4DC] shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-serif-luxury text-sm font-medium text-[#1C1C1C] line-clamp-1">
                            {item.product.name}
                          </h4>
                          {item.selectedVariation && (
                            <span className="text-[11px] text-[#777] block">
                              Variação: {item.selectedVariation}
                            </span>
                          )}
                          {/* Opção de Garantia selecionada */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded font-medium">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Garantia: {item.selectedWarranty || '6 meses'}
                            </span>
                            <button
                              onClick={() =>
                                updateCartWarranty(
                                  item.product.id,
                                  item.selectedVariation,
                                  item.selectedWarranty || '6 meses',
                                  (item.selectedWarranty || '6 meses') === '6 meses' ? '1 ano' : '6 meses'
                                )
                              }
                              className="text-[10px] text-[#C9A84C] hover:underline cursor-pointer ml-1"
                              title="Alterar garantia"
                            >
                              {(item.selectedWarranty || '6 meses') === '6 meses' ? 'Mudar p/ 1 ano' : 'Mudar p/ 6 meses'}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedVariation, item.selectedWarranty)}
                          className="text-gray-400 hover:text-[#E8705A] transition"
                          title="Remover produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-[#D5CFBF] rounded bg-white">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedVariation,
                                item.selectedWarranty
                              )
                            }
                            className="px-2 py-0.5 text-xs font-bold text-gray-500 hover:text-black"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-bold min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedVariation,
                                item.selectedWarranty
                              )
                            }
                            className="px-2 py-0.5 text-xs font-bold text-gray-500 hover:text-black"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="text-xs font-bold text-[#1C1C1C]">
                          R$ {(itemPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer: Coupon & Summary */}
          {cart.length > 0 && (
            <div className="border-t border-[#E8E4DC] p-6 space-y-4 bg-[#FAF8F4]">
              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cupom (ex: BEMVINDA10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-white border border-[#D5CFBF] text-xs uppercase rounded-lg py-2 pl-8 pr-3 focus:outline-none focus:border-[#C9A84C]"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="bg-[#1C1C1C] hover:bg-[#333] text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  Aplicar
                </button>
              </form>

              {couponFeedback && (
                <p className={`text-[11px] font-medium ${couponFeedback.success ? 'text-emerald-700' : 'text-[#E8705A]'}`}>
                  {couponFeedback.message}
                </p>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded border border-emerald-200">
                  <span className="font-semibold">Cupom ativo: {appliedCoupon.code}</span>
                  <span>- R$ {discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-[#555] pt-2 border-t border-[#E8E4DC]">
                <div className="flex justify-between">
                  <span>Subtotal dos produtos:</span>
                  <span className="font-semibold text-[#1C1C1C]">R$ {cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#E8705A]">
                    <span>Desconto especial:</span>
                    <span className="font-semibold">- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#1C1C1C] pt-2 border-t border-[#E8E4DC]">
                  <span>Total estimado:</span>
                  <span className="text-base text-[#1C1C1C]">
                    R$ {(cartSubtotal - discountAmount).toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-[#777] text-right">
                  Frete calculado no próximo passo (Checkout)
                </p>
              </div>

              {/* CTA Checkout */}
              <button
                onClick={() => {
                  onClose();
                  onGoToCheckout();
                }}
                className="w-full bg-[#C9A84C] hover:bg-[#B5943B] text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Finalizar Pedido com Segurança</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-[#777] pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" /> Checkout Criptografado
                </span>
                <span>•</span>
                <span>PIX ou Cartão até 10x</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
