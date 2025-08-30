import { api } from './apiClient';

// Types for step API
export interface Step {
  id: string;
  name: string;
  description: string;
  content?: string; // Added content field
  path: string;
  order: number;
  resourceLinks?: string[];
  completedBy?: string[];
  completionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStepData {
  name: string;
  description: string;
  path: string;
  order: number;
  resourceLinks?: string[];
}

export interface UpdateStepData {
  name?: string;
  description?: string;
  resourceLinks?: string[];
  order?: number;
}

export interface StepCompletionData {
  stepId: string;
  userId: string;
  completed: boolean;
}

export interface UserProgress {
  completedCount: number;
  totalSteps: number;
  completionRate: number;
  remainingSteps: Array<{
    id: string;
    name: string;
    order: number;
  }>;
}

export interface StepStats {
  totalCompletions: number;
  uniqueUsers: number;
  averageCompletionTime: number;
  completionTrend: Array<{
    date: string;
    completions: number;
  }>;
}

// Step API methods
export const stepApi = {
  // Get steps by path ID
  getStepsByPath: async (pathId: string): Promise<Step[]> => {
    console.log('StepApi: Fetching steps for path ID:', pathId);
    try {
      const response = await api.get(`/steps/path/${pathId}`);
      console.log('StepApi: Raw response:', response);
      console.log('StepApi: Response data:', response.data);

      // Handle different response formats
      if (response.data && response.data.data && response.data.data.steps) {
        console.log('StepApi: Found steps in response.data.data.steps:', response.data.data.steps);
        return response.data.data.steps;
      } else if (response.data && response.data.steps) {
        console.log('StepApi: Found steps in response.data.steps:', response.data.steps);
        return response.data.steps;
      } else if (Array.isArray(response.data)) {
        console.log('StepApi: Response data is array:', response.data);
        return response.data;
      } else {
        console.log('StepApi: Unexpected response format, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('StepApi: Error fetching steps:', error);
      throw error;
    }
  },

  // Get step by ID
  getStepById: async (id: string): Promise<Step> => {
    const response = await api.get<Step>(`/steps/${id}`);
    return response.data;
  },

  // Create new step
  createStep: async (stepData: CreateStepData): Promise<Step> => {
    const response = await api.post<Step>('/steps', stepData);
    return response.data;
  },

  // Add step to path (alternative method)
  addStepToPath: async (pathId: string, stepData: Omit<CreateStepData, 'path'>): Promise<Step> => {
    const response = await api.post<Step>(`/steps/${pathId}`, {
      ...stepData,
      path: pathId,
    });
    return response.data;
  },

  // Update step
  updateStep: async (id: string, updateData: UpdateStepData): Promise<Step> => {
    const response = await api.put<Step>(`/steps/${id}`, updateData);
    return response.data;
  },

  // Delete step
  deleteStep: async (id: string): Promise<void> => {
    await api.delete(`/steps/${id}`);
  },

  // Mark step as completed
  markStepCompleted: async (stepId: string): Promise<Step> => {
    const response = await api.patch<Step>(`/steps/${stepId}/complete`);
    return response.data;
  },

  // Mark step as incomplete
  markStepIncomplete: async (stepId: string): Promise<Step> => {
    const response = await api.patch<Step>(`/steps/${stepId}/incomplete`);
    return response.data;
  },

  // Get user's completed steps
  getUserCompletedSteps: async (): Promise<Step[]> => {
    const response = await api.get<Step[]>('/steps/completed');
    return response.data;
  },

  // Get user progress for a specific path
  getUserProgress: async (userId: string, pathId: string): Promise<UserProgress> => {
    const response = await api.get<UserProgress>(`/users/${userId}/progress?pathId=${pathId}`);
    return response.data;
  },

  // Get step completion statistics
  getStepStats: async (stepId: string): Promise<StepStats> => {
    const response = await api.get<StepStats>(`/steps/${stepId}/stats`);
    return response.data;
  },
};

export default stepApi;
