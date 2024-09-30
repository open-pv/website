import{f as p,k as F,o as L,j as e,b,i as A,t as B,F as D,e as N,M as _}from"./index-B_cNae_Z.js";import{T as x,O as H,a as u,F as I,g as f}from"./Footer-DhH2FEev.js";import{m as w,S as M}from"./chunk-ZHMYA64R-d0Jn5Lyh.js";import{C as O,a as Y,H as C,b as W}from"./chunk-7OLJDQMT-D3gC22zE.js";import{I as $}from"./chunk-QINAG4RG-DC0XjHzO.js";var i=p(function(s,a){const n=F("Link",s),{className:o,isExternal:r,...l}=L(s);return e.jsx(b.a,{target:r?"_blank":void 0,rel:r?"noopener":void 0,ref:a,className:A("chakra-link",o),...l,__css:n})});i.displayName="Link";var k=p(function(s,a){const{templateAreas:n,gap:o,rowGap:r,columnGap:l,column:c,row:m,autoFlow:h,autoRows:g,templateRows:T,autoColumns:R,templateColumns:E,...S}=s,v={display:"grid",gridTemplateAreas:n,gridGap:o,gridRowGap:r,gridColumnGap:l,gridAutoColumns:R,gridColumn:c,gridRow:m,gridAutoFlow:h,gridAutoRows:g,gridTemplateRows:T,gridTemplateColumns:E};return e.jsx(b.div,{ref:a,__css:v,...S})});k.displayName="Grid";var y=p(function(s,a){const{columns:n,spacingX:o,spacingY:r,spacing:l,minChildWidth:c,...m}=s,h=B(),g=c?P(c,h):V(n);return e.jsx(k,{ref:a,gap:l,columnGap:o,rowGap:r,templateColumns:g,...m})});y.displayName="SimpleGrid";function z(t){return typeof t=="number"?`${t}px`:t}function P(t,s){return w(t,a=>{const n=D("sizes",a,z(a))(s);return a===null?null:`repeat(auto-fit, minmax(${n}, 1fr))`})}function V(t){return w(t,s=>s===null?null:`repeat(${s}, minmax(0, 1fr))`)}var G=p((t,s)=>e.jsx(M,{align:"center",...t,direction:"column",ref:s}));G.displayName="VStack";const U=()=>{const{t}=N();return e.jsxs(e.Fragment,{children:[e.jsx(_,{title:t("about.title"),description:t("about.description"),children:e.jsxs(O,{height:"100%",overflow:"auto",padding:"20px",children:[e.jsx(Y,{children:e.jsx(C,{children:t("about.title")})}),e.jsx(W,{children:e.jsxs(G,{spacing:"6",align:"start",children:[e.jsx(x,{children:t("about.introduction")}),e.jsxs(d,{heading:t("about.generalDescription.h"),content:t("about.generalDescription.p"),children:[e.jsx(x,{children:t("about.steps.introduction")}),e.jsxs(H,{children:[e.jsx(u,{children:t("about.steps.1")}),e.jsx(u,{children:t("about.steps.2")}),e.jsx(u,{children:t("about.steps.3")}),e.jsx(u,{children:t("about.steps.4")})]})]}),e.jsx(j,{images:["images/about/about1.png","images/WelcomeMessage2.png","images/WelcomeMessage3.png"]}),e.jsxs(d,{heading:t("about.data.h"),children:[t("about.data.p1")," ",e.jsx(i,{href:"https://www.dwd.de/DE/leistungen/cdc/climate-data-center.html",isExternal:!0,color:"teal",children:"[CC-BY-4.0]"}),", ",t("about.data.p2")," ",e.jsx(i,{href:"https://sonny.4lima.de/",isExternal:!0,color:"teal",children:"[CC-BY-4.0]"}),", ",t("about.data.p3")," ",e.jsx(i,{href:"https://www.bkg.bund.de/DE/Home/home.html",isExternal:!0,color:"teal",children:"[DL-DE/BY-2-0]"}),"."]}),e.jsx(d,{heading:t("about.whyOpenSource.h"),content:t("about.whyOpenSource.p")}),e.jsx(d,{heading:t("about.team.h"),content:t("about.team.p"),children:e.jsx(i,{href:"https://github.com/orgs/open-pv/people",isExternal:!0,color:"teal",children:t("about.team.link")})}),e.jsx(d,{heading:t("about.sponsors.h"),content:t("about.sponsors.p")}),e.jsx(j,{images:["images/about/ptf.png","images/about/bmbf.jpg"],links:["https://prototypefund.de/","https://www.bmbf.de"],objectFit:"contain"})]})})]})}),e.jsx(I,{})]})};function d({content:t,heading:s,children:a}){return e.jsxs(f,{children:[e.jsx(C,{as:"h3",size:"md",children:s}),e.jsx(x,{children:t}),a]})}const j=({images:t,links:s=[],objectFit:a="cover"})=>e.jsx(y,{columns:t.length,spacing:4,children:t.map((n,o)=>{const r=e.jsx($,{src:n,objectFit:a,width:"100%",height:"150px",borderRadius:"md"});return e.jsx(f,{padding:2,children:s[o]?e.jsx(i,{href:s[o],isExternal:!0,children:r}):r},o)})});export{U as default};
