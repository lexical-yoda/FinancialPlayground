import type { AssetCategory } from '../types/plan';

export const categoryColors: Record<AssetCategory, string> = {
  equity: '#2dd4bf', // teal
  gold: '#f5a524', // amber
  fd: '#5b8dbe', // steel blue
  cash: '#9aa5b1', // grey
  bond: '#8fae7c', // sage
  crypto: '#a78bfa', // violet
  real_estate: '#c97b5f', // clay
  other: '#7d8590', // neutral
};

export const liabilityColor = '#e0555a';
export const netWorthLineColor = '#f4f7fb';
