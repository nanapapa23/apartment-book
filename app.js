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
    books = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
    
    // 신간 영역 (최신순 배치)
    newBooks.innerHTML = "";
    books.filter(b => b.newbook).sort((a,b) => (b.date || "").localeCompare(a.date || "")).forEach(b => {
        const div = document.createElement("div");
        div.className = "new-book-card";
        div.innerHTML = `<strong>${b.title}</strong><br><small>${b.author}</small>`;
        div.onclick = () => showDetail(b);
        newBooks.appendChild(div);
    });
    renderBookList(books);
}

function renderBookList(data) {
    bookList.innerHTML = "";
    // 신간 상단 배치 후 리스트 출력
    const sorted = [...data].sort((a,b) => b.newbook - a.newbook);
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

document.getElementById("closeBtn").onclick = () => modal.style.display = "none";
loadBooks();
