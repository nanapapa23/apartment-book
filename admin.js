import { db } from "./firebase.js";

import {
collection,
getDocs,
addDoc,
deleteDoc,
updateDoc,
doc,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const titleInput =
document.getElementById("title");

const authorInput =
document.getElementById("author");

const categoryInput =
document.getElementById("category");

const shelfInput =
document.getElementById("shelf");

const slotInput =
document.getElementById("slot");

const newbookInput =
document.getElementById("newbook");

const saveBtn =
document.getElementById("saveBtn");

const adminList =
document.getElementById("adminList");

let editId = null;

/* -------------------
   도서 저장
------------------- */

saveBtn.addEventListener(
"click",
async ()=>{

const title =
titleInput.value.trim();

const author =
authorInput.value.trim();

if(!title || !author){

alert("도서명과 저자를 입력하세요");

return;

}

const data = {

title:title,

author:author,

category:categoryInput.value,

shelf:shelfInput.value,

slot:slotInput.value,

newbook:newbookInput.checked,

createdAt:serverTimestamp()

};

try{

if(editId){

await updateDoc(
doc(db,"books",editId),
data
);

alert("수정 완료");

editId=null;

saveBtn.innerText =
"도서 추가";

}else{

await addDoc(
collection(db,"books"),
data
);

alert("등록 완료");

}

clearForm();

loadBooks();

}catch(err){

console.error(err);

alert("저장 실패");

}

}
);

/* -------------------
   입력 초기화
------------------- */

function clearForm(){

titleInput.value="";
authorInput.value="";
categoryInput.value="성인";
shelfInput.value="A";
slotInput.value="1";
newbookInput.checked=false;

}

/* -------------------
   도서목록 로드
------------------- */

async function loadBooks(){

adminList.innerHTML="";

const snapshot =
await getDocs(
collection(db,"books")
);

snapshot.forEach(document=>{

const book =
document.data();

const div =
document.createElement("div");

div.className="book";

div.innerHTML=`

<div class="title">
${book.title}
</div>

<div class="author">
${book.author}
</div>

<div class="author">
${book.category}
</div>

<div class="author">
${book.shelf} 책장 /
${book.slot} 칸
</div>

<div style="margin-top:10px;">

<button
class="editBtn"
data-id="${document.id}">
수정
</button>

<button
class="deleteBtn"
data-id="${document.id}">
삭제
</button>

<button
class="newBtn"
data-id="${document.id}">
${book.newbook ? "신간해제" : "신간등록"}
</button>

</div>

`;

adminList.appendChild(div);

});

/* 수정 */

document
.querySelectorAll(".editBtn")
.forEach(btn=>{

btn.onclick =
()=>editBook(btn.dataset.id);

});

/* 삭제 */

document
.querySelectorAll(".deleteBtn")
.forEach(btn=>{

btn.onclick =
()=>deleteBook(btn.dataset.id);

});

/* 신간 */

document
.querySelectorAll(".newBtn")
.forEach(btn=>{

btn.onclick =
()=>toggleNewBook(btn.dataset.id);

});

}

/* -------------------
   수정
------------------- */

async function editBook(id){

const snapshot =
await getDocs(
collection(db,"books")
);

snapshot.forEach(document=>{

if(document.id===id){

const book =
document.data();

titleInput.value=
book.title;

authorInput.value=
book.author;

categoryInput.value=
book.category;

shelfInput.value=
book.shelf;

slotInput.value=
book.slot;

newbookInput.checked=
book.newbook;

editId=id;

saveBtn.innerText=
"수정 저장";

}

});

}

/* -------------------
   삭제
------------------- */

async function deleteBook(id){

if(!confirm("삭제할까요?"))
return;

await deleteDoc(
doc(db,"books",id)
);

loadBooks();

}

/* -------------------
   신간 ON/OFF
------------------- */

async function toggleNewBook(id){

const snapshot =
await getDocs(
collection(db,"books")
);

snapshot.forEach(async document=>{

if(document.id===id){

const book =
document.data();

await updateDoc(
doc(db,"books",id),
{
newbook:!book.newbook
}
);

loadBooks();

}

});

}

/* -------------------
   시작
------------------- */

loadBooks();
const logoutBtn =
document.getElementById(
"logoutBtn"
);

if(logoutBtn){

logoutBtn.onclick=()=>{

sessionStorage.removeItem(
"libraryAdmin"
);

location.href=
"index.html";

};

}
