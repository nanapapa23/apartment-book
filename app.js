import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchInput = document.getElementById("search");
const bookList = document.getElementById("bookList");
const modal = document.getElementById("detailModal");
const categoryItems = document.querySelectorAll(".category-item");

let books = [];
let currentCategory = "전체";

// 1. 초성 검색을 위한 변환 함수
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
function getChosung(str) {
    let result = "";
    for(let char of str) {
        const code = char.charCodeAt(0) - 44032;
        if(code >= 0 && code <= 11171) result += CHO[Math.floor(code / 588)];
        else result += char;
    }
    return result;
}

// 2. Firebase 데이터 로드
async function loadBooks() {
    try {
        const snapshot = await getDocs(collection(db, "books"));
        books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderBookList(books);
    } catch(err) {
        console.error("데이터 로드 실패:", err);
    }
}

// 3. 도서 목록 렌더링 (카드형)
function renderBookList(data) {
    bookList.innerHTML = "";
    const filtered = data.filter(b => currentCategory === "전체" || b.category === currentCategory);
    
    filtered.forEach(b => {
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `
            <div class="book-info">
                <div class="title">${b.title}</div>
                <div class="author">${b.author}</div>
            </div>
            <i class="fas fa-chevron-right" style="color:#aaa;"></i>
        `;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

// 4. 상세 팝업 (나무 느낌 책장)
function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author;
    
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div style="text-align:center; margin-bottom:10px; color:#5d4037; font-weight:800;">${b.shelf} 책장</div>`;
    
    const box = document.createElement("div");
    box.className = "shelf-box";
    for(let i=7; i>=1; i--) {
        box.innerHTML += `<div class="slot ${i == b.slot ? 'active' : ''}"><span>${i}칸</span></div>`;
    }
    shelfView.appendChild(box);
    modal.style.display = "block";
}

// 5. 검색 로직 (초성 지원)
searchInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = books.filter(b => 
        b.title.toLowerCase().includes(val) || 
        b.author.toLowerCase().includes(val) ||
        getChosung(b.title).includes(val)
    );
    renderBookList(filtered);
});

// 6. 카테고리 클릭 반응
categoryItems.forEach(item => {
    item.addEventListener("click", () => {
        categoryItems.forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        currentCategory = item.dataset.category;
        renderBookList(books);
    });
});

// 7. 관리자 모드 접속
document.getElementById("adminIcon").onclick = () => {
    const id = prompt("관리자 아이디");
    const pw = prompt("비밀번호");
    if(id === "admin" && pw === "1234") {
        sessionStorage.setItem("libraryAdmin", "true");
        window.location.href = "admin.html";
    } else {
        alert("권한이 없습니다.");
    }
};

// 8. 모달 닫기
document.getElementById("closeBtn").onclick = () => modal.style.display = "none";

// 초기 로드
loadBooks();
