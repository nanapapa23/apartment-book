import { db } from "./firebase.js";
import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const volunteerBtn = document.getElementById("volunteerBtn");
const volDayType = document.getElementById("volDayType");
const volStartTime = document.getElementById("volStartTime");

/* -----------------------------------------------------
   평일/주말 선택에 따른 시작 시간 목록 동적 변경 스크립트
----------------------------------------------------- */
volDayType.onchange = () => {
    const selected = volDayType.value;
    volStartTime.innerHTML = '<option value="">-- 시작 시간 선택 --</option>';

    if (selected === "평일") {
        // 평일 요건: 오후 6시(18시) ~ 오후 10시(22시)
        const hours = ["18:00", "19:00", "20:00", "21:00", "22:00"];
        hours.forEach(h => {
            const opt = document.createElement("option");
            opt.value = h;
            opt.textContent = h;
            volStartTime.appendChild(opt);
        });
    } else if (selected === "주말") {
        // 주말 요건: 오전 10시 ~ 오후 6시(18시)
        const hours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
        hours.forEach(h => {
            const opt = document.createElement("option");
            opt.value = h;
            opt.textContent = h;
            volStartTime.appendChild(opt);
        });
    } else {
        volStartTime.innerHTML = '<option value="">-- 평일/주말을 먼저 선택해주세요 --</option>';
    }
};

/* -----------------------------------------------------
   데이터 전송 기능
----------------------------------------------------- */
volunteerBtn.onclick = async () => {
    const name = document.getElementById("volName").value.trim();
    const phone = document.getElementById("volPhone").value.trim();
    const dong = document.getElementById("volDong").value;
    const ho = document.getElementById("volHo").value.trim();
    const type = document.getElementById("volType").value;
    const dayType = volDayType.value; // 평일/주말 값 추출
    const date = document.getElementById("volDate").value;
    const startTime = volStartTime.value; 
    const duration = document.getElementById("volDuration").value; 
    const comment = document.getElementById("volComment").value.trim();

    // 필수 기재 사항 유효성 검사
    if(!name){ alert("성함을 입력해주세요."); return; }
    if(!phone){ alert("연락처를 입력해주세요."); return; }
    if(!dong){ alert("거주하시는 동을 선택해주세요."); return; }
    if(!ho){ alert("호수를 입력해주세요."); return; }
    if(!type){ alert("참여 형태(매주/원데이)를 선택해주세요."); return; }
    if(!dayType){ alert("평일 또는 주말 구분을 선택해주세요."); return; }
    if(!date){ alert("봉사 희망 날짜를 선택해주세요."); return; }
    if(!startTime){ alert("봉사 시작 시간을 선택해주세요."); return; }
    if(!duration){ alert("봉사 희망 시간을 선택해주세요."); return; }

    try{
        await addDoc(collection(db, "volunteer_applications"), {
            name,
            phone,
            dong,
            ho,
            type,
            dayType, // 데이터베이스에 평일/주말 정보 함께 기록
            date,
            startTime, 
            duration,
            comment,
            createdAt: new Date().toISOString()
        });

        alert("자원봉사 신청이 정상적으로 접수되었습니다. 감사합니다!");

        // 입력 폼 초기화
        document.getElementById("volName").value = "";
        document.getElementById("volPhone").value = "";
        document.getElementById("volDong").value = "";
        document.getElementById("volHo").value = "";
        document.getElementById("volType").value = "";
        volDayType.value = "";
        document.getElementById("volDate").value = "";
        volStartTime.innerHTML = '<option value="">-- 평일/주말을 먼저 선택해주세요 --</option>';
        document.getElementById("volDuration").value = "";
        document.getElementById("volComment").value = "";

    }catch(err){
        console.error(err);
        alert("접수 실패. 관리자에게 문의 바랍니다.");
    }
};
