import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6n_1bYi3-cT6OlanZv099gnrvY_xhdpA",
  authDomain: "edushine--tuition.firebaseapp.com",
  projectId: "edushine--tuition",
  storageBucket: "edushine--tuition.firebasestorage.app",
  messagingSenderId: "525681155706",
  appId: "1:525681155706:web:a4221f1cc4cacdf7a765c3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.login = async function() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const status = document.getElementById("status");

  status.innerText = "Logging in...";

  try {

    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      status.innerText = "User record not found.";
      return;
    }

    if (userDoc.data().status === "Inactive") {
      status.innerText = "Your account is disabled.";
      return;
    }

    // ROLE BASED REDIRECT
    if (userDoc.data().role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (error) {
    status.innerText = error.message;
  }
};