import { db } from "./firebase.js";
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [], allWishes = [];

async function loadData() {
    const snapBooks = await getDocs(collection(db, "books"));
    const snapWishes = await getDocs(collection(db, "wishes"));
    allBooks = snapBooks.docs.map(d => ({id: d.id, ...d.data()}));
    allWishes = snapWishes.docs.map(d => ({id: d.id, ...d.data()}));
    renderList(allBooks);
}

// 팝업 상세 보기 함수 (전역으로 노출)
window.showDetail = function(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author + " | " + (b.category || "기타");
    document.getElementById("detailModal").style.display = "block";
    
    // 책장 시각화 로직 추가...
};

function renderList(data, isWish = false) {
    const bookList = document.getElementById("bookList");
    const newBooks = document.getElementById("newBooks");
    const wishBtnArea = document.getElementById("wishBtnArea") || createWishBtn();
    
    bookList.innerHTML = "";
    newBooks.style.display = isWish ? "none" : "flex";
    wishBtnArea.style.display = isWish ? "block" : "none";

    data.forEach(b => {
        const div = document.createElement("div");
        div.style = `padding:15px; border-bottom:1px solid #eee; cursor:pointer; background:${isWish ? '#fffcf0' : '#fff'}`;
        div.innerHTML = `<div><strong>${b.title}</strong></div><div style="font-size:12px;">${b.author}</div>`;
        
        // 클릭 이벤트 확실하게 부여
        div.onclick = () => window.showDetail(b);
        bookList.appendChild(div);
    });
}

function createWishBtn() {
    const div = document.createElement("div");
    div.id = "wishBtnArea";
    div.style = "text-align:center; padding:10px; display:none;";
    div.innerHTML = `<button style="padding:10px;">희망도서 신청하기</button>`;
    div.onclick = () => { /* 신청 로직 */ };
    document.getElementById("bookList").before(div);
    return div;
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. 관리자 아이콘 이벤트
    document.getElementById("adminIcon").onclick = () => {
        const id = prompt("아이디");
        const pw = prompt("비밀번호");
        if(id === "admin" && pw === "1234") {
            sessionStorage.setItem("libraryAdmin", "true");
            location.href = "admin.html";
        } else {
            alert("로그인 실패");
        }
    };
    
    // 2. 모달 닫기 버튼
    document.getElementById("closeBtn").onclick = () => {
        document.getElementById("detailModal").style.display = "none";
    };
});

loadData();
