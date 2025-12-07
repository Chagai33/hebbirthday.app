import { Child, AgeGroup, BudgetConfig, BudgetCalculation } from '../types/gelt';

// חישוב התקציב המרכזי
export function calculateBudget(
  ageGroups: AgeGroup[],
  children: Child[],
  includedChildren: Set<string>,
  budgetConfig: BudgetConfig,
  customGroupSettings?: AgeGroup[] | null
): BudgetCalculation {
  const groupTotals: Record<string, { childrenCount: number; total: number; calculatedAmountPerChild?: number }> = {};
  let totalRequired = 0;

  // אם יש תקציב מותאם אישית, נחלק אותו לפי אחוזים
  if (budgetConfig.customBudget && budgetConfig.customBudget > 0) {
    // customGroupSettings נשלח מהקומפוננטה - זה הערכים המקוריים
    return calculateBudgetWithCustomAmount(
      ageGroups,
      children,
      includedChildren,
      budgetConfig,
      customGroupSettings
    );
  }

  // חישוב רגיל - לפי סכום לכל ילד
  ageGroups.forEach((group) => {
    if (group.isIncluded) {
      const groupChildren = children.filter(
        (child) =>
          includedChildren.has(child.id) &&
          child.age >= group.minAge &&
          child.age <= group.maxAge
      );

      const groupTotal = group.amountPerChild * groupChildren.length;

      groupTotals[group.id] = {
        childrenCount: groupChildren.length,
        total: groupTotal,
      };

      totalRequired += groupTotal;
    }
  });

  // חישוב הסכום לכל משתתף (מעוגל למעלה)
  const amountPerParticipant =
    budgetConfig.participants > 0
      ? Math.ceil(totalRequired / budgetConfig.participants)
      : 0;

  // חישוב התקציב המקסימלי המותר (כולל חריגה)
  const maxAllowed =
    totalRequired * (1 + budgetConfig.allowedOverflowPercentage / 100);

  return {
    totalRequired,
    amountPerParticipant,
    maxAllowed,
    groupTotals,
    isCustomBudget: false,
  };
}

