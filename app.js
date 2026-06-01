import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    allBooks = snap.docs.map(d => ({id: d.id, ...d.data()}));
    renderList(allBooks);
}

function renderList(data) {
    const bookList = document.getElementById("bookList");
    const newBooks = document.getElementById("newBooks");
    bookList.innerHTML = "";
    newBooks.innerHTML = "";

    // 신간 정렬
    data.sort((a,b) => b.newbook - a.newbook).forEach(b => {
        if(b.newbook) {
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
        }

        const div = document.createElement("div");
        div.style = "display:flex; align-items:center; padding:15px; border-bottom:1px solid #eee; cursor:pointer;";
        div.innerHTML = `
            <div style="width:60px; height:85px; background:#fff; border:1px solid #ddd; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
                ${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:9px; color:#ccc;">없음</span>'}
            </div>
            <div style="margin-left:15px; text-align:left;">
                <div style="font-weight:bold; font-size:16px;">${b.title} ${b.newbook ? '<span style="color:red; font-size:11px;">[NEW]</span>' : ''}</div>
                <div style="font-size:13px; color:#666; margin-top:4px;">저자: ${b.author} | 분류: ${b.category || '기타'}</div>
                <div style="font-size:12px; color:#999; margin-top:2px;">등록: ${b.date || ''}</div>
            </div>`;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author + " | " + (b.category || "기타");
    
    // 책장 위치 시각화 추가 부분
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div style="text-align:center; margin:10px; font-weight:bold;">${b.shelf} 책장</div>`;
    
    const box = document.createElement("div");
    box.style = "display:flex; justify-content:center; gap:5px; margin-top:10px;";
    
    // 7칸부터 1칸까지 역순으로 생성
    for(let i=7; i>=1; i--) {
        const slotDiv = document.createElement("div");
        slotDiv.style = `padding:10px 15px; border:1px solid #ccc; background:${i == b.slot ? '#ff7043' : '#fff'}; color:${i == b.slot ? '#fff' : '#333'}; font-weight:bold; border-radius:4px;`;
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
            const cat = item.dataset.category;
            renderList(cat === "전체" ? allBooks : allBooks.filter(b => b.category === cat));
        });
    });

    document.getElementById("search").addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        renderList(allBooks.filter(b => b.title.toLowerCase().includes(val) || b.author.toLowerCase().includes(val)));
    });

    document.getElementById("adminIcon").onclick = () => {
        const id = prompt("아이디");
        if(id === "admin") {
            const pw = prompt("비밀번호");
            if(pw === "1234") { sessionStorage.setItem("libraryAdmin", "true"); location.href = "admin.html"; }
            else alert("비밀번호 불일치");
        } else alert("아이디 불일치");
    };
});

document.getElementById("closeBtn").onclick = () => document.getElementById("detailModal").style.display = "none";
loadBooks();
