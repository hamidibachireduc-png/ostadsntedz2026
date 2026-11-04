import React, { useState } from 'react';
import { Users, Plus, CheckCircle2, Calendar, Clock, Trash2, FileText } from 'lucide-react';
import { CoordinationItem, TeacherProfile } from '../types';

interface CoordinationSpaceProps {
  profile: TeacherProfile;
  items: CoordinationItem[];
  onUpdateItems: (updated: CoordinationItem[]) => void;
  onOpenDocumentGenerator: (docId: string) => void;
}

export const CoordinationSpace: React.FC<CoordinationSpaceProps> = ({
  profile,
  items,
  onUpdateItems,
  onOpenDocumentGenerator,
}) => {
  const [filterType, setFilterType] = useState<'all' | CoordinationItem['type']>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'agenda' as CoordinationItem['type'],
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    priority: 'high' as CoordinationItem['priority'],
    notes: '',
  });

  const typeLabels: Record<CoordinationItem['type'], string> = {
    agenda: 'مفكرة الأستاذ والآجال',
    subject_meeting: 'تنسيق المادة والندوات',
    parents_log: 'سجل استقبال الأولياء',
    exam_supervision: 'الامتحانات الرسمية والحراسة',
  };

  const filteredItems = items.filter((i) => filterType === 'all' || i.type === filterType);

  const handleToggleComplete = (id: string) => {
    onUpdateItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const handleDelete = (id: string) => {
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CoordinationItem = {
      id: `coord-${Date.now()}`,
      stage: profile.stage,
      type: newItem.type,
      title: newItem.title,
      date: newItem.date,
      time: newItem.time,
      priority: newItem.priority,
      notes: newItem.notes,
      completed: false,
    };
    onUpdateItems([created, ...items]);
    setShowAdd(false);
    setNewItem({ ...newItem, title: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#081c12] border border-[#d4af37]/40 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#d4af37]" />
              <span>فضاء التنسيق البيداغوجي، الأستاذ الرئيسي، وسجل استقبال أولياء التلاميذ</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              تنظيم اجتماعات تنسيق المادة، تحضير مجالس الأقسام، توثيق لقاءات الأولياء، ومتابعة الندوات التفتيشية
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenDocumentGenerator('doc-parent-invitation')}
              className="px-3.5 py-2.5 rounded-xl bg-[#105e32] hover:bg-[#157a42] text-[#f5d77f] border border-[#d4af37]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>تحرير استدعاء ولي أمر التلميذ</span>
            </button>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58922] text-[#06150e] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل موعد أو محضر تنسيق</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-5 pt-4 border-t border-[#d4af37]/20">
          {[
            { id: 'all', label: 'كل السجلات والمواعيد' },
            { id: 'agenda', label: 'مفكرة الأستاذ والآجال' },
            { id: 'subject_meeting', label: 'تنسيق المادة والندوات' },
            { id: 'parents_log', label: 'سجل استقبال الأولياء' },
            { id: 'exam_supervision', label: 'الامتحانات الرسمية والحراسة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as 'all' | CoordinationItem['type'])}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#105e32] text-[#f5d77f] border border-[#d4af37]/50'
                  : 'bg-[#05140d] text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="bg-[#092216] border border-[#d4af37] rounded-2xl p-5 space-y-4 text-xs sm:text-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">نوع السجل</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as CoordinationItem['type'] })}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              >
                <option value="agenda">مفكرة الأستاذ والآجال</option>
                <option value="subject_meeting">تنسيق المادة والندوات</option>
                <option value="parents_log">سجل استقبال الأولياء</option>
                <option value="exam_supervision">الامتحانات الرسمية والحراسة</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-300 mb-1 font-bold">العنوان / الموضوع</label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="مثال: جلسة تنسيق لتوحيد سلم تصحيح اختبار الفصل الثاني"
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">التاريخ</label>
                <input
                  type="date"
                  value={newItem.date}
                  onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                  className="w-full px-2 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-bold">التوقيت</label>
                <input
                  type="time"
                  value={newItem.time}
                  onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                  className="w-full px-2 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-bold">التفاصيل والخلاصة البيداغوجية</label>
            <input
              type="text"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              placeholder="ملاحظات الاجتماع أو التوصيات المتفق عليها مع ولي الأمر / أساتذة المادة..."
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-[#d4af37]/40 text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#d4af37] text-[#06150e] font-extrabold cursor-pointer"
            >
              حفظ في السجل
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              item.completed
                ? 'bg-[#05140d]/80 border-emerald-800/40'
                : 'bg-[#081c12] border-[#d4af37]/35 shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#f5d77f] font-bold mb-2">
                <span>{typeLabels[item.type]}</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {item.date} · {item.time}
                </span>
              </div>
              <h3
                className={`text-sm sm:text-base font-extrabold mb-1.5 ${
                  item.completed ? 'line-through text-slate-400' : 'text-white'
                }`}
              >
                {item.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.notes}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#d4af37]/15">
              <button
                onClick={() => handleToggleComplete(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  item.completed
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                    : 'bg-[#105e32] text-[#f5d77f] border border-[#d4af37]/40'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{item.completed ? 'تم الإنجاز والتوثيق' : 'تأشير الإنجاز'}</span>
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
