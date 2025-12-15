
import { HDate, gematriya, Locale } from '@hebcal/core';

const hd = new HDate();
console.log('Locale.gettext("Kislev", "he"):', Locale.gettext('Kislev', 'he'));
console.log('hd.getMonthName():', hd.getMonthName());
