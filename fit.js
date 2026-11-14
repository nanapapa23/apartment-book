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
export const FIT=[["index.html","fa-table-cells-large","메인"],["fitness.html","fa-bullhorn","공지"],["form.html?t=repair","fa-screwdriver-wrench","수리요청"],["form.html?t=equip","fa-dumbbell","희망기구추천"],["form.html?t=suggest","fa-comment-dots","건의"]];
export const nav=()=>{const p=(location.pathname.split("/").pop()||"index.html")+location.search;document.body.insertAdjacentHTML("beforeend",`<nav class="bottom-nav">${FIT.map(([h,i,l])=>`<a href="${h}" class="nav-item${h==p?" active":""}"><i class="fa-solid ${i}"></i><span>${l}</span></a>`).join("")}</nav>`)};
