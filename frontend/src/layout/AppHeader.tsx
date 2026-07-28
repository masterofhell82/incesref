'use client';
import { ThemeToggleButton } from '@/components/common/ThemeToggleButton';
import UserDropdown from '@/components/header/UserDropdown';
import { useSidebar } from '@/context/SidebarContext';
import React, { useState, useEffect, useRef } from 'react';
import { HiBars3CenterLeft } from 'react-icons/hi2';
import { GoKebabHorizontal } from 'react-icons/go';



const AppHeader: React.FC = () => {
  

  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="topbar sticky top-0 z-100 flex w-full border-gray-200 bg-white lg:border-b dark:border-gray-800 dark:bg-gray-900">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4 dark:border-gray-800">
          <button
            className="z-99999 h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-white lg:flex lg:h-11 lg:w-11 lg:border dark:border-gray-800 dark:text-gray-800"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <HiBars3CenterLeft className="h-5 w-5" />
            ) : (
              <HiBars3CenterLeft className="h-5 w-5" />
            )}
            {/* Cross Icon */}
          </button>
          <button
            onClick={toggleApplicationMenu}
            className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg text-gray-900 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <GoKebabHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? 'flex' : 'hidden'
          } shadow-theme-md w-full items-center justify-between gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="2xsm:gap-3 flex items-center gap-2">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
