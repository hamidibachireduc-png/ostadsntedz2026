import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Award,
  BookOpen,
  FileCheck,
  Printer,
  Plus,
} from 'lucide-react';
import { TeacherProfile } from '../types';
import { STAGES_METADATA } from '../data';

interface TrainingPortfolioProps {
  profile: TeacherProfile;
  onOpenDocumentGenerator: (docId: string) => void;
}

interface ChecklistItem {
  id: string;
  category: 'pedagogical' | 'regulatory' | 'assessment' | 'training';
  title: string;
  description: string;
  completed: boolean;
}

const INITIAL_PORTFOLIO_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    category: 'regulatory',
    title: 'المنهاج الرسمي، الوثيقة المرافقة، والتدرج السنوي المحدث 2025/2026',
    description: 'نسخة مصادق عليها من التدرج السنوي الوزاري مع جدول التوقيت الأسبوعي وقوائم الأفواج.',
    completed: true,
  },
  {
    id: 'chk-2',
    category: 'pedagogical',
    title: 'سجل المذكرات البيداغوجية المرقمة / الدفتر اليومي للتحضير',
    description: 'تحضير كتابي مسبق لكافة الحصص التعلمية وفق المقاربة بالكفاءات ومؤشرات الأداء.',
    completed: true,
  },
  {
    id: 'chk-3',
    category: 'pedagogical',
    title: 'مسك وتحيين كراس النصوص الفوجي (Cahier de Textes)',
    description: 'تدوين عناوين الدروس، مراحلها، والوظائف المنزلية وتوقيعها عقب كل حصة دون تأخير.',
    completed: true,
  },
  {
    id: 'chk-4',
    category: 'assessment',
    title: 'ملف التقييم التشخيصي وشبكة المعالجة البيداغوجية والدعم',
    description: 'روائز التقويم التشخيصي بداية السنة، قوائم التلاميذ المتعثرين، وبطاقات متابعة أثر المعالجة.',
    completed: true,
  },
  {
    id: 'chk-5',
    category: 'assessment',
    title: 'دفتر التنقيط المستمر وبنك مواضيع الفروض والاختبارات مع سلم التنقيط',
    description: 'احتفاظ الأستاذ بنماذج الفروض والاختبارات، الإجابة النموذجية، ومحاضر التصحيح الجماعي.',
    completed: true,
  },
  {
    id: 'chk-6',
    category: 'training',
    title: 'دفتر التكوين المستمر، الندوات التربوية، وتبادل الزيارات بين الأساتذة',
    description: 'توثيق كافة الندوات مع السيد المفتش، الندوات الداخلية، والدروس النموذجية.',
    completed: false,
  },
];

