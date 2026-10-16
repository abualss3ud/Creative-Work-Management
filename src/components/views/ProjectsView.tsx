import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  List,
  Clock,
  Calendar,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { Project, ProjectStatus } from '../../types';
import { ProjectDetailModal } from './ProjectDetailModal';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    clients,
    selectedProjectId,
    setSelectedProjectId,
    setIsQuickCreateOpen,
    openReportForProject,
    formatCurrency,
    formatDate,
    setPublicMode,
    t,
  } = useStudio();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{t('إدارة المشاريع ودورة الهوية البصرية', 'Projects Pipeline')}</h2>
          <p className="text-xs text-neutral-500">
            {t('تتبع سير مراحل الهوية البصرية من البريف والبحث إلى المودبورد والتسليم', 'Track projects across the 12-stage brand identity framework')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title={t('عرض البطاقات', 'Grid View')}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title={t('عرض القائمة', 'List View')}
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={() => setIsQuickCreateOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>{t('مشروع جديد', 'New Project')}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-neutral-200/80 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search size={15} className="text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('البحث باسم المشروع أو نوع الخدمة...', 'Search projects...')}
            className="w-full text-xs text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs p-1 bg-neutral-100 rounded-lg">
          {[
            { id: 'all', label: t('الكل', 'All') },
            { id: 'briefing', label: t('استقبال وبريف', 'Briefing') },
            { id: 'strategy', label: t('استراتيجية', 'Strategy') },
            { id: 'moodboard', label: t('مودبورد', 'Moodboard') },
            { id: 'concept_design', label: t('تصميم', 'Design') },
            { id: 'deliverables', label: t('تسليم', 'Deliverables') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const client = clients.find((c) => c.id === project.clientId);
            const currentStage = project.stages[project.currentStageIndex];

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="p-5 bg-white border border-neutral-200/80 rounded-xl hover:border-neutral-400 transition-all cursor-pointer shadow-xs space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                      {client?.company || client?.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-900">
                      {project.progressPercentage}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 group-hover:text-amber-900 transition-colors leading-snug">
                    {project.name}
                  </h3>

                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {project.description || project.serviceType}
                  </p>
                </div>

                {/* Current Stage Indicator */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600 font-medium truncate">
                      <span className="font-mono text-neutral-400 text-[11px] me-1">0{project.currentStageIndex + 1}.</span>
                      <span>{currentStage?.name || 'المرحلة'}</span>
                    </span>
                    {currentStage?.requiresClientApproval && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                        {t('موافقة', 'Approval')}
                      </span>
                    )}
                  </div>

                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                      style={{ width: `${project.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Footer Data */}
                <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock size={13} className="text-neutral-400" />
                    <span>{formatDate(project.targetDate)}</span>
                  </div>
                  <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                    {formatCurrency(project.budget, project.currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-start">{t('المشروع', 'Project')}</th>
                  <th className="py-3 px-4 text-start">{t('العميل', 'Client')}</th>
                  <th className="py-3 px-4 text-start">{t('المرحلة الحالية', 'Current Stage')}</th>
                  <th className="py-3 px-4 text-start">{t('الإنجاز', 'Progress')}</th>
                  <th className="py-3 px-4 text-start">{t('الميزانية', 'Budget')}</th>
                  <th className="py-3 px-4 text-start">{t('الموعد المستهدف', 'Target Date')}</th>
                  <th className="py-3 px-4 text-end">{t('إجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filteredProjects.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId);
                  const currentStage = p.stages[p.currentStageIndex];

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-bold text-neutral-900">{p.name}</td>
                      <td className="py-3.5 px-4 text-neutral-600">{client?.company || client?.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-neutral-800">{currentStage?.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${p.progressPercentage}%` }} />
                          </div>
                          <span className="font-mono text-neutral-500 text-[11px]">{p.progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold tabular-nums">
                        {formatCurrency(p.budget, p.currency)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500">{formatDate(p.targetDate)}</td>
                      <td className="py-3.5 px-4 text-end" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openReportForProject(p.id)}
                          className="px-2.5 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                        >
                          {t('تقرير PDF', 'Report PDF')}
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

      {/* Project Detail Modal */}
      {activeProject && (
        <ProjectDetailModal project={activeProject} onClose={() => setSelectedProjectId(null)} />
      )}
    </div>
  );
};
