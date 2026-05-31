import { db } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, writeBatch, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const categoryInput = document.getElementById("category");
const shelfInput = document.getElementById("shelf");
const slotInput = document.getElementById("slot");
const newbookInput = document.getElementById("newbook");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const adminList = document.getElementById("adminList");
const importFile = document.getElementById("importFile");
const exportBtn = document.getElementById("exportBtn");

let editId = null;

// 도서 저장/수정
saveBtn.onclick = async () => {
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    if(!title || !author) return alert("도서명과 저자를 입력하세요.");

    const data = {
        title, author,
        category: categoryInput.value,
        shelf: shelfInput.value,
        slot: slotInput.value,
        newbook: newbookInput.checked,
        updatedAt: serverTimestamp()
    };

    try {
        if(editId) {
            await updateDoc(doc(db, "books", editId), data);
            alert("수정되었습니다.");
            resetForm();
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "books"), data);
            alert("등록되었습니다.");
        }
        clearForm();
        loadAdminBooks();
    } catch(e) { alert("저장 실패: " + e.message); }
};

// 목록 로드
async function loadAdminBooks() {
    adminList.innerHTML = "<p>로딩 중...</p>";
    const q = query(collection(db, "books"), orderBy("title", "asc"));
    const snapshot = await getDocs(q);
    document.getElementById("adminCount").innerText = snapshot.size + "권";
    adminList.innerHTML = "";

    snapshot.forEach(docSnap => {
        const book = docSnap.data();
        const id = docSnap.id;
        const div = document.createElement("div");
        div.className = `admin-item ${book.newbook ? 'is-new' : ''}`;
        div.innerHTML = `
            <div class="info">
                <strong>${book.title}</strong>
                <span>${book.author} | ${book.category} | ${book.shelf}-${book.slot}</span>
            </div>
            <div class="actions">
                <button onclick="editBook('${id}', \`${book.title}\`, \`${book.author}\`, '${book.category}', '${book.shelf}', '${book.slot}', ${book.newbook})">수정</button>
                <button class="del" onclick="deleteBook('${id}')">삭제</button>
            </div>
        `;
        adminList.appendChild(div);
    });
}

window.editBook = (id, title, author, cat, shelf, slot, isNew) => {
    editId = id;
    titleInput.value = title;
    authorInput.value = author;
    categoryInput.value = cat;
    shelfInput.value = shelf;
    slotInput.value = slot;
    newbookInput.checked = isNew;
    saveBtn.innerText = "정보 수정하기";
    cancelBtn.style.display = "inline-block";
    document.getElementById("formTitle").innerText = "도서 정보 수정";
};

window.deleteBook = async (id) => {
    if(!confirm("정말 삭제하시겠습니까?")) return;
    await deleteDoc(doc(db, "books", id));
    loadAdminBooks();
};

window.resetForm = () => {
    editId = null;
    saveBtn.innerText = "도서 추가하기";
    cancelBtn.style.display = "none";
    document.getElementById("formTitle").innerText = "새 도서 등록";
    clearForm();
};

function clearForm() {
    titleInput.value = ""; authorInput.value = "";
    newbookInput.checked = false;
}

cancelBtn.onclick = resetForm;

// CSV 다운로드 (yymmdd_booklist.csv)
exportBtn.onclick = async () => {
    const snapshot = await getDocs(collection(db, "books"));
    let csv = "\uFEFF도서명,저자,카테고리,책장,칸,신간여부\n";
    snapshot.forEach(doc => {
        const b = doc.data();
        csv += `"${b.title}","${b.author}","${b.category}","${b.shelf}","${b.slot}","${b.newbook}"\n`;
    });

    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${date}_booklist.csv`;
    link.click();
};

// CSV 대량 업로드
importFile.onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        const rows = event.target.result.split("\n").slice(1);
        const batch = writeBatch(db);
        let count = 0;
        rows.forEach(row => {
            const cols = row.split(",").map(c => c.replace(/"/g, "").trim());
            if(cols.length >= 5) {
                const newDocRef = doc(collection(db, "books"));
                batch.set(newDocRef, {
                    title: cols[0], author: cols[1], category: cols[2],
                    shelf: cols[3], slot: cols[4], newbook: cols[5] === "true",
                    createdAt: serverTimestamp()
                });
                count++;
            }
        });
        await batch.commit();
        alert(count + "권 업로드 완료!");
        loadAdminBooks();
    };
    reader.readAsText(file);
};

document.getElementById("logoutBtn").onclick = () => {
    sessionStorage.clear();
    location.href = "index.html";
};

loadAdminBooks();
