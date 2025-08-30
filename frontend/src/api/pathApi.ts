import { api } from './apiClient';

// Types for path API
export interface Path {
  id: string;
  title: string;
  description: string;
  category: string;
  stepCount: number;
  steps: string[];
  estimatedTime?: number; // in hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePathData {
  title: string;
  description: string;
  category: string;
}

export interface UpdatePathData {
  title?: string;
  description?: string;
  category?: string;
}

export interface PathFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PathSearchResponse {
  paths: Path[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PathStats {
  totalPaths: number;
  totalCategories: number;
  pathsByCategory: Record<string, number>;
  averageStepsPerPath: number;
  mostPopularCategory: string;
}

// Path API methods
export const pathApi = {
  // Search and filter paths
  searchPaths: async (filters: PathFilters = {}): Promise<PathSearchResponse> => {
    const params = new URLSearchParams();

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/paths?${params.toString()}`);
    return response.data.data; // Extract data from wrapped response
  },

  // Get all paths (legacy method, use searchPaths instead)
  getAllPaths: async (category?: string, limit?: number, skip?: number): Promise<Path[]> => {
    const filters: PathFilters = {};
    if (category) filters.category = category;
    if (limit) filters.limit = limit;
    if (skip) filters.page = Math.floor(skip / (limit || 10)) + 1;

    const response = await pathApi.searchPaths(filters);
    return response.paths;
  },

  // Get path by ID
  getPathById: async (id: string): Promise<Path> => {
    const response = await api.get(`/paths/${id}`);
    return response.data.data.path;
  },

  // Create new path
  createPath: async (pathData: CreatePathData): Promise<Path> => {
    const response = await api.post('/paths', pathData);
    return response.data.data.path; // Extract path from wrapped response
  },

  // Update path
  updatePath: async (id: string, updateData: UpdatePathData): Promise<Path> => {
    const response = await api.put(`/paths/${id}`, updateData);
    return response.data.data.path; // Extract path from wrapped response
  },

  // Delete path
  deletePath: async (id: string): Promise<void> => {
    await api.delete(`/paths/${id}`);
  },

  // Get paths by category
  getPathsByCategory: async (category: string): Promise<Path[]> => {
    const response = await api.get(`/paths/category/${category}`);
    return response.data.data.paths; // Extract paths from wrapped response
  },

  // Get path statistics
  getPathStats: async (): Promise<PathStats> => {
    const response = await api.get('/paths/stats');
    return response.data.data.stats; // Extract stats from wrapped response
  },
};

export default pathApi;
