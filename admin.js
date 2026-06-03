import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];
let editId = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) { location.href = "admin-login.html"; return; }
    await loadBooks();
});

// 다운로드 기능: Blob을 사용하여 파일 다운로드 오류 방지
document.getElementById("downloadBtn").onclick = async () => {
    let csv = "\uFEFF제목,저자,이미지URL,등록일,카테고리,책장,칸,신간\n";
    allBooks.forEach(b => {
        csv += `${b.title || ""},${b.author || ""},${b.imgUrl || ""},${b.date || ""},${b.category || ""},${b.shelf || ""},${b.slot || ""},${b.newbook || false}\n`;
    });
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "booklist.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 도서 저장/수정 함수
document.getElementById("saveBtn").onclick = async () => {
    const data = {
        title: document.getElementById("title").value.trim(),
        author: document.getElementById("author").value.trim(),
        imgUrl: document.getElementById("imgUrl").value,
        date: document.getElementById("regDate").value,
        category: document.getElementById("category").value,
        shelf: document.getElementById("shelf").value,
        slot: parseInt(document.getElementById("slot").value),
        newbook: document.getElementById("newbook").checked
    };

    if (editId) await updateDoc(doc(db, "books", editId), data);
    else await addDoc(collection(db, "books"), data);
    
    location.reload();
};

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderList(allBooks);
}

function renderList(books) {
    const listDiv = document.getElementById("adminList");
    listDiv.innerHTML = "";
    books.forEach(b => {
        const div = document.createElement("div");
        div.style = "padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;";
        div.innerHTML = `<div><strong>${b.title}</strong> (${b.shelf}-${b.slot}칸)<br><small>${b.author}</small></div>
                         <div><button onclick="editBook('${b.id}')">수정</button> <button onclick="deleteBook('${b.id}')">삭제</button></div>`;
        listDiv.appendChild(div);
    });
}

window.editBook = (id) => {
    const b = allBooks.find(i => i.id === id);
    document.getElementById("title").value = b.title;
    document.getElementById("shelf").value = b.shelf;
    document.getElementById("slot").value = b.slot;
    document.getElementById("newbook").checked = b.newbook;
    editId = id;
    document.getElementById("saveBtn").innerText = "수정 저장";
};
