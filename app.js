import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];

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
도서 로드
------------------ */
async function loadBooks(){
    try{
        const snap = await getDocs(collection(db,"books"));
        allBooks = snap.docs.map(doc=>({ id:doc.id, ...doc.data() }));
        renderList(allBooks);
    }catch(err){
        console.error(err);
        document.getElementById("bookList").innerHTML = "<div style='padding:20px;text-align:center;'>도서 데이터를 불러올 수 없습니다.</div>";
    }
}

/* ------------------
목록 출력
------------------ */
function renderList(data){
    const bookList = document.getElementById("bookList");
    const newBooks = document.getElementById("newBooks");
    bookList.innerHTML = "";
    newBooks.innerHTML = "";

    // 정렬: 1.신간 우선(true) > 2.등록일 최신순 > 3.제목 가나다순
    data.sort((a, b) => {
        // 1. 신간 우선
        if (!!a.newbook !== !!b.newbook) {
            return (b.newbook ? 1 : 0) - (a.newbook ? 1 : 0);
        }
        
        // 2. 등록일 최신순 (Date 객체로 변환하여 비교)
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (dateA !== dateB) {
            return dateB - dateA; // 큰 값(최신)이 앞으로
        }
        
        // 3. 제목 가나다순
        return (a.title || "").localeCompare(b.title || "", "ko");
    })
    .forEach(book=>{
        /* 신간 */
        if(book.newbook){
            const newCard = document.createElement("div");
            newCard.className = "new-book-card";
            newCard.innerHTML = `
                <div style="width:100px; height:140px; margin:auto; overflow:hidden; border-radius:12px; background:#f2f2f2;">
                    ${book.imgUrl ? `<img src="${book.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; color:#999; font-size:12px;">이미지 없음</div>`}
                </div>
                <div style="font-weight:700; margin-top:10px; font-size:13px;">${book.title}</div>
                <div style="color:#666; font-size:11px; margin-top:4px;">${book.author}</div>
            `;
            newCard.onclick = () => showDetail(book);
            newBooks.appendChild(newCard);
        }

        /* 일반목록 */
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `
            <div style="width:60px; height:85px; overflow:hidden; border-radius:10px; background:#f2f2f2; flex-shrink:0;">
                ${book.imgUrl ? `<img src="${book.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; font-size:11px; color:#999;">없음</div>`}
            </div>
            <div style="margin-left:15px; flex:1;">
                <div style="font-weight:700; font-size:15px;">${book.title} ${book.newbook ? '<span style="color:red;font-size:11px;">NEW</span>' : ''}</div>
                <div style="font-size:12px; color:#666; margin-top:4px;">저자: ${book.author} | 출판사: ${book.publisher || '정보없음'}</div>
                <div style="font-size:12px; color:#999; margin-top:3px;">${book.category || "기타"}</div>
            </div>
        `;
        div.onclick = () => showDetail(book);
        bookList.appendChild(div);
    });
}

/* ------------------
상세보기
------------------ */
function showDetail(book){
    document.getElementById("detailTitle").innerText = book.title || "";
    document.getElementById("detailAuthor").innerText = "저자 : " + (book.author || "") + " | 출판사 : " + (book.publisher || "정보없음");

    const shelfView = document.getElementById("shelfView");
    shelfView.innerHTML = `
        <div style="text-align:center; margin-bottom:15px;">
            <span style="background:#424242; color:white; padding:6px 14px; border-radius:20px; font-weight:bold;">
                ${book.shelf} 책장 - ${book.slot}칸
            </span>
        </div>
    `;

    if (book.category === "어린이전용") {
        shelfView.innerHTML = `<div style="text-align:center; margin-bottom:15px; font-weight:bold; color:#5D4037;">어린이전용 책장</div>`;
        const box = document.createElement("div");
        box.style = `margin:auto; width:120px; height:80px; border:4px solid #5D4037; border-radius:8px; background:#FFCC80; display:flex; justify-content:center; align-items:center; font-weight:bold; color:#E65100;`;
        box.innerText = "어린이전용";
        shelfView.appendChild(box);
    } else {
        const box = document.createElement("div");
        box.style = `display:flex; flex-direction:column; align-items:center; margin:auto; width:140px; border:8px solid #5D4037; border-radius:8px; background:#8D6E63; padding:5px;`;
        for(let i=6; i>=1; i--){
            const slot = document.createElement("div");
            const active = Number(book.slot) === i;
            slot.style = `width:120px; height:35px; border-bottom:2px solid #5D4037; display:flex; justify-content:center; align-items:center; background:${active ? "#FFCC80" : "#FFF3E0"}; color:${active ? "#E65100" : "#8D6E63"}; font-weight:${active ? "bold" : "normal"};`;
            slot.innerText = i + "칸";
            box.appendChild(slot);
        }
        shelfView.appendChild(box);
    }

    document.getElementById("detailModal").style.display = "block";
}

/* ------------------
이벤트
------------------ */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");
            const category = item.dataset.category;
            renderList(category === "전체" ? allBooks : allBooks.filter(b => b.category === category));
        });
    });

    document.getElementById("search").addEventListener("input", e => {
        const value = e.target.value.trim().toLowerCase();
        const filtered = allBooks.filter(book => {
            return (book.title || "").toLowerCase().includes(value) || 
                   (book.author || "").toLowerCase().includes(value) || 
                   (book.publisher || "").toLowerCase().includes(value) ||
                   getInitialSound(book.title || "").includes(value);
        });
        renderList(filtered);
    });

    document.getElementById("closeBtn").onclick = () => {
        document.getElementById("detailModal").style.display = "none";
    };

    loadBooks();
});
