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
    const type = document.querySelector('input[name="volType"]:checked').value;
    const date = document.getElementById("volDate").value;
    const time = document.getElementById("volTime").value;
    const duration = parseInt(document.getElementById("volDuration").value, 10);

    // 필수 항목 유효성 검사
    if(!name || !phone || !dong || !ho || !date || !time || !duration) {
        alert("모든 필수 기재 사항을 입력해주세요.");
        return;
    }

    // 최소 2시간 확인 조건문
    if(duration < 2) {
        alert("봉사 시간은 최소 2시간 이상으로 설정해야 합니다.");
        return;
    }

    try {
        await addDoc(collection(db, "volunteer_applications"), {
            name,
            phone,
            address: `${dong} ${ho}`,
            type,
            dateTime: `${date} ${time}`,
            duration: `${duration}시간`,
            createdAt: new Date().toISOString()
        });

        alert("봉사 신청이 성공적으로 접수되었습니다. 감사합니다!");
        
        // 폼 초기화
        document.getElementById("volName").value = "";
        document.getElementById("volPhone").value = "";
        document.getElementById("volDong").value = "";
        document.getElementById("volHo").value = "";
        document.getElementById("volDate").value = "";
        document.getElementById("volTime").value = "";
        document.getElementById("volDuration").value = "2";

    } catch(err) {
        console.error(err);
        alert("신청 시스템 오류가 발생했습니다. 관리자에게 문의하세요.");
    }
};
