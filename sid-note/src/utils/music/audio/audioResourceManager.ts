import { AUDIO_CONFIG } from "./audioConfig";

/**
 * Web Audio APIのリソースを管理するクラス
 */
export class AudioResourceManager {
  private static instance: AudioResourceManager;
  private audioContext: AudioContext | null = null;

  private constructor() {}

  static getInstance(): AudioResourceManager {
    if (!AudioResourceManager.instance) {
      AudioResourceManager.instance = new AudioResourceManager();
    }
    return AudioResourceManager.instance;
  }

  getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /**
   * オシレータとそれに関連するノードを作成します
   */
  createOscillator(
    frequency: number,
    startTime: number,
    stopTime: number,
    config: {
      type: OscillatorType;
      gainMax: number;
      filterFreq?: number;
      filterQ?: number;
    }
  ): {
    oscillator: OscillatorNode;
    gain: GainNode;
    filter?: BiquadFilterNode;
  } {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    let filter: BiquadFilterNode | undefined;

    // オシレータの基本設定
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // フィルター設定（必要な場合のみ）
    if (config.filterFreq) {
      filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(config.filterFreq, startTime);
      if (config.filterQ && typeof filter.Q === "object" && filter.Q !== null && "setValueAtTime" in filter.Q) {
        filter.Q.setValueAtTime(config.filterQ, startTime);
      }
    }

    // エンベロープ設定
    const { attack, decay, sustain, release } = AUDIO_CONFIG.envelope;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(config.gainMax, startTime + attack);
    gainNode.gain.linearRampToValueAtTime(config.gainMax * sustain, startTime + attack + decay);
    gainNode.gain.linearRampToValueAtTime(0, stopTime - release);

    return { oscillator, gain: gainNode, filter };
  }

  /**
   * 作成したノードを接続します
   */
  connectNodes(nodes: { oscillator: OscillatorNode; gain: GainNode; filter?: BiquadFilterNode }): void {
    const ctx = this.getContext();
    if (nodes.filter) {
      nodes.oscillator.connect(nodes.filter);
      nodes.filter.connect(nodes.gain);
    } else {
      nodes.oscillator.connect(nodes.gain);
    }
    nodes.gain.connect(ctx.destination);
  }

  /**
   * オシレータを開始します
   */
  startOscillator(nodes: { oscillator: OscillatorNode; startTime: number; stopTime: number }): void {
    nodes.oscillator.start(nodes.startTime);
    nodes.oscillator.stop(nodes.stopTime);
  }
}
