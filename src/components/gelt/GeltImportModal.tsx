import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Birthday, Gender } from '../../types';
import { importFromBirthdays } from '../../utils/geltImport';
import { Child, AgeGroup } from '../../types/gelt';
import { Button } from '../common/Button';
import { useGroups } from '../../hooks/useGroups';
import { X, Download, AlertCircle, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface GeltImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (children: Child[]) => void;
  birthdays: Birthday[];
  ageGroups: AgeGroup[];
}

export const GeltImportModal: React.FC<GeltImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  birthdays,
  ageGroups,
}) => {
  const { t } = useTranslation();
  const { data: groups = [] } = useGroups();
  const [selectedBirthdayIds, setSelectedBirthdayIds] = useState<Set<string>>(new Set());
  const [showExcluded, setShowExcluded] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [genderFilter, setGenderFilter] = useState<Gender | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate age for each birthday
  const birthdaysWithAge = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return birthdays.map((birthday) => {
      const birthYear = new Date(birthday.birth_date_gregorian).getFullYear();
      const age = currentYear - birthYear;
      return { ...birthday, calculatedAge: age };
    });
  }, [birthdays]);

  // Filter birthdays by groups and gender first
  const filteredBirthdays = useMemo(() => {
    let filtered = birthdaysWithAge;

    // Filter by groups
    if (selectedGroupIds.size > 0) {
      filtered = filtered.filter((birthday) => {
        const bGroupIds = birthday.group_ids || (birthday.group_id ? [birthday.group_id] : []);
        return bGroupIds.length > 0 && Array.from(selectedGroupIds).some(id => bGroupIds.includes(id));
      });
    }

    // Filter by gender
    if (genderFilter !== 'all') {
      filtered = filtered.filter((birthday) => birthday.gender === genderFilter);
    }

    return filtered;
  }, [birthdaysWithAge, selectedGroupIds, genderFilter]);

  // Filter birthdays by age groups
  const { relevantBirthdays, excludedBirthdays } = useMemo(() => {
    const relevant: typeof filteredBirthdays = [];
    const excluded: typeof filteredBirthdays = [];

    filteredBirthdays.forEach((birthday) => {
      const age = birthday.calculatedAge;
      const isInRange = ageGroups.some(
        (group) => group.isIncluded && age >= group.minAge && age <= group.maxAge
      );

      if (isInRange) {
        relevant.push(birthday);
      } else {
        excluded.push(birthday);
      }
    });

    return { relevantBirthdays: relevant, excludedBirthdays: excluded };
  }, [filteredBirthdays, ageGroups]);

  // Prepare group options (only child groups/subgroups)
  const groupOptions = useMemo(() => {
    const rootGroups = groups.filter(g => !g.parent_id);
    const childGroups = groups.filter(g => g.parent_id);
    
    return rootGroups.flatMap(root => {
      const children = childGroups.filter(c => c.parent_id === root.id);
      return children.map(child => ({
        ...child,
        rootName: root.name,
        rootType: root.type,
      }));
    });
  }, [groups]);

  if (!isOpen) return null;

  const handleToggle = (birthdayId: string) => {
    const newSet = new Set(selectedBirthdayIds);
    if (newSet.has(birthdayId)) {
      newSet.delete(birthdayId);
    } else {
      newSet.add(birthdayId);
    }
    setSelectedBirthdayIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedBirthdayIds.size === relevantBirthdays.length) {
      setSelectedBirthdayIds(new Set());
    } else {
      setSelectedBirthdayIds(new Set(relevantBirthdays.map((b) => b.id)));
    }
  };

  const handleImport = () => {
    const selectedBirthdays = relevantBirthdays.filter((b) => selectedBirthdayIds.has(b.id));
    const children = importFromBirthdays(
      selectedBirthdays.map((b) => ({
        id: b.id,
        firstName: b.first_name,
        lastName: b.last_name,
        birthDate: b.birth_date_gregorian,
      }))
    );
    onImport(children);
    onClose();
    setSelectedBirthdayIds(new Set());
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{t('gelt.importFromBirthdays')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Filters Section */}
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Filter className="w-4 h-4" />
                {t('gelt.filters')}
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {(selectedGroupIds.size > 0 || genderFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedGroupIds(new Set());
                    setGenderFilter('all');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t('gelt.clearFilters')}
                </button>
              )}
            </div>

            {showFilters && (
              <div className="space-y-3">
                {/* Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('gelt.filterByGroups')}
                  </label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {groupOptions.map((group) => (
                      <label
                        key={group.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.has(group.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedGroupIds);
                            if (e.target.checked) {
                              newSet.add(group.id);
                            } else {
                              newSet.delete(group.id);
                            }
                            setSelectedGroupIds(newSet);
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {group.rootName} / {group.name}
                        </span>
                      </label>
                    ))}
                    {groupOptions.length === 0 && (
                      <p className="text-xs text-gray-500 p-2">{t('gelt.noGroupsAvailable')}</p>
                    )}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('gelt.filterByGender')}
                  </label>
                  <div className="flex gap-3">
                    {(['all', 'male', 'female'] as const).map((gender) => (
                      <label
                        key={gender}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="genderFilter"
                          value={gender}
                          checked={genderFilter === gender}
                          onChange={() => setGenderFilter(gender)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {gender === 'all' 
                            ? t('gelt.allGenders') 
                            : gender === 'male' 
                            ? t('gelt.male') 
                            : t('gelt.female')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Warning about excluded ages */}
          {excludedBirthdays.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    {t('gelt.excludedAgesWarning')}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {t('gelt.excludedAgesWarningDescription', { count: excludedBirthdays.length })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">
                {t('gelt.selectBirthdays')} ({selectedBirthdayIds.size} / {relevantBirthdays.length})
              </span>
              {excludedBirthdays.length > 0 && (
                <button
                  onClick={() => setShowExcluded(!showExcluded)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start"
                >
                  {showExcluded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      {t('gelt.hideExcluded')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      {t('gelt.showExcluded', { count: excludedBirthdays.length })}
                    </>
                  )}
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedBirthdayIds.size === relevantBirthdays.length
                ? t('gelt.deselectAll')
                : t('gelt.selectAll')}
            </Button>
          </div>

          {/* Relevant birthdays */}
          <div className="space-y-2 mb-4">
            {relevantBirthdays.map((birthday) => (
              <label
                key={birthday.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedBirthdayIds.has(birthday.id)}
                  onChange={() => handleToggle(birthday.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium">
                    {birthday.first_name} {birthday.last_name}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({birthday.birth_date_gregorian}, {t('gelt.age')}: {birthday.calculatedAge})
                  </span>
                </div>
              </label>
            ))}
          </div>

          {/* Excluded birthdays (shown when expanded) */}
          {showExcluded && excludedBirthdays.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="font-medium">
                  {t('gelt.excludedBirthdays', { count: excludedBirthdays.length })}
                </span>
              </div>
              <div className="space-y-2">
                {excludedBirthdays.map((birthday) => (
                  <div
                    key={birthday.id}
                    className="flex items-center gap-3 p-3 border border-orange-200 bg-orange-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">
                        {birthday.first_name} {birthday.last_name}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({birthday.birth_date_gregorian}, {t('gelt.age')}: {birthday.calculatedAge})
                      </span>
                    </div>
                    <span className="text-xs text-orange-600 font-medium">
                      {t('gelt.noMatchingAgeGroup')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={selectedBirthdayIds.size === 0}
            icon={<Download className="w-4 h-4" />}
          >
            {t('gelt.import')}
          </Button>
        </div>
      </div>
    </div>
  );
};
