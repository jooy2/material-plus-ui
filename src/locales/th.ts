/**
 * Thai — ไทย.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { th } from 'material-plus-ui/locales/th';
 *
 *     registerMPMessages(th);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const th: MPLocale = {
  locale: 'th',
  messages: {
    common: {
      close: 'ปิด',
      clear: 'ล้าง',
      open: 'เปิด',
      remove: 'ลบ',
      removeNamed: 'ลบ {label}',
      loading: 'กำลังโหลด'
    },
    textField: { showPassword: 'แสดงรหัสผ่าน', hidePassword: 'ซ่อนรหัสผ่าน' },
    empty: { title: 'ไม่มีอะไรที่นี่' },
    picker: {
      previousMonth: 'เดือนก่อนหน้า',
      nextMonth: 'เดือนถัดไป',
      previousYear: 'ปีก่อนหน้า',
      nextYear: 'ปีถัดไป',
      previousYears: 'ชุดปีก่อนหน้า',
      nextYears: 'ชุดปีถัดไป',
      chooseMonth: 'เลือกเดือน',
      chooseYear: 'เลือกปี',
      today: 'วันนี้',
      now: 'ตอนนี้',
      clear: 'ล้าง',
      done: 'เสร็จสิ้น',
      hour: 'ชั่วโมง',
      minute: 'นาที',
      second: 'วินาที',
      meridiem: 'AM/PM',
      start: 'เริ่ม',
      end: 'สิ้นสุด'
    },
    alert: { dismiss: 'ปิด' },
    chat: {
      sending: 'กำลังส่ง',
      sent: 'ส่งแล้ว',
      delivered: 'ส่งถึงแล้ว',
      read: 'อ่านแล้ว',
      failed: 'ส่งไม่สำเร็จ',
      typing: 'กำลังพิมพ์'
    },
    spoiler: {
      reveal: 'แสดง',
      hide: 'ซ่อน',
      notice: 'ซ่อนไว้เพื่อไม่ให้อ่านโดยบังเอิญ'
    },
    pagination: {
      label: 'การแบ่งหน้า',
      page: 'หน้า {page}',
      status: 'หน้า {page} จาก {total}',
      previous: 'หน้าก่อนหน้า',
      next: 'หน้าถัดไป',
      first: 'หน้าแรก',
      last: 'หน้าสุดท้าย'
    },
    rating: {
      label: 'คะแนน',
      value: '{value} จาก {max}',
      empty: 'ยังไม่ได้ให้คะแนน'
    }
  }
};
