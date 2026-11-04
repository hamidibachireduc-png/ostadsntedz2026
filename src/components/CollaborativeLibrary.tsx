import React, { useState } from 'react';
import {
  Library,
  Upload,
  Search,
  Download,
  Printer,
  Heart,
  BookOpen,
  Layers,
  Trash2,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  TeacherProfile,
  EducationalStage,
  SharedResourceItem,
} from '../types';
import {
  STAGES_METADATA,
  TEACHER_SPECIALIZATIONS_2026,
  INITIAL_SHARED_RESOURCES,
} from '../data';

interface CollaborativeLibraryProps {
  profile: TeacherProfile;
}

export const CollaborativeLibrary: React.FC<CollaborativeLibraryProps> = ({ profile }) => {
  const [resources, setResources] = useState<SharedResourceItem[]>(() => {
    const saved = localStorage.getItem('snte_teachers_shared_resources_2026');
    return saved ? JSON.parse(saved) : INITIAL_SHARED_RESOURCES;
  });

  const [selectedStage, setSelectedStage] = useState<'all' | EducationalStage>(profile.stage);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPrimaryActivity, setSelectedPrimaryActivity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeResource, setActiveResource] = useState<SharedResourceItem>(
    resources.find((r) => r.stage === profile.stage) || resources[0]
  );

  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

  // Upload Form State
  const defaultStageSpecs = TEACHER_SPECIALIZATIONS_2026.filter((s) => s.stage === profile.stage);
  const [uploadData, setUploadData] = useState<{
    title: string;
    stage: EducationalStage;
    teacherSpecialtyId: string;
    subject: string;
    primaryActivityName: string;
    level: string;
    term: 1 | 2 | 3;
    resourceType: SharedResourceItem['resourceType'];
    fileName: string;
    description: string;
    contentBody: string;
  }>({
    title: '',
    stage: profile.stage,
    teacherSpecialtyId: defaultStageSpecs[0]?.id || 'pri-spec-arabic',
    subject: defaultStageSpecs[0]?.assignedSubjects[0] || profile.subject,
    primaryActivityName:
      defaultStageSpecs[0]?.activitiesSubCategories?.[0] ||
      'فهم المنطوق والتعبير الشفوي (أستمع وأتحدث)',
    level: STAGES_METADATA[profile.stage].levels[0],
    term: profile.currentTerm,
    resourceType: 'lesson_model',
    fileName: '',
    description: '',
    contentBody: '',
  });

  const saveResources = (updated: SharedResourceItem[]) => {
    setResources(updated);
    localStorage.setItem('snte_teachers_shared_resources_2026', JSON.stringify(updated));
  };

  // Dynamic Filter Options based on selected Stage & Teacher Specialty (2026 Updates)
  const stageSpecialties =
    selectedStage === 'all'
      ? TEACHER_SPECIALIZATIONS_2026
      : TEACHER_SPECIALIZATIONS_2026.filter((sp) => sp.stage === selectedStage);

  const currentSpecialtyObj = TEACHER_SPECIALIZATIONS_2026.find((sp) => sp.id === selectedSpecialtyId);

  const availableSubjects = currentSpecialtyObj
    ? currentSpecialtyObj.assignedSubjects
    : Array.from(new Set(stageSpecialties.flatMap((sp) => sp.assignedSubjects)));

  const availablePrimaryActivities =
    selectedStage === 'primary'
      ? currentSpecialtyObj?.activitiesSubCategories ||
        Array.from(
          new Set(
            TEACHER_SPECIALIZATIONS_2026.filter((sp) => sp.stage === 'primary').flatMap(
              (sp) => sp.activitiesSubCategories || []
            )
          )
        )
      : [];

  const filteredResources = resources.filter((res) => {
    const matchStage = selectedStage === 'all' || res.stage === selectedStage;
    const matchSpec = selectedSpecialtyId === 'all' || res.teacherSpecialtyId === selectedSpecialtyId;
    const matchSubj = selectedSubject === 'all' || res.subject === selectedSubject;
    const matchActivity =
      selectedStage !== 'primary' ||
      selectedPrimaryActivity === 'all' ||
      res.primaryActivityName === selectedPrimaryActivity;
    const matchQuery =
      res.title.includes(searchQuery) ||
      res.description.includes(searchQuery) ||
      res.subject.includes(searchQuery) ||
      (res.primaryActivityName && res.primaryActivityName.includes(searchQuery));
    return matchStage && matchSpec && matchSubj && matchActivity && matchQuery;
  });

  // Upload Form Stage & Specialty Sync
  const handleUploadStageChange = (newSt: EducationalStage) => {
    const specs = TEACHER_SPECIALIZATIONS_2026.filter((s) => s.stage === newSt);
    const firstSpec = specs[0];
    setUploadData({
      ...uploadData,
      stage: newSt,
      teacherSpecialtyId: firstSpec.id,
      subject: firstSpec.assignedSubjects[0],
      primaryActivityName: firstSpec.activitiesSubCategories?.[0] || '',
      level: STAGES_METADATA[newSt].levels[0],
    });
  };

  const handleUploadSpecialtyChange = (specId: string) => {
    const specObj = TEACHER_SPECIALIZATIONS_2026.find((s) => s.id === specId);
    if (!specObj) return;
    setUploadData({
      ...uploadData,
      teacherSpecialtyId: specId,
      subject: specObj.assignedSubjects[0],
      primaryActivityName: specObj.activitiesSubCategories?.[0] || '',
    });
  };

  const handleFileAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadData((prev) => ({
      ...prev,
      fileName: file.name,
    }));
    // If it's a text/markdown/csv file, read its content into contentBody
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const txt = ev.target?.result as string;
        if (txt) {
          setUploadData((prev) => ({ ...prev, contentBody: txt }));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: SharedResourceItem = {
      id: `res-${Date.now()}`,
      title: uploadData.title,
      stage: uploadData.stage,
      teacherSpecialtyId: uploadData.teacherSpecialtyId,
      subject: uploadData.subject,
      primaryActivityName: uploadData.stage === 'primary' ? uploadData.primaryActivityName : undefined,
      level: uploadData.level,
      term: uploadData.term,
      resourceType: uploadData.resourceType,
      authorName: profile.fullName,
      wilaya: profile.wilaya,
      createdAt: new Date().toISOString().slice(0, 10),
      downloadsCount: 1,
      likesCount: 1,
      fileName: uploadData.fileName || `${uploadData.title.slice(0, 25).replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.2 MB',
      description: uploadData.description,
      contentBody: uploadData.contentBody,
    };
    const updated = [created, ...resources];
    saveResources(updated);
    setActiveResource(created);
    setShowUploadForm(false);
    setUploadData({ ...uploadData, title: '', description: '', contentBody: '', fileName: '' });
  };

  const handleLikeResource = (id: string) => {
    const updated = resources.map((r) => {
      if (r.id !== id) return r;
      const next = { ...r, likesCount: r.likesCount + 1 };
      if (activeResource?.id === id) setActiveResource(next);
      return next;
    });
    saveResources(updated);
  };

  const handleDownloadResourceFile = (res: SharedResourceItem) => {
    const updated = resources.map((r) => {
      if (r.id !== res.id) return r;
      const next = { ...r, downloadsCount: r.downloadsCount + 1 };
      if (activeResource?.id === res.id) setActiveResource(next);
      return next;
    });
    saveResources(updated);

    const header = `====================================================================
الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية
مكتبة الموارد التشاركية لأساتذة الأطوار الثلاثة (SNTE 2026)
====================================================================
عنوان المورد: ${res.title}
الطور التعليمي: ${STAGES_METADATA[res.stage].title}
المادة التعليمية: ${res.subject}
${res.primaryActivityName ? `تسمية النشاط (الطور الابتدائي): ${res.primaryActivityName}\n` : ''}المستوى: ${res.level} — الفصل الدراسي: ${res.term}
الأستاذ(ة) المساهم(ة): ${res.authorName} (${res.wilaya})
تاريخ النشر: ${res.createdAt}
====================================================================\n\n`;

    const blob = new Blob(['\uFEFF' + header + res.contentBody], {
      type: 'text/plain;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${res.title.replace(/\s+/g, '_')}_2026.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteResource = (id: string) => {
    const remaining = resources.filter((r) => r.id !== id);
    saveResources(remaining);
    if (activeResource?.id === id && remaining.length > 0) {
      setActiveResource(remaining[0]);
    }
  };

  const resourceTypeLabels: Record<SharedResourceItem['resourceType'], string> = {
    lesson_model: 'مذكرة درس نموذجي',
    exercises_series: 'سلسلة تمارين ووضعيات إدماجية',
    exam_subject: 'موضوع فرض / اختبار مع الحل',
    pedagogical_guide: 'وثيقة مرافقة / ملخص بيداغوجي',
    interactive_media: 'وسيلة تعليمية / بطاقات تفاعلية',
  };

  const uploadSpecialtyObj =
    TEACHER_SPECIALIZATIONS_2026.find((s) => s.id === uploadData.teacherSpecialtyId) ||
    TEACHER_SPECIALIZATIONS_2026[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Library className="w-6 h-6 text-[#d4af37]" />
              <span>مكتبة الموارد التشاركية لأساتذة الأطوار الثلاثة · تحديثات إسناد المواد والأنشطة 2026</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              فضاء تشاركي لرفع وتبادل نماذج المذكرات، سلاسل التمارين، والوضعيات الإدماجية مصنفة حسب إسناد المواد الجديد
              لكل أستاذ وتسميات الأنشطة الرسمية للطور الابتدائي
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>رفع ومشاركة مورد بيداغوجي جديد</span>
            </button>
          </div>
        </div>

        {/* 2026 Teacher Subject Assignment & Primary Activity Filter Bar */}
        <div className="space-y-3 mt-5 pt-4 border-t border-[#d4af37]/20">
          {/* Row 1: Stage Selector + Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#05140d] border border-[#d4af37]/30 overflow-x-auto">
              {[
                { id: 'all', label: 'جميع الأطوار (الكل)' },
                { id: 'primary', label: 'الطور الابتدائي (+ تسميات الأنشطة)' },
                { id: 'middle', label: 'الطور المتوسط' },
                { id: 'secondary', label: 'الطور الثانوي' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStage(st.id as 'all' | EducationalStage);
                    setSelectedSpecialtyId('all');
                    setSelectedSubject('all');
                    setSelectedPrimaryActivity('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedStage === st.id
                      ? 'bg-[#105e32] text-[#f5d77f] border border-[#d4af37]/50'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المذكرات والتمارين حسب العنوان أو النشاط..."
                className="w-full pr-9 pl-3 py-2 rounded-xl bg-[#05140d] border border-[#d4af37]/30 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Row 2: Teacher Assigned Specialty (2026) + Subject + Primary Activity Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                تخصص الأستاذ والمواد المسندة له (تحديثات 2026):
              </label>
              <select
                value={selectedSpecialtyId}
                onChange={(e) => {
                  setSelectedSpecialtyId(e.target.value);
                  setSelectedSubject('all');
                  setSelectedPrimaryActivity('all');
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
              >
                <option value="all">كل تخصصات الأساتذة المسندة</option>
                {stageSpecialties.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">المادة التعليمية المسندة:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
              >
                <option value="all">جميع المواد المسندة ({availableSubjects.length})</option>
                {availableSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {selectedStage === 'primary' ? (
              <div>
                <label className="block text-[#f5d77f] font-bold mb-1">
                  تسمية النشاط البيداغوجي (خاص بالطور الابتدائي 2026):
                </label>
                <select
                  value={selectedPrimaryActivity}
                  onChange={(e) => setSelectedPrimaryActivity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#092618] border border-[#d4af37] text-[#f5d77f] font-bold"
                >
                  <option value="all">جميع أنشطة الطور الابتدائي ({availablePrimaryActivities.length} نشاطاً)</option>
                  {availablePrimaryActivities.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#05140d] border border-[#d4af37]/20 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">إجمالي الموارد التشاركية المعروضة:</div>
                  <div className="text-sm font-black text-emerald-300 tabular-nums">
                    {filteredResources.length} نماذج جاهزة للتحميل والطباعة
                  </div>
                </div>
                <BookOpen className="w-5 h-5 text-[#d4af37]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload & Share New Resource Modal/Form */}
      {showUploadForm && (
        <form
          onSubmit={handleUploadSubmit}
          className="bg-[#092216] border-2 border-[#d4af37] rounded-2xl p-6 space-y-4 text-xs sm:text-sm no-print shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
            <h3 className="text-base font-black text-[#f5d77f] flex items-center gap-2">
              <Upload className="w-5 h-5" />
              <span>رفع ومشاركة نموذج درس أو سلسلة تمارين في المكتبة التشاركية</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              إغلاق النموذج
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">1. الطور التعليمي</label>
              <select
                value={uploadData.stage}
                onChange={(e) => handleUploadStageChange(e.target.value as EducationalStage)}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
              >
                <option value="primary">طور التعليم الابتدائي</option>
                <option value="middle">طور التعليم المتوسط</option>
                <option value="secondary">طور التعليم الثانوي</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">
                2. إسناد الأستاذ وتخصصه (وفق التحديثات الوزارية 2026)
              </label>
              <select
                value={uploadData.teacherSpecialtyId}
                onChange={(e) => handleUploadSpecialtyChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
              >
                {TEACHER_SPECIALIZATIONS_2026.filter((s) => s.stage === uploadData.stage).map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">3. المادة المسندة للأستاذ</label>
              <select
                value={uploadData.subject}
                onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              >
                {uploadSpecialtyObj.assignedSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {uploadData.stage === 'primary' && uploadSpecialtyObj.activitiesSubCategories && (
              <div>
                <label className="block text-[#f5d77f] font-bold mb-1">
                  4. تسمية النشاط البيداغوجي (الطور الابتدائي)
                </label>
                <select
                  value={uploadData.primaryActivityName}
                  onChange={(e) => setUploadData({ ...uploadData, primaryActivityName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37] text-[#f5d77f] font-bold"
                >
                  {uploadSpecialtyObj.activitiesSubCategories.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1">المستوى الدراسي والفصل</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={uploadData.level}
                  onChange={(e) => setUploadData({ ...uploadData, level: e.target.value })}
                  className="col-span-2 px-2 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white text-xs"
                >
                  {STAGES_METADATA[uploadData.stage].levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
                <select
                  value={uploadData.term}
                  onChange={(e) => setUploadData({ ...uploadData, term: Number(e.target.value) as 1 | 2 | 3 })}
                  className="px-2 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white text-xs"
                >
                  <option value={1}>ف 1</option>
                  <option value={2}>ف 2</option>
                  <option value={3}>ف 3</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">عنوان المورد البيداغوجي (الدرس / سلسلة التمارين)</label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                placeholder="مثال: مذكرة نموذجية في فهم المنطوق / سلسلة تمارين الأعداد المركبة مع الحل..."
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">تصنيف المورد</label>
              <select
                value={uploadData.resourceType}
                onChange={(e) =>
                  setUploadData({
                    ...uploadData,
                    resourceType: e.target.value as SharedResourceItem['resourceType'],
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              >
                <option value="lesson_model">مذكرة درس نموذجي</option>
                <option value="exercises_series">سلسلة تمارين ووضعيات إدماجية</option>
                <option value="exam_subject">موضوع فرض / اختبار مع الحل</option>
                <option value="pedagogical_guide">وثيقة مرافقة / ملخص بيداغوجي</option>
                <option value="interactive_media">وسيلة تعليمية / بطاقات تفاعلية</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">ملخص وصفي للمورد وأهدافه التعلمية</label>
              <input
                type="text"
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                placeholder="وصف مختصر لما يتضمنه النموذج أو السلسلة..."
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                إرفاق ملف من جهازك (PDF, Word, TXT - اختياري)
              </label>
              <input
                type="file"
                onChange={handleFileAttachmentChange}
                className="w-full px-3 py-1.5 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-slate-300 text-xs file:ml-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#d4af37] file:text-[#06150e] file:font-bold cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              النص الكامل للمذكرة أو سلسلة التمارين (للمعاينة المباشرة والطباعة A4 والتحميل)
            </label>
            <textarea
              rows={5}
              value={uploadData.contentBody}
              onChange={(e) => setUploadData({ ...uploadData, contentBody: e.target.value })}
              placeholder="اكتب أو الصق هنا محتوى الدرس النموذجي أو نص التمارين والحلول ليتمكن زملاؤك الأساتذة من معاينته وطباعته..."
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa771c] text-[#06150e] font-black cursor-pointer"
            >
              نشر وحفظ المورد في المكتبة التشاركية
            </button>
          </div>
        </form>
      )}

      {/* Reference Card: 2026 Teacher Specializations & Primary Activities Overview */}
      {selectedStage === 'primary' && (
        <div className="bg-[#092317] border border-[#d4af37]/40 rounded-2xl p-5 space-y-3 no-print">
          <div className="text-xs sm:text-sm font-extrabold text-[#f5d77f] flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>
              دليل إسناد المواد وتسميات الأنشطة في الطور الابتدائي (وفق التحديثات الوزارية 2026):
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs">
            {TEACHER_SPECIALIZATIONS_2026.filter((s) => s.stage === 'primary').map((sp) => (
              <div
                key={sp.id}
                onClick={() => setSelectedSpecialtyId(sp.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedSpecialtyId === sp.id
                    ? 'bg-[#105e32] border-[#d4af37] text-white'
                    : 'bg-[#05140d] border-[#d4af37]/20 text-slate-300 hover:border-[#d4af37]/50'
                }`}
              >
                <div className="font-bold text-[#f5d77f] mb-1">{sp.title}</div>
                <div className="text-[11px] text-slate-300">
                  {sp.activitiesSubCategories?.slice(0, 3).join(' · ')}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Split: Resources Feed (5 Cols) + Live Printable Preview (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 no-print">
          {filteredResources.map((res) => {
            const isSelected = activeResource?.id === res.id;
            return (
              <div
                key={res.id}
                onClick={() => setActiveResource(res)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0d2e1e] border-[#d4af37] shadow-lg'
                    : 'bg-[#081c12] border-[#d4af37]/25 hover:border-[#d4af37]/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="text-[#f5d77f] font-bold">
                    {STAGES_METADATA[res.stage].shortTitle} · {res.subject}
                  </span>
                  <span className="font-mono tabular-nums">{res.createdAt}</span>
                </div>

                {res.primaryActivityName && (
                  <div className="text-[11px] font-bold text-emerald-300 mb-1">
                    النشاط: {res.primaryActivityName}
                  </div>
                )}

                <h4 className="text-sm font-extrabold text-white leading-snug mb-1.5">{res.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 mb-3">{res.description}</p>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#d4af37]/15 text-[11px] text-slate-300">
                  <span>{res.authorName}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeResource(res.id);
                      }}
                      className="flex items-center gap-1 text-amber-300 hover:text-amber-200 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-amber-400/30" />
                      <span>{res.likesCount}</span>
                    </button>
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Download className="w-3.5 h-3.5" />
                      <span>{res.downloadsCount}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResource(res.id);
                      }}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="حذف المورد"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Preview & Print Sheet (7 Cols) */}
        <div className="lg:col-span-7">
          {activeResource ? (
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="text-xs">
                  <span className="text-slate-400">الملف المرفق: </span>
                  <strong className="text-[#f5d77f] font-mono">{activeResource.fileName}</strong>
                  <span className="text-slate-400 mr-2">({activeResource.fileSize})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadResourceFile(activeResource)}
                    className="px-4 py-2 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل المورد ({activeResource.downloadsCount})</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة الورقة البيداغوجية (A4)</span>
                  </button>
                </div>
              </div>

              {/* Printable Sheet */}
              <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border-2 border-[#d4af37] print-sheet font-official space-y-5">
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="text-lg font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                  <div className="text-base font-bold">وزارة التربية الوطنية — مكتبة الموارد التشاركية للأساتذة</div>
                  <div className="flex flex-wrap justify-between text-xs font-sans font-bold text-slate-800 mt-3 pt-2 border-t border-slate-300">
                    <div>{STAGES_METADATA[activeResource.stage].title}</div>
                    <div>المادة: {activeResource.subject}</div>
                    <div>المستوى: {activeResource.level} (الفصل {activeResource.term})</div>
                  </div>
                </div>

                <div className="bg-slate-100 border-2 border-slate-900 p-3 text-center font-sans">
                  <div className="text-xs font-bold text-slate-700 mb-0.5">
                    {resourceTypeLabels[activeResource.resourceType]}
                    {activeResource.primaryActivityName ? ` — النشاط: ${activeResource.primaryActivityName}` : ''}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">{activeResource.title}</h3>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    إعداد ومشاركة: {activeResource.authorName} · {activeResource.wilaya}
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-300 text-xs font-sans text-slate-800">
                  <strong>بطاقة توصيفية للمورد:</strong> {activeResource.description}
                </div>

                <div className="whitespace-pre-line font-sans text-sm sm:text-base leading-relaxed text-slate-900 border border-slate-800 rounded p-4 min-h-[340px]">
                  {activeResource.contentBody}
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-900 text-xs font-sans font-bold text-slate-700">
                  <div>البوابة الرقمية لأساتذة الأطوار الثلاثة — SNTE 2026</div>
                  <div>تاريخ النشر والتوثيق: {activeResource.createdAt}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-12 text-center text-slate-400">
              لا توجد موارد مطابقة لخيارات التصفية الحالية — يمكنك رفع أول مورد في هذا التصنيف.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
