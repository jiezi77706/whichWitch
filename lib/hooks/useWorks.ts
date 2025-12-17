import { useState, useEffect } from 'react';
import { getAllWorks, getWorksByCreator, type Work } from '../supabase/services';

/**
 * 作品数据 Hook
 */
export function useWorks(creatorAddress?: string) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadWorks();
  }, [creatorAddress]);

  // 监听作品创建事件，自动刷新
  useEffect(() => {
    const handleWorkCreated = () => {
      console.log('🔄 检测到新作品创建，自动刷新列表...')
      loadWorks()
    }

    const handleWorkCreationFailed = (event: CustomEvent) => {
      console.log('⚠️ 作品创建失败，但仍然刷新列表以防万一:', event.detail)
      loadWorks()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('workCreated', handleWorkCreated)
      window.addEventListener('workCreationFailed', handleWorkCreationFailed as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('workCreated', handleWorkCreated)
        window.removeEventListener('workCreationFailed', handleWorkCreationFailed as EventListener)
      }
    }
  }, []);

  const loadWorks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = creatorAddress
        ? await getWorksByCreator(creatorAddress)
        : await getAllWorks();
      
      setWorks(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading works:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    works,
    loading,
    error,
    refetch: loadWorks,
  };
}
