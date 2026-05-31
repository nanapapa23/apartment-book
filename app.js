import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
const newBooks = document.getElementById("newBooks");
const modal = document.getElementById("detailModal");
const closeBtn = document.getElementById("closeBtn");

let books = [];
let currentCategory = "전체";

/* --------------------- 초성 검색 --------------------- */
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

/* --------------------- Firebase 로드 --------------------- */
async function loadBooks() {
    try {
        const snapshot = await getDocs(collection(db, "books"));
        books = [];
        snapshot.forEach(doc => { books.push({ id: doc.id, ...doc.data() }); });
        renderNewBooks();
        filterBooks();
    } catch(err) {
        console.error(err);
        bookList.innerHTML = "<div class='empty-message'>데이터를 불러올 수 없습니다.</div>";
    }
}

/* --------------------- 신간도서 --------------------- */
function renderNewBooks() {
    newBooks.innerHTML = "";
    books.filter(book => book.newbook === true).forEach(book => {
        const div = document.createElement("div");
        div.className = "new-book-card";
        div.innerHTML = `<div class="title">${book.title || ""}</div><div class="author">${book.author || ""}</div>`;
        div.onclick = () => showDetail(book);
        newBooks.appendChild(div);
    });
}

/* --------------------- 목록 출력 --------------------- */
function renderBooks(data) {
    bookList.innerHTML = "";
    if(data.length === 0) {
        bookList.innerHTML = "<div class='empty-message'>검색 결과가 없습니다.</div>";
        return;
    }
    data.forEach(book => {
        const div = document.createElement("div");
        div.className = "book-card"; // style.css의 카드 클래스 적용
        div.innerHTML = `
            <div class="title">${book.title || ""}</div>
            <div class="author">저자: ${book.author || ""}</div>
            <div class="category">분류: ${book.category || ""}</div>
        `;
        div.onclick = () => showDetail(book);
        bookList.appendChild(div);
    });
}

/* --------------------- 필터링 --------------------- */
function filterBooks() {
    const keyword = searchInput.value.trim().toLowerCase();
    let filtered = books.filter(book => {
        const title = (book.title || "").toLowerCase();
        const author = (book.author || "").toLowerCase();
        const choTitle = getChosung(book.title || "");
        const searchMatch = title.includes(keyword) || author.includes(keyword) || choTitle.includes(getChosung(keyword));
        const categoryMatch = currentCategory === "전체" || book.category === currentCategory;
        return searchMatch && categoryMatch;
    });
    renderBooks(filtered);
}

searchInput.addEventListener("input", filterBooks);

/* --------------------- 카테고리 버튼 --------------------- */
document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        filterBooks();
    });
});

/* --------------------- 상세 팝업 및 책장 시각화 --------------------- */
function showDetail(book) {
    document.getElementById("detailTitle").innerText = book.title || "";
    document.getElementById("detailAuthor").innerText = "저자: " + (book.author || "");
    drawShelf(book);
    modal.style.display = "block";
}

function drawShelf(book) {
    const shelf = document.getElementById("shelfView");
    shelf.innerHTML = `<div style="text-align:center; margin:10px 0; font-weight:bold;">${book.shelf || ""} 책장</div>`;
    const box = document.createElement("div");
    box.className = "shelf-grid"; // style.css의 그리드 클래스
    for(let i = 1; i <= 7; i++) {
        const div = document.createElement("div");
        div.className = "slot" + (String(i) === String(book.slot) ? " active" : "");
        div.innerText = i;
        box.appendChild(div);
    }
    shelf.appendChild(box);
}

closeBtn.onclick = () => { modal.style.display = "none"; };
window.onclick = (e) => { if(e.target === modal) modal.style.display = "none"; };

/* --------------------- 시작 --------------------- */
loadBooks();

const adminIcon = document.getElementById("adminIcon");
if(adminIcon) {
    adminIcon.addEventListener("click", () => {
        const id = prompt("관리자 아이디");
        const pw = prompt("비밀번호");
        if(id === "admin" && pw === "1234") {
            sessionStorage.setItem("libraryAdmin", "true");
            window.location.href = "admin.html";
        } else if(id !== null) {
            alert("정보가 틀렸습니다.");
        }
    });
}
