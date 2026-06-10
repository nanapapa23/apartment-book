import { db } from "./firebase.js";
import { collection, addDoc, doc, getDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const mainCat = document.getElementById("repairMainCat");
const subCatArea = document.getElementById("subCatArea");
const subCat = document.getElementById("repairSubCat");
const detailCatArea = document.getElementById("detailCatArea");
const detailCat = document.getElementById("repairDetailCat");
const machineImg = document.getElementById("machineImg");
const imgPlaceholder = document.getElementById("imgPlaceholder");

let imageMap = {};

// 구조 정의
const machineStructure = {
    "유산소": ["런닝머신", "천국의계단", "마이마운틴", "자전거"],
    "웨이트": ["스미스머신", "듀얼풀리", "매직레그프레스", "시티드레그프레스", "랫풀다운", "체스트프레스"],
    "기타": ["인바디", "아령", "주변기기등"]
};
const treadmillOptions = ["렉스코 LT6XL 1번", "렉스코 LT6XL 2번", "기존 런닝머신 1번", "기존 런닝머신 2번", "기존 런닝머신 3번"];

window.addEventListener("DOMContentLoaded", async () => {
    // 1. 공지사항 로드
    try {
        const noticeSnap = await getDoc(doc(db, "fitness_config", "notice"));
        if(noticeSnap.exists()) document.getElementById("noticeContent").textContent = noticeSnap.data().text;
    } catch(e) { console.error(e); }

    // 2. 기구 사진 맵 로드
    try {
        const imgSnap = await getDocs(collection(db, "fitness_images"));
        imgSnap.forEach(d => { imageMap[d.id] = d.data().url; });
    } catch(e) { console.error(e); }

    // 3. 실시간 현황 리스트 로드
    loadResidentRepairList();
    loadResidentWishList();
});

// 분류 선택 체인 제어
mainCat.onchange = () => {
    const selectedMain = mainCat.value;
    subCat.innerHTML = '<option value="">-- 기구 선택 --</option>';
    detailCat.innerHTML = '';
    detailCatArea.style.display = 'none';
    hideImage();
    if(!selectedMain) { subCatArea.style.display = 'none'; return; }
    
    machineStructure[selectedMain].forEach(m => {
        const opt = document.createElement("option");
        opt.value = m; opt.textContent = m;
        subCat.appendChild(opt);
    });
    subCatArea.style.display = 'block';
};

subCat.onchange = () => {
    const selectedSub = subCat.value;
    detailCat.innerHTML = '';
    if(selectedSub === "런닝머신") {
        detailCat.innerHTML = '<option value="">-- 기종 번호 선택 --</option>';
        treadmillOptions.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            detailCat.appendChild(opt);
        });
        detailCatArea.style.display = 'block';
        hideImage();
    } else {
        detailCatArea.style.display = 'none';
        if(selectedSub) displayImage(selectedSub); else hideImage();
    }
};

detailCat.onchange = () => {
    if(detailCat.value) displayImage(detailCat.value); else hideImage();
};

function displayImage(key) {
    if(imageMap[key] && imageMap[key].trim() !== "") {
        machineImg.src = imageMap[key];
        machineImg.style.display = "block";
        imgPlaceholder.style.display = "none";
    } else {
        hideImage();
        imgPlaceholder.innerHTML = `⚠️ [${key}] 사진 준비 중입니다.`;
    }
}
function hideImage() {
    machineImg.src = ""; machineImg.style.display = "none"; imgPlaceholder.style.display = "block";
}

/* ================= 실시간 주민 리스트 불러오기 ================= */
async function loadResidentRepairList() {
    const box = document.getElementById("residentRepairList");
    box.innerHTML = "";
    try {
        const q = query(collection(db, "fitness_repairs"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        if(snap.empty) { box.innerHTML = "<div style='color:#999;font-size:12px;text-align:center;padding:15px;'>현재 접수된 수리 내역이 없습니다.</div>"; return; }
        
        snap.forEach(d => {
            const r = d.data();
            let badgeClass = r.status === "수리 완료" ? "bg-success" : (r.status === "수리요청" ? "bg-warning" : "bg-info");
            box.innerHTML += `
                <div class="live-card">
                    <div class="live-card-header">
                        <span class="live-machine-name">📍 ${r.targetMachine}</span>
                        <span class="badge ${badgeClass}">${r.status || "접수완료"}</span>
                    </div>
                    <div class="live-memo">${r.memo}</div>
                    <div class="live-date" style="text-align:right; margin-top:5px;">접수일: ${r.createdAt.substring(0, 10)}</div>
                </div>
            `;
        });
    } catch(e) { console.error(e); }
}

async function loadResidentWishList() {
    const box = document.getElementById("residentWishList");
    box.innerHTML = "";
    try {
        const q = query(collection(db, "fitness_wishes"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        if(snap.empty) { box.innerHTML = "<div style='color:#999;font-size:12px;text-align:center;padding:15px;'>제안된 희망 기구 내역이 없습니다.</div>"; return; }
        
        snap.forEach(d => {
            const w = d.data();
            let badgeClass = w.status === "구매 완료" ? "bg-success" : (w.status === "구매 예정" ? "bg-warning" : "bg-info");
            box.innerHTML += `
                <div class="live-card">
                    <div class="live-card-header">
                        <span class="live-machine-name" style="color:#2e7d32;">🔥 ${w.machineName}</span>
                        <span class="badge ${badgeClass}">${w.status || "접수완료"}</span>
                    </div>
                    <div class="live-memo">${w.reason}</div>
                    <div class="live-date" style="text-align:right; margin-top:5px;">접수일: ${w.createdAt.substring(0, 10)}</div>
                </div>
            `;
        });
    } catch(e) { console.error(e); }
}

/* ================= 데이터 전송 처리 ================= */
document.getElementById("btnSubmitRepair").onclick = async () => {
    const main = mainCat.value; const sub = subCat.value; const detail = detailCat.value;
    const memo = document.getElementById("repairMemo").value.trim();
    if(!main || !sub || (sub==="런닝머신" && !detail)) { alert("수리 요청 대상을 지정해 주세요."); return; }
    if(!memo) { alert("고장 증상을 입력해주세요."); return; }

    try {
        await addDoc(collection(db, "fitness_repairs"), {
            targetMachine: sub === "런닝머신" ? detail : sub,
            memo, status: "접수완료", createdAt: new Date().toISOString()
        });
        alert("수리 요청 접수가 완료되었습니다.");
        location.reload();
    } catch(e) { alert("접수 오류"); }
};

document.getElementById("btnSubmitWish").onclick = async () => {
    const machineName = document.getElementById("wishMachineName").value.trim();
    const reason = document.getElementById("wishReason").value.trim();
    if(!machineName || !reason) { alert("기구명과 필요성을 작성해 주세요."); return; }

    try {
        await addDoc(collection(db, "fitness_wishes"), {
            machineName, reason, status: "접수완료", createdAt: new Date().toISOString()
        });
        alert("희망기구 건의안이 정상 제출되었습니다.");
        location.reload();
    } catch(e) { alert("접수 오류"); }
};

document.getElementById("btnSubmitSuggest").onclick = async () => {
    const content = document.getElementById("suggestContent").value.trim();
    if(!content) { alert("건의사항 내용을 작성해 주세요."); return; }

    try {
        await addDoc(collection(db, "fitness_suggestions"), {
            content, createdAt: new Date().toISOString()
        });
        alert("건의사항이 완전히 안전한 익명으로 제출되었습니다.");
        location.reload();
    } catch(e) { alert("접수 오류"); }
};
