/**
 * The frameworks Material Plus ships for, and the one axis of this site that is
 * not a language.
 *
 * A component page says the same things about `MPButton` whichever package a
 * reader installs: the same variants, the same sizes, the same reasons. Only the
 * code, the parameter names and the install line differ. So the two are not two
 * sites and not two folders. They are one page with the parts that differ marked
 * up, and this file is what marks them.
 *
 * Adding a framework is an entry here plus the `::: fw <id>` blocks on whatever
 * pages have something to say about it, and a mark in `FrameworkMark.vue`.
 */

export interface FrameworkInfo {
  id: string;
  /** What the sidebar's switch shows. */
  label: string;
  /** The package name in that ecosystem's registry. */
  pkg: string;
  /** The fence language its code samples are written in. */
  lang: string;
  /**
   * The brand's own colour, for the mark beside the label.
   *
   * The one place this site paints something that is neither its own nor the
   * library's: a logo in the wrong colour is a worse logo, and the mark is doing
   * the identifying here rather than decorating.
   */
  tint: string;
}

export const FRAMEWORKS: FrameworkInfo[] = [
  { id: 'react', label: 'React', pkg: 'material-plus-ui', lang: 'tsx', tint: '#149ECA' },
  { id: 'flutter', label: 'Flutter', pkg: 'material_plus_ui', lang: 'dart', tint: '#42A5F5' }
];

export type Framework = string;

export const FRAMEWORK_IDS: string[] = FRAMEWORKS.map((framework) => framework.id);

/**
 * The framework a reader who has not chosen sees.
 *
 * React, because every page on this site was written for it first, and because
 * a page whose Flutter half is not written yet still has a React half to show.
 */
export const DEFAULT_FRAMEWORK: Framework = 'react';

/**
 * Where the choice is remembered.
 *
 * Deliberately not in the URL. A reader who picked Flutter picked it for the
 * whole site, and a query string would have to be carried by every link on
 * every page, including the ones written by hand in the prose.
 */
export const FRAMEWORK_STORAGE_KEY = 'mp-framework';

/**
 * The choice, applied to `<html>` before the page paints.
 *
 * A blocking inline script in `<head>` rather than code in the app, for the
 * reason every no-flash theme switch is one: the framework decides which half of
 * a page is displayed, and a reader who picked Flutter would otherwise watch the
 * React half render and then disappear. A string, because it is inlined into
 * the document rather than imported.
 */
export const FRAMEWORK_HEAD_SCRIPT = `(function(){var i=${JSON.stringify(
  FRAMEWORK_IDS
)},v;try{v=localStorage.getItem(${JSON.stringify(
  FRAMEWORK_STORAGE_KEY
)})}catch(e){}document.documentElement.dataset.fw=i.indexOf(v)<0?${JSON.stringify(
  DEFAULT_FRAMEWORK
)}:v})()`;
