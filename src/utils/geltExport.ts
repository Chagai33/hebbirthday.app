import { BudgetCalculation, BudgetConfig, AgeGroup, Child, ExportData } from '../types/gelt';

// Prepare data for export
export function prepareExportData(
  calculation: BudgetCalculation,
  budgetConfig: BudgetConfig,
  ageGroups: AgeGroup[],
  children: Child[]
): ExportData {
  return {
    budget: {
      total: calculation.totalRequired,
      perParticipant: calculation.amountPerParticipant,
      participants: budgetConfig.participants,
      allowedOverflow: budgetConfig.allowedOverflowPercentage,
    },
    ageGroups: ageGroups.map((group) => ({
      ...group,
      childCount: calculation.groupTotals[group.id]?.childrenCount || 0,
      total: calculation.groupTotals[group.id]?.total || 0,
    })),
    children: children.map((child) => ({
      name: `${child.firstName} ${child.lastName}`,
      age: child.age,
      ageModified: child.originalAge !== undefined,
      originalAge: child.originalAge,
    })),
  };
}

// Export to CSV
export function exportToCSV(exportData: ExportData): string {
  const lines: string[] = [];

  // Header
  lines.push('Budget Summary');
  lines.push(`Total Required,${exportData.budget.total}`);
  lines.push(`Per Participant,${exportData.budget.perParticipant}`);
  lines.push(`Participants,${exportData.budget.participants}`);
  lines.push(`Allowed Overflow,${exportData.budget.allowedOverflow}%`);
  lines.push('');

  // Age Groups
  lines.push('Age Groups');
  lines.push('Name,Min Age,Max Age,Amount Per Child,Children Count,Total');
  exportData.ageGroups.forEach((group) => {
    lines.push(
      `${group.name},${group.minAge},${group.maxAge},${group.amountPerChild},${group.childCount},${group.total}`
    );
  });
  lines.push('');

  // Children
  lines.push('Children');
  lines.push('Name,Age,Age Modified,Original Age');
  exportData.children.forEach((child) => {
    lines.push(
      `${child.name},${child.age},${child.ageModified},${child.originalAge || ''}`
    );
  });

  return lines.join('\n');
}
