import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Clock, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { getProductQuantity, addItem, updateItemQuantity, removeItem, cart } = useCart();
  const quantity = getProductQuantity(product.id);

  const cartItem = cart.items.find((i) => i.productId === product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(product, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (cartItem) {
      updateItemQuantity(cartItem.id, product.id, quantity + 1);
    } else {
      addItem(product, 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (cartItem) {
      if (quantity === 1) {
        removeItem(cartItem.id, product.id);
      } else {
        updateItemQuantity(cartItem.id, product.id, quantity - 1);
      }
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50">
      <div>
        {/* Image & Delivery Badge */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3 cursor-pointer" onClick={() => onOpenDetail?.(product)}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <span className="absolute top-2 left-2 bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              {product.discountPercentage}% OFF
            </span>
          )}

          {/* Quick view button overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail?.(product);
            }}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50 hover:text-emerald-700"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* 10 MINS tag */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1.5 bg-slate-100/80 w-fit px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3 text-emerald-600" />
          <span>10 MINS</span>
        </div>

        {/* Title & Brand */}
        <h3
          onClick={() => onOpenDetail?.(product)}
          className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer mb-1"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Quantity/Unit */}
        <p className="text-xs text-slate-500 font-medium mb-3">
          {product.quantity}
        </p>
      </div>

      {/* Pricing & Add/Increment Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
        <div className="flex flex-col">
          <span className="font-black text-sm text-slate-900 leading-none">
            ₹{product.price.toFixed(0)}
          </span>
          {product.mrp > product.price && (
            <span className="text-[11px] text-slate-400 line-through mt-0.5">
              ₹{product.mrp.toFixed(0)}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div>
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className={`px-4 py-1.5 rounded-xl font-extrabold text-xs tracking-wider transition-all duration-150 uppercase shadow-xs active:scale-95 ${
                product.inStock
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              {product.inStock ? 'ADD' : 'Out of stock'}
            </button>
          ) : (
            <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-xs overflow-hidden">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center hover:bg-emerald-700 transition-colors active:bg-emerald-800"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="w-6 text-center font-black text-xs">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.stockQuantity}
                className="w-7 h-7 flex items-center justify-center hover:bg-emerald-700 transition-colors active:bg-emerald-800 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
