import { db } from "./firebase.js";
import {
collection,
getDocs,
updateDoc,
deleteDoc, // 데이터 삭제 기능 추가
doc,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const requestAdminList = document.getElementById("requestAdminList");

/* --------------------
   상태 변경
-------------------- */
window.changeStatus = async (id, status) => {
try{
const data = { status };

if(status === "rejected"){
const reason = document.getElementById("reason_" + id).value.trim();
data.reason = reason || "사유 미입력";
}else{
data.reason = "";
}

await updateDoc(doc(db, "book_requests", id), data);
alert("저장되었습니다.");
loadRequests();
}catch(err){
console.error(err);
alert("저장 실패");
}
};

/* --------------------
   신청 데이터 삭제 기능
-------------------- */
window.deleteRequest = async (id) => {
if(!confirm("해당 신청 내용을 정말로 삭제하시겠습니까?")) return;

try {
await deleteDoc(doc(db, "book_requests", id));
alert("삭제되었습니다.");
loadRequests();
} catch(err) {
console.error(err);
alert("삭제 실패");
}
};

/* --------------------
   목록 조회 (관리자용: 동호수, 신청일 모두 표시 및 삭제 활성화)
-------------------- */
async function loadRequests(){
requestAdminList.innerHTML = "";

const q = query(
collection(db, "book_requests"),
orderBy("createdAt", "desc")
);

const snap = await getDocs(q);

if(snap.empty){
requestAdminList.innerHTML = `
<div style="padding:20px;text-align:center;">신청된 도서가 없습니다.</div>
`;
return;
}

snap.forEach(docSnap => {
const b = docSnap.data();
const id = docSnap.id;

let statusText = "접수완료";
let color = "#9e9e9e";

if(b.status === "planned"){
statusText = "구매예정";
color = "#ff9800";
}
if(b.status === "completed"){
statusText = "구매완료";
color = "#4caf50";
}
if(b.status === "rejected"){
statusText = "구매불가";
color = "#f44336";
}

const div = document.createElement("div");
div.className = "request-admin-card";

// 관리자에게는 신청인 동호수와 신청일이 정상적으로 투명하게 출력됩니다.
div.innerHTML = `
<div class="request-title">${b.title || ""}</div>
<div class="request-info" style="font-weight:600; color:#1e88e5;">신청인(동호수) : ${b.dongHo || "-"}</div>
<div class="request-info">저자 : ${b.author || "-"}</div>
<div class="request-info">출판사 : ${b.publisher || "-"}</div>
<div class="request-info">의견 : ${b.comment || "-"}</div>
<div class="request-info">신청일 : ${b.createdAt ? b.createdAt.substring(0,10) : "-"}</div>

<div style="display:inline-block;background:${color};color:white;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:bold;margin-top:5px;margin-bottom:10px;">
${statusText}
</div>

<textarea id="reason_${id}" class="reason-box" placeholder="구매불가 사유 입력">${b.reason || ""}</textarea>

<div class="status-buttons">
<button class="btn-planned" onclick="changeStatus('${id}', 'planned')">구매예정</button>
<button class="btn-completed" onclick="changeStatus('${id}', 'completed')">구매완료</button>
<button class="btn-rejected" onclick="changeStatus('${id}', 'rejected')">구매불가</button>
<!-- 삭제 버튼 연동 -->
<button class="btn-delete" onclick="deleteRequest('${id}')">삭제</button>
</div>
`;

requestAdminList.appendChild(div);
});
}

/* --------------------
   시작
-------------------- */
loadRequests();
