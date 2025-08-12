import React from 'react';
import Sidebar from './Sidebar';
import { PageHeader } from './ui/PageHeader';

export default function AppShell({ children, title, subtitle, actions, sidebar = <Sidebar/> }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="flex">
        {sidebar}
        <main className="flex-1 min-h-screen">
          <div className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-slate-200">
            <div className="mx-auto max-w-7xl px-5">
              <PageHeader title={title} subtitle={subtitle} actions={actions} />
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-5 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
