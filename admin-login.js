import { auth } from "./firebase.js";

import {
signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document
.getElementById("loginBtn")
.onclick = async ()=>{

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

location.href =
"admin-home.html";

}catch{

alert("로그인 실패");

}

};