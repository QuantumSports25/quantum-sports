import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RouteHistoryState {
  lastRoute: string | null;
  setLastRoute: (route: string) => void;
  getAndClearLastRoute: () => string | null;
  clearLastRoute: () => void;
}

export const useRouteHistoryStore = create<RouteHistoryState>()(
  persist(
    (set, get) => ({
      lastRoute: null,
      
      setLastRoute: (route: string) => {
        // Only save meaningful routes (not auth/utility pages)
        const ignoredRoutes = [
          '/login',
          '/register',
          '/login-otp',
          '/admin/login',
          '/partner/login',
          '/forgot-password',
        ];

        if (!ignoredRoutes.some((ignoredRoute) => route.startsWith(ignoredRoute))) {
          set({ lastRoute: route });
        }
      },
      
      getAndClearLastRoute: () => {
        const { lastRoute } = get();
        set({ lastRoute: null });
        return lastRoute;
      },
      
      clearLastRoute: () => {
        set({ lastRoute: null });
      }
    }),
    {
      name: 'route-history-storage',
      partialize: (state) => ({ lastRoute: state.lastRoute })
    }
  )
);
