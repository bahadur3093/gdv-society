import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ApiResponse } from '@/types';

// Villa interface matching API response
export interface Villa {
  villaNo: number;
  type: string;
  areaInSqM: number;
  ownerName: string;
  areaInSqFt: number;
  remarks?: string;
  maintenanceAmount: number;
  perSqFtRate: number;
  // Calculated expense fields from API
  fixedAmount?: number;
  variableAmount?: number;
  hybridTotal?: number;
  flatRate?: number;
  // Additional fields for ledger calculations
  sinkingFundAmount?: number;
  totalAmount?: number;
}

// State interface
interface VillasState {
  villas: Villa[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Initial state
const initialState: VillasState = {
  villas: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch all villas
export const fetchVillas = createAsyncThunk<Villa[], void, { rejectValue: string }>(
  'villas/fetchVillas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/villas');
      const data: ApiResponse = await response.json();

      if (!data.success || !data.data) {
        return rejectWithValue(data.error || 'Failed to fetch villas');
      }

      return data.data as Villa[];
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  }
);

// Async thunk to update a specific villa
export const updateVilla = createAsyncThunk<
  Villa,
  { villaNo: number; data: Partial<Villa> },
  { rejectValue: string }
>('villas/updateVilla', async ({ villaNo, data }, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/villas/${villaNo}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse = await response.json();

    if (!result.success || !result.data) {
      return rejectWithValue(result.error || 'Failed to update villa');
    }

    return result.data as Villa;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
});

// Create slice
const villasSlice = createSlice({
  name: 'villas',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Update villa locally (optimistic update)
    updateVillaLocally: (state, action: PayloadAction<Villa>) => {
      const index = state.villas.findIndex(
        (villa) => villa.villaNo === action.payload.villaNo
      );
      if (index !== -1) {
        state.villas[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch villas
    builder
      .addCase(fetchVillas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVillas.fulfilled, (state, action) => {
        state.loading = false;
        state.villas = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchVillas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch villas';
      });

    // Update villa
    builder
      .addCase(updateVilla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVilla.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.villas.findIndex(
          (villa) => villa.villaNo === action.payload.villaNo
        );
        if (index !== -1) {
          // Merge the updated data with existing villa data to preserve all fields
          state.villas[index] = {
            ...state.villas[index],
            ...action.payload
          };
        }
      })
      .addCase(updateVilla.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update villa';
      });
  },
});

// Export actions
export const { clearError, updateVillaLocally } = villasSlice.actions;

// Export selectors
export const selectAllVillas = (state: { villas: VillasState }) => state.villas.villas;
export const selectVillasLoading = (state: { villas: VillasState }) => state.villas.loading;
export const selectVillasError = (state: { villas: VillasState }) => state.villas.error;
export const selectVillaByNumber = (villaNo: number) => (state: { villas: VillasState }) =>
  state.villas.villas.find((villa) => villa.villaNo === villaNo);

// Export reducer
export default villasSlice.reducer;
