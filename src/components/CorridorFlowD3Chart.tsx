import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { localizeBengaluruPlaceName } from '../i18n/bengaluruTransliterator';
import { useLanguage } from '../i18n/LanguageContext';
import { SignalMode, SimulatedIntersection, TrafficScenario } from '../types/traffic';
import {
  buildFlowParticles,
  computeJunctionGeometry,
  FlowParticle,
  getDesiredParticleCount,
  interpolateWaitTimeColor,
  stepFlowParticles,
  syncParticlePopulation,
} from '../utils/flowSimulation';
import {
  getSignalIndicatorPulseState,
  isGreenCorridorActive,
} from '../utils/signalEngine';

interface CorridorFlowD3ChartProps {
  corridorId: string;
  corridorName: string;
  intersections: SimulatedIntersection[];
  corridorSpeedKmh: number;
  signalMode: SignalMode;
  scenario?: TrafficScenario;
  isSimRunning: boolean;
}

const SVG_WIDTH = 960;
const SVG_HEIGHT = 204;
const TRACK_Y = 74;
const LANE_OFFSETS: Record<0 | 1 | 2, number> = {
  0: -13,
  1: 0,
  2: 13,
};

interface HoveredJunctionState {
  junction: SimulatedIntersection;
  xPct: number;
}

