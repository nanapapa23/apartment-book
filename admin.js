import { db } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const categoryInput = document.getElementById("category");
const newbookInput = document.getElementById("newbook");
const saveBtn = document.getElementById("saveBtn");
const adminList = document.getElementById("adminList");

let editId = null;

async function loadBooks() {
    adminList.innerHTML = "";
    const snapshot = await getDocs(collection(db, "books"));
    snapshot.forEach(doc => {
        const book = doc.data();
        const div = document.createElement("div");
        div.className = "admin-card";
        div.style = "display:flex; justify-content:space-between; align-items:center;";
        div.innerHTML = `
            <div><strong>${book.title}</strong><br><small>${book.author}</small></div>
            <div>
                <button class="editBtn" data-id="${doc.id}">✏️</button>
                <button class="deleteBtn" data-id="${doc.id}">🗑️</button>
            </div>
        `;
        adminList.appendChild(div);
    });
}

saveBtn.onclick = async () => {
    const data = { title: titleInput.value, author: authorInput.value, category: categoryInput.value, newbook: newbookInput.checked };
    if(editId) { await updateDoc(doc(db, "books", editId), data); editId = null; saveBtn.innerText = "도서 추가"; }
    else { await addDoc(collection(db, "books"), data); }
    titleInput.value = ""; authorInput.value = ""; loadBooks();
};

adminList.onclick = async (e) => {
    const id = e.target.dataset.id;
    if(e.target.className === "deleteBtn") { await deleteDoc(doc(db, "books", id)); loadBooks(); }
    if(e.target.className === "editBtn") {
        const docSnap = await getDocs(collection(db, "books"));
        const book = docSnap.docs.find(d => d.id === id).data();
        titleInput.value = book.title; authorInput.value = book.author; editId = id; saveBtn.innerText = "수정 저장";
    }
};

document.getElementById("logoutBtn").onclick = () => { sessionStorage.removeItem("libraryAdmin"); location.href = "index.html"; };
loadBooks();
