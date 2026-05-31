import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadBooks() {
    const snapshot = await getDocs(collection(db, "books"));
    const newBooksContainer = document.getElementById("newBooks");
    const bookList = document.getElementById("bookList");
    
    newBooksContainer.innerHTML = "";
    bookList.innerHTML = "";

    snapshot.forEach(doc => {
        const b = doc.data();
        const imgStyle = b.imageUrl ? `background-image:url('${b.imageUrl}')` : '';
        
        // 신간 배너 생성
        if (b.newbook) {
            const div = document.createElement("div");
            div.className = "new-book-card";
            div.innerHTML = `<div class="book-img" style="${imgStyle}">${!b.imageUrl?'📖':''}</div><div style="font-size:12px;">${b.title}</div>`;
            newBooksContainer.appendChild(div);
        }

        // 전체 리스트 생성
        const div = document.createElement("div");
        div.className = "book-card";
        div.innerHTML = `
            <div class="book-img" style="${imgStyle}">${!b.imageUrl?'📖':''}</div>
            <div style="font-weight:bold; font-size:14px;">${b.title}</div>
            <div style="font-size:12px; color:#64748b;">${b.author}</div>
        `;
        bookList.appendChild(div);
    });
}
loadBooks();
