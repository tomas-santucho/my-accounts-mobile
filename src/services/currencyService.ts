import { getBlue, getOfficial } from 'argentina-finances-js';

export type Currency = 'ars' | 'usd';
export type RateType = 'blue' | 'official';

export interface ExchangeRate {
    value_avg: number;
    value_sell: number;
    value_buy: number;
}

export interface ExchangeRates {
    blue: ExchangeRate;
    official: ExchangeRate;
    lastUpdated: Date;
}

let cachedRates: ExchangeRates | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches current exchange rates from Bluelytics API
 * Uses built-in caching from argentina-finances-js (5 minutes)
 */
export async function getExchangeRates(options?: { useCache?: boolean }): Promise<ExchangeRates> {
    const now = Date.now();
    const shouldUseCache = options?.useCache !== false;

    // Use our own cache layer on top of library cache
    if (shouldUseCache && cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
        return cachedRates;
    }

    try {
        const [blue, official] = await Promise.all([
            getBlue({ useCache: shouldUseCache }),
            getOfficial({ useCache: shouldUseCache })
        ]);

        cachedRates = {
            blue,
            official,
            lastUpdated: new Date()
        };
        lastFetchTime = now;

        return cachedRates;
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);

        // Return cached rates if available, even if stale
        if (cachedRates) {
            console.warn('Using stale exchange rates due to fetch error');
            return cachedRates;
        }

        // Fallback to default rates if no cache available
        throw new Error('Unable to fetch exchange rates and no cached data available');
    }
}

/**
 * Converts USD to ARS using the specified rate type
 */
export async function convertToARS(
    usdAmount: number,
    rateType: RateType = 'blue'
): Promise<number> {
    const rates = await getExchangeRates();
    const rate = rateType === 'blue' ? rates.blue.value_avg : rates.official.value_avg;
    return usdAmount * rate;
}

/**
 * Converts ARS to USD using the specified rate type
 */
export async function convertToUSD(
    arsAmount: number,
    rateType: RateType = 'blue'
): Promise<number> {
    const rates = await getExchangeRates();
    const rate = rateType === 'blue' ? rates.blue.value_avg : rates.official.value_avg;
    return arsAmount / rate;
}

/**
 * Generic conversion function between currencies
 */
export async function convertAmount(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    rateType: RateType = 'blue'
): Promise<number> {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    if (fromCurrency === 'usd' && toCurrency === 'ars') {
        return convertToARS(amount, rateType);
    }

    if (fromCurrency === 'ars' && toCurrency === 'usd') {
        return convertToUSD(amount, rateType);
    }

    return amount;
}

/**
 * Formats an amount with currency symbol
 */
export function formatCurrency(amount: number, currency: Currency): string {
    if (currency === 'usd') {
        return `$${amount.toFixed(2)}`;
    }
    return `ARS ${amount.toFixed(2)}`;
}

/**
 * Gets display amount for a transaction in the preferred currency
 */
export async function getDisplayAmount(
    amount: number,
    originalCurrency: Currency,
    displayCurrency: Currency,
    rateType: RateType = 'blue'
): Promise<{ amount: number; formatted: string }> {
    const convertedAmount = await convertAmount(
        amount,
        originalCurrency,
        displayCurrency,
        rateType
    );

    return {
        amount: convertedAmount,
        formatted: formatCurrency(convertedAmount, displayCurrency)
    };
}

/**
 * Clears the exchange rate cache (useful for manual refresh)
 */
export function clearRateCache(): void {
    cachedRates = null;
    lastFetchTime = 0;
}
