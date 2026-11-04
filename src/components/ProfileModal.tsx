import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  User,
  Building2,
  MapPin,
  Award,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  Image as ImageIcon,
  Upload,
  Download,
  FileCheck2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { TeacherProfile, EducationalStage } from '../types';
import { STAGES_METADATA } from '../data';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onSave: (updated: TeacherProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<TeacherProfile>(profile);
  const [classesInput, setClassesInput] = useState<string>(profile.assignedClasses.join(' ، '));
  const logoInputRef = useRef<HTMLInputElement>(null);
  const programInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(profile);
    setClassesInput(profile.assignedClasses.join(' ، '));
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const currentStageMeta = STAGES_METADATA[formData.stage];

  const handleStageChange = (newStage: EducationalStage) => {
    const meta = STAGES_METADATA[newStage];
    const defaultQuota = newStage === 'primary' ? 22.5 : newStage === 'middle' ? 20 : 18;
    setFormData({
      ...formData,
      stage: newStage,
      rank: meta.baseRanks[1].name + ` (الصنف ${meta.baseRanks[1].category2026})`,
      subject: meta.subjects[0],
      weeklyQuotaHours: defaultQuota,
    });
  };

  // Upload custom Documentation Logo / Icon
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        logoUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Download Official Documentation Icon (SVG Seal customized with Institution Name)
  const handleDownloadDocumentationIcon = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#105e32" />
      <stop offset="50%" stop-color="#082415" />
      <stop offset="100%" stop-color="#05140d" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d4af37" />
      <stop offset="50%" stop-color="#f5d77f" />
      <stop offset="100%" stop-color="#b58922" />
    </linearGradient>
  </defs>
  <circle cx="250" cy="250" r="235" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="12" />
  <circle cx="250" cy="250" r="210" fill="none" stroke="#d4af37" stroke-width="3" stroke-dasharray="8,6" />
  <text x="250" y="105" text-anchor="middle" fill="#f5d77f" font-family="Cairo, Arial" font-size="18" font-weight="bold">الجمهورية الجزائرية الديمقراطية الشعبية</text>
  <text x="250" y="135" text-anchor="middle" fill="#10b981" font-family="Cairo, Arial" font-size="16" font-weight="bold">وزارة التربية الوطنية — توثيق بيداغوجي رسمي</text>
  <rect x="95" y="165" width="310" height="90" rx="16" fill="#05140d" stroke="url(#goldGrad)" stroke-width="3" />
  <text x="250" y="205" text-anchor="middle" fill="#f5d77f" font-family="Cairo, Arial" font-size="34" font-weight="900">SNTE 2026</text>
  <text x="250" y="238" text-anchor="middle" fill="#ffffff" font-family="Cairo, Arial" font-size="15" font-weight="bold">${formData.schoolName}</text>
  <text x="250" y="295" text-anchor="middle" fill="#f5d77f" font-family="Cairo, Arial" font-size="17" font-weight="bold">${formData.fullName}</text>
  <text x="250" y="325" text-anchor="middle" fill="#cbd5e1" font-family="Cairo, Arial" font-size="15">${formData.rank} — ${formData.subject}</text>
  <text x="250" y="365" text-anchor="middle" fill="#10b981" font-family="Cairo, Arial" font-size="14" font-weight="bold">${formData.wilaya} · الموسم الدراسي ${formData.schoolYear}</text>
  <text x="250" y="415" text-anchor="middle" fill="#d4af37" font-family="Cairo, Arial" font-size="13" font-weight="bold">ختم وأيقونة التوثيق الرقمي للمؤسسة</text>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ايقونة_التوثيق_${formData.schoolName.replace(/\s+/g, '_')}_2026.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload custom Institution Program file
  const handleProgramFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      institutionProgramFile: file.name,
      institutionProgramTitle:
        prev.institutionProgramTitle ||
        `البرنامج البيداغوجي ومشروع المؤسسة — ${prev.schoolName} (${prev.schoolYear})`,
    }));
  };

  // Download Complete Institution Program Document (HTML/Docx-compatible official program)
  const handleDownloadInstitutionProgram = () => {
    const stageMeta = STAGES_METADATA[formData.stage];
    const htmlDoc = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>البرنامج الخاص بالمؤسسة — ${formData.schoolName}</title>
  <style>
    body { font-family: 'Cairo', 'Traditional Arabic', Arial, sans-serif; padding: 32px; color: #111; line-height: 1.7; max-width: 900px; margin: auto; }
    .header { text-align: center; border-bottom: 3px double #105e32; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { font-size: 22px; color: #082415; margin: 8px 0; }
    h2 { font-size: 17px; background: #f0fdf4; border-right: 5px solid #105e32; padding: 8px 12px; color: #064e3b; margin-top: 22px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    th, td { border: 1px solid #333; padding: 8px 10px; text-align: right; }
    th { background: #e2e8f0; font-weight: bold; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
    <div>وزارة التربية الوطنية — ${formData.wilaya}</div>
    <h1>البرنامج السنوي الخاص بالمؤسسة والتنظيم البيداغوجي الرسمي (${formData.schoolYear})</h1>
    <div>المؤسسة التربوية: <strong>${formData.schoolName}</strong> — الطور: <strong>${stageMeta.title}</strong></div>
  </div>

  <h2>1. البطاقة الفنية والتنظيمية للمؤسسة والأستاذ</h2>
  <table>
    <tr><th>اسم المؤسسة التربوية</th><td>${formData.schoolName}</td><th>مديرية التربية</th><td>${formData.wilaya}</td></tr>
    <tr><th>الأستاذ(ة) المسؤول(ة)</th><td>${formData.fullName}</td><th>الرتبة القانونية (25-54)</th><td>${formData.rank}</td></tr>
    <tr><th>مادة الاختصاص</th><td>${formData.subject}</td><th>النصاب الساعي الأسبوعي</th><td>${formData.weeklyQuotaHours} ساعة</td></tr>
    <tr><th>الأفواج التربوية المسندة</th><td colspan="3">${formData.assignedClasses.join(' ، ')}</td></tr>
  </table>

  <h2>2. المحاور الكبرى للبرنامج الرسمي ومشروع المؤسسة (${stageMeta.shortTitle})</h2>
  <ul>
    ${stageMeta.pedagogicalHighlights.map((h) => `<li>${h}</li>`).join('')}
  </ul>

  <h2>3. نظام التقويم التربوي المستمر والامتحانات الفصلية المعتمد</h2>
  <p><strong>المعادلة الرسمية:</strong> ${stageMeta.evaluationSystem.formula}</p>
  <ul>
    ${stageMeta.evaluationSystem.components.map((c) => `<li>${c}</li>`).join('')}
  </ul>

  <h2>4. رزنامة المجالس البيداغوجية والتنسيق الأسبوعي بالمؤسسة</h2>
  <p>${stageMeta.evaluationSystem.councilRules}</p>

  <div class="footer">
    <div>إمضاء الأستاذ(ة): ${formData.fullName}</div>
    <div>تأشيرة وختم مدير(ة) المؤسسة: ${formData.schoolName}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `البرنامج_الخاص_بالمؤسسة_${formData.schoolName.replace(/\s+/g, '_')}_2026.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedClasses = classesInput
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      ...formData,
      assignedClasses: parsedClasses.length > 0 ? parsedClasses : ['فوج تربوي 1'],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#081d13] border-2 border-[#d4af37]/60 rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/25 mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#d4af37]" />
              <span>تخصيص البطاقة المهنية، أيقونة التوثيق، والبرنامج الخاص بالمؤسسة</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              تعتمد هذه البيانات والشعار تلقائياً في ترويسة المذكرات، محاضر المجالس، الجداول، وكشوف النقاط عند الطباعة
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#05140d] text-slate-400 hover:text-white border border-[#d4af37]/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          {/* NEW SECTION: Documentation Icon/Logo & Institution Program Upload/Download */}
          <div className="bg-[#05140d] border border-[#d4af37]/50 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2.5">
              <h3 className="text-sm font-black text-[#f5d77f] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>أيقونة التوثيق الرسمية والبرنامج الخاص بالمؤسسة التربوية</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#105e32]/60 text-emerald-200 font-bold">
                يظهر في الترويسة الرسمية A4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Documentation Icon / Logo Upload & Download */}
              <div className="p-3.5 rounded-xl bg-[#081c12] border border-[#d4af37]/30 flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#05140d] border-2 border-[#d4af37] flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="أيقونة التوثيق"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-[11px] font-black text-[#f5d77f]">SNTE</div>
                        <div className="text-[9px] font-bold text-emerald-300">2026</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-xs">
                      أيقونة التوثيق وشعار المؤسسة
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      يمكنك رفع شعار المؤسسة/الأيقونة الخاصة بك أو تحميل أيقونة التوثيق الرسمية الجاهزة.
                    </p>
                  </div>
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 py-2 px-2.5 rounded-lg bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/40 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع أيقونة التوثيق</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadDocumentationIcon}
                    className="flex-1 py-2 px-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل أيقونة التوثيق</span>
                  </button>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: undefined })}
                      className="p-2 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/30 hover:bg-rose-900 cursor-pointer"
                      title="استعادة الشعار الافتراضي"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Institution Program Upload & Download */}
              <div className="p-3.5 rounded-xl bg-[#081c12] border border-[#d4af37]/30 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-extrabold text-white text-xs">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span>البرنامج الخاص بالمؤسسة ومشروع المؤسسة</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    تحميل البرنامج البيداغوجي السنوي المخصص لمؤسستك أو إرفاق ملف البرنامج الخاص بالمؤسسة:
                  </p>
                  <input
                    type="text"
                    value={formData.institutionProgramTitle || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, institutionProgramTitle: e.target.value })
                    }
                    placeholder="عنوان البرنامج / مشروع المؤسسة المعتمد..."
                    className="w-full mt-2 px-2.5 py-1.5 rounded-lg bg-[#05140d] border border-[#d4af37]/30 text-xs text-white"
                  />
                  {formData.institutionProgramFile && (
                    <div className="mt-1.5 text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                      <span>الملف المرفق:</span>
                      <span className="underline">{formData.institutionProgramFile}</span>
                    </div>
                  )}
                </div>

                <input
                  ref={programInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.html"
                  onChange={handleProgramFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => programInputRef.current?.click()}
                    className="flex-1 py-2 px-2.5 rounded-lg bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/40 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>إرفاق برنامج المؤسسة</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadInstitutionProgram}
                    className="flex-1 py-2 px-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل برنامج المؤسسة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Selection */}
          <div>
            <label className="block text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#d4af37]" />
              <span>الطور التعليمي</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['primary', 'middle', 'secondary'] as EducationalStage[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStageChange(st)}
                  className={`py-2.5 px-3 rounded-lg font-bold border text-center transition-all cursor-pointer ${
                    formData.stage === st
                      ? 'bg-[#105e32] text-[#f5d77f] border-[#d4af37]'
                      : 'bg-[#05140d] text-slate-300 border-[#d4af37]/20 hover:border-[#d4af37]/50'
                  }`}
                >
                  {STAGES_METADATA[st].title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>اسم ولقب الأستاذ(ة)</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>الرتبة القانونية (المرسوم 25-54)</span>
              </label>
              <select
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium focus:outline-none focus:border-[#d4af37]"
              >
                {currentStageMeta.baseRanks.map((r) => {
                  const label = `${r.name} (الصنف ${r.category2026})`;
                  return (
                    <option key={r.code} value={label}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>مادة الاختصاص والتدريس</span>
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium focus:outline-none focus:border-[#d4af37]"
              >
                {currentStageMeta.subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>اسم المؤسسة التربوية (مدرسة / متوسطة / ثانوية)</span>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>مديرية التربية والولاية</span>
              </label>
              <input
                type="text"
                value={formData.wilaya}
                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                الأفواج التربوية المسندة (افصل بينها بفاصلة)
              </label>
              <input
                type="text"
                value={classesInput}
                onChange={(e) => setClassesInput(e.target.value)}
                placeholder="مثال: 3 ع ت 1 ، 3 ر 1 ، 2 ع ت 2"
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الدرجة الحالية (1-12)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={formData.echelon}
                onChange={(e) => setFormData({ ...formData, echelon: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium tabular-nums"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">الأقدمية (سنوات)</label>
              <input
                type="number"
                min={0}
                max={40}
                value={formData.yearsOfService}
                onChange={(e) => setFormData({ ...formData, yearsOfService: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium tabular-nums"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>النصاب الساعي</span>
              </label>
              <input
                type="number"
                step="0.5"
                min={8}
                max={30}
                value={formData.weeklyQuotaHours}
                onChange={(e) => setFormData({ ...formData, weeklyQuotaHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium tabular-nums"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>الفصل الدراسي</span>
              </label>
              <select
                value={formData.currentTerm}
                onChange={(e) =>
                  setFormData({ ...formData, currentTerm: Number(e.target.value) as 1 | 2 | 3 })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-medium"
              >
                <option value={1}>الفصل الأول</option>
                <option value={2}>الفصل الثاني</option>
                <option value={3}>الفصل الثالث</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isHeadTeacher"
              checked={formData.isHeadTeacher}
              onChange={(e) => setFormData({ ...formData, isHeadTeacher: e.target.checked })}
              className="w-4 h-4 accent-[#d4af37] rounded"
            />
            <label htmlFor="isHeadTeacher" className="text-slate-200 font-medium cursor-pointer">
              مكلف بمهام الأستاذ الرئيسي للقسم / منسق المادة البيداغوجي بالمؤسسة
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#d4af37]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa771c] text-[#082014] font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ البطاقة والشعار وبرنامج المؤسسة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
