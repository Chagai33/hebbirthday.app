import { FloatingBackButton } from '../common/FloatingBackButton';
import { logger } from "../../utils/logger";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../contexts/TenantContext';
import { CalendarPreferenceSelector } from './CalendarPreferenceSelector';
import { CalendarPreference } from '../../types';
import { Settings, Save, X, Trash2, AlertTriangle, Globe, Info } from 'lucide-react';
import { getSupportedTimezones, detectBrowserTimezone } from '../../utils/dateUtils';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../common/Toast';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';


interface TenantSettingsProps {
    onClose: () => void;
}

export const TenantSettings: React.FC<TenantSettingsProps> = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const isHebrew = i18n.language === 'he';
    const { currentTenant, updateTenant } = useTenant();
    const { toasts, hideToast, success, error } = useToast();

    const [preference, setPreference] = useState<CalendarPreference>(
        currentTenant?.default_calendar_preference || 'both'
    );
    const [timezone, setTimezone] = useState<string>(
        currentTenant?.timezone || detectBrowserTimezone()
    );
    const [isSaving, setIsSaving] = useState(false);

    const timezoneGroups = getSupportedTimezones();

    // Deletion State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletionSummary, setDeletionSummary] = useState<{ groupsCount: number, birthdaysCount: number } | null>(null);
    const [isCalculatingSummary, setIsCalculatingSummary] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async () => {
        if (!currentTenant) return;

        setIsSaving(true);
        try {
            await updateTenant(currentTenant.id, {
                default_calendar_preference: preference,
                timezone: timezone,
            });
            success(t('messages.tenantUpdated'));
            setTimeout(() => onClose(), 1000);
        } catch (err) {
            error(t('common.error'));
            logger.error('Error updating tenant settings:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrepareDelete = async () => {
        if (!currentTenant) return;
        setShowDeleteConfirm(true);
        setIsCalculatingSummary(true);
        try {
            const getSummary = httpsCallable(functions, 'getAccountDeletionSummary');
            const result = await getSummary({ tenantId: currentTenant.id });
            setDeletionSummary(result.data as any);
        } catch (err) {
            logger.error('Error getting deletion summary:', err);
            error(t('common.error'));
            setShowDeleteConfirm(false);
        } finally {
            setIsCalculatingSummary(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!currentTenant) return;
        setIsDeleting(true);
        try {
            const deleteAccount = httpsCallable(functions, 'deleteAccount');
            await deleteAccount({ tenantId: currentTenant.id });
            await signOut(auth);
            window.location.reload();
        } catch (err) {
            logger.error('Error deleting account:', err);
            error(t('common.error'));
            setIsDeleting(false);
        }
    };

    if (!currentTenant) {
        return null;
    }

    return (
        <>
            <FloatingBackButton
                onClick={onClose}
                position={isHebrew ? 'bottom-left' : 'bottom-right'}
                className="z-[60]"
            />
            <FloatingBackButton
                onClick={onClose}
                showOnDesktop
                customPosition={`top-6 ${isHebrew ? 'right-6' : 'left-6'} hidden sm:block`}
                className="z-[60]"
            />
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 max-h-[90vh] overflow-y-auto">
                    {/* Header - Compact */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Settings className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {t('tenant.settings')}
                                </h2>
                                <p className="text-xs text-gray-600">{currentTenant.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Info Banner - Compact */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex gap-2">
                                <div className="text-blue-600 mt-0.5">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-blue-900 text-sm mb-0.5">
                                        {t('tenant.defaultCalendarPreference')}
                                    </h3>
                                    <p className="text-xs text-blue-800">
                                        {t('tenant.preferenceDescription')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <CalendarPreferenceSelector
                            value={preference}
                            onChange={setPreference}
                            showDescription={true}
                            label={t('birthday.calendarPreference')}
                        />

                        {/* Timezone Selector - Compact */}
                        <div className="space-y-2 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-600" />
                                <label className="text-sm font-semibold text-gray-800">
                                    {t('tenant.timezone', 'Timezone')}
                                </label>
                            </div>

                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                {Object.entries(timezoneGroups).map(([region, tzList]) => (
                                    tzList.length > 0 && (
                                        <optgroup key={region} label={region}>
                                            {tzList.map(tz => (
                                                <option key={tz} value={tz}>
                                                    {tz.replace(/_/g, ' ')}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )
                                ))}
                            </select>

                            <div className="flex items-start gap-1.5 text-xs text-indigo-700 bg-indigo-100 rounded-md p-2">
                                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                <p>
                                    {t('tenant.timezoneHint', 'כל החישובים והתאריכים מתבצעים לפי אזור זמן זה.')}
                                </p>
                            </div>
                        </div>

                        {/* Notes - Compact */}
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-1.5">
                            <h4 className="font-semibold text-gray-900 text-sm">
                                {t('common.notes', 'Notes')}:
                            </h4>
                            <ul className="list-disc list-inside space-y-0.5 text-xs">
                                <li>{t('settings.note1', 'ההגדרה זו חלה בברירת מחדל על כל הקבוצות')}</li>
                                <li>{t('settings.note2', 'קבוצות יכולות לעקוף הגדרה זו')}</li>
                                <li>{t('settings.note3', 'רשומות בודדות יכולות לעקוף הגדרת קבוצה')}</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? t('common.loading') : t('common.save')}
                            </button>
                        </div>

                        {/* Danger Zone - Compact */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h3 className="text-base font-semibold text-red-600 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {t('settings.dangerZone', 'Danger Zone')}
                            </h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-red-900 text-sm mb-0.5">
                                        {t('settings.deleteAccount', 'Delete Account')}
                                    </h4>
                                    <p className="text-xs text-red-700">
                                        {t('settings.deleteAccountDescription', 'מחיקה סופית של החשבון')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handlePrepareDelete}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-1.5 text-sm flex-shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    {t('common.delete', 'Delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('settings.deleteAccountConfirmTitle', 'Are you absolutely sure?')}
                            </h3>
                            <p className="text-gray-600">
                                {t('settings.deleteAccountConfirmDescription', 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.')}
                            </p>
                        </div>

                        {isCalculatingSummary ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                        ) : deletionSummary ? (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                <h4 className="font-medium text-gray-900 mb-2">
                                    {t('settings.summaryOfData', 'Summary of data to be deleted:')}
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex justify-between">
                                        <span>{t('common.groups', 'Groups')}:</span>
                                        <span className="font-medium">{deletionSummary.groupsCount}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>{t('common.birthdays', 'Birthdays')}:</span>
                                        <span className="font-medium">{deletionSummary.birthdaysCount}</span>
                                    </li>
                                </ul>
                            </div>
                        ) : null}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                disabled={isDeleting}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting || isCalculatingSummary}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {t('common.deleting', 'Deleting...')}
                                    </>
                                ) : (
                                    t('settings.confirmDelete', 'Yes, delete account')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => hideToast(toast.id)}
                />
            ))}
        </>
    );
};
