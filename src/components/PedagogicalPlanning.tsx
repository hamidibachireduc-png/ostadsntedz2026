import React, { useState } from 'react';
import {
  BookOpenCheck,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  FileSignature,
  Trash2,
  Search,
  Layers,
} from 'lucide-react';
import { LessonPlanItem, TeacherProfile, EducationalStage } from '../types';
import { STAGES_METADATA } from '../data';

interface PedagogicalPlanningProps {
  profile: TeacherProfile;
  lessonPlans: LessonPlanItem[];
  onUpdateLessonPlans: (items: LessonPlanItem[]) => void;
}

export const PedagogicalPlanning: React.FC<PedagogicalPlanningProps> = ({
  profile,
  lessonPlans,
  onUpdateLessonPlans,
}) => {
  const [filterStage, setFilterStage] = useState<'all' | EducationalStage>(profile.stage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<LessonPlanItem | null>(
    lessonPlans.find((l) => l.stage === profile.stage) || lessonPlans[0] || null
  );
  const [isAdding, setIsAdding] = useState(false);

  // New Lesson Form State
  const [newLesson, setNewLesson] = useState({
    stage: profile.stage,
    subject: profile.subject,
    level: profile.assignedClasses[0] || STAGES_METADATA[profile.stage].levels[0],
    term: profile.currentTerm,
    weekNumber: 22,
    domain: '',
    lessonTitle: '',
    competencyTarget: '',
    objectivesText: '',
    pedagogicalSupports: 'الكتاب المدرسي، السبورة، التدرج السنوي 2025/2026، جهاز العرض الرقمي.',
    evaluationCriteria: '',
    durationMinutes: 60,
    date: new Date().toISOString().slice(0, 10),
  });

  const filteredPlans = lessonPlans.filter((item) => {
    const matchesStage = filterStage === 'all' || item.stage === filterStage;
    const matchesSearch =
      item.lessonTitle.includes(searchQuery) ||
      item.domain.includes(searchQuery) ||
      item.subject.includes(searchQuery) ||
      item.level.includes(searchQuery);
    return matchesStage && matchesSearch;
  });

  const handleToggleStatus = (id: string) => {
    const updated = lessonPlans.map((item) => {
      if (item.id !== id) return item;
      const nextStatus: LessonPlanItem['status'] =
        item.status === 'planned' ? 'in_progress' : item.status === 'in_progress' ? 'completed' : 'planned';
      const updatedItem = { ...item, status: nextStatus, logbookSigned: nextStatus === 'completed' };
      if (selectedLesson?.id === id) setSelectedLesson(updatedItem);
      return updatedItem;
    });
    onUpdateLessonPlans(updated);
  };

  const handleToggleLogbook = (id: string) => {
    const updated = lessonPlans.map((item) => {
      if (item.id !== id) return item;
      const updatedItem = { ...item, logbookSigned: !item.logbookSigned };
      if (selectedLesson?.id === id) setSelectedLesson(updatedItem);
      return updatedItem;
    });
    onUpdateLessonPlans(updated);
  };

  const handleDeleteLesson = (id: string) => {
    const remaining = lessonPlans.filter((item) => item.id !== id);
    onUpdateLessonPlans(remaining);
    if (selectedLesson?.id === id) {
      setSelectedLesson(remaining[0] || null);
    }
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const created: LessonPlanItem = {
      id: `lp-${Date.now()}`,
      stage: newLesson.stage,
      subject: newLesson.subject,
      level: newLesson.level,
      term: newLesson.term,
      weekNumber: Number(newLesson.weekNumber),
      domain: newLesson.domain,
      lessonTitle: newLesson.lessonTitle,
      competencyTarget: newLesson.competencyTarget,
      learningObjectives: newLesson.objectivesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      pedagogicalSupports: newLesson.pedagogicalSupports,
      evaluationCriteria: newLesson.evaluationCriteria,
      durationMinutes: Number(newLesson.durationMinutes),
      status: 'planned',
      logbookSigned: false,
      date: newLesson.date,
    };
    const updated = [created, ...lessonPlans];
    onUpdateLessonPlans(updated);
    setSelectedLesson(created);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpenCheck className="w-6 h-6 text-[#d4af37]" />
              <span>التدرجات السنوية، المذكرات البيداغوجية، وكراس النصوص / الدفتر اليومي</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              إدارة المذكرات التربوية وفق المقاربة بالكفاءات للأطوار الثلاثة مع معاينة وطباعة البطاقة الفنية الرسمية للحصة
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مذكرة بيداغوجية جديدة</span>
            </button>
            {selectedLesson && (
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة المذكرة المعروضة (A4)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-[#d4af37]/20">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#05140d] border border-[#d4af37]/25 overflow-x-auto">
            {[
              { id: 'all', label: 'كل الأطوار' },
              { id: 'primary', label: 'الطور الابتدائي' },
              { id: 'middle', label: 'الطور المتوسط' },
              { id: 'secondary', label: 'الطور الثانوي' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStage(tab.id as 'all' | EducationalStage)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterStage === tab.id
                    ? 'bg-[#105e32] text-[#f5d77f] border border-[#d4af37]/50'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المذكرات حسب العنوان، الميدان، المادة أو المستوى..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-[#05140d] border border-[#d4af37]/30 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>
      </div>

      {/* Add New Lesson Modal/Collapsible Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateLesson}
          className="bg-[#092216] border border-[#d4af37] rounded-2xl p-6 space-y-4 text-xs sm:text-sm no-print shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
            <h3 className="font-extrabold text-[#f5d77f] text-base">إنشاء بطاقة مذكرة بيداغوجية جديدة</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              إغلاق النموذج
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الطور التعليمي</label>
              <select
                value={newLesson.stage}
                onChange={(e) => setNewLesson({ ...newLesson, stage: e.target.value as EducationalStage })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              >
                <option value="primary">الطور الابتدائي</option>
                <option value="middle">الطور المتوسط</option>
                <option value="secondary">الطور الثانوي</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">المادة التعليمية</label>
              <input
                type="text"
                value={newLesson.subject}
                onChange={(e) => setNewLesson({ ...newLesson, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">المستوى والفوج</label>
              <input
                type="text"
                value={newLesson.level}
                onChange={(e) => setNewLesson({ ...newLesson, level: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">الميدان / الوحدة التعلمية</label>
              <input
                type="text"
                value={newLesson.domain}
                onChange={(e) => setNewLesson({ ...newLesson, domain: e.target.value })}
                placeholder="مثال: الميدان الثاني: الظواهر الميكانيكية / الدوال العددية"
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الأسبوع البيداغوجي والتاريخ</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={newLesson.weekNumber}
                  onChange={(e) => setNewLesson({ ...newLesson, weekNumber: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white tabular-nums"
                />
                <input
                  type="date"
                  value={newLesson.date}
                  onChange={(e) => setNewLesson({ ...newLesson, date: e.target.value })}
                  className="w-full px-2 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">عنوان الحصة التعلمية / الدرس</label>
            <input
              type="text"
              value={newLesson.lessonTitle}
              onChange={(e) => setNewLesson({ ...newLesson, lessonTitle: e.target.value })}
              placeholder="عنوان الدرس كما يدون في كراس النصوص والدفتر اليومي"
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الكفاءة المستهدفة</label>
              <textarea
                rows={2}
                value={newLesson.competencyTarget}
                onChange={(e) => setNewLesson({ ...newLesson, competencyTarget: e.target.value })}
                placeholder="الكفاءة المرحلية أو الختامية المستهدفة من الحصة..."
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                مركبات ومؤشرات التعلم (اكتب كل مؤشر في سطر)
              </label>
              <textarea
                rows={2}
                value={newLesson.objectivesText}
                onChange={(e) => setNewLesson({ ...newLesson, objectivesText: e.target.value })}
                placeholder="مؤشر 1: التعرف على المفهوم...\nمؤشر 2: تطبيق القاعدة في تمرين..."
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">السندات والوسائل التعليمية</label>
              <input
                type="text"
                value={newLesson.pedagogicalSupports}
                onChange={(e) => setNewLesson({ ...newLesson, pedagogicalSupports: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">معايير التقويم والوظيفة المنزلية</label>
              <input
                type="text"
                value={newLesson.evaluationCriteria}
                onChange={(e) => setNewLesson({ ...newLesson, evaluationCriteria: e.target.value })}
                placeholder="مثال: حل التمرين 4 ص 85 + تقويم مرحلي على الألواح"
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#d4af37] text-[#06150e] font-extrabold cursor-pointer"
            >
              حفظ وإدراج المذكرة في التدرج
            </button>
          </div>
        </form>
      )}

      {/* Main Content Split: Lesson List + Printable Official Fiche Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 no-print">
          {filteredPlans.map((plan) => {
            const isSelected = selectedLesson?.id === plan.id;
            const statusLabels = {
              completed: 'منجزة في القسم',
              in_progress: 'قيد الإنجاز',
              planned: 'مبرمجة في التدرج',
            };
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedLesson(plan)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d2e1e] border-[#d4af37] shadow-md'
                    : 'bg-[#081c12] border-[#d4af37]/25 hover:border-[#d4af37]/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#f5d77f] font-bold">{STAGES_METADATA[plan.stage].shortTitle}</span>
                    <span>·</span>
                    <span>الأسبوع {plan.weekNumber}</span>
                    <span>·</span>
                    <span className="tabular-nums">{plan.date}</span>
                  </div>
                  <span
                    className={`font-bold ${
                      plan.status === 'completed'
                        ? 'text-emerald-400'
                        : plan.status === 'in_progress'
                        ? 'text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {statusLabels[plan.status]}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-white mb-1">{plan.lessonTitle}</h4>
                <div className="text-xs text-slate-300 mb-3">
                  {plan.subject} · {plan.level}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#d4af37]/15 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(plan.id);
                      }}
                      className="px-2.5 py-1 rounded bg-[#05140d] hover:bg-[#105e32] text-[#f5d77f] border border-[#d4af37]/30 text-[11px] font-semibold cursor-pointer"
                    >
                      تغيير حالة الإنجاز
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLogbook(plan.id);
                      }}
                      className={`px-2.5 py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                        plan.logbookSigned
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                          : 'bg-[#05140d] text-slate-400 border-slate-700'
                      }`}
                    >
                      {plan.logbookSigned ? 'مدون في كراس النصوص ✓' : 'تأشير كراس النصوص'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLesson(plan.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="حذف المذكرة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Official Printable Lesson Fiche (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedLesson ? (
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-[#d4af37] print-sheet font-official">
              {/* Official Algerian Republic Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-5 space-y-1">
                <div className="text-base sm:text-lg font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div className="text-sm sm:text-base font-bold">وزارة التربية الوطنية</div>
                <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-sans font-semibold pt-2 text-slate-800">
                  <div>{profile.wilaya}</div>
                  <div>المؤسسة: {profile.schoolName}</div>
                  <div>السنة الدراسية: {profile.schoolYear}</div>
                </div>
              </div>

              {/* Fiche Title Box */}
              <div className="bg-slate-100 border-2 border-slate-900 p-3 text-center mb-5">
                <h3 className="text-lg sm:text-xl font-black font-sans text-slate-900">
                  بطاقة مذكرة تربوية نموذجية — {STAGES_METADATA[selectedLesson.stage].title}
                </h3>
                <div className="text-xs font-sans font-bold text-slate-700 mt-1">
                  الأستاذ(ة): {profile.fullName} · الرتبة: {profile.rank} · المادة: {selectedLesson.subject}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans border border-slate-900 p-3 mb-5 bg-slate-50">
                <div>
                  <span className="text-slate-600 block">المستوى والفوج:</span>
                  <strong className="text-slate-900">{selectedLesson.level}</strong>
                </div>
                <div>
                  <span className="text-slate-600 block">الفصل / الأسبوع:</span>
                  <strong className="text-slate-900 tabular-nums">
                    الفصل {selectedLesson.term} — الأسبوع {selectedLesson.weekNumber}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-600 block">الحجم الزمني:</span>
                  <strong className="text-slate-900 tabular-nums">{selectedLesson.durationMinutes} دقيقة</strong>
                </div>
                <div>
                  <span className="text-slate-600 block">تاريخ الإنجاز:</span>
                  <strong className="text-slate-900 tabular-nums">{selectedLesson.date}</strong>
                </div>
              </div>

              {/* Core Pedagogical Content */}
              <div className="space-y-4 text-sm font-sans">
                <div className="border border-slate-800 p-3 rounded">
                  <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                    1. الميدان / الوحدة التعلمية:
                  </div>
                  <div className="text-slate-800 font-semibold">{selectedLesson.domain}</div>
                </div>

                <div className="border border-slate-800 p-3 rounded">
                  <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                    2. عنوان المقطع / الحصة التعلمية:
                  </div>
                  <div className="text-slate-900 font-extrabold text-base">{selectedLesson.lessonTitle}</div>
                </div>

                <div className="border border-slate-800 p-3 rounded">
                  <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                    3. الكفاءة المستهدفة:
                  </div>
                  <div className="text-slate-800 leading-relaxed">{selectedLesson.competencyTarget}</div>
                </div>

                <div className="border border-slate-800 p-3 rounded">
                  <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                    4. مركبات الكفاءة ومؤشرات الأداء التعلمي (سيرورة الحصة):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-800">
                    {selectedLesson.learningObjectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-slate-800 p-3 rounded">
                    <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                      5. السندات والوسائل التعليمية:
                    </div>
                    <div className="text-slate-800 text-xs leading-relaxed">
                      {selectedLesson.pedagogicalSupports}
                    </div>
                  </div>
                  <div className="border border-slate-800 p-3 rounded">
                    <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                      6. معايير التقويم التحصيلي والنشاط المنزلي:
                    </div>
                    <div className="text-slate-800 text-xs leading-relaxed">{selectedLesson.evaluationCriteria}</div>
                  </div>
                </div>
              </div>

              {/* Signatures Footer */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t-2 border-slate-900 text-xs font-sans font-bold text-center">
                <div>
                  <div>إمضاء الأستاذ(ة)</div>
                  <div className="text-slate-600 font-normal mt-1">{profile.fullName}</div>
                  <div className="h-12" />
                </div>
                <div>
                  <div>مراقبة ناظر الثانوية / مدير المؤسسة</div>
                  <div className="text-slate-600 font-normal mt-1">تأشيرة المتابعة الدورية</div>
                  <div className="h-12" />
                </div>
                <div>
                  <div>تأشيرة السيد مفتش التربية الوطنية</div>
                  <div className="text-slate-600 font-normal mt-1">المقاطعة التفتيشية</div>
                  <div className="h-12" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-12 text-center text-slate-400">
              اختر مذكرة من القائمة الجانبية لمعاينتها وطباعتها
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
