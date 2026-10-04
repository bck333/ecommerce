import React from 'react';
import { X, Plus, Minus, Clock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { getProductQuantity, addItem, updateItemQuantity, removeItem, cart } = useCart();

  if (!product) return null;

  const quantity = getProductQuantity(product.id);
  const cartItem = cart.items.find((i) => i.productId === product.id);

  const handleAdd = () => addItem(product, 1);
  const handleIncrement = () => {
    if (cartItem) {
      updateItemQuantity(cartItem.id, product.id, quantity + 1);
    } else {
      addItem(product, 1);
    }
  };
  const handleDecrement = () => {
    if (cartItem) {
      if (quantity === 1) {
        removeItem(cartItem.id, product.id);
      } else {
        updateItemQuantity(cartItem.id, product.id, quantity - 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 bg-blue-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-emerald-50 text-emerald-800 w-fit px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>10 MINS DELIVERY</span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.brand}</p>
              <h2 className="text-xl font-black text-slate-900 leading-snug mt-0.5">{product.name}</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">{product.quantity}</p>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-black text-slate-900">₹{product.price.toFixed(0)}</span>
              {product.mrp > product.price && (
                <span className="text-sm font-semibold text-slate-400 line-through">₹{product.mrp.toFixed(0)}</span>
              )}
              <span className="text-xs text-slate-400">(Inclusive of all taxes)</span>
            </div>

            {/* Action */}
            <div className="pt-2">
              {quantity === 0 ? (
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 uppercase tracking-wider transition-all"
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-2xl border-2 border-emerald-600 bg-emerald-50/60">
                  <span className="text-xs font-bold text-emerald-900 pl-2">Added to Cart</span>
                  <div className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-xs">
                    <button onClick={handleDecrement} className="w-8 h-8 flex items-center justify-center hover:bg-emerald-700">
                      <Minus className="w-4 h-4 stroke-[3]" />
                    </button>
                    <span className="w-8 text-center font-black text-sm">{quantity}</span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= product.stockQuantity}
                      className="w-8 h-8 flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Product Details</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quality assurances */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Quality Assured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hygienic Sealed Packing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
