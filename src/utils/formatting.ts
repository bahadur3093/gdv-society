/**
 * Format number as Indian Rupees with proper formatting
 * @param amount - The amount to format
 * @param showSymbol - Whether to include the ₹ symbol
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Format area in square feet with proper formatting
 * @param area - The area to format
 * @returns Formatted area string with Sq.ft suffix
 */
export const formatArea = (area: number): string => {
  return `${area.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Sq.ft`;
};

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
