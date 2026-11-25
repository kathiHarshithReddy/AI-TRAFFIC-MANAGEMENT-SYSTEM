import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, MapPin, Search, X } from 'lucide-react';
import {
  BENGALURU_LOCALITIES,
  findLocalityByQuery,
} from '../data/bengaluruLocalities';
import {
  localizeBengaluruPlaceName,
  localizeMetroLineName,
} from '../i18n/bengaluruTransliterator';
import { useLanguage } from '../i18n/LanguageContext';
import { Locality, WeatherCondition } from '../types/traffic';
import {
  BENGALURU_REGIONS,
  BengaluruRegion,
  CategorizedLocalityGroup,
  getLocalityRegion,
  groupLocalitiesByRegion,
} from '../utils/localityRegions';
import { getLocalityMicroWeather } from '../utils/weatherEngine';

interface LocalityPickerProps {
  id: string;
  label: string;
  selectedLocality: Locality;
  onSelect: (locality: Locality) => void;
  categorizedRegions?: CategorizedLocalityGroup[];
  weatherCondition?: WeatherCondition;
  placeholder?: string;
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function LocalityPicker({
  id,
  label,
  selectedLocality,
  onSelect,
  categorizedRegions,
  weatherCondition = 'clear',
  placeholder,
}: LocalityPickerProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeRegionFilter, setActiveRegionFilter] = useState<
    BengaluruRegion | 'All'
  >('All');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const effectivePlaceholder = placeholder ?? t.planner.searchPlaceholder;

  const baseGroups = useMemo(
    () => categorizedRegions ?? groupLocalitiesByRegion(BENGALURU_LOCALITIES),
    [categorizedRegions]
  );

  const totalCount = useMemo(
    () => baseGroups.reduce((sum, g) => sum + g.localities.length, 0),
    [baseGroups]
  );

  const selectedRegion = getLocalityRegion(selectedLocality);
  const localizedSelectedRegion = t.planner.regions[selectedRegion].name;
  const localizedSelectedName = localizeBengaluruPlaceName(
    selectedLocality.name,
    language
  );
  const localizedSelectedStation = localizeBengaluruPlaceName(
    selectedLocality.nearestMetro.station,
    language
  );
  const localizedSelectedLine = localizeMetroLineName(
    selectedLocality.nearestMetro.line,
    language
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const filteredGroups = useMemo<CategorizedLocalityGroup[]>(() => {
    const trimmed = query.trim().toLowerCase();
    const matchedIds = trimmed
      ? new Set(
          findLocalityByQuery(trimmed)
            .concat(
              BENGALURU_LOCALITIES.filter((loc) => {
                const region = getLocalityRegion(loc);
                const locRegionName = t.planner.regions[region].name.toLowerCase();
                const locPlaceName = localizeBengaluruPlaceName(
                  loc.name,
                  language
                ).toLowerCase();
                return (
                  region.toLowerCase().includes(trimmed) ||
                  locRegionName.includes(trimmed) ||
                  locPlaceName.includes(trimmed)
                );
              })
            )
            .map((loc) => loc.id)
        )
      : null;

    return baseGroups
      .filter(
        (group) =>
          activeRegionFilter === 'All' || group.region === activeRegionFilter
      )
      .map((group) => ({
        ...group,
        localities: matchedIds
          ? group.localities.filter((loc) => matchedIds.has(loc.id))
          : group.localities,
      }))
      .filter((group) => group.localities.length > 0);
  }, [baseGroups, query, activeRegionFilter, language, t]);

  const totalMatches = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.localities.length, 0),
    [filteredGroups]
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          htmlFor={`${id}-trigger`}
          className="block text-xs font-medium text-slate-400"
        >
          {label}
        </label>
        <span className="text-[11px] font-medium text-emerald-400">
          {localizedSelectedRegion}
        </span>
      </div>

      <button
        id={`${id}-trigger`}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-[#0B1120] px-3.5 py-2.5 text-left transition-colors hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <MapPin
              className="h-4 w-4 shrink-0 text-emerald-400"
              aria-hidden="true"
            />
            <span className="truncate text-sm font-semibold text-slate-100">
              {localizedSelectedName}
            </span>
          </div>
          <div className="mt-0.5 truncate pl-6 text-xs text-slate-400">
            {localizedSelectedRegion} {t.planner.regionWord} ·{' '}
            {localizedSelectedStation} ({localizedSelectedLine})
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={label}
          data-testid={`${id}-dropdown`}
          className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-slate-700 bg-[#0F172A] shadow-2xl shadow-black/70"
        >
          <div className="border-b border-slate-800 p-3 space-y-2.5 bg-[#0B1120]/90">
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={effectivePlaceholder}
                aria-label={label}
                className="w-full rounded-lg border border-slate-700 bg-[#0F172A] py-2 pl-9 pr-8 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-2 rounded p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label={label}
              className="flex flex-wrap items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => setActiveRegionFilter('All')}
                data-testid={`${id}-region-tab-all`}
                className={`rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                  activeRegionFilter === 'All'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#0F172A] text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {t.planner.allRegions} ({totalCount})
              </button>
              {BENGALURU_REGIONS.map((region) => {
                const regionGroup = baseGroups.find((g) => g.region === region);
                const count = regionGroup?.localities.length ?? 0;
                const active = activeRegionFilter === region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setActiveRegionFilter(region)}
                    data-testid={`${id}-region-tab-${toSlug(region)}`}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#0F172A] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {t.planner.regions[region].name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div
            role="listbox"
            aria-label={label}
            className="max-h-80 overflow-y-auto divide-y divide-slate-800/70"
          >
            {totalMatches === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                {t.planner.noLocalitiesMatched} &ldquo;{query}&rdquo;.
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div
                  key={group.region}
                  role="group"
                  aria-label={t.planner.regions[group.region].name}
                  data-testid={`${id}-group-${toSlug(group.region)}`}
                  className="bg-[#0F172A]"
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-800/80 bg-[#0B1120]/95 px-3.5 py-2 backdrop-blur-sm">
                    <div className="min-w-0 truncate">
                      <span className="text-xs font-semibold text-emerald-400">
                        {t.planner.regions[group.region].name}
                      </span>
                      <span className="ml-1.5 text-[11px] text-slate-400">
                        · {t.planner.regions[group.region].description}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">
                      {group.localities.length} {t.planner.areasWord}
                    </span>
                  </div>

                  <div className="py-1">
                    {group.localities.map((loc) => {
                      const isSelected = loc.id === selectedLocality.id;
                      const micro = getLocalityMicroWeather(loc, weatherCondition);
                      const locName = localizeBengaluruPlaceName(
                        loc.name,
                        language
                      );
                      const stationName = localizeBengaluruPlaceName(
                        loc.nearestMetro.station,
                        language
                      );
                      const lineName = localizeMetroLineName(
                        loc.nearestMetro.line,
                        language
                      );
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onSelect(loc);
                            setIsOpen(false);
                            setQuery('');
                          }}
                          className={`flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left transition-colors ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'text-slate-200 hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {locName}
                            </div>
                            <div className="truncate text-xs text-slate-400">
                              {stationName} ({lineName}) ·{' '}
                              <span className="font-mono tabular-nums">
                                {micro.temperatureC}°C · {t.weather.rainPctLabel}{' '}
                                {micro.rainProbabilityPct}% · {t.weather.grip}{' '}
                                {micro.roadGripFactor.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-xs text-slate-400 shrink-0 tabular-nums">
                            {loc.nearestMetro.distanceKm} km
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
