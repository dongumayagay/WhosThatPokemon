function y(){}const z=t=>t;function ht(t,e){for(const n in e)t[n]=e[n];return t}function Z(t){return t()}function tt(){return Object.create(null)}function w(t){t.forEach(Z)}function M(t){return typeof t=="function"}function mt(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}let q;function Wt(t,e){return q||(q=document.createElement("a")),q.href=e,t===q.href}function pt(t){return Object.keys(t).length===0}function et(t,...e){if(t==null)return y;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function Bt(t){let e;return et(t,n=>e=n)(),e}function Ft(t,e,n){t.$$.on_destroy.push(et(e,n))}function It(t,e,n,i){if(t){const r=nt(t,e,n,i);return t[0](r)}}function nt(t,e,n,i){return t[1]&&i?ht(n.ctx.slice(),t[1](i(e))):n.ctx}function Ht(t,e,n,i){if(t[2]&&i){const r=t[2](i(n));if(e.dirty===void 0)return r;if(typeof r=="object"){const c=[],s=Math.max(e.dirty.length,r.length);for(let l=0;l<s;l+=1)c[l]=e.dirty[l]|r[l];return c}return e.dirty|r}return e.dirty}function Gt(t,e,n,i,r,c){if(r){const s=nt(e,n,i,c);t.p(s,r)}}function Jt(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}function Kt(t,e,n){return t.set(n),e}const it=typeof window!="undefined";let F=it?()=>window.performance.now():()=>Date.now(),I=it?t=>requestAnimationFrame(t):y;const k=new Set;function rt(t){k.forEach(e=>{e.c(t)||(k.delete(e),e.f())}),k.size!==0&&I(rt)}function H(t){let e;return k.size===0&&I(rt),{promise:new Promise(n=>{k.add(e={c:t,f:n})}),abort(){k.delete(e)}}}let O=!1;function yt(){O=!0}function gt(){O=!1}function bt(t,e,n,i){for(;t<e;){const r=t+(e-t>>1);n(r)<=i?t=r+1:e=r}return t}function xt(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const o=[];for(let u=0;u<e.length;u++){const _=e[u];_.claim_order!==void 0&&o.push(_)}e=o}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let r=0;for(let o=0;o<e.length;o++){const u=e[o].claim_order,_=(r>0&&e[n[r]].claim_order<=u?r+1:bt(1,r,a=>e[n[a]].claim_order,u))-1;i[o]=n[_]+1;const f=_+1;n[f]=o,r=Math.max(f,r)}const c=[],s=[];let l=e.length-1;for(let o=n[r]+1;o!=0;o=i[o-1]){for(c.push(e[o-1]);l>=o;l--)s.push(e[l]);l--}for(;l>=0;l--)s.push(e[l]);c.reverse(),s.sort((o,u)=>o.claim_order-u.claim_order);for(let o=0,u=0;o<s.length;o++){for(;u<c.length&&s[o].claim_order>=c[u].claim_order;)u++;const _=u<c.length?c[u]:null;t.insertBefore(s[o],_)}}function st(t,e){t.appendChild(e)}function ot(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function $t(t){const e=G("style");return wt(ot(t),e),e}function wt(t,e){st(t.head||t,e)}function vt(t,e){if(O){for(xt(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function Qt(t,e,n){O&&!n?vt(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function ct(t){t.parentNode.removeChild(t)}function Ut(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function G(t){return document.createElement(t)}function J(t){return document.createTextNode(t)}function Vt(){return J(" ")}function Xt(){return J("")}function lt(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function Yt(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function Zt(t,e,n){const i=new Set;for(let r=0;r<t.length;r+=1)t[r].checked&&i.add(t[r].__value);return n||i.delete(e),Array.from(i)}function kt(t){return Array.from(t.childNodes)}function Et(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function ut(t,e,n,i,r=!1){Et(t);const c=(()=>{for(let s=t.claim_info.last_index;s<t.length;s++){const l=t[s];if(e(l)){const o=n(l);return o===void 0?t.splice(s,1):t[s]=o,r||(t.claim_info.last_index=s),l}}for(let s=t.claim_info.last_index-1;s>=0;s--){const l=t[s];if(e(l)){const o=n(l);return o===void 0?t.splice(s,1):t[s]=o,r?o===void 0&&t.claim_info.last_index--:t.claim_info.last_index=s,l}}return i()})();return c.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,c}function St(t,e,n,i){return ut(t,r=>r.nodeName===e,r=>{const c=[];for(let s=0;s<r.attributes.length;s++){const l=r.attributes[s];n[l.name]||c.push(l.name)}c.forEach(s=>r.removeAttribute(s))},()=>i(e))}function te(t,e,n){return St(t,e,n,G)}function At(t,e){return ut(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>J(e),!0)}function ee(t){return At(t," ")}function ne(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function ie(t,e,n,i){t.style.setProperty(e,n,i?"important":"")}let R;function Ct(){if(R===void 0){R=!1;try{typeof window!="undefined"&&window.parent&&window.parent.document}catch{R=!0}}return R}function re(t,e){getComputedStyle(t).position==="static"&&(t.style.position="relative");const i=G("iframe");i.setAttribute("style","display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"),i.setAttribute("aria-hidden","true"),i.tabIndex=-1;const r=Ct();let c;return r?(i.src="data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>",c=lt(window,"message",s=>{s.source===i.contentWindow&&e()})):(i.src="about:blank",i.onload=()=>{c=lt(i.contentWindow,"resize",e)}),st(t,i),()=>{(r||c&&i.contentWindow)&&c(),ct(i)}}function se(t,e,n){t.classList[n?"add":"remove"](e)}function Nt(t,e,n=!1){const i=document.createEvent("CustomEvent");return i.initCustomEvent(t,n,!1,e),i}const K=new Set;let D=0;function jt(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}function L(t,e,n,i,r,c,s,l=0){const o=16.666/i;let u=`{
`;for(let m=0;m<=1;m+=o){const b=e+(n-e)*c(m);u+=m*100+`%{${s(b,1-b)}}
`}const _=u+`100% {${s(n,1-n)}}
}`,f=`__svelte_${jt(_)}_${l}`,a=ot(t);K.add(a);const d=a.__svelte_stylesheet||(a.__svelte_stylesheet=$t(t).sheet),h=a.__svelte_rules||(a.__svelte_rules={});h[f]||(h[f]=!0,d.insertRule(`@keyframes ${f} ${_}`,d.cssRules.length));const p=t.style.animation||"";return t.style.animation=`${p?`${p}, `:""}${f} ${i}ms linear ${r}ms 1 both`,D+=1,f}function P(t,e){const n=(t.style.animation||"").split(", "),i=n.filter(e?c=>c.indexOf(e)<0:c=>c.indexOf("__svelte")===-1),r=n.length-i.length;r&&(t.style.animation=i.join(", "),D-=r,D||zt())}function zt(){I(()=>{D||(K.forEach(t=>{const e=t.__svelte_stylesheet;let n=e.cssRules.length;for(;n--;)e.deleteRule(n);t.__svelte_rules={}}),K.clear())})}let A;function C(t){A=t}function Q(){if(!A)throw new Error("Function called outside component initialization");return A}function oe(t){Q().$$.on_mount.push(t)}function ce(t){Q().$$.after_update.push(t)}function le(t,e){Q().$$.context.set(t,e)}const N=[],at=[],T=[],ft=[],Mt=Promise.resolve();let U=!1;function qt(){U||(U=!0,Mt.then(_t))}function E(t){T.push(t)}const V=new Set;let W=0;function _t(){const t=A;do{for(;W<N.length;){const e=N[W];W++,C(e),Ot(e.$$)}for(C(null),N.length=0,W=0;at.length;)at.pop()();for(let e=0;e<T.length;e+=1){const n=T[e];V.has(n)||(V.add(n),n())}T.length=0}while(N.length);for(;ft.length;)ft.pop()();U=!1,V.clear(),C(t)}function Ot(t){if(t.fragment!==null){t.update(),w(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(E)}}let j;function X(){return j||(j=Promise.resolve(),j.then(()=>{j=null})),j}function v(t,e,n){t.dispatchEvent(Nt(`${e?"intro":"outro"}${n}`))}const B=new Set;let g;function ue(){g={r:0,c:[],p:g}}function ae(){g.r||w(g.c),g=g.p}function Rt(t,e){t&&t.i&&(B.delete(t),t.i(e))}function fe(t,e,n,i){if(t&&t.o){if(B.has(t))return;B.add(t),g.c.push(()=>{B.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}}const Y={duration:0};function _e(t,e,n){let i=e(t,n),r=!1,c,s,l=0;function o(){c&&P(t,c)}function u(){const{delay:f=0,duration:a=300,easing:d=z,tick:h=y,css:p}=i||Y;p&&(c=L(t,0,1,a,f,d,p,l++)),h(0,1);const m=F()+f,b=m+a;s&&s.abort(),r=!0,E(()=>v(t,!0,"start")),s=H(x=>{if(r){if(x>=b)return h(1,0),v(t,!0,"end"),o(),r=!1;if(x>=m){const $=d((x-m)/a);h($,1-$)}}return r})}let _=!1;return{start(){_||(_=!0,P(t),M(i)?(i=i(),X().then(u)):u())},invalidate(){_=!1},end(){r&&(o(),r=!1)}}}function de(t,e,n){let i=e(t,n),r=!0,c;const s=g;s.r+=1;function l(){const{delay:o=0,duration:u=300,easing:_=z,tick:f=y,css:a}=i||Y;a&&(c=L(t,1,0,u,o,_,a));const d=F()+o,h=d+u;E(()=>v(t,!1,"start")),H(p=>{if(r){if(p>=h)return f(0,1),v(t,!1,"end"),--s.r||w(s.c),!1;if(p>=d){const m=_((p-d)/u);f(1-m,m)}}return r})}return M(i)?X().then(()=>{i=i(),l()}):l(),{end(o){o&&i.tick&&i.tick(1,0),r&&(c&&P(t,c),r=!1)}}}function he(t,e,n,i){let r=e(t,n),c=i?0:1,s=null,l=null,o=null;function u(){o&&P(t,o)}function _(a,d){const h=a.b-c;return d*=Math.abs(h),{a:c,b:a.b,d:h,duration:d,start:a.start,end:a.start+d,group:a.group}}function f(a){const{delay:d=0,duration:h=300,easing:p=z,tick:m=y,css:b}=r||Y,x={start:F()+d,b:a};a||(x.group=g,g.r+=1),s||l?l=x:(b&&(u(),o=L(t,c,a,h,d,p,b)),a&&m(0,1),s=_(x,h),E(()=>v(t,a,"start")),H($=>{if(l&&$>l.start&&(s=_(l,h),l=null,v(t,s.b,"start"),b&&(u(),o=L(t,c,s.b,s.duration,0,p,r.css))),s){if($>=s.end)m(c=s.b,1-c),v(t,s.b,"end"),l||(s.b?u():--s.group.r||w(s.group.c)),s=null;else if($>=s.start){const dt=$-s.start;c=s.a+s.d*p(dt/s.duration),m(c,1-c)}}return!!(s||l)}))}return{run(a){M(r)?X().then(()=>{r=r(),f(a)}):f(a)},end(){u(),s=l=null}}}function me(t,e){const n={},i={},r={$$scope:1};let c=t.length;for(;c--;){const s=t[c],l=e[c];if(l){for(const o in s)o in l||(i[o]=1);for(const o in l)r[o]||(n[o]=l[o],r[o]=1);t[c]=l}else for(const o in s)r[o]=1}for(const s in i)s in n||(n[s]=void 0);return n}function pe(t){return typeof t=="object"&&t!==null?t:{}}function ye(t){t&&t.c()}function ge(t,e){t&&t.l(e)}function Dt(t,e,n,i){const{fragment:r,on_mount:c,on_destroy:s,after_update:l}=t.$$;r&&r.m(e,n),i||E(()=>{const o=c.map(Z).filter(M);s?s.push(...o):w(o),t.$$.on_mount=[]}),l.forEach(E)}function Lt(t,e){const n=t.$$;n.fragment!==null&&(w(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Pt(t,e){t.$$.dirty[0]===-1&&(N.push(t),qt(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function be(t,e,n,i,r,c,s,l=[-1]){const o=A;C(t);const u=t.$$={fragment:null,ctx:null,props:c,update:y,not_equal:r,bound:tt(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(o?o.$$.context:[])),callbacks:tt(),dirty:l,skip_bound:!1,root:e.target||o.$$.root};s&&s(u.root);let _=!1;if(u.ctx=n?n(t,e.props||{},(f,a,...d)=>{const h=d.length?d[0]:a;return u.ctx&&r(u.ctx[f],u.ctx[f]=h)&&(!u.skip_bound&&u.bound[f]&&u.bound[f](h),_&&Pt(t,f)),a}):[],u.update(),_=!0,w(u.before_update),u.fragment=i?i(u.ctx):!1,e.target){if(e.hydrate){yt();const f=kt(e.target);u.fragment&&u.fragment.l(f),f.forEach(ct)}else u.fragment&&u.fragment.c();e.intro&&Rt(t.$$.fragment),Dt(t,e.target,e.anchor,e.customElement),gt(),_t()}C(o)}class xe{$destroy(){Lt(this,1),this.$destroy=y}$on(e,n){const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const r=i.indexOf(n);r!==-1&&i.splice(r,1)}}$set(e){this.$$set&&!pt(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const S=[];function $e(t,e=y){let n;const i=new Set;function r(l){if(mt(t,l)&&(t=l,n)){const o=!S.length;for(const u of i)u[1](),S.push(u,t);if(o){for(let u=0;u<S.length;u+=2)S[u][0](S[u+1]);S.length=0}}}function c(l){r(l(t))}function s(l,o=y){const u=[l,o];return i.add(u),i.size===1&&(n=e(r)||y),l(t),()=>{i.delete(u),i.size===0&&(n(),n=null)}}return{set:r,update:c,subscribe:s}}function Tt(t){const e=t-1;return e*e*e+1}function we(t,{delay:e=0,duration:n=400,easing:i=z}={}){const r=+getComputedStyle(t).opacity;return{delay:e,duration:n,easing:i,css:c=>`opacity: ${c*r}`}}function ve(t,{delay:e=0,duration:n=400,easing:i=Tt,start:r=0,opacity:c=0}={}){const s=getComputedStyle(t),l=+s.opacity,o=s.transform==="none"?"":s.transform,u=1-r,_=l*(1-c);return{delay:e,duration:n,easing:i,css:(f,a)=>`
			transform: ${o} scale(${1-u*a});
			opacity: ${l-_*a}
		`}}export{Zt as $,Lt as A,ht as B,$e as C,It as D,Gt as E,Jt as F,Ht as G,vt as H,y as I,Bt as J,Ft as K,E as L,_e as M,de as N,ve as O,Kt as P,se as Q,lt as R,xe as S,Ut as T,w as U,at as V,Wt as W,ie as X,re as Y,he as Z,we as _,kt as a,Yt as b,te as c,ct as d,G as e,Qt as f,At as g,ne as h,be as i,Vt as j,Xt as k,ee as l,ue as m,fe as n,ae as o,Rt as p,le as q,ce as r,mt as s,J as t,oe as u,ye as v,ge as w,Dt as x,me as y,pe as z};