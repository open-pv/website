import{r as u,j as l,a0 as w,aj as x,ak as m}from"./index-Du6Npblc.js";const C=u.forwardRef(function(o,r){const{templateAreas:n,column:s,row:e,autoFlow:i,autoRows:a,templateRows:d,autoColumns:c,templateColumns:p,inline:f,...g}=o;return l.jsx(w.div,{...g,ref:r,css:[{display:f?"inline-grid":"grid",gridTemplateAreas:n,gridAutoColumns:c,gridColumn:s,gridRow:e,gridAutoFlow:i,gridAutoRows:a,gridTemplateRows:d,gridTemplateColumns:p},o.css]})}),T=u.forwardRef(function(o,r){const{columns:n,minChildWidth:s,...e}=o,i=x(),a=s?j(s,i):h(n);return l.jsx(C,{ref:r,templateColumns:a,...e})});function R(t){return typeof t=="number"?`${t}px`:t}function j(t,o){return m(t,r=>{const n=o.tokens.getVar(`sizes.${r}`,R(r));return r===null?null:`repeat(auto-fit, minmax(${n}, 1fr))`})}function h(t){return m(t,o=>o===null?null:`repeat(${o}, minmax(0, 1fr))`)}export{T as S};
