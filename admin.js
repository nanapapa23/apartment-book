import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];
let currentCategory = "전체";
let searchQuery = "";
let editId = null;

// DOM 요소 매핑
const [title, author, publisher, imgUrl, regDate, category, shelf, slot, newbook] = 
      ["title", "author", "publisher", "imgUrl", "regDate", "category", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");

onAuthStateChanged(auth, async (user) => {
    if (!user) { location.href = "admin-login.html"; return; }
    await loadBooks();
});

// 정렬 로직 (신간 > 최근등록일 > 가나다순)
function sortBooks(data) {
    return data.sort((a, b) => {
        if (!!a.newbook !== !!b.newbook) return (b.newbook ? 1 : 0) - (a.newbook ? 1 : 0);
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return (a.title || "").localeCompare(b.title || "", "ko");
    });
}

// 현황 출력
function renderStats(books) {
    const statsContainer = document.getElementById("bookStats");
    if (!statsContainer) return;
    let counts = { "전체": books.length, "성인": 0, "청소년": 0, "어린이": 0, "어린이전용": 0, "자기개발": 0, "기타": 0, "신간": 0 };
    books.forEach(b => {
        if (counts.hasOwnProperty(b.category)) counts[b.category]++;
        else counts["기타"]++;
        if (b.newbook) counts["신간"]++;
    });
    statsContainer.innerHTML = `<div class="stats-grid">${Object.entries(counts).map(([name, count]) => `
        <div class="stat-box" onclick="filterList('${name}')" style="cursor:pointer; border:1px solid #ccc; padding:10px; margin:5px;">
            <div class="stat-count">${count}</div><div class="stat-label">${name}</div>
        </div>`).join('')}</div>`;
}

// 목록 출력
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
    renderStats(allBooks);
    renderList();
}

// 저장 기능 (중복체크 포함)
saveBtn.onclick = async () => {
    if(!category.value){ alert("카테고리를 선택하세요."); return; }
    const titleVal = title.value.trim();
    const authVal = author.value.trim();

    const isDuplicated = allBooks.some(b => b.id !== editId && b.title.trim() === titleVal && b.author.trim() === authVal);
    if(isDuplicated){ alert("이미 등록된 도서입니다."); return; }

    const data = {
        title: titleVal, author: authVal, publisher: publisher.value.trim(),
        imgUrl: imgUrl.value.trim(), date: regDate.value, category: category.value,
        shelf: shelf.value, slot: parseInt(slot.value) || 0, newbook: newbook.checked
    };

    if (editId) await updateDoc(doc(db, "books", editId), data);
    else await addDoc(collection(db, "books"), data);
    location.reload();
};

// CSV 업로드 (Batch 방식)
document.getElementById("csvFile").onchange = async (e) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
        const batch = writeBatch(db);
        let addCount = 0;
        event.target.result.split("\n").slice(1).forEach(row => {
            const cols = row.split(",");
            if(cols.length < 8) return;
            batch.set(doc(collection(db, "books")), {
                title: cols[0].trim(), author: cols[1].trim(), publisher: cols[2].trim(),
                imgUrl: cols[3], date: cols[4], category: cols[5], shelf: cols[6],
                slot: parseInt(cols[7]) || 0, newbook: cols[8] === "true"
            });
            addCount++;
        });
        await batch.commit();
        alert(`업로드 완료: ${addCount}건`);
        location.reload();
    };
    reader.readAsText(e.target.files[0], "UTF-8");
};

// 기타 함수들
window.editBook = (id) => {
    const b = allBooks.find(i => i.id === id);
    title.value = b.title; author.value = b.author; publisher.value = b.publisher || "";
    imgUrl.value = b.imgUrl || ""; regDate.value = b.date || ""; category.value = b.category || "";
    shelf.value = b.shelf; slot.value = b.slot; newbook.checked = b.newbook;
    editId = id; saveBtn.innerText = "수정 저장"; window.scrollTo(0, 0);
};

window.deleteBook = async (id) => { if(confirm("삭제?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };
window.filterList = (cat) => { currentCategory = cat; renderList(); };
document.getElementById("adminSearch").addEventListener("input", (e) => { searchQuery = e.target.value.toLowerCase(); renderList(); });
document.getElementById("logoutBtn").onclick = async () => { await signOut(auth); location.href = "index.html"; };
document.getElementById("downloadBtn").onclick = () => { /* ... 이전 다운로드 로직 유지 ... */ };
