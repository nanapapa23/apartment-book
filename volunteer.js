import { db } from "./firebase.js";
import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const volunteerBtn = document.getElementById("volunteerBtn");

volunteerBtn.onclick = async () => {
    const name = document.getElementById("volName").value.trim();
    const phone = document.getElementById("volPhone").value.trim();
    const dong = document.getElementById("volDong").value;
    const ho = document.getElementById("volHo").value.trim();
    const type = document.getElementById("volType").value;
    const date = document.getElementById("volDate").value;
    const startTime = document.getElementById("volStartTime").value; // 시작 시간 가져오기
    const duration = document.getElementById("volDuration").value; // 진행 시간 가져오기
    const comment = document.getElementById("volComment").value.trim();

    // 필수 기재 사항 유효성 검사
    if(!name){ alert("성함을 입력해주세요."); return; }
    if(!phone){ alert("연락처를 입력해주세요."); return; }
    if(!dong){ alert("거주하시는 동을 선택해주세요."); return; }
    if(!ho){ alert("호수를 입력해주세요."); return; }
    if(!type){ alert("참여 형태(매주/원데이)를 선택해주세요."); return; }
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
            date,
            startTime, // 데이터 저장 추가
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
        document.getElementById("volDate").value = "";
        document.getElementById("volStartTime").value = "";
        document.getElementById("volDuration").value = "";
        document.getElementById("volComment").value = "";

    }catch(err){
        console.error(err);
        alert("접수 실패. 관리자에게 문의 바랍니다.");
    }
};
