export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  originalAge?: number; // Store the original age when changing age manually
}

export interface AgeGroup {
  id: string;
  name: string;           // For example "18-21"
  minAge: number;         // Minimum age (inclusive)
  maxAge: number;         // Maximum age (inclusive)
  amountPerChild: number;  // Amount per child in the group
  isIncluded: boolean;    // Whether the group is included in the calculation
}

export interface BudgetConfig {
  participants: number;              // Number of participants
  allowedOverflowPercentage: number; // Allowed overflow percentage (e.g., 10%)
  customBudget?: number;              // Custom budget (optional)
}

export interface BudgetCalculation {
  totalRequired: number;          // Total budget required
  amountPerParticipant: number;    // Amount per participant (rounded up)
  maxAllowed: number;              // Maximum allowed budget (including overflow)
  groupTotals: Record<string, {    // Summary for each age group
    childrenCount: number;          // Number of children in the group
    total: number;                 // Total amount for the group
    calculatedAmountPerChild?: number; // Calculated amount per child (in case of custom budget)
  }>;
  isCustomBudget?: boolean;        // Whether using custom budget
}

export interface GeltState {
  children: Child[];                    // List of all children
  ageGroups: AgeGroup[];                // Age groups
  budgetConfig: BudgetConfig;           // Budget settings
  calculation: BudgetCalculation;       // Calculation results
  customGroupSettings: AgeGroup[] | null; // Custom settings (for saving)
  includedChildren: string[];           // Array of IDs of children included in calculation (in Firestore)
}

export interface ExportData {
  budget: {
    total: number;
    perParticipant: number;
    participants: number;
    allowedOverflow: number;
  };
  ageGroups: (AgeGroup & {
    childCount: number;
    total: number;
  })[];
  children: {
    name: string;
    age: number;
    ageModified: boolean;
    originalAge?: number;
  }[];
}

// Budget profile - age groups and budget settings
export interface GeltTemplate {
  id: string;
  tenant_id: string;
  name: string;                    // Profile name
  description?: string;             // Description (optional)
  ageGroups: AgeGroup[];           // Age groups
  budgetConfig: BudgetConfig;      // Budget settings
  customGroupSettings: AgeGroup[] | null; // Custom settings (if custom budget exists)
  currency?: 'ILS' | 'USD' | 'EUR'; // Template currency (for documentation only)
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_default?: boolean;            // Whether this is the default profile
}
