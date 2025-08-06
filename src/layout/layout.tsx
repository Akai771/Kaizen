import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from "./sidebar"; // Assuming sidebar.tsx is in the same directory

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev: boolean) => !prev);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleCollapsed={toggleCollapsed} 
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-background/80"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-card w-64 border-r border-border">
            <Sidebar 
              onLinkClick={() => setSidebarOpen(false)} 
              isCollapsed={false} 
              toggleCollapsed={() => {}}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 bg-card border-b border-border shadow-sm md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground focus:outline-none"
            aria-label="Open sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold">
            Kaizen
          </h1>
          <div />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
