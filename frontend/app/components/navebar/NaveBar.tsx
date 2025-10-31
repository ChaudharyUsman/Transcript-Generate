'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Youtube, History, Globe, Star, Menu, X, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import SubscriptionButton from '../subscription/SubscriptionButton';

interface NaveBarProps {
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

const NaveBar: React.FC<NaveBarProps> = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };

    checkLogin();

    // Listen for storage changes and window focus to update login state
    const handleStorageChange = () => checkLogin();
    const handleFocus = () => checkLogin();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && menuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogoutClick = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success("Logged out successfully!");
    router.push('/');
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-4">
        {/* Logo and Title */}
        <Link href="/public-feed" className="flex items-center gap-2">
          <Youtube className="w-7 h-7 text-red-500" />
          <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wide">
            YT Video Summarizer
          </h1>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-3 sm:gap-5">
          <Link
            href={isLoggedIn ? "/public-feed" : "#"}
            onClick={(e) => !isLoggedIn && e.preventDefault()}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-700 ${isLoggedIn
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <Globe className="w-4 h-4" /> Public Summaries
          </Link>

          <Link
            href={isLoggedIn ? "/summarizer" : "#"}
            onClick={(e) => !isLoggedIn && e.preventDefault()}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-700 ${isLoggedIn
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <Youtube className="w-4 h-4" /> Summarizer
          </Link>

          <Link
            href={isLoggedIn ? "/history" : "#"}
            onClick={(e) => !isLoggedIn && e.preventDefault()}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-700 ${isLoggedIn
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <History className="w-4 h-4" /> History
          </Link>

          <Link
            href={isLoggedIn ? "/favorite" : "#"}
            onClick={(e) => !isLoggedIn && e.preventDefault()}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-700 ${isLoggedIn
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <Star className="w-4 h-4" /> Favorites
          </Link>

          {isLoggedIn && <SubscriptionButton />}

          {isLoggedIn ? (
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-300 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Menu (Right Side) */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-3/4 sm:w-2/5 bg-gray-900 text-white border-l border-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${menuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
      >
        <div className="flex flex-col h-full py-6 px-5 space-y-4">
          <Link
            href={isLoggedIn ? "/public-feed" : "#"}
            onClick={(e) => {
              if (!isLoggedIn) e.preventDefault();
              closeMenu();
            }}
            className={`flex items-center gap-2 text-lg hover:bg-gray-800 px-3 py-2 rounded-lg ${isLoggedIn
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <Globe className="w-5 h-5" /> Public Summaries
          </Link>

          <Link
            href={isLoggedIn ? "/summarizer" : "#"}
            onClick={(e) => {
              if (!isLoggedIn) e.preventDefault();
              closeMenu();
            }}
            className={`flex items-center gap-2 text-lg hover:bg-gray-800 px-3 py-2 rounded-lg ${isLoggedIn
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <Youtube className="w-5 h-5" /> Summarizer
          </Link>

          <Link
            href={isLoggedIn ? "/history" : "#"}
            onClick={(e) => {
              if (!isLoggedIn) e.preventDefault();
              closeMenu();
            }}
            className={`flex items-center gap-2 text-lg hover:bg-gray-800 px-3 py-2 rounded-lg ${isLoggedIn
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <History className="w-5 h-5" /> History
          </Link>

          <Link
            href={isLoggedIn ? "/favorite" : "#"}
            onClick={(e) => {
              if (!isLoggedIn) e.preventDefault();
              closeMenu();
            }}
            className={`flex items-center gap-2 text-lg hover:bg-gray-800 px-3 py-2 rounded-lg ${isLoggedIn
                ? "text-gray-300 hover:text-white"
                : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <Star className="w-5 h-5" /> Favorites
          </Link>

          {isLoggedIn && <SubscriptionButton />}

          {isLoggedIn ? (
            <button
              onClick={() => {
                handleLogoutClick();
                closeMenu();
              }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium mt-auto transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          ) : (
            <button
              onClick={() => {
                handleLoginClick();
                closeMenu();
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium mt-auto transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <LogIn className="w-5 h-5" /> Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NaveBar;
