import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { videoService } from '../services/videoService';

const useVideoStore = create(
  devtools(
    (set, get) => ({
      // State
      currentGeneration: null,
      generations: [],
      publicGenerations: [],
      favorites: [],
      isLoading: false,
      isGenerating: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      filters: {
        provider: null,
        style: null,
        category: null,
        tags: [],
      },
      sortBy: 'createdAt',
      sortOrder: 'desc',

      // Actions
      generateVideo: async (params) => {
        set({ isGenerating: true, error: null });
        
        try {
          const response = await videoService.generateVideo(params);
          
          set({
            currentGeneration: response,
            generations: [response, ...get().generations],
            isGenerating: false,
          });
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isGenerating: false,
          });
          throw error;
        }
      },

      editVideo: async (videoId, prompt, options = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.editVideo(videoId, prompt, options);
          
          set(state => ({
            currentGeneration: response,
            generations: state.generations.map(gen => 
              gen.id === videoId ? response : gen
            ),
            isLoading: false,
          }));
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      deleteGeneration: async (videoId) => {
        set({ isLoading: true, error: null });
        
        try {
          await videoService.deleteGeneration(videoId);
          
          set(state => ({
            generations: state.generations.filter(gen => gen.id !== videoId),
            currentGeneration: state.currentGeneration?.id === videoId ? null : state.currentGeneration,
            favorites: state.favorites.filter(id => id !== videoId),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      toggleFavorite: async (videoId) => {
        set({ isLoading: true, error: null });
        
        try {
          const isFavorite = await videoService.toggleFavorite(videoId);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === videoId ? { ...gen, isFavorite } : gen
            ),
            currentGeneration: state.currentGeneration?.id === videoId 
              ? { ...state.currentGeneration, isFavorite } 
              : state.currentGeneration,
            favorites: isFavorite 
              ? [...state.favorites, videoId]
              : state.favorites.filter(id => id !== videoId),
            isLoading: false,
          }));
          
          return isFavorite;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      fetchGenerations: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.getGenerations(params);
          
          set({
            generations: response.data,
            pagination: response.pagination,
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      fetchPublicGenerations: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.getPublicGenerations(params);
          
          set({
            publicGenerations: response.data,
            pagination: response.pagination,
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      fetchFavorites: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.getFavorites(params);
          
          set({
            favorites: response.data.map(gen => gen.id),
            generations: response.data,
            pagination: response.pagination,
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      fetchGenerationById: async (videoId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.getGenerationById(videoId);
          
          set({
            currentGeneration: response,
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      searchGenerations: async (query, params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.searchGenerations(query, params);
          
          set({
            generations: response.data,
            pagination: response.pagination,
            isLoading: false,
          });
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      updateGenerationSettings: async (videoId, settings) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.updateGenerationSettings(videoId, settings);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === videoId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === videoId 
              ? response 
              : state.currentGeneration,
            isLoading: false,
          }));
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      addTags: async (videoId, tags) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.addTags(videoId, tags);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === videoId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === videoId 
              ? response 
              : state.currentGeneration,
            isLoading: false,
          }));
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      removeTags: async (videoId, tags) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.removeTags(videoId, tags);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === videoId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === videoId 
              ? response 
              : state.currentGeneration,
            isLoading: false,
          }));
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      setCategory: async (videoId, category) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.setCategory(videoId, category);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === videoId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === videoId 
              ? response 
              : state.currentGeneration,
            isLoading: false,
          }));
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      togglePublic: async (videoId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await videoService.togglePublic(videoId);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === videoId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === videoId 
              ? response 
              : state.currentGeneration,
            isLoading: false,
          }));
          
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      clearCurrentGeneration: () => {
        set({ currentGeneration: null });
      },

      clearError: () => {
        set({ error: null });
      },

      setFilters: (filters) => {
        set({ filters: { ...get().filters, ...filters } });
      },

      clearFilters: () => {
        set({
          filters: {
            provider: null,
            style: null,
            category: null,
            tags: [],
          },
        });
      },

      setSorting: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder });
      },

      resetStore: () => {
        set({
          currentGeneration: null,
          generations: [],
          publicGenerations: [],
          favorites: [],
          isLoading: false,
          isGenerating: false,
          error: null,
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
          filters: {
            provider: null,
            style: null,
            category: null,
            tags: [],
          },
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
      },
    }),
    {
      name: 'video-store',
    }
  )
);

export { useVideoStore };