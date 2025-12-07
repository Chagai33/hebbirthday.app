
import { Child } from '../types/gelt';
import { Birthday } from '../types';

// ייבוא מרשימת ימי הולדת
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
    // חישוב גיל פשוט (שנה נוכחית - שנת לידה)
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

// ייבוא מ-CSV
export function parseCSVToChildren(csvData: any[]): Child[] {
  return csvData
    .map((row: any) => {
      // תמיכה בשני פורמטים:
      // 1. "First Name", "Last Name", "Age"
      // 2. "Full Name", "Age"

      let firstName = '';
      let lastName = '';

      if (row['Full Name']) {
        // פיצול שם מלא
        const nameParts = row['Full Name'].trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        firstName = row['First Name']?.trim() || '';
        lastName = row['Last Name']?.trim() || '';
      }

      const age = parseInt(row['Age'], 10);

      return {
        id: crypto.randomUUID(), // או ID אחר
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
