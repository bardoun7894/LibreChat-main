import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { imageService } from '../services/imageService';

const useImageStore = create(
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
      generateImage: async (params) => {
        set({ isGenerating: true, error: null });
        
        try {
          const response = await imageService.generateImage(params);
          
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

      editImage: async (imageId, prompt, options = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await imageService.editImage(imageId, prompt, options);
          
          set(state => ({
            currentGeneration: response,
            generations: state.generations.map(gen => 
              gen.id === imageId ? response : gen
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

      upscaleImage: async (imageId, options = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await imageService.upscaleImage(imageId, options);
          
          set(state => ({
            currentGeneration: response,
            generations: state.generations.map(gen => 
              gen.id === imageId ? response : gen
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

      deleteGeneration: async (imageId) => {
        set({ isLoading: true, error: null });
        
        try {
          await imageService.deleteGeneration(imageId);
          
          set(state => ({
            generations: state.generations.filter(gen => gen.id !== imageId),
            currentGeneration: state.currentGeneration?.id === imageId ? null : state.currentGeneration,
            favorites: state.favorites.filter(id => id !== imageId),
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

      toggleFavorite: async (imageId) => {
        set({ isLoading: true, error: null });
        
        try {
          const isFavorite = await imageService.toggleFavorite(imageId);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === imageId ? { ...gen, isFavorite } : gen
            ),
            currentGeneration: state.currentGeneration?.id === imageId 
              ? { ...state.currentGeneration, isFavorite } 
              : state.currentGeneration,
            favorites: isFavorite 
              ? [...state.favorites, imageId]
              : state.favorites.filter(id => id !== imageId),
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
          const response = await imageService.getGenerations(params);
          
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
          const response = await imageService.getPublicGenerations(params);
          
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
          const response = await imageService.getFavorites(params);
          
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

      fetchGenerationById: async (imageId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await imageService.getGenerationById(imageId);
          
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
          const response = await imageService.searchGenerations(query, params);
          
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

      updateGenerationSettings: async (imageId, settings) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await imageService.updateGenerationSettings(imageId, settings);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === imageId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === imageId 
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

      addTags: async (imageId, tags) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await imageService.addTags(imageId, tags);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === imageId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === imageId 
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

      removeTags: async (imageId, tags) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await imageService.removeTags(imageId, tags);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === imageId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === imageId 
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

      setCategory: async (imageId, category) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await imageService.setCategory(imageId, category);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === imageId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === imageId 
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

      togglePublic: async (imageId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await imageService.togglePublic(imageId);
          
          set(state => ({
            generations: state.generations.map(gen => 
              gen.id === imageId ? response : gen
            ),
            currentGeneration: state.currentGeneration?.id === imageId 
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
      name: 'image-store',
    }
  )
);

export { useImageStore };