import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
const newBooks = document.getElementById("newBooks");
const modal = document.getElementById("detailModal");
let books = [];
let currentCategory = "전체";

async function loadBooks() {
    const snapshot = await getDocs(collection(db, "books"));
    books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderNewBooks();
    renderBookList(books);
}

// 신간 목록 렌더링
function renderNewBooks() {
    newBooks.innerHTML = "";
    books.filter(b => b.newbook).forEach(b => {
        const div = document.createElement("div");
        div.className = "new-book-card";
        div.innerHTML = `<strong>${b.title}</strong><br><small>${b.author}</small>`;
        div.onclick = () => showDetail(b);
        newBooks.appendChild(div);
    });
}

// 도서 목록 카드형 렌더링
function renderBookList(data) {
    bookList.innerHTML = "";
    const filtered = data.filter(b => currentCategory === "전체" || b.category === currentCategory);
    
    filtered.forEach(b => {
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `
            <div class="book-info">
                <div class="title">${b.title}</div>
                <div class="author">${b.author}</div>
            </div>
            <i class="fas fa-chevron-right" style="color:#ccc;"></i>
        `;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

// 카테고리 클릭 반응 추가
document.querySelectorAll(".category-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        currentCategory = item.dataset.category;
        renderBookList(books);
    });
});

// 검색 기능
searchInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = books.filter(b => b.title.toLowerCase().includes(val) || b.author.toLowerCase().includes(val));
    renderBookList(filtered);
});

// 상세 보기 모달
function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author;
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div style="text-align:center; margin:10px;">${b.shelf} 책장</div>`;
    const box = document.createElement("div");
    box.className = "shelf-box";
    for(let i=7; i>=1; i--) {
        box.innerHTML += `<div class="slot ${i==b.slot?'active':''}"><span>${i}칸</span></div>`;
    }
    shelfView.appendChild(box);
    modal.style.display = "block";
}

document.getElementById("closeBtn").onclick = () => modal.style.display = "none";
loadBooks();
