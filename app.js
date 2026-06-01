import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bookList = document.getElementById("bookList");
const newBooks = document.getElementById("newBooks");
const modal = document.getElementById("detailModal");

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    const books = snap.docs.map(d => ({id: d.id, ...d.data()}));

    // 1. 신간 영역
    newBooks.innerHTML = "";
    books.filter(b => b.newbook).forEach(b => {
        const div = document.createElement("div");
        div.className = "new-book-card";
        div.innerHTML = `
            <div style="width:100px; height:140px; background:#fff; border:1px solid #ddd; margin:0 auto 10px; display:flex; align-items:center; justify-content:center;">
                ${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:10px; color:#ccc;">이미지 없음</span>'}
            </div>
            <div style="font-weight:bold;">${b.title}</div>
            <div style="font-size:12px; color:#666;">${b.author}</div>`;
        div.onclick = () => showDetail(b);
        newBooks.appendChild(div);
    });

    // 2. 전체 리스트 (이미지 왼쪽, 글자 오른쪽)
    bookList.innerHTML = "";
    books.sort((a,b) => b.newbook - a.newbook).forEach(b => {
        const div = document.createElement("div");
        div.style = "display:flex; align-items:center; padding:15px; border-bottom:1px solid #eee; cursor:pointer;";
        div.innerHTML = `
            <div style="width:60px; height:85px; background:#fff; border:1px solid #ddd; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
                ${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:9px; color:#ccc;">없음</span>'}
            </div>
            <div style="margin-left:15px; text-align:left;">
                <div style="font-weight:bold; font-size:16px;">${b.title} ${b.newbook ? '<span style="color:red; font-size:11px;">[NEW]</span>' : ''}</div>
                <div style="font-size:13px; color:#666; margin-top:4px;">저자: ${b.author}</div>
                <div style="font-size:12px; color:#999; margin-top:2px;">등록: ${b.date || ''}</div>
            </div>`;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author;
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
const adminIcon = document.getElementById("adminIcon");
if(adminIcon) adminIcon.onclick = () => {
    const id = prompt("관리자 아이디");
    const pw = prompt("비밀번호");
    if(id === "admin" && pw === "1234") {
        sessionStorage.setItem("libraryAdmin", "true");
        window.location.href = "admin.html";
    }
};

loadBooks();
