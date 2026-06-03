import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];
let currentCategory = "전체";
let searchQuery = "";

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

// 검색 이벤트
document.getElementById("adminSearch").addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderList();
});

// 필터 변경 시 호출
window.filterList = (cat) => {
    currentCategory = cat;
    renderList();
};

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
                <div class="stat-box" onclick="filterList('${name}')" style="cursor:pointer; border:1px solid #ccc; padding:10px;">
                    <div class="stat-count">${count}</div>
                    <div class="stat-label">${name}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderList() {
    const listDiv = document.getElementById("adminList");
    listDiv.innerHTML = "";
    
    const filtered = allBooks.filter(b => {
        const matchCat = (currentCategory === "전체" || (currentCategory === "신간" ? b.newbook : b.category === currentCategory));
        const matchSearch = (
            (b.title || "").toLowerCase().includes(searchQuery) || 
            (b.author || "").toLowerCase().includes(searchQuery) ||
            getInitialSound(b.title || "").includes(searchQuery)
        );
        return matchCat && matchSearch;
    });

    filtered.forEach(b => {
        const div = document.createElement("div");
        div.style = "padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;";
        div.innerHTML = `<div><strong>${b.title}</strong> (${b.shelf}-${b.slot}칸)<br><small>${b.author} | ${b.category || ''}</small></div>
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

// 수정/삭제 함수 유지
window.editBook = (id) => { /* 기존 로직 */ };
window.deleteBook = async (id) => { if(confirm("삭제?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };
// 기타 저장, CSV 기능 등 유지...
