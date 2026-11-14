// 기존 firebase.js(설정 + export db)를 그대로 사용합니다.
import{db}from"./firebase.js";
import{collection,addDoc,getDocs,deleteDoc,updateDoc,doc,query,orderBy,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import{getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
export const auth=getAuth();
export{signInWithEmailAndPassword,signOut,onAuthStateChanged};
export const list=async c=>(await getDocs(query(collection(db,c),orderBy("createdAt","desc")))).docs.map(d=>({id:d.id,...d.data()}));
export const add=(c,d)=>addDoc(collection(db,c),{...d,createdAt:serverTimestamp()});
export const del=(c,id)=>deleteDoc(doc(db,c,id));
export const upd=(c,id,d)=>updateDoc(doc(db,c,id),d);
export const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const shrink=f=>new Promise(r=>{const i=new Image();i.onload=()=>{const s=Math.min(1,500/i.width),c=document.createElement("canvas");c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",.7))};i.src=URL.createObjectURL(f)});
export const FIT=[["index.html","메인"],["fitness.html","공지"],["form.html?t=repair","수리요청"],["form.html?t=equip","희망기구"],["form.html?t=suggest","건의사항"]];
export const nav=()=>{const p=(location.pathname.split("/").pop()||"index.html")+location.search;document.querySelector(".gh").insertAdjacentHTML("afterend",`<nav class="pills">${FIT.map(([h,l])=>`<a href="${h}"${h==p?' class="on"':""}>${l}</a>`).join("")}</nav>`)};
