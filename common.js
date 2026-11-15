// 기존 firebase.js(설정 + export db)를 그대로 사용합니다.
import{db,auth}from"./firebase.js";
import{collection,addDoc,getDocs,getDoc,deleteDoc,updateDoc,setDoc,doc,query,orderBy,serverTimestamp,Timestamp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import{signInWithEmailAndPassword,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
export{auth};
export{signInWithEmailAndPassword,signOut,onAuthStateChanged};
export const list=async(c,o=1)=>(await getDocs(o?query(collection(db,c),orderBy("createdAt","desc")):collection(db,c))).docs.map(d=>({id:d.id,...d.data()}));
export const add=(c,d)=>addDoc(collection(db,c),{...d,createdAt:serverTimestamp()});
export const del=(c,id)=>deleteDoc(doc(db,c,id));
export const upd=(c,id,d)=>updateDoc(doc(db,c,id),d);
export const newId=c=>doc(collection(db,c)).id;
export const put=(c,id,d,m)=>m?setDoc(doc(db,c,id),d,{merge:true}):setDoc(doc(db,c,id),{...d,createdAt:serverTimestamp()});
export const site=async id=>{const s=await getDoc(doc(db,"site",id));return s.exists()?s.data():null};
export const setSite=(id,d)=>setDoc(doc(db,"site",id),d);
export const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const shrink=f=>new Promise(r=>{const i=new Image();i.onload=()=>{const s=Math.min(1,500/i.width),c=document.createElement("canvas");c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",.7))};i.src=URL.createObjectURL(f)});
// 접수 유형별 처리 상태 (st: 선택 가능한 상태, board: 공개 현황판 표시, no: 사유를 적는 상태)
export const TYPES={
repair:{l:"수리요청",st:["수리접수","수리완료"],board:1},
equip:{l:"희망기구추천",st:["검토예정","구매예정","구매완료","구매불가"],board:1,no:"구매불가"},
suggest:{l:"건의사항"},
volunteer:{l:"봉사신청",st:["신청접수","확정"]},
bookreq:{l:"희망도서",st:["접수완료","구매예정","구매완료","구매불가"],board:1,no:"구매불가"}};
export const SPACES={lib:{n:"작은도서관",types:["volunteer","bookreq"],page:"library.html"},fit:{n:"휘트니스 센터",types:["repair","equip","suggest"],page:"fitness.html"}};
export const bTitle=d=>String(d.type=="repair"?(d.equipment||d.group||"기구"):d.type=="equip"?d.item:d.title||"").slice(0,60);
// 운영 여부
export const DAYS=["일","월","화","수","목","금","토"];
const fmtDays=d=>{const a=[...d].sort((x,y)=>(x||7)-(y||7)),k=a.join();return k=="1,2,3,4,5"?"평일":k=="6,0"?"주말":a.length==7?"매일":a.map(n=>DAYS[n]).join("·")};
export const openState=c=>{const h=c.days?.length&&c.start&&c.end?`${fmtDays(c.days)} ${c.start}~${c.end}`:"";const n=new Date();let open=c.mode=="open";if(c.mode=="auto"||!c.mode){const m=n.toTimeString().slice(0,5);open=!!c.days?.includes(n.getDay())&&m>=c.start&&m<c.end}return{open,hrs:h,note:c.note||""}};
const NAV={lib:[["index.html","fa-table-cells-large","메인"],["library.html","fa-book-open","도서관"],["form.html?s=lib&t=volunteer","fa-hand-holding-heart","봉사신청"],["form.html?s=lib&t=bookreq","fa-book-bookmark","희망도서"],["status.html?s=lib","fa-clipboard-list","처리현황"]],
fit:[["index.html","fa-table-cells-large","메인"],["fitness.html","fa-bullhorn","공지"],["form.html?s=fit&t=repair","fa-screwdriver-wrench","수리요청"],["form.html?s=fit&t=equip","fa-dumbbell","희망기구추천"],["form.html?s=fit&t=suggest","fa-comment-dots","건의"]]};
export const nav=s=>{const p=(location.pathname.split("/").pop()||"index.html")+location.search;document.body.insertAdjacentHTML("beforeend",`<nav class="bottom-nav">${NAV[s].map(([h,i,l])=>`<a href="${h}" class="nav-item${h==p?" active":""}"><i class="fa-solid ${i}"></i><span>${l}</span></a>`).join("")}</nav>`)};
export const ts=m=>Timestamp.fromMillis(m);
