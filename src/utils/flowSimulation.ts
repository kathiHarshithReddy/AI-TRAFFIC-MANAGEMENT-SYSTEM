import * as d3 from 'd3';
import { SignalMode, SimulatedIntersection } from '../types/traffic';

export interface WaitTimeColorInfo {
  color: string;
  tier: 'low' | 'moderate' | 'high' | 'severe';
  label: string;
}

export interface FlowParticle {
  id: number;
  x: number;
  lane: 0 | 1 | 2;
  lengthPx: number;
  speedJitter: number;
  isTransit: boolean;
}

export interface JunctionGeometry {
  intersection: SimulatedIntersection;
  cx: number;
  stopX: number;
  waitColor: string;
  waitInfo: WaitTimeColorInfo;
  densityParticlesTarget: number;
}

// Continuous D3 color scale reflecting current junction wait times (10s -> 85s+)
const WAIT_COLOR_SCALE = d3
  .scaleLinear<string>()
  .domain([12, 28, 46, 68])
  .range(['#10B981', '#38BDF8', '#F59E0B', '#F43F5E'])
  .clamp(true);

export function interpolateWaitTimeColor(avgWaitSec: number): string {
  return WAIT_COLOR_SCALE(avgWaitSec);
}

export function getWaitTimeColorInfo(avgWaitSec: number): WaitTimeColorInfo {
  const color = interpolateWaitTimeColor(avgWaitSec);
  if (avgWaitSec <= 20) {
    return { color, tier: 'low', label: 'Low Wait (≤20s)' };
  }
  if (avgWaitSec <= 35) {
    return { color, tier: 'moderate', label: 'Moderate Wait (21–35s)' };
  }
  if (avgWaitSec <= 52) {
    return { color, tier: 'high', label: 'Elevated Wait (36–52s)' };
  }
  return { color, tier: 'severe', label: 'Severe Wait (>52s)' };
}

export function computeJunctionGeometry(
  intersections: SimulatedIntersection[],
  trackStartX: number = 88,
  trackEndX: number = 872
): JunctionGeometry[] {
  const count = intersections.length;
  const span = trackEndX - trackStartX;
  const step = count > 1 ? span / (count - 1) : 0;

  return intersections.map((intersection, idx) => {
    const cx = count > 1 ? trackStartX + idx * step : (trackStartX + trackEndX) / 2;
    const stopX = cx - 26;
    const waitInfo = getWaitTimeColorInfo(intersection.avgWaitSec);
    // Higher density maps to denser particle stream per segment
    const densityParticlesTarget = Math.max(
      4,
      Math.round((intersection.densityPct / 100) * 16)
    );
    return {
      intersection,
      cx,
      stopX,
      waitColor: waitInfo.color,
      waitInfo,
      densityParticlesTarget,
    };
  });
}

export function getNearestUpstreamJunction(
  x: number,
  geometries: JunctionGeometry[]
): JunctionGeometry | null {
  for (let i = 0; i < geometries.length; i++) {
    if (x <= geometries[i].cx + 12) {
      return geometries[i];
    }
  }
  return geometries[geometries.length - 1] || null;
}

export function getDesiredParticleCount(
  intersections: SimulatedIntersection[]
): number {
  if (intersections.length === 0) return 0;
  const avgDensity =
    intersections.reduce((sum, jx) => sum + jx.densityPct, 0) /
    intersections.length;
  // Scale between 26 (off-peak low density) and 76 (heavy gridlock)
  return Math.max(24, Math.min(78, Math.round(18 + (avgDensity / 100) * 60)));
}

