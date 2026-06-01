import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bookList = document.getElementById("bookList");
const newBooks = document.getElementById("newBooks");
const modal = document.getElementById("detailModal");

async function loadBooks() {
    try {
        const snap = await getDocs(collection(db, "books"));
        const books = snap.docs.map(d => ({id: d.id, ...d.data()}));
        
        // 1. 신간 도서 영역 (이미지, 이름, 저자 포함)
        newBooks.innerHTML = "";
        books.filter(b => b.newbook).forEach(b => {
            const div = document.createElement("div");
            div.className = "new-book-card";
            div.style = "text-align:center; padding:10px;";
            div.innerHTML = `
                <div style="width:100px; height:140px; background:white; border:1px solid #ddd; display:flex; align-items:center; justify-content:center; margin:0 auto 10px; border-radius:5px; overflow:hidden;">
                    ${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '<small style="color:#aaa; font-size:10px;">이미지 없음</small>'}
                </div>
                <div style="font-weight:bold; font-size:14px;">${b.title}</div>
                <div style="font-size:12px; color:#666;">${b.author}</div>
            `;
            div.onclick = () => showDetail(b);
            newBooks.appendChild(div);
        });

        // 2. 전체 도서 목록 (신간 상단 배치)
        bookList.innerHTML = "";
        books.sort((a,b) => b.newbook - a.newbook).forEach(b => {
            const div = document.createElement("div");
            div.className = "book-item";
            div.innerHTML = `
                <div style="width:50px; height:70px; background:white; border:1px solid #ddd; display:flex; align-items:center; justify-content:center; border-radius:4px; overflow:hidden; flex-shrink:0;">
                    ${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '<small style="font-size:8px; color:#aaa;">없음</small>'}
                </div>
                <div style="margin-left:15px; overflow:hidden;">
                    <div class="title" style="font-weight:bold;">${b.title} ${b.newbook ? '<span style="color:red; font-size:11px;">[NEW]</span>' : ''}</div>
                    <div class="author" style="font-size:13px; color:#666;">${b.author} | 등록: ${b.date || ''}</div>
                </div>`;
            div.onclick = () => showDetail(b);
            bookList.appendChild(div);
        });
    } catch(err) { console.error("데이터 로드 에러:", err); }
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
