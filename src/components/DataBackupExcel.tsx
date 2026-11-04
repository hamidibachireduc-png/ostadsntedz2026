import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  DatabaseBackup,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Table,
  Layers,
} from 'lucide-react';
import {
  TeacherProfile,
  StudentRecord,
  LessonPlanItem,
  TimetableSlot,
  CoordinationItem,
  EducationalStage,
} from '../types';
import { STAGES_METADATA } from '../data';

interface DataBackupExcelProps {
  profile: TeacherProfile;
  onUpdateProfile: (p: TeacherProfile) => void;
  students: StudentRecord[];
  onUpdateStudents: (s: StudentRecord[]) => void;
  lessonPlans: LessonPlanItem[];
  onUpdateLessonPlans: (l: LessonPlanItem[]) => void;
  timetable: TimetableSlot[];
  onUpdateTimetable: (t: TimetableSlot[]) => void;
  coordinationItems: CoordinationItem[];
  onUpdateCoordination: (c: CoordinationItem[]) => void;
  onResetAllData: () => void;
}

export const DataBackupExcel: React.FC<DataBackupExcelProps> = ({
  profile,
  onUpdateProfile,
  students,
  onUpdateStudents,
  lessonPlans,
  onUpdateLessonPlans,
  timetable,
  onUpdateTimetable,
  coordinationItems,
  onUpdateCoordination,
  onResetAllData,
}) => {
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 6000);
  };

  // 1. Export Students Gradebook & Diagnostic to Excel CSV (UTF-8 BOM for Arabic Excel)
  const handleExportStudentsExcel = (stageFilter: 'all' | EducationalStage) => {
    const targetStudents =
      stageFilter === 'all' ? students : students.filter((s) => s.stage === stageFilter);

    const headers = [
      'Matricule',
      'FullName',
      'BirthDate',
      'Stage',
      'ClassName',
      'DiagnosticScore',
      'ContinuousAssessment',
      'Test1',
      'Test2',
      'Exam',
      'AbsencesCount',
      'DiagnosticWeakness',
      'BehaviorNote',
    ];

    const rows = targetStudents.map((s) =>
      [
        s.matricule,
        `"${s.fullName.replace(/"/g, '""')}"`,
        s.birthDate,
        s.stage,
        `"${s.className.replace(/"/g, '""')}"`,
        s.diagnosticScore,
        s.continuousAssessment,
        s.test1,
        s.test2,
        s.exam,
        s.absencesCount,
        `"${(s.diagnosticWeakness || '').replace(/"/g, '""')}"`,
        `"${(s.behaviorNote || '').replace(/"/g, '""')}"`,
      ].join(',')
    );

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `قوائم_ونقاط_التلاميذ_Excel_${stageFilter}_2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('success', `تم تصدير (${targetStudents.length}) سجل تلميذ بنجاح بصيغة Excel (CSV).`);
  };

  // 2. Import Students from Excel CSV
  const handleImportStudentsExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = (ev.target?.result as string) || '';
        const lines = text
          .replace(/^\uFEFF/, '')
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          showStatus('error', 'الملف فارغ أو لا يحتوي على صفوف بيانات صالحة.');
          return;
        }

        const parseCSVRow = (row: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if ((char === ',' || char === ';') && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const importedRecords: StudentRecord[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVRow(lines[i]);
          if (cols.length < 5) continue;

          const matricule = cols[0] || `10099${i}`;
          const fullName = cols[1] || `تلميذ مستورد ${i}`;
          const birthDate = cols[2] || '2010-01-01';
          const rawStage = (cols[3] || profile.stage).toLowerCase();
          const stage: EducationalStage =
            rawStage === 'primary' || rawStage === 'middle' || rawStage === 'secondary'
              ? rawStage
              : profile.stage;
          const className = cols[4] || profile.assignedClasses[0] || 'فوج 1';
          const diagnosticScore = Math.max(0, Math.min(20, Number(cols[5]) || 13));
          const continuousAssessment = Math.max(0, Math.min(20, Number(cols[6]) || 14));
          const test1 = Math.max(0, Math.min(20, Number(cols[7]) || 13));
          const test2 = Math.max(0, Math.min(20, Number(cols[8]) || 13));
          const exam = Math.max(0, Math.min(20, Number(cols[9]) || 13));
          const absencesCount = Number(cols[10]) || 0;
          const diagnosticWeakness = cols[11] || 'تم الاستيراد من ملف Excel';
          const behaviorNote = cols[12] || 'تلميذ منتظم في الدراسة';

          const avg = (continuousAssessment + test1 + exam * 2) / 4;
          importedRecords.push({
            id: `st-imp-${Date.now()}-${i}`,
            matricule,
            fullName,
            birthDate,
            stage,
            className,
            diagnosticScore,
            diagnosticLevel:
              diagnosticScore >= 14 ? 'mastered' : diagnosticScore >= 10 ? 'partial' : 'remediation',
            diagnosticWeakness,
            continuousAssessment,
            test1,
            test2,
            exam,
            absencesCount,
            behaviorNote,
            remediationNeeded: avg < 10,
          });
        }

        if (importedRecords.length > 0) {
          // Merge by matricule or append
          const existingMap = new Map(students.map((s) => [s.matricule, s]));
          importedRecords.forEach((imp) => existingMap.set(imp.matricule, imp));
          onUpdateStudents(Array.from(existingMap.values()));
          showStatus(
            'success',
            `تم استيراد وتحديث (${importedRecords.length}) تلميذ بنجاح من ملف Excel إلى قسم التقييم التربوي.`
          );
        } else {
          showStatus('error', 'تعذر قراءة صفوف التلاميذ، تأكد من مطابقة أعمدة النموذج القياسي.');
        }
      } catch {
        showStatus('error', 'حدث خطأ أثناء معالجة ملف Excel المستورد.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Export Lesson Plans & Progressions to Excel CSV
  const handleExportLessonPlansExcel = () => {
    const headers = [
      'Stage',
      'Subject',
      'Level',
      'Term',
      'WeekNumber',
      'Date',
      'Domain',
      'LessonTitle',
      'CompetencyTarget',
      'DurationMinutes',
      'Status',
      'LogbookSigned',
    ];
    const rows = lessonPlans.map((lp) =>
      [
        lp.stage,
        `"${lp.subject}"`,
        `"${lp.level}"`,
        lp.term,
        lp.weekNumber,
        lp.date,
        `"${lp.domain.replace(/"/g, '""')}"`,
        `"${lp.lessonTitle.replace(/"/g, '""')}"`,
        `"${lp.competencyTarget.replace(/"/g, '""')}"`,
        lp.durationMinutes,
        lp.status,
        lp.logbookSigned ? 'نعم' : 'لا',
      ].join(',')
    );
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `التدرجات_والمذكرات_Excel_2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('success', `تم تصدير (${lessonPlans.length}) مذكرة بيداغوجية إلى ملف Excel بنجاح.`);
  };

  // 4. Export Full Platform Backup (All Sections JSON + Metadata)
  const handleFullPlatformExport = () => {
    const backupPayload = {
      version: 'SNTE-2026-TEACHERS-V3',
      exportedAt: new Date().toISOString(),
      profile,
      students,
      lessonPlans,
      timetable,
      coordinationItems,
      customDocs: JSON.parse(localStorage.getItem('snte_teachers_custom_docs_2026') || '[]'),
      sharedResources: JSON.parse(localStorage.getItem('snte_teachers_shared_resources_2026') || '[]'),
      examTemplates: JSON.parse(localStorage.getItem('snte_teachers_exam_models_2026') || '[]'),
      councilMinutes: JSON.parse(localStorage.getItem('snte_teachers_council_minutes_2026') || '[]'),
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_شاملة_منصة_الأستاذ_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('success', 'تم تحميل النسخة الاحتياطية الشاملة لكافة أقسام المنصة على جهازك.');
  };

  // 5. Import Full Platform Backup
  const handleFullPlatformImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse((ev.target?.result as string) || '{}');
        if (parsed.profile) onUpdateProfile(parsed.profile);
        if (Array.isArray(parsed.students)) onUpdateStudents(parsed.students);
        if (Array.isArray(parsed.lessonPlans)) onUpdateLessonPlans(parsed.lessonPlans);
        if (Array.isArray(parsed.timetable)) onUpdateTimetable(parsed.timetable);
        if (Array.isArray(parsed.coordinationItems)) onUpdateCoordination(parsed.coordinationItems);
        if (Array.isArray(parsed.customDocs)) {
          localStorage.setItem('snte_teachers_custom_docs_2026', JSON.stringify(parsed.customDocs));
        }
        if (Array.isArray(parsed.sharedResources)) {
          localStorage.setItem('snte_teachers_shared_resources_2026', JSON.stringify(parsed.sharedResources));
        }
        if (Array.isArray(parsed.examTemplates)) {
          localStorage.setItem('snte_teachers_exam_models_2026', JSON.stringify(parsed.examTemplates));
        }
        if (Array.isArray(parsed.councilMinutes)) {
          localStorage.setItem('snte_teachers_council_minutes_2026', JSON.stringify(parsed.councilMinutes));
        }
        showStatus('success', 'تم استرجاع واستيراد النسخة الاحتياطية الكاملة للمنصة بنجاح.');
      } catch {
        showStatus('error', 'ملف النسخة الاحتياطية غير صالح.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-[#d4af37]" />
              <span>مركز حفظ البيانات واستيرادها وتصديرها (Excel / CSV والنسخ الاحتياطي الشامل)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              استيراد وتصدير قوائم التلاميذ وعلامات التقييم التشخيصي والفصلي بصيغة Excel، وحفظ نسخة شاملة لكافة
              مذكراتك ومواضيعك على حاسوبك أو هاتفك
            </p>
          </div>

          <button
            onClick={onResetAllData}
            className="px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start lg:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>استعادة البيانات الافتراضية للمنصة</span>
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm font-bold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Excel Import/Export + Full Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Excel / CSV Gradebook & Diagnostic Export & Import */}
        <div className="bg-[#081c12] border border-[#d4af37]/35 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-400" />
                <span>1. تصدير واستيراد قوائم وعلامات التلاميذ بصيغة Excel (CSV)</span>
              </h3>
              <span className="text-xs font-mono text-[#f5d77f] tabular-nums">
                {students.length} تلميذ مسجل
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              يمكنك تحميل جدول كامل بصيغة Excel (يدعم اللغة العربية مباشرة بترميز UTF-8) يضم أرقام التعريف، علامات
              التقييم التشخيصي، التقويم المستمر، الفروض، والاختبارات الفصلية، أو تعديله في برنامج Microsoft Excel ثم
              إعادة استيراده دفعة واحدة.
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-[#f5d77f]">أولاً: تحميل وتصدير ملف Excel:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleExportStudentsExcel(profile.stage)}
                  className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير Excel لـ {STAGES_METADATA[profile.stage].shortTitle}</span>
                </button>
                <button
                  onClick={() => handleExportStudentsExcel('all')}
                  className="py-2.5 px-3.5 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير Excel لجميع الأطوار الثلاثة</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#d4af37]/20 space-y-2">
            <label className="block text-xs font-bold text-emerald-300">
              ثانياً: استيراد ملف علامات وقوائم التلاميذ من جهازك (Excel CSV):
            </label>
            <div className="p-4 rounded-xl bg-[#05140d] border border-dashed border-[#d4af37]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                اختر ملف <code className="text-[#f5d77f]">.csv</code> المستخرج من Excel لتحديث قائمة التلاميذ وعلاماتهم
                تلقائياً:
              </div>
              <label className="px-4 py-2 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37] text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-4 h-4" />
                <span>اختيار ملف Excel للاستيراد</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleImportStudentsExcel}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: Lesson Plans Excel Export + Full System Backup */}
        <div className="bg-[#081c12] border border-[#d4af37]/35 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <DatabaseBackup className="w-5 h-5 text-[#d4af37]" />
                <span>2. تصدير التدرجات Excel وحفظ النسخة الشاملة لجميع أقسام المنصة</span>
              </h3>
              <span className="text-xs font-mono text-emerald-300 tabular-nums">حفظ فوري آمن</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              احفظ نسخة كاملة من بطاقتك المهنية، جدول التوقيت، التدرجات السنوية، نماذج الامتحانات المحفوظة، محاضر
              المجالس، والمستندات الخاصة بك لنقلها بين الحاسوب والهاتف دون ضياع أي بيانات.
            </p>

            <div className="pt-2">
              <button
                onClick={handleExportLessonPlansExcel}
                className="w-full py-2.5 px-4 rounded-xl bg-[#05140d] hover:bg-[#0d281a] text-[#f5d77f] border border-[#d4af37]/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>تصدير سجل التدرجات السنوية والمذكرات بصيغة Excel (CSV)</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#d4af37]/20 space-y-3">
            <div className="text-xs font-bold text-[#f5d77f]">
              حفظ واسترجاع قاعدة بيانات المنصة الشاملة (Backup & Restore):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleFullPlatformExport}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>حفظ نسخة شاملة للبيانات</span>
              </button>

              <label className="py-2.5 px-4 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/60 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>استرجاع نسخة محفوظة</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFullPlatformImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview of Excel Data Table */}
      <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/20 mb-4">
          <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d4af37]" />
            <span>معاينة الجدول الموحد الجاهز للتصدير والاستيراد بصيغة Excel ({students.length} تلميذ)</span>
          </h3>
          <span className="text-xs text-slate-400">ترميز عربي قياسي UTF-8 BOM متوافق مع Excel 2016-2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#05140d] border-b border-[#d4af37]/30 text-[#f5d77f]">
                <th className="py-2.5 px-3 font-mono">Matricule</th>
                <th className="py-2.5 px-3">اللقب والاسم</th>
                <th className="py-2.5 px-3">الطور</th>
                <th className="py-2.5 px-3">الفوج</th>
                <th className="py-2.5 px-3 text-center">التشخيصي</th>
                <th className="py-2.5 px-3 text-center">المستمر</th>
                <th className="py-2.5 px-3 text-center">الفرض 1</th>
                <th className="py-2.5 px-3 text-center">الفرض 2</th>
                <th className="py-2.5 px-3 text-center">الاختبار</th>
                <th className="py-2.5 px-3">تشخيص المكتسبات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/15">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-[#0c291b]/40">
                  <td className="py-2 px-3 font-mono text-slate-300 tabular-nums">{s.matricule}</td>
                  <td className="py-2 px-3 font-bold text-white">{s.fullName}</td>
                  <td className="py-2 px-3 text-[#f5d77f]">{STAGES_METADATA[s.stage].shortTitle}</td>
                  <td className="py-2 px-3 text-slate-300">{s.className}</td>
                  <td className="py-2 px-3 text-center font-mono text-slate-200 tabular-nums">{s.diagnosticScore}</td>
                  <td className="py-2 px-3 text-center font-mono text-emerald-300 tabular-nums">
                    {s.continuousAssessment}
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-emerald-300 tabular-nums">{s.test1}</td>
                  <td className="py-2 px-3 text-center font-mono text-emerald-300 tabular-nums">{s.test2}</td>
                  <td className="py-2 px-3 text-center font-mono text-[#f5d77f] font-bold tabular-nums">{s.exam}</td>
                  <td className="py-2 px-3 text-slate-300">{s.diagnosticWeakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
