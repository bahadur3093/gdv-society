/**
 * Redux Store Hooks
 * 
 * Re-export typed hooks for use throughout the application.
 * These hooks provide type safety when accessing Redux state and dispatch.
 */

export { useAppDispatch, useAppSelector } from './index';

/**
 * Usage Examples:
 * 
 * 1. Fetching villas data:
 * ```typescript
 * import { useAppDispatch, useAppSelector } from '@/store/hooks';
 * import { fetchVillas, selectAllVillas, selectVillasLoading } from '@/store/slices/villasSlice';
 * 
 * function VillasComponent() {
 *   const dispatch = useAppDispatch();
 *   const villas = useAppSelector(selectAllVillas);
 *   const loading = useAppSelector(selectVillasLoading);
 * 
 *   useEffect(() => {
 *     dispatch(fetchVillas());
 *   }, [dispatch]);
 * 
 *   return (
 *     <div>
 *       {loading ? 'Loading...' : villas.map(villa => <div key={villa.villaNo}>{villa.ownerName}</div>)}
 *     </div>
 *   );
 * }
 * ```
 * 
 * 2. Fetching society settings:
 * ```typescript
 * import { useAppDispatch, useAppSelector } from '@/store/hooks';
 * import { fetchSocietySettings, selectSocietySettings } from '@/store/slices/societySettingsSlice';
 * 
 * function SettingsComponent() {
 *   const dispatch = useAppDispatch();
 *   const settings = useAppSelector(selectSocietySettings);
 * 
 *   useEffect(() => {
 *     dispatch(fetchSocietySettings());
 *   }, [dispatch]);
 * 
 *   return (
 *     <div>
 *       <p>Per Sq Ft Rate: {settings?.perSqFtRate}</p>
 *       <p>Sinking Fund: {settings?.sinkingFundPercentage}%</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * 3. Updating villa data:
 * ```typescript
 * import { useAppDispatch } from '@/store/hooks';
 * import { updateVilla } from '@/store/slices/villasSlice';
 * 
 * function UpdateVillaComponent() {
 *   const dispatch = useAppDispatch();
 * 
 *   const handleUpdate = async () => {
 *     await dispatch(updateVilla({ 
 *       villaNo: 1, 
 *       data: { ownerName: 'New Owner' } 
 *     }));
 *   };
 * 
 *   return <button onClick={handleUpdate}>Update Villa</button>;
 * }
 * ```
 */
