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

function renderList(data, isWish = false) {
    const bookList = document.getElementById("bookList"), newBooks = document.getElementById("newBooks");
    const wishBtn = document.getElementById("wishBtnArea") || createWishBtn();
    
    bookList.innerHTML = "";
    newBooks.style.display = isWish ? "none" : "flex";
    wishBtn.style.display = isWish ? "block" : "none";

    data.sort((a,b) => b.newbook - a.newbook).forEach(b => {
        if(!isWish && b.newbook) { /* 기존 신간 로직 동일 */ }
        const div = document.createElement("div");
        div.style = `padding:15px; border-bottom:1px solid #eee; cursor:pointer; background:${isWish ? '#fffcf0' : '#fff'}`;
        div.innerHTML = `
            <div style="font-weight:bold; font-size:15px;">${b.title} ${isWish ? `<span style="font-size:11px; color:#e67e22;">[${b.status}]</span>` : ''}</div>
            <div style="font-size:12px; color:#666;">저자: ${b.author} | ${isWish ? '사유: '+(b.reason||'없음') : '분류: '+(b.category||'일반')}</div>`;
        if(!isWish) div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function createWishBtn() {
    const div = document.createElement("div");
    div.id = "wishBtnArea";
    div.style = "text-align:center; padding:10px;";
    div.innerHTML = `<button style="padding:10px 20px; background:#e67e22; color:white; border:none; border-radius:5px;">희망도서 신청하기</button>`;
    div.onclick = () => {
        const title = prompt("책 제목"); const author = prompt("저자"); const category = prompt("분류");
        if(title && author) addDoc(collection(db, "wishes"), { title, author, category, status: "구매 예정", reason: "" }).then(() => { alert("신청 완료!"); location.reload(); });
    };
    document.getElementById("bookList").before(div);
    return div;
}

// 카테고리 필터링
document.querySelectorAll(".category-item").forEach(item => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        const cat = item.dataset.category;
        if(cat === "희망도서") renderList(allWishes, true);
        else renderList(allBooks.filter(b => cat === "전체" || b.category === cat));
    });
});

loadData();
// 기존 showDetail 및 기타 기능 동일 유지
