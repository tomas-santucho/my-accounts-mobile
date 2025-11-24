import AsyncStorage from '@react-native-async-storage/async-storage';
import { Currency, RateType } from '../services/currencyService';

const DISPLAY_CURRENCY_KEY = '@currency_display_preference';
const RATE_TYPE_KEY = '@currency_rate_type_preference';

export interface CurrencyPreferences {
    displayCurrency: Currency;
    rateType: RateType;
}

const DEFAULT_PREFERENCES: CurrencyPreferences = {
    displayCurrency: 'usd',
    rateType: 'blue'
};

/**
 * Gets the user's currency preferences
 */
export async function getCurrencyPreferences(): Promise<CurrencyPreferences> {
    try {
        const [displayCurrency, rateType] = await Promise.all([
            AsyncStorage.getItem(DISPLAY_CURRENCY_KEY),
            AsyncStorage.getItem(RATE_TYPE_KEY)
        ]);

        return {
            displayCurrency: (displayCurrency as Currency) || DEFAULT_PREFERENCES.displayCurrency,
            rateType: (rateType as RateType) || DEFAULT_PREFERENCES.rateType
        };
    } catch (error) {
        console.error('Failed to load currency preferences:', error);
        return DEFAULT_PREFERENCES;
    }
}

/**
 * Sets the display currency preference
 */
export async function setDisplayCurrency(currency: Currency): Promise<void> {
    try {
        await AsyncStorage.setItem(DISPLAY_CURRENCY_KEY, currency);
    } catch (error) {
        console.error('Failed to save display currency:', error);
        throw error;
    }
}

/**
 * Sets the rate type preference
 */
export async function setRateType(rateType: RateType): Promise<void> {
    try {
        await AsyncStorage.setItem(RATE_TYPE_KEY, rateType);
    } catch (error) {
        console.error('Failed to save rate type:', error);
        throw error;
    }
}

/**
 * Sets all currency preferences at once
 */
export async function setCurrencyPreferences(preferences: CurrencyPreferences): Promise<void> {
    try {
        await Promise.all([
            AsyncStorage.setItem(DISPLAY_CURRENCY_KEY, preferences.displayCurrency),
            AsyncStorage.setItem(RATE_TYPE_KEY, preferences.rateType)
        ]);
    } catch (error) {
        console.error('Failed to save currency preferences:', error);
        throw error;
    }
}
