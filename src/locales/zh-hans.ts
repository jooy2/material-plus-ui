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
      thisMonth: '本月',
      thisYear: '今年',
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
    numberField: { increase: '增加', decrease: '减少' },
    carousel: {
      label: '轮播',
      previous: '上一张',
      next: '下一张',
      slide: '第 {index} 张，共 {total} 张'
    },
    scroll: { label: '可滚动内容', previous: '向后滚动', next: '向前滚动' },
    anchor: { label: '本页内容' },
    code: {
      copy: '复制',
      copied: '已复制',
      copyFailed: '复制失败',
      raw: '纯文本',
      label: '代码'
    },
    breadcrumb: { label: '面包屑导航', expand: '显示隐藏的层级' },
    combobox: { empty: '无匹配项', add: '添加“{label}”' },
    table: { empty: '暂无数据' },
    filePicker: { prompt: '将文件拖到此处，或点击选择' },
    textLink: { newTab: '在新标签页中打开' },
    overlay: { label: '遮罩层' },
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
    colorPicker: {
      area: '饱和度和明度',
      hue: '色相',
      alpha: '不透明度',
      value: '颜色值',
      swatches: '预设颜色',
      clear: '清除',
      empty: '无颜色'
    },
    transfer: {
      source: '可选',
      target: '已选',
      toTarget: '移到已选',
      toSource: '移回可选',
      search: '搜索',
      empty: '这里没有内容'
    },
    command: {
      label: '命令面板',
      search: '输入命令或搜索…',
      empty: '未找到命令'
    },
    layout: {
      skipToContent: '跳转到主要内容',
      sidebar: '侧边栏',
      openSidebar: '打开侧边栏',
      closeSidebar: '关闭侧边栏',
      resizeSidebar: '调整侧边栏宽度'
    },
    confirm: {
      confirm: '确认',
      cancel: '取消',
      ok: '好'
    }
  }
};
