"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[346],{6346:function(e,t,n){n.r(t),n.d(t,{default:function(){return de}});var r=n(9439),a=n(2791),i=n(7762),o=n(4165),s=n(5861),u=n(3433),c=n(8351),l=n(6590),d=null,f=null,p=null,h=null;function v(){var e=document.getElementsByClassName("three-viewer")[0];e.style.width="100%",e.style.height="400px",f=new c.WebGLRenderer({antialias:!0,alpha:!0}),(p=new c.PerspectiveCamera(45,e.clientWidth/e.clientHeight,1,1e3)).up=new c.Vector3(0,0,1),f.setSize(e.clientWidth,e.clientHeight),e.replaceChild(f.domElement,e.firstChild),window.addEventListener("resize",(function(){f.setSize(e.clientWidth,e.clientHeight),p.aspect=e.clientWidth/e.clientHeight,p.updateProjectionMatrix()}),!1),(h=new l.o(p,f.domElement)).mouseButtons={LEFT:c.MOUSE.PAN,MIDDLE:c.MOUSE.DOLLY,RIGHT:c.MOUSE.ROTATE},h.screenSpacePanning=!1,h.maxPolarAngle=Math.PI/2,d=new c.Scene;var t=new c.DirectionalLight(16777215,.25);t.position.set(0,-.3,1),d.add(t);var n=new c.DirectionalLight(16777215,.1);n.position.set(.3,-.3,1),d.add(n);var r=new c.DirectionalLight(16777215,.1);r.position.set(-.3,-.3,1),d.add(r),d.add(new c.AmbientLight(16777215,1))}var m=n(6397);function w(e){var t=(0,r.Z)(e,3),n=t[0],a=t[1],i=t[2],o=m.clone(n),s=m.clone(a),u=m.clone(i);return m.lerp(o,n,a,.5),m.lerp(s,a,i,.5),m.lerp(u,i,n,.5),[[n,o,u],[a,s,o],[i,u,s],[o,s,u]]}function g(e,t){var n,r=[],a=(0,i.Z)(e);try{for(a.s();!(n=a.n()).done;)for(var o=[n.value];o.length>0;){var s=o.pop(),c=m.create(),l=m.create();m.sub(c,s[1],s[0]),m.sub(l,s[2],s[0]);var d=m.create();m.cross(d,c,l);var f,p,h=.5*m.len(d);if(f=m.dot(c,c),p=m.dot(l,l),h<=t&&Math.max(f,p)<=1)r.push(s);else{var v=w(s);o.push.apply(o,(0,u.Z)(v))}}}catch(g){a.e(g)}finally{a.f()}return r}var b=n(3365),y=n.n(b);function x(e,t){for(var n=0;n<e.length;n++)e[n]+=t[n]}function S(e){var t=[.2777273272234177,.005407344544966578,.3340998053353061],n=[.1050930431085774,1.404613529898575,1.384590162594685],r=[-.3308618287255563,.214847559468213,.09509516302823659],a=[-4.634230498983486,-5.799100973351585,-19.33244095627987],i=[6.228269936347081,14.17993336680509,56.69055260068105],o=[4.776384997670288,-13.74514537774601,-65.35303263337234],s=[-5.435455855934631,4.645852612178535,26.3124352495832];return[t[0]+e*(n[0]+e*(r[0]+e*(a[0]+e*(i[0]+e*(o[0]+e*s[0]))))),t[1]+e*(n[1]+e*(r[1]+e*(a[1]+e*(i[1]+e*(o[1]+e*s[1]))))),t[2]+e*(n[2]+e*(r[2]+e*(a[2]+e*(i[2]+e*(o[2]+e*s[2])))))]}function A(e,t,n,r,a){var i=t.length/9,o=e.length/3,s=document.getElementById("canvas").getContext("webgl2");s||alert("Your browser does not support WebGL2");var u="#version 300 es\n\t#define INFINITY         1000000.0\n\tprecision highp float;\n\n\n\tuniform vec3 u_triangles[".concat(3*i,"];\n\tuniform vec3 u_sun_direction;\n\n\tin vec3 a_position;\n\tin vec3 a_normal;\n\n\tout vec4 outColor;\n\n\tvec3 cross1(vec3 a, vec3 b) {\n\t\tvec3 c = vec3(0, 0, 0);\n\t\tc.x = a[1] * b[2] - a[2] * b[1];\n\t\tc.y = a[2] * b[0] - a[0] * b[2];\n\t\tc.z = a[0] * b[1] - a[1] * b[0];\n\t\treturn c;\n\t}\n\n\tfloat TriangleIntersect( vec3 v0, vec3 v1, vec3 v2, vec3 rayOrigin, vec3 rayDirection, int isDoubleSided )\n\t{\n\t\tvec3 edge1 = v1 - v0;\n\t\tvec3 edge2 = v2 - v0;\n\n\t\tvec3 pvec = cross(rayDirection, edge2);\n\n\t\tfloat epsilon = 0.000001; // Add epsilon to avoid division by zero\n\t\tfloat det = dot(edge1, pvec);\n\t\tif (abs(det) < epsilon) // Check if det is too close to zero\n\t\t\treturn INFINITY;\n\n\t\tfloat inv_det = 1.0 / det;\n\t\tif ( isDoubleSided == 0 && det < 0.0 ) \n\t\t\treturn INFINITY;\n\t\t\n\t\tvec3 tvec = rayOrigin - v0;\n\t\tfloat u = dot(tvec, pvec) * inv_det;\n\t\tvec3 qvec = cross(tvec, edge1);\n\t\tfloat v = dot(rayDirection, qvec) * inv_det;\n\t\tfloat t = dot(edge2, qvec) * inv_det;\n\t\tfloat x = dot(pvec,pvec);\n\t\treturn (u < 0.0 || u > 1.0 || v < 0.0 || u + v > 1.0 || t <= 0.0) ? INFINITY : t;\n\n\t}\n\n\n\tbool Calculate_Shading_at_Point(vec3 vertex_position, vec3 sun_direction) {\n\t\tfloat d;\n\t\tfloat t = INFINITY;\n\t\tbool is_shadowed = false;\n\t\tfor (int i = 0; i < ").concat(i,"; i++) {\n\t\t\td = TriangleIntersect(u_triangles[i * 3], u_triangles[i * 3 + 1], u_triangles[i * 3 + 2], vertex_position, sun_direction, 1);\n\t\t\tif (d < t && abs(d)>0.0001) {\n\t\t\t\treturn true;\n\n\t\t}\n\t\t}\n\t\treturn is_shadowed;\n\t}\n\n\tvoid main() {\n\t\tif (Calculate_Shading_at_Point(a_position.xyz, u_sun_direction)) {\n\t\t\t\t\toutColor = vec4(0, 0, 0, 0); // Shadowed\n\t\t\t\t} else {\n\t\t\t\t\tfloat intensity = abs(dot(a_normal.xyz, u_sun_direction));\n\t\t\t\t\toutColor = vec4(intensity, intensity, intensity, intensity); // Not shadowed\n\t\t\t\t}\n\n\t}"),c=function(e,t,n,r){var a=e.createProgram();if(void 0===t||void 0===n)return window.setShowTooManyUniformsError(!0),"abortSimulation";if(e.attachShader(a,t),e.attachShader(a,n),e.transformFeedbackVaryings(a,r,e.SEPARATE_ATTRIBS),e.linkProgram(a),e.getProgramParameter(a,e.LINK_STATUS))return a;console.error(e.getProgramInfoLog(a)),e.deleteProgram(a)}(s,F(s,s.VERTEX_SHADER,u),F(s,s.FRAGMENT_SHADER,"#version 300 es\n\tprecision highp float;\n\tvoid main() {\n\t}\n\t"),["outColor"]);if("abortSimulation"===c)return null;var l=s.getUniformLocation(c,"u_triangles"),d=E(s,16*o),f=function(e,t){var n=e.createTransformFeedback();return e.bindTransformFeedback(e.TRANSFORM_FEEDBACK,n),e.bindBufferBase(e.TRANSFORM_FEEDBACK_BUFFER,0,t),n}(s,d);s.useProgram(c),s.uniform3fv(l,t);var p=s.getAttribLocation(c,"a_position"),h=s.getAttribLocation(c,"a_normal"),v=s.createVertexArray();s.bindVertexArray(v);I(s,e,p),I(s,n,h);for(var m,w=0;w<r;w++){var g=s.getUniformLocation(c,"u_sun_direction"),b=k(1,a.lat,a.lon);s.uniform3fv(g,b),R(s,f,s.POINTS,o),null==m?m=_(s,d,"shading",o).filter((function(e,t){return(t+1)%4===0})):x(m,_(s,d,"shading",o).filter((function(e,t){return(t+1)%4===0})))}return m}function _(e,t,n,r){var a=new Float32Array(4*r);return e.bindBuffer(e.ARRAY_BUFFER,t),e.getBufferSubData(e.ARRAY_BUFFER,0,a),e.bindBuffer(e.ARRAY_BUFFER,null),a}function F(e,t,n){var r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))return r;console.error(e.getShaderInfoLog(r)),e.deleteShader(r)}function E(e,t){var n=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,t,e.DYNAMIC_DRAW),n}function I(e,t,n){E(e,t);e.enableVertexAttribArray(n),e.vertexAttribPointer(n,3,e.FLOAT,!1,0,0)}function R(e,t,n,r){e.enable(e.RASTERIZER_DISCARD),e.bindTransformFeedback(e.TRANSFORM_FEEDBACK,t),e.beginTransformFeedback(e.POINTS),e.drawArrays(n,0,r),e.endTransformFeedback(),e.bindTransformFeedback(e.TRANSFORM_FEEDBACK,null),e.disable(e.RASTERIZER_DISCARD)}var Z,M,T;n(720);function k(e,t,n){for(var r=new Float32Array(3*e),a=0;a<e;){var i=new Date(2023,Math.floor(12*Math.random()),1+Math.floor(28*Math.random()),Math.floor(24*Math.random()),Math.floor(60*Math.random()),0,0),o=y().getPosition(i,t,n);o.altitude<.1||o.altitude==Number.NaN||(r[3*a]=-Math.cos(o.altitude)*Math.sin(o.azimuth),r[3*a+1]=-Math.cos(o.altitude)*Math.cos(o.azimuth),r[3*a+2]=Math.sin(o.altitude),a+=1)}return r}function B(e){return N.apply(this,arguments)}function N(){return N=(0,s.Z)((0,o.Z)().mark((function e(t){var n,r,a,i,s,u,c,l,d,f,p,h,v,m,w,g,b,y,x,S,_;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(n=Z.attributes.position.array,r=M.attributes.position.array,a=M.attributes.normal.array,(i=document.getElementById("status")).textContent="Simulating",i.hasChanged=!0,s=[],u=[],c={},l=0;l<r.length;l+=3)d=[r[l],r[l+1],r[l+2]].map((function(e){return parseFloat(e.toFixed(6))})),f=JSON.stringify(d),c.hasOwnProperty(f)||(c[f]=l/3,s.push(r[l],r[l+1],r[l+2]),u.push(a[l],a[l+1],a[l+2]));return p=new Float32Array(s.slice()),h=new Float32Array(u.slice()),e.next=14,A(p,n,h,window.numSimulations,t);case 14:if(null!==(v=e.sent)){e.next=18;break}return window.setLoading(!1),e.abrupt("return",null);case 18:for(m=0;m<v.length;m++)w=[s[3*m],s[3*m+1],s[3*m+2]].map((function(e){return parseFloat(e.toFixed(6))})),g=JSON.stringify(w),c.hasOwnProperty(g)?c[g]=v[m]:console.error("Couldn't find indices for pointKey ".concat(g));for(b=new Array(r.length/3).fill(0),y=0;y<r.length;y+=3)x=[r[y],r[y+1],r[y+2]].map((function(e){return parseFloat(e.toFixed(6))})),S=JSON.stringify(x),c.hasOwnProperty(S)&&(b[y/3]=c[S]);_=new Float32Array(b),i.textContent="Simulation Done",i.hasChanged=!0,window.setLoading(!1),j(_);case 26:case"end":return e.stop()}}),e)}))),N.apply(this,arguments)}function C(e,t){var n,r=g([[m.fromValues.apply(m,(0,u.Z)(e.slice(0,3))),m.fromValues.apply(m,(0,u.Z)(e.slice(3,6))),m.fromValues.apply(m,(0,u.Z)(e.slice(6,9)))]],t),a=[],o=(0,i.Z)(r);try{for(o.s();!(n=o.n()).done;){var s=n.value;a.push.apply(a,(0,u.Z)(s))}}catch(c){o.e(c)}finally{o.f()}return a}function L(e,t){for(var n=e.attributes.position.array.slice(),r=[],a=[],i=0;i<n.length;i+=9){for(var o=!0,s=0;s<9;s+=3)(n[i+s]<-t||n[i+s]>t||n[i+s+1]<-t||n[i+s+1]>t)&&(o=!1);if(o){var l=m.fromValues.apply(m,(0,u.Z)(n.slice(i,i+3))),d=m.fromValues.apply(m,(0,u.Z)(n.slice(i+3,i+6))),f=m.fromValues.apply(m,(0,u.Z)(n.slice(i+6,i+9))),p=m.create();m.sub(p,d,l);var h=m.create();m.sub(h,f,l);var v=m.create();m.cross(v,p,h);var w=m.create();if(m.scale(w,v,1/m.len(v)),m.len(v)<.05)continue;for(s=0;s<9;s++)r.push(n[i+s]),a.push(w[s%3])}}var g=new c.BufferGeometry;return g.setAttribute("position",new c.BufferAttribute(new Float32Array(r),3)),g.setAttribute("normal",new c.BufferAttribute(new Float32Array(a),3)),g.attributes.position.needsUpdate=!0,g.attributes.normal.needsUpdate=!0,g}function P(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:window.numRadiusSimulation+20,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:window.numRadiusSimulation+70,r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:window.numRadiusSimulation,a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:2;null,function(e,t){for(var n=Number.POSITIVE_INFINITY,r=0;r<e.attributes.position.array.length;r++){var a=e.attributes.position.getZ(r);a<n&&(n=a)}var i=e.attributes.position.array;for(r=0;r<i.length;r+=9)for(var o=0;o<9;o+=3)i[r+o]=i[r+o]-t[0],i[r+o+1]=i[r+o+1]-t[1],i[r+o+2]=i[r+o+2]-n}(e,[z[0],z[1]]),Z=L(e,t);var o=function(e,t,n){for(var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:Number.POSITIVE_INFINITY,a=L(e,n).attributes.position.array.slice(),o=[],s=[],l=[],d=[],f=0;f<a.length;f+=9){for(var p=!0,h=0;h<9;h+=3)(a[f+h]<-t||a[f+h]>t||a[f+h+1]<-t||a[f+h+1]>t)&&(p=!1);var v=m.fromValues.apply(m,(0,u.Z)(a.slice(f,f+3))),w=m.fromValues.apply(m,(0,u.Z)(a.slice(f+3,f+6))),g=m.fromValues.apply(m,(0,u.Z)(a.slice(f+6,f+9))),b=m.create();m.sub(b,w,v);var y=m.create();m.sub(y,g,v);var x=m.create();m.cross(x,b,y);var S=m.create();if(m.scale(S,x,1/m.len(x)),!(m.len(x)<.05))if(p){var A,_=C(a.slice(f,f+9),r),F=(0,i.Z)(_);try{for(F.s();!(A=F.n()).done;){var E=A.value;o.push(E[0]),o.push(E[1]),o.push(E[2]),s.push(S[0]),s.push(S[1]),s.push(S[2])}}catch(Z){F.e(Z)}finally{F.f()}}else for(h=0;h<9;h++)l.push(a[f+h]),d.push(S[h%3])}var I=new c.BufferGeometry;I.setAttribute("position",new c.BufferAttribute(new Float32Array(o),3)),I.setAttribute("normal",new c.BufferAttribute(new Float32Array(s),3)),I.attributes.position.needsUpdate=!0,I.attributes.normal.needsUpdate=!0;var R=new c.BufferGeometry;return R.setAttribute("position",new c.BufferAttribute(new Float32Array(l),3)),R.setAttribute("normal",new c.BufferAttribute(new Float32Array(d),3)),R.attributes.position.needsUpdate=!0,R.attributes.normal.needsUpdate=!0,{innerGeometry:I,outerGeometry:R}}(e,r,n,a);M=o.innerGeometry,T=o.outerGeometry,0===M.attributes.position.array.length&&(window.setLoading(!1),window.setShowErrorMessage(!0),window.setShowThreeViewer(!1))}function j(e){return D.apply(this,arguments)}function D(){return D=(0,s.Z)((0,o.Z)().mark((function e(t){var n,r,a,i,s,u,l,m,w,g;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(v(),n=M.attributes.position.array.length/3,r=new Float32Array(3*n),a=0;a<n;a++)i=S(Math.min(1,t[a]/window.numSimulations/.6)),r[3*a]=i[0],r[3*a+1]=i[1],r[3*a+2]=i[2];M.setAttribute("color",new c.Float32BufferAttribute(r,3)),s=new c.MeshStandardMaterial({vertexColors:!0,side:c.DoubleSide,shininess:0,roughness:1}),u=new c.Mesh(M,s),d.add(u),l=new c.MeshStandardMaterial({vertexColors:!1,side:c.DoubleSide,color:13745828,shininess:0,roughness:1}),m=new c.Mesh(T,l),d.add(m),w=new c.Vector3,M.computeBoundingBox(),M.boundingBox.getCenter(w),Math.max(M.boundingBox.max.x,M.boundingBox.max.y,M.boundingBox.max.z),p.position.set(0,-20,100),p.position.z=40,g=function e(){requestAnimationFrame(e),h.update(),f.render(d,p)},window.setShowViridisLegend(!0),g();case 20:case"end":return e.stop()}}),e)}))),D.apply(this,arguments)}var z,O=n(5587),V=n.n(O),G=n(9970),U=n(8615),Y=n(7133);function q(e){return H.apply(this,arguments)}function H(){return(H=(0,s.Z)((0,o.Z)().mark((function e(t){var n,a,i,s,u,c,l,d;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!/^[-]?(\d+(\.\d+)?),\s*[-]?(\d+(\.\d+)?)$/.test(t)){e.next=7;break}return a=t.split(",").map((function(e){return parseFloat(e.trim())})),i=(0,r.Z)(a,2),s=i[0],u=i[1],n={lat:s,lon:u},e.abrupt("return",n);case 7:return c="https://nominatim.openstreetmap.org/search?format=json&q=".concat(t).concat("+Germany+Bavaria"),e.next=10,K(c);case 10:if(l=e.sent){e.next=17;break}return d=t.split(" ").join("+"),c="https://nominatim.openstreetmap.org/search?format=json&q=".concat(d),e.next=16,K(c);case 16:l=e.sent;case 17:return e.abrupt("return",l);case 18:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function K(e){return W.apply(this,arguments)}function W(){return(W=(0,s.Z)((0,o.Z)().mark((function e(t){var n,r,a,i;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=document.getElementById("status"),e.prev=1,e.next=4,fetch(t);case 4:if((a=e.sent).ok){e.next=9;break}throw console.error("Check connection to Nominatim geocoder"),r.textContent="Connection to Adress Server failed",new Error("Request failed with status "+a.status);case 9:return e.next=11,a.json();case 11:if(0!==(i=e.sent).length){e.next=14;break}return e.abrupt("return",null);case 14:return n=i[0],e.abrupt("return",n);case 18:return e.prev=18,e.t0=e.catch(1),console.error("Error:",e.t0),e.abrupt("return",null);case 22:case"end":return e.stop()}}),e,null,[[1,18]])})))).apply(this,arguments)}function J(){return(J=(0,s.Z)((0,o.Z)().mark((function e(t){var n;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,q(t);case 2:"undefined"!==typeof(n=e.sent)?$(n):(window.setLoading(!1),window.setShowThreeViewer(!1),window.setShowErrorMessage(!0));case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function X(e,t){var n=2e3,a=100;G.Z.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");var i=(0,G.Z)("EPSG:4326","EPSG:25832").forward([e,t]),o=(0,r.Z)(i,2),s=o[0],u=o[1];z=[s,u];var c=2*Math.floor(s/n),l=2*Math.floor(u/n),d=s%n<a,f=s%n>1900,p=u%n<a,h=u%n>1900,v=["".concat(c,"_").concat(l,".zip")];return d&&v.push("".concat(c-2,"_").concat(l,".zip")),f&&v.push("".concat(c+2,"_").concat(l,".zip")),p&&v.push("".concat(c,"_").concat(l-2,".zip")),h&&v.push("".concat(c,"_").concat(l+2,".zip")),d&&p&&v.push("".concat(c-2,"_").concat(l-2,".zip")),d&&h&&v.push("".concat(c-2,"_").concat(l+2,".zip")),f&&p&&v.push("".concat(c+2,"_").concat(l-2,".zip")),f&&h&&v.push("".concat(c+2,"_").concat(l+2,".zip")),v}function $(e){return Q.apply(this,arguments)}function Q(){return(Q=(0,s.Z)((0,o.Z)().mark((function e(t){var n,r,a,s,u,c,l,d,f,p,h,v,m,w;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n="https://www.openpv.de/data/",0!=(r=X(Number(t.lon),Number(t.lat))).length){e.next=4;break}return e.abrupt("return");case 4:a=document.getElementById("status"),s=[],u=(0,i.Z)(r),e.prev=7,u.s();case 9:if((c=u.n()).done){e.next=47;break}return l=c.value,d=n+l,a.textContent="Loading from "+d,e.prev=13,e.next=16,fetch(d);case 16:return f=e.sent,e.next=19,f.arrayBuffer();case 19:if(p=e.sent,f.ok){e.next=22;break}throw new Error("Request failed with status "+f.status);case 22:return h=new(V()),e.next=25,h.loadAsync(p);case 25:if(!(v=h.file(Object.keys(h.files)[0]))){e.next=38;break}return e.next=29,v.async("arraybuffer");case 29:m=e.sent,m,w=(new U.j).parse(m),s.push(w),P(Y.n4(s)),B(t),e.next=39;break;case 38:console.error("STL file not found in ZIP archive");case 39:e.next=45;break;case 41:e.prev=41,e.t0=e.catch(13),window.setLoading(!1),window.setShowErrorMessage(!0);case 45:e.next=9;break;case 47:e.next=52;break;case 49:e.prev=49,e.t1=e.catch(7),u.e(e.t1);case 52:return e.prev=52,u.f(),e.finish(52);case 55:case"end":return e.stop()}}),e,null,[[7,49,52,55],[13,41]])})))).apply(this,arguments)}var ee=n(9716),te=n.n(ee),ne=n(184);var re=function(){return(0,ne.jsxs)("div",{style:{alignItems:"center"},children:[(0,ne.jsx)("p",{children:"Adresse wurde nicht gefunden oder liegt nicht innerhalb von Bayern. Leider k\xf6nnen wir aktuell nur H\xe4user in Bayern simulieren."}),(0,ne.jsx)("p",{children:"Alternativ kannst du auch die Koordinaten in Google Maps per Rechtsklick bestimmen und in das Suchfeld eingeben."}),(0,ne.jsx)("img",{src:"images/googleMaps.gif",alt:"Showing how to get coordinates from Google Maps",style:{width:"100%",maxWidth:"500px"}})]})};var ae=function(){return(0,ne.jsx)("div",{style:{alignItems:"center"},children:(0,ne.jsx)("p",{children:"Leider ist das ausgew\xe4hlte Gebiet zu gro\xdf, um auf deinem PC simuliert zu werden. Du kannst den Geb\xe4uderadius mit dem Slider auf der linken Seite kleiner stellen, um dieses Problem zu beheben."})})},ie={display:"block",margin:"auto",borderColor:"red"};var oe=function(){var e=(0,a.useState)(""),t=(0,r.Z)(e,2),n=t[0],i=t[1],o=(0,a.useState)(!1),s=(0,r.Z)(o,2),u=s[0],c=s[1],l=(0,a.useState)(!1),d=(0,r.Z)(l,2),f=d[0],p=d[1],h=(0,a.useState)(!1),v=(0,r.Z)(h,2),m=v[0],w=v[1];return window.setShowErrorMessage=p,window.setShowTooManyUniformsError=w,window.setLoading=c,(0,ne.jsxs)(ne.Fragment,{children:[(0,ne.jsxs)("form",{onSubmit:function(e){c(!u),window.setShowViridisLegend(!1),e.preventDefault(),window.setShowThreeViewer(!0),function(e){J.apply(this,arguments)}(n),p(!1),w(!1)},style:{display:"flex",alignItems:"center"},children:[(0,ne.jsx)("input",{type:"text",placeholder:"Geben Sie Ihre Addresse oder Koordinaten ein",value:n,onChange:function(e){i(e.target.value)}}),(0,ne.jsx)("button",{type:"submit",children:"Start"})]}),f&&(0,ne.jsx)(re,{}),m&&(0,ne.jsx)(ae,{}),(0,ne.jsx)(te(),{color:"MediumAquaMarine",cssOverride:ie,loading:u,size:60})]})},se=n(5785),ue=n(1065);function ce(){return(0,ne.jsxs)(ne.Fragment,{children:[(0,ne.jsx)(ue.Xz,{className:"three-viewer",flat:!0,linear:!0}),(0,ne.jsx)("canvas",{id:"canvas",width:0,height:0})]})}var le=function(){return(0,ne.jsx)("img",{src:"images/viridis_legend.svg",alt:"Legend of the viridis colormap",style:{opacity:.6},width:"100%"})};var de=function(){var e=(0,a.useState)(!0),t=(0,r.Z)(e,2),n=t[0],i=t[1],o=(0,a.useState)(!1),s=(0,r.Z)(o,2),u=s[0],c=s[1];return window.setShowThreeViewer=i,window.setShowViridisLegend=c,(0,ne.jsx)(se.Z,{description:"Berechne das Potential deiner Solaranlage.",children:(0,ne.jsxs)("article",{className:"post",id:"index",children:[(0,ne.jsx)("header",{children:(0,ne.jsx)("div",{className:"title",children:(0,ne.jsx)(oe,{})})}),n&&(0,ne.jsx)(ce,{}),u&&(0,ne.jsx)(le,{})]})})}}}]);
//# sourceMappingURL=346.2ef98c7e.chunk.js.map