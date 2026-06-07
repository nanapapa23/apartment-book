import { db } from "./firebase.js";
import {
collection,
addDoc,
getDocs,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const requestBtn = document.getElementById("requestBtn");
const requestList = document.getElementById("requestList");

/* -------------------
팝업 모달 제어
------------------- */
const guideModal = document.getElementById("guideModal");
const closeModalBtn = document.getElementById("closeModalBtn");

if (closeModalBtn && guideModal) {
    closeModalBtn.onclick = () => {
        guideModal.style.display = "none";
    };
}

/* -------------------
신청 저장
------------------- */
requestBtn.onclick = async () => {
const dongHo = document.getElementById("reqDongHo").value.trim();
const title = document.getElementById("reqTitle").value.trim();
const author = document.getElementById("reqAuthor").value.trim();
const publisher = document.getElementById("reqPublisher").value.trim();
const comment = document.getElementById("reqComment").value.trim();

if(!dongHo){
alert("동호수를 입력해주세요.");
return;
}

if(!title){
alert("책 제목을 입력해주세요.");
return;
}

try{
await addDoc(
collection(db, "book_requests"),
{
dongHo, 
title,
author,
publisher,
comment,
status: "pending",
reason: "",
createdAt: new Date().toISOString()
}
);

alert("희망도서 신청이 완료되었습니다.");

document.getElementById("reqDongHo").value = "";
document.getElementById("reqTitle").value = "";
document.getElementById("reqAuthor").value = "";
document.getElementById("reqPublisher").value = "";
document.getElementById("reqComment").value = "";

loadRequests();
}catch(err){
console.error(err);
alert("저장 실패");
}
};

/* -------------------
목록 조회 (입주민용: 신청일 표시, 동호수 미노출)
------------------- */
async function loadRequests(){
requestList.innerHTML = "";

const q = query(
collection(db, "book_requests"),
orderBy("createdAt", "desc")
);

const snap = await getDocs(q);

if(snap.empty){
requestList.innerHTML = "<div style='padding:20px;text-align:center;'>신청된 도서가 없습니다.</div>";
return;
}

snap.forEach(doc => {
const data = doc.data();

let statusText = "접수완료";
let statusClass = "status-pending";

if(data.status === "planned"){
statusText = "구매예정";
statusClass = "status-planned";
}
if(data.status === "completed"){
statusText = "구매완료";
statusClass = "status-completed";
}
if(data.status === "rejected"){
statusText = "구매불가";
statusClass = "status-rejected";
}

const div = document.createElement("div");
div.className = "request-card";

div.innerHTML = `
<div style="font-size:17px;font-weight:700;margin-bottom:5px;">${data.title || ""}</div>
<div style="font-size:13px;color:#666;">저자 : ${data.author || ""}</div>
${data.publisher ? `<div style="font-size:13px;color:#999;margin-top:4px;">출판사 : ${data.publisher}</div>` : ""}
<div style="font-size:12px;color:#999;margin-top:6px;margin-bottom:4px;">신청일 : ${data.createdAt ? data.createdAt.substring(0,10) : "-"}</div>
<div class="status ${statusClass}">${statusText}</div>
${data.status === "rejected" && data.reason ? `
<div style="margin-top:10px;padding:10px;background:#fff3f3;border-radius:10px;font-size:13px;color:#d32f2f;">사유 : ${data.reason}</div>
` : ""}
`;

requestList.appendChild(div);
});
}

/* -------------------
시작
------------------- */
loadRequests();
