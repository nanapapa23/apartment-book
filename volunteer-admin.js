import { db } from "./firebase.js";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const listContainer = document.getElementById("volunteerAdminList");

window.deleteVol = async (id) => {
    if(!confirm("해당 봉사 신청 항목을 삭제하시겠습니까?")) return;
    try {
        await deleteDoc(doc(db, "volunteer_applications", id));
        alert("삭제되었습니다.");
        loadVolunteers();
    } catch(err) {
        console.error(err);
        alert("삭제 실패");
    }
};

async function loadVolunteers(){
    listContainer.innerHTML = "";
    const q = query(collection(db, "volunteer_applications"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if(snap.empty){
        listContainer.innerHTML = "신청된 봉사 내역이 없습니다.";
        return;
    }

    snap.forEach(docSnap => {
        const v = docSnap.data();
        const id = docSnap.id;
        const div = document.createElement("div");
        div.className = "vol-admin-card";
        div.innerHTML = `
            신청자: ${v.name || ""} (${v.type || ""})
            동호수: ${v.address || "-"}
            연락처: ${v.phone || "-"}
            희망일시: ${v.dateTime || "-"} / 시간: ${v.duration || "-"}
            접수일: ${v.createdAt ? v.createdAt.substring(0,10) : "-"}
            신eness 완료 후 삭제
        `;
        listContainer.appendChild(div);
    });
}
loadVolunteers();
