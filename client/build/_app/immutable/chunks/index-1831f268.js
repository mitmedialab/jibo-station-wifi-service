function v(){}const dt=t=>t;function J(t,n){for(const e in n)t[e]=n[e];return t}function T(t){return t()}function M(){return Object.create(null)}function y(t){t.forEach(T)}function K(t){return typeof t=="function"}function _t(t,n){return t!=t?n==n:t!==n||t&&typeof t=="object"||typeof t=="function"}let x;function ht(t,n){return x||(x=document.createElement("a")),x.href=n,t===x.href}function Q(t){return Object.keys(t).length===0}function R(t,...n){if(t==null)return v;const e=t.subscribe(...n);return e.unsubscribe?()=>e.unsubscribe():e}function mt(t,n,e){t.$$.on_destroy.push(R(n,e))}function pt(t,n,e,i){if(t){const r=z(t,n,e,i);return t[0](r)}}function z(t,n,e,i){return t[1]&&i?J(e.ctx.slice(),t[1](i(n))):e.ctx}function yt(t,n,e,i){if(t[2]&&i){const r=t[2](i(e));if(n.dirty===void 0)return r;if(typeof r=="object"){const s=[],o=Math.max(n.dirty.length,r.length);for(let l=0;l<o;l+=1)s[l]=n.dirty[l]|r[l];return s}return n.dirty|r}return n.dirty}function bt(t,n,e,i,r,s){if(r){const o=z(n,e,i,s);t.p(o,r)}}function gt(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let i=0;i<e;i++)n[i]=-1;return n}return-1}const B=typeof window!="undefined";let xt=B?()=>window.performance.now():()=>Date.now(),L=B?t=>requestAnimationFrame(t):v;const _=new Set;function O(t){_.forEach(n=>{n.c(t)||(_.delete(n),n.f())}),_.size!==0&&L(O)}function $t(t){let n;return _.size===0&&L(O),{promise:new Promise(e=>{_.add(n={c:t,f:e})}),abort(){_.delete(n)}}}let k=!1;function U(){k=!0}function V(){k=!1}function X(t,n,e,i){for(;t<n;){const r=t+(n-t>>1);e(r)<=i?t=r+1:n=r}return t}function Y(t){if(t.hydrate_init)return;t.hydrate_init=!0;let n=t.childNodes;if(t.nodeName==="HEAD"){const c=[];for(let u=0;u<n.length;u++){const f=n[u];f.claim_order!==void 0&&c.push(f)}n=c}const e=new Int32Array(n.length+1),i=new Int32Array(n.length);e[0]=-1;let r=0;for(let c=0;c<n.length;c++){const u=n[c].claim_order,f=(r>0&&n[e[r]].claim_order<=u?r+1:X(1,r,g=>n[e[g]].claim_order,u))-1;i[c]=e[f]+1;const a=f+1;e[a]=c,r=Math.max(a,r)}const s=[],o=[];let l=n.length-1;for(let c=e[r]+1;c!=0;c=i[c-1]){for(s.push(n[c-1]);l>=c;l--)o.push(n[l]);l--}for(;l>=0;l--)o.push(n[l]);s.reverse(),o.sort((c,u)=>c.claim_order-u.claim_order);for(let c=0,u=0;c<o.length;c++){for(;u<s.length&&o[c].claim_order>=s[u].claim_order;)u++;const f=u<s.length?s[u]:null;t.insertBefore(o[c],f)}}function Z(t,n){if(k){for(Y(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;n!==t.actual_end_child?(n.claim_order!==void 0||n.parentNode!==t)&&t.insertBefore(n,t.actual_end_child):t.actual_end_child=n.nextSibling}else(n.parentNode!==t||n.nextSibling!==null)&&t.appendChild(n)}function wt(t,n,e){k&&!e?Z(t,n):(n.parentNode!==t||n.nextSibling!=e)&&t.insertBefore(n,e||null)}function tt(t){t.parentNode.removeChild(t)}function Et(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function nt(t){return document.createElement(t)}function et(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function j(t){return document.createTextNode(t)}function vt(){return j(" ")}function kt(){return j("")}function At(t,n,e,i){return t.addEventListener(n,e,i),()=>t.removeEventListener(n,e,i)}function St(t,n,e){e==null?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function it(t){return Array.from(t.childNodes)}function rt(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function F(t,n,e,i,r=!1){rt(t);const s=(()=>{for(let o=t.claim_info.last_index;o<t.length;o++){const l=t[o];if(n(l)){const c=e(l);return c===void 0?t.splice(o,1):t[o]=c,r||(t.claim_info.last_index=o),l}}for(let o=t.claim_info.last_index-1;o>=0;o--){const l=t[o];if(n(l)){const c=e(l);return c===void 0?t.splice(o,1):t[o]=c,r?c===void 0&&t.claim_info.last_index--:t.claim_info.last_index=o,l}}return i()})();return s.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,s}function H(t,n,e,i){return F(t,r=>r.nodeName===n,r=>{const s=[];for(let o=0;o<r.attributes.length;o++){const l=r.attributes[o];e[l.name]||s.push(l.name)}s.forEach(o=>r.removeAttribute(o))},()=>i(n))}function Nt(t,n,e){return H(t,n,e,nt)}function jt(t,n,e){return H(t,n,e,et)}function ct(t,n){return F(t,e=>e.nodeType===3,e=>{const i=""+n;if(e.data.startsWith(i)){if(e.data.length!==i.length)return e.splitText(i.length)}else e.data=i},()=>j(n),!0)}function Ct(t){return ct(t," ")}function qt(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function Mt(t,n){t.value=n==null?"":n}function Pt(t,n,e,i){e===null?t.style.removeProperty(n):t.style.setProperty(n,e,i?"important":"")}function ot(t,n,{bubbles:e=!1,cancelable:i=!1}={}){const r=document.createEvent("CustomEvent");return r.initCustomEvent(t,e,i,n),r}function Dt(t,n=document.body){return Array.from(n.querySelectorAll(t))}let p;function m(t){p=t}function b(){if(!p)throw new Error("Function called outside component initialization");return p}function Tt(t){b().$$.on_mount.push(t)}function zt(t){b().$$.after_update.push(t)}function Bt(t){b().$$.on_destroy.push(t)}function Lt(){const t=b();return(n,e,{cancelable:i=!1}={})=>{const r=t.$$.callbacks[n];if(r){const s=ot(n,e,{cancelable:i});return r.slice().forEach(o=>{o.call(t,s)}),!s.defaultPrevented}return!0}}function Ot(t,n){return b().$$.context.set(t,n),n}function Ft(t,n){const e=t.$$.callbacks[n.type];e&&e.slice().forEach(i=>i.call(this,n))}const h=[],P=[],w=[],D=[],I=Promise.resolve();let S=!1;function W(){S||(S=!0,I.then(G))}function Ht(){return W(),I}function N(t){w.push(t)}const A=new Set;let $=0;function G(){const t=p;do{for(;$<h.length;){const n=h[$];$++,m(n),lt(n.$$)}for(m(null),h.length=0,$=0;P.length;)P.pop()();for(let n=0;n<w.length;n+=1){const e=w[n];A.has(e)||(A.add(e),e())}w.length=0}while(h.length);for(;D.length;)D.pop()();S=!1,A.clear(),m(t)}function lt(t){if(t.fragment!==null){t.update(),y(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(N)}}const E=new Set;let d;function It(){d={r:0,c:[],p:d}}function Wt(){d.r||y(d.c),d=d.p}function ut(t,n){t&&t.i&&(E.delete(t),t.i(n))}function Gt(t,n,e,i){if(t&&t.o){if(E.has(t))return;E.add(t),d.c.push(()=>{E.delete(t),i&&(e&&t.d(1),i())}),t.o(n)}}function Jt(t,n){const e={},i={},r={$$scope:1};let s=t.length;for(;s--;){const o=t[s],l=n[s];if(l){for(const c in o)c in l||(i[c]=1);for(const c in l)r[c]||(e[c]=l[c],r[c]=1);t[s]=l}else for(const c in o)r[c]=1}for(const o in i)o in e||(e[o]=void 0);return e}function Kt(t){return typeof t=="object"&&t!==null?t:{}}function Qt(t){t&&t.c()}function Rt(t,n){t&&t.l(n)}function st(t,n,e,i){const{fragment:r,on_mount:s,on_destroy:o,after_update:l}=t.$$;r&&r.m(n,e),i||N(()=>{const c=s.map(T).filter(K);o?o.push(...c):y(c),t.$$.on_mount=[]}),l.forEach(N)}function at(t,n){const e=t.$$;e.fragment!==null&&(y(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function ft(t,n){t.$$.dirty[0]===-1&&(h.push(t),W(),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function Ut(t,n,e,i,r,s,o,l=[-1]){const c=p;m(t);const u=t.$$={fragment:null,ctx:null,props:s,update:v,not_equal:r,bound:M(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(c?c.$$.context:[])),callbacks:M(),dirty:l,skip_bound:!1,root:n.target||c.$$.root};o&&o(u.root);let f=!1;if(u.ctx=e?e(t,n.props||{},(a,g,...C)=>{const q=C.length?C[0]:g;return u.ctx&&r(u.ctx[a],u.ctx[a]=q)&&(!u.skip_bound&&u.bound[a]&&u.bound[a](q),f&&ft(t,a)),g}):[],u.update(),f=!0,y(u.before_update),u.fragment=i?i(u.ctx):!1,n.target){if(n.hydrate){U();const a=it(n.target);u.fragment&&u.fragment.l(a),a.forEach(tt)}else u.fragment&&u.fragment.c();n.intro&&ut(t.$$.fragment),st(t,n.target,n.anchor,n.customElement),V(),G()}m(c)}class Vt{$destroy(){at(this,1),this.$destroy=v}$on(n,e){const i=this.$$.callbacks[n]||(this.$$.callbacks[n]=[]);return i.push(e),()=>{const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}$set(n){this.$$set&&!Q(n)&&(this.$$.skip_bound=!0,this.$$set(n),this.$$.skip_bound=!1)}}export{Mt as $,Kt as A,at as B,J as C,Ht as D,v as E,pt as F,bt as G,gt as H,yt as I,Z as J,ht as K,Dt as L,xt as M,$t as N,dt as O,et as P,jt as Q,mt as R,Vt as S,At as T,Et as U,y as V,R as W,Ft as X,P as Y,Lt as Z,Bt as _,it as a,St as b,Nt as c,tt as d,nt as e,Pt as f,wt as g,ct as h,Ut as i,qt as j,vt as k,kt as l,Ct as m,It as n,Gt as o,Wt as p,ut as q,Ot as r,_t as s,j as t,zt as u,Tt as v,Qt as w,Rt as x,st as y,Jt as z};
