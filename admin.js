import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = []; 
let currentCategory = "전체";
let searchQuery = ""; // 검색어 상태 추가

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

// [추가] 검색창 UI 렌더링
function renderSearchUI() {
    const container = document.getElementById("adminList"); // 목록 상단에 삽입하기 위함
    const searchWrapper = document.createElement("div");
    searchWrapper.style = "margin-bottom:20px; padding:10px; background:#f9f9f9; border-radius:10px;";
    searchWrapper.innerHTML = `<input type="text" id="searchBar" placeholder="제목/저자/초성 검색..." style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc;">`;
    
    // 기존 목록 컨테이너 앞에 검색창 삽입
    document.querySelector(".admin-card:last-child").prepend(searchWrapper);
    
    document.getElementById("searchBar").addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderList(allBooks);
    });
}

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

// [수정] 검색 기능이 포함된 리스트 렌더링
function renderList(books) {
    const listDiv = document.getElementById("adminList");
    // 검색창이 이미 있으면 유지하고 목록만 초기화
    const listContent = listDiv.querySelectorAll(":scope > div:not(:first-child)");
    listContent.forEach(el => el.remove());

    const filtered = books.filter(b => {
        const matchCat = (currentCategory === "전체" || (currentCategory === "신간" ? b.newbook : b.category === currentCategory));
        const matchSearch = (
            b.title.toLowerCase().includes(searchQuery) || 
            b.author.toLowerCase().includes(searchQuery) ||
            getInitialSound(b.title).includes(searchQuery)
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
    renderSearchUI(); // 검색창 생성
    renderList(allBooks); // 초기 목록 출력
}

// ... 기타 수정/삭제/로그아웃 기능은 기존과 동일 ...
window.editBook = async (id) => { /* 동일 */ };
window.deleteBook = async (id) => { if(confirm("삭제하시겠습니까?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };
saveBtn.onclick = async () => { /* 동일 */ };
document.getElementById("csvFile").onchange = async (e) => { /* 동일 */ };
document.getElementById("downloadBtn").onclick = async () => { /* 동일 */ };
document.getElementById("logoutBtn").onclick = async () => { await signOut(auth); location.href = "index.html"; };
