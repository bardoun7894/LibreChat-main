import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { userSettingsState } from '../store/settings';

const Settings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useRecoilState(userSettingsState);
  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('settings.general.title', 'General Settings')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.general.language', 'Language')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.general.languageDescription', 'Select your preferred language')}
              </p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="block w-40 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.general.theme', 'Theme')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.general.themeDescription', 'Choose your preferred theme')}
              </p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="block w-40 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="light">{t('settings.general.lightTheme', 'Light')}</option>
              <option value="dark">{t('settings.general.darkTheme', 'Dark')}</option>
              <option value="system">{t('settings.general.systemTheme', 'System')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.general.fontSize', 'Font Size')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.general.fontSizeDescription', 'Adjust the font size')}
              </p>
            </div>
            <select
              value={settings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', e.target.value)}
              className="block w-40 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="small">{t('settings.general.smallFont', 'Small')}</option>
              <option value="medium">{t('settings.general.mediumFont', 'Medium')}</option>
              <option value="large">{t('settings.general.largeFont', 'Large')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('settings.privacy.title', 'Privacy Settings')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.privacy.saveHistory', 'Save Chat History')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.privacy.saveHistoryDescription', 'Save your chat history for future reference')}
              </p>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.saveHistory ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
              onClick={() => handleSettingChange('saveHistory', !settings.saveHistory)}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.saveHistory ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.privacy.shareUsageData', 'Share Usage Data')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.privacy.shareUsageDataDescription', 'Help improve the product by sharing anonymous usage data')}
              </p>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.shareUsageData ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
              onClick={() => handleSettingChange('shareUsageData', !settings.shareUsageData)}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.shareUsageData ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('settings.advanced.title', 'Advanced Settings')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.advanced.debugMode', 'Debug Mode')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.advanced.debugModeDescription', 'Enable debug mode for troubleshooting')}
              </p>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.debugMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
              onClick={() => handleSettingChange('debugMode', !settings.debugMode)}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.debugMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.advanced.experimentalFeatures', 'Experimental Features')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.advanced.experimentalFeaturesDescription', 'Enable experimental features for testing')}
              </p>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.experimentalFeatures ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
              onClick={() => handleSettingChange('experimentalFeatures', !settings.experimentalFeatures)}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.experimentalFeatures ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('general')}
            >
              {t('settings.tabs.general', 'General')}
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('privacy')}
            >
              {t('settings.tabs.privacy', 'Privacy')}
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'advanced'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('advanced')}
            >
              {t('settings.tabs.advanced', 'Advanced')}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'privacy' && renderPrivacySettings()}
          {activeTab === 'advanced' && renderAdvancedSettings()}
        </div>
      </div>
    </div>
  );
};

export default Settings;