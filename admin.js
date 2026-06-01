import { db } from "./firebase.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const [title, author, imgUrl, regDate, shelf, slot, newbook] = 
      ["title", "author", "imgUrl", "regDate", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");
const adminList = document.getElementById("adminList");
let editId = null;

async function loadBooks() {
    adminList.innerHTML = "";
    const snap = await getDocs(collection(db, "books"));
    snap.forEach(d => {
        const b = d.data();
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.date}</small></div>
                         <button onclick="editBook('${d.id}')">수정</button> <button onclick="deleteBook('${d.id}')">삭제</button>`;
        adminList.appendChild(div);
    });
}

window.editBook = async (id) => {
    const snap = await getDocs(collection(db, "books"));
    const b = snap.docs.find(d => d.id === id).data();
    title.value = b.title; author.value = b.author; imgUrl.value = b.imgUrl || ""; 
    regDate.value = b.date || ""; shelf.value = b.shelf; slot.value = b.slot; newbook.checked = b.newbook;
    editId = id; saveBtn.innerText = "수정 저장";
};

window.deleteBook = async (id) => { await deleteDoc(doc(db, "books", id)); location.reload(); };

saveBtn.onclick = async () => {
    const data = { title:title.value, author:author.value, imgUrl:imgUrl.value, date:regDate.value, shelf:shelf.value, slot:parseInt(slot.value), newbook:newbook.checked };
    if(editId) { await updateDoc(doc(db, "books", editId), data); }
    else { await addDoc(collection(db, "books"), data); }
    location.reload();
};

document.getElementById("logoutBtn").onclick = () => { sessionStorage.removeItem("libraryAdmin"); location.href = "index.html"; };
loadBooks();
