import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export const useSidebar = (userRole: 'admin' | 'partner') => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const setLoading = useAuthStore((state) => state.setLoading);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleMenuClick = useCallback((path: string) => {
    navigate(path);
    closeMobileMenu();
  }, [navigate, closeMobileMenu]);

  const handleLogout = useCallback(async () => {
    const redirectPath = userRole === 'admin' ? '/admin/login' : '/partner/login';

    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.warn('Failed to complete logout request', error);
    } finally {
      logout();
      setLoading(false);
      navigate(redirectPath, { replace: true });
      closeMobileMenu();
    }
  }, [closeMobileMenu, logout, navigate, setLoading, userRole]);

  return {
    sidebarCollapsed,
    mobileMenuOpen,
    toggleSidebar,
    openMobileMenu,
    closeMobileMenu,
    handleMenuClick,
    handleLogout,
  };
}; 