export const TrainingPortfolio: React.FC<TrainingPortfolioProps> = ({
  profile,
  onOpenDocumentGenerator,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_PORTFOLIO_CHECKLIST);
  const [seminars, setSeminars] = useState([
    {
      id: 'sem-1',
      title: 'ندوة تربوية حول بناء الوضعيات المشكلة المركبة وشبكات التقييم المعياري',
      supervisor: 'السيد مفتش التربية الوطنية لمادة الاختصاص',
      date: '2025-11-18',
      location: 'المقاطعة التفتيشية التربوية',
      takeaways: 'توحيد منهجية صياغة تعليمات الوضعية الإدماجية وضبط مؤشرات الملاءمة والانسجام.',
    },
    {
      id: 'sem-2',
      title: 'حصة درس تطبيقي نموذجي وتبادل الزيارات الصفية (مرافقة الأستاذ المتربص)',
      supervisor: `${profile.fullName} (أستاذ مؤطر / منسق المادة)`,
      date: '2026-01-27',
      location: profile.schoolName,
      takeaways: 'تطبيق تقنيات العمل بالأفواج المصغرة وتسيير زمن الحصة البيداغوجية بفعالية.',
    },
  ]);

  const [showAddSeminar, setShowAddSeminar] = useState(false);
  const [newSeminar, setNewSeminar] = useState({
    title: '',
    supervisor: 'السيد مفتش التربية الوطنية',
    date: new Date().toISOString().slice(0, 10),
    location: profile.schoolName,
    takeaways: '',
  });

  const toggleItem = (id: string) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const handleAddSeminar = (e: React.FormEvent) => {
    e.preventDefault();
    setSeminars([{ id: `sem-${Date.now()}`, ...newSeminar }, ...seminars]);
    setShowAddSeminar(false);
    setNewSeminar({ ...newSeminar, title: '', takeaways: '' });
  };

  const completedCount = checklist.filter((c) => c.completed).length;
  const readinessPct = Math.round((completedCount / checklist.length) * 100);

  const capExamName =
    profile.stage === 'primary'
      ? 'شهادة الكفاءة للأستاذية في التعليم الابتدائي (CAPEP)'
      : profile.stage === 'middle'
      ? 'شهادة الكفاءة للأستاذية في التعليم المتوسط (CAPEM)'
      : 'شهادة الكفاءة للأستاذية في التعليم الثانوي (CAPES)';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#d4af37]" />
              <span>فضاء التكوين المستمر، التفتيش البيداغوجي، وامتحان التثبيت (الكاباس)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              مؤشر جاهزية الحقيبة البيداغوجية للزيارة التفتيشية، سجل الندوات التربوية، ودليل الترسيم ({capExamName})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenDocumentGenerator('doc-inspection-readiness')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة حافظة الزيارة التفتيشية الرسمية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Inspection Readiness Checklist + Seminars & CAPES Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Inspection Portfolio Checklist (6 Cols) */}
        <div className="lg:col-span-6 bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/20">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#d4af37]" />
              <span>قائمة المراقبة الذاتية لحقيبة الأستاذ التفتيشية</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums">
              نسبة الجاهزية: {readinessPct}% ({completedCount}/{checklist.length})
            </span>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  item.completed
                    ? 'bg-[#0c291b]/70 border-emerald-500/40'
                    : 'bg-[#05140d] border-[#d4af37]/25'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    item.completed ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                />
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">{item.title}</div>
                  <p className="text-xs text-slate-300 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Seminars Log & CAPES/CAPEM/CAPEP Guide (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Inspector Evaluation Rubric Summary */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 pb-2 border-b border-[#d4af37]/20">
              <Award className="w-5 h-5 text-[#d4af37]" />
              <span>محاور شبكة تقييم المفتش وامتحان التثبيت ({STAGES_METADATA[profile.stage].shortTitle})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <div className="font-bold text-[#f5d77f] mb-1">1. التخطيط والوثائق (25%)</div>
                <div className="text-slate-300">مطابقة التدرج، جودة المذكرات، ومسك كراس النصوص والدفتر اليومي.</div>
              </div>
              <div className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <div className="font-bold text-[#f5d77f] mb-1">2. الأداء البيداغوجي في القسم (40%)</div>
                <div className="text-slate-300">بناء الوضعية الانطلاقية، تفعيل المتعلمين، سلامة اللغة والمادة العلمية.</div>
              </div>
              <div className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <div className="font-bold text-[#f5d77f] mb-1">3. التقويم ومراقبة أعمال التلاميذ (20%)</div>
                <div className="text-slate-300">مراقبة كراريس التلاميذ، بناء الاختبارات، وتفعيل المعالجة البيداغوجية.</div>
              </div>
              <div className="p-3 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
                <div className="font-bold text-[#f5d77f] mb-1">4. التشريع المدرسي والتكوين (15%)</div>
                <div className="text-slate-300">الإلمام بالقانون الأساسي 25-54، أخلاقيات المهنة، والمشاركة في المجالس.</div>
              </div>
            </div>
          </div>

          {/* Pedagogical Seminars Log */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#d4af37]/20">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#d4af37]" />
                <span>سجل الندوات التربوية وتبادل الزيارات</span>
              </h3>
              <button
                onClick={() => setShowAddSeminar(!showAddSeminar)}
                className="px-3 py-1.5 rounded-lg bg-[#105e32] text-[#f5d77f] text-xs font-bold border border-[#d4af37]/40 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تدوين ندوة</span>
              </button>
            </div>

            {showAddSeminar && (
              <form onSubmit={handleAddSeminar} className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37] space-y-3 text-xs">
                <input
                  type="text"
                  value={newSeminar.title}
                  onChange={(e) => setNewSeminar({ ...newSeminar, title: e.target.value })}
                  placeholder="موضوع الندوة التربوية أو الدرس النموذجي..."
                  className="w-full px-3 py-2 rounded bg-[#092116] border border-[#d4af37]/30 text-white"
                  required
                />
                <input
                  type="text"
                  value={newSeminar.takeaways}
                  onChange={(e) => setNewSeminar({ ...newSeminar, takeaways: e.target.value })}
                  placeholder="أهم التوصيات والخلاصات البيداغوجية..."
                  className="w-full px-3 py-2 rounded bg-[#092116] border border-[#d4af37]/30 text-white"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-[#d4af37] text-[#06150e] font-bold cursor-pointer"
                  >
                    حفظ في دفتر التكوين
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {seminars.map((sem) => (
                <div key={sem.id} className="p-3.5 rounded-xl bg-[#05140d] border border-[#d4af37]/20 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#f5d77f]">
                    <span>{sem.supervisor}</span>
                    <span className="font-mono tabular-nums">{sem.date}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white">{sem.title}</div>
                  <p className="text-xs text-slate-300">{sem.takeaways}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
