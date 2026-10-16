import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Download,
  Eye,
  FileCode,
  FileCheck,
  FolderArchive,
  BookOpen,
  Box,
  Layers,
  X,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { Deliverable, DeliverableCategory } from '../../types';
import { INITIAL_DELIVERABLES } from '../../services/mockData';

export const DeliverablesView: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    showToast,
    formatDate,
    t,
  } = useStudio();

  const [deliverables, setDeliverables] = useState<Deliverable[]>(INITIAL_DELIVERABLES);
  const [activeCategory, setActiveCategory] = useState<'all' | DeliverableCategory>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DeliverableCategory>('logo_vectors');
  const [newFormat, setNewFormat] = useState('AI / SVG / EPS');
  const [newSize, setNewSize] = useState(25);
  const [newNotes, setNewNotes] = useState('');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const filteredDeliverables = deliverables.filter((d) => {
    return activeCategory === 'all' || d.category === activeCategory;
  });

  const handleDownload = (d: Deliverable) => {
    showToast(t(`جارٍ تجهيز وتحميل "${d.title}" (${d.fileFormat})`, `Downloading "${d.title}"`));
  };

  const handleTogglePublic = (id: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isPublicForClient: !d.isPublicForClient } : d))
    );
    showToast(t('تم تحديث صلاحية وصول العميل للملف', 'Deliverable client visibility updated'));
  };

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newDel: Deliverable = {
      id: `del-${Date.now()}`,
      projectId: activeProject?.id || 'proj-1',
      title: newTitle,
      category: newCategory,
      fileFormat: newFormat,
      fileSizeMb: Number(newSize),
      downloadUrl: '#',
      isPublicForClient: true,
      notes: newNotes,
      uploadedAt: new Date().toISOString(),
    };
    setDeliverables([newDel, ...deliverables]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewNotes('');
    showToast(t('تمت إضافة ملف التسليم بنجاح', 'Deliverable added successfully'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('ملفات التسليم والأصول النهائية', 'Deliverables & Master Assets')}</h2>
          <p className="text-xs text-neutral-500">
            {t('تنظيم وتجهيز الملفات المصدرية، ملفات المتجهات، أدلة الهوية، وقوالب الطباعة', 'Organize master vector files, guideline manuals, and production dielines')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeProject?.id}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-hidden"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>{t('إضافة ملف تسليم', 'Add Deliverable')}</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Strip */}
      <div className="flex items-center gap-1 overflow-x-auto text-xs p-1 bg-white border border-neutral-200/80 rounded-xl shadow-xs">
        {[
          { id: 'all', label: t('الكل', 'All') },
          { id: 'logo_vectors', label: t('حزم الشعارات (Vector)', 'Logo Vectors') },
          { id: 'brand_guidelines', label: t('دليل الهوية (Guidelines)', 'Brand Guidelines') },
          { id: 'packaging', label: t('التغليف والديلاين', 'Packaging') },
          { id: 'stationery', label: t('المطبوعات', 'Stationery') },
          { id: 'source_files', label: t('الملفات المصدرية', 'Source Files') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeCategory === tab.id
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDeliverables.map((del) => (
          <div
            key={del.id}
            className="p-5 bg-white border border-neutral-200/80 rounded-xl shadow-xs hover:border-neutral-300 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-700 uppercase">
                  {del.fileFormat}
                </span>

                <button
                  onClick={() => handleTogglePublic(del.id)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm transition-colors ${
                    del.isPublicForClient
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                  title={t('تعديل ظهور الملف في بوابة العميل', 'Toggle client portal visibility')}
                >
                  {del.isPublicForClient ? t('متاح للعميل', 'Client Visible') : t('خاص بالاستوديو', 'Internal Only')}
                </button>
              </div>

              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{del.title}</h3>
              {del.notes && <p className="text-xs text-neutral-500 leading-relaxed">{del.notes}</p>}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-mono">{del.fileSizeMb} MB</span>
              <button
                onClick={() => handleDownload(del)}
                className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <Download size={13} />
                <span>{t('تحميل الملف', 'Download')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Deliverable Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">{t('إضافة أصل أو ملف تسليم جديد', 'New Deliverable')}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('عنوان الملف *', 'Title *')}</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="حزمة الشعارات المكتملة بألوان بانتون"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('التصنيف', 'Category')}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 bg-white"
                  >
                    <option value="logo_vectors">شعارات المتجهات (Vectors)</option>
                    <option value="brand_guidelines">دليل الهوية (Guidelines)</option>
                    <option value="packaging">تغليف وديلاين (Packaging)</option>
                    <option value="stationery">مطبوعات ورقية (Stationery)</option>
                    <option value="source_files">ملفات مصدرية (Source Files)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الصيغة', 'Format')}</label>
                  <input
                    type="text"
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    placeholder="AI / SVG / EPS"
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('الحجم التقريبي (MB)', 'Size (MB)')}</label>
                <input
                  type="number"
                  value={newSize}
                  onChange={(e) => setNewSize(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">{t('ملاحظات وتوصيف', 'Notes')}</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="ملاحظات الاستخدام أو تعليمات الطباعة للمطابع..."
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
                >
                  {t('إضافة الأصل', 'Add Deliverable')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
