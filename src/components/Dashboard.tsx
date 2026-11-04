import React from 'react';
import {
  BookOpenCheck,
  Calculator,
  CalendarClock,
  FileText,
  Scale,
  TrendingUp,
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Printer,
  Database,
  Users,
  Clock,
  GraduationCap,
} from 'lucide-react';
import {
  TeacherProfile,
  SectionId,
  LessonPlanItem,
  StudentRecord,
  TimetableSlot,
  CoordinationItem,
  EducationalStage,
} from '../types';
import { STAGES_METADATA } from '../data';

interface DashboardProps {
  profile: TeacherProfile;
  onNavigate: (section: SectionId) => void;
  onSwitchStage: (stage: EducationalStage) => void;
  lessonPlans: LessonPlanItem[];
  students: StudentRecord[];
  timetable: TimetableSlot[];
  coordinationItems: CoordinationItem[];
  onOpenDocumentGenerator: (docId: string) => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  onNavigate,
  onSwitchStage,
  lessonPlans,
  students,
  timetable,
  coordinationItems,
  onOpenDocumentGenerator,
  onOpenSettings,
}) => {
  const stageMeta = STAGES_METADATA[profile.stage];
  const stageLessons = lessonPlans.filter((l) => l.stage === profile.stage);
  const completedLessons = stageLessons.filter((l) => l.status === 'completed').length;
  const stageStudents = students.filter((s) => s.stage === profile.stage);

  // Calculate average for stage students
  const calcStudentAverage = (s: StudentRecord) => {
    if (s.stage === 'primary') {
      return (s.continuousAssessment + s.exam) / 2;
    }
    if (s.stage === 'middle') {
      const ccAndTest = (s.continuousAssessment + s.test1) / 2;
      return (ccAndTest + s.exam * 2) / 3;
    }
    // secondary
    const ccTests = (s.continuousAssessment + s.test1 + s.test2) / 3;
    return (ccTests + s.exam * 2) / 3;
  };

  const averages = stageStudents.map(calcStudentAverage);
  const overallAvg =
    averages.length > 0 ? (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2) : '0.00';
  const passCount = averages.filter((avg) => avg >= 10).length;
  const passRate = averages.length > 0 ? Math.round((passCount / averages.length) * 100) : 0;
  const remediationStudents = stageStudents.filter((s) => s.remediationNeeded || calcStudentAverage(s) < 10);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-l from-[#0d3320] via-[#092316] to-[#06160e] border border-[#d4af37]/40 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#f5d77f] font-bold">
              <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
              <span>·</span>
              <span>وزارة التربية الوطنية</span>
              <span>·</span>
              <span>النقابة الوطنية لعمال التربية SNTE 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              الفضاء البيداغوجي والتشريعي الموحد لأساتذة الأطوار التعليمية الثلاثة
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              مرحباً بك <span className="text-[#f5d77f] font-bold">{profile.fullName}</span> ({profile.rank}) بـ{' '}
              <span className="text-emerald-300 font-semibold">{profile.schoolName}</span>. تجمع هذه المنصة كافة
              الأدوات اليومية للأستاذ في <span className="text-white font-bold">الابتدائي، المتوسط، والثانوي</span>:
              التدرجات السنوية، المذكرات التربوية، دفتر التنقيط الآلي، الحقيبة الوثائقية للطباعة، ومحاكاة الرتب الجديدة
              وفق المرسوم التنفيذي 25-54.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => onNavigate('analytics')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs sm:text-sm shadow-lg hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>لوحة تحكم الأداء التربوي (Recharts)</span>
              </button>
              <button
                onClick={() => onNavigate('timetable')}
                className="px-4 py-2.5 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/60 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <CalendarClock className="w-4 h-4" />
                <span>التواقيت التفاعلية الذكية</span>
              </button>
              <button
                onClick={() => onNavigate('resources')}
                className="px-4 py-2.5 rounded-xl bg-[#0c2d1d] hover:bg-[#123d28] text-emerald-300 border border-emerald-500/40 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpenCheck className="w-4 h-4" />
                <span>مكتبة الموارد التشاركية (أنشطة 2026)</span>
              </button>
              <button
                onClick={onOpenSettings}
                className="px-3.5 py-2.5 rounded-xl bg-[#05140d] hover:bg-[#0a2317] text-[#f5d77f] border border-[#d4af37]/50 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-[#d4af37]" />
                <span>تحميل أيقونة التوثيق والبرنامج الخاص بالمؤسسة</span>
              </button>
            </div>
          </div>

          {/* Active Stage Summary Box */}
          <div className="w-full lg:w-80 bg-[#05140d]/90 border border-[#d4af37]/40 rounded-xl p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2.5">
              <span className="text-xs font-bold text-[#f5d77f]">{stageMeta.title}</span>
              <span className="text-[11px] text-emerald-300 font-mono tabular-nums">
                {profile.schoolYear} · ف{profile.currentTerm}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">مادة التدريس:</span>
                <span className="text-white font-bold truncate max-w-[180px]">{profile.subject}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">النصاب القانوني:</span>
                <span className="text-[#f5d77f] font-bold tabular-nums">{profile.weeklyQuotaHours} ساعة / أسبوع</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الأفواج المسندة:</span>
                <span className="text-emerald-300 font-bold tabular-nums">{profile.assignedClasses.length} أفواج</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الصفة التنسيقية:</span>
                <span className="text-slate-200 font-semibold">
                  {profile.isHeadTeacher ? 'أستاذ رئيسي / منسق مادة' : 'أستاذ المادة'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Pedagogical Metrics Strip (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('planning')}
          className="bg-[#092015] border border-[#d4af37]/30 hover:border-[#d4af37] rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>تنفيذ التدرج السنوي والمذكرات</span>
            <BookOpenCheck className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {completedLessons} / {stageLessons.length} <span className="text-xs font-normal text-emerald-300">وحدات منجزة</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1.5">
            الدفتر اليومي وكراس النصوص مطابق للوتيرة الرسمية
          </div>
        </div>

        <div
          onClick={() => onNavigate('gradebook')}
          className="bg-[#092015] border border-[#d4af37]/30 hover:border-[#d4af37] rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>المعدل الفصلي للأفواج المسندة</span>
            <Calculator className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-[#f5d77f] tabular-nums">
            {overallAvg} <span className="text-xs font-normal text-slate-300">/ 20 ({passRate}% نسبة التحكم)</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1.5">
            حساب آلي وفق معادلة {stageMeta.shortTitle}
          </div>
        </div>

        <div
          onClick={() => onNavigate('gradebook')}
          className="bg-[#092015] border border-[#d4af37]/30 hover:border-[#d4af37] rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>فوج المعالجة البيداغوجية والدعم</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {remediationStudents.length} <span className="text-xs font-normal text-amber-300">تلاميذ معنيون بالمعالجة</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1.5">
            تشخيص فوري للصعوبات وبطاقة متابعة قابلة للطباعة
          </div>
        </div>

        <div
          onClick={() => onNavigate('career')}
          className="bg-[#092015] border border-[#d4af37]/30 hover:border-[#d4af37] rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>التصنيف والدرجة الاستدلالية 2026</span>
            <TrendingUp className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-black text-emerald-300 tabular-nums">
            الدرجة {profile.echelon}{' '}
            <span className="text-xs font-normal text-slate-300">({profile.yearsOfService} سنة أقدمية)</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1.5">
            محاكاة الترقية لرتبة أستاذ قسم ثانٍ وأستاذ مميز 25-54
          </div>
        </div>
      </div>

      {/* Three Educational Stages Interactive Cards */}
      <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#d4af37]/20 mb-5">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#d4af37]" />
              <span>الأطوار التعليمية الثلاثة · الخصوصيات البيداغوجية والتنظيمية (2026)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              اختر أي طور تعليمي لتكييف المنصة فوراً مع مناهجه، معادلات التقويم، النصاب الساعي، ورتب الترقية الخاصة به
            </p>
          </div>
          <button
            onClick={() => onNavigate('stages')}
            className="text-xs font-bold text-[#f5d77f] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>المقارنة التفصيلية للأطوار الثلاثة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {(['primary', 'middle', 'secondary'] as EducationalStage[]).map((stKey) => {
            const meta = STAGES_METADATA[stKey];
            const isSelected = profile.stage === stKey;
            return (
              <div
                key={stKey}
                className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0d2e1e] border-[#d4af37] shadow-lg'
                    : 'bg-[#05140d] border-[#d4af37]/25 hover:border-[#d4af37]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#d4af37]" />
                      <span>{meta.title}</span>
                    </h4>
                    {isSelected && (
                      <span className="text-xs font-bold text-[#f5d77f]">· الطور النشط</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-300 space-y-2 mb-4">
                    <div className="flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">النصاب الأسبوعي:</strong> {meta.weeklyHours}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">سلم الرتب (25-54):</strong> الأصناف من{' '}
                        <span className="tabular-nums font-bold text-[#f5d77f]">
                          {meta.baseRanks[0].category2026}
                        </span>{' '}
                        إلى{' '}
                        <span className="tabular-nums font-bold text-[#f5d77f]">
                          {meta.baseRanks[meta.baseRanks.length - 1].category2026}
                        </span>{' '}
                        (أستاذ مميز)
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#d4af37]/15 pt-3 space-y-1.5 mb-4">
                    <div className="text-[11px] font-bold text-[#e5c158]">أبرز المهام والوثائق في هذا الطور:</div>
                    {meta.pedagogicalHighlights.slice(0, 3).map((hl, i) => (
                      <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-[#d4af37] font-bold">·</span>
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSwitchStage(stKey)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#d4af37] text-[#06150e]'
                      : 'bg-[#0b2719] text-[#f5d77f] hover:bg-[#123c27] border border-[#d4af37]/40'
                  }`}
                >
                  {isSelected ? 'الطور المفعل حالياً في المنصة' : `التبديل إلى ${meta.shortTitle}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Split: Quick Official Documents + Teacher Priority Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Official Printable Documents */}
        <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/20 mb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#d4af37]" />
              <span>الوثائق البيداغوجية والإدارية السريعة للأستاذ</span>
            </h3>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs text-[#f5d77f] hover:underline font-bold cursor-pointer"
            >
              عرض كل النماذج (6)
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              {
                id: 'doc-lesson-fiche',
                title: 'بطاقة مذكرة تربوية نموذجية وفق المقاربة بالكفاءات',
                code: 'نموذج بيداغوجي / م.ت.02',
              },
              {
                id: 'doc-head-teacher-report',
                title: 'تقرير الأستاذ الرئيسي للقسم لمجلس القسم الفصلي',
                code: 'نموذج مجالس / م.ق.03',
              },
              {
                id: 'doc-remediation-sheet',
                title: 'بطاقة متابعة حصة المعالجة البيداغوجية والدعم المستمر',
                code: 'نموذج معالجة / م.ب.04',
              },
              {
                id: 'doc-inspection-readiness',
                title: 'حافظة الوثائق الرسمية للزيارة التفتيشية والتثبيت',
                code: 'نموذج تفتيش / ت.ب.05',
              },
            ].map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all"
              >
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">{doc.title}</div>
                  <div className="text-[11px] text-slate-400">{doc.code} · جاهز للتعبئة والطباعة الرسمية</div>
                </div>
                <button
                  onClick={() => onOpenDocumentGenerator(doc.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] text-xs font-bold border border-[#d4af37]/40 cursor-pointer shrink-0"
                >
                  تحرير وطباعة
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Priority Agenda & Coordination */}
        <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/20 mb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#d4af37]" />
              <span>مفكرة الأستاذ ومواعيد التنسيق وحجز النقاط</span>
            </h3>
            <button
              onClick={() => onNavigate('coordination')}
              className="text-xs text-[#f5d77f] hover:underline font-bold cursor-pointer"
            >
              إدارة المفكرة والتنسيق
            </button>
          </div>
          <div className="space-y-2.5">
            {coordinationItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        item.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{item.notes}</p>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-[11px] font-mono text-[#f5d77f] tabular-nums">{item.date}</div>
                  <div className="text-[10px] text-slate-400 tabular-nums">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
