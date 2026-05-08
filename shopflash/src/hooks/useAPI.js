/**
 * Custom React Hooks for API calls with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for fetching data
 */
export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      console.log("useFetch: Starting fetch...");
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      console.log("useFetch: Success", result);
      setData(result);
    } catch (err) {
      console.error("useFetch: Error", err);
      setError(err.message || 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch };
};

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export const useMutation = (mutationFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFunction]);

  return { execute, loading, error, data };
};

const useAPIHooks = {
  useFetch,
  useMutation,
};

export default useAPIHooks;
