import{W as D,j as c,c as b,f as I,d as o,l as E}from"./index-DT6a-eFb.js";import{m as R}from"./Footer-G4IX-GqZ.js";function A(e,t){return Array.isArray(e)?e.map(r=>r===null?null:t(r)):D(e)?Object.keys(e).reduce((r,s)=>(r[s]=t(e[s]),r),{}):e!=null?t(e):null}const p=e=>c.jsx(b.div,{className:"chakra-stack__item",...e,__css:{display:"inline-block",flex:"0 0 auto",minWidth:0,...e.__css}});p.displayName="StackItem";function M(e){const{spacing:t,direction:r}=e,s={column:{my:t,mx:0,borderLeftWidth:0,borderBottomWidth:"1px"},"column-reverse":{my:t,mx:0,borderLeftWidth:0,borderBottomWidth:"1px"},row:{mx:t,my:0,borderLeftWidth:"1px",borderBottomWidth:0},"row-reverse":{mx:t,my:0,borderLeftWidth:"1px",borderBottomWidth:0}};return{"&":A(r,d=>s[d])}}const O=I((e,t)=>{const{isInline:r,direction:s,align:d,justify:_,spacing:a="0.5rem",wrap:j,children:f,divider:l,className:g,shouldWrapChildren:m,...S}=e,u=r?"row":s??"column",x=o.useMemo(()=>M({spacing:a,direction:u}),[a,u]),i=!!l,y=!m&&!i,w=o.useMemo(()=>{const h=R(f);return y?h:h.map((n,v)=>{const k=typeof n.key<"u"?n.key:v,N=v+1===h.length,W=m?c.jsx(p,{children:n},k):n;if(!i)return W;const L=o.cloneElement(l,{__css:x}),B=N?null:L;return c.jsxs(o.Fragment,{children:[W,B]},k)})},[l,x,i,y,m,f]),C=E("chakra-stack",g);return c.jsx(b.div,{ref:t,display:"flex",alignItems:d,justifyContent:_,flexDirection:u,flexWrap:j,gap:i?void 0:a,className:C,...S,children:w})});O.displayName="Stack";export{O as S,A as m};