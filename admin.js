import { db } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const [title, author, shelf, slot] = ["title", "author", "shelf", "slot"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");
const adminList = document.getElementById("adminList");

async function loadBooks() {
    adminList.innerHTML = "";
    const snapshot = await getDocs(collection(db, "books"));
    snapshot.forEach(doc => {
        const b = doc.data();
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `<div><strong>${b.title}</strong> (${b.shelf}-${b.slot}칸)</div>
                         <button class="deleteBtn" data-id="${doc.id}">삭제</button>`;
        adminList.appendChild(div);
    });
}

saveBtn.onclick = async () => {
    await addDoc(collection(db, "books"), {
        title: title.value, author: author.value, shelf: shelf.value, slot: parseInt(slot.value),
        date: new Date().toISOString().split('T')[0]
    });
    loadBooks();
};

// CSV 업로드
document.getElementById("fileInput").onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        const batch = writeBatch(db);
        e.target.result.split('\n').forEach(line => {
            const [t, a, s, sl] = line.split(',');
            if(t) batch.set(doc(collection(db, "books")), {title:t, author:a, shelf:s, slot:parseInt(sl)});
        });
        await batch.commit();
        loadBooks();
    };
    reader.readAsText(file);
};

// yymmdd 형식 다운로드
document.getElementById("downloadBtn").onclick = async () => {
    const snapshot = await getDocs(collection(db, "books"));
    let csv = "제목,저자,책장,칸\n";
    snapshot.forEach(d => { const b = d.data(); csv += `${b.title},${b.author},${b.shelf},${b.slot}\n`; });
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${new Date().toISOString().slice(2,10).replace(/-/g,'')}_booklist.csv`;
    a.click();
};

adminList.onclick = async (e) => {
    if(e.target.className === "deleteBtn") { await deleteDoc(doc(db, "books", e.target.dataset.id)); loadBooks(); }
};

document.getElementById("logoutBtn").onclick = () => { sessionStorage.removeItem("libraryAdmin"); location.href = "index.html"; };
loadBooks();
