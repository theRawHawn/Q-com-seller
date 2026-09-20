import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Star, Link, Image as ImageIcon, Check, X } from 'lucide-react';
import { Button } from '../common/Button';

interface ProductImagesEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const SAMPLE_HARDWARE_IMAGES = [
  { name: 'Power Drill & Tools', url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=500&auto=format&fit=crop&q=80' },
  { name: 'Electrical Switchgear', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80' },
  { name: 'MCB Breakers', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80' },
  { name: 'Fasteners & Bolts', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80' },
  { name: 'CPVC Pipes & Valves', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80' },
  { name: 'Paints & Finishes', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&auto=format&fit=crop&q=80' },
  { name: 'Wood Adhesive', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80' },
  { name: 'Safety Equipment', url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&auto=format&fit=crop&q=80' },
];

export const ProductImagesEditor: React.FC<ProductImagesEditorProps> = ({
  images = [],
  onChange,
  maxImages = 5,
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) return;

    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          onChange([...images, result].slice(0, maxImages));
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    if (images.length >= maxImages) return;

    onChange([...images, customUrl.trim()].slice(0, maxImages));
    setCustomUrl('');
    setShowUrlInput(false);
  };

  const handleSelectPreset = (url: string) => {
    if (images.length >= maxImages) return;
    if (images.includes(url)) return;
    onChange([...images, url].slice(0, maxImages));
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    onChange([target, ...remaining]);
  };

  return (
    <div className="space-y-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 block">
            Product Photos (Max 5)
          </span>
          <span className="text-[10px] text-slate-500">
            Upload up to {maxImages} high-resolution photos for this SKU ({images.length}/{maxImages} added)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {images.length < maxImages && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Upload className="w-3 h-3 text-slate-600" />
                Upload File
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPresetPicker(!showPresetPicker);
                  setShowUrlInput(false);
                }}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3 h-3 text-slate-600" />
                Samples
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(!showUrlInput);
                  setShowPresetPicker(false);
                }}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Link className="w-3 h-3 text-slate-600" />
                URL
              </button>
            </>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* URL Input Form */}
      {showUrlInput && images.length < maxImages && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          <Button type="submit" variant="primary" size="sm">
            Add Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(false)}
          >
            Cancel
          </Button>
        </form>
      )}

      {/* Sample Hardware Photos Preset Picker */}
      {showPresetPicker && images.length < maxImages && (
        <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700">Click photo to add to SKU gallery:</span>
            <button
              type="button"
              onClick={() => setShowPresetPicker(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {SAMPLE_HARDWARE_IMAGES.map((sample, idx) => {
              const isSelected = images.includes(sample.url);
              return (
                <button
                  type="button"
                  key={idx}
                  disabled={isSelected}
                  onClick={() => handleSelectPreset(sample.url)}
                  className={`group relative rounded-lg overflow-hidden border aspect-square transition-all cursor-pointer ${
                    isSelected ? 'opacity-40 border-slate-300' : 'hover:border-emerald-600 hover:ring-1 hover:ring-emerald-600'
                  }`}
                  title={sample.name}
                >
                  <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Thumbnails Grid (Max 5 Slots) */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className="group relative rounded-lg border border-slate-200 bg-white overflow-hidden aspect-square flex items-center justify-center shadow-2xs"
          >
            <img
              src={imgUrl}
              alt={`Product photo ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Cover Badge */}
            {index === 0 ? (
              <span className="absolute top-1 left-1 bg-slate-900/90 text-white text-[9px] font-bold px-1 py-0.2 rounded shadow-2xs flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Cover
              </span>
            ) : (
              <span className="absolute top-1 left-1 bg-slate-800/70 text-white text-[9px] font-semibold px-1 py-0.2 rounded">
                #{index + 1}
              </span>
            )}

            {/* Actions Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => handleMakeCover(index)}
                  className="px-1.5 py-0.5 rounded bg-white text-slate-900 text-[10px] font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-0.5 cursor-pointer"
                  title="Set as primary cover image"
                >
                  <Star className="w-3 h-3 text-amber-500" />
                  Cover
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Empty Slot Dropzone Placeholders up to maxImages */}
        {Array.from({ length: Math.max(0, maxImages - images.length) }).map((_, idx) => (
          <button
            type="button"
            key={`empty-${idx}`}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-lg aspect-square flex flex-col items-center justify-center p-1 text-slate-400 hover:text-emerald-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        ))}
      </div>
    </div>
  );
};
