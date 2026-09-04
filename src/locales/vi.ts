/**
 * Vietnamese — Tiếng Việt.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { vi } from 'material-plus-ui/locales/vi';
 *
 *     registerMPMessages(vi);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const vi: MPLocale = {
  locale: 'vi',
  messages: {
    common: {
      close: 'Đóng',
      clear: 'Xóa',
      open: 'Mở',
      remove: 'Gỡ bỏ',
      removeNamed: 'Gỡ bỏ {label}',
      loading: 'Đang tải'
    },
    textField: { showPassword: 'Hiện mật khẩu', hidePassword: 'Ẩn mật khẩu' },
    empty: { title: 'Không có gì ở đây' },
    picker: {
      previousMonth: 'Tháng trước',
      nextMonth: 'Tháng sau',
      previousYear: 'Năm trước',
      nextYear: 'Năm sau',
      previousYears: 'Các năm trước',
      nextYears: 'Các năm sau',
      chooseMonth: 'Chọn tháng',
      chooseYear: 'Chọn năm',
      today: 'Hôm nay',
      thisMonth: 'Tháng này',
      thisYear: 'Năm nay',
      now: 'Bây giờ',
      clear: 'Xóa',
      done: 'Xong',
      hour: 'Giờ',
      minute: 'Phút',
      second: 'Giây',
      meridiem: 'SA/CH',
      start: 'Bắt đầu',
      end: 'Kết thúc'
    },
    numberField: { increase: 'Tăng', decrease: 'Giảm' },
    carousel: {
      label: 'Băng chuyền',
      previous: 'Trang trước',
      next: 'Trang sau',
      slide: 'Trang {index} trên {total}'
    },
    scroll: { label: 'Nội dung có thể cuộn', previous: 'Cuộn lùi', next: 'Cuộn tiếp' },
    anchor: { label: 'Trên trang này' },
    breadcrumb: { label: 'Đường dẫn', expand: 'Hiện các bước đã ẩn' },
    combobox: { empty: 'Không có kết quả', add: 'Thêm “{label}”' },
    table: { empty: 'Không có dữ liệu' },
    filePicker: { prompt: 'Thả tệp vào đây, hoặc bấm để chọn' },
    textLink: { newTab: 'Mở trong tab mới' },
    overlay: { label: 'Lớp phủ' },
    alert: { dismiss: 'Đóng' },
    chat: {
      sending: 'Đang gửi',
      sent: 'Đã gửi',
      delivered: 'Đã nhận',
      read: 'Đã đọc',
      failed: 'Chưa gửi được',
      typing: 'Đang nhập'
    },
    spoiler: {
      reveal: 'Hiện',
      hide: 'Ẩn',
      notice: 'Đã ẩn để không vô tình đọc phải'
    },
    pagination: {
      label: 'Phân trang',
      page: 'Trang {page}',
      status: 'Trang {page} trên {total}',
      previous: 'Trang trước',
      next: 'Trang sau',
      first: 'Trang đầu',
      last: 'Trang cuối'
    },
    rating: {
      label: 'Đánh giá',
      value: '{value} trên {max}',
      empty: 'Chưa đánh giá'
    },
    colorPicker: {
      area: 'Độ bão hòa và độ sáng',
      hue: 'Sắc độ',
      alpha: 'Độ mờ đục',
      value: 'Giá trị màu',
      swatches: 'Màu dựng sẵn',
      clear: 'Xóa',
      empty: 'Không có màu'
    },
    transfer: {
      source: 'Có sẵn',
      target: 'Đã chọn',
      toTarget: 'Chuyển sang đã chọn',
      toSource: 'Trả về có sẵn',
      search: 'Tìm kiếm',
      empty: 'Không có gì ở đây'
    },
    command: {
      label: 'Bảng lệnh',
      search: 'Nhập lệnh hoặc tìm kiếm…',
      empty: 'Không tìm thấy lệnh'
    },
    layout: {
      skipToContent: 'Chuyển đến nội dung',
      sidebar: 'Thanh bên',
      openSidebar: 'Mở thanh bên',
      closeSidebar: 'Đóng thanh bên',
      resizeSidebar: 'Đổi chiều rộng thanh bên'
    },
    confirm: {
      confirm: 'Xác nhận',
      cancel: 'Huỷ',
      ok: 'OK'
    }
  }
};
