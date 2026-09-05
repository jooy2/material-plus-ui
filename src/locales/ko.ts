/**
 * Korean — 한국어.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { ko } from 'material-plus-ui/locales/ko';
 *
 *     registerMPMessages(ko);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const ko: MPLocale = {
  locale: 'ko',
  messages: {
    common: {
      close: '닫기',
      clear: '지우기',
      open: '열기',
      remove: '제거',
      removeNamed: '{label} 제거',
      loading: '불러오는 중'
    },
    textField: { showPassword: '비밀번호 표시', hidePassword: '비밀번호 숨기기' },
    empty: { title: '아무것도 없습니다' },
    picker: {
      previousMonth: '이전 달',
      nextMonth: '다음 달',
      previousYear: '이전 해',
      nextYear: '다음 해',
      previousYears: '이전 연도 목록',
      nextYears: '다음 연도 목록',
      chooseMonth: '월 선택',
      chooseYear: '연도 선택',
      today: '오늘',
      thisMonth: '이번 달',
      thisYear: '올해',
      now: '지금',
      clear: '지우기',
      done: '완료',
      hour: '시',
      minute: '분',
      second: '초',
      meridiem: '오전/오후',
      start: '시작',
      end: '종료'
    },
    numberField: { increase: '늘리기', decrease: '줄이기' },
    carousel: {
      label: '캐러셀',
      previous: '이전 슬라이드',
      next: '다음 슬라이드',
      slide: '슬라이드 {total}개 중 {index}번째'
    },
    scroll: { label: '스크롤 영역', previous: '뒤로 스크롤', next: '앞으로 스크롤' },
    anchor: { label: '이 페이지의 목차' },
    code: {
      copy: '복사',
      copied: '복사했습니다',
      copyFailed: '복사하지 못했습니다',
      raw: '원본 보기',
      label: '코드'
    },
    breadcrumb: { label: '탐색 경로', expand: '숨겨진 단계 보기' },
    combobox: { empty: '일치하는 항목이 없습니다', add: '“{label}” 추가' },
    table: { empty: '데이터가 없습니다' },
    dataTable: {
      selectAll: '모든 행 선택',
      selectRow: '행 선택',
      total: '{total}개 행',
      selected: '{count}개 선택됨',
      download: 'CSV 내려받기',
      perPage: '페이지당 행 수',
      resize: '열 너비 조절'
    },
    filePicker: { prompt: '여기에 파일을 놓거나 클릭해서 찾아보세요' },
    textLink: { newTab: '새 탭에서 열림' },
    overlay: { label: '오버레이' },
    alert: { dismiss: '닫기' },
    chat: {
      sending: '보내는 중',
      sent: '보냄',
      delivered: '전달됨',
      read: '읽음',
      failed: '전송 실패',
      typing: '입력 중'
    },
    spoiler: {
      reveal: '보기',
      hide: '가리기',
      notice: '실수로 읽지 않도록 가려 두었습니다'
    },
    pagination: {
      label: '페이지 매기기',
      page: '{page}페이지',
      status: '{total}페이지 중 {page}페이지',
      previous: '이전 페이지',
      next: '다음 페이지',
      first: '첫 페이지',
      last: '마지막 페이지'
    },
    rating: {
      label: '별점',
      value: '{max}점 만점에 {value}점',
      empty: '평가 없음'
    },
    colorPicker: {
      area: '채도와 명도',
      hue: '색상',
      alpha: '불투명도',
      value: '색상 값',
      swatches: '기본 색상',
      clear: '지우기',
      empty: '색상 없음'
    },
    transfer: {
      source: '선택 가능',
      target: '선택함',
      toTarget: '선택함으로 이동',
      toSource: '선택 가능으로 되돌리기',
      search: '검색',
      empty: '항목이 없습니다'
    },
    command: {
      label: '명령 팔레트',
      search: '명령을 입력하거나 검색하세요…',
      empty: '명령을 찾을 수 없습니다'
    },
    layout: {
      skipToContent: '본문으로 건너뛰기',
      sidebar: '사이드바',
      openSidebar: '사이드바 열기',
      closeSidebar: '사이드바 닫기',
      resizeSidebar: '사이드바 너비 조절'
    },
    confirm: {
      confirm: '확인',
      cancel: '취소',
      ok: '확인'
    }
  }
};
