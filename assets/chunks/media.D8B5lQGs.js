const i=new Map;function e(t){if(typeof window>"u"||!window.matchMedia)return null;let n=i.get(t);return n||(n=window.matchMedia(t),i.set(t,n)),n}export{e as m};
