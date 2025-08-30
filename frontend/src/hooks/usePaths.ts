import { useState, useCallback } from 'react';
import type { Path, PathFilters, PathSearchResponse, PathStats } from '../api/pathApi';
import { pathApi } from '../api/pathApi';

// Hook for managing paths
export function usePaths() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [pathStats, setPathStats] = useState<PathStats | null>(null);
  const [searchResults, setSearchResults] = useState<PathSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter paths
  const searchPaths = useCallback(async (filters: PathFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const results = await pathApi.searchPaths(filters);
      setSearchResults(results);
      setPaths(results.paths);
      return results;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search paths';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get path by ID
  const fetchPathById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const path = await pathApi.getPathById(id);
      setCurrentPath(path);
      return path;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch path';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get paths by category
  const fetchPathsByCategory = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const categoryPaths = await pathApi.getPathsByCategory(category);
      setPaths(categoryPaths);
      return categoryPaths;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch paths by category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get path statistics
  const fetchPathStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await pathApi.getPathStats();
      setPathStats(stats);
      return stats;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch path statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new path
  const createPath = useCallback(async (pathData: { title: string; description: string; category: string }) => {
    try {
      setLoading(true);
      setError(null);
      const newPath = await pathApi.createPath(pathData);

      // Add to local state
      setPaths(prevPaths => [newPath, ...prevPaths]);

      return newPath;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create path';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update path
  const updatePath = useCallback(async (id: string, updateData: { title?: string; description?: string; category?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const updatedPath = await pathApi.updatePath(id, updateData);

      // Update local state
      setPaths(prevPaths =>
        prevPaths.map(path =>
          path.id === id ? updatedPath : path
        )
      );

      // Update current path if it's the one being updated
      if (currentPath?.id === id) {
        setCurrentPath(updatedPath);
      }

      return updatedPath;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update path';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete path
  const deletePath = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await pathApi.deletePath(id);

      // Remove from local state
      setPaths(prevPaths => prevPaths.filter(path => path.id !== id));

      // Clear current path if it's the one being deleted
      if (currentPath?.id === id) {
        setCurrentPath(null);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete path';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setPaths([]);
  }, []);

  // Enroll in a path
  const enrollInPath = useCallback(async (pathId: string) => {
    try {
      setLoading(true);
      setError(null);
  return {
    paths,
    currentPath,
    pathStats,
    searchResults,
    loading,
    error,
    searchPaths,
    fetchPathById,
    fetchPathsByCategory,
    fetchPathStats,
    createPath,
    updatePath,
    deletePath,
    clearSearch,
    clearCurrentPath,
    setError,
  };
}