export function buildFlowParticles(
  count: number,
  trackMinX: number = 24,
  trackMaxX: number = 936
): FlowParticle[] {
  const span = trackMaxX - trackMinX;
  const particles: FlowParticle[] = [];
  for (let i = 0; i < count; i++) {
    const lane = (i % 3) as 0 | 1 | 2;
    const isTransit = i % 7 === 0;
    // Deterministic seeded spacing + subtle variation
    const ratio = (i + ((i * 37) % 13) / 15) / Math.max(1, count);
    particles.push({
      id: i + 1,
      x: trackMinX + (ratio % 1) * span,
      lane,
      lengthPx: isTransit ? 16 : 9 + (i % 3) * 2,
      speedJitter: 0.86 + ((i * 19) % 10) * 0.03,
      isTransit,
    });
  }
  return particles;
}

export function syncParticlePopulation(
  existing: FlowParticle[],
  targetCount: number,
  trackMinX: number = 24,
  trackMaxX: number = 936
): FlowParticle[] {
  if (existing.length === targetCount) return existing;
  if (existing.length > targetCount) {
    return existing.slice(0, targetCount);
  }
  const next = [...existing];
  const span = trackMaxX - trackMinX;
  for (let i = existing.length; i < targetCount; i++) {
    const lane = (i % 3) as 0 | 1 | 2;
    const isTransit = i % 7 === 0;
    next.push({
      id: i + 1,
      x: trackMinX + (((i * 73) % 100) / 100) * span,
      lane,
      lengthPx: isTransit ? 16 : 9 + (i % 3) * 2,
      speedJitter: 0.86 + ((i * 19) % 10) * 0.03,
      isTransit,
    });
  }
  return next;
}

export interface RenderedParticleDatum extends FlowParticle {
  color: string;
  opacity: number;
  stoppedAtRed: boolean;
}

export function stepFlowParticles(
  particles: FlowParticle[],
  geometries: JunctionGeometry[],
  corridorSpeedKmh: number,
  signalMode: SignalMode,
  dtSec: number,
  trackMinX: number = 24,
  trackMaxX: number = 936
): RenderedParticleDatum[] {
  const clampedDt = Math.min(0.08, Math.max(0, dtSec));
  const basePxPerSec =
    Math.max(24, corridorSpeedKmh * 3.1) *
    (signalMode === 'adaptive' ? 1.08 : 0.9);

  // Group particles by lane to prevent overlapping pileups behind red lights
  const rendered: RenderedParticleDatum[] = new Array(particles.length);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const upcoming = getNearestUpstreamJunction(p.x, geometries);

    let speedFactor = p.speedJitter;
    let stoppedAtRed = false;

    if (upcoming) {
      const distToStop = upcoming.stopX - p.x;
      const phase = upcoming.intersection.currentPhase;
      const queueZonePx = Math.min(
        85,
        Math.max(26, upcoming.intersection.queueMeters * 0.17)
      );

      if (phase === 'RED' && distToStop >= -2 && distToStop <= queueZonePx) {
        // Stagger queuing slots by particle ID so queued vehicles stack cleanly before stop line
        const slotGap = (p.id % 4) * 14;
        if (distToStop <= 6 + slotGap) {
          speedFactor = 0.03;
          stoppedAtRed = true;
        } else {
          speedFactor *= 0.35;
        }
      } else if (phase === 'YELLOW' && distToStop >= 0 && distToStop <= 42) {
        speedFactor *= 0.45;
      } else if (phase === 'GREEN') {
        speedFactor *= signalMode === 'adaptive' ? 1.18 : 1.0;
      }
    }

    p.x += basePxPerSec * speedFactor * clampedDt;
    if (p.x > trackMaxX) {
      p.x = trackMinX + (p.x - trackMaxX);
    }

    // Color particle smoothly by nearest junction's current wait time
    const localWaitSec = upcoming ? upcoming.intersection.avgWaitSec : 25;
    const color = interpolateWaitTimeColor(localWaitSec);

    rendered[i] = {
      ...p,
      color,
      opacity: stoppedAtRed ? 0.95 : p.isTransit ? 0.92 : 0.8,
      stoppedAtRed,
    };
  }

  return rendered;
}
