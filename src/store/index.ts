import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import villasReducer from './slices/villasSlice';
import societySettingsReducer from './slices/societySettingsSlice';

// Configure store
export const store = configureStore({
  reducer: {
    villas: villasReducer,
    societySettings: societySettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['villas/fetchVillas/fulfilled', 'societySettings/fetchSocietySettings/fulfilled'],
      },
    }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks for usage in components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
