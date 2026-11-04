import React, { useState } from 'react';
import {
  Landmark,
  Users,
  FileText,
  Printer,
  Plus,
  CheckCircle2,
  BookOpen,
  Trash2,
} from 'lucide-react';
import {
  TeacherProfile,
  CouncilDirectoryItem,
  CouncilMinutesRecord,
  EducationalStage,
} from '../types';
import { COUNCILS_DIRECTORY, INITIAL_COUNCIL_MINUTES, STAGES_METADATA } from '../data';

interface CouncilsHubProps {
  profile: TeacherProfile;
}

export const CouncilsHub: React.FC<CouncilsHubProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'minutes_generator'>('directory');
  const [selectedCouncil, setSelectedCouncil] = useState<CouncilDirectoryItem>(COUNCILS_DIRECTORY[0]);

  const [minutesList, setMinutesList] = useState<CouncilMinutesRecord[]>(() => {
    const saved = localStorage.getItem('snte_teachers_council_minutes_2026');
    return saved ? JSON.parse(saved) : INITIAL_COUNCIL_MINUTES;
  });

  const [selectedMinutes, setSelectedMinutes] = useState<CouncilMinutesRecord>(minutesList[0]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newMinutes, setNewMinutes] = useState({
    councilTitle: 'محضر اجتماع مجلس القسم الفصلي',
    targetClassOrSubject: `القسم: ${profile.assignedClasses[0] || '3 ع ت 1'}`,
    date: new Date().toISOString().slice(0, 10),
    term: profile.currentTerm,
    agenda:
      '1. دراسة الحصيلة البيداغوجية والسلوكية للفوج.\n2. تحليل نسب النجاح حسب المواد.\n3. منح الإجازات الشرفية (تهنئة، لوحة شرف، تشجيع) وضبط قائمة المعالجة البيداغوجية.',
    statisticsSummary:
      'تعداد الفوج: 34 تلميذاً | المعدل العام للقسم: 13.10 / 20 | نسبة النجاح (≥10): 79.41% | أعلى معدل: 17.85 | أدنى معدل: 08.75.',
    decisionsAndRecommendations:
      '- المصادقة على قائمة التلاميذ المقترحين للتهاني ولوحة الشرف والتشجيع.\n- برمجة التلاميذ المتعثرين في حصص الدعم والمعالجة البيداغوجية الأسبوعية.\n- استدعاء أولياء التلاميذ ذوي النتائج المتراجعة للتنسيق.',
    attendees: `مدير المؤسسة (رئيساً)، ناظر الدراسات، ${profile.fullName} (الأستاذ الرئيسي مقرراً)، مستشار التوجيه، وأساتذة الفوج.`,
  });

  const saveMinutesToStorage = (updated: CouncilMinutesRecord[]) => {
    setMinutesList(updated);
    localStorage.setItem('snte_teachers_council_minutes_2026', JSON.stringify(updated));
  };

  const handleCreateMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CouncilMinutesRecord = {
      id: `cm-${Date.now()}`,
      councilId: selectedCouncil.id,
      councilTitle: newMinutes.councilTitle,
      stage: profile.stage,
      targetClassOrSubject: newMinutes.targetClassOrSubject,
      date: newMinutes.date,
      term: newMinutes.term,
      agenda: newMinutes.agenda,
      statisticsSummary: newMinutes.statisticsSummary,
      decisionsAndRecommendations: newMinutes.decisionsAndRecommendations,
      attendees: newMinutes.attendees,
    };
    const updated = [created, ...minutesList];
    saveMinutesToStorage(updated);
    setSelectedMinutes(created);
    setShowCreateForm(false);
  };

  const handleDeleteMinutes = (id: string) => {
    const remaining = minutesList.filter((m) => m.id !== id);
    saveMinutesToStorage(remaining);
    if (selectedMinutes?.id === id && remaining.length > 0) {
      setSelectedMinutes(remaining[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Landmark className="w-6 h-6 text-[#d4af37]" />
              <span>قسم المجالس البيداغوجية والإدارية في الأطوار الثلاثة · الدليل التنظيمي ومحاضر الاجتماعات</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              المرجعية القانونية لمجالس الأقسام، مجالس التعليم، مجلس الأساتذة (ابتدائي)، مجلس التربية والتسيير، ومجلس
              التأديب مع مولّد وحافظ المحاضر الرسمية للطباعة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-[#d4af37] text-[#06150e] shadow'
                  : 'bg-[#05140d] text-slate-300 border border-[#d4af37]/30'
              }`}
            >
              دليل المجالس وصلاحيات الأستاذ (5 مجالس)
            </button>
            <button
              onClick={() => setActiveTab('minutes_generator')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'minutes_generator'
                  ? 'bg-[#d4af37] text-[#06150e] shadow'
                  : 'bg-[#05140d] text-slate-300 border border-[#d4af37]/30'
              }`}
            >
              مولّد وحافظ محاضر المجالس (A4)
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Councils Directory */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left List of Councils (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            {COUNCILS_DIRECTORY.map((c) => {
              const active = selectedCouncil.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCouncil(c)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0d2e1e] border-[#d4af37] shadow-lg'
                      : 'bg-[#081c12] border-[#d4af37]/25 hover:border-[#d4af37]/60'
                  }`}
                >
                  <div className="text-xs font-bold text-[#f5d77f] mb-1">{c.decreeRef}</div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mb-1.5">{c.title}</h3>
                  <div className="text-xs text-slate-300">
                    <strong>الدورية:</strong> {c.periodicity}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detailed Council Specification (7 Cols) */}
          <div className="lg:col-span-7 bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 space-y-5">
            <div className="pb-4 border-b border-[#d4af37]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#f5d77f] mb-1">{selectedCouncil.decreeRef}</div>
                <h3 className="text-lg sm:text-xl font-black text-white">{selectedCouncil.title}</h3>
              </div>
              <button
                onClick={() => setActiveTab('minutes_generator')}
                className="px-3.5 py-2 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] text-xs font-bold border border-[#d4af37]/40 cursor-pointer shrink-0"
              >
                تحرير محضر لهذا المجلس
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#05140d] border border-[#d4af37]/25">
                <div className="font-bold text-[#f5d77f] mb-1">رئاسة المجلس القانونية:</div>
                <div className="text-slate-200">{selectedCouncil.presidency}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#05140d] border border-[#d4af37]/25">
                <div className="font-bold text-[#f5d77f] mb-1">دورية الانعقاد السنوية:</div>
                <div className="text-slate-200">{selectedCouncil.periodicity}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/25 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#d4af37]" />
                <span>التشكيلة القانونية لأعضاء المجلس:</span>
              </h4>
              <ul className="space-y-1 text-xs sm:text-sm text-slate-200">
                {selectedCouncil.members.map((mem, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#d4af37] font-bold">·</span>
                    <span>{mem}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#f5d77f] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>الصلاحيات والاختصاصات البيداغوجية والتنظيمية للمجلس:</span>
              </h4>
              <div className="space-y-2">
                {selectedCouncil.coreCompetencies.map((comp, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#0a2317] border border-[#d4af37]/20 text-xs sm:text-sm text-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0d2e1e] border border-[#d4af37]/50 space-y-2">
              <div className="text-xs font-extrabold text-[#f5d77f]">
                دور والتزامات الأستاذ / الأستاذ الرئيسي / منسق المادة في هذا المجلس:
              </div>
              {selectedCouncil.teacherRole.map((role, i) => (
                <div key={i} className="text-xs sm:text-sm text-white flex items-start gap-2">
                  <span className="text-[#f5d77f] font-bold">•</span>
                  <span>{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Council Minutes Generator & Archive */}
      {activeTab === 'minutes_generator' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء وحفظ محضر مجلس جديد</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة محضر المجلس الرسمي (A4)</span>
            </button>
          </div>

          {showCreateForm && (
            <form
              onSubmit={handleCreateMinutes}
              className="bg-[#092216] border border-[#d4af37] rounded-2xl p-6 space-y-4 text-xs sm:text-sm no-print"
            >
              <h3 className="font-extrabold text-[#f5d77f] text-base border-b border-[#d4af37]/25 pb-2">
                تحرير وحفظ محضر اجتماع مجلس رسمي (قسم / تعليم / أساتذة)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">عنوان المحضر</label>
                  <input
                    type="text"
                    value={newMinutes.councilTitle}
                    onChange={(e) => setNewMinutes({ ...newMinutes, councilTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">الفوج التربوي أو المادة المعنية</label>
                  <input
                    type="text"
                    value={newMinutes.targetClassOrSubject}
                    onChange={(e) => setNewMinutes({ ...newMinutes, targetClassOrSubject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">تاريخ الانعقاد</label>
                  <input
                    type="date"
                    value={newMinutes.date}
                    onChange={(e) => setNewMinutes({ ...newMinutes, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">جدول أعمال الجلسة</label>
                  <textarea
                    rows={3}
                    value={newMinutes.agenda}
                    onChange={(e) => setNewMinutes({ ...newMinutes, agenda: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">الحصيلة الإحصائية والبيداغوجية</label>
                  <textarea
                    rows={3}
                    value={newMinutes.statisticsSummary}
                    onChange={(e) => setNewMinutes({ ...newMinutes, statisticsSummary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">القرارات والتوصيات البيداغوجية المصادق عليها</label>
                <textarea
                  rows={3}
                  value={newMinutes.decisionsAndRecommendations}
                  onChange={(e) => setNewMinutes({ ...newMinutes, decisionsAndRecommendations: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#d4af37] text-[#06150e] font-extrabold cursor-pointer"
                >
                  حفظ المحضر في الأرشيف وعرضه للطباعة
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Saved Minutes List (4 Cols) */}
            <div className="lg:col-span-4 space-y-3 no-print">
              <div className="text-xs font-bold text-[#f5d77f]">المحاضر المحفوظة ({minutesList.length}):</div>
              {minutesList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMinutes(m)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedMinutes?.id === m.id
                      ? 'bg-[#0d2e1e] border-[#d4af37]'
                      : 'bg-[#081c12] border-[#d4af37]/25'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-mono tabular-nums text-[#f5d77f]">{m.date}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMinutes(m.id);
                      }}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">{m.councilTitle}</div>
                  <div className="text-xs text-slate-300 mt-1">{m.targetClassOrSubject}</div>
                </div>
              ))}
            </div>

            {/* Official Printable A4 Minutes Preview (8 Cols) */}
            <div className="lg:col-span-8">
              {selectedMinutes && (
                <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border-2 border-[#d4af37] print-sheet font-official space-y-5">
                  <div className="text-center border-b-2 border-slate-900 pb-4">
                    <div className="text-lg font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                    <div className="text-base font-bold">وزارة التربية الوطنية</div>
                    <div className="flex justify-between text-xs font-sans font-bold text-slate-800 mt-3 pt-2 border-t border-slate-300">
                      <div>{profile.wilaya} — {profile.schoolName}</div>
                      <div>السنة الدراسية: {profile.schoolYear} (الفصل {selectedMinutes.term})</div>
                      <div>التاريخ: {selectedMinutes.date}</div>
                    </div>
                  </div>

                  <div className="bg-slate-100 border-2 border-slate-900 p-3 text-center font-sans">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">{selectedMinutes.councilTitle}</h3>
                    <div className="text-xs font-bold text-slate-700 mt-1">{selectedMinutes.targetClassOrSubject}</div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm font-sans text-slate-900">
                    <div className="border border-slate-800 p-3 rounded">
                      <div className="font-bold border-b border-slate-300 pb-1 mb-1.5">1. الهيئة الحاضرة في الجلسة:</div>
                      <div>{selectedMinutes.attendees}</div>
                    </div>

                    <div className="border border-slate-800 p-3 rounded">
                      <div className="font-bold border-b border-slate-300 pb-1 mb-1.5">2. جدول أعمال المجلس:</div>
                      <div className="whitespace-pre-line leading-relaxed">{selectedMinutes.agenda}</div>
                    </div>

                    <div className="border border-slate-800 p-3 rounded">
                      <div className="font-bold border-b border-slate-300 pb-1 mb-1.5">
                        3. الحصيلة الإحصائية والبيداغوجية المسجلة:
                      </div>
                      <div className="whitespace-pre-line leading-relaxed">{selectedMinutes.statisticsSummary}</div>
                    </div>

                    <div className="border border-slate-800 p-3 rounded">
                      <div className="font-bold border-b border-slate-300 pb-1 mb-1.5">
                        4. القرارات والتوصيات البيداغوجية المصادق عليها:
                      </div>
                      <div className="whitespace-pre-line leading-relaxed">
                        {selectedMinutes.decisionsAndRecommendations}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t-2 border-slate-900 text-xs font-sans font-bold text-center">
                    <div>
                      <div>الأستاذ المقرر / منسق المادة</div>
                      <div className="font-normal text-slate-700 mt-1">{profile.fullName}</div>
                      <div className="h-14" />
                    </div>
                    <div>
                      <div>ناظر الدراسات / مستشار التربية</div>
                      <div className="h-14" />
                    </div>
                    <div>
                      <div>خاتم وإمضاء مدير المؤسسة</div>
                      <div className="h-14" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
