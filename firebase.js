import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkf11w1Bu5IZ_sggCT_GqMjTKnFy9fyuE",
  authDomain: "chilgokbookcafe.firebaseapp.com",
  projectId: "chilgokbookcafe",
  storageBucket: "chilgokbookcafe.firebasestorage.app",
  messagingSenderId: "150579513603",
  appId: "1:150579513603:web:bc76fe94bbddf244084136"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
import {
getAuth
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export const auth =
getAuth(app);
