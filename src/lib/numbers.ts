/**
 * Checks if a number is even.
 * @param num - The number to check.
 * @returns `true` if the number is even, `false` otherwise.
 */
export function isEven(num: number): boolean {
  return num % 2 === 0;
}

/**
 * Add commas to number
 * @param number - The number to check.
 *  @param caseType - The display area.
 * @returns commas separated number or empty string based on the caseTye
 */
export const addCommasToNumber = (number: number, caseType = 'DISPLAY') => {
  if (number == 0 && caseType == 'DISPLAY') {
    return number;
  } else if (number == 0 && caseType == 'INPUT') {
    return '';
  }

  return (
    Boolean(number) &&
    parseFloat(number.toString()).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  );
};

/**
 * Shorten FIGURES
 * @param number - The number to check.
 *  @param caseType - The display area.
 * @returns shortened number based on zero figures :)
 */
export const shortenNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 10000) {
    return (number / 10000).toFixed(1) + 'k';
  } else {
    return number.toString();
  }
};

/**
 * Format a number with a short symbol representing its magnitude (e.g., k, M, G).
 * For example, shortenNumberWithReadableSymbols(1500, 1) returns "1.5k".
 * @param numberToFormat - The number to be formatted.
 * @param decimalDigits - The number of decimal digits to display.
 * @param controlLimit - The lowest number at which shortening should begin.
 * @returns A formatted string representation of the number with magnitude symbol.
 */
export const shortenNumberWithReadableSymbols = (
  numberToFormat: number,
  decimalDigits: number,
  controlLimit = 1e3
): string => {
  if (numberToFormat < controlLimit) {
    return String(numberToFormat);
  }

  // Magnitude symbol lookup table
  const magnitudeSymbols: { value: number; symbol: string }[] = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'E15' },
    { value: 1e18, symbol: 'E18' },
  ];

  // Regular expression to clean up unnecessary decimals
  const decimalCleanupRegex = /\.0+$|(\.[0-9]*[1-9])0+$/;

  // Find the appropriate magnitude symbol based on the number
  const selectedMagnitude = magnitudeSymbols
    .slice()
    .reverse()
    .find(magnitude => numberToFormat >= magnitude.value);

  // Format the number with magnitude symbol or default to "0"
  return selectedMagnitude
    ? (numberToFormat / selectedMagnitude.value)
      .toFixed(decimalDigits)
      .replace(decimalCleanupRegex, '$1') + selectedMagnitude.symbol
    : '0';
};

export const formatAmountRange = (amountRange: string): string => {
  // Split the amount range string into two separate amounts
  const [amount1Str, amount2Str] = amountRange.split(' - ');

  // Convert the amount strings to numbers
  const amount1 = parseInt(amount1Str, 10);
  const amount2 = parseInt(amount2Str, 10);

  // Format each amount with commas
  const formattedAmount1 = amount1.toLocaleString();
  const formattedAmount2 = amount2.toLocaleString();

  // Return the formatted amount range string
  return ` ${formattedAmount1} - ${formattedAmount2}`;
};


export function removeSpecialCharacters(input: string): string {
  return input.replace(/[,*-+=@#?]/g, '')
}

// export function formatCurrency(amount: number, currency: 'NGN' | 'USD' = 'NGN'): string {
//   const locale = currency === 'NGN' ? 'en-NG' : 'en-US';
//   return new Intl.NumberFormat(locale, {
//     style: 'currency',
//     currency: currency,
//     minimumFractionDigits: 2,
//   }).format(amount);
// }

const locales = {
  'NGN': 'en-NG',
  'USD': 'en-US',
  'GBP': 'en-GB',
  'EUR': 'en-EU',
}

export function formatCurrency(amount: number | string, currency: 'NGN' | 'USD' | 'GBP' | 'EUR' = 'NGN'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(numericAmount)) {
    return 'N/A';  
  }
  const locale = locales[currency] || 'NGN';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(numericAmount);
}