// חישוב תקציב מותאם אישית - חלוקה לפי אחוזים
// הלוגיקה: אם משנים סכום בקבוצה אחת, ההפרש יחולק בין הקבוצות האחרות לפי היחס המקורי
// customGroupSettings מכיל את הערכים המקוריים של amountPerChild כשהתקציב המותאם הוגדר
function calculateBudgetWithCustomAmount(
  ageGroups: AgeGroup[],
  children: Child[],
  includedChildren: Set<string>,
  budgetConfig: BudgetConfig,
  customGroupSettings?: AgeGroup[] | null
): BudgetCalculation {
  const groupTotals: Record<string, { childrenCount: number; total: number; calculatedAmountPerChild?: number }> = {};
  const customBudget = budgetConfig.customBudget || 0;

  // שלב 1: חישוב התקציב המקורי והאחוזים היחסיים
  // התקציב המקורי = סכום לכל ילד * מספר ילדים בכל קבוצה
  // אם יש customGroupSettings, נשתמש בו כדי לדעת מה היה הערך המקורי
  let totalOriginalBudget = 0;
  const groupOriginalTotals: Record<string, number> = {};
  const groupChildrenCounts: Record<string, number> = {};
  const groupCurrentTotals: Record<string, number> = {}; // התקציב הנוכחי של כל קבוצה
  const groupOriginalAmountPerChild: Record<string, number> = {}; // הערך המקורי של amountPerChild

  // בניית מפה של customGroupSettings אם קיים
  const customGroupMap = new Map<string, AgeGroup>();
  if (customGroupSettings) {
    customGroupSettings.forEach((group) => {
      customGroupMap.set(group.id, group);
    });
  }

  // חישוב התקציב המקורי
  // אם יש customGroupSettings, נשתמש בו. אחרת, נשתמש ב-amountPerChild הנוכחי
  ageGroups.forEach((group) => {
    if (group.isIncluded) {
      const groupChildren = children.filter(
        (child) =>
          includedChildren.has(child.id) &&
          child.age >= group.minAge &&
          child.age <= group.maxAge
      );

      const childrenCount = groupChildren.length;
      
      // קביעת הערך המקורי: אם יש ב-customGroupSettings, נשתמש בו. אחרת, נשתמש בערך הנוכחי
      const originalAmountPerChild = customGroupMap.get(group.id)?.amountPerChild ?? group.amountPerChild;
      groupOriginalAmountPerChild[group.id] = originalAmountPerChild;
      
      const groupTotal = originalAmountPerChild * childrenCount;
      const currentTotal = group.amountPerChild * childrenCount;
      
      totalOriginalBudget += groupTotal;
      groupOriginalTotals[group.id] = groupTotal;
      groupChildrenCounts[group.id] = childrenCount;
      groupCurrentTotals[group.id] = currentTotal;
    }
  });

  // שלב 2: זיהוי שינויים ידניים בקבוצות
  // אם amountPerChild שונה מהערך המקורי (שמור ב-customGroupSettings או מהחישוב המקורי), זה שינוי ידני
  const manuallyAdjustedGroups: Set<string> = new Set();
  
  ageGroups.forEach((group) => {
    if (group.isIncluded && groupChildrenCounts[group.id] > 0) {
      const childrenCount = groupChildrenCounts[group.id];
      const currentTotal = group.amountPerChild * childrenCount;
      groupCurrentTotals[group.id] = currentTotal;
      
      // אם הסכום הנוכחי שונה מהמקורי, זה שינוי ידני
      // נבדוק גם את amountPerChild וגם את הסכום הכולל
      const originalAmount = groupOriginalAmountPerChild[group.id];
      if (Math.abs(group.amountPerChild - originalAmount) > 0.01) {
        manuallyAdjustedGroups.add(group.id);
      }
    }
  });

  // שלב 3: חלוקת התקציב המותאם
  let distributedTotal = 0;
  const distributedAmounts: Record<string, number> = {};

  if (totalOriginalBudget === 0) {
    // אם אין תקציב מקורי, נחלק שווה בין כל הקבוצות
    const activeGroupsCount = Object.keys(groupChildrenCounts).length;
    const equalShare = activeGroupsCount > 0 ? roundToFive(customBudget / activeGroupsCount) : 0;
    
    ageGroups.forEach((group) => {
      if (group.isIncluded && groupChildrenCounts[group.id] > 0) {
        distributedAmounts[group.id] = equalShare;
        distributedTotal += equalShare;
      } else {
        distributedAmounts[group.id] = 0;
      }
    });
  } else if (manuallyAdjustedGroups.size > 0) {
    // יש שינויים ידניים - נחלק את ההפרש בין הקבוצות האחרות
    // שלב 1: חישוב התקציב של הקבוצות ששונו ידנית
    let manualAdjustmentsTotal = 0;
    let otherGroupsOriginalTotalSum = 0;

    ageGroups.forEach((group) => {
      if (group.isIncluded && groupChildrenCounts[group.id] > 0) {
        if (manuallyAdjustedGroups.has(group.id)) {
          // קבוצה ששונתה ידנית - משתמשים בערך הנוכחי (מעוגל ל-5)
          const currentTotal = groupCurrentTotals[group.id];
          const roundedTotal = roundToFive(currentTotal);
          distributedAmounts[group.id] = roundedTotal;
          manualAdjustmentsTotal += roundedTotal;
        } else {
          // קבוצה שלא שונתה - נשמור את הערך המקורי לחישוב אחוזים
          otherGroupsOriginalTotalSum += groupOriginalTotals[group.id];
        }
      }
    });

    // שלב 2: חישוב התקציב שנותר לחלוקה בין הקבוצות האחרות
    const remainingBudget = customBudget - manualAdjustmentsTotal;
    
    // שלב 3: חלוקת התקציב הנותר בין הקבוצות האחרות לפי היחס המקורי
    if (otherGroupsOriginalTotalSum > 0 && remainingBudget > 0) {
      ageGroups.forEach((group) => {
        if (group.isIncluded && 
            groupChildrenCounts[group.id] > 0 && 
            !manuallyAdjustedGroups.has(group.id)) {
          // חישוב אחוז מהתקציב המקורי של הקבוצות שלא שונו
          const percentage = (groupOriginalTotals[group.id] / otherGroupsOriginalTotalSum) * 100;
          
          // חישוב הסכום מהתקציב הנותר לפי האחוז
          const groupAmount = (remainingBudget * percentage) / 100;
          
          // עיגול ל-5 הקרוב ביותר
          const roundedAmount = roundToFive(groupAmount);
          
          distributedAmounts[group.id] = roundedAmount;
        }
      });

      // שלב 4: תיקון הפרש עיגולים - חלוקה חכמה של ההפרש
      const currentDistributedTotal = Object.values(distributedAmounts).reduce((sum, val) => sum + val, 0);
      const difference = customBudget - currentDistributedTotal;
      
      if (Math.abs(difference) >= 5) {
        // רשימת הקבוצות שלא שונו ידנית (לחלוקת ההפרש)
        const availableGroups: Array<{ id: string; amount: number; originalTotal: number }> = [];
        
        ageGroups.forEach((group) => {
          if (group.isIncluded && 
              groupChildrenCounts[group.id] > 0 && 
              !manuallyAdjustedGroups.has(group.id)) {
            availableGroups.push({
              id: group.id,
              amount: distributedAmounts[group.id] || 0,
              originalTotal: groupOriginalTotals[group.id],
            });
          }
        });

        if (availableGroups.length > 0) {
          distributeRemainder(availableGroups, difference, distributedAmounts, customBudget);
        }
      }
    } else if (remainingBudget > 0) {
      // אם אין קבוצות אחרות, נחלק שווה בין הקבוצות שלא שונו
      const otherGroupsCount = ageGroups.filter(
        g => g.isIncluded && 
             groupChildrenCounts[g.id] > 0 && 
             !manuallyAdjustedGroups.has(g.id)
      ).length;
      
      if (otherGroupsCount > 0) {
        const equalShare = roundToFive(remainingBudget / otherGroupsCount);
        ageGroups.forEach((group) => {
          if (group.isIncluded && 
              groupChildrenCounts[group.id] > 0 && 
              !manuallyAdjustedGroups.has(group.id)) {
            distributedAmounts[group.id] = equalShare;
          }
        });
      }
    }
    
    distributedTotal = Object.values(distributedAmounts).reduce((sum, val) => sum + val, 0);
  } else {
    // חלוקה רגילה לפי אחוזים יחסיים
    ageGroups.forEach((group) => {
      if (group.isIncluded && groupChildrenCounts[group.id] > 0) {
        // חישוב אחוז מהתקציב המקורי
        const percentage = (groupOriginalTotals[group.id] / totalOriginalBudget) * 100;
        
        // חישוב הסכום מהתקציב המותאם לפי האחוז
        const groupAmount = (customBudget * percentage) / 100;
        
        // עיגול ל-5 הקרוב ביותר
        const roundedAmount = roundToFive(groupAmount);
        
        distributedAmounts[group.id] = roundedAmount;
        distributedTotal += roundedAmount;
      } else {
        distributedAmounts[group.id] = 0;
      }
    });
  }

  // שלב 4: תיקון הפרש עיגולים - חלוקה חכמה של ההפרש
  const difference = customBudget - distributedTotal;
  if (Math.abs(difference) >= 5) {
    // רשימת כל הקבוצות (לחלוקת ההפרש)
    const availableGroups: Array<{ id: string; amount: number; originalTotal: number }> = [];
    
    ageGroups.forEach((group) => {
      if (group.isIncluded && groupChildrenCounts[group.id] > 0) {
        availableGroups.push({
          id: group.id,
          amount: distributedAmounts[group.id] || 0,
          originalTotal: groupOriginalTotals[group.id],
        });
      }
    });

    if (availableGroups.length > 0) {
      distributeRemainder(availableGroups, difference, distributedAmounts, customBudget);
      // עדכון distributedTotal לאחר החלוקה
      distributedTotal = Object.values(distributedAmounts).reduce((sum, val) => sum + val, 0);
    }
  }

  // שלב 5: חישוב סכום לכל ילד בקבוצה (מעוגל ל-5)
  ageGroups.forEach((group) => {
    if (group.isIncluded) {
      const groupChildren = children.filter(
        (child) =>
          includedChildren.has(child.id) &&
          child.age >= group.minAge &&
          child.age <= group.maxAge
      );

      const childrenCount = groupChildren.length;
      const groupTotal = distributedAmounts[group.id] || 0;
      
      // חישוב סכום לכל ילד (מעוגל ל-5)
      const calculatedAmountPerChild = childrenCount > 0 
        ? roundToFive(groupTotal / childrenCount)
        : 0;

      groupTotals[group.id] = {
        childrenCount,
        total: groupTotal,
        calculatedAmountPerChild,
      };
    }
  });

  // חישוב הסכום לכל משתתף
  const amountPerParticipant =
    budgetConfig.participants > 0
      ? Math.ceil(customBudget / budgetConfig.participants)
      : 0;

  // התקציב המקסימלי המותר
  const maxAllowed =
    customBudget * (1 + budgetConfig.allowedOverflowPercentage / 100);

  return {
    totalRequired: customBudget,
    amountPerParticipant,
    maxAllowed,
    groupTotals,
    isCustomBudget: true,
  };
}

