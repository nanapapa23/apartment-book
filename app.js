import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allBooks = [];

/* ------------------
초성 검색
------------------ */

const getInitialSound = (str) => {

const onset = [
    "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ",
    "ㄹ","ㅁ","ㅂ","ㅃ","ㅅ",
    "ㅆ","ㅇ","ㅈ","ㅉ","ㅊ",
    "ㅋ","ㅌ","ㅍ","ㅎ"
];

return str
.split("")
.map(char => {

    const code =
    char.charCodeAt(0) - 44032;

    if(code > -1 && code < 11172){

        return onset[
            Math.floor(code / 588)
        ];

    }

    return char;

})
.join("");

};

/* ------------------
도서 로드
------------------ */

async function loadBooks(){

try{

    const snap =
    await getDocs(
        collection(db,"books")
    );

    allBooks =
    snap.docs.map(doc=>({

        id:doc.id,
        ...doc.data()

    }));

    renderList(allBooks);

}catch(err){

    console.error(err);

    document.getElementById(
        "bookList"
    ).innerHTML =
    "<div style='padding:20px;text-align:center;'>도서 데이터를 불러올 수 없습니다.</div>";

}

}

/* ------------------
목록 출력
------------------ */

function renderList(data){

const bookList =
document.getElementById("bookList");

const newBooks =
document.getElementById("newBooks");

bookList.innerHTML = "";
newBooks.innerHTML = "";

data
.sort((a,b)=>
    (b.newbook ? 1 : 0) -
    (a.newbook ? 1 : 0)
)
.forEach(book=>{

    /* 신간 */

    if(book.newbook){

        const newCard =
        document.createElement("div");

        newCard.className =
        "new-book-card";

        newCard.innerHTML = `

        <div style="
            width:100px;
            height:140px;
            margin:auto;
            overflow:hidden;
            border-radius:12px;
            background:#f2f2f2;
        ">

        ${
            book.imgUrl ?

            `<img
                src="${book.imgUrl}"
                style="
                width:100%;
                height:100%;
                object-fit:cover;
            ">`

            :

            `<div style="
                display:flex;
                align-items:center;
                justify-content:center;
                width:100%;
                height:100%;
                color:#999;
                font-size:12px;
            ">
            이미지 없음
            </div>`
        }

        </div>

        <div style="
            font-weight:700;
            margin-top:10px;
            font-size:13px;
        ">
        ${book.title}
        </div>

        <div style="
            color:#666;
            font-size:11px;
            margin-top:4px;
        ">
        ${book.author}
        </div>

        `;

        newCard.onclick =
        ()=>showDetail(book);

        newBooks.appendChild(
            newCard
        );

    }

    /* 일반목록 */

    const div =
    document.createElement("div");

    div.className =
    "book-item";

    div.innerHTML = `

    <div style="
        width:60px;
        height:85px;
        overflow:hidden;
        border-radius:10px;
        background:#f2f2f2;
        flex-shrink:0;
    ">

    ${
        book.imgUrl ?

        `<img
            src="${book.imgUrl}"
            style="
            width:100%;
            height:100%;
            object-fit:cover;
        ">`

        :

        `<div style="
            display:flex;
            align-items:center;
            justify-content:center;
            width:100%;
            height:100%;
            font-size:11px;
            color:#999;
        ">
        없음
        </div>`
    }

    </div>

    <div style="
        margin-left:15px;
        flex:1;
    ">

    <div style="
        font-weight:700;
        font-size:15px;
    ">

    ${book.title}

    ${
        book.newbook
        ? `<span style="color:red;font-size:11px;"> NEW</span>`
        : ""
    }

    </div>

    <div style="
        font-size:12px;
        color:#666;
        margin-top:4px;
    ">

    저자 : ${book.author}

    </div>

    <div style="
        font-size:12px;
        color:#999;
        margin-top:3px;
    ">

    ${book.category || "기타"}

    </div>

    </div>

    `;

    div.onclick =
    ()=>showDetail(book);

    bookList.appendChild(div);

});

}

/* ------------------
상세보기 (수정된 영역)
------------------ */

function showDetail(book){

document.getElementById(
    "detailTitle"
).innerText =
book.title || "";

document.getElementById(
    "detailAuthor"
).innerText =
"저자 : " +
(book.author || "");

const shelfView =
document.getElementById(
    "shelfView"
);

// 어린이전용 책장 여부 확인
const isChildrenShelf = book.shelf === "어린이전용";

shelfView.innerHTML = `
<div style="
    text-align:center;
    margin-bottom:15px;
">
<span style="
    background:#424242;
    color:white;
    padding:6px 14px;
    border-radius:20px;
    font-weight:bold;
">
${isChildrenShelf ? `${book.shelf} 책장` : `${book.shelf} 책장 - ${book.slot}칸`}
</span>
</div>
`;

const box =
document.createElement("div");

box.style = `
    display:flex;
    flex-direction:column;
    align-items:center;
    margin:auto;
    width:140px;
    border:8px solid #5D4037;
    border-radius:8px;
    background:#8D6E63;
    padding:5px;
`;

if (isChildrenShelf) {
    
    /* 어린이 전용 책장: 칸 구분 없이 통짜로 위치만 표기 */
    const slot =
    document.createElement("div");

    slot.style = `
        width:120px;
        height:80px;
        display:flex;
        justify-content:center;
        align-items:center;
        background:#FFCC80;
        color:#E65100;
        font-weight:bold;
        text-align:center;
        border-radius:4px;
    `;

    slot.innerText = "어린이전용\n위치";

    box.appendChild(slot);

} else {

    /* 일반 책장 (A~J): 기존과 동일하게 7칸 랜더링 */
    for(let i=7;i>=1;i--){

        const slot =
        document.createElement("div");

        const active =
        Number(book.slot) === i;

        slot.style = `
            width:120px;
            height:35px;
            border-bottom:2px solid #5D4037;
            display:flex;
            justify-content:center;
            align-items:center;
            background:${active ? "#FFCC80" : "#FFF3E0"};
            color:${active ? "#E65100" : "#8D6E63"};
            font-weight:${active ? "bold" : "normal"};
        `;

        slot.innerText =
        i + "칸";

        box.appendChild(slot);

    }

}

shelfView.appendChild(box);

document.getElementById(
    "detailModal"
).style.display =
"block";

}

/* ------------------
이벤트
------------------ */

document.addEventListener(
"DOMContentLoaded",
()=>{

document
.querySelectorAll(
    ".category-item"
)
.forEach(item=>{

    item.addEventListener(
    "click",
     Meso=>{

        document
        .querySelectorAll(
            ".category-item"
        )
        .forEach(el=>
            el.classList.remove(
                "active"
            )
        );

        item.classList.add(
            "active"
        );

        const category =
        item.dataset.category;

        if(category==="전체"){

            renderList(
                allBooks
            );

        }else{

            renderList(
                allBooks.filter(
                    b=>
                    b.category===category
                )
            );

        }

    });

});

document
.getElementById("search")
.addEventListener(
"input",
e=>{

    const value =
    e.target.value
    .trim()
    .toLowerCase();

    const filtered =
    allBooks.filter(book=>{

        const title =
        (book.title || "")
        .toLowerCase();

        const author =
        (book.author || "")
        .toLowerCase();

        const cho =
        getInitialSound(
            book.title || ""
        );

        return (
            title.includes(value)
            ||
            author.includes(value)
            ||
            cho.includes(value)
        );

    });

    renderList(filtered);

});

document
.getElementById("closeBtn")
.onclick = ()=>{

document
.getElementById(
    "detailModal"
)
.style.display =
"none";

};

loadBooks();
});
