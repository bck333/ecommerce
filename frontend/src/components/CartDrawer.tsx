import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isCartOpen, closeCart, updateItemQuantity, removeItem } = useCart();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { deliveryTime, city } = useLocation();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 199;
  const differenceForFree = Math.max(0, freeDeliveryThreshold - cart.subtotal);
  const freeProgress = Math.min(100, (cart.subtotal / freeDeliveryThreshold) * 100);

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 leading-tight">My Cart</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} · Delivering in {deliveryTime}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  Fill your cart with fresh milk, vegetables, snacks, and daily essentials.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Banner */}
                <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      {differenceForFree === 0
                        ? '🎉 You unlocked FREE Delivery!'
                        : `Add ₹${differenceForFree.toFixed(0)} more for FREE Delivery`}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">₹{freeDeliveryThreshold} threshold</span>
                  </div>
                  <div className="w-full bg-emerald-200/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${freeProgress}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/70 bg-white hover:border-slate-300 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{item.productName}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">{item.quantityDescription}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-extrabold text-xs text-slate-900">₹{item.unitPrice.toFixed(0)}</span>
                          {item.mrp > item.unitPrice && (
                            <span className="text-[10px] text-slate-400 line-through">₹{item.mrp.toFixed(0)}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-emerald-50 border border-emerald-500/30 rounded-xl overflow-hidden shadow-xs">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) {
                              removeItem(item.id, item.productId);
                            } else {
                              updateItemQuantity(item.id, item.productId, item.quantity - 1);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <span className="w-6 text-center font-extrabold text-xs text-emerald-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxAvailableStock}
                          className="w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Bill Summary</h4>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Item Total</span>
                    <span className="font-semibold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Delivery Fee</span>
                      {cart.deliveryFee === 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-100/80 px-1.5 py-0.2 rounded-md">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                    <span>Grand Total</span>
                    <span className="text-emerald-700">₹{cart.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cancellation & Trust Info */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine Products · Hygienic Sealed Packing</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-white space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99]"
              >
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs opacity-90">Total to Pay</span>
                  <span className="text-base font-black">₹{cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider">
                  <span>Proceed to Pay</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
