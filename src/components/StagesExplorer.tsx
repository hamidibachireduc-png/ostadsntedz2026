import React, { useState } from 'react';
import {
  Layers,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Scale,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { EducationalStage, TeacherProfile } from '../types';
import { STAGES_METADATA } from '../data';

interface StagesExplorerProps {
  profile: TeacherProfile;
  onSwitchStage: (stage: EducationalStage) => void;
}

export const StagesExplorer: React.FC<StagesExplorerProps> = ({ profile, onSwitchStage }) => {
  const [selectedStage, setSelectedStage] = useState<EducationalStage>(profile.stage);
  const currentMeta = STAGES_METADATA[selectedStage];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#d4af37]" />
              <span>دليل الأطوار التعليمية الثلاثة (الابتدائي · المتوسط · الثانوي)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              المرجعية الشاملة لهيكلة الرتب الجديدة وفق المرسوم التنفيذي 25-54، الحجم الساعي القانوني، أنظمة التقويم،
              والمواد التعليمية لكل طور
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
            {(['primary', 'middle', 'secondary'] as EducationalStage[]).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStage(st)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStage === st
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {STAGES_METADATA[st].title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Stage Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Ranks Table & Evaluation System */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ranks & Classification Table (Decree 25-54) */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#d4af37]/20 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#d4af37]" />
                  <span>سلم الرتب والتصنيف الاستدلالي في {currentMeta.title} (المرسوم 25-54)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  النصاب الساعي الرسمي: <span className="text-[#f5d77f] font-bold">{currentMeta.weeklyHours}</span>
                </p>
              </div>
              {profile.stage !== selectedStage && (
                <button
                  onClick={() => onSwitchStage(selectedStage)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] text-xs font-bold border border-[#d4af37]/40 cursor-pointer shrink-0"
                >
                  تفعيل هذا الطور في حسابي
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#d4af37]/30 text-[#f5d77f] bg-[#05140d]">
                    <th className="py-3 px-3 font-bold">الرتبة القانونية</th>
                    <th className="py-3 px-3 font-bold text-center">الصنف (2026)</th>
                    <th className="py-3 px-3 font-bold text-center">الرقم الاستدلالي القاعدي</th>
                    <th className="py-3 px-3 font-bold">شروط التوظيف والترقية القانونية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4af37]/15">
                  {currentMeta.baseRanks.map((rk) => (
                    <tr key={rk.code} className="hover:bg-[#0c291b]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{rk.name}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-300 tabular-nums">
                        الصنف {rk.category2026}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#f5d77f] tabular-nums">
                        {rk.index2026} نقطة
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-xs leading-relaxed">{rk.promotionCondition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evaluation System & Pedagogical Rules */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 pb-3 border-b border-[#d4af37]/20">
              <Scale className="w-5 h-5 text-[#d4af37]" />
              <span>نظام التقويم البيداغوجي والامتحانات الرسمية في {currentMeta.title}</span>
            </h3>

            <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
              <div className="text-xs text-[#f5d77f] font-bold mb-1">المعادلة الرسمية لحساب المعدل الفصلي للمادة:</div>
              <div className="text-sm font-bold text-white font-mono">{currentMeta.evaluationSystem.formula}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-300">عناصر التقييم المستمر والفصلي:</div>
              {currentMeta.evaluationSystem.components.map((comp, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <span>{comp}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#d4af37]/20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#05140d]">
                <div className="font-bold text-[#f5d77f] mb-1">الامتحان الوطني الرسمي للطور:</div>
                <div className="text-slate-200">{currentMeta.officialExams}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#05140d]">
                <div className="font-bold text-[#f5d77f] mb-1">مجالس الأقسام والتنسيق:</div>
                <div className="text-slate-200">{currentMeta.evaluationSystem.councilRules}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Levels, Subjects, and Obligations */}
        <div className="space-y-6">
          {/* Educational Levels */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-[#d4af37]/20 mb-3">
              <GraduationCap className="w-4 h-4 text-[#d4af37]" />
              <span>المستويات الدراسية والأفواج في {currentMeta.shortTitle}</span>
            </h3>
            <div className="space-y-2">
              {currentMeta.levels.map((lvl, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-[#05140d] border border-[#d4af37]/20 text-xs font-semibold text-slate-200 flex items-center gap-2"
                >
                  <span className="text-[#f5d77f] font-mono tabular-nums">0{i + 1}.</span>
                  <span>{lvl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects List */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-[#d4af37]/20 mb-3">
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              <span>مواد الاختصاص والتدريس ({currentMeta.subjects.length})</span>
            </h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pl-1">
              {currentMeta.subjects.map((sub, i) => (
                <div key={i} className="text-xs text-slate-300 py-1.5 px-2.5 rounded bg-[#05140d] flex items-center gap-2">
                  <span className="text-[#d4af37]">·</span>
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pedagogical Highlights */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 pb-3 border-b border-[#d4af37]/20 mb-3">
              <FileCheck className="w-4 h-4 text-[#d4af37]" />
              <span>الالتزامات البيداغوجية الأساسية للأستاذ</span>
            </h3>
            <div className="space-y-2.5">
              {currentMeta.pedagogicalHighlights.map((hl, i) => (
                <div key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="text-[#f5d77f] font-bold">•</span>
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
