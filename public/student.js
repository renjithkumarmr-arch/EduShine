import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuGfLiR26UIpS3h_wU7c-F8fouRC2Xd6I",
  authDomain: "edushine--tuition.firebaseapp.com",
  projectId: "edushine--tuition",
  storageBucket: "edushine--tuition.firebasestorage.app",
  messagingSenderId: "525681155706",
  appId: "1:525681155706:web:a4221f1cc4cacdf7a765c3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Protect dashboard
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  if (userDoc.data().status === "Inactive") {
    alert("Your account is disabled.");
    await signOut(auth);
    window.location.href = "login.html";
  }

});