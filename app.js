import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
let books = [], currentCategory = "전체";

async function loadBooks() {
    const snapshot = await getDocs(collection(db, "books"));
    books = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
    render();
}

function render() {
    const keyword = searchInput.value.toLowerCase();
    bookList.innerHTML = "";
    books.filter(b => (currentCategory === "전체" || b.category === currentCategory) && 
                      (b.title.toLowerCase().includes(keyword) || b.author.toLowerCase().includes(keyword)))
         .forEach(b => {
        const div = document.createElement("div");
        div.className = "book-card";
        div.innerHTML = `<div class="book-info"><div class="title">${b.title}</div><div class="author">${b.author}</div></div><i class="fas fa-chevron-right"></i>`;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div class="shelf-box">${[1,2,3,4,5,6,7].map(i => `<div class="slot ${i==b.slot?'active':''}">${i}칸</div>`).join('')}</div>`;
    document.getElementById("detailModal").style.display = "block";
}

document.querySelectorAll(".category-item").forEach(item => {
    item.onclick = () => { currentCategory = item.dataset.category; render(); };
});
searchInput.addEventListener("input", render);
document.getElementById("closeBtn").onclick = () => document.getElementById("detailModal").style.display = "none";
document.getElementById("adminIcon").onclick = () => { if(prompt("비밀번호") === "1234") { sessionStorage.setItem("libraryAdmin", "true"); location.href="admin.html"; }};
loadBooks();
