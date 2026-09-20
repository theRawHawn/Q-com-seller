/**
 * QCOM Sound Engine — Mandatory Operational Audio Synthesizer
 * Provides distinct, low-latency synthesized acoustic chimes for each order status.
 *
 * NOTE: Sound alerts are mandatory on the QCOM Seller Hub to ensure 
 * sub-3-minute picking SLA compliance and rapid EV courier handovers.
 */

import { OrderStatus } from '../types/seller';

export type SoundKey = OrderStatus | 'item_packed' | 'return_alert';

export interface StatusSoundMetadata {
  key: SoundKey;
  title: string;
  badge: string;
  description: string;
  signature: string;
  color: string;
}

export const STATUS_SOUND_CATALOG: StatusSoundMetadata[] = [
  {
    key: 'placed',
    title: 'New Incoming Order',
    badge: 'Urgent Alert',
    description: 'High-visibility 3-tone ascending alert chime when a new customer order drops in.',
    signature: 'Tri-tone Fanfare (D5 → G5 → C6)',
    color: 'emerald',
  },
  {
    key: 'picking',
    title: 'Order Accepted & Picking',
    badge: 'SLA Started',
    description: 'Brisk 2-tone operational chime confirming order accepted and the 3m countdown timer active.',
    signature: 'Ascending Dual Blip (A4 → E5)',
    color: 'blue',
  },
  {
    key: 'packed',
    title: 'Packed & Ready for Handover',
    badge: 'Counter Bell',
    description: 'Resonant counter service bell chime when packing completes and items are crate-sealed.',
    signature: 'Brass Counter Bell (C6 + G6 Harmonic)',
    color: 'purple',
  },
  {
    key: 'out_for_delivery',
    title: 'Courier Handover & Dispatched',
    badge: 'In Transit',
    description: 'Rising dynamic motion sweep when the parcel is handed over to the EV courier rider.',
    signature: 'Rising Doppler Sweep (E4 → A5 → E6)',
    color: 'amber',
  },
  {
    key: 'arriving',
    title: 'Rider Arriving at Site',
    badge: 'Proximity',
    description: 'Subtle double radar ping when courier reaches within 500m of customer job site.',
    signature: 'Dual Sonar Pulse (A5 • B5)',
    color: 'sky',
  },
  {
    key: 'delivered',
    title: 'Delivered & Complete',
    badge: 'Success',
    description: 'Uplifting 4-note celebration chord when the order is successfully handed over to customer.',
    signature: '4-Note Major Arpeggio (C5 → E5 → G5 → C6)',
    color: 'emerald',
  },
  {
    key: 'cancelled',
    title: 'Order Cancelled or Declined',
    badge: 'Caution',
    description: 'Low descending minor cautionary chime when an order is declined or cancelled.',
    signature: 'Descending Minor Pitch (G4 → D4)',
    color: 'rose',
  },
  {
    key: 'item_packed',
    title: 'Item Checklist Packed',
    badge: 'Tactile Tap',
    description: 'Crisp tactile pop when staff checks off an individual SKU from the packing bay.',
    signature: 'Micro Tactile Pop (1100Hz → 550Hz)',
    color: 'slate',
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Plays the designated acoustic chime for any order status or operational event.
   * Sounds are mandatory in quick-commerce fulfillment.
   */
  public play(key: SoundKey): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (key) {
        case 'placed':
          this.playNewOrderPlaced(ctx, now);
          break;

        case 'picking':
          this.playOrderAcceptedPicking(ctx, now);
          break;

        case 'packed':
          this.playOrderPackedReady(ctx, now);
          break;

        case 'out_for_delivery':
          this.playOutForDelivery(ctx, now);
          break;

        case 'arriving':
          this.playRiderArriving(ctx, now);
          break;

        case 'delivered':
          this.playOrderDelivered(ctx, now);
          break;

        case 'cancelled':
          this.playOrderCancelled(ctx, now);
          break;

        case 'item_packed':
          this.playItemPackedPop(ctx, now);
          break;

        case 'return_alert':
          this.playReturnAlert(ctx, now);
          break;

        default:
          this.playNewOrderPlaced(ctx, now);
          break;
      }
    } catch (e) {
      console.warn('Audio synthesis warning:', e);
    }
  }

  // 1. PLACED: Urgent, energetic 3-tone ascending alert chime (D5 -> G5 -> C6)
  private playNewOrderPlaced(ctx: AudioContext, t: number): void {
    const notes = [
      { freq: 587.33, start: 0, dur: 0.1 },      // D5
      { freq: 783.99, start: 0.09, dur: 0.1 },   // G5
      { freq: 1046.50, start: 0.18, dur: 0.38 }, // C6
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + start);

      gain.gain.setValueAtTime(0.001, t + start);
      gain.gain.linearRampToValueAtTime(0.35, t + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + start);
      osc.stop(t + start + dur);
    });

    // High shimmer harmonic on the final tone
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(2093.0, t + 0.18); // C7
    shimmerGain.gain.setValueAtTime(0.001, t + 0.18);
    shimmerGain.gain.linearRampToValueAtTime(0.12, t + 0.20);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, t + 0.52);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.start(t + 0.18);
    shimmer.stop(t + 0.55);
  }

  // 2. PICKING: Brisk, positive 2-tone operational confirmation (A4 -> E5)
  private playOrderAcceptedPicking(ctx: AudioContext, t: number): void {
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, t);
    gain1.gain.setValueAtTime(0.28, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.1);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, t + 0.08);
    gain2.gain.setValueAtTime(0.32, t + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.28);
  }

  // 3. PACKED: Resonant service counter brass bell (C6 + G6 harmonic overtone)
  private playOrderPackedReady(ctx: AudioContext, t: number): void {
    // Fundamental
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, t); // C6
    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);

    // Harmonic bell ring
    const harm = ctx.createOscillator();
    const harmGain = ctx.createGain();
    harm.type = 'sine';
    harm.frequency.setValueAtTime(1567.98, t); // G6
    harmGain.gain.setValueAtTime(0.22, t);
    harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    harm.connect(harmGain);
    harmGain.connect(ctx.destination);
    harm.start(t);
    harm.stop(t + 0.45);
  }

  // 4. OUT_FOR_DELIVERY: Dynamic upward velocity sweep (E4 -> A5 -> E6)
  private playOutForDelivery(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(329.63, t); // E4
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.22); // A5

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.33);

    // High accent tone
    const accent = ctx.createOscillator();
    const accentGain = ctx.createGain();
    accent.type = 'sine';
    accent.frequency.setValueAtTime(1318.5, t + 0.18); // E6
    accentGain.gain.setValueAtTime(0.25, t + 0.18);
    accentGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    accent.connect(accentGain);
    accentGain.connect(ctx.destination);
    accent.start(t + 0.18);
    accent.stop(t + 0.46);
  }

  // 5. ARRIVING: Dual soft sonar / proximity pings (A5 ... B5)
  private playRiderArriving(ctx: AudioContext, t: number): void {
    [
      { freq: 880, start: 0, dur: 0.11 },
      { freq: 987.77, start: 0.14, dur: 0.18 },
    ].forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + start);
      gain.gain.setValueAtTime(0.25, t + start);
      gain.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + start);
      osc.stop(t + start + dur + 0.02);
    });
  }

  // 6. DELIVERED: Triumphant 4-note ascending major celebration chord
  private playOrderDelivered(ctx: AudioContext, t: number): void {
    const chord = [
      { freq: 523.25, start: 0.00, dur: 0.14 }, // C5
      { freq: 659.25, start: 0.07, dur: 0.14 }, // E5
      { freq: 783.99, start: 0.14, dur: 0.16 }, // G5
      { freq: 1046.50, start: 0.21, dur: 0.45 }, // C6
    ];

    chord.forEach(({ freq, start, dur }, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + start);

      const peakVolume = idx === chord.length - 1 ? 0.35 : 0.25;
      gain.gain.setValueAtTime(0.001, t + start);
      gain.gain.linearRampToValueAtTime(peakVolume, t + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + start);
      osc.stop(t + start + dur + 0.02);
    });
  }

  // 7. CANCELLED: Subdued descending minor warning (G4 -> D4)
  private playOrderCancelled(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(392, t); // G4
    osc.frequency.exponentialRampToValueAtTime(293.66, t + 0.22); // D4

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.33);
  }

  // 8. ITEM_PACKED: Tactile wooden pop for SKU checklist
  private playItemPackedPop(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.045);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  // 9. RETURN_ALERT: Return notice chime
  private playReturnAlert(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(622.25, t);
    osc.frequency.exponentialRampToValueAtTime(493.88, t + 0.18);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  }
}

export const soundService = new SoundEngine();
