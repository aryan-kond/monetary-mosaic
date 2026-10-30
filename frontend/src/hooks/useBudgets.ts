import { useState } from 'react';
import {
  defaultCategoryLimits,
  defaultMonthlyBudget,
  type BudgetCategoryId,
} from '../data/budgets';

/** The monthly budget and per-category limits, kept in memory like the rest of the prototype. */
export function useBudgets() {
  const [monthlyBudget, setMonthlyBudget] = useState(defaultMonthlyBudget);
  const [categoryLimits, setCategoryLimits] = useState(defaultCategoryLimits);

  /** Pass null to remove a category's limit. */
  const setCategoryLimit = (categoryId: BudgetCategoryId, limit: number | null) => {
    setCategoryLimits((current) => {
      const next = { ...current };
      if (limit === null) delete next[categoryId];
      else next[categoryId] = limit;
      return next;
    });
  };

  return { monthlyBudget, setMonthlyBudget, categoryLimits, setCategoryLimit };
}
