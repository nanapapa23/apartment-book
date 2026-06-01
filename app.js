import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
const newBooks = document.getElementById("newBooks");
const modal = document.getElementById("detailModal");
const closeBtn = document.getElementById("closeBtn");
const adminIcon = document.getElementById("adminIcon");

let books = [];
let currentCategory = "전체";

// Firebase 데이터 로드
async function loadBooks() {
    try {
        const snapshot = await getDocs(collection(db, "books"));
        books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderNewBooks();
        renderBooks(books);
    } catch(err) {
        console.error("데이터 로드 실패:", err);
    }
}

// 신간 도서 영역
function renderNewBooks() {
    newBooks.innerHTML = "";
    books.filter(b => b.newbook === true).forEach(book => {
        const div = document.createElement("div");
        div.className = "new-book-card";
        div.innerHTML = `<div class="new-title">${book.title}</div><div class="new-author">${book.author}</div>`;
        div.onclick = () => showDetail(book);
        newBooks.appendChild(div);
    });
}

// 도서 목록 렌더링
function renderBooks(data) {
    bookList.innerHTML = "";
    data.forEach(book => {
        const div = document.createElement("div");
        div.className = "book";
        div.innerHTML = `
            <div class="title">${book.title}</div>
            <div class="author">저자: ${book.author}</div>
            <div class="category">${book.category}</div>
        `;
        div.onclick = () => showDetail(book);
        bookList.appendChild(div);
    });
}

// 상세 정보 모달
function showDetail(book) {
    document.getElementById("detailTitle").innerText = book.title;
    document.getElementById("detailAuthor").innerText = "저자: " + book.author;
    document.getElementById("detailCategory").innerText = "분류: " + book.category;
    document.getElementById("detailLocation").innerText = `위치: ${book.shelf} 책장 / ${book.slot} 칸`;
    
    // 책장 시각화
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div class="shelf-box">${[1,2,3,4,5,6,7].map(i => 
        `<div class="slot ${i == book.slot ? 'active' : ''}">${i}</div>`).join('')}</div>`;
    
    modal.style.display = "block";
}

// 관리자 접속 이벤트
adminIcon.addEventListener("click", () => {
    const id = prompt("관리자 아이디");
    const pw = prompt("비밀번호");
    if(id === "admin" && pw === "1234") {
        sessionStorage.setItem("libraryAdmin", "true");
        window.location.href = "admin.html";
    } else {
        alert("권한이 없습니다.");
    }
});

// 검색 및 필터링 로직 생략(기존 동일)
closeBtn.onclick = () => modal.style.display = "none";
loadBooks();
