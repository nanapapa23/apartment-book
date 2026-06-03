import { db } from "./firebase.js";
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [], allWishes = [];

/* ------------------
초성 검색
------------------ */
const getInitialSound = (str) => {
    const onset = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    return str.split("").map(char => {
        const code = char.charCodeAt(0) - 44032;
        if(code > -1 && code < 11172) return onset[Math.floor(code / 588)];
        return char;
    }).join("");
};

/* ------------------
데이터 로드
------------------ */
async function loadData() {
    try {
        const [snapBooks, snapWishes] = await Promise.all([
            getDocs(collection(db, "books")),
            getDocs(collection(db, "wishes"))
        ]);
        allBooks = snapBooks.docs.map(d => ({id: d.id, ...d.data()}));
        allWishes = snapWishes.docs.map(d => ({id: d.id, ...d.data()}));
        renderList(allBooks);
    } catch(err) {
        console.error(err);
        document.getElementById("bookList").innerHTML = "<div style='padding:20px;text-align:center;'>데이터를 불러올 수 없습니다.</div>";
    }
}

/* ------------------
목록 출력
------------------ */
function renderList(data, isWish = false) {
    const bookList = document.getElementById("bookList");
    const newBooks = document.getElementById("newBooks");
    let wishBtnArea = document.getElementById("wishBtnArea");
    if (!wishBtnArea) wishBtnArea = createWishBtn();
    
    bookList.innerHTML = "";
    newBooks.style.display = isWish ? "none" : "flex";
    wishBtnArea.style.display = isWish ? "block" : "none";

    data.sort((a,b) => (b.newbook ? 1 : 0) - (a.newbook ? 1 : 0)).forEach(b => {
        // 신간 표시 로직
        if(!isWish && b.newbook) { /* 기존 신간 카드 로직 생략(위치 유지) */ }

        const div = document.createElement("div");
        div.className = "book-item";
        div.style = `padding:15px; border-bottom:1px solid #eee; cursor:pointer; background:${isWish ? '#fffcf0' : '#fff'}`;
        div.innerHTML = `
            <div style="display:flex;">
                <div style="width:60px; height:85px; border-radius:10px; background:#f2f2f2; flex-shrink:0;">
                    ${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">` : ''}
                </div>
                <div style="margin-left:15px; flex:1;">
                    <div style="font-weight:700; font-size:15px;">${b.title} ${isWish ? `<span style="font-size:11px; color:#e67e22;">[${b.status}]</span>` : (b.newbook ? '<span style="color:red;font-size:11px;"> NEW</span>' : '')}</div>
                    <div style="font-size:12px; color:#666; margin-top:4px;">저자: ${b.author} | 출판사: ${b.publisher || '정보없음'}</div>
                    <div style="font-size:12px; color:#999; margin-top:3px;">${isWish ? '사유: '+(b.reason||'없음') : (b.category||'기타')}</div>
                </div>
            </div>`;
        div.onclick = () => isWish ? null : showDetail(b);
        bookList.appendChild(div);
    });
}

function createWishBtn() {
    const div = document.createElement("div");
    div.id = "wishBtnArea";
    div.style = "text-align:center; padding:15px; display:none;";
    div.innerHTML = `<button style="padding:10px 20px; background:#e67e22; color:white; border:none; border-radius:5px; cursor:pointer;">희망도서 신청하기</button>`;
    div.onclick = () => {
        const title = prompt("책 제목"); const author = prompt("저자"); const category = prompt("분류");
        if(title && author) addDoc(collection(db, "wishes"), { title, author, category, status: "구매 예정", reason: "" }).then(() => { alert("신청 완료!"); location.reload(); });
    };
    document.getElementById("bookList").before(div);
    return div;
}

/* ------------------
상세보기
------------------ */
window.showDetail = function(book) {
    document.getElementById("detailTitle").innerText = book.title;
    document.getElementById("detailAuthor").innerText = `저자: ${book.author} | 출판사: ${book.publisher || '정보없음'}`;
    
    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `<div style="text-align:center; margin-bottom:10px;"><span style="background:#424242; color:white; padding:4px 12px; border-radius:15px;">${book.shelf} 책장 - ${book.slot}칸</span></div>`;
    
    const box = document.createElement("div");
    box.style = "display:flex; flex-direction:column; align-items:center; width:100px; margin:0 auto; border:5px solid #5D4037; border-radius:5px; background:#8D6E63; padding:3px;";
    for(let i=7; i>=1; i--) {
        const s = document.createElement("div");
        s.style = `width:90px; height:25px; border-bottom:1px solid #5D4037; display:flex; align-items:center; justify-content:center; background:${Number(book.slot)==i?'#FFCC80':'#FFF3E0'}; font-size:11px;`;
        s.innerText = i + "칸";
        box.appendChild(s);
    }
    shelfView.appendChild(box);
    document.getElementById("detailModal").style.display = "block";
};

/* ------------------
이벤트
------------------ */
document.addEventListener("DOMContentLoaded", () => {
    // 카테고리 필터
    document.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");
            const cat = item.dataset.category;
            if(cat === "기타") renderList(allWishes, true);
            else renderList(cat === "전체" ? allBooks : allBooks.filter(b => b.category === cat));
        });
    });

    // 검색
    document.getElementById("search").addEventListener("input", e => {
        const val = e.target.value.toLowerCase();
        renderList(allBooks.filter(b => b.title.toLowerCase().includes(val) || b.author.toLowerCase().includes(val) || getInitialSound(b.title).includes(val)));
    });

    // 관리자 로그인
    document.getElementById("adminIcon").onclick = () => {
        if(prompt("아이디") === "admin" && prompt("비밀번호") === "1234") {
            sessionStorage.setItem("libraryAdmin", "true");
            location.href = "admin.html";
        }
    };

    document.getElementById("closeBtn").onclick = () => document.getElementById("detailModal").style.display = "none";
    loadData();
});
