import { Group } from '../types';
import { useTranslation } from 'react-i18next';

/**
 * Hook to get translated root group name
 * For root groups with type (family, friends, work), returns the translated name
 * For other groups, returns the original name from the database
 */
export const useTranslatedRootGroupName = (group: Group): string => {
  const { t } = useTranslation();
  
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

