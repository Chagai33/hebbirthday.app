"use strict";
// EventBuilderService - בניית אירועי לוח שנה
// מקור: calculateExpectedEvents שורות 179-281 מ-index.ts
// הלוגיקה נשארת זהה, אבל מקבלת נתונים מעובדים כפרמטרים
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBuilderService = void 0;
class EventBuilderService {
    constructor(zodiacService) {
        this.zodiacService = zodiacService;
    }
    async buildEventsForBirthday(birthday, tenant, groups, wishlistItems) {
        const events = [];
        const language = (tenant?.default_language || 'he');
        // Translation maps
        const translations = {
            he: {
                wishlist: '🎁 רשימת משאלות:\n',
                gregorianBirthDate: 'תאריך לידה לועזי',
                hebrewBirthDate: 'תאריך לידה עברי',
                afterSunset: '⚠️ לאחר השקיעה\n',
                groups: 'קבוצות',
                notes: 'הערות',
                zodiacSign: 'מזל',
                gregorianTitle: 'יום הולדת לועזי 🎂',
                hebrewTitle: 'יום הולדת עברי 🎂'
            },
            en: {
                wishlist: '🎁 Wishlist:\n',
                gregorianBirthDate: 'Gregorian Birth Date',
                hebrewBirthDate: 'Hebrew Birth Date',
                afterSunset: '⚠️ After Sunset\n',
                groups: 'Groups',
                notes: 'Notes',
                zodiacSign: 'Zodiac Sign',
                gregorianTitle: 'Gregorian Birthday 🎂',
                hebrewTitle: 'Hebrew Birthday 🎂'
            },
            es: {
                wishlist: '🎁 Lista de deseos:\n',
                gregorianBirthDate: 'Fecha de nacimiento Gregoriano',
                hebrewBirthDate: 'Fecha de nacimiento Hebreo',
                afterSunset: '⚠️ Después del atardecer\n',
                groups: 'Grupos',
                notes: 'Notas',
                zodiacSign: 'Signo Zodiacal',
                gregorianTitle: 'Cumpleaños Gregoriano 🎂',
                hebrewTitle: 'Cumpleaños Hebreo 🎂'
            }
        };
        const t = translations[language];
        // Spanish zodiac names mapping
        const zodiacNamesEs = {
            'Aries': 'Aries', 'Taurus': 'Tauro', 'Gemini': 'Géminis', 'Cancer': 'Cáncer',
            'Leo': 'Leo', 'Virgo': 'Virgo', 'Libra': 'Libra', 'Scorpio': 'Escorpio',
            'Sagittarius': 'Sagitario', 'Capricorn': 'Capricornio', 'Aquarius': 'Acuario', 'Pisces': 'Piscis'
        };
        // Description Construction - העתקה מדויקת
        let description = '';
        let wishlistText = '';
        if (wishlistItems.length > 0) {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const items = wishlistItems
                .sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
                .map((item, index) => `${index + 1}. ${item.item_name}`);
            if (items.length > 0) {
                wishlistText = t.wishlist + items.join('\n') + '\n\n';
            }
        }
        description += wishlistText;
        description += `${t.gregorianBirthDate}: ${birthday.birth_date_gregorian}\n${t.hebrewBirthDate}: ${birthday.birth_date_hebrew_string || ''}\n`;
        if (birthday.after_sunset) {
            description += t.afterSunset;
        }
        if (groups.length > 0) {
            const gNames = groups.map(g => g.parentName ? `${g.parentName}: ${g.name}` : g.name);
            description += `\n${t.groups}: ${gNames.join(', ')}`;
        }
        if (birthday.notes) {
            description += `\n\n${t.notes}: ${birthday.notes}`;
        }
        const extendedProperties = {
            private: {
                createdByApp: 'hebbirthday',
                tenantId: birthday.tenant_id,
                birthdayId: birthday.id || 'unknown'
            }
        };
        // Zodiacs - שימוש ב-ZodiacService
        const gregSign = this.zodiacService.getGregorianZodiacSign(new Date(birthday.birth_date_gregorian));
        const hebSign = birthday.birth_date_hebrew_month ?
            this.zodiacService.getHebrewZodiacSign(birthday.birth_date_hebrew_month) : null;
        const prefs = birthday.calendar_preference_override || tenant?.default_calendar_preference || 'both';
        const doHeb = prefs === 'hebrew' || prefs === 'both';
        const doGreg = prefs === 'gregorian' || prefs === 'both';
        const createEvent = (title, date, type, year, desc) => {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            return {
                summary: title,
                description: desc,
                start: { date: start.toISOString().split('T')[0] },
                end: { date: end.toISOString().split('T')[0] },
                extendedProperties,
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 1440 },
                        { method: 'popup', minutes: 60 }
                    ]
                },
                _type: type,
                _year: year
            };
        };
        // Gregorian Events
        if (doGreg) {
            const bDate = new Date(birthday.birth_date_gregorian);
            let gregDesc = description;
            if (gregSign) {
                gregDesc += `\n\n${t.zodiacSign}: ${language === 'en' ? this.zodiacService.getZodiacSignNameEn(gregSign) :
                    language === 'es' ? (zodiacNamesEs[gregSign] || gregSign) :
                        this.zodiacService.getZodiacSignNameHe(gregSign)}`;
            }
            const curYear = new Date().getFullYear();
            for (let i = 0; i <= 10; i++) {
                const y = curYear + i;
                const d = new Date(y, bDate.getMonth(), bDate.getDate());
                const age = y - bDate.getFullYear();
                const title = `${birthday.first_name} ${birthday.last_name} | ${age} | ${t.gregorianTitle}`;
                events.push(createEvent(title, d, 'gregorian', y, gregDesc));
            }
        }
        // Hebrew Events
        if (doHeb && birthday.future_hebrew_birthdays) {
            let hebDesc = description;
            if (hebSign) {
                hebDesc += `\n\n${t.zodiacSign}: ${language === 'en' ? this.zodiacService.getZodiacSignNameEn(hebSign) :
                    language === 'es' ? (zodiacNamesEs[hebSign] || hebSign) :
                        this.zodiacService.getZodiacSignNameHe(hebSign)}`;
            }
            birthday.future_hebrew_birthdays.slice(0, 10).forEach((item) => {
                const dStr = typeof item === 'string' ? item : item.gregorian;
                const hYear = typeof item === 'string' ? 0 : item.hebrewYear;
                const age = (hYear && birthday.hebrew_year) ? hYear - birthday.hebrew_year : 0;
                const title = `${birthday.first_name} ${birthday.last_name} | ${age} | ${t.hebrewTitle}`;
                events.push(createEvent(title, new Date(dStr), 'hebrew', hYear, hebDesc));
            });
        }
        return events;
    }
}
exports.EventBuilderService = EventBuilderService;
//# sourceMappingURL=EventBuilderService.js.map