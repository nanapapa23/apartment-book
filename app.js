limport { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
const newBooks = document.getElementById("newBooks");
const modal = document.getElementById("detailModal");
const closeBtn = document.getElementById("closeBtn");

let books = [];
let currentCategory = "전체";

/* --------------------- 초성 검색 기능 --------------------- */
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

/* --------------------- Firebase 데이터 로드 --------------------- */
async function loadBooks() {
    try {
        const snapshot = await getDocs(collection(db, "books"));
        books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderNewBooks();
        filterBooks();
    } catch(err) {
        console.error("데이터 로드 실패:", err);
    }
}

/* --------------------- 신간 도서 영역 렌더링 --------------------- */
function renderNewBooks() {
    newBooks.innerHTML = "";
    books.filter(b => b.newbook === true).forEach(book => {
        const div = document.createElement("div");
        div.className = "new-book-card";
        div.innerHTML = `
            <div style="font-weight:bold; margin-bottom:5px;">${book.title || ""}</div>
            <div style="font-size:12px; color:#666;">${book.author || ""}</div>
        `;
        div.onclick = () => showDetail(book);
        newBooks.appendChild(div);
    });
}

/* --------------------- 도서 목록 카드 렌더링 --------------------- */
function renderBooks(data) {
    bookList.innerHTML = "";
    if(data.length === 0) {
        bookList.innerHTML = "<div style='text-align:center; padding:20px; color:#999;'>검색 결과가 없습니다.</div>";
        return;
    }
    data.forEach(book => {
        const div = document.createElement("div");
        div.className = "book-card";
        div.innerHTML = `
            <div class="book-info">
                <div class="title">${book.title || ""}</div>
                <div class="author">${book.author || ""} | ${book.category || ""}</div>
            </div>
            <i class="fas fa-chevron-right" style="color:#ccc;"></i>
        `;
        div.onclick = () => showDetail(book);
        bookList.appendChild(div);
    });
}

/* --------------------- 필터링 로직 --------------------- */
function filterBooks() {
    const keyword = searchInput.value.trim().toLowerCase();
    const filtered = books.filter(book => {
        const title = (book.title || "").toLowerCase();
        const author = (book.author || "").toLowerCase();
        const choTitle = getChosung(book.title || "");
        
        const matchKeyword = title.includes(keyword) || author.includes(keyword) || choTitle.includes(getChosung(keyword));
        const matchCategory = currentCategory === "전체" || book.category === currentCategory;
        return matchKeyword && matchCategory;
    });
    renderBooks(filtered);
}

// 검색어 입력 이벤트
searchInput.addEventListener("input", filterBooks);

// 카테고리 클릭 이벤트
document.querySelectorAll(".category-item").forEach(item => {
    item.addEventListener("click", () => {
        currentCategory = item.dataset.category;
        filterBooks();
    });
});

/* --------------------- 상세 팝업 및 세로 책장 시각화 --------------------- */
function showDetail(book) {
    document.getElementById("detailTitle").innerText = book.title || "";
    const shelfView = document.getElementById("shelf
