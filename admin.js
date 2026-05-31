import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CSV 다운로드 함수
async function downloadCSV() {
    const querySnapshot = await getDocs(collection(db, "books"));
    let csv = "Title,Author,Category,Shelf,Slot,New\n";
    querySnapshot.forEach(doc => {
        const b = doc.data();
        csv += `${b.title},${b.author},${b.category},${b.shelf},${b.slot},${b.newbook}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    a.href = url;
    a.download = `${date}_booklist.csv`;
    a.click();
}

document.getElementById("downloadBtn").onclick = downloadCSV;
// ... 기존 로직(등록, 수정, 삭제)은 그대로 유지하고 위 다운로드 함수를 호출합니다.
