import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  
  return {
    user,
    loading: isLoading,
    isAuthenticated,
  };
};
