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
    }
  }
};
