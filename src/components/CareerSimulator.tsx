import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Calculator,
  Clock,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Coins,
  UserCheck,
  Printer,
  Sparkles,
  FileText,
  Scale,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { TeacherProfile, EducationalStage } from '../types';
import { RANK_GRID_2026, STAGES_METADATA } from '../data';

interface CareerSimulatorProps {
  profile: TeacherProfile;
}

type SimulatorTab = 'salary_25_55' | 'seniority_combination_2026' | 'retirement_57' | 'privileges_guide';

export const CareerSimulator: React.FC<CareerSimulatorProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('seniority_combination_2026');
  const [selectedStage, setSelectedStage] = useState<EducationalStage>(profile.stage);
  const stageRanks = RANK_GRID_2026.filter((r) => r.stage === selectedStage);

  // ================= 1. Salary & Allowances State (Decrees 25-54 & 25-55) =================
  const [selectedRankIdx, setSelectedRankIdx] = useState<number>(1);
  const [selectedEchelon, setSelectedEchelon] = useState<number>(profile.echelon || 7);
  const [inspectorMark, setInspectorMark] = useState<number>(18.5);
  const [adminMark, setAdminMark] = useState<number>(19.5);
  const [yearsInCurrentEchelon, setYearsInCurrentEchelon] = useState<number>(2);
  const [isSouthZone, setIsSouthZone] = useState<boolean>(false);
  const [isCoordinatorOrHead, setIsCoordinatorOrHead] = useState<boolean>(profile.isHeadTeacher);
  const [hasHousingAllowance, setHasHousingAllowance] = useState<boolean>(true);
  const [childrenCountSalary, setChildrenCountSalary] = useState<number>(2);

  // ================= 2. Seniority & 5-Year Rank Combination State (2026-2030) =================
  const [firstHireYear, setFirstHireYear] = useState<number>(2016);
  const [firstHireMonth, setFirstHireMonth] = useState<number>(9);
  const [prevRankYears, setPrevRankYears] = useState<number>(3);
  const [prevRankMonths, setPrevRankMonths] = useState<number>(6);
  const [currRankYears, setCurrRankYears] = useState<number>(2);
  const [currRankMonths, setCurrRankMonths] = useState<number>(0);
  const [contractMonthsValidated, setContractMonthsValidated] = useState<number>(12); // خبرة الاستخلاف/التعاقد المعتمدة
  const [applyRankCombination2026, setApplyRankCombination2026] = useState<boolean>(true);

  // ================= 3. Retirement Privilege 57 Years State (Decree 25-54) =================
  const [birthYear, setBirthYear] = useState<number>(1978);
  const [teacherGender, setTeacherGender] = useState<'male' | 'female'>('male');
  const [maternityChildrenCount, setMaternityChildrenCount] = useState<number>(2);
  const [southServiceYears, setSouthServiceYears] = useState<number>(0);

  // ================= Salary Calculations (Decree 25-54 & 25-55) =================
  const currentRank = stageRanks[selectedRankIdx] || stageRanks[0];
  const echelonIndexPoints = currentRank.echelonIndices[selectedEchelon - 1] || 0;
  const coordinatorBonusPoints = isCoordinatorOrHead ? 75 : 0;
  const totalIndexPoints = currentRank.baseIndex + echelonIndexPoints + coordinatorBonusPoints;

  const pointValueDZD = 45;
  const baseSalary = currentRank.baseIndex * pointValueDZD; // الراتب الرئيسي القاعدي
  const iepAllowance = echelonIndexPoints * pointValueDZD; // تعويض الخبرة المهنية (IEP)
  const principalSalary = baseSalary + iepAllowance; // الراتب الرئيسي + الخبرة المهنية

  // Detailed Allowances under Executive Decree 25-55:
  // 1. تعويض الخبرة البيداغوجية (IEPédagogique: ~4% per echelon of base salary)
  const pedagogicalExpAllowance = Math.round(baseSalary * (selectedEchelon * 0.04));

  // 2. تعويض التأهيل (Indemnité de Qualification: 45% to 60% based on Category 12-17)
  const qualificationRate =
    currentRank.category >= 17
      ? 0.60
      : currentRank.category === 16
      ? 0.55
      : currentRank.category >= 14
      ? 0.50
      : 0.45;
  const qualificationAllowance = Math.round(principalSalary * qualificationRate);

  // 3. تعويض التوثيق التربوي (Indemnité de Documentation Pédagogique - مرفوعة في المرسوم 25-55)
  const documentationAllowance =
    currentRank.category >= 16 ? 12000 : currentRank.category >= 14 ? 10000 : 8500;

  // 4. تعويض الدعم المدرسي والمعالجة البيداغوجية (15% من الراتب الرئيسي)
  const supportRemediationAllowance = Math.round(principalSalary * 0.15);

  // 5. منحة المنصب العالي البيداغوجي (أستاذ رئيسي / منسق مادة)
  const coordinatorAllowance = coordinatorBonusPoints * pointValueDZD;

  // 6. تعويض المنطقة الجغرافية والسكن الوظيفي / بدل الإيجار
  const zoneAllowance = isSouthZone ? 16500 : 0;
  const housingAllowance = hasHousingAllowance ? (isSouthZone ? 10000 : 4000) : 0;
  const familyAllowance = childrenCountSalary * 300 + (childrenCountSalary > 0 ? 800 : 0);

  const grossMonthly =
    principalSalary +
    pedagogicalExpAllowance +
    qualificationAllowance +
    documentationAllowance +
    supportRemediationAllowance +
    coordinatorAllowance +
    zoneAllowance +
    housingAllowance;

  const socialSecurityDeduction = Math.round(grossMonthly * 0.09); // 9% CNAS
  const taxableIncome = grossMonthly - socialSecurityDeduction;
  const irgTax = Math.round(Math.max(0, (taxableIncome - 30000) * 0.18)); // تقدير الضريبة IRG
  const estimatedNetMonthly = grossMonthly - socialSecurityDeduction - irgTax + familyAllowance;

  // منحة تحسين الأداء التربوي (المردودية 40% تصرف كل 3 أشهر)
  const quarterlyGrossBonus = Math.round(principalSalary * 3 * 0.40);
  const quarterlyBonusNet = Math.round(quarterlyGrossBonus * 0.819);

  // Echelon Promotion Pace (Min 2.5y, Med 3y, Max 3.5y)
  const combinedScore = inspectorMark * 2 + adminMark; // Out of 60
  const promotionPace =
    combinedScore >= 54
      ? { label: 'المدة الدنيا (سنتان و 6 أشهر)', yearsRequired: 2.5 }
      : combinedScore >= 46
      ? { label: 'المدة المتوسطة (3 سنوات)', yearsRequired: 3.0 }
      : { label: 'المدة القصوى (3 سنوات و 6 أشهر)', yearsRequired: 3.5 };

  const remainingTimeYears = Math.max(
    0,
    Number((promotionPace.yearsRequired - yearsInCurrentEchelon).toFixed(1))
  );

  // ================= Seniority & 5-Year Rank Combination Calculations (2025-2029) =================
  const currentRefYear = 2025;
  const currentRefMonth = 1; // 01 جانفي 2025 تاريخ سريان آلية الجمع بين الأقدمية في الرتب (لمدة 05 سنوات إلى 31 ديسمبر 2029)

  // 1. الأقدمية العامة في التعليم (منذ تاريخ أول توظيف + أشهر الاستخلاف المعتمدة)
  const rawGeneralMonths =
    (currentRefYear - firstHireYear) * 12 + (currentRefMonth - firstHireMonth) + contractMonthsValidated;
  const totalGeneralMonths = Math.max(0, rawGeneralMonths);
  const generalYears = Math.floor(totalGeneralMonths / 12);
  const generalRemMonths = totalGeneralMonths % 12;

  // 2. الأقدمية في الرتبة السابقة والرتبة الحالية
  const prevRankTotalMonths = prevRankYears * 12 + prevRankMonths;
  const currRankTotalMonths = currRankYears * 12 + currRankMonths;

  // 3. الأقدمية المعتمدة للترقية (مع تفعيل أو عدم تفعيل رخصة الجمع بين الرتب 2025-2029)
  const effectiveRankMonths = applyRankCombination2026
    ? prevRankTotalMonths + currRankTotalMonths
    : currRankTotalMonths;

  const effectiveRankYears = Math.floor(effectiveRankMonths / 12);
  const effectiveRankRemMonths = effectiveRankMonths % 12;
  const effectiveRankDecimal = Number((effectiveRankMonths / 12).toFixed(2));

  // شروط الترقية للرتبة الأعلى في المرسوم 25-54:
  // - الامتحان المهني: 5 سنوات (60 شهراً)
  // - التسجيل على قوائم التأهيل (الاختيار): 10 سنوات (120 شهراً)
  const monthsNeededForExam = Math.max(0, 60 - effectiveRankMonths);
  const monthsNeededForList = Math.max(0, 120 - effectiveRankMonths);

  // جدول استحقاق الترقية خلال السنوات الخمس الانتقالية (01 جانفي 2025 - 31 ديسمبر 2029)
  const fiveYearTransitionPlan = [2025, 2026, 2027, 2028, 2029].map((yr) => {
    const addedMonths = (yr - 2025) * 12;
    const projectedRankMonths = effectiveRankMonths + addedMonths;
    const projectedGeneralMonths = totalGeneralMonths + addedMonths;
    const projRankY = Math.floor(projectedRankMonths / 12);
    const projRankM = projectedRankMonths % 12;
    const projGenY = Math.floor(projectedGeneralMonths / 12);

    const eligibleExam = projectedRankMonths >= 60;
    const eligibleQualificationList = projectedRankMonths >= 120;

    return {
      year: yr,
      projRankY,
      projRankM,
      projGenY,
      eligibleExam,
      eligibleQualificationList,
    };
  });

  // ================= Retirement Privilege 57 Years Calculations (Decree 25-54) =================
  const currentAge = 2026 - birthYear;
  // السن القانوني العام 60 للرجال و 55 للنساء
  // امتياز الأساتذة في المرسوم 25-54: تخفيض 3 سنوات -> 57 سنة للأستاذ، و52 سنة للأستاذة (+ تخفيض الأمومة حتى 3 سنوات)
  const standardRetirementAge = teacherGender === 'male' ? 60 : 55;
  const maternityReduction = teacherGender === 'female' ? Math.min(3, maternityChildrenCount) : 0;
  const teacherPrivilegeRetirementAge =
    teacherGender === 'male' ? 57 : Math.max(49, 52 - maternityReduction);

  const retirementTargetYear = birthYear + teacherPrivilegeRetirementAge;
  const yearsUntilRetirement = Math.max(0, retirementTargetYear - 2026);

  // سنوات الخدمة الفعلية عند بلوغ سن التقاعد الامتيازي (مع احتساب امتياز الجنوب إن وجد: كل سنة تحسب بـ 1.25 أو 1.5)
  const projectedServiceYearsAtRetirement = Number(
    (
      generalYears +
      yearsUntilRetirement +
      southServiceYears * 0.25
    ).toFixed(1)
  );

  // نسبة المعاش = عدد سنوات الخدمة × 2.5% (بحد أقصى 80% من الأجر الخاضع للاشتراك)
  const pensionRate = Math.min(80, Number((projectedServiceYearsAtRetirement * 2.5).toFixed(1)));
  const estimatedMonthlyPension = Math.round((taxableIncome * pensionRate) / 100);

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
          </div>
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt="أيقونة التوثيق"
              className="w-16 h-16 object-contain border border-black p-1 rounded"
            />
          )}
          <div className="text-left">
            <div>الأستاذ(ة): {profile.fullName}</div>
            <div>الرتبة: {currentRank.rankName} — الدرجة: {selectedEchelon}</div>
          </div>
        </div>
        <h2 className="text-center font-extrabold text-base mt-3 underline">
          بطاقة محاكاة المسار المهني، الجمع بين الرتب (01 جانفي 2025 — 31 ديسمبر 2029)، النظام التعويضي (25-55)، وامتياز التقاعد (57 سنة)
        </h2>
      </div>

      {/* Top Header & Stage Switcher */}
      <div className="bg-gradient-to-l from-[#0c2d1d] via-[#092216] to-[#06160f] border border-[#d4af37]/40 rounded-2xl p-6 shadow-xl no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#105e32]/50 border border-[#d4af37]/40 text-xs font-bold text-[#f5d77f] mb-2">
              <Scale className="w-4 h-4" />
              <span>محاكي المسار المهني الشامل — المرسومان التنفيذيان 25-54 و 25-55</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              احتساب الخبرة والأقدمية (الجمع بين الرتب لمدة 05 سنوات: 2025-2029)، امتياز التقاعد 57 سنة، والمنح الجديدة
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              حاسبة قانونية ومالية دقيقة تشمل آلية الجمع بين الأقدمية في الرتب السارية ابتداءً من 01 جانفي 2025 إلى 31 ديسمبر 2029، النظام التعويضي 25-55، والتقاعد الخاص بالأساتذة
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
              {(['primary', 'middle', 'secondary'] as EducationalStage[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStage(st);
                    setSelectedRankIdx(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedStage === st
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {STAGES_METADATA[st].shortTitle}
                </button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الحصيلة (A4)</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Sub-Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-[#d4af37]/20">
          <button
            onClick={() => setActiveTab('seniority_combination_2026')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === 'seniority_combination_2026'
                ? 'bg-gradient-to-r from-[#105e32] to-[#0a381e] border-[#d4af37] text-[#f5d77f] shadow-md'
                : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5 text-[#d4af37] shrink-0" />
            <div>
              <div className="text-xs font-extrabold">1. الأقدمية والجمع بين الرتب (05 سنوات)</div>
              <div className="text-[10px] text-slate-400">سارية من 01-01-2025 إلى 31-12-2029</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('retirement_57')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === 'retirement_57'
                ? 'bg-gradient-to-r from-[#105e32] to-[#0a381e] border-[#d4af37] text-[#f5d77f] shadow-md'
                : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">2. امتياز التقاعد للأساتذة (57 سنة)</div>
              <div className="text-[10px] text-slate-400">تخفيض السن وحساب معاش التقاعد 25-54</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('salary_25_55')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === 'salary_25_55'
                ? 'bg-gradient-to-r from-[#105e32] to-[#0a381e] border-[#d4af37] text-[#f5d77f] shadow-md'
                : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:text-white'
            }`}
          >
            <Coins className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">3. محاكي الرواتب والمنح (25-55)</div>
              <div className="text-[10px] text-slate-400">النظام التعويضي الجديد والدرجات الـ 12</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('privileges_guide')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === 'privileges_guide'
                ? 'bg-gradient-to-r from-[#105e32] to-[#0a381e] border-[#d4af37] text-[#f5d77f] shadow-md'
                : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">4. دليل المنح والامتيازات الكامل</div>
              <div className="text-[10px] text-slate-400">مكاسب المرسومين 25-54 و 25-55</div>
            </div>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: SENIORITY & 5-YEAR RANK COMBINATION (JAN 1, 2025 - DEC 31, 2029) */}
      {/* ===================================================================== */}
      {activeTab === 'seniority_combination_2026' && (
        <div className="space-y-6">
          {/* Official Instruction Banner */}
          <div className="bg-[#092417] border-2 border-[#d4af37]/60 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#d4af37]/20 text-[#f5d77f] shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  آلية الجمع بين الأقدمية في الرتب لمدة خمس (05) سنوات — سارية ابتداءً من 01 جانفي 2025 إلى 31 ديسمبر 2029
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  عملاً بالأحكام الانتقالية للمرسوم التنفيذي <span className="text-[#f5d77f] font-bold">25-54</span> والتعليمة الوزارية المشتركة الخاصة بتطبيقه، يستفيد الأساتذة المدمجون أو المرقون في الرتب الجديدة من **حق الجمع بين الأقدمية المكتسبة في رتبتهم الأصلية (السابقة) والأقدمية المكتسبة في رتبتهم الحالية** طيلة فترة انتقالية مدتها **خمس (05) سنوات سارية ابتداءً من 01 جانفي 2025 إلى غاية 31 ديسمبر 2029** لبلوغ شرط الترقية إلى الرتبة الأعلى (05 سنوات للامتحان المهني أو 10 سنوات للتسجيل على قوائم التأهيل).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Inputs: Experience, General Seniority, and Rank Seniorities (5 Cols) */}
            <div className="lg:col-span-5 bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4 text-xs sm:text-sm">
              <h3 className="font-extrabold text-white text-base pb-3 border-b border-[#d4af37]/20 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d4af37]" />
                <span>بيانات احتساب الخبرة والأقدمية العامة والرتب</span>
              </h3>

              {/* Rank Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  الرتبة الحالية للأستاذ ({STAGES_METADATA[selectedStage].shortTitle})
                </label>
                <select
                  value={selectedRankIdx}
                  onChange={(e) => setSelectedRankIdx(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
                >
                  {stageRanks.map((r, idx) => (
                    <option key={r.rankName} value={idx}>
                      {r.rankName} — الصنف {r.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Hire Date (General Seniority) */}
              <div className="p-3.5 rounded-xl bg-[#05140d] border border-[#d4af37]/25 space-y-3">
                <div className="text-xs font-extrabold text-[#f5d77f]">
                  أولاً: حساب الأقدمية العامة والخبرة المهنية المعتمدة
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">سنة أول توظيف</label>
                    <input
                      type="number"
                      min={1985}
                      max={2026}
                      value={firstHireYear}
                      onChange={(e) => setFirstHireYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[#081c12] border border-[#d4af37]/40 text-white font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">شهر التنصيب الأول</label>
                    <select
                      value={firstHireMonth}
                      onChange={(e) => setFirstHireMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[#081c12] border border-[#d4af37]/40 text-white font-bold"
                    >
                      <option value={9}>سبتمبر (09)</option>
                      <option value={10}>أكتوبر (10)</option>
                      <option value={11}>نوفمبر (11)</option>
                      <option value={1}>جانفي (01)</option>
                      <option value={2}>فيفري (02)</option>
                      <option value={3}>مارس (03)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    أشهر الخبرة المعتمدة قبل الترسيم (استخلاف / تعاقد / إدماج)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={contractMonthsValidated}
                    onChange={(e) => setContractMonthsValidated(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#081c12] border border-[#d4af37]/40 text-emerald-300 font-bold tabular-nums"
                  />
                </div>
              </div>

              {/* Previous Rank + Current Rank Seniority */}
              <div className="p-3.5 rounded-xl bg-[#05140d] border border-[#d4af37]/40 space-y-3">
                <div className="text-xs font-extrabold text-[#f5d77f]">
                  ثانياً: حساب الأقدمية في الرتبة (الجمع بين الرتب: 2025 - 2029)
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    1) الأقدمية المكتسبة في الرتبة السابقة (قبل الإدماج/الترقية):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={25}
                        value={prevRankYears}
                        onChange={(e) => setPrevRankYears(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-[#081c12] border border-[#d4af37]/40 text-white font-bold tabular-nums"
                      />
                      <span className="text-xs text-slate-400 shrink-0">سنة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={11}
                        value={prevRankMonths}
                        onChange={(e) => setPrevRankMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-[#081c12] border border-[#d4af37]/40 text-white font-bold tabular-nums"
                      />
                      <span className="text-xs text-slate-400 shrink-0">شهر</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    2) الأقدمية المكتسبة في الرتبة الحالية (الجديدة):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={25}
                        value={currRankYears}
                        onChange={(e) => setCurrRankYears(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-[#081c12] border border-[#d4af37]/40 text-white font-bold tabular-nums"
                      />
                      <span className="text-xs text-slate-400 shrink-0">سنة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={11}
                        value={currRankMonths}
                        onChange={(e) => setCurrRankMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-[#081c12] border border-[#d4af37]/40 text-white font-bold tabular-nums"
                      />
                      <span className="text-xs text-slate-400 shrink-0">شهر</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#d4af37]/20 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="combineRanks2026"
                    checked={applyRankCombination2026}
                    onChange={(e) => setApplyRankCombination2026(e.target.checked)}
                    className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                  />
                  <label
                    htmlFor="combineRanks2026"
                    className="text-xs font-bold text-emerald-300 cursor-pointer leading-snug"
                  >
                    تفعيل آلية الجمع بين الأقدمية في الرتب لمدة خمس (05) سنوات (سارية ابتداءً من 01 جانفي 2025 إلى 31 ديسمبر 2029)
                  </label>
                </div>
              </div>
            </div>

            {/* Right Results: Seniority Breakdown & 5-Year Transition Table (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top 3 Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#081c12] border border-[#d4af37]/40">
                  <div className="text-xs text-slate-400">الأقدمية العامة في التعليم</div>
                  <div className="text-xl sm:text-2xl font-black text-white tabular-nums mt-1">
                    {generalYears} سنة و {generalRemMonths} شهر
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-1">
                    شاملة {contractMonthsValidated} شهر خبرة مستخلف/متعاقد
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#092417] border-2 border-[#d4af37]">
                  <div className="text-xs text-[#f5d77f] font-bold">
                    مجموع الأقدمية في الرتبة (بالجمع)
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#f5d77f] tabular-nums mt-1">
                    {effectiveRankYears} سنة و {effectiveRankRemMonths} شهر
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    ({prevRankYears}س {prevRankMonths}ش سابقة + {currRankYears}س {currRankMonths}ش حالية)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#081c12] border border-emerald-500/40">
                  <div className="text-xs text-slate-400">الوضعية إزاء الترقية (2025 - 2029)</div>
                  <div className="text-sm font-black text-emerald-300 mt-1.5">
                    {effectiveRankMonths >= 120
                      ? 'مستوفٍ لشرط قوائم التأهيل (10 سنوات) والامتحان المهني'
                      : effectiveRankMonths >= 60
                      ? 'مستوفٍ لشرط الامتحان المهني للترقية (05 سنوات كاملة)'
                      : `يتبقى ${Math.floor(monthsNeededForExam / 12)} سنة و ${
                          monthsNeededForExam % 12
                        } شهر لبلوغ 05 سنوات`}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    وفق المادة الانتقالية للمرسوم 25-54 (2025-2029)
                  </div>
                </div>
              </div>

              {/* Eligibility Cards for Exam (5y) & Qualification List (10y) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#081c12] border border-[#d4af37]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">
                      1. الترقية عن طريق الامتحان المهني (شرط 05 سنوات)
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        effectiveRankMonths >= 60
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {effectiveRankMonths >= 60 ? 'مؤهل للمشاركة فوراً' : 'قيد استكمال النصاب'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-emerald-400 to-[#d4af37]"
                      style={{ width: `${Math.min(100, Math.round((effectiveRankMonths / 60) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {effectiveRankMonths >= 60
                      ? `تجاوزت عتبة الـ 05 سنوات بـ (${Math.floor((effectiveRankMonths - 60) / 12)} سنة و ${(effectiveRankMonths - 60) % 12} شهر) بفضل الجمع بين الرتبتين.`
                      : `ينقصك (${Math.floor(monthsNeededForExam / 12)} سنة و ${monthsNeededForExam % 12} شهر) لبلوغ 05 سنوات ضمن الفترة الانتقالية (01 جانفي 2025 — 31 ديسمبر 2029).`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#081c12] border border-[#d4af37]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">
                      2. الترقية الاختيارية عبر قوائم التأهيل (شرط 10 سنوات)
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        effectiveRankMonths >= 120
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-sky-950 text-sky-300 border border-sky-500/40'
                      }`}
                    >
                      {effectiveRankMonths >= 120 ? 'مؤهل للتسجيل في التأهيل' : 'قيد استكمال 10 سنوات'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-sky-400 to-[#d4af37]"
                      style={{ width: `${Math.min(100, Math.round((effectiveRankMonths / 120) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {effectiveRankMonths >= 120
                      ? `أقدميتك المدمجة (${effectiveRankDecimal} سنة) تخولك التسجيل المباشر في قوائم التأهيل للرتبة الأعلى.`
                      : `يتبقى لك (${Math.floor(monthsNeededForList / 12)} سنة و ${monthsNeededForList % 12} شهر) لبلوغ شرط 10 سنوات.`}
                  </p>
                </div>
              </div>

              {/* 5-Year Transitional Schedule Table (2025 - 2029) */}
              <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5">
                <h4 className="text-sm sm:text-base font-extrabold text-white mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#d4af37]" />
                  <span>
                    الجدول الزمني لاستحقاق الترقية بالجمع بين الرتب خلال الخماسية الانتقالية (ابتداءً من 01 جانفي 2025 إلى 31 ديسمبر 2029)
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  يوضح هذا الجدول تطور أقدميتك المدمجة سنة بسنة طيلة السنوات الخمس (05) المسموح فيها بالجمع بين أقدمية الرتبة السابقة والرتبة الحالية (2025 — 2029):
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#05140d] text-[#f5d77f] border-b border-[#d4af37]/30">
                        <th className="py-2.5 px-3 font-bold">السنة الانتقالية</th>
                        <th className="py-2.5 px-3 font-bold">الأقدمية العامة</th>
                        <th className="py-2.5 px-3 font-bold">مجموع أقدمية الرتبتين</th>
                        <th className="py-2.5 px-3 font-bold text-center">الامتحان المهني (05 سنوات)</th>
                        <th className="py-2.5 px-3 font-bold text-center">قوائم التأهيل (10 سنوات)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d4af37]/15">
                      {fiveYearTransitionPlan.map((row) => (
                        <tr key={row.year} className="hover:bg-[#0c291b]/40">
                          <td className="py-2.5 px-3 font-black text-white tabular-nums">
                            دورة {row.year} (السنة {row.year - 2024} من 5)
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-bold tabular-nums">
                            {row.projGenY} سنة و {generalRemMonths} شهر
                          </td>
                          <td className="py-2.5 px-3 text-[#f5d77f] font-black tabular-nums">
                            {row.projRankY} سنة و {row.projRankM} شهر
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {row.eligibleExam ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>مستوفٍ للشرط (مؤهل)</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">غير مستوفٍ بعد</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {row.eligibleQualificationList ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#105e32]/80 text-[#f5d77f] border border-[#d4af37]/50 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>مستوفٍ لـ 10 سنوات</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">أقل من 10 سنوات</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: RETIREMENT PRIVILEGE AT 57 YEARS FOR TEACHERS (DECREE 25-54)   */}
      {/* ===================================================================== */}
      {activeTab === 'retirement_57' && (
        <div className="space-y-6">
          {/* Legal Explanation Banner */}
          <div className="bg-[#092417] border-2 border-[#d4af37]/60 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  امتياز التقاعد الخاص بأساتذة التربية الوطنية (57 سنة للرجال / 52 سنة للنساء) — المرسوم التنفيذي 25-54
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  اعترافاً بخصوصية ومشقة مهنة التدريس في الأطوار التعليمية الثلاثة، أقر القانون الأساسي الجديد <span className="text-[#f5d77f] font-bold">25-54</span> حق الأستاذ في الاستفادة من **تخفيض سن التقاعد بـ 03 سنوات إلى 05 سنوات عن السن القانونية العامة (60 سنة)**، ليصبح سن التقاعد الاختياري للأساتذة **57 سنة للرجال** و **52 سنة للنساء** (مع احتفاظ الأستاذة بحق تخفيض سنة إضافية عن كل طفل في حدود 03 سنوات).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Retirement Inputs (5 Cols) */}
            <div className="lg:col-span-5 bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4 text-xs sm:text-sm">
              <h3 className="font-extrabold text-white text-base pb-3 border-b border-[#d4af37]/20 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#d4af37]" />
                <span>بيانات حساب امتياز التقاعد ومعاش الأستاذ</span>
              </h3>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">الصفة (الجنس)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTeacherGender('male')}
                    className={`py-2.5 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      teacherGender === 'male'
                        ? 'bg-[#105e32] text-[#f5d77f] border-[#d4af37]'
                        : 'bg-[#05140d] text-slate-300 border-[#d4af37]/20'
                    }`}
                  >
                    أستاذ (سن الامتياز: 57 سنة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherGender('female')}
                    className={`py-2.5 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      teacherGender === 'female'
                        ? 'bg-[#105e32] text-[#f5d77f] border-[#d4af37]'
                        : 'bg-[#05140d] text-slate-300 border-[#d4af37]/20'
                    }`}
                  >
                    أستاذة (سن الامتياز: 52 سنة)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">سنة الميلاد</label>
                  <input
                    type="number"
                    min={1960}
                    max={2004}
                    value={birthYear}
                    onChange={(e) => setBirthYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">السن الحالي في 2026</label>
                  <div className="w-full px-3 py-2 rounded-lg bg-[#05140d]/60 border border-[#d4af37]/20 text-[#f5d77f] font-black tabular-nums">
                    {currentAge} سنة
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  سنة أول توظيف في التعليم (لحساب سنوات الخدمة)
                </label>
                <input
                  type="number"
                  min={1985}
                  max={2026}
                  value={firstHireYear}
                  onChange={(e) => setFirstHireYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold tabular-nums"
                />
              </div>

              {teacherGender === 'female' && (
                <div>
                  <label className="block text-emerald-300 font-bold mb-1">
                    عدد الأطفال (تخفيض سنة عن كل طفل للأستاذة في حدود 03 سنوات)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={maternityChildrenCount}
                    onChange={(e) => setMaternityChildrenCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-emerald-500/40 text-white font-bold tabular-nums"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  سنوات الخدمة في ولايات الجنوب الكبير (امتياز الأقدمية الإضافية)
                </label>
                <input
                  type="number"
                  min={0}
                  max={35}
                  value={southServiceYears}
                  onChange={(e) => setSouthServiceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold tabular-nums"
                />
              </div>
            </div>

            {/* Right Retirement Results (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#092417] border-2 border-[#d4af37]">
                  <div className="text-xs text-[#f5d77f] font-bold">سن التقاعد الامتيازي للأستاذ</div>
                  <div className="text-3xl font-black text-white tabular-nums mt-1">
                    {teacherPrivilegeRetirementAge} سنة
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-1">
                    بدلاً من السن العام ({standardRetirementAge} سنة)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#081c12] border border-[#d4af37]/40">
                  <div className="text-xs text-slate-400">سنة استحقاق التقاعد الاختياري</div>
                  <div className="text-3xl font-black text-[#f5d77f] tabular-nums mt-1">
                    {retirementTargetYear}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    {yearsUntilRetirement === 0
                      ? 'مستوفٍ لشرط السن حالياً!'
                      : `بعد ${yearsUntilRetirement} سنوات من الآن`}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#081c12] border border-emerald-500/40">
                  <div className="text-xs text-slate-400">نسبة المعاش التقاعدي المتوقعة</div>
                  <div className="text-3xl font-black text-emerald-400 tabular-nums mt-1">
                    {pensionRate}%
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    عن {projectedServiceYearsAtRetirement} سنة خدمة معتمدة
                  </div>
                </div>
              </div>

              {/* Financial Pension Card */}
              <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#d4af37]" />
                  <span>التقدير المالي لمعاش التقاعد الشهري وفق رتبتك ودرجتك الحالية</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/25">
                    <div className="text-xs text-slate-400">متوسط الأجر الخاضع للاشتراك (المرجعي):</div>
                    <div className="text-xl font-black text-white font-mono tabular-nums mt-1">
                      {taxableIncome.toLocaleString('fr-DZ')} د.ج
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      يُحسب على أساس أفضل 05 سنوات في المسار المهني
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#092417] border border-emerald-500/40">
                    <div className="text-xs text-emerald-300 font-bold">
                      معاش التقاعد الشهري الصافي التقديري ({pensionRate}%):
                    </div>
                    <div className="text-2xl font-black text-[#f5d77f] font-mono tabular-nums mt-1">
                      {estimatedMonthlyPension.toLocaleString('fr-DZ')} د.ج / شهرياً
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      بالإضافة إلى منحة التقاعد لنهاية الخدمة من خدمات التربية
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#05140d] border border-[#d4af37]/20 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-[#f5d77f]">الضوابط القانونية لامتياز التقاعد 57 سنة في المرسوم 25-54:</div>
                  <p>• يُمنح التقاعد في سن 57 سنة (للرجال) و 52 سنة (للنساء) بطلب اختياري من الأستاذ بعد قضاء المدة القانونية الدنيا للخدمة الفعلية في قطاع التربية الوطنية.</p>
                  <p>• يستفيد الأساتذة في السنوات الثلاث الأخيرة قبل التقاعد من إمكانية **تخفيف النصاب الساعي الأسبوعي** لمرافقة الأساتذة المتربصين والتنسيق البيداغوجي.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SALARY & ALLOWANCES SIMULATOR (DECREES 25-54 & 25-55)          */}
      {/* ===================================================================== */}
      {activeTab === 'salary_25_55' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls (5 Cols) */}
          <div className="lg:col-span-5 bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4 text-xs sm:text-sm">
            <h3 className="font-extrabold text-white text-base pb-3 border-b border-[#d4af37]/20 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#d4af37]" />
              <span>معطيات الرتبة، الدرجة، ومنح المرسوم التنفيذي 25-55</span>
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                الرتبة القانونية في {STAGES_METADATA[selectedStage].shortTitle} (المرسوم 25-54)
              </label>
              <select
                value={selectedRankIdx}
                onChange={(e) => setSelectedRankIdx(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
              >
                {stageRanks.map((r, idx) => (
                  <option key={r.rankName} value={idx}>
                    {r.rankName} — الصنف {r.category} (القاعدي: {r.baseIndex})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>الدرجة الاستدلالية الحالية (1 إلى 12):</span>
                <span className="text-[#f5d77f] font-mono font-bold tabular-nums">
                  الدرجة {selectedEchelon} (+{echelonIndexPoints} نقطة)
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={12}
                value={selectedEchelon}
                onChange={(e) => setSelectedEchelon(Number(e.target.value))}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums mt-1">
                <span>د1</span>
                <span>د3</span>
                <span>د6</span>
                <span>د9</span>
                <span>د12</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">نقطة المفتش (/20)</label>
                <input
                  type="number"
                  step="0.25"
                  min={10}
                  max={20}
                  value={inspectorMark}
                  onChange={(e) => setInspectorMark(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">النقطة الإدارية (/20)</label>
                <input
                  type="number"
                  step="0.25"
                  min={10}
                  max={20}
                  value={adminMark}
                  onChange={(e) => setAdminMark(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Checkboxes for Specific Allowances under 25-54 & 25-55 */}
            <div className="p-3.5 rounded-xl bg-[#05140d] border border-[#d4af37]/25 space-y-2.5">
              <div className="text-xs font-extrabold text-[#f5d77f]">
                تخصيص المنح والتعويضات الإضافية (المرسوم 25-55):
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCoordinatorOrHead}
                  onChange={(e) => setIsCoordinatorOrHead(e.target.checked)}
                  className="w-4 h-4 accent-[#d4af37]"
                />
                <span>منصب أستاذ رئيسي للقسم / أستاذ منسق المادة (+75 نقطة)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHousingAllowance}
                  onChange={(e) => setHasHousingAllowance(e.target.checked)}
                  className="w-4 h-4 accent-[#d4af37]"
                />
                <span>منحة تعويض السكن / بدل الإيجار للأساتذة غير المستفيدين من سكن</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSouthZone}
                  onChange={(e) => setIsSouthZone(e.target.checked)}
                  className="w-4 h-4 accent-[#d4af37]"
                />
                <span>منحة المنطقة الجغرافية والامتياز (ولايات الجنوب والهضاب العليا)</span>
              </label>
            </div>
          </div>

          {/* Right Detailed Pay Slip & 12-Echelon Matrix (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#092417] border border-[#d4af37]/50">
                <div className="text-xs text-slate-300">مجموع النقاط الاستدلالية</div>
                <div className="text-2xl font-black text-[#f5d77f] font-mono tabular-nums mt-1">
                  {totalIndexPoints} نقطة
                </div>
                <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
                  القاعدي ({currentRank.baseIndex}) + الدرجة ({echelonIndexPoints})
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#092417] border-2 border-emerald-500/60">
                <div className="text-xs text-emerald-300 font-bold">الراتب الشهري الصافي (25-55)</div>
                <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">
                  {estimatedNetMonthly.toLocaleString('fr-DZ')} د.ج
                </div>
                <div className="text-[11px] text-[#f5d77f] mt-1 tabular-nums">
                  منحة المردودية (40%): ~{quarterlyBonusNet.toLocaleString('fr-DZ')} د.ج
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#092417] border border-[#d4af37]/50">
                <div className="text-xs text-slate-300">
                  وتيرة الترقية للدرجة {Math.min(12, selectedEchelon + 1)}
                </div>
                <div className="text-sm font-black text-white mt-1">{promotionPace.label}</div>
                <div className="text-[11px] text-[#f5d77f] mt-1 tabular-nums">
                  المدة المتبقية للترقية: {remainingTimeYears} سنة
                </div>
              </div>
            </div>

            {/* Detailed Pay Slip Breakdown Table (Decree 25-55) */}
            <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5">
              <h4 className="text-sm sm:text-base font-extrabold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#d4af37]" />
                <span>
                  كشف تفصيلي لمكونات الراتب والعلاوات وفق المرسوم التنفيذي 25-55 (النظام التعويضي الجديد)
                </span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#05140d] text-[#f5d77f] border-b border-[#d4af37]/30">
                      <th className="py-2.5 px-3 font-bold">طبيعة العنصر المالي / العلاوة</th>
                      <th className="py-2.5 px-3 font-bold">المرجع وطريقة الاحتساب (25-54 / 25-55)</th>
                      <th className="py-2.5 px-3 font-bold text-left">المبلغ الشهري (د.ج)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4af37]/15">
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">1. الأجر القاعدي (الراتب الرئيسي للرتبة)</td>
                      <td className="py-2 px-3 text-slate-300">
                        الصنف {currentRank.category} ({currentRank.baseIndex} نقطة × 45 دج)
                      </td>
                      <td className="py-2 px-3 text-left font-mono font-bold text-white tabular-nums">
                        {baseSalary.toLocaleString('fr-DZ')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">2. تعويض الخبرة المهنية (IEP - الدرجة {selectedEchelon})</td>
                      <td className="py-2 px-3 text-slate-300">
                        {echelonIndexPoints} نقطة استدلالية × 45 دج
                      </td>
                      <td className="py-2 px-3 text-left font-mono font-bold text-emerald-300 tabular-nums">
                        +{iepAllowance.toLocaleString('fr-DZ')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">3. تعويض الخبرة البيداغوجية (IEPédagogique)</td>
                      <td className="py-2 px-3 text-slate-300">
                        نسبة 4% عن كل درجة ({selectedEchelon * 4}% من القاعدي)
                      </td>
                      <td className="py-2 px-3 text-left font-mono font-bold text-emerald-300 tabular-nums">
                        +{pedagogicalExpAllowance.toLocaleString('fr-DZ')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">4. تعويض التأهيل (Indemnité de Qualification)</td>
                      <td className="py-2 px-3 text-slate-300">
                        نسبة {Math.round(qualificationRate * 100)}% من الراتب الرئيسي (المرسوم 25-55)
                      </td>
                      <td className="py-2 px-3 text-left font-mono font-bold text-emerald-300 tabular-nums">
                        +{qualificationAllowance.toLocaleString('fr-DZ')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">5. تعويض التوثيق التربوي (Documentation)</td>
                      <td className="py-2 px-3 text-slate-300">
                        مبلغ جزافي مرفوع حسب الصنف والطور في المرسوم 25-55
                      </td>
                      <td className="py-2 px-3 text-left font-mono font-bold text-emerald-300 tabular-nums">
                        +{documentationAllowance.toLocaleString('fr-DZ')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-white">6. تعويض الدعم المدرسي والمعالجة البيداغوجية</td>
                      <td className="py-2 px-3 text-slate-300">نسبة 15% من الراتب الرئيسي</td>
                      <td className="py-2 px-3 text-left font-mono font-bold text-emerald-300 tabular-nums">
                        +{supportRemediationAllowance.toLocaleString('fr-DZ')}
                      </td>
                    </tr>
                    {isCoordinatorOrHead && (
                      <tr>
                        <td className="py-2 px-3 font-bold text-[#f5d77f]">
                          7. علاوة الأستاذ الرئيسي / منسق المادة
                        </td>
                        <td className="py-2 px-3 text-slate-300">+75 نقطة استدلالية (التأطير والتنسيق)</td>
                        <td className="py-2 px-3 text-left font-mono font-bold text-[#f5d77f] tabular-nums">
                          +{coordinatorAllowance.toLocaleString('fr-DZ')}
                        </td>
                      </tr>
                    )}
                    {(hasHousingAllowance || isSouthZone) && (
                      <tr>
                        <td className="py-2 px-3 font-bold text-sky-300">
                          8. تعويض السكن / المنطقة الجغرافية والامتياز
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          بدل الإيجار + تعويض المنطقة الجغرافية
                        </td>
                        <td className="py-2 px-3 text-left font-mono font-bold text-sky-300 tabular-nums">
                          +{(housingAllowance + zoneAllowance).toLocaleString('fr-DZ')}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-[#05140d] border-t border-[#d4af37]/30">
                      <td className="py-2.5 px-3 font-extrabold text-rose-300">
                        اقتطاعات الضمان الاجتماعي (9%) والضريبة (IRG)
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        CNAS ({socialSecurityDeduction.toLocaleString('fr-DZ')}) + IRG ({irgTax.toLocaleString('fr-DZ')})
                      </td>
                      <td className="py-2.5 px-3 text-left font-mono font-bold text-rose-400 tabular-nums">
                        -{(socialSecurityDeduction + irgTax).toLocaleString('fr-DZ')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 12 Echelons Matrix */}
            <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5">
              <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d4af37]" />
                <span>
                  جدول الدرجات الاستدلالية الـ 12 لرتبة: {currentRank.rankName} (الصنف {currentRank.category})
                </span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 text-center">
                {currentRank.echelonIndices.map((pts, idx) => {
                  const echNum = idx + 1;
                  const active = echNum === selectedEchelon;
                  return (
                    <button
                      key={echNum}
                      onClick={() => setSelectedEchelon(echNum)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#d4af37] text-[#06150e] border-white font-black shadow-md'
                          : 'bg-[#05140d] text-slate-200 border-[#d4af37]/25 hover:border-[#d4af37]'
                      }`}
                    >
                      <div className="text-xs font-bold">الدرجة {echNum}</div>
                      <div className="text-sm font-mono font-extrabold tabular-nums mt-0.5">+{pts}</div>
                      <div
                        className={`text-[10px] font-mono tabular-nums ${
                          active ? 'text-[#06150e]/80' : 'text-slate-400'
                        }`}
                      >
                        مجموع: {currentRank.baseIndex + pts}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: COMPREHENSIVE GUIDE TO DECREES 25-54 & 25-55 PRIVILEGES        */}
      {/* ===================================================================== */}
      {activeTab === 'privileges_guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-[#f5d77f] flex items-center gap-2 pb-2 border-b border-[#d4af37]/20">
              <ShieldCheck className="w-5 h-5" />
              <span>أبرز الامتيازات المهنية والبيداغوجية في المرسوم التنفيذي 25-54</span>
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <span className="font-extrabold text-emerald-300 block mb-0.5">
                  1. استحداث رتبة «أستاذ مميز» ورفع التصنيف القاعدي للأطوار الثلاثة:
                </span>
                تصنيف أستاذ الابتدائي في الصنف 12 (والمميز في 15)، وأستاذ المتوسط في الصنف 13 (والمميز في 16)، وأستاذ الثانوي في الصنف 14 (والمميز في الصنف 17 خارج الصنف).
              </li>
              <li className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <span className="font-extrabold text-emerald-300 block mb-0.5">
                  2. آلية الجمع بين الأقدمية في الرتب لمدة خمس (05) سنوات — سارية ابتداءً من 01 جانفي 2025 إلى 31 ديسمبر 2029:
                </span>
                الترخيص بجمع الأقدمية المكتسبة في الرتبة الأصلية قبل الإدماج مع الأقدمية في الرتبة الجديدة لمدة انتقالية قدرها 05 سنوات (سارية ابتداءً من 01 جانفي 2025 إلى غاية 31 ديسمبر 2029) للمشاركة في الامتحانات المهنية والتسجيل في قوائم التأهيل.
              </li>
              <li className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <span className="font-extrabold text-emerald-300 block mb-0.5">
                  3. امتياز التقاعد المسبق عند 57 سنة (للرجال) و 52 سنة (للنساء):
                </span>
                تخفيض السن القانونية للتقاعد بـ 03 إلى 05 سنوات لفائدة أسلاك التدريس تقديراً لخصوصية المهنة، مع إمكانية تخفيف الحجم الساعي في السنوات الأخيرة قبل التقاعد.
              </li>
              <li className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <span className="font-extrabold text-emerald-300 block mb-0.5">
                  4. الإعفاء من المهام غير البيداغوجية وتخفيف النصاب الساعي:
                </span>
                إعفاء أساتذة المدرسة الابتدائية نهائياً من مهام الحراسة في الساحة والمطاعم المدرسية، وتخفيض النصاب الأسبوعي للأستاذ المكون والأستاذ المميز للتفرغ للتنسيق والمرافقة.
              </li>
            </ul>
          </div>

          <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-[#f5d77f] flex items-center gap-2 pb-2 border-b border-[#d4af37]/20">
              <Coins className="w-5 h-5" />
              <span>أبرز المنح والعلاوات المالية في المرسوم التنفيذي 25-55 (النظام التعويضي)</span>
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <span className="font-extrabold text-[#f5d77f] block mb-0.5">
                  1. رفع نسب تعويض التأهيل وتعويض الخبرة البيداغوجية:
                </span>
                رفع نسبة تعويض التأهيل لتتراوح بين 45% و 60% من الراتب الرئيسي حسب الرتبة، مع احتساب تعويض الخبرة البيداغوجية بنسبة 4% عن كل درجة استدلالية.
              </li>
              <li className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <span className="font-extrabold text-[#f5d77f] block mb-0.5">
                  2. تثمين منحة التوثيق التربوي والدعم المدرسي والمعالجة:
                </span>
                رفع القيمة الجزافية لتعويض التوثيق التربوي لمواكبة الرقمنة، وترسيم تعويض الدعم المدرسي والمعالجة البيداغوجية بنسبة 15% من الراتب الرئيسي.
              </li>
              <li className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <span className="font-extrabold text-[#f5d77f] block mb-0.5">
                  3. منحة تحسين الأداء التربوي وتجديد المعارف (المردودية 40%):
                </span>
                احتساب منحة المردودية بسقف 40% من الراتب الرئيسي الجديد المرفوع، مما يرفع قيمتها الصافية الثلاثية بشكل معتبر لجميع الرتب.
              </li>
              <li className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <span className="font-extrabold text-[#f5d77f] block mb-0.5">
                  4. العطلة العلمية، السكن الوظيفي، ومنح التصحيح والحراسة:
                </span>
                الحق في عطلة علمية لتجديد المعارف، أولوية الاستفادة من السكن الوظيفي أو رفع منحة تعويض الإيجار، ومراجعة تعويضات تسيير وحراسة وتصحيح الامتحانات الرسمية (BAC / BEM).
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
