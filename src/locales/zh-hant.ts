/**
 * Chinese, Traditional — 繁體中文.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { zhHant } from 'material-plus-ui/locales/zh-hant';
 *
 *     registerMPMessages(zhHant);
 *
 * Anything this table leaves out falls back to English, a namespace at a time. *
 * The regional tags are aliases rather than entries of their own: they are
 * the same characters, and a reader asking for one of them is asking for
 * this table.
 */
import type { MPLocale } from '../internal/i18n';

export const zhHant: MPLocale = {
  locale: 'zh-hant',
  aliases: ['zh-TW', 'zh-HK', 'zh-MO'],
  messages: {
    common: {
      close: '關閉',
      clear: '清除',
      open: '開啟',
      remove: '移除',
      removeNamed: '移除 {label}',
      loading: '載入中'
    },
    textField: { showPassword: '顯示密碼', hidePassword: '隱藏密碼' },
    empty: { title: '暫無內容' },
    picker: {
      previousMonth: '上個月',
      nextMonth: '下個月',
      previousYear: '上一年',
      nextYear: '下一年',
      previousYears: '上一頁年份',
      nextYears: '下一頁年份',
      chooseMonth: '選擇月份',
      chooseYear: '選擇年份',
      today: '今天',
      now: '此刻',
      clear: '清除',
      done: '完成',
      hour: '小時',
      minute: '分鐘',
      second: '秒',
      meridiem: '上午/下午',
      start: '開始',
      end: '結束'
    },
    alert: { dismiss: '關閉' },
    chat: {
      sending: '傳送中',
      sent: '已傳送',
      delivered: '已送達',
      read: '已讀',
      failed: '未傳送',
      typing: '正在輸入'
    },
    spoiler: {
      reveal: '顯示',
      hide: '隱藏',
      notice: '已隱藏，以免不小心讀到'
    },
    pagination: {
      label: '分頁',
      page: '第 {page} 頁',
      status: '第 {page} 頁，共 {total} 頁',
      previous: '上一頁',
      next: '下一頁',
      first: '第一頁',
      last: '最後一頁'
    },
    rating: {
      label: '評分',
      value: '{max} 分中的 {value} 分',
      empty: '未評分'
    },
    transfer: {
      source: '可選',
      target: '已選',
      toTarget: '移到已選',
      toSource: '移回可選',
      search: '搜尋',
      empty: '這裡沒有內容'
    },
    layout: {
      skipToContent: '跳至主要內容',
      sidebar: '側邊欄',
      openSidebar: '開啟側邊欄',
      closeSidebar: '關閉側邊欄',
      resizeSidebar: '調整側邊欄寬度'
    }
  }
};