// חלוקה חכמה של הפרש עיגולים
// מחלקת את ההפרש בין הקבוצות לפי היחס המקורי, תוך התחשבות בעיגול ל-5
// אם ההפרש קטן מדי או לא ניתן לחלק, מוסיפה אותו לקבוצה הגדולה ביותר
function distributeRemainder(
  availableGroups: Array<{ id: string; amount: number; originalTotal: number }>,
  remainder: number,
  distributedAmounts: Record<string, number>,
  customBudget: number
): void {
  if (availableGroups.length === 0 || Math.abs(remainder) < 5) {
    return;
  }

  const absRemainder = Math.abs(remainder);
  const sign = remainder > 0 ? 1 : -1;
  
  // אם יש רק קבוצה אחת, נוסיף לה את כל ההפרש
  if (availableGroups.length === 1) {
    const adjustment = roundToFive(remainder);
    distributedAmounts[availableGroups[0].id] = roundToFive(
      distributedAmounts[availableGroups[0].id] + adjustment
    );
    return;
  }

  // חישוב סכום כולל של הקבוצות הזמינות (לחישוב אחוזים)
  const totalOriginal = availableGroups.reduce((sum, g) => sum + g.originalTotal, 0);
  
  if (totalOriginal === 0) {
    // אם אין תקציב מקורי, נחלק שווה (בכפולות של 5)
    const groupsCount = availableGroups.length;
    const multiplesOfFive = Math.floor(absRemainder / 5);
    
    if (multiplesOfFive === 0) {
      // אם ההפרש קטן מ-5, לא ניתן לחלק - נוסיף לקבוצה הגדולה ביותר
      const maxGroup = availableGroups.reduce((max, g) => 
        (distributedAmounts[g.id] || 0) > (distributedAmounts[max.id] || 0) ? g : max
      );
      const adjustment = roundToFive(remainder);
      distributedAmounts[maxGroup.id] = roundToFive(
        distributedAmounts[maxGroup.id] + adjustment
      );
      return;
    }
    
    // חלוקה שווה בכפולות של 5
    const sharePerGroup = Math.floor(multiplesOfFive / groupsCount);
    const roundedShare = sharePerGroup * 5;
    
    if (roundedShare >= 5) {
      // אם כל קבוצה יכולה לקבל לפחות 5, נחלק
      availableGroups.forEach((group) => {
        distributedAmounts[group.id] = roundToFive(
          distributedAmounts[group.id] + (roundedShare * sign)
        );
      });
      
      // אם נשאר עודף, נוסיף אותו לקבוצה הגדולה ביותר
      const distributed = roundedShare * groupsCount * sign;
      const remaining = remainder - distributed;
      if (Math.abs(remaining) >= 5) {
        const maxGroup = availableGroups.reduce((max, g) => 
          (distributedAmounts[g.id] || 0) > (distributedAmounts[max.id] || 0) ? g : max
        );
        const adjustment = roundToFive(remaining);
        distributedAmounts[maxGroup.id] = roundToFive(
          distributedAmounts[maxGroup.id] + adjustment
        );
      }
    } else {
      // אם לא ניתן לחלק (כל קבוצה צריכה לפחות 5), נוסיף את כל ההפרש לקבוצה הגדולה ביותר
      const maxGroup = availableGroups.reduce((max, g) => 
        (distributedAmounts[g.id] || 0) > (distributedAmounts[max.id] || 0) ? g : max
      );
      const adjustment = roundToFive(remainder);
      distributedAmounts[maxGroup.id] = roundToFive(
        distributedAmounts[maxGroup.id] + adjustment
      );
    }
    return;
  }

  // חלוקה לפי אחוזים יחסיים (בכפולות של 5)
  const multiplesOfFive = Math.floor(absRemainder / 5);
  
  if (multiplesOfFive === 0) {
    // אם ההפרש קטן מ-5, לא ניתן לחלק - נוסיף לקבוצה הגדולה ביותר
    const maxGroup = availableGroups.reduce((max, g) => 
      (distributedAmounts[g.id] || 0) > (distributedAmounts[max.id] || 0) ? g : max
    );
    const adjustment = roundToFive(remainder);
    distributedAmounts[maxGroup.id] = roundToFive(
      distributedAmounts[maxGroup.id] + adjustment
    );
    return;
  }

  // חישוב חלוקה לפי אחוזים (בכפולות של 5)
  const distribution: Array<{ id: string; multiples: number }> = [];
  let totalDistributedMultiples = 0;

  availableGroups.forEach((group) => {
    const percentage = (group.originalTotal / totalOriginal) * 100;
    const share = (absRemainder * percentage) / 100;
    const multiples = Math.floor(share / 5); // כמה כפולות של 5 לקבוצה זו
    
    distribution.push({ id: group.id, multiples });
    totalDistributedMultiples += multiples;
  });

  // אם יש עודף כפולות, נחלק אותן לפי סדר גודל (הקבוצה הגדולה ביותר מקבלת קודם)
  const remainingMultiples = multiplesOfFive - totalDistributedMultiples;
  
  if (remainingMultiples > 0) {
    // מיון לפי גודל (הגדול ביותר קודם)
    const sortedGroups = [...distribution].sort((a, b) => {
      const amountA = distributedAmounts[a.id] || 0;
      const amountB = distributedAmounts[b.id] || 0;
      return amountB - amountA;
    });
    
    // חלוקת הכפולות הנותרות (כל קבוצה מקבלת מקסימום 1 כפולה נוספת)
    for (let i = 0; i < remainingMultiples && i < sortedGroups.length; i++) {
      sortedGroups[i].multiples += 1;
    }
  }

  // יישום החלוקה
  distribution.forEach(({ id, multiples }) => {
    if (multiples > 0) {
      const adjustment = multiples * 5 * sign;
      distributedAmounts[id] = roundToFive(distributedAmounts[id] + adjustment);
    }
  });

  // אם עדיין יש הפרש (בגלל עיגולים), נוסיף אותו לקבוצה הגדולה ביותר
  const currentTotal = Object.values(distributedAmounts).reduce((sum, val) => sum + val, 0);
  const finalDifference = customBudget - currentTotal;
  
  if (Math.abs(finalDifference) >= 5) {
    const maxGroup = availableGroups.reduce((max, g) => 
      (distributedAmounts[g.id] || 0) > (distributedAmounts[max.id] || 0) ? g : max
    );
    const adjustment = roundToFive(finalDifference);
    distributedAmounts[maxGroup.id] = roundToFive(
      distributedAmounts[maxGroup.id] + adjustment
    );
  }
}

