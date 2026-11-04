import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Plus,
  Printer,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin,
  BookOpen,
  Layers,
  X,
  Save,
  Sparkles,
} from 'lucide-react';
import { TimetableSlot, TeacherProfile, EducationalStage } from '../types';
import { STAGES_METADATA, TEACHER_SPECIALIZATIONS_2026 } from '../data';

interface TeacherTimetableProps {
  profile: TeacherProfile;
  timetable: TimetableSlot[];
  onUpdateTimetable: (updated: TimetableSlot[]) => void;
}

const DAYS: TimetableSlot['day'][] = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

const PERIODS = [
  { index: 1, label: 'الحصة 1 (صباحاً)', time: '08:00 - 09:00' },
  { index: 2, label: 'الحصة 2 (صباحاً)', time: '09:00 - 10:00' },
  { index: 3, label: 'الحصة 3 (صباحاً)', time: '10:00 - 11:00' },
  { index: 4, label: 'الحصة 4 (صباحاً)', time: '11:00 - 12:00' },
  { index: 5, label: 'الحصة 5 (مساءً)', time: '13:30 - 14:30' },
  { index: 6, label: 'الحصة 6 (مساءً)', time: '14:30 - 15:30' },
  { index: 7, label: 'الحصة 7 (مساءً)', time: '15:30 - 16:30' },
];

