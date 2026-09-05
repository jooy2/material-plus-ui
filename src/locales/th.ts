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
      thisMonth: 'เดือนนี้',
      thisYear: 'ปีนี้',
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
    numberField: { increase: 'เพิ่ม', decrease: 'ลด' },
    carousel: {
      label: 'ภาพสไลด์',
      previous: 'สไลด์ก่อนหน้า',
      next: 'สไลด์ถัดไป',
      slide: 'สไลด์ {index} จาก {total}'
    },
    scroll: { label: 'เนื้อหาที่เลื่อนได้', previous: 'เลื่อนกลับ', next: 'เลื่อนไปข้างหน้า' },
    anchor: { label: 'ในหน้านี้' },
    code: {
      copy: 'คัดลอก',
      copied: 'คัดลอกแล้ว',
      copyFailed: 'คัดลอกไม่สำเร็จ',
      raw: 'ข้อความล้วน',
      label: 'โค้ด'
    },
    breadcrumb: { label: 'เส้นทางนำทาง', expand: 'แสดงขั้นตอนที่ซ่อนอยู่' },
    combobox: { empty: 'ไม่พบรายการที่ตรงกัน', add: 'เพิ่ม “{label}”' },
    tour: {
      previous: 'ย้อนกลับ',
      next: 'ถัดไป',
      done: 'เสร็จสิ้น',
      skip: 'ข้าม',
      position: 'ขั้นตอนที่ {index} จาก {total}'
    },
    sparkline: { summary: '{count} จุด จาก {first} ถึง {last}' },
    table: { empty: 'ไม่มีข้อมูล' },
    dataTable: {
      selectAll: 'เลือกทุกแถว',
      selectRow: 'เลือกแถว',
      total: '{total} แถว',
      selected: 'เลือกแล้ว {count}',
      download: 'ดาวน์โหลด CSV',
      perPage: 'จำนวนแถวต่อหน้า',
      resize: 'ปรับความกว้างคอลัมน์'
    },
    filePicker: { prompt: 'วางไฟล์ที่นี่ หรือคลิกเพื่อเลือก' },
    textLink: { newTab: 'เปิดในแท็บใหม่' },
    overlay: { label: 'เลเยอร์ซ้อน' },
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
    },
    colorPicker: {
      area: 'ความอิ่มตัวและความสว่าง',
      hue: 'เฉดสี',
      alpha: 'ความทึบ',
      value: 'ค่าสี',
      swatches: 'สีที่กำหนดไว้',
      clear: 'ล้าง',
      empty: 'ไม่มีสี'
    },
    transfer: {
      source: 'ที่มีอยู่',
      target: 'ที่เลือก',
      toTarget: 'ย้ายไปที่เลือก',
      toSource: 'ย้ายกลับไปที่มีอยู่',
      search: 'ค้นหา',
      empty: 'ไม่มีรายการ'
    },
    command: {
      label: 'แผงคำสั่ง',
      search: 'พิมพ์คำสั่งหรือค้นหา…',
      empty: 'ไม่พบคำสั่ง'
    },
    layout: {
      skipToContent: 'ข้ามไปยังเนื้อหา',
      sidebar: 'แถบด้านข้าง',
      openSidebar: 'เปิดแถบด้านข้าง',
      closeSidebar: 'ปิดแถบด้านข้าง',
      resizeSidebar: 'ปรับความกว้างแถบด้านข้าง'
    },
    confirm: {
      confirm: 'ยืนยัน',
      cancel: 'ยกเลิก',
      ok: 'ตกลง'
    }
  }
};
