// [데이터 저장 시 출판사 포함]
const [title, author, publisher, imgUrl, regDate, category, shelf, slot, newbook] = 
      ["title", "author", "publisher", "imgUrl", "regDate", "category", "shelf", "slot", "newbook"].map(id => document.getElementById(id));

saveBtn.onclick = async () => {
    const data = { 
        title: title.value, 
        author: author.value, 
        publisher: publisher.value, // 추가
        imgUrl: imgUrl.value, 
        date: regDate.value, 
        category: category.value, 
        shelf: shelf.value, 
        slot: parseInt(slot.value), 
        newbook: newbook.checked 
    };
    if(editId) await updateDoc(doc(db, "books", editId), data);
    else await addDoc(collection(db, "books"), data);
    location.reload();
};

// [CSV 다운로드 시 출판사 포함]
document.getElementById("downloadBtn").onclick = async () => {
    const snap = await getDocs(collection(db, "books"));
    let csv = "\uFEFF제목,저자,출판사,이미지URL,등록일,카테고리,책장,칸,신간\n";
    snap.forEach(d => { 
        const b = d.data(); 
        csv += `${b.title},${b.author},${b.publisher || ''},${b.imgUrl},${b.date},${b.category},${b.shelf},${b.slot},${b.newbook}\n`; 
    });
    // ... 다운로드 로직 동일
};
