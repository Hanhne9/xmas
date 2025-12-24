
export interface HandData {
  distance: number; // Normalized distance between index fingertips (or palm centers)
  isDetected: boolean;
  rawDistance: number;
}

export interface ParticleState {
  expansion: number; // 0: Tree, 1: Exploded
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}
