// ===============================
// Firebase CDN Imports
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// Firebase Config
// ===============================
const firebaseConfig = {
  apiKey: "YOUR_NEW_RESTRICTED_API_KEY",
  authDomain: "edushine--tuition.firebaseapp.com",
  projectId: "edushine--tuition",
  storageBucket: "edushine--tuition.firebasestorage.app",
  messagingSenderId: "525681155706",
  appId: "1:525681155706:web:a4221f1cc4cacdf7a765c3"
};


// ===============================
// Initialize Firebase
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ===============================
// SIMPLE & STABLE PAGE PROTECTION
// ===============================
onAuthStateChanged(auth, (user) => {
  console.log("Auth changed:", user);

  if (user) {
    console.log("Logged in UID:", user.uid);
  } else {
    console.log("User is logged out");
  }
});


// ===============================
// LOGOUT
// ===============================
window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};


// ===============================
// CREATE STUDENT (ADMIN ONLY)
// ===============================
window.createStudent = async function () {

  const name = document.getElementById("studentName").value;
  const email = document.getElementById("newEmail").value;
  const password = document.getElementById("newPassword").value;
  const studentClass = document.getElementById("studentClass").value;
  const studentSubject = document.getElementById("studentSubject").value;
  const statusBox = document.getElementById("statusMessage");

  if (!name || !email || !password) {
    statusBox.innerText = "Please fill all fields.";
    statusBox.style.color = "red";
    return;
  }

  try {

    // Secondary app so admin does not logout
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);

    const userCred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    const uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      name: name,
      email: email,
      role: "student",
      class: studentClass,
      subject: studentSubject,
      status: "Active",
      createdAt: new Date()
    });

    await secondaryAuth.signOut();

    statusBox.innerText = "Student created successfully ✅";
    statusBox.style.color = "green";

  } catch (error) {
    statusBox.innerText = error.message;
    statusBox.style.color = "red";
  }
};


// ===============================
// LOAD STUDENTS (ADMIN)
// ===============================
async function loadStudents() {

  const table = document.getElementById("studentTable");
  if (!table) return;

  table.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    if (data.role === "student") {
      table.innerHTML += `
        <tr>
          <td>${data.name}</td>
          <td>${data.class}</td>
          <td>${data.subject}</td>
          <td style="color:${data.status === "Active" ? "green" : "red"}">
            ${data.status}
          </td>
          <td>
            <button onclick="toggleStatus('${docSnap.id}', '${data.status}')">
              ${data.status === "Active" ? "Disable" : "Enable"}
            </button>
            <button onclick="deleteStudent('${docSnap.id}')">
              Delete
            </button>
          </td>
        </tr>
      `;
    }
  });
}


// ===============================
// ENABLE / DISABLE STUDENT
// ===============================
window.toggleStatus = async function (uid, currentStatus) {

  const newStatus =
    currentStatus === "Active" ? "Inactive" : "Active";

  await setDoc(doc(db, "users", uid), {
    status: newStatus
  }, { merge: true });

  loadStudents();
};


// ===============================
// DELETE STUDENT (Firestore Only)
// ===============================
window.deleteStudent = async function (uid) {

  if (!confirm("Delete this student?")) return;

  await deleteDoc(doc(db, "users", uid));
  loadStudents();
};


// ===============================
// TAB SWITCH
// ===============================
window.showTab = function (tab) {

  document.getElementById("dashboardTab")?.classList.add("hidden");
  document.getElementById("createTab")?.classList.add("hidden");

  if (tab === "dashboard") {
    document.getElementById("dashboardTab")?.classList.remove("hidden");
    loadStudents();
  }

  if (tab === "create") {
    document.getElementById("createTab")?.classList.remove("hidden");
  }
};


// Auto-load students if admin page
if (window.location.pathname.endsWith("admin.html")) {
  loadStudents();
}