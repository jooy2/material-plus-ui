/**
 * Spanish — Español.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { es } from 'material-plus-ui/locales/es';
 *
 *     registerMPMessages(es);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const es: MPLocale = {
  locale: 'es',
  messages: {
    common: {
      close: 'Cerrar',
      clear: 'Borrar',
      open: 'Abrir',
      remove: 'Quitar',
      removeNamed: 'Quitar {label}',
      loading: 'Cargando'
    },
    textField: { showPassword: 'Mostrar la contraseña', hidePassword: 'Ocultar la contraseña' },
    empty: { title: 'No hay nada aquí' },
    picker: {
      previousMonth: 'Mes anterior',
      nextMonth: 'Mes siguiente',
      previousYear: 'Año anterior',
      nextYear: 'Año siguiente',
      previousYears: 'Años anteriores',
      nextYears: 'Años siguientes',
      chooseMonth: 'Elegir un mes',
      chooseYear: 'Elegir un año',
      today: 'Hoy',
      thisMonth: 'Este mes',
      thisYear: 'Este año',
      now: 'Ahora',
      clear: 'Borrar',
      done: 'Listo',
      hour: 'Hora',
      minute: 'Minuto',
      second: 'Segundo',
      meridiem: 'a. m./p. m.',
      start: 'Inicio',
      end: 'Fin'
    },
    numberField: { increase: 'Aumentar', decrease: 'Disminuir' },
    carousel: {
      label: 'Carrusel',
      previous: 'Diapositiva anterior',
      next: 'Diapositiva siguiente',
      slide: 'Diapositiva {index} de {total}'
    },
    scroll: {
      label: 'Contenido desplazable',
      previous: 'Desplazar hacia atrás',
      next: 'Desplazar hacia delante'
    },
    anchor: { label: 'En esta página' },
    code: {
      copy: 'Copiar',
      copied: 'Copiado',
      copyFailed: 'No se pudo copiar',
      raw: 'Sin formato',
      label: 'Código'
    },
    breadcrumb: { label: 'Ruta de navegación', expand: 'Mostrar los pasos ocultos' },
    combobox: { empty: 'Sin coincidencias', add: 'Añadir «{label}»' },
    tour: {
      previous: 'Atrás',
      next: 'Siguiente',
      done: 'Listo',
      skip: 'Omitir',
      position: 'Paso {index} de {total}'
    },
    sparkline: { summary: '{count} puntos, de {first} a {last}' },
    table: { empty: 'Sin datos' },
    dataTable: {
      selectAll: 'Seleccionar todas las filas',
      selectRow: 'Seleccionar fila',
      total: 'Filas: {total}',
      selected: 'Seleccionadas: {count}',
      download: 'Descargar CSV',
      perPage: 'Filas por página',
      resize: 'Cambiar el ancho de la columna'
    },
    filePicker: { prompt: 'Suelta los archivos aquí o haz clic para buscarlos' },
    textLink: { newTab: 'Se abre en una pestaña nueva' },
    overlay: { label: 'Superposición' },
    alert: { dismiss: 'Cerrar' },
    chat: {
      sending: 'Enviando',
      sent: 'Enviado',
      delivered: 'Entregado',
      read: 'Leído',
      failed: 'No enviado',
      typing: 'Escribiendo'
    },
    spoiler: {
      reveal: 'Mostrar',
      hide: 'Ocultar',
      notice: 'Oculto para que no se lea por accidente'
    },
    pagination: {
      label: 'Paginación',
      page: 'Página {page}',
      status: 'Página {page} de {total}',
      previous: 'Página anterior',
      next: 'Página siguiente',
      first: 'Primera página',
      last: 'Última página'
    },
    rating: {
      label: 'Valoración',
      value: '{value} de {max}',
      empty: 'Sin valorar'
    },
    colorPicker: {
      area: 'Saturación y brillo',
      hue: 'Tono',
      alpha: 'Opacidad',
      value: 'Valor del color',
      swatches: 'Colores predefinidos',
      clear: 'Borrar',
      empty: 'Sin color'
    },
    transfer: {
      source: 'Disponibles',
      target: 'Seleccionados',
      toTarget: 'Mover a seleccionados',
      toSource: 'Devolver a disponibles',
      search: 'Buscar',
      empty: 'No hay nada'
    },
    command: {
      label: 'Paleta de comandos',
      search: 'Escribe un comando o busca…',
      empty: 'No se encontraron comandos'
    },
    layout: {
      skipToContent: 'Saltar al contenido',
      sidebar: 'Barra lateral',
      openSidebar: 'Abrir barra lateral',
      closeSidebar: 'Cerrar barra lateral',
      resizeSidebar: 'Cambiar el ancho de la barra lateral'
    },
    confirm: {
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      ok: 'Aceptar'
    }
  }
};
