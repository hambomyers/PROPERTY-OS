import { ReactNode } from 'react';
import UniversalCommandBar from './UniversalCommandBar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main content area */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Universal Command Bar - Always visible at bottom */}
      <UniversalCommandBar />
    </div>
  );
}
