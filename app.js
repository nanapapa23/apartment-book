import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
const newBooks = document.getElementById("newBooks");
const modal = document.getElementById("detailModal");
const closeBtn = document.getElementById("closeBtn");

let books = [];
let currentCategory = "전체";

// Firebase 데이터 로드
async function loadBooks() {
    try {
        const snapshot = await getDocs(collection(db, "books"));
        books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderNewBooks();
        filterBooks();
    } catch(err) {
        console.error(err);
    }
}

// 신간 목록 표시
function renderNewBooks() {
    newBooks.innerHTML = "";
    books.filter(b => b.newbook === true).forEach(book => {
        const div = document.createElement("div");
        div.className = "new-book-card";
        div.innerHTML = `<div>${book.title}</div><small style="color:#888;">${book.author}</small>`;
        div.onclick = () => showDetail(book);
        newBooks.appendChild(div);
    });
}

// 전체 도서 필터링 (검색어 + 카테고리)
function filterBooks() {
    const keyword = searchInput.value.trim().toLowerCase();
    const filtered = books.filter(book => {
        const matchKeyword = book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword);
        const matchCategory = currentCategory === "전체" || book.category === currentCategory;
        return matchKeyword && matchCategory;
    });

    bookList.innerHTML = "";
    filtered.forEach(book => {
        const div = document.createElement("div");
        div.className = "book";
        div.style = "background:white; padding:15px; border-radius:15px; margin-bottom:10px; border:1px solid #eee;";
        div.innerHTML = `<strong>${book.title}</strong><br><span style="color:#666;">${book.author}</span>`;
        div.onclick = () => showDetail(book);
        bookList.appendChild(div);
    });
}

// 카테고리 클릭 이벤트 (그리드 방식)
document.querySelectorAll(".category-item").forEach(item => {
    item.addEventListener("click", () => {
        currentCategory = item.dataset.category;
        filterBooks();
    });
});

// 검색 이벤트
searchInput.addEventListener("input", filterBooks);

// 상세 팝업 및 책장 시각화
function showDetail(book) {
    document.getElementById("detailTitle").innerText = book.title;
    document.getElementById("detailAuthor").innerText = "저자: " + book.author;
    const shelf = document.getElementById("shelfView");
    shelf.innerHTML = `<div style="text-align:center; margin-bottom:10px;"><strong>${book.shelf} 책장</strong></div>`;
    
    const box = document.createElement("div");
    box.className = "shelf-box";
    for(let i=1; i<=7; i++) {
        const div = document.createElement("div");
        div.className = "slot" + (String(i) === String(book.slot) ? " active" : "");
        div.innerText = i + "칸";
        box.appendChild(div);
    }
    shelf.appendChild(box);
    modal.style.display = "block";
}

closeBtn.onclick = () => modal.style.display = "none";
loadBooks();

// 관리자 모드 이동
document.getElementById("adminIcon").onclick = () => {
    const id = prompt("관리자 아이디");
    const pw = prompt("비밀번호");
    if(id === "admin" && pw === "1234") {
        sessionStorage.setItem("libraryAdmin", "true");
        window.location.href = "admin.html";
    }
};
