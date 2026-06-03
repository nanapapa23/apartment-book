import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = []; 
let currentCategory = "전체";
let searchQuery = "";

// 초성 검색 함수
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

// 검색 이벤트 리스너 설정
document.getElementById("adminSearch").addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderList(allBooks);
});

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

// 필터 및 검색이 적용된 목록 렌더링
function renderList(books) {
    const listDiv = document.getElementById("adminList");
    listDiv.innerHTML = "";
    
    const filtered = books.filter(b => {
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
        div.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.category || ''}</small></div>
                         <div><button onclick="editBook('${b.id}')">수정</button> <button onclick="deleteBook('${b.id}')">삭제</button></div>`;
        listDiv.appendChild(div);
    });
}

window.filterList = (cat) => {
    currentCategory = cat;
    renderList(allBooks);
};

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderStats(allBooks);
    renderList(allBooks);
}

// 수정/삭제 및 기타 기능 (동일)
window.editBook = async (id) => {
    const b = allBooks.find(item => item.id === id);
    document.getElementById("title").value = b.title;
    document.getElementById("author").value = b.author;
    document.getElementById("category").value = b.category || "";
    // ... 나머지 필드 값 할당 ...
    editId = id; saveBtn.innerText = "수정 저장";
};

window.deleteBook = async (id) => { if(confirm("삭제하시겠습니까?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };
// (이하 저장, CSV 업로드, 다운로드, 로그아웃 등 기존 로직 유지)