// עדכון גיל ילד (עם שמירת גיל מקורי)
export function updateChildAge(
  children: Child[],
  childId: string,
  newAge: number
): Child[] {
  return children.map((child) => {
    if (child.id === childId) {
      return {
        ...child,
        // שמירת הגיל המקורי בפעם הראשונה שמשנים
        originalAge: child.originalAge === undefined ? child.age : child.originalAge,
        age: newAge,
      };
    }
    return child;
  });
}

// איפוס גיל ילד לגיל המקורי
export function resetChildAge(children: Child[], childId: string): Child[] {
  return children.map((child) => {
    if (child.id === childId && child.originalAge !== undefined) {
      // הסרת originalAge והחזרת הגיל המקורי
      const { originalAge, ...rest } = child;
      return {
        ...rest,
        age: originalAge,
      };
    }
    return child;
  });
}

// הכללה/הדרה של ילד מהחישוב
export function excludeChild(
  includedChildren: Set<string>,
  childId: string,
  exclude: boolean
): Set<string> {
  const next = new Set(includedChildren);
  if (exclude) {
    next.delete(childId); // הסרה מהחישוב
  } else {
    next.add(childId); // הוספה לחישוב
  }
  return next;
}

// עדכון קבוצת גיל
export function updateAgeGroup(
  ageGroups: AgeGroup[],
  updatedGroup: AgeGroup
): AgeGroup[] {
  return ageGroups.map((group) =>
    group.id === updatedGroup.id ? updatedGroup : group
  );
}