export function CorridorFlowD3Chart({
  corridorId,
  corridorName,
  intersections,
  corridorSpeedKmh,
  signalMode,
  scenario = 'morning_rush',
  isSimRunning,
}: CorridorFlowD3ChartProps) {
  const { language, t } = useLanguage();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hovered, setHovered] = useState<HoveredJunctionState | null>(null);
  const greenCorridorActive = isGreenCorridorActive(scenario);

  const geometries = useMemo(
    () => computeJunctionGeometry(intersections, 92, 868),
    [intersections]
  );

  const particlesRef = useRef<FlowParticle[]>(
    buildFlowParticles(getDesiredParticleCount(intersections), 24, 936)
  );

  const simStateRef = useRef({
    geometries,
    corridorSpeedKmh,
    signalMode,
    isSimRunning,
  });

  useEffect(() => {
    simStateRef.current = {
      geometries,
      corridorSpeedKmh,
      signalMode,
      isSimRunning,
    };
    const desired = getDesiredParticleCount(intersections);
    particlesRef.current = syncParticlePopulation(
      particlesRef.current,
      desired,
      24,
      936
    );
  }, [geometries, intersections, corridorSpeedKmh, signalMode, isSimRunning]);

  useEffect(() => {
    const desired = getDesiredParticleCount(intersections);
    particlesRef.current = buildFlowParticles(desired, 24, 936);
    setHovered(null);
  }, [corridorId]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    const segmentsLayer = svg.select<SVGGElement>('.d3-segments-layer');
    const queuesLayer = svg.select<SVGGElement>('.d3-queues-layer');
    const nodesLayer = svg.select<SVGGElement>('.d3-nodes-layer');

    const segmentData = geometries.map((geom, idx) => {
      const prevX = idx === 0 ? 24 : geometries[idx - 1].cx;
      return {
        id: `${geom.intersection.id}-seg`,
        x1: prevX,
        x2: geom.cx,
        color: geom.waitColor,
        densityPct: geom.intersection.densityPct,
      };
    });

    if (geometries.length > 0) {
      const last = geometries[geometries.length - 1];
      segmentData.push({
        id: `${last.intersection.id}-tail`,
        x1: last.cx,
        x2: 936,
        color: last.waitColor,
        densityPct: last.intersection.densityPct,
      });
    }

    segmentsLayer
      .selectAll<SVGLineElement, (typeof segmentData)[number]>('line.segment-wait-flow')
      .data(segmentData, (d) => d.id)
      .join('line')
      .attr('class', 'segment-wait-flow')
      .attr('x1', (d) => d.x1)
      .attr('x2', (d) => d.x2)
      .attr('y1', TRACK_Y)
      .attr('y2', TRACK_Y)
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 36)
      .attr('stroke-opacity', 0.14);

    const queueWidthScale = d3
      .scaleLinear()
      .domain([20, 560])
      .range([8, 68])
      .clamp(true);

    queuesLayer
      .selectAll<SVGRectElement, (typeof geometries)[number]>('rect.queue-bar')
      .data(geometries, (d) => d.intersection.id)
      .join('rect')
      .attr('class', 'queue-bar')
      .attr('x', (d) => d.stopX - queueWidthScale(d.intersection.queueMeters))
      .attr('y', TRACK_Y - 19)
      .attr('width', (d) => queueWidthScale(d.intersection.queueMeters))
      .attr('height', 38)
      .attr('rx', 4)
      .attr('fill', (d) => d.waitColor)
      .attr('fill-opacity', (d) =>
        d.intersection.currentPhase === 'RED' ? 0.3 : 0.14
      )
      .attr('stroke', (d) => d.waitColor)
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1);

    const nodeGroups = nodesLayer
      .selectAll<SVGGElement, (typeof geometries)[number]>('g.junction-node')
      .data(geometries, (d) => d.intersection.id)
      .join((enter) => {
        const g = enter
          .append('g')
          .attr('class', 'junction-node')
          .style('cursor', 'pointer');

        g.append('line').attr('class', 'stop-line');
        g.append('circle').attr('class', 'emergency-pulse-ring');
        g.append('circle').attr('class', 'wait-halo');
        g.append('circle').attr('class', 'signal-core');
        g.append('text').attr('class', 'countdown-text');
        g.append('text').attr('class', 'wait-pill-text');
        g.append('text').attr('class', 'junction-name-text');
        g.append('text').attr('class', 'density-meta-text');
        return g;
      });

    nodeGroups
      .attr('transform', (d) => `translate(${d.cx}, ${TRACK_Y})`)
      .attr('data-phase', (d) => d.intersection.currentPhase)
      .attr('data-pulsing', (d) =>
        getSignalIndicatorPulseState(
          d.intersection.currentPhase,
          scenario,
          isSimRunning
        ).shouldPulse
          ? 'true'
          : 'false'
      )
      .on('mouseenter', (_event, d) => {
        setHovered({
          junction: d.intersection,
          xPct: (d.cx / SVG_WIDTH) * 100,
        });
      })
      .on('mouseleave', () => {
        setHovered(null);
      });

    nodeGroups
      .select<SVGLineElement>('line.stop-line')
      .attr('x1', -26)
      .attr('x2', -26)
      .attr('y1', -18)
      .attr('y2', 18)
      .attr('stroke', (d) =>
        d.intersection.currentPhase === 'RED' ? '#FB7185' : '#475569'
      )
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) =>
        d.intersection.currentPhase === 'RED' ? '0' : '3 3'
      );

    nodeGroups
      .select<SVGCircleElement>('circle.emergency-pulse-ring')
      .attr('class', (d) => {
        const pulse = getSignalIndicatorPulseState(
          d.intersection.currentPhase,
          scenario,
          isSimRunning
        );
        return pulse.shouldPulse
          ? 'emergency-pulse-ring svg-corridor-ripple-active'
          : 'emergency-pulse-ring';
      })
      .attr('r', 23)
      .attr('fill', 'none')
      .attr('stroke', (d) =>
        d.intersection.currentPhase === 'GREEN' ? '#34D399' : '#FBBF24'
      )
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', (d) =>
        getSignalIndicatorPulseState(
          d.intersection.currentPhase,
          scenario,
          isSimRunning
        ).shouldPulse
          ? 0.9
          : 0
      );

    nodeGroups
      .select<SVGCircleElement>('circle.wait-halo')
      .attr('r', 27)
      .attr('fill', 'none')
      .attr('stroke', (d) =>
        greenCorridorActive && d.intersection.currentPhase === 'GREEN'
          ? '#34D399'
          : d.waitColor
      )
      .attr('stroke-width', greenCorridorActive ? 2.5 : 2)
      .attr('stroke-opacity', greenCorridorActive ? 0.65 : 0.45);

    nodeGroups
      .select<SVGCircleElement>('circle.signal-core')
      .attr('class', (d) => {
        const pulse = getSignalIndicatorPulseState(
          d.intersection.currentPhase,
          scenario,
          isSimRunning
        );
        return pulse.shouldPulse
          ? 'signal-core svg-signal-core-active'
          : 'signal-core';
      })
      .attr('r', 21)
      .attr('fill', '#0F172A')
      .attr('stroke', (d) =>
        d.intersection.currentPhase === 'GREEN'
          ? '#10B981'
          : d.intersection.currentPhase === 'YELLOW'
            ? '#F59E0B'
            : '#F43F5E'
      )
      .attr('stroke-width', greenCorridorActive ? 3.2 : 2.5);

    nodeGroups
      .select<SVGTextElement>('text.countdown-text')
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) =>
        d.intersection.currentPhase === 'GREEN'
          ? '#6EE7B7'
          : d.intersection.currentPhase === 'YELLOW'
            ? '#FCD34D'
            : '#FDA4AF'
      )
      .attr('font-size', '11')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => `${d.intersection.countdownSec}s`);

    nodeGroups
      .select<SVGTextElement>('text.wait-pill-text')
      .attr('y', -36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#CBD5E1')
      .attr('font-size', '10.5')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => `${d.intersection.avgWaitSec}s ${t.flowChart.waitLabel}`);

    nodeGroups
      .select<SVGTextElement>('text.junction-name-text')
      .attr('y', 48)
      .attr('text-anchor', 'middle')
      .attr('fill', '#F8FAFC')
      .attr('font-size', '11')
      .attr('font-weight', '600')
      .text((d) => {
        const cleanEn = d.intersection.name
          .replace(' Junction', '')
          .replace(' Signal', '')
          .replace(' Circle', '')
          .replace(' Crossing', '');
        const label =
          language === 'en'
            ? cleanEn
            : localizeBengaluruPlaceName(cleanEn, language);
        return label.length > 18 ? `${label.slice(0, 17)}…` : label;
      });

    nodeGroups
      .select<SVGTextElement>('text.density-meta-text')
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94A3B8')
      .attr('font-size', '10')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(
        (d) =>
          `${d.intersection.densityPct}% ${t.flowChart.densityLabel} · ${d.intersection.queueMeters}m`
      );
  }, [geometries, language, t, scenario, isSimRunning, greenCorridorActive]);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const particlesLayer = d3.select(svgEl).select<SVGGElement>('.d3-particles-layer');
    let lastElapsed = 0;

    const renderParticles = (dtSec: number) => {
      const state = simStateRef.current;
      const rendered = stepFlowParticles(
        particlesRef.current,
        state.geometries,
        state.corridorSpeedKmh,
        state.signalMode,
        dtSec,
        24,
        936
      );

      particlesLayer
        .selectAll<SVGRectElement, (typeof rendered)[number]>('rect.vehicle-particle')
        .data(rendered, (d) => d.id)
        .join('rect')
        .attr('class', 'vehicle-particle')
        .attr('x', (d) => d.x)
        .attr('y', (d) => TRACK_Y + LANE_OFFSETS[d.lane] - (d.isTransit ? 3 : 2))
        .attr('width', (d) => d.lengthPx)
        .attr('height', (d) => (d.isTransit ? 6 : 4))
        .attr('rx', 2)
        .attr('fill', (d) => d.color)
        .attr('fill-opacity', (d) => d.opacity);
    };

    renderParticles(0);

    const timer = d3.timer((elapsed) => {
      const dtSec = Math.min(0.06, Math.max(0, (elapsed - lastElapsed) / 1000));
      lastElapsed = elapsed;

      if (!simStateRef.current.isSimRunning) {
        return;
      }
      renderParticles(dtSec);
    });

    return () => {
      timer.stop();
    };
  }, []);

  const legendItems = useMemo(
    () => [
      { label: t.flowChart.lowWait, color: interpolateWaitTimeColor(14) },
      { label: t.flowChart.moderateWait, color: interpolateWaitTimeColor(28) },
      { label: t.flowChart.highWait, color: interpolateWaitTimeColor(45) },
      { label: t.flowChart.severeWait, color: interpolateWaitTimeColor(66) },
    ],
    [t]
  );

  return (
    <div
      data-testid="d3-flow-visualization"
      data-green-corridor-active={greenCorridorActive ? 'true' : 'false'}
      className={`rounded-xl border bg-[#0F172A] p-4 sm:p-5 transition-colors ${
        greenCorridorActive ? 'border-emerald-500/50' : 'border-slate-800/90'
      }`}
    >
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-100">
            {corridorName}
          </h2>
          <p className="text-xs text-slate-400">
            {t.flowChart.subtitle} ({intersections.length} {t.signals.junctionsWord}) ·{' '}
            <span className="font-mono font-semibold tabular-nums text-slate-200">
              {corridorSpeedKmh} km/h
            </span>{' '}
            · {isSimRunning ? t.flowChart.liveStream : t.flowChart.paused}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300">
          {legendItems.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative overflow-x-auto pb-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="h-44 w-full min-w-[700px] select-none"
          role="img"
          aria-label={`${t.flowChart.title} — ${corridorName}`}
        >
          <rect
            x="24"
            y={TRACK_Y - 22}
            width="912"
            height="44"
            rx="10"
            fill="#0B1120"
            stroke="#1E293B"
            strokeWidth="1.5"
          />

          <line
            x1="28"
            x2="932"
            y1={TRACK_Y - 7}
            y2={TRACK_Y - 7}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="6 6"
            strokeOpacity="0.65"
          />
          <line
            x1="28"
            x2="932"
            y1={TRACK_Y + 7}
            y2={TRACK_Y + 7}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="6 6"
            strokeOpacity="0.65"
          />

          <g className="d3-segments-layer" />
          <g className="d3-queues-layer" />
          <g className="d3-particles-layer" />
          <g className="d3-nodes-layer" />
        </svg>

        {hovered && (
          <div
            role="status"
            style={{
              left: `clamp(12px, calc(${hovered.xPct}% - 125px), calc(100% - 262px))`,
            }}
            className="pointer-events-none absolute top-1 z-10 w-[250px] rounded-xl border border-slate-700 bg-[#0B1120]/95 px-3 py-2 text-xs shadow-xl"
          >
            <div className="font-semibold text-slate-100 truncate">
              {localizeBengaluruPlaceName(hovered.junction.name, language)}
            </div>
            <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-slate-300 tabular-nums">
              <span>
                {t.flowChart.densityLabel}: {hovered.junction.densityPct}%
              </span>
              <span>
                {t.flowChart.queueLabel}: {hovered.junction.queueMeters}m
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between font-mono text-[11px] tabular-nums">
              <span
                className="font-semibold"
                style={{
                  color: interpolateWaitTimeColor(hovered.junction.avgWaitSec),
                }}
              >
                {t.flowChart.waitLabel}: {hovered.junction.avgWaitSec}s
              </span>
              <span className="text-slate-400">
                {t.signals.phases[hovered.junction.currentPhase]} ·{' '}
                {hovered.junction.countdownSec}s
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
        <span>{t.flowChart.legendHint}</span>
        <span className="font-mono font-semibold text-slate-300 tabular-nums">
          {signalMode === 'adaptive'
            ? t.signals.aiGreenWaveActive
            : t.signals.unoptimizedFixed}
        </span>
      </div>
    </div>
  );
}
