import { AgeGroup, BudgetConfig } from '../types/gelt';

// ערכי ברירת מחדל לקבוצות גיל
export const DEFAULT_AGE_GROUPS: AgeGroup[] = [
  { id: '1', name: '18-21', minAge: 18, maxAge: 21, amountPerChild: 40, isIncluded: true },
  { id: '2', name: '13-17', minAge: 13, maxAge: 17, amountPerChild: 30, isIncluded: true },
  { id: '3', name: '10-12', minAge: 10, maxAge: 12, amountPerChild: 20, isIncluded: true },
  { id: '4', name: '7-9', minAge: 7, maxAge: 9, amountPerChild: 10, isIncluded: true },
  { id: '5', name: '3-6', minAge: 3, maxAge: 6, amountPerChild: 5, isIncluded: true },
  { id: '6', name: '0-2', minAge: 0, maxAge: 2, amountPerChild: 0, isIncluded: true },
];

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  participants: 10,
  allowedOverflowPercentage: 10,
};
