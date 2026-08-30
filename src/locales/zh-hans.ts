/**
 * Chinese, Simplified — 简体中文.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { zhHans } from 'material-plus-ui/locales/zh-hans';
 *
 *     registerMPMessages(zhHans);
 *
 * Anything this table leaves out falls back to English, a namespace at a time. *
 * The regional tags are aliases rather than entries of their own: they are
 * the same characters, and a reader asking for one of them is asking for
 * this table.
 *   had to pick one has picked.
 */
import type { MPLocale } from '../internal/i18n';

export const zhHans: MPLocale = {
  locale: 'zh-hans',
  aliases: ['zh', 'zh-CN', 'zh-MY', 'zh-SG'],
  messages: {
    common: {
      close: '关闭',
      clear: '清除',
      open: '打开',
      remove: '移除',
      removeNamed: '移除 {label}',
      loading: '加载中'
    },
    textField: { showPassword: '显示密码', hidePassword: '隐藏密码' },
    empty: { title: '暂无内容' },
    picker: {
      previousMonth: '上个月',
      nextMonth: '下个月',
      previousYear: '上一年',
      nextYear: '下一年',
      previousYears: '上一页年份',
      nextYears: '下一页年份',
      chooseMonth: '选择月份',
      chooseYear: '选择年份',
      today: '今天',
      now: '此刻',
      clear: '清除',
      done: '完成',
      hour: '小时',
      minute: '分钟',
      second: '秒',
      meridiem: '上午/下午',
      start: '开始',
      end: '结束'
    },
    alert: { dismiss: '关闭' },
    chat: {
      sending: '发送中',
      sent: '已发送',
      delivered: '已送达',
      read: '已读',
      failed: '未发送',
      typing: '正在输入'
    },
    spoiler: {
      reveal: '显示',
      hide: '隐藏',
      notice: '已隐藏，以免不小心读到'
    },
    pagination: {
      label: '分页',
      page: '第 {page} 页',
      status: '第 {page} 页，共 {total} 页',
      previous: '上一页',
      next: '下一页',
      first: '第一页',
      last: '最后一页'
    },
    rating: {
      label: '评分',
      value: '{max} 分中的 {value} 分',
      empty: '未评分'
    },
    layout: { skipToContent: '跳转到主要内容' }
  }
};