// עדכון הגדרות תקציב
export function updateBudgetConfig(
  budgetConfig: BudgetConfig,
  config: Partial<BudgetConfig>
): BudgetConfig {
  return { ...budgetConfig, ...config };
}

// ולידציה של טווחי גיל
export function validateAgeRange(
  ageGroups: AgeGroup[],
  currentGroupId: string,
  minAge: number,
  maxAge: number
): { isValid: boolean; error?: string; warnings?: string[] } {
  const warnings: string[] = [];
  
  // בדיקה בסיסית
  if (minAge >= maxAge) {
    return { isValid: false, error: 'Minimum age must be less than maximum age' };
  }

  if (minAge < 0) {
    return { isValid: false, error: 'Minimum age cannot be negative' };
  }

  // בדיקת חפיפה עם קבוצות אחרות
  const overlappingGroups: AgeGroup[] = [];
  ageGroups.forEach((otherGroup) => {
    if (otherGroup.id === currentGroupId || !otherGroup.isIncluded) return;

    const hasOverlap =
      (minAge >= otherGroup.minAge && minAge <= otherGroup.maxAge) ||
      (maxAge >= otherGroup.minAge && maxAge <= otherGroup.maxAge) ||
      (minAge <= otherGroup.minAge && maxAge >= otherGroup.maxAge);

    if (hasOverlap) {
      overlappingGroups.push(otherGroup);
    }
  });

  if (overlappingGroups.length > 0) {
    return {
      isValid: false,
      error: `טווח הגיל חופף עם קבוצות אחרות: ${overlappingGroups.map(g => g.name).join(', ')}`,
    };
  }

  // בדיקת כיסוי - לא נבדוק את הגילאים בטווח של הקבוצה הנוכחית
  // כי הם מכוסים על ידה. נבדוק רק גילאים מחוץ לטווח של כל הקבוצות

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// בדיקה אם יש גילאים שלא מכוסים על ידי אף קבוצה
// בודקת רק את הטווח הרלוונטי של הקבוצות (מינימום ומקסימום של כל הקבוצות)
export function findUncoveredAges(
  ageGroups: AgeGroup[],
  minAge?: number,
  maxAge?: number
): number[] {
  const uncovered: number[] = [];
  
  // אם לא צוין טווח, נחשב את הטווח הרלוונטי מהקבוצות
  let actualMinAge = minAge ?? 0;
  let actualMaxAge = maxAge ?? 25;
  
  if (minAge === undefined || maxAge === undefined) {
    const includedGroups = ageGroups.filter(g => g.isIncluded);
    if (includedGroups.length > 0) {
      actualMinAge = Math.min(...includedGroups.map(g => g.minAge));
      actualMaxAge = Math.max(...includedGroups.map(g => g.maxAge));
    }
  }
  
  for (let age = actualMinAge; age <= actualMaxAge; age++) {
    const isCovered = ageGroups.some(
      (group) =>
        group.isIncluded &&
        age >= group.minAge &&
        age <= group.maxAge
    );
    if (!isCovered) {
      uncovered.push(age);
    }
  }
  
  return uncovered;
}

// בדיקה אם יש גילאים שמופיעים ביותר מקבוצה אחת
export function findDuplicateAges(ageGroups: AgeGroup[]): Array<{ age: number; groups: string[] }> {
  const ageToGroups: Record<number, string[]> = {};
  
  ageGroups.forEach((group) => {
    if (!group.isIncluded) return;
    
    for (let age = group.minAge; age <= group.maxAge; age++) {
      if (!ageToGroups[age]) {
        ageToGroups[age] = [];
      }
      ageToGroups[age].push(group.name);
    }
  });
  
  const duplicates: Array<{ age: number; groups: string[] }> = [];
  Object.entries(ageToGroups).forEach(([ageStr, groups]) => {
    if (groups.length > 1) {
      duplicates.push({
        age: parseInt(ageStr, 10),
        groups,
      });
    }
  });
  
  return duplicates;
}

// חישוב ההשפעה של שינוי סכום בקבוצת גיל
export function calculateImpact(
  currentAmount: number,
  newAmount: number,
  childrenCount: number
): { difference: number; percentageChange: number } | null {
  if (childrenCount === 0) return null;

  const currentTotal = childrenCount * currentAmount;
  const newTotal = childrenCount * newAmount;
  const difference = newTotal - currentTotal;

  return {
    difference,
    percentageChange: currentTotal > 0 ? (difference / currentTotal) * 100 : 0,
  };
}

// עיגול סכום ל-5 הקרוב ביותר
export function roundToFive(amount: number): number {
  return Math.round(amount / 5) * 5;
}

// מיון ילדים לפי גיל (יורד) ואז לפי שם (אלפביתי)
export function sortChildren(children: Child[]): Child[] {
  return [...children].sort((a, b) => {
    // קודם לפי גיל (יורד)
    if (a.age !== b.age) {
      return b.age - a.age;
    }
    // אם אותו גיל - לפי שם (אלפביתי)
    return `${a.firstName} ${a.lastName}`.localeCompare(
      `${b.firstName} ${b.lastName}`
    );
  });
}

// חישוב השינוי בתקציב בין שני מצבים
export function calculateBudgetChange(
  previousBudget: { total: number; perParticipant: number },
  currentBudget: { total: number; perParticipant: number }
): {
  totalDiff: number;
  percentageChange: number;
  isIncrease: boolean;
  perParticipantDiff: number;
} {
  const totalDiff = currentBudget.total - previousBudget.total;
  const percentageChange =
    previousBudget.total > 0
      ? ((currentBudget.total - previousBudget.total) / previousBudget.total) * 100
      : 0;
  const isIncrease = totalDiff > 0;
  const perParticipantDiff =
    currentBudget.perParticipant - previousBudget.perParticipant;

  return {
    totalDiff,
    percentageChange,
    isIncrease,
    perParticipantDiff,
  };
}

// חישוב כמה אחוז מהתקציב הכולל כל קבוצה תופסת
export function calculateGroupPercentage(
  groupTotal: number,
  totalBudget: number
): number {
  if (totalBudget === 0) return 0;
  return (groupTotal / totalBudget) * 100;
}

// מציאת קבוצות שיש בהן ילדים וכלולות בחישוב
export function getActiveGroups(
  ageGroups: AgeGroup[],
  calculation: BudgetCalculation
): AgeGroup[] {
  return ageGroups.filter(
    (group) =>
      group.isIncluded && calculation.groupTotals[group.id]?.childrenCount > 0
  );
}

// בדיקה אם התקציב חרג מהמותר
export function isOverBudget(calculation: BudgetCalculation): boolean {
  return calculation.totalRequired > calculation.maxAllowed;
}

// חישוב סכום החריגה
export function getOverflowAmount(calculation: BudgetCalculation): number {
  return Math.max(0, calculation.totalRequired - calculation.maxAllowed);
}

// לוגיקה מורכבת לעיבוד קלט מספרי עם ולידציה ועיגול
export function processBudgetInput(
  inputValue: string,
  _currentValue: number, // Used for type consistency, but not always needed
  options: {
    min?: number;
    max?: number;
    roundToFive?: boolean;
  }
): number | null {
  // אם ריק או רק מינוס - לא לעבד
  if (!inputValue || inputValue === '-') return null;

  let numValue = Number(inputValue);

  // אם לא מספר תקין - להחזיר null
  if (isNaN(numValue)) return null;

  // החלת min/max constraints
  if (options.min !== undefined) {
    numValue = Math.max(options.min, numValue);
  }
  if (options.max !== undefined) {
    numValue = Math.min(options.max, numValue);
  }

  // עיגול ל-5 אם נדרש
  if (options.roundToFive) {
    numValue = Math.round(numValue / 5) * 5;
  }

  return numValue;
}

// טיפול ב-blur (כשיוצאים מהשדה)
export function handleInputBlur(
  localValue: string,
  currentValue: number,
  options: {
    min?: number;
    max?: number;
    roundToFive?: boolean;
  }
): number {
  let finalValue = Number(localValue);

  // אם לא מספר תקין - להחזיר את הערך הנוכחי
  if (isNaN(finalValue)) {
    return currentValue;
  }

  // החלת constraints
  if (options.min !== undefined) {
    finalValue = Math.max(options.min, finalValue);
  }
  if (options.max !== undefined) {
    finalValue = Math.min(options.max, finalValue);
  }
  if (options.roundToFive) {
    finalValue = Math.round(finalValue / 5) * 5;
  }

  return finalValue;
}

// טיפול בחצים (up/down arrows)
export function handleArrowKey(
  currentValue: number,
  direction: 'up' | 'down',
  options: {
    min?: number;
    max?: number;
    roundToFive?: boolean;
  }
): number {
  const step = options.roundToFive ? 5 : 1;
  let newValue = currentValue + (direction === 'up' ? step : -step);

  // החלת constraints
  if (options.min !== undefined) {
    newValue = Math.max(options.min, newValue);
  }
  if (options.max !== undefined) {
    newValue = Math.min(options.max, newValue);
  }

  return newValue;
}

// עדכון אוטומטי של שם הקבוצה לפי טווח הגילאים
export function updateGroupName(minAge: number, maxAge: number): string {
  return `${minAge}-${maxAge}`;
}

// חישוב אחוז השינוי בקבוצה ספציפית
export function calculateGroupChangePercentage(
  currentAmount: number,
  newAmount: number
): number {
  if (currentAmount === 0) return 0;
  return ((newAmount - currentAmount) / currentAmount) * 100;
}

// בדיקה אם קבוצה פעילה (כלולה ויש לה סכום)
export function isGroupActive(group: AgeGroup): boolean {
  return group.isIncluded && group.amountPerChild > 0;
}

// חישוב אחוז מהתקציב הכולל (להצגה כ-bar)
export function calculateBudgetBarWidth(
  groupTotal: number,
  totalBudget: number
): number {
  if (totalBudget === 0) return 0;
  return (groupTotal / totalBudget) * 100;
}
