let allBooks = [];
let currentCategory = "전체";

async function loadBooks() {
    const snap = await getDocs(collection(db, "books"));
    allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderFilteredList();
}

function renderFilteredList() {
    const list = document.getElementById("adminList");
    const query = document.getElementById("adminSearch").value.toLowerCase();
    list.innerHTML = "";

    allBooks.filter(b => 
        (currentCategory === "전체" || b.category === currentCategory) &&
        (b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query))
    ).forEach(b => {
        const div = document.createElement("div");
        div.style = "display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;";
        div.innerHTML = `<div><strong>${b.title}</strong><br><small>${b.author} | ${b.category || ''}</small></div>
                         <div><button onclick="editBook('${b.id}')">수정</button> <button onclick="deleteBook('${b.id}')">삭제</button></div>`;
        list.appendChild(div);
    });
}

// 이벤트 리스너 추가
document.getElementById("adminSearch").oninput = renderFilteredList;
document.querySelectorAll(".cat-filter").forEach(btn => {
    btn.onclick = (e) => {
        document.querySelectorAll(".cat-filter").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        currentCategory = e.target.dataset.cat;
        renderFilteredList();
    };
});
