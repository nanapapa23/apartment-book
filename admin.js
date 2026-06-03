import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];
let currentCategory = "전체";
let searchQuery = "";
let editId = null;

// [핵심] HTML이 다 로드된 후 이벤트를 연결합니다.
document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            console.log("저장 버튼 클릭됨!");
            await handleSave();
        });
    }
});

onAuthStateChanged(auth, async (user) => {
    if (!user) { location.href = "admin-login.html"; return; }
    await loadBooks();
});

// 저장 로직
async function handleSave() {
    const title = document.getElementById("title").value.trim();
    if (!title) { alert("도서명을 입력하세요!"); return; }

    const data = {
        title: title,
        author: document.getElementById("author").value.trim(),
        publisher: document.getElementById("publisher").value.trim(),
        imgUrl: document.getElementById("imgUrl").value.trim(),
        date: document.getElementById("regDate").value,
        category: document.getElementById("category").value,
        shelf: document.getElementById("shelf").value,
        slot: parseInt(document.getElementById("slot").value) || 0,
        newbook: document.getElementById("newbook").checked
    };

    try {
        if (editId) {
            await updateDoc(doc(db, "books", editId), data);
            alert("수정되었습니다.");
        } else {
            await addDoc(collection(db, "books"), data);
            alert("등록되었습니다.");
        }
        location.reload(); 
    } catch (e) {
        console.error("저장 에러:", e);
        alert("저장 실패: " + e.message);
    }
}

// 나머지 함수들
function sortBooks(data) {
    return data.sort((a, b) => {
        if (!!a.newbook !== !!b.newbook) return (b.newbook ? 1 : 0) - (a.newbook ? 1 : 0);
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return (a.title || "").localeCompare(b.title || "", "ko");
    });
}

function renderList() {
    const listDiv = document.getElementById("adminList");
    if (!listDiv) return;
    listDiv.innerHTML = "";
    
    let filtered = allBooks.filter(b => {
        const matchCat = (currentCategory === "전체" || (currentCategory === "신간" ? b.newbook : b.category === currentCategory));
        const matchSearch = ((b.title || "").toLowerCase().includes(searchQuery) || (b.author || "").toLowerCase().includes(searchQuery) || (b.publisher || "").toLowerCase().includes(searchQuery));
        return matchCat && matchSearch;
    });

    sortBooks(filtered).forEach(b => {
        const div = document.createElement("div");
        div.style = "padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;";
        div.innerHTML = `<div><strong>${b.title}</strong> (${b.shelf}-${b.slot}칸)<br><small>${b.author} | ${b.publisher || '출판사없음'} | ${b.category || ''}</small></div>
                         <div><button onclick="editBook('${b.id}')">수정</button> <button onclick="deleteBook('${b.id}')">삭제</button></div>`;
        listDiv.appendChild(div);
    });
}

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderList();
}

window.editBook = (id) => {
    const b = allBooks.find(i => i.id === id);
    document.getElementById("title").value = b.title;
    document.getElementById("author").value = b.author;
    document.getElementById("publisher").value = b.publisher || "";
    document.getElementById("imgUrl").value = b.imgUrl || "";
    document.getElementById("regDate").value = b.date || "";
    document.getElementById("category").value = b.category || "";
    document.getElementById("shelf").value = b.shelf;
    document.getElementById("slot").value = b.slot;
    document.getElementById("newbook").checked = b.newbook;
    editId = id;
    document.getElementById("saveBtn").innerText = "수정 저장";
    window.scrollTo(0, 0);
};

window.deleteBook = async (id) => { 
    if(confirm("정말 삭제하시겠습니까?")) { 
        await deleteDoc(doc(db, "books", id)); 
        location.reload(); 
    } 
};

document.getElementById("logoutBtn").onclick = async () => { await signOut(auth); location.href = "index.html"; };