export const TeacherTimetable: React.FC<TeacherTimetableProps> = ({
  profile,
  timetable,
  onUpdateTimetable,
}) => {
  const [selectedStage, setSelectedStage] = useState<EducationalStage>(profile.stage);
  const [viewMode, setViewMode] = useState<'all' | 'class' | 'room' | 'subject'>('all');
  const [selectedFilterValue, setSelectedFilterValue] = useState<string>('');

  // Modal state for interactive Add / Edit (clicking any cell)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const stageSpecializations = useMemo(
    () => TEACHER_SPECIALIZATIONS_2026.filter((sp) => sp.stage === selectedStage),
    [selectedStage]
  );

  const [selectedSpecId, setSelectedSpecId] = useState<string>(
    () => TEACHER_SPECIALIZATIONS_2026.find((sp) => sp.stage === profile.stage)?.id || ''
  );

  const activeSpecialization = useMemo(
    () =>
      stageSpecializations.find((sp) => sp.id === selectedSpecId) ||
      stageSpecializations[0],
    [stageSpecializations, selectedSpecId]
  );

  const [slotForm, setSlotForm] = useState<{
    day: TimetableSlot['day'];
    periodIndex: number;
    className: string;
    subject: string;
    activityName: string;
    sessionType: TimetableSlot['sessionType'];
    room: string;
    allowParallelComparison?: boolean;
  }>({
    day: 'الأحد',
    periodIndex: 1,
    className: profile.assignedClasses[0] || '3 ع ت 1',
    subject: profile.subject,
    activityName: '',
    sessionType: 'lesson',
    room: 'قاعة 12',
    allowParallelComparison: false,
  });

  // Slots for the selected stage
  const stageSlots = useMemo(
    () => timetable.filter((s) => s.stage === selectedStage),
    [timetable, selectedStage]
  );

  // Unique classes, rooms, subjects for interactive filtering
  const uniqueClasses = useMemo(
    () =>
      Array.from(
        new Set([
          ...(selectedStage === profile.stage ? profile.assignedClasses : []),
          ...stageSlots.map((s) => s.className),
        ])
      ),
    [stageSlots, profile.assignedClasses, profile.stage, selectedStage]
  );

  const uniqueRooms = useMemo(
    () => Array.from(new Set(stageSlots.map((s) => s.room))),
    [stageSlots]
  );

  const uniqueSubjects = useMemo(
    () => Array.from(new Set(stageSlots.map((s) => s.subject))),
    [stageSlots]
  );

  // Filtered slots according to viewMode
  const displayedSlots = useMemo(() => {
    if (viewMode === 'all' || !selectedFilterValue) return stageSlots;
    if (viewMode === 'class') {
      return stageSlots.filter((s) => s.className === selectedFilterValue);
    }
    if (viewMode === 'room') {
      return stageSlots.filter((s) => s.room === selectedFilterValue);
    }
    if (viewMode === 'subject') {
      return stageSlots.filter((s) => s.subject === selectedFilterValue);
    }
    return stageSlots;
  }, [stageSlots, viewMode, selectedFilterValue]);

  // Automatic Conflict Detector (كاشف التعارضات البيداغوجية)
  const conflicts = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < stageSlots.length; i++) {
      for (let j = i + 1; j < stageSlots.length; j++) {
        const s1 = stageSlots[i];
        const s2 = stageSlots[j];
        if (s1.day === s2.day && s1.periodIndex === s2.periodIndex) {
          const periodLabel =
            PERIODS.find((p) => p.index === s1.periodIndex)?.label || `الحصة ${s1.periodIndex}`;
          if (s1.room === s2.room) {
            list.push(
              `تعارض قاعة/مخبر يوم ${s1.day} (${periodLabel}): القاعة "${s1.room}" مبرمجة للفوجين (${s1.className}) و (${s2.className}) في نفس التوقيت.`
            );
          } else {
            list.push(
              `تعارض توقيت يوم ${s1.day} (${periodLabel}): برمجة مزدوجة بين الفوج (${s1.className} - ${s1.room}) والفوج (${s2.className} - ${s2.room}).`
            );
          }
        }
      }
    }
    return list;
  }, [stageSlots]);

  // Open modal when clicking an empty cell (day, periodIndex)
  const handleOpenAddAtCell = (day: TimetableSlot['day'], periodIndex: number) => {
    setEditingSlotId(null);
    const defaultSpec =
      TEACHER_SPECIALIZATIONS_2026.find((sp) => sp.stage === selectedStage) ||
      TEACHER_SPECIALIZATIONS_2026[0];
    setSelectedSpecId(defaultSpec.id);
    const defaultSubject =
      selectedStage === profile.stage
        ? profile.subject
        : defaultSpec.assignedSubjects[0] || STAGES_METADATA[selectedStage].subjects[0];
    const defaultActivity =
      selectedStage === 'primary' && defaultSpec.activitiesSubCategories
        ? defaultSpec.activitiesSubCategories[0]
        : '';

    setSlotForm({
      day,
      periodIndex,
      className:
        viewMode === 'class' && selectedFilterValue
          ? selectedFilterValue
          : uniqueClasses[0] || 'فوج 1',
      subject: defaultSubject,
      activityName: defaultActivity,
      sessionType: 'lesson',
      room:
        viewMode === 'room' && selectedFilterValue
          ? selectedFilterValue
          : selectedStage === 'primary'
          ? 'حجرة 05'
          : selectedStage === 'middle'
          ? 'مخبر الفيزياء 1'
          : 'قاعة 12',
      allowParallelComparison: false,
    });
    setIsModalOpen(true);
  };

  // Open modal when clicking an existing slot to edit
  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setSlotForm({
      day: slot.day,
      periodIndex: slot.periodIndex,
      className: slot.className,
      subject: slot.subject,
      activityName: slot.activityName || '',
      sessionType: slot.sessionType,
      room: slot.room,
      allowParallelComparison: false,
    });
    setIsModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const periodObj =
      PERIODS.find((p) => p.index === Number(slotForm.periodIndex)) || PERIODS[0];

    if (editingSlotId) {
      // Update existing slot
      const updated = timetable.map((s) =>
        s.id === editingSlotId
          ? {
              ...s,
              day: slotForm.day,
              periodIndex: Number(slotForm.periodIndex),
              timeRange: periodObj.time,
              stage: selectedStage,
              className: slotForm.className,
              subject: slotForm.subject,
              activityName: slotForm.activityName,
              sessionType: slotForm.sessionType,
              room: slotForm.room,
            }
          : s
      );
      onUpdateTimetable(updated);
    } else {
      // Create new slot (replace existing at same day/period/stage unless user wants to test conflict detector)
      const baseList = slotForm.allowParallelComparison
        ? timetable
        : timetable.filter(
            (s) =>
              !(
                s.stage === selectedStage &&
                s.day === slotForm.day &&
                s.periodIndex === Number(slotForm.periodIndex)
              )
          );

      const created: TimetableSlot = {
        id: `tt-${Date.now()}`,
        day: slotForm.day,
        periodIndex: Number(slotForm.periodIndex),
        timeRange: periodObj.time,
        stage: selectedStage,
        className: slotForm.className,
        subject: slotForm.subject,
        activityName: slotForm.activityName,
        sessionType: slotForm.sessionType,
        room: slotForm.room,
      };
      onUpdateTimetable([...baseList, created]);
    }
    setIsModalOpen(false);
  };

  const handleRemoveSlot = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateTimetable(timetable.filter((s) => s.id !== id));
    if (editingSlotId === id) {
      setIsModalOpen(false);
    }
  };

  const statutoryQuota =
    selectedStage === profile.stage
      ? profile.weeklyQuotaHours
      : selectedStage === 'primary'
      ? 22.5
      : selectedStage === 'middle'
      ? 20
      : 18;

  const teachingSlotsCount = stageSlots.filter(
    (s) => s.sessionType === 'lesson' || s.sessionType === 'tp_td' || s.sessionType === 'remediation'
  ).length;

  const overtimeHours = Math.max(0, teachingSlotsCount - statutoryQuota);
  const quotaPercentage = Math.min(100, Math.round((teachingSlotsCount / statutoryQuota) * 100));

  const sessionTypeStyles: Record<
    TimetableSlot['sessionType'],
    { label: string; bg: string; badge: string }
  > = {
    lesson: {
      label: 'درس نظري / تعلم',
      bg: 'bg-[#0d2e1e] border-[#d4af37]/50 hover:border-[#f5d77f]',
      badge: 'bg-[#105e32] text-[#f5d77f]',
    },
    tp_td: {
      label: 'أعمال موجهة / مخبر',
      bg: 'bg-sky-950/60 border-sky-500/50 hover:border-sky-400',
      badge: 'bg-sky-900/80 text-sky-200',
    },
    remediation: {
      label: 'معالجة بيداغوجية / دعم',
      bg: 'bg-amber-950/60 border-amber-500/50 hover:border-amber-400',
      badge: 'bg-amber-900/80 text-amber-200',
    },
    coordination: {
      label: 'ندوة / تنسيق المادة',
      bg: 'bg-purple-950/60 border-purple-500/50 hover:border-purple-400',
      badge: 'bg-purple-900/80 text-purple-200',
    },
    parents_reception: {
      label: 'استقبال الأولياء',
      bg: 'bg-emerald-950/70 border-emerald-500/50 hover:border-emerald-400',
      badge: 'bg-emerald-900/80 text-emerald-200',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Interactive Controls & Stage Switcher */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6 shadow-xl no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#105e32]/50 border border-[#d4af37]/40 text-xs font-bold text-[#f5d77f] mb-2">
              <CalendarClock className="w-4 h-4" />
              <span>نظام التواقيت التفاعلي الذكي للأطوار الثلاثة — تحيين 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              إدارة جدول التوقيت الأسبوعي، كاشف التعارضات، وتسميات الأنشطة البيداغوجية
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              انقر مباشرة على أي خانة فارغة في الجدول لإسناد حصة، أو انقر على حصة مبرمجة لتعديلها أو تغيير قاعتها ونشاطها
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenAddAtCell('الأحد', 1)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حصة جديدة</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة جدول التوقيت الرسمي (A4)</span>
            </button>
          </div>
        </div>

        {/* Interactive Stage Tabs & View Mode Filter Bar (Like Reference App) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-5 pt-5 border-t border-[#d4af37]/20 items-end">
          {/* Stage Selector */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>الطور التعليمي لجدول التوقيت:</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['primary', 'middle', 'secondary'] as EducationalStage[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStage(st);
                    setViewMode('all');
                    setSelectedFilterValue('');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    selectedStage === st
                      ? 'bg-[#105e32] text-[#f5d77f] border-[#d4af37] shadow-sm'
                      : 'bg-[#05140d] text-slate-300 border-[#d4af37]/20 hover:text-white'
                  }`}
                >
                  {STAGES_METADATA[st].shortTitle}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Selector (كل الحصص / حسب الفوج / حسب القاعة / حسب المادة) */}
          <div className="lg:col-span-5">
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              طريقة العرض والفلترة التفاعلية:
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-[#05140d] p-1 rounded-xl border border-[#d4af37]/30">
              <button
                onClick={() => {
                  setViewMode('all');
                  setSelectedFilterValue('');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'all'
                    ? 'bg-[#d4af37] text-[#06150e]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                الجدول الكامل
              </button>
              <button
                onClick={() => {
                  setViewMode('class');
                  setSelectedFilterValue(uniqueClasses[0] || '');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'class'
                    ? 'bg-[#d4af37] text-[#06150e]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>حسب الفوج</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('room');
                  setSelectedFilterValue(uniqueRooms[0] || '');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'room'
                    ? 'bg-[#d4af37] text-[#06150e]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>حسب القاعة</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('subject');
                  setSelectedFilterValue(uniqueSubjects[0] || '');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'subject'
                    ? 'bg-[#d4af37] text-[#06150e]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>حسب المادة</span>
              </button>
            </div>
          </div>

          {/* Dynamic Sub-filter Dropdown */}
          <div className="lg:col-span-3">
            {viewMode !== 'all' ? (
              <div>
                <label className="block text-[11px] font-bold text-[#f5d77f] mb-1.5">
                  {viewMode === 'class'
                    ? 'اختر الفوج التربوي:'
                    : viewMode === 'room'
                    ? 'اختر القاعة أو المخبر:'
                    : 'اختر المادة المسندة:'}
                </label>
                <select
                  value={selectedFilterValue}
                  onChange={(e) => setSelectedFilterValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37] text-xs text-white font-bold focus:outline-none"
                >
                  {(viewMode === 'class'
                    ? uniqueClasses
                    : viewMode === 'room'
                    ? uniqueRooms
                    : uniqueSubjects
                  ).map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#05140d] border border-[#d4af37]/20 text-[11px] text-slate-300 flex items-center justify-between">
                <span>إجمالي الحصص المبرمجة:</span>
                <span className="font-black text-[#f5d77f] text-sm tabular-nums">
                  {stageSlots.length} حصة
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Automatic Conflict Detector Banner (كاشف التعارضات البيداغوجية) */}
      <div className="no-print">
        {conflicts.length === 0 ? (
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-emerald-300">
                  كاشف التعارضات البيداغوجية الآلي: الجدول سليم 100%
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  لا توجد أي تداخلات زمنية في إسناد الأفواج أو القاعات والمخابر في {STAGES_METADATA[selectedStage].title}.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-900/70 text-emerald-200 text-[11px] font-bold border border-emerald-500/30 shrink-0">
              مطابق للمقاييس البيداغوجية
            </span>
          </div>
        ) : (
          <div className="bg-rose-950/70 border-2 border-rose-500 rounded-xl p-4 space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-rose-300 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>تنبيه كاشف التعارضات: تم رصد ({conflicts.length}) تعارض في جدول التوقيت!</span>
            </div>
            <ul className="space-y-1 text-xs text-rose-100 list-disc list-inside pr-2">
              {conflicts.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Interactive Weekly Timetable Grid */}
      <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 overflow-x-auto shadow-xl print-sheet">
        {/* Official Print Header */}
        <div className="hidden print:block text-black border-b-2 border-black pb-4 mb-4">
          <div className="text-center font-bold text-sm">
            الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية
          </div>
          <div className="flex items-center justify-between text-xs mt-2">
            <div>
              <div>{profile.wilaya}</div>
              <div>المؤسسة: {profile.schoolName}</div>
              {profile.institutionProgramTitle && (
                <div>البرنامج المرجعي: {profile.institutionProgramTitle}</div>
              )}
            </div>
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt="شعار المؤسسة"
                className="w-16 h-16 object-contain border border-black p-1 rounded"
              />
            )}
            <div className="text-left">
              <div>الأستاذ(ة): {profile.fullName} ({profile.rank})</div>
              <div>المادة: {profile.subject} — الموسم الدراسي: {profile.schoolYear}</div>
            </div>
          </div>
          <h3 className="text-center font-extrabold text-base mt-2 underline">
            جدول التوقيت الأسبوعي الرسمي ({STAGES_METADATA[selectedStage].title})
          </h3>
        </div>

        <table className="w-full text-right text-xs border-collapse min-w-[920px]">
          <thead>
            <tr className="bg-[#05140d] border-b-2 border-[#d4af37]/40 text-[#f5d77f]">
              <th className="py-3.5 px-3 font-extrabold border-l border-[#d4af37]/20 w-28">
                اليوم / الحصة
              </th>
              {PERIODS.map((p) => (
                <th
                  key={p.index}
                  className="py-3 px-2 font-bold text-center border-l border-[#d4af37]/15"
                >
                  <div className="text-xs font-extrabold">{p.label}</div>
                  <div className="text-[10px] font-mono text-slate-400 tabular-nums mt-0.5">
                    {p.time}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/20">
            {DAYS.map((day) => (
              <tr key={day} className="hover:bg-[#0c291b]/20 transition-colors">
                <td className="py-4 px-3 font-black text-white bg-[#05140d]/90 border-l border-[#d4af37]/25 text-center">
                  {day}
                </td>
                {PERIODS.map((p) => {
                  const cellSlots = displayedSlots.filter(
                    (s) => s.day === day && s.periodIndex === p.index
                  );
                  const hasConflictHere =
                    stageSlots.filter((s) => s.day === day && s.periodIndex === p.index).length > 1;

                  return (
                    <td
                      key={p.index}
                      className={`p-1.5 border-l border-[#d4af37]/15 align-top min-w-[135px] h-28 transition-colors ${
                        hasConflictHere ? 'bg-rose-950/40' : ''
                      }`}
                    >
                      {cellSlots.length > 0 ? (
                        <div className="space-y-1.5 h-full">
                          {cellSlots.map((slot) => {
                            const style = sessionTypeStyles[slot.sessionType];
                            return (
                              <div
                                key={slot.id}
                                onClick={() => handleOpenEditSlot(slot)}
                                className={`h-full p-2.5 rounded-xl border ${style.bg} flex flex-col justify-between relative group cursor-pointer transition-all shadow-sm`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-black text-[#f5d77f] text-xs truncate">
                                      {slot.className}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditSlot(slot);
                                        }}
                                        className="p-1 rounded bg-[#05140d]/80 text-emerald-300 hover:text-white cursor-pointer"
                                        title="تعديل الحصة"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleRemoveSlot(slot.id, e)}
                                        className="p-1 rounded bg-[#05140d]/80 text-rose-400 hover:text-rose-200 cursor-pointer"
                                        title="حذف الحصة"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-[11px] text-white font-bold mt-0.5 leading-snug">
                                    {slot.subject}
                                  </div>
                                  {slot.activityName && (
                                    <div className="text-[10px] text-amber-200/90 font-medium mt-0.5 line-clamp-2 leading-tight">
                                      • {slot.activityName}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/10 mt-1.5">
                                  <span className={`px-1.5 py-0.5 rounded font-bold ${style.badge}`}>
                                    {style.label}
                                  </span>
                                  <span className="text-slate-300 font-semibold truncate">
                                    {slot.room}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAddAtCell(day, p.index)}
                          className="w-full h-full min-h-[96px] rounded-xl border border-dashed border-[#d4af37]/15 hover:border-[#d4af37]/60 hover:bg-[#0d2e1e]/40 flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-[#f5d77f] transition-all group cursor-pointer"
                        >
                          <Plus className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity no-print" />
                          <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity no-print">
                            إسناد حصة
                          </span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Weekly Quota & Assigned Classes Progress Tracker (Like Reference App) */}
      <div className="bg-[#081c12] border border-[#d4af37]/30 rounded-2xl p-6 no-print">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#d4af37]" />
          <span>متابعة الحجم الساعي الأسبوعي والنصاب القانوني (المرسوم التنفيذي 25-54)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/30 md:col-span-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-200">
                نسبة استيفاء النصاب القانوني ({STAGES_METADATA[selectedStage].shortTitle})
              </span>
              <span className="font-black text-[#f5d77f] tabular-nums">
                {teachingSlotsCount} / {statutoryQuota} ساعة ({quotaPercentage}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-[#d4af37] transition-all duration-300"
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>النصاب الرسمي: {statutoryQuota} سا</span>
              <span className="text-emerald-300 font-bold">
                الساعات الإضافية (H.Supp): {overtimeHours} سا
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
            <div className="text-xs text-slate-400">توزيع الحصص حسب الأفواج:</div>
            <div className="space-y-1.5 mt-2">
              {uniqueClasses.slice(0, 3).map((cls) => {
                const count = stageSlots.filter((s) => s.className === cls).length;
                return (
                  <div key={cls} className="flex items-center justify-between text-xs">
                    <span className="text-white font-semibold truncate">{cls}</span>
                    <span className="px-2 py-0.5 rounded bg-[#105e32]/50 text-[#f5d77f] font-bold tabular-nums">
                      {count} حصص
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#05140d] border border-[#d4af37]/20">
            <div className="text-xs text-slate-400">الأنشطة البيداغوجية المكملة:</div>
            <div className="space-y-1.5 mt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">المعالجة البيداغوجية:</span>
                <span className="font-bold text-amber-300 tabular-nums">
                  {stageSlots.filter((s) => s.sessionType === 'remediation').length} حصة
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">التنسيق واستقبال الأولياء:</span>
                <span className="font-bold text-emerald-300 tabular-nums">
                  {
                    stageSlots.filter(
                      (s) =>
                        s.sessionType === 'coordination' ||
                        s.sessionType === 'parents_reception'
                    ).length
                  }{' '}
                  حصة
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal for Adding / Editing Timetable Slot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 no-print">
          <div className="bg-[#081d13] border-2 border-[#d4af37] rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/30 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-[#d4af37]" />
                  <span>
                    {editingSlotId ? 'تعديل بيانات الحصة البيداغوجية' : 'إسناد حصة جديدة في جدول التوقيت'}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  الطور التعليمي: {STAGES_METADATA[selectedStage].title} — وفق هيكلة المواد والأنشطة 2026
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#05140d] text-slate-400 hover:text-white border border-[#d4af37]/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs sm:text-sm">
              {/* Day & Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اليوم</label>
                  <select
                    value={slotForm.day}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, day: e.target.value as TimetableSlot['day'] })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفترة الزمنية</label>
                  <select
                    value={slotForm.periodIndex}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, periodIndex: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
                  >
                    {PERIODS.map((p) => (
                      <option key={p.index} value={p.index}>
                        {p.label} ({p.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2026 Teacher Specialization Selector */}
              <div>
                <label className="block text-[#f5d77f] font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تخصص الأستاذ المسند (وفق تحديثات وزارة التربية 2026)</span>
                </label>
                <select
                  value={activeSpecialization?.id || ''}
                  onChange={(e) => {
                    const spec = stageSpecializations.find((s) => s.id === e.target.value);
                    setSelectedSpecId(e.target.value);
                    if (spec) {
                      setSlotForm({
                        ...slotForm,
                        subject: spec.assignedSubjects[0] || slotForm.subject,
                        activityName:
                          spec.activitiesSubCategories && spec.activitiesSubCategories[0]
                            ? spec.activitiesSubCategories[0]
                            : slotForm.activityName,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/50 text-white font-semibold"
                >
                  {stageSpecializations.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Subject & Activity Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المادة المسندة</label>
                  <select
                    value={slotForm.subject}
                    onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
                  >
                    {(activeSpecialization?.assignedSubjects || STAGES_METADATA[selectedStage].subjects).map(
                      (subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      )
                    )}
                    <option value="ساعة استقبال أولياء التلاميذ">ساعة استقبال أولياء التلاميذ</option>
                    <option value="ندوة داخلية / تنسيق المادة">ندوة داخلية / تنسيق المادة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">طبيعة الحصة</label>
                  <select
                    value={slotForm.sessionType}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        sessionType: e.target.value as TimetableSlot['sessionType'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
                  >
                    <option value="lesson">درس نظري / تعلم</option>
                    <option value="tp_td">أعمال موجهة / تطبيقية (مخبر)</option>
                    <option value="remediation">معالجة بيداغوجية / دعم</option>
                    <option value="coordination">ندوة / تنسيق المادة</option>
                    <option value="parents_reception">ساعة استقبال الأولياء</option>
                  </select>
                </div>
              </div>

              {/* Activity Name (Dropdown for Primary 2026 Activities + Custom Text) */}
              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  {selectedStage === 'primary'
                    ? 'تسمية النشاط البيداغوجي للطور الابتدائي (تحديثات 2026):'
                    : 'عنوان النشاط البيداغوجي / الميدان أو الموضوع:'}
                </label>
                {selectedStage === 'primary' && activeSpecialization?.activitiesSubCategories ? (
                  <div className="space-y-2">
                    <select
                      value={slotForm.activityName}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, activityName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/50 text-[#f5d77f] font-bold"
                    >
                      {activeSpecialization.activitiesSubCategories.map((act) => (
                        <option key={act} value={act}>
                          {act}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={slotForm.activityName}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, activityName: e.target.value })
                      }
                      placeholder="أو اكتب تفصيل النشاط يدوياً..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#05140d] border border-[#d4af37]/30 text-white text-xs"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={slotForm.activityName}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, activityName: e.target.value })
                    }
                    placeholder="مثال: التحليل الرياضي / أعمال مخبرية ف1 / معالجة بيداغوجية..."
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                  />
                )}
              </div>

              {/* Class Group & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الفوج التربوي المسند</label>
                  <input
                    type="text"
                    list="assigned-classes-list"
                    value={slotForm.className}
                    onChange={(e) => setSlotForm({ ...slotForm, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
                    required
                  />
                  <datalist id="assigned-classes-list">
                    {uniqueClasses.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">القاعة / الحجرة / المخبر</label>
                  <input
                    type="text"
                    list="rooms-list"
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white font-bold"
                    required
                  />
                  <datalist id="rooms-list">
                    {uniqueRooms.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/20">
                {editingSlotId ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(editingSlotId)}
                    className="px-4 py-2 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-500/40 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الحصة</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingSlotId ? 'حفظ التعديلات' : 'تثبيت في الجدول'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
