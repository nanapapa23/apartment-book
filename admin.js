import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("관리자 로그인이 필요합니다.");
        location.href = "admin-login.html";
        return;
    }
    await loadBooks();
    await loadWishes();
});

const [title, author, publisher, imgUrl, regDate, category, shelf, slot, newbook] = 
      ["title", "author", "publisher", "imgUrl", "regDate", "category", "shelf", "slot", "newbook"].map(id => document.getElementById(id));
const saveBtn = document.getElementById("saveBtn");
let editId = null;

/* ------------------
1. 도서 통계
------------------ */
function renderStats(books) {
    let total = books.length, adult = 0, teen = 0, child = 0, selfdev = 0, etc = 0, newCount = 0;
    books.forEach(b => {
        if(b.category === "성인") adult++;
        else if(b.category === "청소년") teen++;
        else if(b.category === "어린이") child++;
        else if(b.category === "자기개발") selfdev++;
        else etc++;
        if(b.newbook) newCount++;
    });
    document.getElementById("bookStats").innerHTML = `
        <div class="stats-grid">
            <div class="stat-box"><div>${total}</div><div class="stat-label">전체</div></div>
            <div class="stat-box"><div>${adult}</div><div class="stat-label">성인</div></div>
            <div class="stat-box"><div>${teen}</div><div class="stat-label">청소년</div></div>
            <div class="stat-box"><div>${child}</div><div class="stat-label">어린이</div></div>
            <div class="stat-box"><div>${selfdev}</div><div class="stat-label">자기개발</div></div>
            <div class="stat-box"><div>${etc}</div><div class="stat-label">기타</div></div>
            <div class="stat-box"><div>${newCount}</div><div class="stat-label">신간</div></div>
        </div>`;
}

/* ------------------
2. 도서 관리
------------------ */
async function loadBooks() {
    document.getElementById("adminList").innerHTML = "";
    const snap = await getDocs(collection(db, "books"));
    const books = [];
    snap.forEach(d => {
        const b = d.data();
        books.push(b);
        const div = document.createElement("div");
        div.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.publisher||''} | ${b.category||''}</small></div>
                         <div><button onclick="editBook('${d.id}')">수정</button> <button onclick="deleteBook('${d.id}')">삭제</button></div>`;
        document.getElementById("adminList").appendChild(div);
    });
    renderStats(books);
}

window.editBook = async (id) => {
    const snap = await getDocs(collection(db, "books"));
    const b = snap.docs.find(d => d.id === id).data();
    title.value = b.title; author.value = b.author; publisher.value = b.publisher || "";
    imgUrl.value = b.imgUrl || ""; regDate.value = b.date || ""; 
    category.value = b.category || ""; shelf.value = b.shelf; slot.value = b.slot; newbook.checked = b.newbook;
    editId = id; saveBtn.innerText = "수정 저장";
};

window.deleteBook = async (id) => { if(confirm("삭제하시겠습니까?")) { await deleteDoc(doc(db, "books", id)); location.reload(); } };

saveBtn.onclick = async () => {
    const data = { title:title.value.trim(), author:author.value.trim(), publisher:publisher.value.trim(), imgUrl:imgUrl.value, date:regDate.value, category:category.value, shelf:shelf.value, slot:parseInt(slot.value), newbook:newbook.checked };
    if(editId) await updateDoc(doc(db, "books", editId), data);
    else await addDoc(collection(db, "books"), data);
    location.reload();
};

/* ------------------
3. 희망도서 관리
------------------ */
async function loadWishes() {
    const wishList = document.getElementById("wishList");
    if(!wishList) return;
    const snap = await getDocs(collection(db, "wishes"));
    wishList.innerHTML = "<h3>희망도서 신청 현황</h3>";
    snap.forEach(d => {
        const w = d.data();
        wishList.innerHTML += `
            <div style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${w.title}</strong> (${w.author})</div>
                <select onchange="updateStatus('${d.id}', this.value)">
                    <option ${w.status=="구매 예정"?"selected":""}>구매 예정</option>
                    <option ${w.status=="구매완료"?"selected":""}>구매완료</option>
                    <option ${w.status=="구매불가"?"selected":""}>구매불가</option>
                </select>
            </div>`;
    });
}

window.updateStatus = async (id, status) => {
    const reason = status === "구매불가" ? prompt("불가 사유:") : "";
    await updateDoc(doc(db, "wishes", id), { status, reason });
    loadWishes();
};

/* ------------------
4. CSV 및 기타
------------------ */
document.getElementById("downloadBtn").onclick = async () => {
    const snap = await getDocs(collection(db, "books"));
    let csv = "\uFEFF제목,저자,출판사,이미지URL,등록일,카테고리,책장,칸,신간\n";
    snap.forEach(d => { 
        const b = d.data(); 
        csv += `${b.title},${b.author},${b.publisher||''},${b.imgUrl},${b.date},${b.category},${b.shelf},${b.slot},${b.newbook}\n`; 
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
    a.download = "booklist.csv"; a.click();
};

document.getElementById("logoutBtn").onclick = async () => { await signOut(auth); location.href = "index.html"; };
