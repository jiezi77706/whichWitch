import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getUserByWallet, createUser, type User } from '../supabase/services';
import { initializeDefaultFolders } from '../supabase/services/collection.service';

/**
 * 用户数据 Hook
 * 自动根据钱包地址获取或创建用户
 */
export function useUser() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setUser(null);
      return;
    }

    loadUser();
  }, [address, isConnected]);

  const loadUser = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const existingUser = await getUserByWallet(address);
      setUser(existingUser);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData: {
    name: string;
    bio?: string;
    skills?: string[];
    avatarUrl?: string;
  }) => {
    if (!address) throw new Error('No wallet connected');

    setLoading(true);
    setError(null);

    try {
      const newUser = await createUser({
        walletAddress: address,
        ...userData,
      });

      // 初始化默认文件夹
      await initializeDefaultFolders(newUser.id);

      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isNewUser = !user && isConnected;

  return {
    user,
    loading,
    error,
    isNewUser,
    registerUser,
    refetch: loadUser,
  };
}
