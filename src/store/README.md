# Redux Store Documentation

## Overview

This directory contains the Redux Toolkit store configuration for managing application state. The store is configured with two main slices:

1. **Villas Slice** - Manages villa data from `/api/villas`
2. **Society Settings Slice** - Manages society settings from `/api/society-settings`

## Directory Structure

```
src/store/
├── index.ts                    # Store configuration and typed hooks
├── StoreProvider.tsx           # Redux Provider wrapper for Next.js
├── hooks.ts                    # Re-exported typed hooks with usage examples
├── slices/
│   ├── villasSlice.ts         # Villas state management
│   └── societySettingsSlice.ts # Society settings state management
└── README.md                   # This file
```

## Installation

The following dependencies are required:

```bash
npm install @reduxjs/toolkit react-redux
```

## Usage

### 1. Provider Setup

The `StoreProvider` is already integrated into the application's root providers in `src/app/providers.tsx`:

```typescript
import StoreProvider from '@/store/StoreProvider';

export function Providers({ children }: ProvidersProps) {
  return (
    <StoreProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </StoreProvider>
  );
}
```

### 2. Using Typed Hooks

Always use the typed hooks from `@/store/hooks` instead of the default Redux hooks:

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
```

### 3. Fetching Villas Data

```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchVillas, 
  selectAllVillas, 
  selectVillasLoading, 
  selectVillasError 
} from '@/store/slices/villasSlice';

function VillasComponent() {
  const dispatch = useAppDispatch();
  const villas = useAppSelector(selectAllVillas);
  const loading = useAppSelector(selectVillasLoading);
  const error = useAppSelector(selectVillasError);

  useEffect(() => {
    dispatch(fetchVillas());
  }, [dispatch]);

  if (loading) return <div>Loading villas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {villas.map(villa => (
        <div key={villa.villaNo}>
          <h3>Villa #{villa.villaNo}</h3>
          <p>Owner: {villa.ownerName}</p>
          <p>Area: {villa.areaInSqFt} sq ft</p>
          <p>Maintenance: ₹{villa.maintenanceAmount}</p>
        </div>
      ))}
    </div>
  );
}
```

### 4. Fetching Society Settings

```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchSocietySettings, 
  selectSocietySettings, 
  selectSocietySettingsLoading 
} from '@/store/slices/societySettingsSlice';

function SettingsComponent() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSocietySettings);
  const loading = useAppSelector(selectSocietySettingsLoading);

  useEffect(() => {
    dispatch(fetchSocietySettings());
  }, [dispatch]);

  if (loading) return <div>Loading settings...</div>;
  if (!settings) return <div>No settings found</div>;

  return (
    <div>
      <p>Per Sq Ft Rate: ₹{settings.perSqFtRate}</p>
      <p>Sinking Fund: {settings.sinkingFundPercentage}%</p>
      <p>Total Villas: {settings.totalVillas}</p>
    </div>
  );
}
```

### 5. Updating Villa Data

```typescript
import { useAppDispatch } from '@/store/hooks';
import { updateVilla } from '@/store/slices/villasSlice';

function UpdateVillaForm({ villaNo }: { villaNo: number }) {
  const dispatch = useAppDispatch();
  const [ownerName, setOwnerName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(updateVilla({ 
        villaNo, 
        data: { ownerName } 
      })).unwrap();
      
      alert('Villa updated successfully!');
    } catch (error) {
      alert(`Failed to update villa: ${error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={ownerName} 
        onChange={(e) => setOwnerName(e.target.value)} 
        placeholder="Owner Name"
      />
      <button type="submit">Update Villa</button>
    </form>
  );
}
```

### 6. Updating Society Settings

```typescript
import { useAppDispatch } from '@/store/hooks';
import { updateSocietySettings } from '@/store/slices/societySettingsSlice';

function UpdateSettingsForm() {
  const dispatch = useAppDispatch();
  const [perSqFtRate, setPerSqFtRate] = useState(2.15);
  const [sinkingFundPercentage, setSinkingFundPercentage] = useState(20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(updateSocietySettings({ 
        perSqFtRate, 
        sinkingFundPercentage 
      })).unwrap();
      
      alert('Settings updated successfully!');
    } catch (error) {
      alert(`Failed to update settings: ${error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="number" 
        step="0.01"
        value={perSqFtRate} 
        onChange={(e) => setPerSqFtRate(parseFloat(e.target.value))} 
      />
      <input 
        type="number" 
        value={sinkingFundPercentage} 
        onChange={(e) => setSinkingFundPercentage(parseInt(e.target.value))} 
      />
      <button type="submit">Update Settings</button>
    </form>
  );
}
```

## Available Actions

### Villas Slice

- `fetchVillas()` - Fetch all villas from API
- `updateVilla({ villaNo, data })` - Update a specific villa
- `clearError()` - Clear error state
- `updateVillaLocally(villa)` - Optimistic local update

### Society Settings Slice

- `fetchSocietySettings()` - Fetch society settings from API
- `updateSocietySettings(settings)` - Update society settings
- `clearError()` - Clear error state
- `updateSettingsLocally(settings)` - Optimistic local update

## Available Selectors

### Villas Selectors

- `selectAllVillas(state)` - Get all villas array
- `selectVillasLoading(state)` - Get loading state
- `selectVillasError(state)` - Get error message
- `selectVillaByNumber(villaNo)(state)` - Get specific villa by number

### Society Settings Selectors

- `selectSocietySettings(state)` - Get society settings object
- `selectSocietySettingsLoading(state)` - Get loading state
- `selectSocietySettingsError(state)` - Get error message

## State Structure

### Villas State

```typescript
{
  villas: Villa[],
  loading: boolean,
  error: string | null,
  lastFetched: number | null
}
```

### Society Settings State

```typescript
{
  settings: SocietySettings | null,
  loading: boolean,
  error: string | null,
  lastFetched: number | null
}
```

## Best Practices

1. **Always use typed hooks** - Use `useAppDispatch` and `useAppSelector` instead of the default Redux hooks
2. **Handle loading states** - Always check the loading state before rendering data
3. **Handle errors** - Display error messages to users when API calls fail
4. **Optimistic updates** - Use local update actions for immediate UI feedback before API confirmation
5. **Avoid unnecessary fetches** - Check `lastFetched` timestamp to implement caching logic
6. **Use unwrap()** - When dispatching async thunks, use `.unwrap()` to handle success/error in try/catch blocks

## TypeScript Support

All slices, actions, and selectors are fully typed. The store configuration automatically infers types:

- `RootState` - Complete state tree type
- `AppDispatch` - Typed dispatch function
- Typed hooks ensure compile-time type safety

## Next.js Integration

The store is configured for Next.js App Router with:

- Client-side only provider (`"use client"` directive)
- Proper serialization checks for async actions
- Integration with existing SessionProvider for authentication

## Performance Considerations

- Redux Toolkit uses Immer for immutable updates
- Selectors are memoized by default
- Middleware is configured with serialization checks
- Consider using `createSelector` from `reselect` for complex derived state

## Future Enhancements

Potential improvements:

1. Add RTK Query for advanced caching and data fetching
2. Implement persistence with `redux-persist`
3. Add middleware for logging in development
4. Create custom selectors with `createSelector` for computed values
5. Add optimistic update rollback on API failure
