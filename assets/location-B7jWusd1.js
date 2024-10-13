import{v as q,f as b,y as N,s as j,l as C,j as y,c as I,d as u,H as B}from"./index-CNMbRSP0.js";import{m as g,i as m,p as k,j as M,n as E}from"./Footer-TCVu7l1I.js";const[A,W]=q({name:"FormControlStylesContext",errorMessage:`useFormControlStyles returned is 'undefined'. Seems you forgot to wrap the components in "<FormControl />" `}),[G,w]=q({strict:!1,name:"FormControlContext"});function X(s){const{id:e,isRequired:a,isInvalid:t,isDisabled:o,isReadOnly:r,...l}=s,c=u.useId(),n=e||`field-${c}`,h=`${n}-label`,f=`${n}-feedback`,x=`${n}-helptext`,[v,p]=u.useState(!1),[S,P]=u.useState(!1),[F,R]=u.useState(!1),D=u.useCallback((i={},d=null)=>({id:x,...i,ref:g(d,_=>{_&&P(!0)})}),[x]),O=u.useCallback((i={},d=null)=>({...i,ref:d,"data-focus":m(F),"data-disabled":m(o),"data-invalid":m(t),"data-readonly":m(r),id:i.id!==void 0?i.id:h,htmlFor:i.htmlFor!==void 0?i.htmlFor:n}),[n,o,F,t,r,h]),$=u.useCallback((i={},d=null)=>({id:f,...i,ref:g(d,_=>{_&&p(!0)}),"aria-live":"polite"}),[f]),L=u.useCallback((i={},d=null)=>({...i,...l,ref:d,role:"group","data-focus":m(F),"data-disabled":m(o),"data-invalid":m(t),"data-readonly":m(r)}),[l,o,F,t,r]),z=u.useCallback((i={},d=null)=>({...i,ref:d,role:"presentation","aria-hidden":!0,children:i.children||"*"}),[]);return{isRequired:!!a,isInvalid:!!t,isReadOnly:!!r,isDisabled:!!o,isFocused:!!F,onFocus:()=>R(!0),onBlur:()=>R(!1),hasFeedbackText:v,setHasFeedbackText:p,hasHelpText:S,setHasHelpText:P,id:n,labelId:h,feedbackId:f,helpTextId:x,htmlProps:l,getHelpTextProps:D,getErrorMessageProps:$,getRootProps:L,getLabelProps:O,getRequiredIndicatorProps:z}}const Y=b(function(e,a){const t=N("Form",e),o=j(e),{getRootProps:r,htmlProps:l,...c}=X(o),n=C("chakra-form-control",e.className);return y.jsx(G,{value:c,children:y.jsx(A,{value:t,children:y.jsx(I.div,{...r({},a),className:n,__css:t.container})})})});Y.displayName="FormControl";const J=b(function(e,a){const t=w(),o=W(),r=C("chakra-form__helper-text",e.className);return y.jsx(I.div,{...t==null?void 0:t.getHelpTextProps(e,a),__css:o.helperText,className:r})});J.displayName="FormHelperText";function K(s){const{isDisabled:e,isInvalid:a,isReadOnly:t,isRequired:o,...r}=Q(s);return{...r,disabled:e,readOnly:t,required:o,"aria-invalid":k(a),"aria-required":k(o),"aria-readonly":k(t)}}function Q(s){const e=w(),{id:a,disabled:t,readOnly:o,required:r,isRequired:l,isInvalid:c,isReadOnly:n,isDisabled:h,onFocus:f,onBlur:x,...v}=s,p=s["aria-describedby"]?[s["aria-describedby"]]:[];return e!=null&&e.hasFeedbackText&&(e!=null&&e.isInvalid)&&p.push(e.feedbackId),e!=null&&e.hasHelpText&&p.push(e.helpTextId),{...v,"aria-describedby":p.join(" ")||void 0,id:a??(e==null?void 0:e.id),isDisabled:t??h??(e==null?void 0:e.isDisabled),isReadOnly:o??n??(e==null?void 0:e.isReadOnly),isRequired:r??l??(e==null?void 0:e.isRequired),isInvalid:c??(e==null?void 0:e.isInvalid),onFocus:M(e==null?void 0:e.onFocus,f),onBlur:M(e==null?void 0:e.onBlur,x)}}const H=b(function(e,a){const{htmlSize:t,...o}=e,r=N("Input",o),l=j(o),c=K(l),n=C("chakra-input",e.className);return y.jsx(I.input,{size:t,...c,__css:r.field,ref:a,className:n})});H.displayName="Input";H.id="Input";const U=b((s,e)=>{const{className:a,...t}=s,o=C("chakra-modal__footer",a),r=E(),l=B({display:"flex",alignItems:"center",justifyContent:"flex-end",...r.footer});return y.jsx(I.footer,{ref:e,...t,__css:l,className:o})});U.displayName="ModalFooter";var V,Z,ee;async function ne(s){let e=te(s);return e.length==0&&(e=se(s)),e}function te(s){if(/^[-]?(\d+(\.\d+)?),\s*[-]?(\d+(\.\d+)?)$/.test(s)){const[e,a]=s.split(",").map(t=>parseFloat(t.trim()));return[{lat:e,lon:a,display_name:`${e},${a}`,key:"coordinates"}]}else return[]}async function se(s){let e="https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=".concat(s).concat("+Germany"),a=await T(e);return a||(e="https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=".concat(s.split(" ").join("+")),a=await T(e)),a.map(t=>({lat:t.lat,lon:t.lon,key:t.place_id,display_name:oe(t.address)}))}function oe(s){return(s.road||"")+" "+(s.house_number||"")+", "+(s.postcode||"")+" "+(s.city||"")}async function T(s){try{const e=await fetch(s);if(!e.ok)throw new Error(`Request failed with status ${e.status}`);return await e.json()}catch(e){return console.error("Error:",e),[]}}function ie(s,e){Z=[s,e];const a=e*Math.PI/180,t=Math.pow(2,15),o=t*((s+180)/360),r=t*(1-Math.log(Math.tan(a)+1/Math.cos(a))/Math.PI)/2;return V=[o,r],ee=[1222.992452*o-2003750834e-2,2003750834e-2-1222.992452*r],[o,r]}function le(s,e,a){const t=4007501668e-2,o=t/Math.pow(2,a),r=o*s-t/2,l=r+o,c=t/2-o*e,n=c-o;return[r,c,l,n]}export{Y as F,H as I,U as M,w as a,W as b,Z as c,ee as d,V as e,ie as p,ne as r,Q as u,le as x};