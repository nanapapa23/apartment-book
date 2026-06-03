import { db, auth } from "./firebase.js";

import {
onAuthStateChanged,
signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        alert("관리자 로그인이 필요합니다.");

        location.href = "admin-login.html";

        return;
    }

    await loadBooks();

});

const [title, author, imgUrl, regDate, category, shelf, slot, newbook] = 
      ["title", "author", "imgUrl", "regDate", "category", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");
let editId = null;

function renderStats(books){

let total =
books.length;

let adult = 0;
let teen = 0;
let child = 0;
let selfdev = 0;
let etc = 0;
let newCount = 0;

books.forEach(b=>{

if(b.category==="성인")
adult++;

else if(
b.category==="청소년"
)
teen++;

else if(
b.category==="어린이"
)
child++;

else if(
b.category==="자기개발"
)
selfdev++;

else
etc++;

if(b.newbook)
newCount++;

});

document.getElementById(
"bookStats"
).innerHTML = `

<div class="stats-grid">

<div class="stat-box">
<div class="stat-count">
${total}
</div>
<div class="stat-label">
전체
</div>
</div>

<div class="stat-box">
<div class="stat-count">
${adult}
</div>
<div class="stat-label">
성인
</div>
</div>

<div class="stat-box">
<div class="stat-count">
${teen}
</div>
<div class="stat-label">
청소년
</div>
</div>

<div class="stat-box">
<div class="stat-count">
${child}
</div>
<div class="stat-label">
어린이
</div>
</div>

<div class="stat-box">
<div class="stat-count">
${selfdev}
</div>
<div class="stat-label">
자기개발
</div>
</div>

<div class="stat-box">
<div class="stat-count">
${etc}
</div>
<div class="stat-label">
기타
</div>
</div>

<div class="stat-box">
<div class="stat-count">
${newCount}
</div>
<div class="stat-label">
신간
</div>
</div>

</div>

`;

}

async function loadBooks() {

    document.getElementById("adminList").innerHTML = "";

    const snap =
    await getDocs(
        collection(db, "books")
    );

    const books = [];

    snap.forEach(d => {

        const b = d.data();

        books.push(b);
        const div = document.createElement("div");
        div.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.category || ''}</small></div>
                         <div><button onclick="editBook('${d.id}')">수정</button> <button onclick="deleteBook('${d.id}')">삭제</button></div>`;
        document.getElementById("adminList").appendChild(div);

    });

    renderStats(books);

}

window.editBook = async (id) => {
    const snap = await getDocs(collection(db, "books"));
    const b = snap.docs.find(d => d.id === id).data();
    title.value = b.title; author.value = b.author; imgUrl.value = b.imgUrl || "";
    regDate.value = b.date || ""; category.value = b.category || ""; shelf.value = b.shelf; slot.value = b.slot; newbook.checked = b.newbook;
    editId = id; saveBtn.innerText = "수정 저장";
};

window.deleteBook = async (id) => { if(confirm("삭제하시겠습니까?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };

saveBtn.onclick = async () => {

    if(!category.value){
        alert("카테고리를 선택하세요.");
        return;
    }

    const titleValue =
    title.value.trim();

    const authorValue =
    author.value.trim();

    const snap =
    await getDocs(
        collection(db,"books")
    );

    let duplicated = false;

    snap.forEach(d=>{

        if(
            editId &&
            d.id === editId
        ){
            return;
        }

        const b = d.data();

        if(
            (b.title || "").trim() === titleValue &&
            (b.author || "").trim() === authorValue
        ){
            duplicated = true;
        }

    });

    if(duplicated){

        alert(
            "동일한 제목/저자의 도서가 이미 등록되어 있습니다."
        );

        return;
    }

    const data = {

        title:titleValue,
        author:authorValue,
        imgUrl:imgUrl.value,
        date:regDate.value,
        category:category.value,
        shelf:shelf.value,
        slot:parseInt(slot.value),
        newbook:newbook.checked

    };

    if(editId){

        await updateDoc(
            doc(db,"books",editId),
            data
        );

    }else{

        await addDoc(
            collection(db,"books"),
            data
        );

    }

    location.reload();

};

document.getElementById("csvFile").onchange = async (e) => {

const snap =
await getDocs(
collection(db,"books")
);

const existSet =
new Set();

snap.forEach(doc=>{

const b = doc.data();

existSet.add(
`${(b.title||"").trim()}_${(b.author||"").trim()}`
);

});

const reader =
new FileReader();

reader.onload = async (event) => {

const batch =
writeBatch(db);

let addCount = 0;
let skipCount = 0;

event.target.result
.split("\n")
.slice(1)
.forEach(row=>{

const cols =
row.split(",");

if(cols.length < 7) return;

const title =
(cols[0]||"").trim();

const author =
(cols[1]||"").trim();

const key =
`${title}_${author}`;

if(existSet.has(key)){

skipCount++;

return;

}

existSet.add(key);

batch.set(
doc(
collection(db,"books")
),
{
title,
author,
imgUrl:cols[2],
date:cols[3],
category:cols[4],
shelf:cols[5],
slot:parseInt(cols[6]),
newbook:cols[7] === "true"
}
);

addCount++;

});

await batch.commit();

alert(
`업로드 완료\n추가 : ${addCount}건\n중복제외 : ${skipCount}건`
);

location.reload();

};

reader.readAsText(
e.target.files[0],
"UTF-8"
);

};

document.getElementById("downloadBtn").onclick = async ()=>{

    const snap =
    await getDocs(
        collection(db,"books")
    );

    let csv =
    "\uFEFF제목,저자,이미지URL,등록일,카테고리,책장,칸,신간\n";

    snap.forEach(d=>{

        const b = d.data();

        csv +=
        `${b.title || ""},${b.author || ""},${b.imgUrl || ""},${b.date || ""},${b.category || ""},${b.shelf || ""},${b.slot || ""},${b.newbook || false}\n`;

    });

    const blob =
    new Blob(
        [csv],
        {
            type:"text/csv;charset=utf-8"
        }
    );

    const a =
    document.createElement("a");

    a.href =
    URL.createObjectURL(blob);

    const today =
    new Date();

    const y =
    today.getFullYear();

    const m =
    String(
        today.getMonth()+1
    ).padStart(2,"0");

    const d =
    String(
        today.getDate()
    ).padStart(2,"0");

    a.download =
    `${y}${m}${d}_booklist.csv`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

};

document.getElementById("logoutBtn").onclick = async () => {

    await signOut(auth);

    location.href = "index.html";

};
