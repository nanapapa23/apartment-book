import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];
let currentCategory = "전체";
let searchQuery = "";
let editId = null;

// DOM 로드 완료 시 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", handleSave);
    }
});

const getInitialSound = (str) => {
    const onset = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    return str.split("").map(char => {
        const code = char.charCodeAt(0) - 44032;
        if(code > -1 && code < 11172) return onset[Math.floor(code / 588)];
        return char;
    }).join("");
};

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
    let counts = { "전체": books.length, "성인": 0, "청소년": 0, "어린이": 0, "자기개발": 0, "기타": 0, "신간": 0 };
    books.forEach(b => {
        if (counts.hasOwnProperty(b.category)) counts[b.category]++;
        else counts["기타"]++;
        if (b.newbook) counts["신간"]++;
    });
    statsContainer.innerHTML = `
        <div class="stats-grid">
            ${Object.entries(counts).map(([name, count]) => `
                <div class="stat-box" onclick="filterList('${name}')" style="cursor:pointer; border:1px solid #ccc; padding:10px; margin:5px;">
                    <div class="stat-count">${count}</div>
                    <div class="stat-label">${name}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// 목록 출력
function renderList() {
    const listDiv = document.getElementById("adminList");
    if (!listDiv) return;
    listDiv.innerHTML = "";
    
    let filtered = allBooks.filter(b => {
        const matchCat = (currentCategory === "전체" || (currentCategory === "신간" ? b.newbook : b.category === currentCategory));
        const matchSearch = ((b.title || "").toLowerCase().includes(searchQuery) || (b.author || "").toLowerCase().includes(searchQuery) || (b.publisher || "").toLowerCase().includes(searchQuery) || getInitialSound(b.title || "").includes(searchQuery));
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

// 저장/수정 함수
async function handleSave() {
    const data = {
        title: document.getElementById("title").value.trim(),
        author: document.getElementById("author").value.trim(),
        publisher: document.getElementById("publisher").value.trim(),
        imgUrl: document.getElementById("imgUrl").value.trim(),
        date: document.getElementById("regDate").value,
        category: document.getElementById("category").value,
        shelf: document.getElementById("shelf").value,
        slot: parseInt(document.getElementById("slot").value) || 0,
        newbook: document.getElementById("newbook").checked
    };
    if (!data.title) { alert("도서명을 입력하세요!"); return; }
    try {
        if (editId) await updateDoc(doc(db, "books", editId), data);
        else await addDoc(collection(db, "books"), data);
        alert("저장되었습니다.");
        location.reload();
    } catch (e) { alert("저장 실패: " + e.message); }
}

window.filterList = (cat) => { currentCategory = cat; renderList(); };
document.getElementById("adminSearch").addEventListener("input", (e) => { searchQuery = e.target.value.toLowerCase(); renderList(); });

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

window.deleteBook = async (id) => { if(confirm("삭제하시겠습니까?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };

document.getElementById("logoutBtn").onclick = async () => { await signOut(auth); location.href = "index.html"; };
