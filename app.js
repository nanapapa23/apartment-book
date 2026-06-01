import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    allBooks = snap.docs.map(d => ({id: d.id, ...d.data()}));
    renderList(allBooks);
}

function renderList(data) {
    const bookList = document.getElementById("bookList"), newBooks = document.getElementById("newBooks");
    bookList.innerHTML = ""; newBooks.innerHTML = "";

    data.sort((a,b) => b.newbook - a.newbook).forEach(b => {
        // 신간 영역
        if(b.newbook) {
            const div = document.createElement("div");
            div.className = "new-book-card";
            div.innerHTML = `<div style="width:100px; height:140px; border:1px solid #ddd; display:flex; align-items:center; justify-content:center;">${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '이미지 없음'}</div>
                             <div style="font-weight:bold; margin-top:8px;">${b.title}</div><div style="font-size:12px; color:#666;">${b.author}</div>`;
            div.onclick = () => showDetail(b);
            newBooks.appendChild(div);
        }
        // 전체 목록
        const div = document.createElement("div");
        div.style = "display:flex; align-items:center; padding:15px; border-bottom:1px solid #eee; cursor:pointer;";
        div.innerHTML = `<div style="width:60px; height:85px; border:1px solid #ddd; flex-shrink:0; display:flex; align-items:center; justify-content:center;">${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '없음'}</div>
                         <div style="margin-left:15px; text-align:left;"><div style="font-weight:bold; font-size:16px;">${b.title} ${b.newbook ? '<span style="color:red; font-size:11px;">[NEW]</span>' : ''}</div>
                         <div style="font-size:13px; color:#666; margin-top:4px;">저자: ${b.author} | 분류: ${b.category || '기타'}</div><div style="font-size:12px; color:#999; margin-top:2px;">등록: ${b.date || ''}</div></div>`;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author + " | " + (b.category || "기타");
    
    // 세로형 책장 디자인
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div style="text-align:center; margin-bottom:15px;"><span style="background:#424242; color:white; padding:5px 15px; border-radius:20px; font-weight:bold;">${b.shelf} 책장 - ${b.slot}칸</span></div>`;
    
    const box = document.createElement("div");
    box.style = "display:flex; flex-direction:column; align-items:center; margin:0 auto; width:140px; border:8px solid #5D4037; border-radius:8px; background:#8D6E63; padding:5px;";
    
    for(let i=7; i>=1; i--) {
        const slotDiv = document.createElement("div");
        const isSelected = (i == b.slot);
        slotDiv.style = `width:120px; height:35px; border-bottom:2px solid #5D4037; display:flex; align-items:center; justify-content:center; background:${isSelected ? '#FFCC80' : '#FFF3E0'}; color:${isSelected ? '#E65100' : '#8D6E63'}; font-weight:${isSelected ? 'bold' : 'normal'}; font-size:13px; transition:all 0.3s;`;
        slotDiv.innerText = i + "칸";
        box.appendChild(slotDiv);
    }
    shelfView.appendChild(box);
    document.getElementById("detailModal").style.display = "block";
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");
            renderList(item.dataset.category === "전체" ? allBooks : allBooks.filter(b => b.category === item.dataset.category));
        });
    });
    document.getElementById("search").addEventListener("input", (e) => renderList(allBooks.filter(b => b.title.toLowerCase().includes(e.target.value.toLowerCase()))));
    document.getElementById("adminIcon").onclick = () => { if(prompt("아이디") === "admin" && prompt("비밀번호") === "1234") { sessionStorage.setItem("libraryAdmin", "true"); location.href = "admin.html"; } else alert("로그인 실패"); };
});

document.getElementById("closeBtn").onclick = () => document.getElementById("detailModal").style.display = "none";
loadBooks();
