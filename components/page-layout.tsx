import React from "react";

interface PageLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

export default function PageLayout({ header, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {header}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
} 