import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];

const getInitialSound = (str) => {
    const onset = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    return str.split("").map(char => {
        const code = char.charCodeAt(0) - 44032;
        if(code > -1 && code < 11172) return onset[Math.floor(code / 588)];
        return char;
    }).join("");
};

async function loadBooks(){
    try{
        const snap = await getDocs(collection(db,"books"));
        allBooks = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderList(allBooks);
    }catch(err){
        console.error(err);
    }
}

function renderList(data){
    const bookList = document.getElementById("bookList");
    const newBooks = document.getElementById("newBooks");
    bookList.innerHTML = "";
    newBooks.innerHTML = "";

    // 신간(true) > 등록일(최신순) > 제목(가나다순) 정렬
    data.sort((a, b) => {
        if (b.newbook !== a.newbook) return b.newbook ? -1 : 1;
        if (a.date !== b.date) return (b.date || "").localeCompare(a.date || "") * -1;
        return (a.title || "").localeCompare(b.title || "");
    }).forEach(book => {
        // (이후 렌더링 코드는 기존과 동일하게 유지)
        if(book.newbook){
            const newCard = document.createElement("div");
            newCard.className = "new-book-card";
            newCard.innerHTML = `
                <div style="width:100px;height:140px;margin:auto;overflow:hidden;border-radius:12px;background:#f2f2f2;">
                ${book.imgUrl ? `<img src="${book.imgUrl}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#999;font-size:12px;">이미지 없음</div>'}
                </div>
                <div style="font-weight:700;margin-top:10px;font-size:13px;">${book.title}</div>
                <div style="color:#666;font-size:11px;margin-top:4px;">${book.author}</div>`;
            newCard.onclick = () => showDetail(book);
            newBooks.appendChild(newCard);
        }
        const div = document.createElement("div");
        div.className = "book-item";
        div.innerHTML = `
            <div style="width:60px;height:85px;overflow:hidden;border-radius:10px;background:#f2f2f2;flex-shrink:0;">
            ${book.imgUrl ? `<img src="${book.imgUrl}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:11px;color:#999;">없음</div>'}
            </div>
            <div style="margin-left:15px;flex:1;">
                <div style="font-weight:700;font-size:15px;">${book.title} ${book.newbook ? `<span style="color:red;font-size:11px;"> NEW</span>` : ""}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">저자 : ${book.author}</div>
                <div style="font-size:12px;color:#999;margin-top:3px;">${book.category || "기타"}</div>
            </div>`;
        div.onclick = () => showDetail(book);
        bookList.appendChild(div);
    });
}
// (showDetail 및 나머지 이벤트 리스너는 기존과 동일하게 유지)
