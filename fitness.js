import { db } from "./firebase.js";
import { collection, addDoc, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM 매핑
const mainCat = document.getElementById("repairMainCat");
const subCatArea = document.getElementById("subCatArea");
const subCat = document.getElementById("repairSubCat");
const detailCatArea = document.getElementById("detailCatArea");
const detailCat = document.getElementById("repairDetailCat");
const machineImg = document.getElementById("machineImg");
const imgPlaceholder = document.getElementById("imgPlaceholder");
const partGrid = document.getElementById("partGrid");

// 이미지 캐시 저장소 (관리자가 등록한 세팅을 로드)
let imageMap = {};

/* -----------------------------------------------------
   1. 초기 로드 및 공지사항 / 이미지 데이터 동기화
----------------------------------------------------- */
window.addEventListener("DOMContentLoaded", async () => {
    // 공지사항 불러오기
    try {
        const noticeSnap = await getDoc(doc(db, "fitness_config", "notice"));
        if(noticeSnap.exists()) {
            document.getElementById("noticeContent").textContent = noticeSnap.data().text;
        } else {
            document.getElementById("noticeContent").textContent = "등록된 휘트니스 공지 안내가 없습니다.";
        }
    } catch(e) { console.error(e); }

    // 기구별 이미지 세팅 맵 불러오기
    try {
        const imgSnap = await getDocs(collection(db, "fitness_images"));
        imgSnap.forEach(d => {
            imageMap[d.id] = d.data().url;
        });
    } catch(e) { console.error(e); }
});

/* -----------------------------------------------------
   2. 수리요청 대분류 / 중분류 / 소분류 데이터 구조 정의 및 매칭
----------------------------------------------------- */
const machineStructure = {
    "유산소": ["런닝머신", "천국의계단", "마이마운틴", "자전거"],
    "웨이트": ["스미스머신", "듀얼풀리", "매직레그프레스", "시티드레그프레스", "랫풀다운", "체스트프레스"],
    "기타": ["인바디", "아령", "주변기기등"]
};

const treadmillOptions = [
    "렉스코 LT6XL 1번",
    "렉스코 LT6XL 2번",
    "기존 런닝머신 1번",
    "기존 런닝머신 2번",
    "기존 런닝머신 3번"
];

// 기구 종류별 부위 세분화 항목 정의
const partsStructure = {
    "유산소": ["벨트 마찰/구동부", "계기판/모니터 화면", "손잡이 조절 버튼", "경사도(인클라인) 오작동", "전원/소음 문제"],
    "웨이트": ["와이어 와이어 와이어 벨트 케이블 단선", "도르래 걸림 및 파손", "시트/가죽 패드 찢어짐", "무게 조절 핀 분실", "프레임 및 그립 파손"],
    "기타": ["센서/액정 화면 오류", "그립/고무 헐거워짐", "비품 파손 및 분실"]
};

// 대분류 변경 시 이벤트
mainCat.onchange = () => {
    const selectedMain = mainCat.value;
    subCat.innerHTML = '<option value="">-- 기구 선택 --</option>';
    detailCat.innerHTML = '';
    detailCatArea.style.display = 'none';
    hideImage();
    
    if(!selectedMain) {
        subCatArea.style.display = 'none';
        partGrid.innerHTML = '<div style="grid-column: span 2; text-align:center; color:#999; font-size:12px;">기구를 먼저 선택해주세요.</div>';
        return;
    }
    
    // 2차 분류 탑재
    machineStructure[selectedMain].forEach(m => {
        const opt = document.createElement("option");
        opt.value = m; opt.textContent = m;
        subCat.appendChild(opt);
    });
    subCatArea.style.display = 'block';

    // 부위 세분화 체크박스 빌드
    partGrid.innerHTML = "";
    partsStructure[selectedMain].forEach((p, idx) => {
        partGrid.innerHTML += `
            <label class="part-item">
                <input type="checkbox" name="repairPart" value="${p}">
                <span>${p}</span>
            </label>
        `;
    });
};

// 중분류 변경 시 이벤트
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
        if(selectedSub) { displayImage(selectedSub); } else { hideImage(); }
    }
};

