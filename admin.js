import { db } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const [title, author, shelf, slot, newbook] = ["title", "author", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");
const adminList = document.getElementById("adminList");

async function loadBooks() {
    adminList.innerHTML = "";
    const snapshot = await getDocs(collection(db, "books"));
    snapshot.forEach(doc => {
        const b = doc.data();
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `<div><strong>${b.title}</strong> (${b.shelf}-${b.slot}칸) ${b.newbook?'[신간]':''}</div>
                         <button class="deleteBtn" data-id="${doc.id}">삭제</button>`;
        adminList.appendChild(div);
    });
}

saveBtn.onclick = async () => {
    // 중복 체크
    const snapshot = await getDocs(collection(db, "books"));
    const exists = snapshot.docs.some(d => d.data().title === title.value);
    if(exists) { alert("이미 등록된 도서입니다."); return; }
    
    await addDoc(collection(db, "books"), {
        title: title.value, author: author.value, shelf: shelf.value, 
        slot: parseInt(slot.value), newbook: newbook.checked, date: new Date().toISOString().split('T')[0]
    });
    loadBooks();
};

// CSV 업로드 (중복 제외 필터링)
document.getElementById("fileInput").onchange = async (e) => {
    const snapshot = await getDocs(collection(db, "books"));
    const existingTitles = snapshot.docs.map(d => d.data().title);
    
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        const batch = writeBatch(db);
        e.target.result.split('\n').forEach(line => {
            const [t, a, s, sl] = line.split(',');
            if(t && !existingTitles.includes(t)) {
                batch.set(doc(collection(db, "books")), {title:t, author:a, shelf:s, slot:parseInt(sl), newbook:false});
            }
        });
        await batch.commit();
        alert("업로드 완료");
        loadBooks();
    };
    reader.readAsText(file);
};

// 엑셀 깨짐 방지 다운로드 (BOM 추가)
document.getElementById("downloadBtn").onclick = async () => {
    const snapshot = await getDocs(collection(db, "books"));
    let csv = "\uFEFF제목,저자,책장,칸,신간\n";
    snapshot.forEach(d => { const b = d.data(); csv += `${b.title},${b.author},${b.shelf},${b.slot},${b.newbook}\n`; });
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${new Date().toISOString().slice(2,10).replace(/-/g,'')}_booklist.csv`;
    a.click();
};

document.getElementById("adminList").onclick = async (e) => {
    if(e.target.className === "deleteBtn") { await deleteDoc(doc(db, "books", e.target.dataset.id)); loadBooks(); }
};
document.getElementById("logoutBtn").onclick = () => { sessionStorage.removeItem("libraryAdmin"); location.href = "index.html"; };
loadBooks();
