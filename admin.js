import { db } from "./firebase.js";
import { collection, addDoc, getDocs, writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 저장 로직 (수정 시 로직 추가 필요)
document.getElementById("saveBtn").onclick = async () => {
    await addDoc(collection(db, "books"), {
        title: document.getElementById("title").value,
        author: document.getElementById("author").value,
        imageUrl: document.getElementById("imageUrl").value,
        shelf: document.getElementById("shelf").value,
        slot: document.getElementById("slot").value,
        newbook: document.getElementById("newbook").checked
    });
    alert("저장 완료");
};

// CSV 다운로드 (파일명: yymmdd_booklist.csv)
document.getElementById("exportBtn").onclick = async () => {
    const snapshot = await getDocs(collection(db, "books"));
    let csv = "도서명,저자,이미지URL,책장,칸,신간\n";
    snapshot.forEach(d => { const b = d.data(); csv += `${b.title},${b.author},${b.imageUrl},${b.shelf},${b.slot},${b.newbook}\n`; });
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${date}_booklist.csv`;
    link.click();
};
