import React, { useState } from 'react';
import {
  Calculator,
  UserPlus,
  Printer,
  Download,
  Award,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ClipboardCheck,
  BarChart3,
  FilePlus2,
  Plus,
  Save,
  Eye,
} from 'lucide-react';
import {
  StudentRecord,
  TeacherProfile,
  EducationalStage,
  OfficialExamTemplate,
  ExamExerciseItem,
  SectionId,
} from '../types';
import { STAGES_METADATA, INITIAL_EXAM_TEMPLATES } from '../data';

interface GradebookProps {
  profile: TeacherProfile;
  students: StudentRecord[];
  onUpdateStudents: (updated: StudentRecord[]) => void;
  onNavigate?: (section: SectionId) => void;
}

type EvaluationSubTab = 'gradebook' | 'diagnostic' | 'term_analysis' | 'exam_builder';

export const Gradebook: React.FC<GradebookProps> = ({
  profile,
  students,
  onUpdateStudents,
  onNavigate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<EvaluationSubTab>('gradebook');
  const [selectedStage, setSelectedStage] = useState<EducationalStage>(profile.stage);
  const [showAddModal, setShowAddModal] = useState(false);

  // Saved Official Exams State (persisted in localStorage)
  const [examTemplates, setExamTemplates] = useState<OfficialExamTemplate[]>(() => {
    const saved = localStorage.getItem('snte_teachers_exam_models_2026');
    return saved ? JSON.parse(saved) : INITIAL_EXAM_TEMPLATES;
  });

  const [selectedExamModel, setSelectedExamModel] = useState<OfficialExamTemplate>(
    examTemplates.find((e) => e.stage === profile.stage) || examTemplates[0]
  );
  const [previewAnswerKey, setPreviewAnswerKey] = useState<boolean>(false);
  const [isCreatingExam, setIsCreatingExam] = useState<boolean>(false);

  const [newExamForm, setNewExamForm] = useState<{
    examType: OfficialExamTemplate['examType'];
    term: 1 | 2 | 3;
    subject: string;
    level: string;
    duration: string;
    date: string;
    coefficient: number;
    generalInstructions: string;
    exercises: ExamExerciseItem[];
  }>({
    examType: 'term_exam',
    term: profile.currentTerm,
    subject: profile.subject,
    level: profile.assignedClasses[0] || STAGES_METADATA[profile.stage].levels[0],
    duration: 'ساعتان (02 سا)',
    date: new Date().toISOString().slice(0, 10),
    coefficient: 3,
    generalInstructions: 'الإجابة على جميع الأسئلة بوضوح وتنظيم مع احترام سلم التنقيط.',
    exercises: [
      {
        id: 'ex-new-1',
        title: 'التمرين الأول: استرجاع الموارد المعرفية',
        points: 6,
        competencyTargeted: 'التحكم في المفاهيم والقواعد الأساسية للميدان الأول',
        difficulty: 'easy',
        questionText: '1) عرّف المصطلحات العلمية الآتية بدقة...\n2) أجِب بصحيح أو خطأ مع تصحيح الخطأ إن وجد...',
        answerKey: '1) التعريف السليم للمصطلحات (3 ن).\n2) تحديد الصواب والخطأ مع التعليل الدقيق (3 ن).',
      },
      {
        id: 'ex-new-2',
        title: 'التمرين الثاني: توظيف الموارد وحل المشكلات',
        points: 6,
        competencyTargeted: 'تطبيق القوانين والعلاقات في وضعية تطبيقية',
        difficulty: 'medium',
        questionText: 'نعتبر المعطيات التجريبية / الرياضية الآتية:\n1) احسب المقدار المطلوب...\n2) مثل بيانياً واستنتج...',
        answerKey: '1) كتابة القانون والتطبيق العددي السليم (3 ن).\n2) التمثيل البياني والاستنتاج (3 ن).',
      },
      {
        id: 'ex-new-3',
        title: 'الوضعية الإدماجية المستهدفة للكفاءة الختامية',
        points: 8,
        competencyTargeted: 'تجنيد الموارد المدمجة لحل وضعية مشكلة دالة من الواقع',
        difficulty: 'complex',
        questionText: 'السياق: ...\nالسندات: ...\nالتعليمة: اعتماداً على السندات ومكتسباتك القبلية، قدم حلاً مفصلاً ومبرراً للإشكالية المطروحة.',
        answerKey: 'شبكة التقييم المعيارية: الملاءمة (2.5 ن)، الاستعمال السليم لأدوات المادة (3 ن)، الانسجام (1.5 ن)، الإتقان (1 ن).',
      },
    ],
  });

  const [newStudent, setNewStudent] = useState({
    matricule: `10098${Math.floor(100 + Math.random() * 899)}`,
    fullName: '',
    birthDate: '2009-05-15',
    className: profile.assignedClasses[0] || 'فوج 1',
    diagnosticScore: 13,
    continuousAssessment: 14,
    test1: 14,
    test2: 14,
    exam: 14,
  });

  const stageStudents = students.filter((s) => s.stage === selectedStage);
  const stageMeta = STAGES_METADATA[selectedStage];

  const calculateAverage = (s: StudentRecord): number => {
    if (s.stage === 'primary') {
      return Number(((s.continuousAssessment + s.exam) / 2).toFixed(2));
    }
    if (s.stage === 'middle') {
      const ccAndTest = (s.continuousAssessment + s.test1) / 2;
      return Number(((ccAndTest + s.exam * 2) / 3).toFixed(2));
    }
    const ccTests = (s.continuousAssessment + s.test1 + s.test2) / 3;
    return Number(((ccTests + s.exam * 2) / 3).toFixed(2));
  };

  const getAppreciationAndHonor = (avg: number, stage: EducationalStage) => {
    if (stage === 'primary') {
      if (avg >= 16) return { honor: 'تحكم أقصى (أ) - تهنئة', note: 'تحكم ممتاز في جميع الكفاءات المسطرة' };
      if (avg >= 13) return { honor: 'تحكم مقبول (ب) - تشجيع', note: 'نتائج جيدة ومشاركة فعالة في الأنشطة' };
      if (avg >= 10) return { honor: 'تحكم جزئي (ج)', note: 'مستوى مقبول، يحتاج إلى مزيد من التركيز' };
      return { honor: 'تحكم أدنى (د) - معالجة', note: 'صعوبات مشخصة، مدمج في حصة المعالجة البيداغوجية' };
    }
    if (avg >= 16) return { honor: 'تهنئة مجلس القسم', note: 'نتائج ممتازة وعمل منهجي مشرف جداً' };
    if (avg >= 14) return { honor: 'لوحة شرف', note: 'مردود جيد جداً ومواظبة مستمرة' };
    if (avg >= 12) return { honor: 'تشجيع', note: 'نتائج حسنة، بإمكانه تحقيق الأفضل' };
    if (avg >= 10) return { honor: 'بدون مكافأة (مقبول)', note: 'نتائج متوسطة، ينصح بمضاعفة المجهود الفردي' };
    return { honor: 'معني بالدعم والمعالجة', note: 'نتائج دون المعدل، يحتاج إلى مرافقة بيداغوجية مستمرة' };
  };

  const handleScoreChange = (
    id: string,
    field: 'diagnosticScore' | 'continuousAssessment' | 'test1' | 'test2' | 'exam',
    rawVal: string
  ) => {
    const val = Math.max(0, Math.min(20, Number(rawVal) || 0));
    const updated = students.map((st) => {
      if (st.id !== id) return st;
      const next = { ...st, [field]: val };
      if (field === 'diagnosticScore') {
        next.diagnosticLevel = val >= 14 ? 'mastered' : val >= 10 ? 'partial' : 'remediation';
      }
      const avg = calculateAverage(next);
      const autoInfo = getAppreciationAndHonor(avg, next.stage);
      return {
        ...next,
        remediationNeeded: avg < 10,
        behaviorNote: autoInfo.note,
      };
    });
    onUpdateStudents(updated);
  };

  const handleDiagnosticNoteChange = (id: string, note: string) => {
    onUpdateStudents(students.map((st) => (st.id === id ? { ...st, diagnosticWeakness: note } : st)));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const diagScore = Number(newStudent.diagnosticScore);
    const record: StudentRecord = {
      id: `st-${Date.now()}`,
      matricule: newStudent.matricule,
      fullName: newStudent.fullName,
      birthDate: newStudent.birthDate,
      stage: selectedStage,
      className: newStudent.className,
      diagnosticScore: diagScore,
      diagnosticLevel: diagScore >= 14 ? 'mastered' : diagScore >= 10 ? 'partial' : 'remediation',
      diagnosticWeakness: diagScore >= 10 ? 'مكتسبات قبلية مقبولة' : 'بحاجة لتثبيت المكتسبات القبلية',
      continuousAssessment: Number(newStudent.continuousAssessment),
      test1: Number(newStudent.test1),
      test2: Number(newStudent.test2),
      exam: Number(newStudent.exam),
      absencesCount: 0,
      behaviorNote: 'تلميذ مجتهد ومواظب في الحصص',
      remediationNeeded: false,
    };
    const avg = calculateAverage(record);
    record.remediationNeeded = avg < 10;
    record.behaviorNote = getAppreciationAndHonor(avg, selectedStage).note;
    onUpdateStudents([...students, record]);
    setShowAddModal(false);
    setNewStudent({ ...newStudent, fullName: '' });
  };

  const handleDeleteStudent = (id: string) => {
    onUpdateStudents(students.filter((s) => s.id !== id));
  };

  const handleExportCSV = () => {
    const headers = [
      'رقم التعريف المدرسي',
      'اللقب والاسم',
      'الفوج',
      'التقويم التشخيصي',
      'التقويم المستمر',
      'الفرض 1',
      'الفرض 2 / تطبيقي',
      'الاختبار الفصلي',
      'المعدل الفصلي',
      'التقدير البيداغوجي',
    ];
    const rows = stageStudents.map((s) => {
      const avg = calculateAverage(s);
      return [
        s.matricule,
        `"${s.fullName}"`,
        `"${s.className}"`,
        s.diagnosticScore,
        s.continuousAssessment,
        s.test1,
        s.test2,
        s.exam,
        avg,
        `"${s.behaviorNote}"`,
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `التقييم_التربوي_${selectedStage}_${profile.schoolYear.replace(/\s+/g, '')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Save new Exam Model to LocalStorage
  const handleSaveExamTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: OfficialExamTemplate = {
      id: `exam-${Date.now()}`,
      stage: selectedStage,
      examType: newExamForm.examType,
      term: newExamForm.term,
      subject: newExamForm.subject,
      level: newExamForm.level,
      duration: newExamForm.duration,
      date: newExamForm.date,
      coefficient: Number(newExamForm.coefficient),
      generalInstructions: newExamForm.generalInstructions,
      exercises: newExamForm.exercises,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [created, ...examTemplates];
    setExamTemplates(updated);
    localStorage.setItem('snte_teachers_exam_models_2026', JSON.stringify(updated));
    setSelectedExamModel(created);
    setIsCreatingExam(false);
  };

  const handleDeleteExamModel = (id: string) => {
    const remaining = examTemplates.filter((ex) => ex.id !== id);
    setExamTemplates(remaining);
    localStorage.setItem('snte_teachers_exam_models_2026', JSON.stringify(remaining));
    if (selectedExamModel?.id === id && remaining.length > 0) {
      setSelectedExamModel(remaining[0]);
    }
  };

  const handleUpdateNewExercise = (idx: number, field: keyof ExamExerciseItem, value: string | number) => {
    const updatedEx = newExamForm.exercises.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex));
    setNewExamForm({ ...newExamForm, exercises: updatedEx });
  };

  const handleAddExerciseToForm = () => {
    setNewExamForm({
      ...newExamForm,
      exercises: [
        ...newExamForm.exercises,
        {
          id: `ex-new-${Date.now()}`,
          title: `التمرين رقم ${newExamForm.exercises.length + 1}`,
          points: 4,
          competencyTargeted: 'مؤشر الكفاءة المستهدف...',
          difficulty: 'medium',
          questionText: 'نص التمرين والأسئلة الفرعية...',
          answerKey: 'عناصر الإجابة النموذجية وسلم التنقيط...',
        },
      ],
    });
  };

  // Statistical Computations for Term Exam Evaluation
  const averages = stageStudents.map(calculateAverage);
  const examScores = stageStudents.map((s) => s.exam);
  const classAvg =
    averages.length > 0 ? (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2) : '0.00';
  const examOnlyAvg =
    examScores.length > 0 ? (examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(2) : '0.00';
  const passCount = averages.filter((a) => a >= 10).length;
  const passRate = averages.length > 0 ? Math.round((passCount / averages.length) * 100) : 0;
  const maxExam = examScores.length > 0 ? Math.max(...examScores).toFixed(2) : '0.00';
  const minExam = examScores.length > 0 ? Math.min(...examScores).toFixed(2) : '0.00';

  // Standard Deviation of Exam Scores
  const meanExamNum = Number(examOnlyAvg);
  const variance =
    examScores.length > 0
      ? examScores.reduce((acc, val) => acc + Math.pow(val - meanExamNum, 2), 0) / examScores.length
      : 0;
  const stdDevExam = Math.sqrt(variance).toFixed(2);

  // Distribution brackets for Term Exam
  const distBuckets = [
    {
      label: 'فئة التميز والتحكم الأقصى [16.00 — 20.00]',
      count: examScores.filter((v) => v >= 16).length,
      color: 'bg-emerald-500',
    },
    {
      label: 'فئة التحكم الجيد [14.00 — 15.99]',
      count: examScores.filter((v) => v >= 14 && v < 16).length,
      color: 'bg-teal-400',
    },
    {
      label: 'فئة التحكم الحسن [12.00 — 13.99]',
      count: examScores.filter((v) => v >= 12 && v < 14).length,
      color: 'bg-[#d4af37]',
    },
    {
      label: 'فئة التحكم المتوسط [10.00 — 11.99]',
      count: examScores.filter((v) => v >= 10 && v < 12).length,
      color: 'bg-amber-400',
    },
    {
      label: 'فئة التعثر والحاجة للمعالجة [08.00 — 09.99]',
      count: examScores.filter((v) => v >= 8 && v < 10).length,
      color: 'bg-orange-500',
    },
    {
      label: 'فئة التعثر الحاد [< 08.00]',
      count: examScores.filter((v) => v < 8).length,
      color: 'bg-rose-500',
    },
  ];

  const examTypeLabels: Record<OfficialExamTemplate['examType'], string> = {
    term_exam: 'اختبار فصلي موحد',
    test: 'فرض محروس دوري',
    diagnostic_exam: 'تقويم تشخيصي للمكتسبات القبلية',
    mock_official: 'امتحان تجريبي رسمي (BAC / BEM / تقييم المكتسبات)',
  };

  return (
    <div className="space-y-6">
      {/* Top Header & 4-Module Switcher */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[#d4af37]" />
              <span>قسم التقييم التربوي الشامل · التنقيط، التشخيص، تحليل الامتحانات، وبنك المواضيع</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              الفضاء الموحد للتقييم البيداغوجي وفق مناهج وزارة التربية الوطنية في الأطوار الثلاثة ({stageMeta.shortTitle})
            </p>
          </div>

          {/* Stage Selector + Link to Recharts Performance Dashboard */}
          <div className="flex flex-wrap items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('analytics')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <BarChart3 className="w-4 h-4" />
                <span>لوحة تحكم الأداء التربوي (Recharts)</span>
              </button>
            )}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
              {(['primary', 'middle', 'secondary'] as EducationalStage[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStage(st)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedStage === st
                      ? 'bg-[#d4af37] text-[#06150e]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {STAGES_METADATA[st].shortTitle}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Core Sub-Modules Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-[#d4af37]/20">
          <button
            onClick={() => setActiveSubTab('gradebook')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
              activeSubTab === 'gradebook'
                ? 'bg-gradient-to-r from-[#105e32] to-[#0a381e] border-[#d4af37] text-[#f5d77f] shadow-md'
                : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:text-white'
            }`}
          >
            <Calculator className="w-5 h-5 text-[#d4af37] shrink-0" />
            <div>
              <div className="text-xs font-extrabold">1. دفتر التنقيط والمعالجة</div>
              <div className="text-[10px] text-slate-400">حساب المعدلات والإجازات الشرفية</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('diagnostic')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
              activeSubTab === 'diagnostic'
                ? 'bg-gradient-to-r from-[#105e32] to-[#0a381e] border-[#d4af37] text-[#f5d77f] shadow-md'
                : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:text-white'
            }`}
          >
            <ClipboardCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">2. التقييم التشخيصي</div>
              <div className="text-[10px] text-slate-400">تشخيص المكتسبات القبلية وخطة الدعم</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('term_analysis')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
              activeSubTab === 'term_analysis'
                ? 'bg-gradient-to-r from-[#105e32] to-[#0a381e] border-[#d4af37] text-[#f5d77f] shadow-md'
                : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">3. تقييم الامتحانات الفصلية</div>
              <div className="text-[10px] text-slate-400">تحليل النتائج، الفئات، والانحراف المعياري</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('exam_builder')}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
              activeSubTab === 'exam_builder'
                ? 'bg-gradient-to-r from-[#105e32] to-[#0a381e] border-[#d4af37] text-[#f5d77f] shadow-md'
                : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:text-white'
            }`}
          >
            <FilePlus2 className="w-5 h-5 text-[#f5d77f] shrink-0" />
            <div>
              <div className="text-xs font-extrabold">4. نماذج الامتحانات وحفظها</div>
              <div className="text-[10px] text-slate-400">إنشاء وحفظ مواضيع وفق أرضية الوزارة</div>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
          SUB-MODULE 1: دفتر التنقيط والمعالجة
         ===================================================================== */}
      {activeSubTab === 'gradebook' && (
        <div className="space-y-6">
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400">تعداد التلاميذ: </span>
                <strong className="text-white tabular-nums">{stageStudents.length}</strong>
              </div>
              <div>
                <span className="text-slate-400">المعدل العام للفوج: </span>
                <strong className="text-[#f5d77f] tabular-nums">{classAvg} / 20</strong>
              </div>
              <div>
                <span className="text-slate-400">نسبة النجاح (≥ 10): </span>
                <strong className="text-emerald-300 tabular-nums">{passRate}%</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddModal(!showAddModal)}
                className="px-3.5 py-2 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة تلميذ للفوج</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-[#05140d] hover:bg-[#0d291b] text-slate-200 border border-[#d4af37]/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#d4af37]" />
                <span>تصدير ملف الرقمنة (CSV/Excel)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة دفتر التنقيط</span>
              </button>
            </div>
          </div>

          {showAddModal && (
            <form
              onSubmit={handleAddStudent}
              className="bg-[#092216] border border-[#d4af37] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end text-xs no-print"
            >
              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1 font-bold">لقب واسم التلميذ(ة)</label>
                <input
                  type="text"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  placeholder="مثال: بن محمود عبد اللطيف"
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-bold">الفوج التربوي</label>
                <input
                  type="text"
                  value={newStudent.className}
                  onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-bold">التقويم المستمر</label>
                <input
                  type="number"
                  step="0.25"
                  min={0}
                  max={20}
                  value={newStudent.continuousAssessment}
                  onChange={(e) => setNewStudent({ ...newStudent, continuousAssessment: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-bold">الاختبار الفصلي</label>
                <input
                  type="number"
                  step="0.25"
                  min={0}
                  max={20}
                  value={newStudent.exam}
                  onChange={(e) => setNewStudent({ ...newStudent, exam: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white tabular-nums"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-[#d4af37] text-[#06150e] font-extrabold cursor-pointer"
                >
                  إدراج التلميذ
                </button>
              </div>
            </form>
          )}

          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 overflow-x-auto print-sheet">
            <table className="w-full text-right text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#d4af37]/30 bg-[#05140d] text-[#f5d77f]">
                  <th className="py-3 px-3 font-bold">رقم التعريف</th>
                  <th className="py-3 px-3 font-bold">اللقب والاسم</th>
                  <th className="py-3 px-3 font-bold">الفوج</th>
                  <th className="py-3 px-2 font-bold text-center">التقويم المستمر</th>
                  {selectedStage !== 'primary' && (
                    <th className="py-3 px-2 font-bold text-center">الفرض المحروس 1</th>
                  )}
                  {selectedStage === 'secondary' && (
                    <th className="py-3 px-2 font-bold text-center">الفرض 2 / تطبيقي</th>
                  )}
                  <th className="py-3 px-2 font-bold text-center">الاختبار الفصلي</th>
                  <th className="py-3 px-3 font-bold text-center">المعدل الفصلي</th>
                  <th className="py-3 px-3 font-bold">تقدير مجلس القسم / المعالجة</th>
                  <th className="py-3 px-3 font-bold">الملاحظة البيداغوجية للأستاذ</th>
                  <th className="py-3 px-2 font-bold text-center no-print">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/15">
                {stageStudents.map((st) => {
                  const avg = calculateAverage(st);
                  const info = getAppreciationAndHonor(avg, selectedStage);
                  return (
                    <tr key={st.id} className="hover:bg-[#0c291b]/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400 tabular-nums">{st.matricule}</td>
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">{st.fullName}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-300 whitespace-nowrap">{st.className}</td>
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          step="0.25"
                          min={0}
                          max={20}
                          value={st.continuousAssessment}
                          onChange={(e) => handleScoreChange(st.id, 'continuousAssessment', e.target.value)}
                          className="w-16 text-center py-1 rounded bg-[#05140d] border border-[#d4af37]/30 text-white font-mono tabular-nums"
                        />
                      </td>
                      {selectedStage !== 'primary' && (
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            step="0.25"
                            min={0}
                            max={20}
                            value={st.test1}
                            onChange={(e) => handleScoreChange(st.id, 'test1', e.target.value)}
                            className="w-16 text-center py-1 rounded bg-[#05140d] border border-[#d4af37]/30 text-white font-mono tabular-nums"
                          />
                        </td>
                      )}
                      {selectedStage === 'secondary' && (
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            step="0.25"
                            min={0}
                            max={20}
                            value={st.test2}
                            onChange={(e) => handleScoreChange(st.id, 'test2', e.target.value)}
                            className="w-16 text-center py-1 rounded bg-[#05140d] border border-[#d4af37]/30 text-white font-mono tabular-nums"
                          />
                        </td>
                      )}
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          step="0.25"
                          min={0}
                          max={20}
                          value={st.exam}
                          onChange={(e) => handleScoreChange(st.id, 'exam', e.target.value)}
                          className="w-16 text-center py-1 rounded bg-[#05140d] border border-[#d4af37]/30 text-white font-mono tabular-nums"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-mono font-extrabold text-sm tabular-nums ${
                            avg >= 10 ? 'text-emerald-300' : 'text-amber-400'
                          }`}
                        >
                          {avg.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs font-bold text-[#f5d77f] whitespace-nowrap">{info.honor}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-300">{st.behaviorNote}</td>
                      <td className="py-2.5 px-2 text-center no-print">
                        <button
                          onClick={() => handleDeleteStudent(st.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-MODULE 2: التقييم التشخيصي للمكتسبات القبلية
         ===================================================================== */}
      {activeSubTab === 'diagnostic' && (
        <div className="space-y-6">
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d4af37]/20">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                  <span>شبكة التقييم التشخيصي للمكتسبات القبلية وتصنيف أفواج المعالجة ({stageMeta.shortTitle})</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  رصد علامات الرائز التشخيصي بداية السنة أو بداية المقطع لتحديد النقائص القبلية وضبط بروتوكول المعالجة
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer self-start"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة محضر التقييم التشخيصي</span>
              </button>
            </div>

            {/* Diagnostic Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#05140d] border border-emerald-500/30">
                <div className="text-xs text-emerald-300 font-bold">تحكم كلي في المكتسبات القبلية (≥ 14)</div>
                <div className="text-2xl font-black text-white tabular-nums mt-1">
                  {stageStudents.filter((s) => s.diagnosticScore >= 14).length} تلاميذ
                </div>
                <div className="text-[11px] text-slate-400 mt-1">جاهزية تامة لبناء الكفاءات الجديدة</div>
              </div>
              <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/40">
                <div className="text-xs text-[#f5d77f] font-bold">تحكم جزئي (10.00 إلى 13.99)</div>
                <div className="text-2xl font-black text-white tabular-nums mt-1">
                  {stageStudents.filter((s) => s.diagnosticScore >= 10 && s.diagnosticScore < 14).length} تلاميذ
                </div>
                <div className="text-[11px] text-slate-400 mt-1">يحتاجون لتغذية راجعة وتثبيت مرحلي</div>
              </div>
              <div className="p-4 rounded-xl bg-[#05140d] border border-amber-500/40">
                <div className="text-xs text-amber-400 font-bold">تعثر قبلي — معنيون بالمعالجة الفورية (&lt; 10)</div>
                <div className="text-2xl font-black text-white tabular-nums mt-1">
                  {stageStudents.filter((s) => s.diagnosticScore < 10).length} تلاميذ
                </div>
                <div className="text-[11px] text-slate-400 mt-1">مبرمجون في حصص المعالجة البيداغوجية</div>
              </div>
            </div>

            {/* Diagnostic Table */}
            <div className="overflow-x-auto pt-2 print-sheet">
              <table className="w-full text-right text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#05140d] border-b border-[#d4af37]/30 text-[#f5d77f]">
                    <th className="py-3 px-3 font-bold">اللقب والاسم</th>
                    <th className="py-3 px-3 font-bold">الفوج</th>
                    <th className="py-3 px-3 font-bold text-center">علامة الرائز التشخيصي (/20)</th>
                    <th className="py-3 px-3 font-bold">مستوى التحكم القبلي</th>
                    <th className="py-3 px-3 font-bold">تشخيص النقائص والصعوبات القبلية المسجلة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4af37]/15">
                  {stageStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-[#0c291b]/40">
                      <td className="py-2.5 px-3 font-bold text-white">{st.fullName}</td>
                      <td className="py-2.5 px-3 text-slate-300">{st.className}</td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min={0}
                          max={20}
                          value={st.diagnosticScore}
                          onChange={(e) => handleScoreChange(st.id, 'diagnosticScore', e.target.value)}
                          className="w-16 text-center py-1 rounded bg-[#05140d] border border-[#d4af37]/40 text-white font-mono tabular-nums"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {st.diagnosticScore >= 14 ? (
                          <span className="text-emerald-300">تحكم كلي (أ)</span>
                        ) : st.diagnosticScore >= 10 ? (
                          <span className="text-[#f5d77f]">تحكم جزئي (ب)</span>
                        ) : (
                          <span className="text-amber-400">معالجة استدراكية (ج)</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={st.diagnosticWeakness}
                          onChange={(e) => handleDiagnosticNoteChange(st.id, e.target.value)}
                          className="w-full px-3 py-1.5 rounded bg-[#05140d] border border-[#d4af37]/25 text-xs text-slate-200"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-MODULE 3: تقييم وتحليل الامتحانات الفصلية
         ===================================================================== */}
      {activeSubTab === 'term_analysis' && (
        <div className="space-y-6">
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 space-y-6 print-sheet">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d4af37]/25">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#d4af37]" />
                  <span>التحليل الإحصائي والبيداغوجي لنتائج الاختبار الفصلي ({stageMeta.title})</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  قراءة إحصائية معمقة لعلامات الاختبار الفصلي (معدل الاختبار، الانحراف المعياري، وتوزيع الفئات) لتضمينها
                  في دفتر التنقيط ومجلس القسم
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer no-print self-start"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة تقرير تحليل الاختبار الفصلي</span>
              </button>
            </div>

            {/* 5 Statistical Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
                <div className="text-xs text-slate-400">معدل الاختبار الفصلي</div>
                <div className="text-xl font-black text-[#f5d77f] font-mono tabular-nums mt-1">{examOnlyAvg} / 20</div>
              </div>
              <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
                <div className="text-xs text-slate-400">نسبة النجاح في الاختبار</div>
                <div className="text-xl font-black text-emerald-300 font-mono tabular-nums mt-1">
                  {examScores.length > 0
                    ? Math.round((examScores.filter((v) => v >= 10).length / examScores.length) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
                <div className="text-xs text-slate-400">أعلى علامة مسجلة</div>
                <div className="text-xl font-black text-white font-mono tabular-nums mt-1">{maxExam} / 20</div>
              </div>
              <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
                <div className="text-xs text-slate-400">أدنى علامة مسجلة</div>
                <div className="text-xl font-black text-amber-400 font-mono tabular-nums mt-1">{minExam} / 20</div>
              </div>
              <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/30">
                <div className="text-xs text-slate-400">الانحراف المعياري (σ)</div>
                <div className="text-xl font-black text-slate-200 font-mono tabular-nums mt-1">{stdDevExam}</div>
              </div>
            </div>

            {/* Distribution Histogram Bars */}
            <div className="p-5 rounded-xl bg-[#05140d] border border-[#d4af37]/25 space-y-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#f5d77f]">
                جدول توزيع التلاميذ حسب فئات العلامات في الامتحان الفصلي:
              </h4>
              <div className="space-y-3">
                {distBuckets.map((b, i) => {
                  const pct = examScores.length > 0 ? Math.round((b.count / examScores.length) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-200 font-semibold">{b.label}</span>
                        <span className="font-mono font-bold text-[#f5d77f] tabular-nums">
                          {b.count} تلميذ ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full ${b.color}`} style={{ width: `${Math.max(4, pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pedagogical Reading & Remediation Action Plan */}
            <div className="p-4 rounded-xl bg-[#0a2317] border border-[#d4af37]/30 text-xs sm:text-sm space-y-1.5">
              <div className="font-extrabold text-[#f5d77f]">القراءة البيداغوجية والتوصيات العلاجية بعد التصحيح الجماعي:</div>
              <p className="text-slate-200 leading-relaxed">
                يبين تحليل نتائج الاختبار الفصلي لمادة ({profile.subject}) أن نسبة التحكم الإجمالية بلغت ({passRate}%)
                بمعدل اختبار قدره ({examOnlyAvg}/20) وانحراف معياري ({stdDevExam}) يعكس تجانساً مقبولاً في أداء الفوج،
                مع برمجة حصة تصحيح جماعي مفصل على السبورة وتكثيف التمارين العلاجية لفائدة التلاميذ الذين تحصلوا على أقل
                من 10/20 في الوضعية الإدماجية.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-MODULE 4: إنشاء نماذج الامتحانات وفق أرضية وزارة التربية وحفظها
         ===================================================================== */}
      {activeSubTab === 'exam_builder' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 no-print">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-[#d4af37]" />
                <span>مصمم وحافظ نماذج الفروض والاختبارات الرسمية وفق دليل بناء الاختبارات لوزارة التربية</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                أنشئ مواضيع الامتحانات مع سلم التنقيط والإجابة النموذجية، احفظها في بنك المواضيع، واطبعها بترويسة رسمية (A4)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCreatingExam(!isCreatingExam)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء وحفظ نموذج امتحان جديد</span>
              </button>
              <button
                onClick={() => setPreviewAnswerKey(!previewAnswerKey)}
                className="px-3.5 py-2 rounded-xl bg-[#05140d] hover:bg-[#0d281a] text-emerald-300 border border-[#d4af37]/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#d4af37]" />
                <span>{previewAnswerKey ? 'عرض ورقة موضوع التلميذ' : 'عرض الإجابة النموذجية وسلم التنقيط'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة النموذج (A4)</span>
              </button>
            </div>
          </div>

          {/* Create & Save Exam Form */}
          {isCreatingExam && (
            <form
              onSubmit={handleSaveExamTemplate}
              className="bg-[#092216] border-2 border-[#d4af37] rounded-2xl p-6 space-y-5 text-xs sm:text-sm no-print shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
                <h4 className="text-base font-black text-[#f5d77f]">
                  بناء موضوع امتحان جديد وفق جدول المواصفات الرسمي ({stageMeta.title})
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingExam(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  إغلاق المحرر
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">طبيعة التقويم</label>
                  <select
                    value={newExamForm.examType}
                    onChange={(e) =>
                      setNewExamForm({
                        ...newExamForm,
                        examType: e.target.value as OfficialExamTemplate['examType'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                  >
                    <option value="term_exam">اختبار فصلي موحد</option>
                    <option value="test">فرض محروس دوري</option>
                    <option value="diagnostic_exam">تقويم تشخيصي للمكتسبات</option>
                    <option value="mock_official">امتحان تجريبي رسمي (BAC / BEM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">المادة التعليمية</label>
                  <input
                    type="text"
                    value={newExamForm.subject}
                    onChange={(e) => setNewExamForm({ ...newExamForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">المستوى والشعبة / الفوج</label>
                  <input
                    type="text"
                    value={newExamForm.level}
                    onChange={(e) => setNewExamForm({ ...newExamForm, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">المدة الزمنية</label>
                    <input
                      type="text"
                      value={newExamForm.duration}
                      onChange={(e) => setNewExamForm({ ...newExamForm, duration: e.target.value })}
                      className="w-full px-2 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">المعامل</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newExamForm.coefficient}
                      onChange={(e) => setNewExamForm({ ...newExamForm, coefficient: Number(e.target.value) })}
                      className="w-full px-2 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Exercises Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-300">
                    هيكلة التمارين والوضعية الإدماجية وسلم التنقيط (المجموع: 20 نقطة):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddExerciseToForm}
                    className="px-3 py-1 rounded-lg bg-[#105e32] text-[#f5d77f] text-xs font-bold border border-[#d4af37]/40 cursor-pointer"
                  >
                    + إضافة تمرين / جزء جديد
                  </button>
                </div>

                {newExamForm.exercises.map((ex, idx) => (
                  <div key={ex.id} className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 text-xs mb-1">عنوان التمرين / الوضعية</label>
                        <input
                          type="text"
                          value={ex.title}
                          onChange={(e) => handleUpdateNewExercise(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 rounded bg-[#092116] border border-[#d4af37]/30 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">النقاط المخصصة (/20)</label>
                        <input
                          type="number"
                          step="0.5"
                          min={1}
                          max={20}
                          value={ex.points}
                          onChange={(e) => handleUpdateNewExercise(idx, 'points', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded bg-[#092116] border border-[#d4af37]/30 text-[#f5d77f] font-mono font-bold tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">الكفاءة المستهدفة</label>
                        <input
                          type="text"
                          value={ex.competencyTargeted}
                          onChange={(e) => handleUpdateNewExercise(idx, 'competencyTargeted', e.target.value)}
                          className="w-full px-3 py-1.5 rounded bg-[#092116] border border-[#d4af37]/30 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">نص التمرين والأسئلة</label>
                        <textarea
                          rows={3}
                          value={ex.questionText}
                          onChange={(e) => handleUpdateNewExercise(idx, 'questionText', e.target.value)}
                          className="w-full px-3 py-2 rounded bg-[#092116] border border-[#d4af37]/30 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">الإجابة النموذجية وسلم التنقيط المفصل</label>
                        <textarea
                          rows={3}
                          value={ex.answerKey}
                          onChange={(e) => handleUpdateNewExercise(idx, 'answerKey', e.target.value)}
                          className="w-full px-3 py-2 rounded bg-[#092116] border border-[#d4af37]/30 text-emerald-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingExam(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa771c] text-[#06150e] font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ نموذج الامتحان في بنك المواضيع</span>
                </button>
              </div>
            </form>
          )}

          {/* Split View: Saved Exam Bank (4 Cols) + Live Official A4 Exam Sheet (8 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3 no-print">
              <div className="text-xs font-bold text-[#f5d77f]">
                بنك نماذج الامتحانات المحفوظة ({examTemplates.length} نماذج):
              </div>
              {examTemplates.map((ex) => {
                const active = selectedExamModel?.id === ex.id;
                return (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedExamModel(ex)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#0d2e1e] border-[#d4af37] shadow-lg'
                        : 'bg-[#081c12] border-[#d4af37]/25 hover:border-[#d4af37]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="text-[#f5d77f] font-bold">{STAGES_METADATA[ex.stage].shortTitle}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums">{ex.date}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExamModel(ex.id);
                          }}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white">
                      {examTypeLabels[ex.examType]} — {ex.subject}
                    </h4>
                    <div className="text-xs text-slate-300 mt-1">{ex.level}</div>
                    <div className="text-[11px] text-emerald-300 mt-2">
                      المدة: {ex.duration} · المعامل: {ex.coefficient} · {ex.exercises.length} تمارين
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Official Printable Ministry Exam Sheet (8 Cols) */}
            <div className="lg:col-span-8">
              {selectedExamModel && (
                <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border-2 border-[#d4af37] print-sheet font-official space-y-5">
                  {/* Official Ministry Header */}
                  <div className="text-center border-b-2 border-slate-900 pb-3">
                    <div className="text-base sm:text-lg font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                    <div className="text-sm sm:text-base font-bold">وزارة التربية الوطنية</div>
                    <div className="grid grid-cols-3 text-xs font-sans font-bold text-slate-800 mt-3 pt-2 border-t border-slate-400">
                      <div className="text-right">
                        <div>{profile.wilaya}</div>
                        <div>المؤسسة: {profile.schoolName}</div>
                      </div>
                      <div className="text-center">
                        <div>السنة الدراسية: {profile.schoolYear}</div>
                        <div>الفصل الدراسي: {selectedExamModel.term}</div>
                      </div>
                      <div className="text-left">
                        <div>المدة الزمنية: {selectedExamModel.duration}</div>
                        <div>المعامل: {selectedExamModel.coefficient}</div>
                      </div>
                    </div>
                  </div>

                  {/* Exam Banner */}
                  <div className="bg-slate-100 border-2 border-slate-900 p-3 text-center font-sans">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      {previewAnswerKey
                        ? `الإجابة النموذجية وسلم التنقيط الرسمي — ${examTypeLabels[selectedExamModel.examType]}`
                        : `${examTypeLabels[selectedExamModel.examType]} في مادة: ${selectedExamModel.subject}`}
                    </h3>
                    <div className="text-xs font-bold text-slate-700 mt-1">
                      المستوى والشعبة: {selectedExamModel.level} · إعداد الأستاذ(ة): {profile.fullName}
                    </div>
                  </div>

                  {/* General Instructions */}
                  <div className="text-xs font-sans bg-slate-50 border border-slate-400 p-2.5 rounded text-slate-800">
                    <strong>توجيهات عامة للمترشحين:</strong> {selectedExamModel.generalInstructions}
                  </div>

                  {/* Exercises List */}
                  <div className="space-y-5 font-sans text-sm">
                    {selectedExamModel.exercises.map((ex, idx) => (
                      <div key={ex.id} className="border border-slate-800 rounded p-4 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">
                            {ex.title}
                          </h4>
                          <span className="font-mono font-extrabold text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded text-xs tabular-nums">
                            ({ex.points} نقاط)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <strong>الكفاءة المستهدفة:</strong> {ex.competencyTargeted}
                        </div>

                        {!previewAnswerKey ? (
                          <div className="whitespace-pre-line text-slate-900 leading-relaxed pt-1">
                            {ex.questionText}
                          </div>
                        ) : (
                          <div className="whitespace-pre-line text-emerald-950 bg-emerald-50 border border-emerald-300 p-3 rounded leading-relaxed pt-1">
                            <strong className="block mb-1 text-emerald-900">
                              عناصر الإجابة النموذجية وتوزيع العلامة ({ex.points} ن):
                            </strong>
                            {ex.answerKey}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-slate-900 text-xs font-sans font-bold text-slate-800">
                    <div>انتهى الموضوع — بالتوفيق والنجاح لجميع التلاميذ</div>
                    <div>الصفحة 1 من 1</div>
                    <div>أستاذ(ة) المادة: {profile.fullName}</div>
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
