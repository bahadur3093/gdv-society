import type { SocietySettings } from '@prisma/client';

/**
 * Default total villas count for calculations when database is unavailable
 */
export const DEFAULT_TOTAL_VILLAS = 52;

/**
 * Villa expense calculation result
 */
export interface VillaExpenseCalculation {
  fixedAmount: number;
  variableAmount: number;
  hybridTotal: number;
  flatRate: number;
}

/**
 * Calculate villa expenses based on society settings
 * 
 * @param areaInSqFt - Villa area in square feet
 * @param totalVillas - Total number of villas in society
 * @param settings - Society financial settings from database
 * @returns Calculated expense breakdown
 */
export function calculateVillaExpenses(
  areaInSqFt: number,
  totalVillas: number,
  settings: SocietySettings
): VillaExpenseCalculation {
  // Calculate total common expenses
  const totalCommonExpense =
    settings.securityExpense +
    settings.electricityExpense +
    settings.miscExpense +
    settings.cleaningExpense +
    settings.garbageExpense +
    settings.gymExpense +
    settings.stpMaintenanceExpense +
    settings.emergencyFundExpense;

  // Fixed amount: Total common expense divided equally among all villas
  const fixedAmount = totalCommonExpense / totalVillas;

  // Variable amount: Based on square feet
  const variableAmount = areaInSqFt * settings.perSqFtRate;

  // Hybrid total: Sum of fixed and variable amounts
  const hybridTotal = fixedAmount + variableAmount;

  // Flat rate: Total expenses divided by square feet
  const flatRate = totalCommonExpense / areaInSqFt;

  return { fixedAmount, variableAmount, hybridTotal, flatRate };
}

/**
 * Calculate maintenance cost per square foot from total expenses and total square footage
 * 
 * @param totalExpenses - Sum of all maintenance expenses
 * @param totalSquareFootage - Total square footage of all villas
 * @returns Maintenance cost per square foot
 */
export function calculateMaintenanceCostPerSqFt(
  totalExpenses: number,
  totalSquareFootage: number
): number {
  console.log(totalExpenses, totalSquareFootage);
  if (totalSquareFootage === 0) return 0;
  return totalExpenses / totalSquareFootage;
}

/**
 * Calculate fixed expense per villa
 * 
 * @param fixedExpenses - Total fixed expenses
 * @param totalVillas - Total number of villas
 * @returns Fixed expense per villa
 */
export function calculateFixedExpensePerVilla(
  fixedExpenses: number,
  totalVillas: number
): number {
  if (totalVillas === 0) return 0;
  return fixedExpenses / totalVillas;
}

/**
 * Calculate hybrid maintenance for a villa
 * 
 * @param villaArea - Villa area in square feet
 * @param maintenanceCostPerSqFt - Maintenance cost per square foot
 * @param fixedExpensePerVilla - Fixed expense per villa (optional)
 * @returns Total hybrid maintenance cost
 */
export function calculateHybridMaintenance(
  villaArea: number,
  maintenanceCostPerSqFt: number,
  fixedExpensePerVilla: number = 0
): number {
  const variableAmount = villaArea * maintenanceCostPerSqFt;
  return fixedExpensePerVilla + variableAmount;
}

/**
 * Calculate flat rate maintenance for a villa
 * 
 * @param villaArea - Villa area in square feet
 * @param maintenanceCostPerSqFt - Maintenance cost per square foot
 * @returns Total flat rate maintenance cost
 */
export function calculateFlatRateMaintenance(
  villaArea: number,
  maintenanceCostPerSqFt: number
): number {
  return villaArea * maintenanceCostPerSqFt;
}