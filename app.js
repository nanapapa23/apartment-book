import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM 요소 참조
const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
const newBooks = document.getElementById("newBooks");
const modal = document.getElementById("detailModal");
const adminIcon = document.getElementById("adminIcon");

let books = [];
let currentCategory = "전체";

// 초성 검색 함수
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
function getChosung(str) {
    let result = "";
    for(let char of str) {
        const code = char.charCodeAt(0) - 44032;
        if(code >= 0 && code <= 11171) result += CHO[Math.floor(code / 588)];
        else result += char;
    }
    return result;
}

// 데이터 로드
async function loadBooks() {
    try {
        const snapshot = await getDocs(collection(db, "books"));
        books = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        
        // 신간 영역 렌더링
        newBooks.innerHTML = "";
        books.filter(b => b.newbook).sort((a,b) => (b.date || "").localeCompare(a.date || "")).forEach(b => {
            const div = document.createElement("div");
            div.className = "new-book-card";
            div.innerHTML = `<strong>${b.title}</strong><br><small>${b.author}</small>`;
            div.onclick = () => showDetail(b);
            newBooks.appendChild(div);
        });
        renderBookList(books);
    } catch(err) { console.error("로드 실패:", err); }
}

// 리스트 렌더링
function renderBookList(data) {
    bookList.innerHTML = "";
    const sorted = data.filter(b => currentCategory === "전체" || b.category === currentCategory)
                       .sort((a,b) => b.newbook - a.newbook);
    sorted.forEach(b => {
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `
            <div class="book-info">
                <div class="title">${b.title} ${b.newbook ? '<span style="color:red; font-size:12px;">[NEW]</span>' : ''}</div>
                <div class="author">${b.author} | ${b.category || '기타'} | 등록: ${b.date || ''}</div>
            </div>`;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author + " | " + (b.category || "기타");
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div style="text-align:center; margin:10px; font-weight:bold;">${b.shelf} 책장</div>`;
    const box = document.createElement("div");
    box.className = "shelf-box";
    for(let i=7; i>=1; i--) {
        box.innerHTML += `<div class="slot ${i==b.slot?'active':''}"><span>${i}칸</span></div>`;
    }
    shelfView.appendChild(box);
    modal.style.display = "block";
}

// 이벤트 연결 (오류 방지 위해 if문 사용)
if(adminIcon) adminIcon.onclick = () => {
    const id = prompt("관리자 아이디");
    const pw = prompt("비밀번호");
    if(id === "admin" && pw === "1234") {
        try { sessionStorage.setItem("libraryAdmin", "true"); } catch(e) { alert("저장소 접근이 차단됨"); }
        window.location.href = "admin.html";
    }
};

if(searchInput) searchInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    renderBookList(books.filter(b => 
        b.title.toLowerCase().includes(val) || 
        b.author.toLowerCase().includes(val) ||
        getChosung(b.title).includes(val)
    ));
});

document.querySelectorAll(".category-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        currentCategory = item.dataset.category;
        renderBookList(books);
    });
});

document.getElementById("closeBtn").onclick = () => modal.style.display = "none";
loadBooks();
