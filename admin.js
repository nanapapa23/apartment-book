import { db } from "./firebase.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const [title, author, imgUrl, regDate, category, shelf, slot, newbook] = 
      ["title", "author", "imgUrl", "regDate", "category", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");
let editId = null;

async function loadBooks() {
    document.getElementById("adminList").innerHTML = "";
    const snap = await getDocs(collection(db, "books"));
    snap.forEach(d => {
        const b = d.data();
        const div = document.createElement("div");
        div.className = "book-item";
        div.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.category || ''}</small></div>
                         <div><button onclick="editBook('${d.id}')">수정</button> <button onclick="deleteBook('${d.id}')">삭제</button></div>`;
        document.getElementById("adminList").appendChild(div);
    });
}

window.editBook = async (id) => {
    const snap = await getDocs(collection(db, "books"));
    const b = snap.docs.find(d => d.id === id).data();
    title.value = b.title; author.value = b.author; imgUrl.value = b.imgUrl || "";
    regDate.value = b.date || ""; category.value = b.category || ""; shelf.value = b.shelf; slot.value = b.slot; newbook.checked = b.newbook;
    editId = id; saveBtn.innerText = "수정 저장";
};

window.deleteBook = async (id) => { if(confirm("삭제하시겠습니까?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };

saveBtn.onclick = async () => {
    if(!category.value) { alert("카테고리를 선택하세요."); return; }
    const data = { title:title.value, author:author.value, imgUrl:imgUrl.value, date:regDate.value, category:category.value, shelf:shelf.value, slot:parseInt(slot.value), newbook:newbook.checked };
    if(editId) await updateDoc(doc(db, "books", editId), data);
    else await addDoc(collection(db, "books"), data);
    location.reload();
};

document.getElementById("logoutBtn").onclick = () => { sessionStorage.removeItem("libraryAdmin"); location.href = "index.html"; };
loadBooks();