// 소분류(런닝머신 전용) 변경 시 이벤트
detailCat.onchange = () => {
    const selectedDetail = detailCat.value;
    if(selectedDetail) { displayImage(selectedDetail); } else { hideImage(); }
};

function displayImage(key) {
    if(imageMap[key] && imageMap[key].trim() !== "") {
        machineImg.src = imageMap[key];
        machineImg.style.display = "block";
        imgPlaceholder.style.display = "none";
    } else {
        hideImage();
        imgPlaceholder.innerHTML = `⚠️ [${key}]의 사진이 아직 등록되지 않았습니다.<br>관리자 화면에서 사진 등록이 가능합니다.`;
    }
}

function hideImage() {
    machineImg.src = "";
    machineImg.style.display = "none";
    imgPlaceholder.style.display = "block";
    imgPlaceholder.innerHTML = "기구를 선택하시면 관리자가 등록한<br>실물 사진이 이곳에 나타납니다.";
}

/* -----------------------------------------------------
   3. Firebase 전송 이벤트 핸들러 모음
----------------------------------------------------- */

// A. 수리요청 전송
document.getElementById("btnSubmitRepair").onclick = async () => {
    const main = mainCat.value;
    const sub = subCat.value;
    const detail = detailCat.value;
    const memo = document.getElementById("repairMemo").value.trim();
    const name = document.getElementById("repairName").value.trim();
    const phone = document.getElementById("repairPhone").value.trim();
    const dong = document.getElementById("repairDong").value;
    const ho = document.getElementById("repairHo").value.trim();
    const customPart = document.getElementById("repairCustomPart").value.trim();

    // 체크박스 부위 취합
    const checkedParts = [];
    document.querySelectorAll("input[name='repairPart']:checked").forEach(cb => {
        checkedParts.push(cb.value);
    });
    if(customPart) checkedParts.push(`직접기재: ${customPart}`);

    if(!main || !sub || (sub==="런닝머신" && !detail)) { alert("기구 정보를 정확히 선택해주세요."); return; }
    if(checkedParts.length === 0) { alert("수리 요청 부위를 최소 1개 이상 선택해 주세요."); return; }
    if(!name || !phone || !dong || !ho) { alert("신청자 연락처 및 동/호수 정보를 전부 기재해주세요."); return; }

    try {
        await addDoc(collection(db, "fitness_repairs"), {
            targetMachine: sub === "런닝머신" ? detail : sub,
            categoryPath: `${main} > ${sub}`,
            parts: checkedParts,
            memo, name, phone, dong, ho,
            status: "접수완료",
            createdAt: new Date().toISOString()
        });
        alert("수리 요청이 정상 접수되었습니다. 신속히 확인하겠습니다!");
        location.reload();
    } catch(e) { alert("접수 실패"); }
};

// B. 희망기구 요청 전송
document.getElementById("btnSubmitWish").onclick = async () => {
    const machineName = document.getElementById("wishMachineName").value.trim();
    const reason = document.getElementById("wishReason").value.trim();
    const name = document.getElementById("wishName").value.trim();
    const phone = document.getElementById("wishPhone").value.trim();

    if(!machineName || !reason || !name) { alert("양식을 완성해주세요."); return; }

    try {
        await addDoc(collection(db, "fitness_wishes"), {
            machineName, reason, name, phone,
            createdAt: new Date().toISOString()
        });
        alert("희망기구 건의가 성공적으로 전달되었습니다.");
        location.reload();
    } catch(e) { alert("오류 발생"); }
};

// C. 일반 건의사항 전송
document.getElementById("btnSubmitSuggest").onclick = async () => {
    const content = document.getElementById("suggestContent").value.trim();
    const name = document.getElementById("suggestName").value.trim() || "익명";

    if(!content) { alert("건의 내용을 입력해주세요."); return; }

    try {
        await addDoc(collection(db, "fitness_suggestions"), {
            content, name,
            createdAt: new Date().toISOString()
        });
        alert("건의사항이 접수되었습니다. 운영에 소중히 반영하겠습니다.");
        location.reload();
    } catch(e) { alert("오류 발생"); }
};
