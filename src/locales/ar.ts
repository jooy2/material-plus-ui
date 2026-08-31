/**
 * Arabic — العربية.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { ar } from 'material-plus-ui/locales/ar';
 *
 *     registerMPMessages(ar);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const ar: MPLocale = {
  locale: 'ar',
  messages: {
    common: {
      close: 'إغلاق',
      clear: 'مسح',
      open: 'فتح',
      remove: 'إزالة',
      removeNamed: 'إزالة {label}',
      loading: 'جارٍ التحميل'
    },
    textField: { showPassword: 'إظهار كلمة المرور', hidePassword: 'إخفاء كلمة المرور' },
    empty: { title: 'لا يوجد شيء هنا' },
    picker: {
      previousMonth: 'الشهر السابق',
      nextMonth: 'الشهر التالي',
      previousYear: 'السنة السابقة',
      nextYear: 'السنة التالية',
      previousYears: 'السنوات السابقة',
      nextYears: 'السنوات التالية',
      chooseMonth: 'اختيار شهر',
      chooseYear: 'اختيار سنة',
      today: 'اليوم',
      thisMonth: 'هذا الشهر',
      thisYear: 'هذه السنة',
      now: 'الآن',
      clear: 'مسح',
      done: 'تم',
      hour: 'الساعة',
      minute: 'الدقيقة',
      second: 'الثانية',
      meridiem: 'ص/م',
      start: 'البداية',
      end: 'النهاية'
    },
    numberField: { increase: 'زيادة', decrease: 'إنقاص' },
    carousel: {
      label: 'عرض دوّار',
      previous: 'الشريحة السابقة',
      next: 'الشريحة التالية',
      slide: 'الشريحة {index} من {total}'
    },
    breadcrumb: { label: 'مسار التنقل', expand: 'إظهار الخطوات المخفية' },
    combobox: { empty: 'لا توجد نتائج', add: 'إضافة ”{label}“' },
    table: { empty: 'لا توجد بيانات' },
    filePicker: { prompt: 'أفلِت الملفات هنا، أو انقر للاستعراض' },
    textLink: { newTab: 'يُفتح في تبويب جديد' },
    overlay: { label: 'طبقة تراكب' },
    alert: { dismiss: 'إغلاق' },
    chat: {
      sending: 'جارٍ الإرسال',
      sent: 'تم الإرسال',
      delivered: 'تم التسليم',
      read: 'تمت القراءة',
      failed: 'لم يتم الإرسال',
      typing: 'يكتب الآن'
    },
    spoiler: {
      reveal: 'إظهار',
      hide: 'إخفاء',
      notice: 'مخفي حتى لا يُقرأ بالخطأ'
    },
    pagination: {
      label: 'ترقيم الصفحات',
      page: 'الصفحة {page}',
      status: 'الصفحة {page} من {total}',
      previous: 'الصفحة السابقة',
      next: 'الصفحة التالية',
      first: 'الصفحة الأولى',
      last: 'الصفحة الأخيرة'
    },
    rating: {
      label: 'التقييم',
      value: '{value} من {max}',
      empty: 'بدون تقييم'
    },
    colorPicker: {
      area: 'التشبع والسطوع',
      hue: 'درجة اللون',
      alpha: 'العتامة',
      value: 'قيمة اللون',
      swatches: 'ألوان جاهزة',
      clear: 'مسح',
      empty: 'بلا لون'
    },
    transfer: {
      source: 'المتاح',
      target: 'المحدد',
      toTarget: 'النقل إلى المحدد',
      toSource: 'الإرجاع إلى المتاح',
      search: 'بحث',
      empty: 'لا شيء هنا'
    },
    command: {
      label: 'لوحة الأوامر',
      search: 'اكتب أمراً أو ابحث…',
      empty: 'لا توجد أوامر مطابقة'
    },
    layout: {
      skipToContent: 'تخطٍ إلى المحتوى',
      sidebar: 'الشريط الجانبي',
      openSidebar: 'فتح الشريط الجانبي',
      closeSidebar: 'إغلاق الشريط الجانبي',
      resizeSidebar: 'تغيير عرض الشريط الجانبي'
    }
  }
};
