import { db } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const [title, author, shelf, slot, newbook] = ["title", "author", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");
const adminList = document.getElementById("adminList");
let editId = null;

async function loadBooks() {
    adminList.innerHTML = "";
    const snapshot = await getDocs(collection(db, "books"));
    snapshot.forEach(d => {
        const b = d.data();
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.date || ''} ${b.newbook?'[신간]':''}</small></div>
                         <button class="editBtn" data-id="${d.id}">수정</button> <button class="deleteBtn" data-id="${d.id}">삭제</button>`;
        adminList.appendChild(div);
    });
}

saveBtn.onclick = async () => {
    const data = { title: title.value, author: author.value, shelf: shelf.value, slot: parseInt(slot.value), newbook: newbook.checked, date: new Date().toISOString().split('T')[0] };
    if(editId) { await updateDoc(doc(db, "books", editId), data); editId = null; saveBtn.innerText = "도서 추가"; }
    else { await addDoc(collection(db, "books"), data); }
    title.value = ""; author.value = ""; loadBooks();
};

adminList.onclick = async (e) => {
    if(e.target.className === "deleteBtn") { await deleteDoc(doc(db, "books", e.target.dataset.id)); loadBooks(); }
    if(e.target.className === "editBtn") {
        const snapshot = await getDocs(collection(db, "books"));
        const b = snapshot.docs.find(d => d.id === e.target.dataset.id).data();
        title.value = b.title; author.value = b.author; shelf.value = b.shelf; slot.value = b.slot; newbook.checked = b.newbook;
        editId = e.target.dataset.id; saveBtn.innerText = "수정 저장";
    }
};

document.getElementById("logoutBtn").onclick = () => { sessionStorage.removeItem("libraryAdmin"); location.href = "index.html"; };
loadBooks();
