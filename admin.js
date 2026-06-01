import { db } from "./firebase.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const [title, author, imgUrl, regDate, category, shelf, slot, newbook] = 
      ["title", "author", "imgUrl", "regDate", "category", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
let editId = null;

async function loadBooks() {
    document.getElementById("adminList").innerHTML = "";
    const snap = await getDocs(collection(db, "books"));
    snap.forEach(d => {
        const b = d.data();
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.date}</small></div>
                         <button onclick="editBook('${d.id}')">수정</button> <button onclick="deleteBook('${d.id}')">삭제</button>`;
        document.getElementById("adminList").appendChild(div);
    });
}

window.editBook = async (id) => {
    const snap = await getDocs(collection(db, "books"));
    const b = snap.docs.find(d => d.id === id).data();
    title.value = b.title; author.value = b.author; imgUrl.value = b.imgUrl || "";
    regDate.value = b.date || ""; category.value = b.category || ""; shelf.value = b.shelf; slot.value = b.slot; newbook.checked = b.newbook;
    editId = id;
};

window.deleteBook = async (id) => { await deleteDoc(doc(db, "books", id)); location.reload(); };

document.getElementById("saveBtn").onclick = async () => {
    const data = { title:title.value, author:author.value, imgUrl:imgUrl.value, date:regDate.value, category:category.value, shelf:shelf.value, slot:parseInt(slot.value), newbook:newbook.checked };
    if(editId) await updateDoc(doc(db, "books", editId), data);
    else await addDoc(collection(db, "books"), data);
    location.reload();
};

document.getElementById("downloadBtn").onclick = async () => {
    const snap = await getDocs(collection(db, "books"));
    let csv = "\uFEFF제목,저자,이미지URL,등록일,카테고리,책장,칸,신간\n";
    snap.forEach(d => { const b = d.data(); csv += `${b.title},${b.author},${b.imgUrl},${b.date},${b.category},${b.shelf},${b.slot},${b.newbook}\n`; });
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = "booklist.csv"; a.click();
};

document.getElementById("logoutBtn").onclick = () => { sessionStorage.removeItem("libraryAdmin"); location.href = "index.html"; };
loadBooks();
