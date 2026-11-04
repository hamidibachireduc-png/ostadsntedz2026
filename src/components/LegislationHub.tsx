import React, { useState } from 'react';
import {
  Scale,
  Search,
  BookOpen,
  FileText,
  Briefcase,
  CheckCircle2,
  Award,
  Layers,
} from 'lucide-react';
import { LEGISLATION_DOCUMENTS, STATUTORY_MISSIONS_DATA, STAGES_METADATA } from '../data';
import { LegislationDocument, EducationalStage } from '../types';

export const LegislationHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDoc, setActiveDoc] = useState<LegislationDocument>(LEGISLATION_DOCUMENTS[0]);
  const [missionStageFilter, setMissionStageFilter] = useState<'all' | EducationalStage>('all');

  const categories = [
    { id: 'all', label: 'جميع النصوص التشريعية' },
    { id: 'statutory_missions', label: 'قسم المهام القانونية والبيداغوجية' },
    { id: 'statute_25_54', label: 'القانون الأساسي 25-54 (2026)' },
    { id: 'pedagogy_curricula', label: 'التفتيش والوثائق الإجبارية' },
    { id: 'evaluation_councils', label: 'التقويم ومجالس الأقسام' },
    { id: 'career_salary', label: 'الأجور والترقية في الدرجات' },
    { id: 'exams_digital', label: 'الرقمنة والامتحانات الرسمية' },
  ];

  const filteredDocs = LEGISLATION_DOCUMENTS.filter((doc) => {
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.includes(searchQuery) ||
      doc.number.includes(searchQuery) ||
      doc.description.includes(searchQuery) ||
      doc.tags.some((t) => t.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  const filteredMissionGroups = STATUTORY_MISSIONS_DATA.filter(
    (g) => missionStageFilter === 'all' || g.stageScope === 'all' || g.stageScope === missionStageFilter
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-[#d4af37]" />
              <span>الركن التشريعي، مدونة المهام القانونية، والمرسوم التنفيذي 25-54 (2026)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              موسوعة النصوص القانونية، مدونة المهام الرسمية لأساتذة الأطوار الثلاثة (الأستاذ، الأستاذ الرئيسي، منسق
              المادة، الأستاذ المكون والمميز)، وضوابط الترقية والتقويم
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory('statutory_missions')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'statutory_missions'
                ? 'bg-[#d4af37] text-[#06150e] shadow-lg'
                : 'bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>فتح قسم المهام القانونية والبيداغوجية للأستاذ</span>
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mt-5 pt-4 border-t border-[#d4af37]/20">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#05140d] border border-[#d4af37]/25">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#105e32] text-[#f5d77f] border border-[#d4af37]/50'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم المرسوم، القرار، المهام، الكلمات المفتاحية..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-[#05140d] border border-[#d4af37]/30 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>
      </div>

      {/* Dedicated Statutory Missions Interactive Matrix (When statutory_missions or all is active) */}
      {selectedCategory === 'statutory_missions' && (
        <div className="bg-[#081c12] border-2 border-[#d4af37]/60 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d4af37]/25">
            <div>
              <h3 className="text-lg font-black text-[#f5d77f] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#d4af37]" />
                <span>قسم المهام القانونية والبيداغوجية لأساتذة الأطوار الثلاثة (وفق المرسوم 25-54 والقرار 834)</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                تصنيف مفصل لمهام التدريس، مهام الأستاذ الرئيسي للقسم، مهام منسق المادة، والضمانات القانونية الجديدة
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
              {[
                { id: 'all', label: 'كل الأطوار والرتب' },
                { id: 'primary', label: 'الطور الابتدائي' },
                { id: 'middle', label: 'الطور المتوسط' },
                { id: 'secondary', label: 'الطور الثانوي' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setMissionStageFilter(st.id as 'all' | EducationalStage)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    missionStageFilter === st.id
                      ? 'bg-[#d4af37] text-[#06150e]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredMissionGroups.map((group) => (
              <div key={group.id} className="bg-[#05140d] border border-[#d4af37]/30 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#d4af37]/20">
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#d4af37]" />
                      <span>{group.roleTitle}</span>
                    </h4>
                    <div className="text-xs text-[#f5d77f] mt-0.5">{group.legalRef}</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-300">{group.categoryLabel}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.missions.map((m) => (
                    <div
                      key={m.code}
                      className="p-4 rounded-xl bg-[#092116] border border-[#d4af37]/25 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#f5d77f] mb-1">{m.code}</div>
                        <h5 className="text-sm font-extrabold text-white mb-1.5">{m.title}</h5>
                        <p className="text-xs text-slate-300 leading-relaxed">{m.details}</p>
                      </div>
                      <div className="pt-2.5 border-t border-[#d4af37]/15">
                        <div className="text-[11px] font-bold text-emerald-300 mb-1">
                          السجلات والوثائق الإثباتية المرتبطة بالمهمة:
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {m.mandatoryDocuments.join(' · ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Split: Docs List + Detailed Articles Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDocs.map((doc) => {
            const isSelected = activeDoc.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d2e1e] border-[#d4af37] shadow-md'
                    : 'bg-[#081c12] border-[#d4af37]/25 hover:border-[#d4af37]/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-[#f5d77f] font-bold mb-1">
                  <span>{doc.number}</span>
                  {doc.isUpdated2026 && <span className="text-emerald-300">· تحيين 2026</span>}
                </div>
                <h3 className="text-sm font-extrabold text-white leading-snug mb-1.5">{doc.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{doc.description}</p>
                <div className="text-[11px] text-slate-400">{doc.tags.join(' · ')}</div>
              </div>
            );
          })}
        </div>

        {/* Right Full Text & Key Articles (7 Cols) */}
        <div className="lg:col-span-7 bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 space-y-5">
          <div className="pb-4 border-b border-[#d4af37]/25">
            <div className="text-xs font-bold text-[#f5d77f] mb-1">
              {activeDoc.number} · {activeDoc.date}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">{activeDoc.title}</h3>
          </div>

          <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/25">
            <div className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#d4af37]" />
              <span>مقتطف الديباجة والأحكام التنظيمية العامة:</span>
            </div>
            <div className="whitespace-pre-line text-xs sm:text-sm text-slate-200 leading-relaxed">
              {activeDoc.fullText}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-[#f5d77f] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>المواد القانونية المرجعية وتطبيقاتها العملية للأستاذ:</span>
            </h4>
            {activeDoc.keyArticles.map((art, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0a2317] border border-[#d4af37]/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#f5d77f]">
                  <span>{art.articleNumber}</span>
                  <span className="text-emerald-300">{art.summary}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{art.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
