import { db } from "./firebase.js";
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const noticeInput = document.getElementById("noticeInput");
const targetMachineKey = document.getElementById("targetMachineKey");
const machineImgUrl = document.getElementById("machineImgUrl");

window.addEventListener("DOMContentLoaded", () => {
    loadNotice();
    loadAdminRepairs();
    loadAdminWishes();
    loadAdminSuggestions();
});

async function loadNotice() {
    try {
        const snap = await getDoc(doc(db, "fitness_config", "notice"));
        if(snap.exists()) noticeInput.value = snap.data().text;
    } catch(e) { console.error(e); }
}

// 공지 세이브
document.getElementById("btnSaveNotice").onclick = async () => {
    const text = noticeInput.value.trim();
    if(!text) return;
    try {
        await setDoc(doc(db, "fitness_config", "notice"), { text });
        alert("공지사항 수정이 완료되었습니다.");
    } catch(e) { alert("실패"); }
};

// 기구사진 링크 세이브
document.getElementById("btnSaveImg").onclick = async () => {
    const key = targetMachineKey.value; const url = machineImgUrl.value.trim();
    if(!key || !url) { alert("입력값을 확인해 주세요."); return; }
    try {
        await setDoc(doc(db, "fitness_images", key), { url });
        alert(`[${key}]의 실물 이미지가 업데이트되었습니다.`);
        machineImgUrl.value = ""; targetMachineKey.value = "";
    } catch(e) { alert("실패"); }
};

/* ================= [수리요청 현황판 로드 및 관리기능] ================= */
async function loadAdminRepairs() {
    const area = document.getElementById("adminRepairList"); area.innerHTML = "";
    const q = query(collection(db, "fitness_repairs"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if(snap.empty) { area.innerHTML = "<div style='font-size:13px;color:#999;'>접수 내역 없음</div>"; return; }

    snap.forEach(d => {
        const data = d.data(); const id = d.id;
        const div = document.createElement("div");
        div.className = "admin-data-card";
        div.innerHTML = `
            <div style="font-weight:bold; font-size:14px; margin-bottom:5px;">기구: ${data.targetMachine}</div>
            <div style="font-size:13px; color:#444; background:#f0f2f5; padding:8px; border-radius:8px;">${data.memo}</div>
            <div class="card-meta">
                접수일: ${data.createdAt.replace('T',' ').substring(0,16)}
                <select class="status-select-box" onchange="updateRepairStatus('${id}', this.value)">
                    <option value="접수완료" ${data.status==='접수완료'?'selected':''}>접수완료</option>
                    <option value="수리요청" ${data.status==='수리요청'?'selected':''}>수리요청</option>
                    <option value="수리 완료" ${data.status==='수리 완료'?'selected':''}>수리 완료</option>
                </select>
            </div>
        `;
        area.appendChild(div);
    });
}
window.updateRepairStatus = async (id, val) => {
    try {
        await updateDoc(doc(db, "fitness_repairs", id), { status: val });
        alert("수리 진행 상태가 수정 변경되었습니다.");
    } catch(e) { alert("변경 실패"); }
};

/* ================= [희망기구 목록 로드 및 삭제/상태변경] ================= */
async function loadAdminWishes() {
    const area = document.getElementById("adminWishList"); area.innerHTML = "";
    const q = query(collection(db, "fitness_wishes"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if(snap.empty) { area.innerHTML = "<div style='font-size:13px;color:#999;'>신청 내역 없음</div>"; return; }

    snap.forEach(d => {
        const data = d.data(); const id = d.id;
        const div = document.createElement("div");
        div.className = "admin-data-card";
        div.innerHTML = `
            <div style="font-weight:bold; font-size:14px; color:#2e7d32;">기구명: ${data.machineName}</div>
            <div style="font-size:13px; color:#444; margin-top:3px;">내용: ${data.reason}</div>
            <div class="card-meta" style="display:flex; justify-content:space-between; align-items:center;">
                <span>접수일: ${data.createdAt.substring(0,10)}</span>
                <div>
                    <select class="status-select-box" style="color:#2e7d32; border-color:#2e7d32;" onchange="updateWishStatus('${id}', this.value)">
                        <option value="접수완료" ${data.status==='접수완료'?'selected':''}>접수완료</option>
                        <option value="구매 예정" ${data.status==='구매 예정'?'selected':''}>구매 예정</option>
                        <option value="구매 완료" ${data.status==='구매 완료'?'selected':''}>구매 완료</option>
                    </select>
                    <button onclick="deleteWish('${id}')" style="background:#e53935; color:white; border:none; padding:4px 8px; border-radius:6px; font-size:11px; margin-left:5px; cursor:pointer;">삭제</button>
                </div>
            </div>
        `;
        area.appendChild(div);
    });
}
window.updateWishStatus = async (id, val) => {
    try {
        await updateDoc(doc(db, "fitness_wishes", id), { status: val });
        alert("희망기구 처리 상태가 수정되었습니다.");
    } catch(e) { alert("변경 실패"); }
};
window.deleteWish = async (id) => {
    if(!confirm("이 희망기구 건의를 목록에서 완전히 삭제하시겠습니까?")) return;
    try {
        await deleteDoc(doc(db, "fitness_wishes", id));
        alert("삭제 처리가 완료되었습니다.");
        loadAdminWishes();
    } catch(e) { alert("삭제 실패"); }
};

/* ================= [익명 건의사항 조회] ================= */
async function loadAdminSuggestions() {
    const area = document.getElementById("adminSuggestList"); area.innerHTML = "";
    const q = query(collection(db, "fitness_suggestions"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if(snap.empty) { area.innerHTML = "<div style='font-size:13px;color:#999;'>들어온 건의사항이 없습니다.</div>"; return; }

    snap.forEach(d => {
        const data = d.data();
        const div = document.createElement("div");
        div.className = "admin-data-card";
        div.style.borderLeft = "4px solid #e53935";
        div.innerHTML = `
            <div style="font-size:13px; color:#333; white-space:pre-wrap;">${data.content}</div>
            <div class="card-meta" style="text-align:right;">의견제출일: ${data.createdAt.replace('T',' ').substring(0,16)}</div>
        `;
        area.appendChild(div);
    });
}
