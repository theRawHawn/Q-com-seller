import React, { useState } from 'react';
import { Volume2, Play, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { soundService, STATUS_SOUND_CATALOG, SoundKey } from '../../utils/soundService';

interface StatusSoundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusSoundsModal: React.FC<StatusSoundsModalProps> = ({ isOpen, onClose }) => {
  const [activePlayingKey, setActivePlayingKey] = useState<SoundKey | null>(null);

  const handlePlay = (key: SoundKey) => {
    setActivePlayingKey(key);
    soundService.play(key);
    setTimeout(() => {
      setActivePlayingKey(prev => (prev === key ? null : prev));
    }, 600);
  };

  const handlePlayAllSequence = async () => {
    for (let i = 0; i < STATUS_SOUND_CATALOG.length; i++) {
      const item = STATUS_SOUND_CATALOG[i];
      setActivePlayingKey(item.key);
      soundService.play(item.key);
      await new Promise(res => setTimeout(res, 750));
    }
    setActivePlayingKey(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mandatory Operational Audio Chimes"
      subtitle="Distinct synthesized acoustic alerts for every order lifecycle stage"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Mandatory Policy Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3 text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs">Sounds Are Mandatory — Disabling Is Prohibited</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              To honor the 10-minute quick commerce delivery guarantee and meet the 3-minute store packing SLA, 
              audio alerts must remain continuously audible on the store fulfillment tablet or workstation. 
              Each order status has a distinct, recognizable acoustic signature so warehouse pickers and cashiers 
              can track lifecycle stages without staring at the screen.
            </p>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              Status Sound Catalog ({STATUS_SOUND_CATALOG.length} Distinct Tones)
            </span>
          </div>

          <button
            type="button"
            onClick={handlePlayAllSequence}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview All Tones</span>
          </button>
        </div>

        {/* Sound Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {STATUS_SOUND_CATALOG.map(item => {
            const isPlaying = activePlayingKey === item.key;
            return (
              <div
                key={item.key}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                  isPlaying
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal mb-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                  <span className="text-[10px] font-medium text-slate-600 truncate max-w-[170px]" title={item.signature}>
                    {item.signature}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePlay(item.key)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-emerald-600 text-white shadow-2xs scale-95'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Play className={`w-3 h-3 ${isPlaying ? 'fill-white' : 'fill-slate-700'}`} />
                    <span>{isPlaying ? 'Playing...' : 'Test Sound'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Synthesized with Web Audio API (Zero external network latency)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-900 hover:text-emerald-700 underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
