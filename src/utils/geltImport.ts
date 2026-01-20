
import { Child } from '../types/gelt';
import { Birthday } from '../types';

// Import from birthday list
export function importFromBirthdays(
  birthdays: Array<{
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
  }>
): Child[] {
  const currentYear = new Date().getFullYear();

  return birthdays.map((birthday) => {
    // Simple age calculation (current year - birth year)
    const birthYear = new Date(birthday.birthDate).getFullYear();
    const age = currentYear - birthYear;

    return {
      id: birthday.id,
      firstName: birthday.firstName,
      lastName: birthday.lastName,
      age,
    };
  });
}

// Import from CSV
export function parseCSVToChildren(csvData: any[]): Child[] {
  return csvData
    .map((row: any) => {
      // Support for two formats:
      // 1. "First Name", "Last Name", "Age"
      // 2. "Full Name", "Age"

      let firstName = '';
      let lastName = '';

      if (row['Full Name']) {
        // Split full name
        const nameParts = row['Full Name'].trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        firstName = row['First Name']?.trim() || '';
        lastName = row['Last Name']?.trim() || '';
      }

      const age = parseInt(row['Age'], 10);

      return {
        id: crypto.randomUUID(), // Or another ID
        firstName,
        lastName,
        age,
      };
    })
    .filter(
      (child) =>
        child.firstName && !isNaN(child.age) && child.age >= 0
    );
}
