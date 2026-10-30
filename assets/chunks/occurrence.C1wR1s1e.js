function u(c,r){const n=new Map,t=new Map;for(const o of c){const e=String(r(o)),s=n.get(e)??0;n.set(e,s+1),t.set(o,`${s}:${e}`)}return t}export{u as o};
