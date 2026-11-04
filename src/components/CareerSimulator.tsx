import React, { useState } from 'react';
import { TrendingUp, Award, Calculator, Clock, CheckCircle2 } from 'lucide-react';
import { TeacherProfile, EducationalStage } from '../types';
import { RANK_GRID_2026, STAGES_METADATA } from '../data';

interface CareerSimulatorProps {
  profile: TeacherProfile;
}

export const CareerSimulator: React.FC<CareerSimulatorProps> = ({ profile }) => {
  const [selectedStage, setSelectedStage] = useState<EducationalStage>(profile.stage);
  const stageRanks = RANK_GRID_2026.filter((r) => r.stage === selectedStage);

  const [selectedRankIdx, setSelectedRankIdx] = useState<number>(1);
  const [selectedEchelon, setSelectedEchelon] = useState<number>(profile.echelon || 7);
  const [inspectorMark, setInspectorMark] = useState<number>(18.5);
  const [adminMark, setAdminMark] = useState<number>(19.5);
  const [yearsInCurrentEchelon, setYearsInCurrentEchelon] = useState<number>(2);
  const [isSouthZone, setIsSouthZone] = useState<boolean>(false);

  const currentRank = stageRanks[selectedRankIdx] || stageRanks[0];
  const echelonIndexPoints = currentRank.echelonIndices[selectedEchelon - 1] || 0;
  const totalIndexPoints = currentRank.baseIndex + echelonIndexPoints;

  // Algerian Civil Service Point Value = 45 DZD
  const pointValueDZD = 45;
  const baseSalary = totalIndexPoints * pointValueDZD;
  const experienceAllowance = echelonIndexPoints * pointValueDZD;
  const pedagogicalAllowance = Math.round(baseSalary * 0.42); // Documentation, pedagogical qualification, support
  const zoneAllowance = isSouthZone ? 14500 : 0;
  const grossMonthly = baseSalary + pedagogicalAllowance + zoneAllowance;
  const estimatedNetMonthly = Math.round(grossMonthly * 0.81); // After social security (9%) & IRG

  // Quarterly Profitability Bonus (Mardoudiya - 40% every 3 months)
  const quarterlyBonusNet = Math.round(baseSalary * 1.05);

  // Echelon Promotion Pace Calculation (Decree 07-304: Min 2.5y, Med 3y, Max 3.5y)
  const combinedScore = inspectorMark * 2 + adminMark; // Out of 60
  const promotionPace =
    combinedScore >= 54
      ? { label: 'المدة الدنيا (سنتان و 6 أشهر)', yearsRequired: 2.5 }
      : combinedScore >= 46
      ? { label: 'المدة المتوسطة (3 سنوات)', yearsRequired: 3.0 }
      : { label: 'المدة القصوى (3 سنوات و 6 أشهر)', yearsRequired: 3.5 };

  const remainingTimeYears = Math.max(0, Number((promotionPace.yearsRequired - yearsInCurrentEchelon).toFixed(1)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#d4af37]" />
              <span>محاكي الرتب الجديدة (المرسوم 25-54)، الشبكة الاستدلالية، والترقية في الدرجات الـ 12</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              حساب فوري للنقاط الاستدلالية، الأجر الصافي التقديري، منحة المردودية، وتاريخ استحقاق الدرجة الموالية
              لأساتذة الأطوار الثلاثة
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
            {(['primary', 'middle', 'secondary'] as EducationalStage[]).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStage(st);
                  setSelectedRankIdx(1);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStage === st
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {STAGES_METADATA[st].shortTitle}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split: Simulator Controls + Results & 12-Echelon Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4 text-xs sm:text-sm">
          <h3 className="font-extrabold text-white text-base pb-3 border-b border-[#d4af37]/20 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#d4af37]" />
            <span>معطيات الرتبة والدرجة والنقطة البيداغوجية</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              الرتبة القانونية في {STAGES_METADATA[selectedStage].shortTitle} (تحيين 25-54)
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

          <div className="grid grid-cols-2 gap-3 pt-2">
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

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              الأقدمية المكتسبة في الدرجة الحالية (بالسنوات)
            </label>
            <input
              type="number"
              step="0.5"
              min={0}
              max={3.5}
              value={yearsInCurrentEchelon}
              onChange={(e) => setYearsInCurrentEchelon(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-mono tabular-nums"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="southZone"
              checked={isSouthZone}
              onChange={(e) => setIsSouthZone(e.target.checked)}
              className="w-4 h-4 accent-[#d4af37]"
            />
            <label htmlFor="southZone" className="text-xs text-slate-200 cursor-pointer">
              الاستفادة من تعويض المنطقة الجغرافية والامتياز (الجنوب والهضاب العليا)
            </label>
          </div>
        </div>

        {/* Right Results & Full 12-Echelon Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Financial & Promotion Summary Cards */}
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

            <div className="p-4 rounded-2xl bg-[#092417] border border-[#d4af37]/50">
              <div className="text-xs text-slate-300">الراتب الشهري الصافي التقديري</div>
              <div className="text-2xl font-black text-emerald-300 font-mono tabular-nums mt-1">
                {estimatedNetMonthly.toLocaleString('fr-DZ')} د.ج
              </div>
              <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
                منحة المردودية الثلاثية: ~{quarterlyBonusNet.toLocaleString('fr-DZ')} د.ج
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#092417] border border-[#d4af37]/50">
              <div className="text-xs text-slate-300">وتيرة الترقية للدرجة {Math.min(12, selectedEchelon + 1)}</div>
              <div className="text-sm font-black text-white mt-1">{promotionPace.label}</div>
              <div className="text-[11px] text-[#f5d77f] mt-1 tabular-nums">
                المدة المتبقية للترقية: {remainingTimeYears} سنة
              </div>
            </div>
          </div>

          {/* 12 Echelons Matrix for Current Rank */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6">
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-3 flex items-center gap-2">
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
    </div>
  );
};
