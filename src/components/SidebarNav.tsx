import {
  BarChart3,
  CloudSun,
  LayoutDashboard,
  Map,
  Route,
  ShieldAlert,
  Siren,
  Split,
  X,
} from 'lucide-react';
import isoCityLogo from '../assets/images/iso_city_skyline_logo_1795596939717.jpg';
import isoHighwayPromo from '../assets/images/iso_smart_highway_promo_1795596940511.jpg';
import { DASHBOARD_UI } from '../i18n/dashboardTranslations';
import { useLanguage } from '../i18n/LanguageContext';
import { AppView } from '../types/traffic';
import { IsoImageCard } from './IsometricIcons3D';

interface SidebarNavProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function SidebarNav({
  activeView,
  onSelectView,
  mobileOpen,
  onCloseMobile,
}: SidebarNavProps) {
  const { language } = useLanguage();
  const copy = DASHBOARD_UI[language];

  const navItems: Array<{
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accent?: 'rose' | 'emerald' | 'blue' | 'amber';
  }> = [
    { id: 'dashboard', label: copy.sidebar.dashboard, icon: LayoutDashboard, accent: 'blue' },
    { id: 'signals', label: copy.sidebar.signals, icon: Map, accent: 'emerald' },
    { id: 'planner', label: copy.sidebar.planner, icon: Route, accent: 'blue' },
    { id: 'safety', label: copy.sidebar.safety, icon: ShieldAlert, accent: 'rose' },
    { id: 'escape', label: copy.sidebar.escape, icon: Split, accent: 'amber' },
    { id: 'weather', label: copy.sidebar.weather, icon: CloudSun, accent: 'blue' },
    { id: 'analytics', label: copy.sidebar.analytics, icon: BarChart3, accent: 'emerald' },
    { id: 'corridor', label: copy.sidebar.corridor, icon: Siren, accent: 'emerald' },
  ];

  const handleNavClick = (view: AppView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 border-r border-slate-200/90">
      <div className="space-y-5">
        {/* Top Brand Card with 3D Blue City Skyline Illustration */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left rounded-2xl p-1.5 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-w-0 flex-1"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-blue-100 bg-blue-50 shadow-sm">
              <IsoImageCard
                src={isoCityLogo}
                alt="Traffic AI 3D Bengaluru City Skyline"
                className="h-full w-full"
              />
            </div>
            <div className="min-w-0">
              <div className="font-display text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                {copy.brandTitle}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-blue-600 leading-tight truncate">
                {copy.brandTagline}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Vertical Navigation Menu */}
        <nav aria-label="Primary sections" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isRose = item.accent === 'rose';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                data-testid={`nav-tab-${item.id}`}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? isRose
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? isRose
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="leading-snug">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar Promo Card with 3D Smart Highway Illustration */}
      <div className="mt-6 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-3.5 shadow-sm">
        <div className="h-28 w-full overflow-hidden rounded-xl border border-sky-100 bg-white">
          <IsoImageCard
            src={isoHighwayPromo}
            alt="3D Isometric Bengaluru Smart Highway"
            className="h-full w-full"
          />
        </div>
        <div className="mt-3 space-y-1">
          <div className="font-display text-xs font-bold text-slate-900">
            {copy.promoTitle}
          </div>
          <p className="text-[11px] leading-snug text-slate-600">
            {copy.promoSubtitle}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block lg:w-[264px] lg:shrink-0">
        <div className="sticky top-0 h-screen overflow-y-auto">{sidebarContent}</div>
      </aside>

      {/* Mobile & Tablet Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[276px] max-w-[85vw] h-full overflow-y-auto shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
