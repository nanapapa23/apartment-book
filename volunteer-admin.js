import { db } from "./firebase.js";
import {
collection,
getDocs,
deleteDoc,
doc,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const volunteerAdminList = document.getElementById("volunteerAdminList");

/* --------------------
   봉사 신청 삭제 기능
-------------------- */
window.deleteVolunteer = async (id) => {
    if(!confirm("해당 봉사 신청 현황을 데이터에서 완전히 삭제하시겠습니까?")) return;

    try {
        await deleteDoc(doc(db, "volunteer_applications", id));
        alert("삭제 처리가 완료되었습니다.");
        loadVolunteers();
    } catch(err) {
        console.error(err);
        alert("삭제 작업에 실패했습니다.");
    }
};

/* --------------------
   신청 목록 조회
-------------------- */
async function loadVolunteers(){
    volunteerAdminList.innerHTML = "";

    const q = query(
        collection(db, "volunteer_applications"),
        orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if(snap.empty){
        volunteerAdminList.innerHTML = `
            <div style="padding:40px; text-align:center; color:#888;">신청된 자원봉사 내역이 없습니다.</div>
        `;
        return;
    }

    snap.forEach(docSnap => {
        const v = docSnap.data();
        const id = docSnap.id;

        const div = document.createElement("div");
        div.className = "vol-admin-card";

        // 희망 일정 부분에 [평일/주말] 정보 데이터가 연동되어 직관적으로 출력됩니다.
        div.innerHTML = `
            <div class="vol-admin-name">${v.name || "미입력"} (${v.dong || "-"} ${v.ho || "-"})</div>
            <div class="vol-admin-info"><span>연락처 :</span> ${v.phone || "-"}</div>
            <div class="vol-admin-info"><span>참여 형태 :</span> ${v.type || "-"}</div>
            <div class="vol-admin-info"><span>희망 일정 :</span> ${v.date || "-"} (${v.dayType || "미지정"}) / ${v.startTime || "시간미지정"} 시작 (${v.duration || "-"})</div>
            <div class="vol-admin-info"><span>비고/기타 :</span> ${v.comment || "-"}</div>
            <div class="vol-admin-info" style="font-size:12px; color:#999; margin-top:8px;">신청 일시 : ${v.createdAt ? v.createdAt.replace('T', ' ').substring(0, 16) : "-"}</div>
            
            <button class="btn-delete-vol" onclick="deleteVolunteer('${id}')">신청 내역 삭제</button>
        `;

        volunteerAdminList.appendChild(div);
    });
}

/* --------------------
   시작
-------------------- */
loadVolunteers();
