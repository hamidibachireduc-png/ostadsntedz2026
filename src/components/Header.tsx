import React from 'react';
import {
  LayoutDashboard,
  Layers,
  BookOpenCheck,
  Calculator,
  CalendarClock,
  FileText,
  Scale,
  TrendingUp,
  Database,
  Users,
  Settings,
  Building2,
  Calendar,
  Landmark,
  GraduationCap,
  Library,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { SectionId, TeacherProfile, EducationalStage } from '../types';
import { STAGES_METADATA } from '../data';

interface HeaderProps {
  currentSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  profile: TeacherProfile;
  onSwitchStage: (stage: EducationalStage) => void;
  onOpenSettings: () => void;
  remediationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onSelectSection,
  profile,
  onSwitchStage,
  onOpenSettings,
  remediationCount,
}) => {
  const navItems: { id: SectionId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'الداشبورد البيداغوجي', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'stages', label: 'فضاء الأطوار الثلاثة', icon: <Layers className="w-4 h-4" />, badge: '3 أطوار' },
    {
      id: 'resources',
      label: 'مكتبة الموارد التشاركية',
      icon: <Library className="w-4 h-4" />,
      badge: 'أنشطة 2026',
    },
    { id: 'planning', label: 'التدرجات والمذكرات', icon: <BookOpenCheck className="w-4 h-4" /> },
    {
      id: 'gradebook',
      label: 'قسم التقييم التربوي',
      icon: <Calculator className="w-4 h-4" />,
      badge: remediationCount > 0 ? `${remediationCount} معالجة` : 'شامل',
    },
    {
      id: 'analytics',
      label: 'لوحة تحكم الأداء التربوي',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: 'Recharts',
    },
    {
      id: 'timetable',
      label: 'التواقيت التفاعلية',
      icon: <CalendarClock className="w-4 h-4" />,
      badge: 'ذكي',
    },
    {
      id: 'councils',
      label: 'قسم المجالس',
      icon: <Landmark className="w-4 h-4" />,
      badge: '5 مجالس',
    },
    {
      id: 'legislation',
      label: 'التشريع وقسم المهام',
      icon: <Scale className="w-4 h-4" />,
      badge: '25-54',
    },
    { id: 'documents', label: 'حقيبة وثائق الأستاذ', icon: <FileText className="w-4 h-4" />, badge: '+ مستند' },
    {
      id: 'backup',
      label: 'حفظ واستيراد البيانات (إكسل)',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: 'Excel',
    },
    { id: 'training', label: 'التكوين والتفتيش (كاباس)', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'career', label: 'محاكي الرتب والدرجات', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'digitalization', label: 'الربط مع الرقمنة', icon: <Database className="w-4 h-4" /> },
    { id: 'coordination', label: 'التنسيق والأولياء', icon: <Users className="w-4 h-4" /> },
  ];

  const stages: { id: EducationalStage; label: string; quota: string }[] = [
    { id: 'primary', label: 'الطور الابتدائي', quota: '22.5 سا' },
    { id: 'middle', label: 'الطور المتوسط', quota: '20 سا' },
    { id: 'secondary', label: 'الطور الثانوي', quota: '18 سا' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#081a12]/95 backdrop-blur-md border-b border-[#d4af37]/30 shadow-lg no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand + Stage Quick Switcher + Teacher Card */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 py-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSettings}
              title="انقر لتغيير أو تحميل أيقونة التوثيق والبرنامج الخاص بالمؤسسة"
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#105e32] via-[#0b3b20] to-[#061f11] border-2 border-[#d4af37] flex flex-col items-center justify-center shadow-md shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            >
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt="أيقونة التوثيق"
                  className="w-full h-full object-contain bg-[#05140d]"
                />
              ) : (
                <>
                  <span className="text-[11px] font-black tracking-wider text-[#f5d77f] leading-none">
                    SNTE
                  </span>
                  <span className="text-[9px] font-bold text-emerald-300 mt-0.5 tabular-nums">
                    2026
                  </span>
                </>
              )}
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  منصة الأستاذ الشاملة · البوابة الرقمية للأطوار الثلاثة
                </h1>
                <span className="text-xs font-semibold text-[#e5c158]">
                  · {STAGES_METADATA[profile.stage].shortTitle}
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                لوحة تحكم الأداء التربوي، التواقيت التفاعلية، الموارد التشاركية، التقييم التربوي، وحفظ البيانات Excel
              </p>
            </div>
          </div>

          {/* Center: Interactive Stage Switcher (Primary / Middle / Secondary) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#05120c] border border-[#d4af37]/30 self-stretch lg:self-auto justify-center">
            {stages.map((st) => {
              const active = profile.stage === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => onSwitchStage(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#0d281a]'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`text-[10px] tabular-nums ${
                      active ? 'text-[#06150e]/80 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    ({st.quota})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Teacher Identity & Settings Action */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto">
            <div className="hidden xl:flex flex-col items-end border-l border-[#d4af37]/20 pl-3 text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{profile.schoolName}</span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <span className="text-[#f5d77f] font-semibold">{profile.fullName}</span>
                <span>·</span>
                <span>{profile.subject}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 tabular-nums">
                <Calendar className="w-3 h-3 text-[#d4af37]" />
                <span>
                  السنة: {profile.schoolYear} · الفصل {profile.currentTerm} · الدرجة {profile.echelon}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="px-3 py-2 text-xs font-bold bg-[#0c2a1c] text-[#f5d77f] hover:text-white hover:bg-[#123826] border border-[#d4af37]/50 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              title="تخصيص البطاقة المهنية وتحميل أيقونة التوثيق والبرنامج الخاص بالمؤسسة"
            >
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span>التوثيق وبرنامج المؤسسة</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-[#d4af37]/15 text-xs sm:text-sm font-semibold">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#105e32] via-[#0d4a27] to-[#0a351c] text-[#f5d77f] font-bold border border-[#d4af37]/60 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-[#0c281b]/70 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-[#f5d77f]' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums ${
                      item.id === 'gradebook' && remediationCount > 0
                        ? 'bg-[#8f1414] text-white'
                        : isActive
                        ? 'bg-[#d4af37]/25 text-[#f5d77f]'
                        : 'bg-[#05140d] text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
