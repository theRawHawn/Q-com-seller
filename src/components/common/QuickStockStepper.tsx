import React, { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';

interface QuickStockStepperProps {
  productId: string;
  currentStock: number;
  unit: string;
  onStockChange: (productId: string, newStock: number) => Promise<void>;
  disabled?: boolean;
}

export const QuickStockStepper: React.FC<QuickStockStepperProps> = ({
  productId,
  currentStock,
  unit,
  onStockChange,
  disabled = false,
}) => {
  const [stock, setStock] = useState(currentStock);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const handleAdjust = (delta: number) => {
    const next = Math.max(0, stock + delta);
    setStock(next);
    setHasChanged(next !== currentStock);
  };

  const handleCommit = async () => {
    if (stock === currentStock) return;
    try {
      setIsUpdating(true);
      await onStockChange(productId, stock);
      setHasChanged(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="inline-flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200">
        <button
          type="button"
          onClick={() => handleAdjust(-1)}
          disabled={disabled || isUpdating || stock <= 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-200 shadow-2xs border border-slate-200/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Decrease stock by 1"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="w-12 text-center font-mono font-bold text-sm text-slate-900 select-none">
          {stock}
        </span>

        <button
          type="button"
          onClick={() => handleAdjust(1)}
          disabled={disabled || isUpdating}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-200 shadow-2xs border border-slate-200/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Increase stock by 1"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {hasChanged && (
        <button
          type="button"
          onClick={handleCommit}
          disabled={isUpdating}
          className="h-8 px-2.5 flex items-center gap-1 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 active:scale-95 transition-all shadow-xs"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      )}
    </div>
  );
};
