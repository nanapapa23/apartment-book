import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];

// [기능 추가] 초성 변환 함수
const getInitialSound = (str) => {
    const onset = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    return str.split('').map(char => {
        const code = char.charCodeAt(0) - 44032;
        if (code > -1 && code < 11172) return onset[Math.floor(code / 588)];
        return char;
    }).join('');
};

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    allBooks = snap.docs.map(d => ({id: d.id, ...d.data()}));
    renderList(allBooks);
}

function renderList(data) {
    const bookList = document.getElementById("bookList"), 
          newBooks = document.getElementById("newBooks");
    
    bookList.innerHTML = ""; 
    newBooks.innerHTML = "";

    data.sort((a,b) => b.newbook - a.newbook).forEach(b => {
        // [신간 UI 개선]
        if(b.newbook) {
            const div = document.createElement("div");
            div.className = "new-book-card";
            div.style = "flex-shrink:0; width:90px; margin-right:15px; cursor:pointer; display:flex; flex-direction:column;";
            div.innerHTML = `
                <div style="width:90px; height:120px; border:1px solid #ddd; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:4px; background:#f9f9f9;">
                    ${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:10px; color:#ccc;">이미지 없음</span>'}
                </div>
                <div style="font-weight:700; margin-top:8px; font-size:13px; line-height:1.3; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${b.title}</div>
                <div style="font-size:11px; color:#777; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.author}</div>`;
            div.onclick = () => showDetail(b);
            newBooks.appendChild(div);
        }
        
        // 전체 목록
        const div = document.createElement("div");
        div.style = "display:flex; align-items:center; padding:12px; border-bottom:1px solid #eee; cursor:pointer;";
        div.innerHTML = `
            <div style="width:50px; height:70px; border:1px solid #ddd; flex-shrink:0; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:4px;">
                ${b.imgUrl ? `<img src="${b.imgUrl}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:10px; color:#ccc;">없음</span>'}
            </div>
            <div style="margin-left:12px; text-align:left;">
                <div style="font-weight:bold; font-size:15px;">${b.title} ${b.newbook ? '<span style="color:red; font-size:10px; margin-left:4px;">[NEW]</span>' : ''}</div>
                <div style="font-size:12px; color:#777; margin-top:2px;">저자: ${b.author} | 분류: ${b.category || '기타'}</div>
            </div>`;
        div.onclick = () => showDetail(b);
        bookList.appendChild(div);
    });
}

function showDetail(b) {
    document.getElementById("detailTitle").innerText = b.title;
    document.getElementById("detailAuthor").innerText = "저자: " + b.author + " | " + (b.category || "기타");
    
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
    // 카테고리 필터
    document.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".category-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");
            renderList(item.dataset.category === "전체" ? allBooks : allBooks.filter(b => b.category === item.dataset.category));
        });
    });

    // [검색 이벤트] 제목 + 초성 검색 통합
    document.getElementById("search").addEventListener("input", (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = allBooks.filter(b => {
            const title = b.title.toLowerCase();
            const initial = getInitialSound(b.title);
            return title.includes(val) || initial.includes(val);
        });
        renderList(filtered);
    });

    document.getElementById("adminIcon").onclick = () => { 
        if(prompt("아이디") === "admin" && prompt("비밀번호") === "1234") { 
            sessionStorage.setItem("libraryAdmin", "true"); 
            location.href = "admin.html"; 
        } else alert("로그인 실패"); 
    };
});

document.getElementById("closeBtn").onclick = () => document.getElementById("detailModal").style.display = "none";

loadBooks();
