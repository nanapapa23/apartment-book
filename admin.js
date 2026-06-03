import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = []; // [추가] 전체 데이터를 저장할 변수
let currentCategory = "전체"; // [추가] 현재 선택된 필터

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("관리자 로그인이 필요합니다.");
        location.href = "admin-login.html";
        return;
    }
    await loadBooks();
});

const [title, author, imgUrl, regDate, category, shelf, slot, newbook] = 
      ["title", "author", "imgUrl", "regDate", "category", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");
let editId = null;

// [수정] 통계 렌더링 함수: 클릭 시 필터링 기능 추가
function renderStats(books) {
    let counts = { "전체": books.length, "성인": 0, "청소년": 0, "어린이": 0, "자기개발": 0, "기타": 0, "신간": 0 };
    
    books.forEach(b => {
        if (counts.hasOwnProperty(b.category)) counts[b.category]++;
        else counts["기타"]++;
        if (b.newbook) counts["신간"]++;
    });

    document.getElementById("bookStats").innerHTML = `
        <div class="stats-grid">
            ${Object.entries(counts).map(([name, count]) => `
                <div class="stat-box" onclick="filterList('${name}')" style="cursor:pointer;">
                    <div class="stat-count">${count}</div>
                    <div class="stat-label">${name}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// [수정] 목록 렌더링 함수: 필터링 적용
function renderList(books) {
    const listDiv = document.getElementById("adminList");
    listDiv.innerHTML = "";
    
    const filtered = currentCategory === "전체" 
        ? books 
        : (currentCategory === "신간" ? books.filter(b => b.newbook) : books.filter(b => b.category === currentCategory));

    filtered.forEach(b => {
        const div = document.createElement("div");
        div.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.category || ''}</small></div>
                         <div><button onclick="editBook('${b.id}')">수정</button> <button onclick="deleteBook('${b.id}')">삭제</button></div>`;
        listDiv.appendChild(div);
    });
}

// [추가] 필터 실행 함수
window.filterList = (cat) => {
    currentCategory = cat;
    renderList(allBooks);
};

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    allBooks = [];
    snap.forEach(d => allBooks.push({ id: d.id, ...d.data() }));
    
    renderStats(allBooks);
    renderList(allBooks);
}

window.editBook = async (id) => {
    const b = allBooks.find(item => item.id === id);
    title.value = b.title; author.value = b.author; imgUrl.value = b.imgUrl || "";
    regDate.value = b.date || ""; category.value = b.category || ""; shelf.value = b.shelf; slot.value = b.slot; newbook.checked = b.newbook;
    editId = id; saveBtn.innerText = "수정 저장";
};

window.deleteBook = async (id) => { if(confirm("삭제하시겠습니까?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };

saveBtn.onclick = async () => {
    if(!category.value){ alert("카테고리를 선택하세요."); return; }
    const data = { title:title.value.trim(), author:author.value.trim(), imgUrl:imgUrl.value, date:regDate.value, category:category.value, shelf:shelf.value, slot:parseInt(slot.value), newbook:newbook.checked };
    
    if(editId) await updateDoc(doc(db,"books",editId), data);
    else await addDoc(collection(db,"books"), data);
    location.reload();
};

document.getElementById("csvFile").onchange = async (e) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
        const batch = writeBatch(db);
        event.target.result.split("\n").slice(1).forEach(row => {
            const cols = row.split(",");
            if(cols.length < 7) return;
            batch.set(doc(collection(db,"books")), { title:cols[0].trim(), author:cols[1].trim(), imgUrl:cols[2], date:cols[3], category:cols[4], shelf:cols[5], slot:parseInt(cols[6]), newbook:cols[7] === "true" });
        });
        await batch.commit();
        alert("업로드 완료");
        location.reload();
    };
    reader.readAsText(e.target.files[0], "UTF-8");
};

document.getElementById("downloadBtn").onclick = async ()=>{
    let csv = "\uFEFF제목,저자,이미지URL,등록일,카테고리,책장,칸,신간\n";
    allBooks.forEach(b => {
        csv += `${b.title || ""},${b.author || ""},${b.imgUrl || ""},${b.date || ""},${b.category || ""},${b.shelf || ""},${b.slot || ""},${b.newbook || false}\n`;
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
    a.download = "booklist.csv";
    a.click();
};

document.getElementById("logoutBtn").onclick = async () => { await signOut(auth); location.href = "index.html"; };
