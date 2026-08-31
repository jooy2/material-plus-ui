/**
 * Japanese — 日本語.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { ja } from 'material-plus-ui/locales/ja';
 *
 *     registerMPMessages(ja);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const ja: MPLocale = {
  locale: 'ja',
  messages: {
    common: {
      close: '閉じる',
      clear: 'クリア',
      open: '開く',
      remove: '削除',
      removeNamed: '{label} を削除',
      loading: '読み込み中'
    },
    textField: { showPassword: 'パスワードを表示', hidePassword: 'パスワードを非表示' },
    empty: { title: '何もありません' },
    picker: {
      previousMonth: '前の月',
      nextMonth: '次の月',
      previousYear: '前の年',
      nextYear: '次の年',
      previousYears: '前の年の一覧',
      nextYears: '次の年の一覧',
      chooseMonth: '月を選択',
      chooseYear: '年を選択',
      today: '今日',
      thisMonth: '今月',
      thisYear: '今年',
      now: '現在',
      clear: 'クリア',
      done: '完了',
      hour: '時',
      minute: '分',
      second: '秒',
      meridiem: '午前/午後',
      start: '開始',
      end: '終了'
    },
    numberField: { increase: '増やす', decrease: '減らす' },
    carousel: {
      label: 'カルーセル',
      previous: '前のスライド',
      next: '次のスライド',
      slide: '{total} 枚中 {index} 枚目'
    },
    breadcrumb: { label: 'パンくずリスト', expand: '省略された階層を表示' },
    combobox: { empty: '一致するものがありません', add: '「{label}」を追加' },
    table: { empty: 'データがありません' },
    filePicker: { prompt: 'ここにファイルをドロップ、またはクリックして選択' },
    textLink: { newTab: '新しいタブで開きます' },
    overlay: { label: 'オーバーレイ' },
    alert: { dismiss: '閉じる' },
    chat: {
      sending: '送信中',
      sent: '送信済み',
      delivered: '配信済み',
      read: '既読',
      failed: '送信できませんでした',
      typing: '入力中'
    },
    spoiler: {
      reveal: '表示する',
      hide: '隠す',
      notice: 'うっかり読まないように隠してあります'
    },
    pagination: {
      label: 'ページ送り',
      page: '{page}ページ',
      status: '{total}ページ中{page}ページ',
      previous: '前のページ',
      next: '次のページ',
      first: '最初のページ',
      last: '最後のページ'
    },
    rating: {
      label: '評価',
      value: '{max}段階中{value}',
      empty: '未評価'
    },
    colorPicker: {
      area: '彩度と明度',
      hue: '色相',
      alpha: '不透明度',
      value: 'カラー値',
      swatches: 'プリセットの色',
      clear: 'クリア',
      empty: '色なし'
    },
    transfer: {
      source: '未選択',
      target: '選択済み',
      toTarget: '選択済みに移動',
      toSource: '未選択に戻す',
      search: '検索',
      empty: '項目がありません'
    },
    command: {
      label: 'コマンドパレット',
      search: 'コマンドを入力または検索…',
      empty: 'コマンドが見つかりません'
    },
    layout: {
      skipToContent: 'コンテンツへスキップ',
      sidebar: 'サイドバー',
      openSidebar: 'サイドバーを開く',
      closeSidebar: 'サイドバーを閉じる',
      resizeSidebar: 'サイドバーの幅を変更'
    },
    confirm: {
      confirm: '確認',
      cancel: 'キャンセル',
      ok: 'OK'
    }
  }
};
