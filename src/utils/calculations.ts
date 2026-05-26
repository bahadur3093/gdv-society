import { MaintenanceCalculation } from '@/types';

/**
 * Calculate hybrid maintenance cost
 * Formula: Fixed Base + (Plot Size × Per Sq.Ft Rate)
 */
export const calculateHybridMaintenance = (
  plotSize: number,
  fixedBase: number,
  perSqFtRate: number
): number => {
  const variableAmount = plotSize * perSqFtRate;
  return fixedBase + variableAmount;
};

/**
 * Calculate flat rate maintenance cost
 * Formula: Plot Size × Per Sq.Ft Rate
 */
export const calculateFlatRateMaintenance = (
  plotSize: number,
  perSqFtRate: number
): number => {
  return plotSize * perSqFtRate;
};

/**
 * Calculate variable amount based on plot size
 */
export const calculateVariableAmount = (
  plotSize: number,
  perSqFtRate: number
): number => {
  return plotSize * perSqFtRate;
};

/**
 * Get complete maintenance calculation breakdown
 */
export const getMaintenanceBreakdown = (
  plotSize: number,
  fixedBase: number,
  perSqFtRate: number
): MaintenanceCalculation => {
  const variableAmount = calculateVariableAmount(plotSize, perSqFtRate);
  const hybridTotal = calculateHybridMaintenance(plotSize, fixedBase, perSqFtRate);
  const flatRate = calculateFlatRateMaintenance(plotSize, perSqFtRate);

  return {
    fixedBase,
    variableRate: perSqFtRate,
    plotSize,
    hybridTotal,
    flatRate,
  };
};

/**
 * Calculate annual maintenance from monthly amount
 */
export const calculateAnnualMaintenance = (monthlyAmount: number): number => {
  return monthlyAmount * 12;
};

/**
 * Calculate sinking fund allocation
 */
export const calculateSinkingFund = (
  amount: number,
  percentage: number = 20
): number => {
  return (amount * percentage) / 100;
};

/**
 * Calculate core operations allocation
 */
export const calculateCoreOperations = (
  amount: number,
  sinkingFundPercentage: number = 20
): number => {
  return amount - calculateSinkingFund(amount, sinkingFundPercentage);
};
