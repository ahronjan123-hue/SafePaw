import { CountryConfig } from '../types';

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    currencyCode: 'PHP',
    currencySymbol: '₱',
    exchangeRateUSD: 58.0,
    decimalPlaces: 2,
    symbolPosition: 'prefix',
    distanceUnit: 'km',
    weightUnit: 'kg',
    emergencyHotline: '(02) 8999-HELP',
    emergencyHotlineLabel: 'PAWS & St. Francis 24/7 Animal Trauma Hotline',
    defaultCity: 'Metro Manila',
    defaultRegion: 'NCR',
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currencyCode: 'USD',
    currencySymbol: '$',
    exchangeRateUSD: 1.0,
    decimalPlaces: 2,
    symbolPosition: 'prefix',
    distanceUnit: 'mi',
    weightUnit: 'lbs',
    emergencyHotline: '1-800-555-PAWS',
    emergencyHotlineLabel: 'US Vet Emergency & ASPCA Dispatch',
    defaultCity: 'Seattle',
    defaultRegion: 'Washington',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currencyCode: 'GBP',
    currencySymbol: '£',
    exchangeRateUSD: 0.79,
    decimalPlaces: 2,
    symbolPosition: 'prefix',
    distanceUnit: 'mi',
    weightUnit: 'kg',
    emergencyHotline: '0800 555 7297',
    emergencyHotlineLabel: 'UK RSPCA & PDSA Emergency Desk',
    defaultCity: 'London',
    defaultRegion: 'Greater London',
  },
  {
    code: 'DE',
    name: 'Germany (Eurozone)',
    flag: '🇩🇪',
    currencyCode: 'EUR',
    currencySymbol: '€',
    exchangeRateUSD: 0.92,
    decimalPlaces: 2,
    symbolPosition: 'suffix',
    distanceUnit: 'km',
    weightUnit: 'kg',
    emergencyHotline: '0800 112 7387',
    emergencyHotlineLabel: 'Tiernotruf 24/7 Notdienst',
    defaultCity: 'Berlin',
    defaultRegion: 'Berlin',
  },
  {
    code: 'FR',
    name: 'France (Eurozone)',
    flag: '🇫🇷',
    currencyCode: 'EUR',
    currencySymbol: '€',
    exchangeRateUSD: 0.92,
    decimalPlaces: 2,
    symbolPosition: 'suffix',
    distanceUnit: 'km',
    weightUnit: 'kg',
    emergencyHotline: '0800 312 000',
    emergencyHotlineLabel: 'Urgences Vétérinaires SAMU 24/7',
    defaultCity: 'Paris',
    defaultRegion: 'Île-de-France',
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    exchangeRateUSD: 152.0,
    decimalPlaces: 0,
    symbolPosition: 'prefix',
    distanceUnit: 'km',
    weightUnit: 'kg',
    emergencyHotline: '0120-999-729',
    emergencyHotlineLabel: 'Japan Animal Medical Emergency',
    defaultCity: 'Tokyo',
    defaultRegion: 'Kanto',
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    exchangeRateUSD: 1.54,
    decimalPlaces: 2,
    symbolPosition: 'prefix',
    distanceUnit: 'km',
    weightUnit: 'kg',
    emergencyHotline: '1300 729 729',
    emergencyHotlineLabel: 'RSPCA Emergency Care Hotline',
    defaultCity: 'Sydney',
    defaultRegion: 'New South Wales',
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currencyCode: 'CAD',
    currencySymbol: 'C$',
    exchangeRateUSD: 1.38,
    decimalPlaces: 2,
    symbolPosition: 'prefix',
    distanceUnit: 'km',
    weightUnit: 'kg',
    emergencyHotline: '1-800-729-2273',
    emergencyHotlineLabel: 'Canadian Veterinary Medical Emergency',
    defaultCity: 'Vancouver',
    defaultRegion: 'British Columbia',
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    exchangeRateUSD: 1.35,
    decimalPlaces: 2,
    symbolPosition: 'prefix',
    distanceUnit: 'km',
    weightUnit: 'kg',
    emergencyHotline: '+65 6789 7297',
    emergencyHotlineLabel: 'SPCA Singapore 24hr Emergency Rescue',
    defaultCity: 'Singapore',
    defaultRegion: 'Central',
  },
];

export const DEFAULT_COUNTRY: CountryConfig = SUPPORTED_COUNTRIES[0]; // PH Philippines

export function getCountryByCode(code: string): CountryConfig {
  return SUPPORTED_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || DEFAULT_COUNTRY;
}

export function formatCurrencyAmount(
  amountInUSD: number,
  country: CountryConfig,
  customCurrencyCode?: string
): string {
  // If custom currency override is present, find match or use country
  let targetCountry = country;
  if (customCurrencyCode && customCurrencyCode !== country.currencyCode) {
    const match = SUPPORTED_COUNTRIES.find((c) => c.currencyCode === customCurrencyCode);
    if (match) {
      targetCountry = match;
    }
  }

  const converted = amountInUSD * targetCountry.exchangeRateUSD;
  const formattedNumber = converted.toLocaleString(undefined, {
    minimumFractionDigits: targetCountry.decimalPlaces,
    maximumFractionDigits: targetCountry.decimalPlaces,
  });

  if (targetCountry.symbolPosition === 'suffix') {
    return `${formattedNumber} ${targetCountry.currencySymbol}`;
  }
  return `${targetCountry.currencySymbol}${formattedNumber}`;
}
