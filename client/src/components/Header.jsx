import React from 'react';
import { NavLink } from 'react-router-dom';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { userState } from '../store/user';
import LanguageToggle from './LanguageToggle';

const Header = () => {
  const { t } = useTranslation();
  const user = useRecoilValue(userState);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/assets/ornina-logo.jpg"
                alt="Ornina AI Platform"
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Ornina AI Platform
              </span>
            </NavLink>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={t('header.searchPlaceholder', 'Search...')}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
                <div className="relative">
                  <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              >
                {t('header.login', 'Login')}
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;