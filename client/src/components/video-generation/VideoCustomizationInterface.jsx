import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PlayIcon, 
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ArrowPathIcon,
  TrashIcon,
  HeartIcon,
  ShareIcon,
  DownloadIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useVideoStore } from '../../store/videoStore';
import { motion, AnimatePresence } from 'framer-motion';

const VideoCustomizationInterface = () => {
  const { t, i18n } = useTranslation();
  const {
    currentGeneration,
    generations,
    isLoading,
    isGenerating,
    generateVideo,
    editVideo,
    deleteGeneration,
    toggleFavorite,
    updateGenerationSettings,
  } = useVideoStore();

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('kuaishou');
  const [selectedModel, setSelectedModel] = useState('kuaishou-v1');
  const [videoSettings, setVideoSettings] = useState({
    duration: 10,
    resolution: '1080p',
    style: 'cinematic',
    aspectRatio: '16:9',
    motionStrength: 0.9,
    seed: null,
  });
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Update available models when provider changes
    const updateModels = async () => {
      // This would fetch available models from the API
      // For now, we'll use static values
      switch (selectedProvider) {
        case 'kuaishou':
          setSelectedModel('kuaishou-v1');
          setVideoSettings(prev => ({
            ...prev,
            duration: 10,
            resolution: '1080p',
            style: 'realistic',
            aspectRatio: '16:9',
          }));
          break;
        case 'veo3':
          setSelectedModel('veo3-v1');
          setVideoSettings(prev => ({
            ...prev,
            duration: 15,
            resolution: '1080p',
            style: 'cinematic',
            aspectRatio: '16:9',
            motionStrength: 0.9,
          }));
          break;
        case 'sora2':
          setSelectedModel('sora-2');
          setVideoSettings(prev => ({
            ...prev,
            duration: 30,
            resolution: '1080p',
            style: 'realistic',
            aspectRatio: '16:9',
          }));
          break;
      }
    };

    updateModels();
  }, [selectedProvider]);

  // Simulate progress updates during generation
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 5;
        });
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isGenerating]);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;

    try {
      await generateVideo({
        prompt,
        negativePrompt,
        provider: selectedProvider,
        model: selectedModel,
        settings: videoSettings,
      });
      setPrompt('');
      setNegativePrompt('');
    } catch (error) {
      console.error('Failed to generate video:', error);
    }
  };

  const handleEditVideo = async () => {
    if (!selectedVideo || !editPrompt.trim()) return;

    try {
      await editVideo(selectedVideo.id, editPrompt, {
        provider: selectedProvider,
        model: selectedModel,
        settings: videoSettings,
      });
      setEditMode(false);
      setEditPrompt('');
    } catch (error) {
      console.error('Failed to edit video:', error);
    }
  };

  const handleDownloadVideo = (videoUrl, filename) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareVideo = async (videoId) => {
    try {
      // Implement share functionality
      const shareUrl = `${window.location.origin}/videos/${videoId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Video',
          text: 'Check out this AI generated video!',
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl);
        // Show toast notification
      }
    } catch (error) {
      console.error('Failed to share video:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload for video editing
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedVideo({
          url: e.target.result,
          name: file.name,
        });
        setActiveTab('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSetting = (key, value) => {
    setVideoSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderProviderSettings = () => {
    switch (selectedProvider) {
      case 'kuaishou':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('duration')} (seconds): {videoSettings.duration}
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={videoSettings.duration}
                onChange={(e) => updateSetting('duration', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('resolution')}
              </label>
              <select
                value={videoSettings.resolution}
                onChange={(e) => updateSetting('resolution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('style')}
              </label>
              <select
                value={videoSettings.style}
                onChange={(e) => updateSetting('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="realistic">{t('realistic')}</option>
                <option value="anime">{t('anime')}</option>
                <option value="artistic">{t('artistic')}</option>
                <option value="cinematic">{t('cinematic')}</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('aspectRatio')}
              </label>
              <select
                value={videoSettings.aspectRatio}
                onChange={(e) => updateSetting('aspectRatio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
              </select>
            </div>
          </>
        );

      case 'veo3':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('duration')} (seconds): {videoSettings.duration}
              </label>
              <input
                type="range"
                min="5"
                max="60"
                value={videoSettings.duration}
                onChange={(e) => updateSetting('duration', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('resolution')}
              </label>
              <select
                value={videoSettings.resolution}
                onChange={(e) => updateSetting('resolution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4k">4k</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('style')}
              </label>
              <select
                value={videoSettings.style}
                onChange={(e) => updateSetting('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="cinematic">{t('cinematic')}</option>
                <option value="documentary">{t('documentary')}</option>
                <option value="animation">{t('animation')}</option>
                <option value="artistic">{t('artistic')}</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('aspectRatio')}
              </label>
              <select
                value={videoSettings.aspectRatio}
                onChange={(e) => updateSetting('aspectRatio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('motionStrength')}: {videoSettings.motionStrength}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={videoSettings.motionStrength}
                onChange={(e) => updateSetting('motionStrength', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        );

      case 'sora2':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('duration')} (seconds): {videoSettings.duration}
              </label>
              <input
                type="range"
                min="5"
                max="120"
                value={videoSettings.duration}
                onChange={(e) => updateSetting('duration', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('resolution')}
              </label>
              <select
                value={videoSettings.resolution}
                onChange={(e) => updateSetting('resolution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4k">4k</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('style')}
              </label>
              <select
                value={videoSettings.style}
                onChange={(e) => updateSetting('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="realistic">{t('realistic')}</option>
                <option value="cinematic">{t('cinematic')}</option>
                <option value="documentary">{t('documentary')}</option>
                <option value="animation">{t('animation')}</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('aspectRatio')}
              </label>
              <select
                value={videoSettings.aspectRatio}
                onChange={(e) => updateSetting('aspectRatio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="3:2">3:2</option>
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <FilmIcon className="h-6 w-6 mr-2" />
          {t('videoGeneration')}
        </h1>
        
        <div className="flex items-center space-x-2">
          {/* Provider Selector */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="kuaishou">Kuaishou (Kuai)</option>
            <option value="veo3">Veo3</option>
            <option value="sora2">Sora2</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'generate'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {t('generate')}
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'edit'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {t('edit')}
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'gallery'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {t('gallery')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'generate' && (
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Input Area */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('prompt')}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('enterPrompt')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('negativePrompt')}
                  </label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder={t('enterNegativePrompt')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleGenerateVideo}
                    disabled={!prompt.trim() || isGenerating}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        <span>{t('generating')}</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>{t('generate')}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                {isGenerating && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('progress')}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Current Generation Preview */}
                {currentGeneration && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      {t('currentGeneration')}
                    </h3>
                    <div className="relative group">
                      <video
                        src={currentGeneration.videoUrl}
                        poster={currentGeneration.thumbnailUrl}
                        controls
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadVideo(currentGeneration.videoUrl, `generated-video.mp4`)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                            title={t('download')}
                          >
                            <DownloadIcon className="h-5 w-5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => handleShareVideo(currentGeneration.id)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                            title={t('share')}
                          >
                            <ShareIcon className="h-5 w-5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => toggleFavorite(currentGeneration.id)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                            title={t('favorite')}
                          >
                            {currentGeneration.isFavorite ? (
                              <HeartSolidIcon className="h-5 w-5 text-red-500" />
                            ) : (
                              <HeartIcon className="h-5 w-5 text-gray-700" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>{t('duration')}: {currentGeneration.duration}s</p>
                      <p>{t('resolution')}: {currentGeneration.resolution}</p>
                      <p>{t('provider')}: {currentGeneration.provider}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Panel */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                    {t('settings')}
                  </h3>
                  {renderProviderSettings()}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Upload/Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  {t('selectVideo')}
                </h3>
                
                {!selectedVideo ? (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <FilmIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('clickToUpload')}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      {t('supportedFormats')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <video
                      src={selectedVideo.url}
                      controls
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center space-x-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span>{t('remove')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Controls */}
              {selectedVideo && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    {t('editControls')}
                  </h3>
                  
                  {!editMode ? (
                    <div className="space-y-4">
                      <button
                        onClick={() => setEditMode(true)}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {t('editWithPrompt')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('editPrompt')}
                        </label>
                        <textarea
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder={t('enterEditPrompt')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEditVideo}
                          disabled={!editPrompt.trim()}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {t('apply')}
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setEditPrompt('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {generations.map((generation) => (
                <div key={generation.id} className="relative group">
                  <video
                    src={generation.videoUrl}
                    poster={generation.thumbnailUrl}
                    className="w-full h-auto rounded-lg shadow-md cursor-pointer"
                    onClick={() => setSelectedVideo(generation)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadVideo(generation.videoUrl, `generated-video-${generation.id}.mp4`)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        title={t('download')}
                      >
                        <DownloadIcon className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleShareVideo(generation.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        title={t('share')}
                      >
                        <ShareIcon className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => toggleFavorite(generation.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        title={t('favorite')}
                      >
                        {generation.isFavorite ? (
                          <HeartSolidIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-gray-700" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteGeneration(generation.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        title={t('delete')}
                      >
                        <TrashIcon className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {generation.prompt}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(generation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCustomizationInterface;