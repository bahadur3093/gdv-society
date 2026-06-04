import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ApiResponse } from '@/types';

// Society Settings interface matching API response
export interface SocietySettings {
  perSqFtRate: number;
  sinkingFundPercentage: number;
  totalVillas: number;
}

// State interface
interface SocietySettingsState {
  settings: SocietySettings | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: SocietySettingsState = {
  settings: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch society settings
export const fetchSocietySettings = createAsyncThunk<
  SocietySettings,
  void,
  { rejectValue: string }
>('societySettings/fetchSocietySettings', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/society-settings');
    const data: ApiResponse = await response.json();

    if (!data.success || !data.data) {
      return rejectWithValue(data.error || 'Failed to fetch society settings');
    }

    return data.data as SocietySettings;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
});

// Async thunk to update society settings
export const updateSocietySettings = createAsyncThunk<
  SocietySettings,
  Partial<SocietySettings>,
  { rejectValue: string }
>('societySettings/updateSocietySettings', async (settings, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/society-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    const result: ApiResponse = await response.json();

    if (!result.success || !result.data) {
      return rejectWithValue(result.error || 'Failed to update society settings');
    }

    return result.data as SocietySettings;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
});

// Create slice
const societySettingsSlice = createSlice({
  name: 'societySettings',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Update settings locally (optimistic update)
    updateSettingsLocally: (state, action: PayloadAction<SocietySettings>) => {
      state.settings = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch society settings
    builder
      .addCase(fetchSocietySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocietySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchSocietySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch society settings';
      });

    // Update society settings
    builder
      .addCase(updateSocietySettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSocietySettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSocietySettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update society settings';
      });
  },
});

// Export actions
export const { clearError, updateSettingsLocally } = societySettingsSlice.actions;

// Export selectors
export const selectSocietySettings = (state: { societySettings: SocietySettingsState }) =>
  state.societySettings.settings;
export const selectSocietySettingsLoading = (state: { societySettings: SocietySettingsState }) =>
  state.societySettings.loading;
export const selectSocietySettingsError = (state: { societySettings: SocietySettingsState }) =>
  state.societySettings.error;

// Export reducer
export default societySettingsSlice.reducer;
