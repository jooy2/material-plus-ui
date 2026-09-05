/**
 * Russian — Русский.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { ru } from 'material-plus-ui/locales/ru';
 *
 *     registerMPMessages(ru);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const ru: MPLocale = {
  locale: 'ru',
  messages: {
    common: {
      close: 'Закрыть',
      clear: 'Очистить',
      open: 'Открыть',
      remove: 'Удалить',
      removeNamed: 'Удалить {label}',
      loading: 'Загрузка'
    },
    textField: { showPassword: 'Показать пароль', hidePassword: 'Скрыть пароль' },
    empty: { title: 'Здесь ничего нет' },
    picker: {
      previousMonth: 'Предыдущий месяц',
      nextMonth: 'Следующий месяц',
      previousYear: 'Предыдущий год',
      nextYear: 'Следующий год',
      previousYears: 'Предыдущие годы',
      nextYears: 'Следующие годы',
      chooseMonth: 'Выбрать месяц',
      chooseYear: 'Выбрать год',
      today: 'Сегодня',
      thisMonth: 'Текущий месяц',
      thisYear: 'Текущий год',
      now: 'Сейчас',
      clear: 'Очистить',
      done: 'Готово',
      hour: 'Часы',
      minute: 'Минуты',
      second: 'Секунды',
      meridiem: 'ДП/ПП',
      start: 'Начало',
      end: 'Конец'
    },
    numberField: { increase: 'Увеличить', decrease: 'Уменьшить' },
    carousel: {
      label: 'Карусель',
      previous: 'Предыдущий слайд',
      next: 'Следующий слайд',
      slide: 'Слайд {index} из {total}'
    },
    scroll: {
      label: 'Прокручиваемое содержимое',
      previous: 'Прокрутить назад',
      next: 'Прокрутить вперёд'
    },
    anchor: { label: 'На этой странице' },
    code: {
      copy: 'Копировать',
      copied: 'Скопировано',
      copyFailed: 'Не удалось скопировать',
      raw: 'Без подсветки',
      label: 'Код'
    },
    breadcrumb: { label: 'Навигационная цепочка', expand: 'Показать скрытые шаги' },
    combobox: { empty: 'Совпадений нет', add: 'Добавить «{label}»' },
    tour: {
      previous: 'Назад',
      next: 'Далее',
      done: 'Готово',
      skip: 'Пропустить',
      position: 'Шаг {index} из {total}'
    },
    chart: { label: 'Диаграмма', table: 'Данные диаграммы', category: 'Категория' },
    sparkline: { summary: 'Точек: {count}, от {first} до {last}' },
    table: { empty: 'Нет данных' },
    dataTable: {
      selectAll: 'Выбрать все строки',
      selectRow: 'Выбрать строку',
      total: 'Строк: {total}',
      selected: 'Выбрано: {count}',
      download: 'Скачать CSV',
      perPage: 'Строк на странице',
      resize: 'Изменить ширину столбца'
    },
    filePicker: { prompt: 'Перетащите файлы сюда или нажмите, чтобы выбрать' },
    textLink: { newTab: 'Откроется в новой вкладке' },
    overlay: { label: 'Наложение' },
    alert: { dismiss: 'Закрыть' },
    chat: {
      sending: 'Отправка',
      sent: 'Отправлено',
      delivered: 'Доставлено',
      read: 'Прочитано',
      failed: 'Не отправлено',
      typing: 'Печатает'
    },
    spoiler: {
      reveal: 'Показать',
      hide: 'Скрыть',
      notice: 'Скрыто, чтобы не прочитать случайно'
    },
    pagination: {
      label: 'Постраничная навигация',
      page: 'Страница {page}',
      status: 'Страница {page} из {total}',
      previous: 'Предыдущая страница',
      next: 'Следующая страница',
      first: 'Первая страница',
      last: 'Последняя страница'
    },
    rating: {
      label: 'Оценка',
      value: '{value} из {max}',
      empty: 'Без оценки'
    },
    colorPicker: {
      area: 'Насыщенность и яркость',
      hue: 'Оттенок',
      alpha: 'Непрозрачность',
      value: 'Значение цвета',
      swatches: 'Готовые цвета',
      clear: 'Очистить',
      empty: 'Без цвета'
    },
    transfer: {
      source: 'Доступные',
      target: 'Выбранные',
      toTarget: 'Переместить в выбранные',
      toSource: 'Вернуть в доступные',
      search: 'Поиск',
      empty: 'Здесь пусто'
    },
    command: {
      label: 'Палитра команд',
      search: 'Введите команду или поиск…',
      empty: 'Команды не найдены'
    },
    layout: {
      skipToContent: 'Перейти к содержимому',
      sidebar: 'Боковая панель',
      openSidebar: 'Открыть боковую панель',
      closeSidebar: 'Закрыть боковую панель',
      resizeSidebar: 'Изменить ширину боковой панели'
    },
    confirm: {
      confirm: 'Подтвердить',
      cancel: 'Отмена',
      ok: 'ОК'
    }
  }
};
