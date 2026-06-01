import { db } from "./firebase.js";
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
        if(b.newbook) {
            const div = document.createElement("div");
            div.className = "new-book-card";
            div.innerHTML = `<div style="width:90px; height:120px; border:1px solid #ddd; display:flex; align-items:center; justify-content:center;">${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '이미지 없음'}</div>
                             <div style="font-weight:bold; font-size:11px; margin-top:5px;">${b.title}</div>
                             <div style="font-size:10px; color:#666;">${b.author}</div>`;
            div.onclick = () => showDetail(b);
            newBooks.appendChild(div);
        }
        const div = document.createElement("div");
        div.style = "display:flex; align-items:center; padding:12px; border-bottom:1px solid #eee; cursor:pointer;";
        div.innerHTML = `<div style="width:50px; height:70px; border:1px solid #ddd; flex-shrink:0; display:flex; align-items:center; justify-content:center;">${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '없음'}</div>
                         <div style="margin-left:15px; text-align:left;"><div style="font-weight:bold; font-size:14px;">${b.title} ${b.newbook ? '<span style="color:red; font-size:10px;">[NEW]</span>' : ''}</div>
                         <div style="font-size:12px; color:#666; margin-top:2px;">${b.author} | ${b.category || '기타'}</div></div>`;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author + " | " + (b.category || "기타");
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div style="text-align:center; margin-bottom:10px;"><span style="background:#424242; color:white; padding:4px 12px; border-radius:15px; font-size:12px;">${b.shelf} 책장 - ${b.slot}칸</span></div>`;
    const box = document.createElement("div");
    box.style = "display:flex; flex-direction:column; align-items:center; width:100px; margin:0 auto; border:5px solid #5D4037; border-radius:5px; background:#8D6E63; padding:3px;";
    for(let i=7; i>=1; i--) {
        const s = document.createElement("div");
        s.style = `width:90px; height:25px; border-bottom:1px solid #5D4037; display:flex; align-items:center; justify-content:center; background:${i==b.slot?'#FFCC80':'#FFF3E0'}; font-size:11px;`;
        s.innerText = i + "칸";
        box.appendChild(s);
    }
    shelfView.appendChild(box);
    document.getElementById("detailModal").style.display = "block";
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("wishBtn").onclick = async () => {
        const title = prompt("도서 제목");
        const author = prompt("저자");
        if(title && author) { await addDoc(collection(db, "wishes"), { title, author, status: "구매 예정" }); alert("신청 완료"); }
    };
    document.getElementById("search").addEventListener("input", (e) => renderList(allBooks.filter(b => b.title.toLowerCase().includes(e.target.value.toLowerCase()))));
    document.getElementById("adminIcon").onclick = () => { if(prompt("아이디") === "admin" && prompt("비밀번호") === "1234") { sessionStorage.setItem("libraryAdmin", "true"); location.href = "admin.html"; } };
});
document.getElementById("closeBtn").onclick = () => document.getElementById("detailModal").style.display = "none";
loadBooks();
