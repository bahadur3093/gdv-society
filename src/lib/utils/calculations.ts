/**
 * Default total number of villas in the society
 */
export const DEFAULT_TOTAL_VILLAS = 100;

/**
 * Calculate villa maintenance expenses based on area and per sq ft rate
 * @param areaInSqFt - Area in square feet
 * @param perSqFtRate - Rate per square foot
 * @returns Calculated expenses
 */
export function calculateVillaExpenses(
  areaInSqFt: number,
  perSqFtRate: number,
) {
  // Calculate base maintenance amount
  const maintenanceAmount = perSqFtRate * areaInSqFt;

  return {
    maintenanceAmount,
    perSqFtRate,
  };
}
