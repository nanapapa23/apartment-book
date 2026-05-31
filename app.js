import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadBooks() {
    const snapshot = await getDocs(collection(db, "books"));
    const bookList = document.getElementById("bookList");
    bookList.innerHTML = "";
    snapshot.forEach(doc => {
        const b = doc.data();
        const div = document.createElement("div");
        div.className = "book-card";
        div.innerHTML = `
            ${b.newbook ? '<span class="new-badge">NEW</span>' : ''}
            <div class="book-img" style="${b.imageUrl ? `background-image:url('${b.imageUrl}')` : ''}">
                ${!b.imageUrl ? '📖' : ''}
            </div>
            <div style="font-weight:bold; font-size:14px;">${b.title}</div>
            <div style="font-size:12px; color:#64748b;">${b.author}</div>
        `;
        bookList.appendChild(div);
    });
}
loadBooks();
