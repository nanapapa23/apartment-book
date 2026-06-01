import { db } from "./firebase.js";
import { collection, getDocs, addDoc, writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CSV 다운로드 (yymmdd_booklist.csv)
async function downloadCSV() {
    const snapshot = await getDocs(collection(db, "books"));
    let csv = "title,author,category,shelf,slot,newbook\n";
    snapshot.forEach(d => { const b = d.data(); csv += `${b.title},${b.author},${b.category},${b.shelf},${b.slot},${b.newbook}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    a.href = URL.createObjectURL(blob);
    a.download = `${date}_booklist.csv`;
    a.click();
}

// CSV 업로드 (Batch 사용으로 대용량 처리)
document.getElementById("uploadBtn").onclick = async () => {
    const file = document.getElementById("uploadFile").files[0];
    if (!file) return alert("파일을 선택하세요.");
    const reader = new FileReader();
    reader.onload = async (e) => {
        const rows = e.target.result.split('\n').slice(1);
        const batch = writeBatch(db);
        rows.forEach(row => {
            const [title, author, category, shelf, slot, newbook] = row.split(',');
            if (title) {
                const ref = doc(collection(db, "books"));
                batch.set(ref, { title, author, category, shelf, slot: parseInt(slot), newbook: newbook === 'true' });
            }
        });
        await batch.commit();
        alert("업로드 완료!");
        location.reload();
    };
    reader.readAsText(file);
};

document.getElementById("downloadBtn").onclick = downloadCSV;
// ... (기존 등록/수정/삭제 로직 포함) ...
