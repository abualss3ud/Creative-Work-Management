import React, { useState } from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { QuickCreateModal } from './components/modals/QuickCreateModal';
import { AuthModal } from './components/modals/AuthModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ClientsView } from './components/views/ClientsView';
import { ProjectsView } from './components/views/ProjectsView';
import { BriefFormsView } from './components/views/BriefFormsView';
import { ResearchStrategyView } from './components/views/ResearchStrategyView';
import { ProposalsView } from './components/views/ProposalsView';
import { AgreementsView } from './components/views/AgreementsView';
import { InvoicesView } from './components/views/InvoicesView';
import { DeliverablesView } from './components/views/DeliverablesView';
import { TemplatesLibraryView } from './components/views/TemplatesLibraryView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { ResearchReportModal } from './components/views/ResearchReportModal';
import { INITIAL_RESEARCH } from './services/mockData';

// Public Views
import { PublicClientPortal } from './components/public/PublicClientPortal';
import { PublicBriefForm } from './components/public/PublicBriefForm';
import { PublicProposalView } from './components/public/PublicProposalView';
import { PublicInvoiceView } from './components/public/PublicInvoiceView';

const MainAppContent: React.FC = () => {
  const {
    currentTab,
    publicMode,
    isReportModalOpen,
    setIsReportModalOpen,
    reportProjectId,
    projects,
    clients,
    toasts,
    removeToast,
  } = useStudio();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // If in public mode, render dedicated standalone view
  if (publicMode.type === 'portal') {
    return <PublicClientPortal />;
  }
  if (publicMode.type === 'brief') {
    return <PublicBriefForm />;
  }
  if (publicMode.type === 'proposal') {
    return <PublicProposalView />;
  }
  if (publicMode.type === 'invoice') {
    return <PublicInvoiceView />;
  }

  const reportProject = projects.find((p) => p.id === reportProjectId) || projects[0];
  const reportClient = clients.find((c) => c.id === reportProject?.clientId);

  return (
    <div className="flex h-screen w-full bg-neutral-100/60 overflow-hidden font-sans">
      {/* Collapsible Studio Navigation Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main View Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && <DashboardView />}
            {currentTab === 'clients' && <ClientsView />}
            {currentTab === 'projects' && <ProjectsView />}
            {currentTab === 'briefs' && <BriefFormsView />}
            {currentTab === 'research' && <ResearchStrategyView />}
            {currentTab === 'proposals' && <ProposalsView />}
            {currentTab === 'agreements' && <AgreementsView />}
            {currentTab === 'invoices' && <InvoicesView />}
            {currentTab === 'deliverables' && <DeliverablesView />}
            {currentTab === 'templates' && <TemplatesLibraryView />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <QuickCreateModal />
      <CommandPalette />
      <AuthModal />

      {/* Research PDF Modal */}
      {isReportModalOpen && reportProject && (
        <ResearchReportModal
          research={INITIAL_RESEARCH}
          project={reportProject}
          client={reportClient}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-4 end-4 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto p-3.5 text-xs rounded-xl shadow-lg border transition-all animate-in slide-in-from-bottom duration-200 cursor-pointer flex items-center justify-between gap-3 ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : toast.type === 'info'
                ? 'bg-neutral-900 text-white border-neutral-800'
                : 'bg-neutral-900 text-white border-neutral-800'
            }`}
          >
            <span className="leading-relaxed">{toast.message}</span>
            <span className="text-[10px] text-neutral-400 font-mono">✕</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StudioProvider>
      <MainAppContent />
    </StudioProvider>
  );
}
