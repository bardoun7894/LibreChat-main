import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PhotoIcon, 
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ArrowPathIcon,
  TrashIcon,
  HeartIcon,
  ShareIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useImageGenerationStore } from '../../store/imageStore';
import { motion, AnimatePresence } from 'framer-motion';

const ImageCustomizationInterface = () => {
  const { t, i18n } = useTranslation();
  const {
    currentGeneration,
    generations,
    isLoading,
    generateImage,
    editImage,
    upscaleImage,
    deleteGeneration,
    toggleFavorite,
    updateGenerationSettings,
  } = useImageGenerationStore();

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('dall-e-3');
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [imageSettings, setImageSettings] = useState({
    width: 1024,
    height: 1024,
    quality: 'standard',
    style: 'vivid',
    steps: 20,
    cfgScale: 7.5,
    seed: null,
    samples: 1,
  });
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedImage, setSelectedImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Update available models when provider changes
    const updateModels = async () => {
      // This would fetch available models from the API
      // For now, we'll use static values
      switch (selectedProvider) {
        case 'dall-e-3':
          setSelectedModel('dall-e-3');
          setImageSettings(prev => ({
            ...prev,
            width: 1024,
            height: 1024,
            quality: 'standard',
            style: 'vivid',
          }));
          break;
        case 'midjourney':
          setSelectedModel('midjourney-v6');
          setImageSettings(prev => ({
            ...prev,
            width: 1024,
            height: 1024,
            quality: 'standard',
            style: 'vivid',
          }));
          break;
        case 'stable-diffusion':
          setSelectedModel('stable-diffusion-xl');
          setImageSettings(prev => ({
            ...prev,
            width: 1024,
            height: 1024,
            steps: 20,
            cfgScale: 7.5,
          }));
          break;
      }
    };

    updateModels();
  }, [selectedProvider]);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      await generateImage({
        prompt,
        negativePrompt,
        provider: selectedProvider,
        model: selectedModel,
        settings: imageSettings,
      });
      setPrompt('');
      setNegativePrompt('');
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async () => {
    if (!selectedImage || !editPrompt.trim()) return;

    try {
      await editImage(selectedImage.id, editPrompt, {
        provider: selectedProvider,
        model: selectedModel,
        settings: imageSettings,
      });
      setEditMode(false);
      setEditPrompt('');
    } catch (error) {
      console.error('Failed to edit image:', error);
    }
  };

  const handleUpscaleImage = async () => {
    if (!selectedImage) return;

    try {
      await upscaleImage(selectedImage.id, {
        width: imageSettings.width * 2,
        height: imageSettings.height * 2,
      });
    } catch (error) {
      console.error('Failed to upscale image:', error);
    }
  };

  const handleDownloadImage = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareImage = async (imageId) => {
    try {
      // Implement share functionality
      const shareUrl = `${window.location.origin}/images/${imageId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Image',
          text: 'Check out this AI generated image!',
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl);
        // Show toast notification
      }
    } catch (error) {
      console.error('Failed to share image:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload for image editing
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          url: e.target.result,
          name: file.name,
        });
        setActiveTab('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSetting = (key, value) => {
    setImageSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderProviderSettings = () => {
    switch (selectedProvider) {
      case 'dall-e-3':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('size')}
              </label>
              <select
                value={`${imageSettings.width}x${imageSettings.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  updateSetting('width', width);
                  updateSetting('height', height);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="1024x1024">1024x1024</option>
                <option value="1792x1024">1792x1024</option>
                <option value="1024x1792">1024x1792</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('quality')}
              </label>
              <select
                value={imageSettings.quality}
                onChange={(e) => updateSetting('quality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="standard">{t('standard')}</option>
                <option value="hd">{t('hd')}</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('style')}
              </label>
              <select
                value={imageSettings.style}
                onChange={(e) => updateSetting('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="vivid">{t('vivid')}</option>
                <option value="natural">{t('natural')}</option>
              </select>
            </div>
          </>
        );

      case 'midjourney':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('size')}
              </label>
              <select
                value={`${imageSettings.width}x${imageSettings.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  updateSetting('width', width);
                  updateSetting('height', height);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="256x256">256x256</option>
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
                <option value="1792x1024">1792x1024</option>
                <option value="1024x1792">1024x1792</option>
                <option value="2048x2048">2048x2048</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('style')}
              </label>
              <select
                value={imageSettings.style}
                onChange={(e) => updateSetting('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="vivid">{t('vivid')}</option>
                <option value="natural">{t('natural')}</option>
                <option value="anime">{t('anime')}</option>
                <option value="realistic">{t('realistic')}</option>
              </select>
            </div>
          </>
        );

      case 'stable-diffusion':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('size')}
              </label>
              <select
                value={`${imageSettings.width}x${imageSettings.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  updateSetting('width', width);
                  updateSetting('height', height);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="256x256">256x256</option>
                <option value="512x512">512x512</option>
                <option value="768x768">768x768</option>
                <option value="1024x1024">1024x1024</option>
                <option value="1536x1536">1536x1536</option>
                <option value="2048x2048">2048x2048</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('steps')}: {imageSettings.steps}
              </label>
              <input
                type="range"
                min="1"
                max="150"
                value={imageSettings.steps}
                onChange={(e) => updateSetting('steps', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('cfgScale')}: {imageSettings.cfgScale}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={imageSettings.cfgScale}
                onChange={(e) => updateSetting('cfgScale', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('seed')}
              </label>
              <input
                type="number"
                value={imageSettings.seed || ''}
                onChange={(e) => updateSetting('seed', e.target.value ? parseInt(e.target.value) : null)}
                placeholder={t('random')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
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
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('imageGeneration')}
        </h1>
        
        <div className="flex items-center space-x-2">
          {/* Provider Selector */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="dall-e-3">DALL-E 3</option>
            <option value="midjourney">Midjourney</option>
            <option value="stable-diffusion">Stable Diffusion</option>
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
                    rows={3}
                  />
                </div>

                {(selectedProvider === 'midjourney' || selectedProvider === 'stable-diffusion') && (
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
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleGenerateImage}
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

                {/* Current Generation Preview */}
                {currentGeneration && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      {t('currentGeneration')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentGeneration.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-auto rounded-lg shadow-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDownloadImage(image.url, `generated-image-${index + 1}.png`)}
                                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                title={t('download')}
                              >
                                <DownloadIcon className="h-5 w-5 text-gray-700" />
                              </button>
                              <button
                                onClick={() => handleShareImage(currentGeneration.id)}
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
                      ))}
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
              {/* Image Upload/Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  {t('selectImage')}
                </h3>
                
                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('clickToUpload')}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      {t('supportedFormats')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={selectedImage.url}
                      alt="Selected image"
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center space-x-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span>{t('remove')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Controls */}
              {selectedImage && (
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
                      
                      <button
                        onClick={handleUpscaleImage}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {t('upscale')}
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
                          onClick={handleEditImage}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generations.map((generation) => (
                <div key={generation.id} className="relative group">
                  <img
                    src={generation.primaryImage.url}
                    alt={generation.prompt}
                    className="w-full h-auto rounded-lg shadow-md cursor-pointer"
                    onClick={() => setSelectedImage(generation.primaryImage)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadImage(generation.primaryImage.url, `generated-image-${generation.id}.png`)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        title={t('download')}
                      >
                        <DownloadIcon className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleShareImage(generation.id)}
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

export default ImageCustomizationInterface;