import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bookList = document.getElementById("bookList");
let books = [], currentCategory = "전체";

async function loadBooks() {
    const snapshot = await getDocs(collection(db, "books"));
    books = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
    render();
}

function render() {
    const keyword = document.getElementById("search").value.toLowerCase();
    bookList.innerHTML = "";
    books.filter(b => (currentCategory === "전체" || b.category === currentCategory) && 
                      (b.title.toLowerCase().includes(keyword) || b.author.toLowerCase().includes(keyword)))
         .forEach(b => {
        const div = document.createElement("div");
        div.className = "book-card";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author}</small></div><span>👉</span>`;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div>${b.shelf} 책장</div>`;
    const box = document.createElement("div");
    box.className = "shelf-container";
    for(let i = 7; i >= 1; i--) {
        const div = document.createElement("div");
        div.className = "slot" + (String(i) === String(b.slot) ? " active" : "");
        div.innerText = i + "칸";
        box.appendChild(div);
    }
    shelfView.appendChild(box);
    document.getElementById("detailModal").style.display = "block";
}

document.querySelectorAll(".category-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".category-btn").forEach(el => el.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        render();
    };
});

document.getElementById("search").oninput = render;
document.getElementById("closeBtn").onclick = () => document.getElementById("detailModal").style.display = "none";
loadBooks();
