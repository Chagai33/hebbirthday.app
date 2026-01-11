import { Group } from '../types';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

/**
 * פונקציה טהורה לתרגום שם קבוצת שורש.
 * בטוחה לשימוש בתוך לוגיקה תנאית כי היא אינה Hook.
 */
export const getTranslatedGroupName = (group: any, t: any): string => {
  if (!group.is_root || !group.type) {
    return group.name;
  }

  const translationKeys: Record<string, string> = {
    family: 'groups.family',
    friends: 'groups.friends',
    work: 'groups.work',
  };

  const translationKey = translationKeys[group.type];
  if (!translationKey) {
    return group.name;
  }

  return t(translationKey);
};

/**
 * Hook קיים לשימוש בקומפוננטות פשוטות (שומר על תאימות לאחור).
 */
export const useTranslatedRootGroupName = (group: Group): string => {
  const { t } = useTranslation();
  return getTranslatedGroupName(group, t);
};