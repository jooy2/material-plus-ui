import{r as c}from"./index.BC-ZOPMe.js";/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=t=>t==null?void 0:t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function E(t,e,i=[]){if(e==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:B(t),size:24,node:e,...i.length>0?{aliases:i}:{}}}/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=t=>{let e="",i=!1;for(const o of t){if(o==="-"||o==="_"||o<=" "){i=e.length>0;continue}e.length===0?e+=o.toLowerCase():e+=i?o.toUpperCase():o,i=!1}return e};/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=t=>{const e=I(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=(...t)=>t.filter((e,i,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===i).join(" ").trim();/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function S(t){return t!=null}function j(t,e={}){var b,w;const i=e.attributeNames??{},o=n=>i[n]??n,l=t.size??t.width??r.width,h=t.size??t.height??r.height,a=((b=t.aliases)==null?void 0:b.filter(n=>typeof n=="string"&&n.trim()!=="").map(n=>`lucide-${n}`))??[],f=[...t.name?[`lucide-${t.name}`]:[],...a],s=((w=e.className)==null?void 0:w.split(" ").filter(Boolean))??[],k=e.includeDefaultClasses===!1?m(...s):m("lucide",...f,...s),x=e.absoluteStrokeWidth?Number(e.strokeWidth??r["stroke-width"])*Number(t.size??t.width??r.width)/Number(e.size??e.width??r.width):e.strokeWidth??r["stroke-width"];return["svg",{...Object.entries(r).reduce((n,[u,d])=>(n[o(u)]=d,n),{}),..."color"in e&&e.color&&{[o("stroke")]:e.color},..."size"in e&&S(e.size)&&{[o("width")]:e.size,[o("height")]:e.size},..."width"in e&&S(e.width)&&{[o("width")]:e.width},..."height"in e&&S(e.height)&&{[o("height")]:e.height},[o("stroke-width")]:x,...k&&{[o("class")]:k},[o("viewBox")]:`0 0 ${l} ${h}`,...e.hasA11yProp===!1?{[o("aria-hidden")]:"true"}:{},..."attributes"in e&&e.attributes},t.node.map(n=>{const[u,d,g]=n,C=e.nonScalingStroke?{[o("vector-effect")]:"non-scaling-stroke",...d}:d;return g?[u,C,g]:[u,C]})]}/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function P(t,e={}){return j(t,{...e,attributeNames:{...e.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},R=c.createContext({}),D=()=>c.useContext(R),F=c.forwardRef(({color:t,size:e,width:i,height:o,strokeWidth:l,absoluteStrokeWidth:h,nonScalingStroke:a,className:f="",children:s,iconNode:k=[],icon:x={node:k,aliases:[],size:24},...N},b)=>{const{size:w=24,strokeWidth:n=2,absoluteStrokeWidth:u=!1,nonScalingStroke:d=!1,color:g="currentColor",className:C=""}=D()??{},A=!!s||p(N),[W,z,v=[]]=P(x,{color:t??g,width:i??e??w,height:o??e??w,strokeWidth:l??n,absoluteStrokeWidth:h??u,nonScalingStroke:a??d,className:m(C,f),hasA11yProp:A,attributes:N});return c.createElement(W,{ref:b,...z},[...v.map(([L,y])=>c.createElement(L,y)),...Array.isArray(s)?s:[s]])});/**
 * @license lucide-react v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function q(t,e=[],i=[]){const o=typeof t=="string"?E(t,e,i):t,l=c.forwardRef(({className:h,...a},f)=>c.createElement(F,{ref:f,icon:o,className:h,...a}));return o.name&&(l.displayName=$(o.name)),l}export{q as c};
