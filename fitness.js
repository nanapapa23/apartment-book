import { db } from "./firebase.js";
import {
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const fitSubmitBtn = document.getElementById("fitSubmitBtn");

fitSubmitBtn.onclick = async () => {
    const category = document.getElementById("fitCategory").value;
    const name = document.getElementById("fitName").value.trim();
    const phone = document.getElementById("fitPhone").value.trim();
    const dong = document.getElementById("fitDong").value;
    const ho = document.getElementById("fitHo").value.trim();
    const content = document.getElementById("fitContent").value.trim();

    // 유효성 검사 필수 기재 사항 체크
    if(!category){ alert("접수하실 민원 분류를 선택해주세요."); return; }
    if(!name){ alert("성함을 입력해주세요."); return; }
    if(!phone){ alert("연락처를 입력해주세요."); return; }
    if(!dong){ alert("거주하시는 동을 선택해주세요."); return; }
    if(!ho){ alert("호수를 입력해주세요."); return; }
    if(!content){ alert("상세 내용을 입력해주세요."); return; }

    try{
        // Firebase Firestore 서버에 데이터 추가 등록
        await addDoc(collection(db, "fitness_center_db"), {
            category,
            name,
            phone,
            dong,
            ho,
            content,
            createdAt: new Date().toISOString()
        });

        alert(`휘트니스 센터 관련 [${category}] 접수가 성공적으로 완료되었습니다.`);

        // 입력 완료 후 입력 폼 초기화 처리
        document.getElementById("fitCategory").value = "";
        document.getElementById("fitName").value = "";
        document.getElementById("fitPhone").value = "";
        document.getElementById("fitDong").value = "";
        document.getElementById("fitHo").value = "";
        document.getElementById("fitContent").value = "";

    }catch(err){
        console.error(err);
        alert("접수 실패. 시스템 관리자에게 문의하여 주시기 바랍니다.");
    }
};

