import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Award,
  AlertTriangle,
  Users,
  Printer,
  Filter,
  Calculator,
  CheckCircle2,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { EducationalStage, StudentRecord, TeacherProfile, SectionId } from '../types';
import { STAGES_METADATA } from '../data';

interface PerformanceAnalyticsProps {
  profile: TeacherProfile;
  students: StudentRecord[];
  onUpdateStudents: (updated: StudentRecord[]) => void;
  onNavigate?: (section: SectionId) => void;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  profile,
  students,
  onUpdateStudents,
  onNavigate,
}) => {
  const [selectedStage, setSelectedStage] = useState<EducationalStage>(profile.stage);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  // Compute official term average according to stage formula
  const calcCurrentTermAvg = (s: StudentRecord): number => {
    if (s.stage === 'primary') {
      return Number(((s.continuousAssessment + s.exam) / 2).toFixed(2));
    }
    if (s.stage === 'middle') {
      const avgTests = (s.test1 + s.test2) / 2;
      return Number(((s.continuousAssessment + avgTests + s.exam * 2) / 4).toFixed(2));
    }
    const avgTests = (s.test1 + s.test2) / 2;
    return Number((((s.continuousAssessment + avgTests) / 2 + s.exam * 2) / 3).toFixed(2));
  };

  const stageStudents = useMemo(
    () => students.filter((s) => s.stage === selectedStage),
    [students, selectedStage]
  );

  const availableClasses = useMemo(
    () => Array.from(new Set(stageStudents.map((s) => s.className))),
    [stageStudents]
  );

  const filteredStudents = useMemo(() => {
    if (selectedClassFilter === 'all') return stageStudents;
    return stageStudents.filter((s) => s.className === selectedClassFilter);
  }, [stageStudents, selectedClassFilter]);

  // Enrich students with computed averages for Term 1, Term 2, Term 3
  const enrichedStudents = useMemo(() => {
    return filteredStudents.map((s) => {
      const calculatedT2 = calcCurrentTermAvg(s);
      const t1 = s.term1Avg !== undefined ? s.term1Avg : Number(Math.max(5, calculatedT2 - 0.85).toFixed(2));
      const t2 = s.term2Avg !== undefined ? s.term2Avg : calculatedT2;
      const t3 = s.term3Avg !== undefined ? s.term3Avg : Number(Math.min(20, t2 + 0.75).toFixed(2));
      const annualAvg = Number(((t1 + t2 + t3) / 3).toFixed(2));
      return {
        ...s,
        computedT1: t1,
        computedT2: t2,
        computedT3: t3,
        annualAvg,
      };
    });
  }, [filteredStudents]);

  // 1. Grade Distribution Data (توزيع العلامات حسب الفئات)
  const gradeDistributionData = useMemo(() => {
    const brackets = [
      { range: 'أقل من 08', label: 'تعثر حاد (<8)', min: 0, max: 7.99 },
      { range: '08 - 09.99', label: 'معالجة (8-9.99)', min: 8, max: 9.99 },
      { range: '10 - 11.99', label: 'مقبول (10-11.99)', min: 10, max: 11.99 },
      { range: '12 - 13.99', label: 'ق.جيد (12-13.99)', min: 12, max: 13.99 },
      { range: '14 - 15.99', label: 'جيد (14-15.99)', min: 14, max: 15.99 },
      { range: '16 - 20', label: 'امتياز (16-20)', min: 16, max: 20 },
    ];

    return brackets.map((b) => {
      const diagCount = enrichedStudents.filter(
        (s) => s.diagnosticScore >= b.min && s.diagnosticScore <= b.max
      ).length;
      const t1Count = enrichedStudents.filter(
        (s) => s.computedT1 >= b.min && s.computedT1 <= b.max
      ).length;
      const t2Count = enrichedStudents.filter(
        (s) => s.computedT2 >= b.min && s.computedT2 <= b.max
      ).length;
      const t3Count = enrichedStudents.filter(
        (s) => s.computedT3 >= b.min && s.computedT3 <= b.max
      ).length;

      return {
        name: b.label,
        range: b.range,
        'التقويم التشخيصي': diagCount,
        'الفصل الأول': t1Count,
        'الفصل الثاني': t2Count,
        'الفصل الثالث': t3Count,
      };
    });
  }, [enrichedStudents]);

  // 2. Term Progression Data (تقدم مستوى الطلاب خلال الفصول الثلاثة)
  const termProgressionData = useMemo(() => {
    if (enrichedStudents.length === 0) return [];

    const targetList =
      selectedStudentId === 'all'
        ? enrichedStudents
        : enrichedStudents.filter((s) => s.id === selectedStudentId);

    const list = targetList.length > 0 ? targetList : enrichedStudents;

    const avgDiag = Number(
      (list.reduce((acc, s) => acc + s.diagnosticScore, 0) / list.length).toFixed(2)
    );
    const avgT1 = Number(
      (list.reduce((acc, s) => acc + s.computedT1, 0) / list.length).toFixed(2)
    );
    const avgT2 = Number(
      (list.reduce((acc, s) => acc + s.computedT2, 0) / list.length).toFixed(2)
    );
    const avgT3 = Number(
      (list.reduce((acc, s) => acc + s.computedT3, 0) / list.length).toFixed(2)
    );

    const passDiag = Math.round(
      (list.filter((s) => s.diagnosticScore >= 10).length / list.length) * 100
    );
    const passT1 = Math.round((list.filter((s) => s.computedT1 >= 10).length / list.length) * 100);
    const passT2 = Math.round((list.filter((s) => s.computedT2 >= 10).length / list.length) * 100);
    const passT3 = Math.round((list.filter((s) => s.computedT3 >= 10).length / list.length) * 100);

    return [
      {
        term: 'التقويم التشخيصي',
        'المعدل العام (/20)': avgDiag,
        'نسبة التحكم والنجاح (%)': passDiag,
        'عتبة التحكم (10/20)': 10,
      },
      {
        term: 'الفصل الأول',
        'المعدل العام (/20)': avgT1,
        'نسبة التحكم والنجاح (%)': passT1,
        'عتبة التحكم (10/20)': 10,
      },
      {
        term: 'الفصل الثاني',
        'المعدل العام (/20)': avgT2,
        'نسبة التحكم والنجاح (%)': passT2,
        'عتبة التحكم (10/20)': 10,
      },
      {
        term: 'الفصل الثالث',
        'المعدل العام (/20)': avgT3,
        'نسبة التحكم والنجاح (%)': passT3,
        'عتبة التحكم (10/20)': 10,
      },
    ];
  }, [enrichedStudents, selectedStudentId]);

  // 3. Individual Students Multi-Term Comparison Bar/Line Data
  const studentsComparisonData = useMemo(() => {
    return enrichedStudents.map((s) => ({
      name: s.fullName.split(' ').slice(0, 2).join(' '),
      fullName: s.fullName,
      'التشخيصي': s.diagnosticScore,
      'الفصل 1': s.computedT1,
      'الفصل 2': s.computedT2,
      'الفصل 3': s.computedT3,
      'المعدل السنوي': s.annualAvg,
    }));
  }, [enrichedStudents]);

  // 4. Appreciation Pie Chart Data (توزيع التقديرات البيداغوجية)
  const appreciationPieData = useMemo(() => {
    const excellence = enrichedStudents.filter((s) => s.computedT2 >= 16).length;
    const honor = enrichedStudents.filter((s) => s.computedT2 >= 14 && s.computedT2 < 16).length;
    const encouragement = enrichedStudents.filter(
      (s) => s.computedT2 >= 12 && s.computedT2 < 14
    ).length;
    const acceptable = enrichedStudents.filter(
      (s) => s.computedT2 >= 10 && s.computedT2 < 12
    ).length;
    const remediation = enrichedStudents.filter((s) => s.computedT2 < 10).length;

    return [
      { name: 'امتياز وتهنئة (≥16)', value: excellence, color: '#10b981' },
      { name: 'لوحة شرف (14-15.99)', value: honor, color: '#d4af37' },
      { name: 'تشجيع (12-13.99)', value: encouragement, color: '#3b82f6' },
      { name: 'تحكم مقبول (10-11.99)', value: acceptable, color: '#f59e0b' },
      { name: 'معالجة بيداغوجية (<10)', value: remediation, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  }, [enrichedStudents]);

  // 5. Radar Chart: Evaluation Components Balance
  const radarComponentsData = useMemo(() => {
    if (enrichedStudents.length === 0) return [];
    const avg = (fn: (s: (typeof enrichedStudents)[0]) => number) =>
      Number(
        (enrichedStudents.reduce((acc, s) => acc + fn(s), 0) / enrichedStudents.length).toFixed(2)
      );

    return [
      { subject: 'التشخيصي', 'الفوج الحالي': avg((s) => s.diagnosticScore), 'المعيار الوطني': 12.5 },
      { subject: 'التقويم المستمر', 'الفوج الحالي': avg((s) => s.continuousAssessment), 'المعيار الوطني': 14.0 },
      { subject: 'الفرض الأول', 'الفوج الحالي': avg((s) => s.test1), 'المعيار الوطني': 13.0 },
      { subject: 'الفرض الثاني', 'الفوج الحالي': avg((s) => s.test2), 'المعيار الوطني': 13.5 },
      { subject: 'الاختبار الفصلي', 'الفوج الحالي': avg((s) => s.exam), 'المعيار الوطني': 13.0 },
      { subject: 'المعدل السنوي', 'الفوج الحالي': avg((s) => s.annualAvg), 'المعيار الوطني': 13.5 },
    ];
  }, [enrichedStudents]);

  const handleUpdateTermAvg = (
    id: string,
    field: 'term1Avg' | 'term2Avg' | 'term3Avg',
    val: number
  ) => {
    const clamped = Math.max(0, Math.min(20, Number.isNaN(val) ? 0 : val));
    onUpdateStudents(
      students.map((st) => (st.id === id ? { ...st, [field]: clamped } : st))
    );
  };

  // Summary KPIs
  const totalStudents = enrichedStudents.length;
  const overallT1 =
    totalStudents > 0
      ? (enrichedStudents.reduce((a, b) => a + b.computedT1, 0) / totalStudents).toFixed(2)
      : '0.00';
  const overallT2 =
    totalStudents > 0
      ? (enrichedStudents.reduce((a, b) => a + b.computedT2, 0) / totalStudents).toFixed(2)
      : '0.00';
  const overallT3 =
    totalStudents > 0
      ? (enrichedStudents.reduce((a, b) => a + b.computedT3, 0) / totalStudents).toFixed(2)
      : '0.00';
  const growthDelta = (Number(overallT3) - Number(overallT1)).toFixed(2);
  const successRate =
    totalStudents > 0
      ? Math.round(
          (enrichedStudents.filter((s) => s.annualAvg >= 10).length / totalStudents) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Official Print Header */}
      <div className="hidden print:block text-black border-b-2 border-black pb-4 mb-6">
        <div className="text-center font-bold text-sm">
          الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <div>
            <div>{profile.wilaya}</div>
            <div>المؤسسة: {profile.schoolName}</div>
            {profile.institutionProgramTitle && (
              <div>المرجع البيداغوجي: {profile.institutionProgramTitle}</div>
            )}
          </div>
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt="شعار المؤسسة"
              className="w-16 h-16 object-contain border border-black p-1 rounded"
            />
          )}
          <div className="text-left">
            <div>الأستاذ(ة): {profile.fullName}</div>
            <div>المادة: {profile.subject} — السنة الدراسية: {profile.schoolYear}</div>
          </div>
        </div>
        <h2 className="text-center font-extrabold text-base mt-3 underline">
          التقرير الإحصائي والبياني لتحليل الأداء التربوي وتطور نتائج التلاميذ عبر الفصول الثلاثة
        </h2>
      </div>

      {/* Top Banner & Filters */}
      <div className="bg-gradient-to-l from-[#0c2d1d] via-[#092216] to-[#06160f] border border-[#d4af37]/40 rounded-2xl p-6 shadow-xl no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#105e32]/50 border border-[#d4af37]/40 text-xs font-bold text-[#f5d77f] mb-2">
              <BarChart3 className="w-4 h-4" />
              <span>لوحة تحكم الأداء التربوي والتحليل الإحصائي (Recharts Analytics)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              تحليل نتائج التلاميذ: توزيع العلامات وتقدم المستوى خلال الفصول الثلاثة
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              مؤشرات بيداغوجية تفاعلية مرتبطة مباشرة بقسم التقييم التربوي لإعداد الحصيلة الإحصائية لمجالس الأقسام ومجالس التعليم
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('gradebook')}
                className="px-3.5 py-2.5 rounded-xl bg-[#05140d] hover:bg-[#0d281a] text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>العودة إلى دفتر التنقيط والتقييم</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير التحليلي والمنحنيات (A4)</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Stage + Class + Individual Student */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#d4af37]/20">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>تصفية حسب الطور التعليمي:</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['primary', 'middle', 'secondary'] as EducationalStage[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStage(st);
                    setSelectedClassFilter('all');
                    setSelectedStudentId('all');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    selectedStage === st
                      ? 'bg-[#105e32] text-[#f5d77f] border-[#d4af37]'
                      : 'bg-[#05140d] text-slate-300 border-[#d4af37]/20 hover:text-white'
                  }`}
                >
                  {STAGES_METADATA[st].shortTitle}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>تصفية حسب الفوج التربوي:</span>
            </label>
            <select
              value={selectedClassFilter}
              onChange={(e) => {
                setSelectedClassFilter(e.target.value);
                setSelectedStudentId('all');
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-xs text-white font-bold focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">جميع الأفواج المسندة ({stageStudents.length} تلميذ)</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  الفوج التربوي: {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>تحليل مسار تلميذ محدد أو القسم كاملاً:</span>
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-xs text-white font-bold focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">منحنى المعدل العام للقسم كاملاً</option>
              {enrichedStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  مسار التلميذ(ة): {st.fullName} ({st.className})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-xl p-4">
          <div className="text-xs text-slate-400">معدل الفصل الأول</div>
          <div className="text-2xl font-black text-white tabular-nums mt-1">{overallT1} / 20</div>
          <div className="text-[11px] text-slate-400 mt-1">الانطلاق البيداغوجي</div>
        </div>
        <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-xl p-4">
          <div className="text-xs text-slate-400">معدل الفصل الثاني</div>
          <div className="text-2xl font-black text-[#f5d77f] tabular-nums mt-1">{overallT2} / 20</div>
          <div className="text-[11px] text-emerald-300 mt-1">منتصف الموسم الدراسي</div>
        </div>
        <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-xl p-4">
          <div className="text-xs text-slate-400">معدل الفصل الثالث</div>
          <div className="text-2xl font-black text-emerald-400 tabular-nums mt-1">{overallT3} / 20</div>
          <div className="text-[11px] text-emerald-300 mt-1">الحصيلة الختامية</div>
        </div>
        <div className="bg-[#081c12] border border-emerald-500/30 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>مؤشر التقدم السنوي</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tabular-nums mt-1">
            {Number(growthDelta) >= 0 ? `+${growthDelta}` : growthDelta} نقطة
          </div>
          <div className="text-[11px] text-slate-300 mt-1">بين الفصل 1 والفصل 3</div>
        </div>
        <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-xl p-4 col-span-2 lg:col-span-1">
          <div className="text-xs text-slate-400">نسبة النجاح والتحكم (≥10)</div>
          <div className="text-2xl font-black text-[#f5d77f] tabular-nums mt-1">{successRate}%</div>
          <div className="text-[11px] text-slate-300 mt-1">
            من إجمالي {totalStudents} تلميذاً مسجلاً
          </div>
        </div>
      </div>

      {/* Main Charts Row 1: Grade Distribution (BarChart) & 3-Term Progression (Area/LineChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Grade Distribution across Brackets */}
        <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d4af37]/20">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#d4af37]" />
                <span>توزيع العلامات حسب الفئات خلال الفصول الثلاثة</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مقارنة عدد التلاميذ في كل فئة علامات من التقويم التشخيصي إلى الفصل الثالث
              </p>
            </div>
          </div>

          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gradeDistributionData}
                margin={{ top: 10, right: 15, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2b" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 700 }}
                  angle={-12}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                  label={{
                    value: 'عدد التلاميذ',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#f5d77f',
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#05140d',
                    borderColor: '#d4af37',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    textAlign: 'right',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="التقويم التشخيصي" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="الفصل الأول" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="الفصل الثاني" fill="#d4af37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="الفصل الثالث" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Student Level Progression Across the 3 Terms */}
        <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d4af37]/20">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>
                  منحنى تقدم مستوى الطلاب خلال الفصول الثلاثة
                  {selectedStudentId !== 'all' &&
                    ` (${
                      enrichedStudents.find((s) => s.id === selectedStudentId)?.fullName || ''
                    })`}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                رصد تطور المعدل العام (/20) ونسبة التحكم البيداغوجي من التشخيصي إلى نهاية السنة
              </p>
            </div>
          </div>

          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={termProgressionData}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2b" />
                <XAxis
                  dataKey="term"
                  tick={{ fill: '#f5d77f', fontSize: 11, fontWeight: 700 }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 20]}
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fill: '#10b981', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#05140d',
                    borderColor: '#d4af37',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="المعدل العام (/20)"
                  stroke="#d4af37"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAvg)"
                />
                <Line
                  yAxisId="left"
                  type="dashed"
                  dataKey="عتبة التحكم (10/20)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="نسبة التحكم والنجاح (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPass)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Individual Student Trajectories (LineChart) + Appreciation Pie + Competency Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Per-Student Multi-Term LineChart */}
        <div className="lg:col-span-2 bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d4af37]/20">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d4af37]" />
                <span>مقارنة تقدم كل تلميذ عبر الفصول الثلاثة (ف1 · ف2 · ف3)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تحليل الفروق الفردية وأثر حصص المعالجة البيداغوجية في رفع معدلات التلاميذ
              </p>
            </div>
          </div>

          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={studentsComparisonData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2b" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 700 }}
                />
                <YAxis domain={[0, 20]} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#05140d',
                    borderColor: '#d4af37',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="التشخيصي"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="الفصل 1"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="الفصل 2"
                  stroke="#d4af37"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="الفصل 3"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Appreciation & Honor Roll Distribution (PieChart + Radar toggle) */}
        <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#d4af37]/20 mb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#d4af37]" />
                <span>تقديرات مجلس القسم وتوازن التقويم</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                توزيع الإجازات (امتياز، شرف، تشجيع، معالجة)
              </p>
            </div>

            <div className="h-44 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appreciationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {appreciationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#05140d',
                      borderColor: '#d4af37',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-2">
              {appreciationPieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs px-2.5 py-1 rounded-lg bg-[#05140d] border border-[#d4af37]/15"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-200 font-semibold">{item.name}</span>
                  </div>
                  <span className="font-black text-white tabular-nums">{item.value} تلميذ</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Radar for Assessment Balance */}
          <div className="mt-4 pt-3 border-t border-[#d4af37]/20">
            <div className="text-[11px] font-bold text-[#f5d77f] mb-1 text-center">
              توازن محطات التقييم مقارنة بالمعيار الوطني
            </div>
            <div className="h-40 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarComponentsData}>
                  <PolarGrid stroke="#1e3a2b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} tick={false} axisLine={false} />
                  <Radar
                    name="الفوج الحالي"
                    dataKey="الفوج الحالي"
                    stroke="#d4af37"
                    fill="#d4af37"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="المعيار الوطني"
                    dataKey="المعيار الوطني"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#05140d',
                      borderColor: '#d4af37',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Table: Edit/Simulate Three-Term Grades & Observe Live Chart Updates */}
      <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#d4af37]/20">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>جدول تتبع ومحاكاة معدلات الفصول الثلاثة والقرار البيداغوجي السنوي</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              يمكنك تعديل معدلات الفصل الأول، الفصل الثاني، أو الفصل الثالث مباشرة في الجدول لتحديث الرسوم البيانية أعلاه فورياً
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#05140d] text-[#f5d77f] border-b border-[#d4af37]/30">
                <th className="py-3 px-3 font-bold">#</th>
                <th className="py-3 px-3 font-bold">اللقب والاسم</th>
                <th className="py-3 px-3 font-bold">الفوج</th>
                <th className="py-3 px-3 font-bold text-center">التقويم التشخيصي</th>
                <th className="py-3 px-3 font-bold text-center">معدل الفصل 1</th>
                <th className="py-3 px-3 font-bold text-center">معدل الفصل 2</th>
                <th className="py-3 px-3 font-bold text-center">معدل الفصل 3</th>
                <th className="py-3 px-3 font-bold text-center">المعدل السنوي</th>
                <th className="py-3 px-3 font-bold text-center">منحى التطور</th>
                <th className="py-3 px-3 font-bold">تقدير مجلس القسم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/15">
              {enrichedStudents.map((st, idx) => {
                const delta = Number((st.computedT3 - st.computedT1).toFixed(2));
                const appreciation =
                  st.annualAvg >= 16
                    ? { label: 'تهنئة وامتياز', cls: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' }
                    : st.annualAvg >= 14
                    ? { label: 'لوحة شرف', cls: 'bg-[#105e32]/60 text-[#f5d77f] border-[#d4af37]/40' }
                    : st.annualAvg >= 12
                    ? { label: 'تشجيع', cls: 'bg-sky-950/70 text-sky-300 border-sky-500/40' }
                    : st.annualAvg >= 10
                    ? { label: 'انتقال / تحكم مقبول', cls: 'bg-amber-950/60 text-amber-300 border-amber-500/40' }
                    : { label: 'معالجة بيداغوجية مكثفة', cls: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };

                return (
                  <tr key={st.id} className="hover:bg-[#0c291b]/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-400 tabular-nums">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{st.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-300">{st.className}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-300 tabular-nums">
                      {st.diagnosticScore.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        max={20}
                        value={st.computedT1}
                        onChange={(e) =>
                          handleUpdateTermAvg(st.id, 'term1Avg', parseFloat(e.target.value))
                        }
                        className="w-16 px-2 py-1 text-center rounded bg-[#05140d] border border-[#d4af37]/30 text-amber-300 font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        max={20}
                        value={st.computedT2}
                        onChange={(e) =>
                          handleUpdateTermAvg(st.id, 'term2Avg', parseFloat(e.target.value))
                        }
                        className="w-16 px-2 py-1 text-center rounded bg-[#05140d] border border-[#d4af37]/40 text-[#f5d77f] font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        max={20}
                        value={st.computedT3}
                        onChange={(e) =>
                          handleUpdateTermAvg(st.id, 'term3Avg', parseFloat(e.target.value))
                        }
                        className="w-16 px-2 py-1 text-center rounded bg-[#05140d] border border-emerald-500/40 text-emerald-300 font-bold tabular-nums"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-white tabular-nums">
                      {st.annualAvg.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold tabular-nums ${
                          delta >= 0
                            ? 'text-emerald-300 bg-emerald-950/60'
                            : 'text-rose-300 bg-rose-950/60'
                        }`}
                      >
                        {delta >= 0 ? `+${delta} ↑` : `${delta} ↓`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${appreciation.cls}`}
                      >
                        {appreciation.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
