import React, { useState, useEffect } from 'react';
import { FileText, Printer, Edit3, RotateCcw, Plus, Trash2, Save } from 'lucide-react';
import { TeacherProfile, TeacherDocumentTemplate, CustomTeacherDocument, EducationalStage } from '../types';
import { TEACHER_DOCUMENT_TEMPLATES, STAGES_METADATA } from '../data';

interface TeacherDocumentsProps {
  profile: TeacherProfile;
  initialSelectedDocId: string | null;
}

export const TeacherDocuments: React.FC<TeacherDocumentsProps> = ({ profile, initialSelectedDocId }) => {
  const [customDocs, setCustomDocs] = useState<CustomTeacherDocument[]>(() => {
    const saved = localStorage.getItem('snte_teachers_custom_docs_2026');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedMode, setSelectedMode] = useState<'standard' | 'custom'>('standard');
  const [selectedDoc, setSelectedDoc] = useState<TeacherDocumentTemplate>(
    TEACHER_DOCUMENT_TEMPLATES.find((d) => d.id === initialSelectedDocId) || TEACHER_DOCUMENT_TEMPLATES[0]
  );
  const [selectedCustomDoc, setSelectedCustomDoc] = useState<CustomTeacherDocument | null>(
    customDocs[0] || null
  );

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isAddingDoc, setIsAddingDoc] = useState<boolean>(false);

  const [newDocForm, setNewDocForm] = useState<{
    code: string;
    title: string;
    stageScope: 'all' | EducationalStage;
    category: CustomTeacherDocument['category'];
    description: string;
    recipientOrAuthority: string;
    bodyText: string;
  }>({
    code: `مستند مخصص / أ.${customDocs.length + 7}`,
    title: '',
    stageScope: profile.stage,
    category: 'pedagogical',
    description: '',
    recipientOrAuthority: 'إلى السيد(ة) مدير(ة) المؤسسة / السيد مفتش التربية الوطنية',
    bodyText: '',
  });

  useEffect(() => {
    if (initialSelectedDocId) {
      const found = TEACHER_DOCUMENT_TEMPLATES.find((d) => d.id === initialSelectedDocId);
      if (found) {
        setSelectedMode('standard');
        setSelectedDoc(found);
      }
    }
  }, [initialSelectedDocId]);

  useEffect(() => {
    const defaults: Record<string, string> = {};
    selectedDoc.fields.forEach((f) => {
      defaults[f.key] = f.defaultValue;
    });
    setFieldValues(defaults);
  }, [selectedDoc]);

  const handleResetDefaults = () => {
    const defaults: Record<string, string> = {};
    selectedDoc.fields.forEach((f) => {
      defaults[f.key] = f.defaultValue;
    });
    setFieldValues(defaults);
  };

  const saveCustomDocs = (updated: CustomTeacherDocument[]) => {
    setCustomDocs(updated);
    localStorage.setItem('snte_teachers_custom_docs_2026', JSON.stringify(updated));
  };

  const handleCreateCustomDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CustomTeacherDocument = {
      id: `cdoc-${Date.now()}`,
      code: newDocForm.code,
      title: newDocForm.title,
      stageScope: newDocForm.stageScope,
      category: newDocForm.category,
      description: newDocForm.description || 'مستند بيداغوجي / إداري مخصص مضاف من طرف الأستاذ',
      recipientOrAuthority: newDocForm.recipientOrAuthority,
      bodyText: newDocForm.bodyText,
      createdAt: new Date().toLocaleDateString('ar-DZ'),
    };
    const updated = [created, ...customDocs];
    saveCustomDocs(updated);
    setSelectedCustomDoc(created);
    setSelectedMode('custom');
    setIsAddingDoc(false);
    setNewDocForm({
      ...newDocForm,
      code: `مستند مخصص / أ.${updated.length + 7}`,
      title: '',
      description: '',
      bodyText: '',
    });
  };

  const handleDeleteCustomDoc = (id: string) => {
    const remaining = customDocs.filter((d) => d.id !== id);
    saveCustomDocs(remaining);
    if (selectedCustomDoc?.id === id) {
      if (remaining.length > 0) {
        setSelectedCustomDoc(remaining[0]);
      } else {
        setSelectedMode('standard');
      }
    }
  };

  const renderedBody =
    selectedMode === 'standard'
      ? selectedDoc.bodyTemplate(fieldValues, profile)
      : selectedCustomDoc
      ? `${selectedCustomDoc.recipientOrAuthority}\n\n${selectedCustomDoc.bodyText}`
      : '';

  const activeTitle =
    selectedMode === 'standard' ? selectedDoc.title : selectedCustomDoc?.title || '';
  const activeCode =
    selectedMode === 'standard' ? selectedDoc.code : selectedCustomDoc?.code || '';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#d4af37]" />
              <span>حقيبة الوثائق الرسمية للأستاذ · المولد التفاعلي وإضافة المستندات الخاصة</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              اختر من النماذج القياسية المعتمدة أو أضف مستندك البيداغوجي والإداري الخاص واطبعه بترويسة الجمهورية
              الجزائرية الديمقراطية الشعبية (A4)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddingDoc(!isAddingDoc)}
              className="px-4 py-2.5 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/60 text-xs font-extrabold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مستند جديد للحقيبة</span>
            </button>
            {selectedMode === 'standard' && (
              <button
                onClick={handleResetDefaults}
                className="px-3.5 py-2.5 rounded-xl bg-[#05140d] hover:bg-[#0d281a] text-slate-300 border border-[#d4af37]/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة النص القياسي</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوثيقة الرسمية (A4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add New Custom Document Form */}
      {isAddingDoc && (
        <form
          onSubmit={handleCreateCustomDocument}
          className="bg-[#092216] border-2 border-[#d4af37] rounded-2xl p-6 space-y-4 text-xs sm:text-sm no-print shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
            <h3 className="text-base font-black text-[#f5d77f] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>إضافة مستند إداري أو بيداغوجي جديد إلى حقيبة وثائق الأستاذ</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingDoc(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              إغلاق النموذج
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">عنوان المستند الجديد</label>
              <input
                type="text"
                value={newDocForm.title}
                onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                placeholder="مثال: طلب ترخيص غياب مبرر / تقرير بيداغوجي حول فوج تربوي / طلب تجهيز مخبر..."
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">رمز / مرجع المستند</label>
              <input
                type="text"
                value={newDocForm.code}
                onChange={(e) => setNewDocForm({ ...newDocForm, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">تصنيف المستند</label>
              <select
                value={newDocForm.category}
                onChange={(e) =>
                  setNewDocForm({
                    ...newDocForm,
                    category: e.target.value as CustomTeacherDocument['category'],
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              >
                <option value="pedagogical">وثيقة بيداغوجية</option>
                <option value="administrative">مراسلة / وثيقة إدارية</option>
                <option value="inspection">ملف تفتيش وتكوين</option>
                <option value="councils">مجالس وتنسيق</option>
                <option value="exams">امتحانات وتقويم</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">الجهة المرسل إليها / المعنية بالمستند</label>
              <input
                type="text"
                value={newDocForm.recipientOrAuthority}
                onChange={(e) => setNewDocForm({ ...newDocForm, recipientOrAuthority: e.target.value })}
                placeholder="مثال: إلى السيد مدير المؤسسة / إلى السيد مفتش التربية الوطنية..."
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">وصف مختصر للمستند</label>
            <input
              type="text"
              value={newDocForm.description}
              onChange={(e) => setNewDocForm({ ...newDocForm, description: e.target.value })}
              placeholder="الغرض من هذا المستند..."
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">مضمون ونص المستند الكامل</label>
            <textarea
              rows={6}
              value={newDocForm.bodyText}
              onChange={(e) => setNewDocForm({ ...newDocForm, bodyText: e.target.value })}
              placeholder="اكتب نص المستند هنا ليتم تنسيقه تلقائياً بترويسة الجمهورية الجزائرية الديمقراطية الشعبية وبياناتك المهنية..."
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingDoc(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa771c] text-[#06150e] font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ المستند في الحقيبة وعرضه للطباعة</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Split: Document Selector & Editor (Left) + Live A4 Paper Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 no-print">
          {/* Custom Added Documents List (if any) */}
          {customDocs.length > 0 && (
            <div className="bg-[#092418] border border-[#d4af37]/50 rounded-2xl p-4 space-y-2.5">
              <div className="text-xs font-bold text-emerald-300 pb-2 border-b border-[#d4af37]/20">
                المستندات المخصصة المضافة من طرف الأستاذ ({customDocs.length}):
              </div>
              {customDocs.map((cdoc) => {
                const active = selectedMode === 'custom' && selectedCustomDoc?.id === cdoc.id;
                return (
                  <div
                    key={cdoc.id}
                    onClick={() => {
                      setSelectedMode('custom');
                      setSelectedCustomDoc(cdoc);
                    }}
                    className={`w-full text-right p-3.5 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#0d2e1e] border-[#d4af37] shadow-md'
                        : 'bg-[#05140d] border-[#d4af37]/20 hover:border-[#d4af37]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="text-[#f5d77f] font-bold">{cdoc.code}</span>
                      <div className="flex items-center gap-2">
                        <span>{cdoc.createdAt}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomDoc(cdoc.id);
                          }}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="حذف المستند"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-white">{cdoc.title}</div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{cdoc.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Standard Document Templates List */}
          <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-[#f5d77f] pb-2 border-b border-[#d4af37]/20">
              النماذج الرسمية القياسية للأستاذ ({TEACHER_DOCUMENT_TEMPLATES.length} نماذج):
            </div>
            {TEACHER_DOCUMENT_TEMPLATES.map((doc) => {
              const active = selectedMode === 'standard' && selectedDoc.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedMode('standard');
                    setSelectedDoc(doc);
                  }}
                  className={`w-full text-right p-3.5 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0d2e1e] border-[#d4af37] shadow-md'
                      : 'bg-[#05140d] border-[#d4af37]/20 hover:border-[#d4af37]/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="text-[#f5d77f] font-bold">{doc.code}</span>
                    <span>الأطوار الثلاثة</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">{doc.title}</div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{doc.description}</p>
                </button>
              );
            })}
          </div>

          {/* Interactive Field Customizer */}
          {selectedMode === 'standard' ? (
            <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 pb-2 border-b border-[#d4af37]/20">
                <Edit3 className="w-4 h-4 text-[#d4af37]" />
                <span>تحرير بيانات الوثيقة القياسية المختارة:</span>
              </div>
              {selectedDoc.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">{field.label}</label>
                  {field.defaultValue.length > 70 ? (
                    <textarea
                      rows={3}
                      value={fieldValues[field.key] || ''}
                      onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  ) : (
                    <input
                      type="text"
                      value={fieldValues[field.key] || ''}
                      onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            selectedCustomDoc && (
              <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 pb-2 border-b border-[#d4af37]/20">
                  <Edit3 className="w-4 h-4 text-[#d4af37]" />
                  <span>تعديل مباشر لنص المستند المخصص:</span>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">عنوان المستند</label>
                  <input
                    type="text"
                    value={selectedCustomDoc.title}
                    onChange={(e) => {
                      const next = { ...selectedCustomDoc, title: e.target.value };
                      setSelectedCustomDoc(next);
                      saveCustomDocs(customDocs.map((d) => (d.id === next.id ? next : d)));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">مضمون المستند</label>
                  <textarea
                    rows={6}
                    value={selectedCustomDoc.bodyText}
                    onChange={(e) => {
                      const next = { ...selectedCustomDoc, bodyText: e.target.value };
                      setSelectedCustomDoc(next);
                      saveCustomDocs(customDocs.map((d) => (d.id === next.id ? next : d)));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-xs text-white"
                  />
                </div>
              </div>
            )
          )}
        </div>

        {/* Right Live A4 Official Sheet (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl border-2 border-[#d4af37] print-sheet font-official min-h-[760px] flex flex-col justify-between">
            <div>
              {/* Republic Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                <div className="text-lg font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                <div className="text-base font-bold">وزارة التربية الوطنية</div>
                <div className="flex items-center justify-between text-xs font-sans font-bold text-slate-800 mt-3 pt-2 border-t border-slate-300">
                  <div className="text-right space-y-0.5">
                    <div>{profile.wilaya}</div>
                    <div>المؤسسة: {profile.schoolName}</div>
                    <div>الطور: {STAGES_METADATA[profile.stage].title}</div>
                    {profile.institutionProgramTitle && (
                      <div className="text-[11px] text-emerald-900">
                        البرنامج المرجعي: {profile.institutionProgramTitle}
                      </div>
                    )}
                  </div>
                  {profile.logoUrl && (
                    <img
                      src={profile.logoUrl}
                      alt="أيقونة التوثيق"
                      className="w-16 h-16 object-contain border border-slate-400 p-1 rounded"
                    />
                  )}
                  <div className="text-left space-y-0.5">
                    <div>المرجع: {activeCode}</div>
                    <div>السنة الدراسية: {profile.schoolYear}</div>
                    <div>التاريخ: {new Date().toLocaleDateString('ar-DZ')}</div>
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="bg-slate-100 border-2 border-slate-900 py-3 px-4 text-center mb-6">
                <h3 className="text-lg sm:text-xl font-black font-sans text-slate-900">{activeTitle}</h3>
                <div className="text-xs font-sans font-bold text-slate-700 mt-1">
                  الأستاذ(ة): {profile.fullName} · الرتبة: {profile.rank} · المادة: {profile.subject}
                </div>
              </div>

              {/* Document Body */}
              <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-900 font-sans">
                {renderedBody}
              </div>
            </div>

            {/* Official Signatures Footer */}
            <div className="grid grid-cols-2 gap-8 pt-8 mt-10 border-t-2 border-slate-900 text-xs sm:text-sm font-sans font-bold text-center">
              <div>
                <div>إمضاء الأستاذ(ة) المعني(ة)</div>
                <div className="text-slate-700 font-normal mt-1">{profile.fullName}</div>
                <div className="h-16" />
              </div>
              <div>
                <div>خاتم وإمضاء مدير المؤسسة / المفتش</div>
                <div className="text-slate-700 font-normal mt-1">{profile.schoolName}</div>
                <div className="h-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
