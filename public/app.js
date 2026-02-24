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

const firebaseConfig = {
  apiKey: "AIzaSyDuGfLiR26UIpS3h_wU7c-F8fouRC2Xd6I",
  authDomain: "edushine--tuition.firebaseapp.com",
  projectId: "edushine--tuition"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Protect Admin
onAuthStateChanged(auth, async (user) => {
  if (!user) window.location.href = "index.html";
});


// Logout
window.logout = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};


// Tab Switch
window.showTab = function(tab) {
  const tabs = ["dashboardTab","createTab","disableTab","contentTab","examTab"];
  tabs.forEach(id => document.getElementById(id).classList.add("hidden"));

  if (tab === "dashboard") {
    document.getElementById("dashboardTab").classList.remove("hidden");
    loadStudents();
  }
  if (tab === "create")
    document.getElementById("createTab").classList.remove("hidden");
  if (tab === "disable") {
    document.getElementById("disableTab").classList.remove("hidden");
    loadDisableStudents();
  }
  if (tab === "content") {
    document.getElementById("contentTab").classList.remove("hidden");
    loadStudyContent();
  }
  if (tab === "exam") {
    document.getElementById("examTab").classList.remove("hidden");
    loadExams();
  }
};


// Create Student
window.createStudent = async function () {

  const name = studentName.value;
  const email = newEmail.value;
  const password = newPassword.value;
  const cls = studentClass.value;
  const subject = studentSubject.value;

  const secondaryApp = initializeApp(firebaseConfig, "Secondary");
  const secondaryAuth = getAuth(secondaryApp);

  const userCred = await createUserWithEmailAndPassword(
    secondaryAuth, email, password
  );

  await secondaryAuth.signOut();

  await setDoc(doc(collection(db, "users")), {
    name, email,
    class: cls,
    subject,
    role: "student",
    status: "Active",
    createdAt: new Date()
  });

  statusMessage.innerText = "Student created ✅";
  loadStudents();
};


// Load Students
async function loadStudents() {
  studentTable.innerHTML = "";
  const snapshot = await getDocs(collection(db,"users"));
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    if (d.role === "student") {
      studentTable.innerHTML += `
        <tr>
          <td>${d.name}</td>
          <td>${d.class}</td>
          <td>${d.subject}</td>
          <td class="${d.status==='Active'?'active':'inactive'}">${d.status}</td>
        </tr>`;
    }
  });
}


// Disable
async function loadDisableStudents() {
  disableTable.innerHTML="";
  const snapshot = await getDocs(collection(db,"users"));
  snapshot.forEach(docSnap=>{
    const d=docSnap.data();
    if(d.role==="student"){
      disableTable.innerHTML+=`
      <tr>
        <td>${d.name}</td>
        <td>${d.status}</td>
        <td>
          <button onclick="toggleStatus('${docSnap.id}','${d.status}')">
            ${d.status==="Active"?"Disable":"Enable"}
          </button>
        </td>
      </tr>`;
    }
  });
}

window.toggleStatus = async function(id,status){
  await setDoc(doc(db,"users",id),
    {status: status==="Active"?"Inactive":"Active"},
    {merge:true});
  loadDisableStudents();
};


// Add Study Content
window.addContent = async function(){
  await setDoc(doc(collection(db,"studyContent")),{
    chapter: contentChapter.value,
    title: contentTitle.value,
    class: contentClass.value,
    subject: contentSubject.value,
    driveLink: driveLink.value,
    createdAt: new Date()
  });
  contentStatus.innerText="Content added ✅";
  loadStudyContent();
};


// Load Study Content
async function loadStudyContent(){
  contentTableAdmin.innerHTML="";
  const snapshot=await getDocs(collection(db,"studyContent"));
  snapshot.forEach(docSnap=>{
    const d=docSnap.data();
    contentTableAdmin.innerHTML+=`
      <tr>
        <td>${d.class}</td>
        <td>${d.subject}</td>
        <td>${d.chapter}</td>
        <td>${d.title}</td>
        <td><button onclick="deleteStudy('${docSnap.id}')">Delete</button></td>
      </tr>`;
  });
}

window.deleteStudy = async function(id){
  await deleteDoc(doc(db,"studyContent",id));
  loadStudyContent();
};


/// ===============================
// Add Exam
// ===============================
window.addExam = async function() {

  const chapterInput = document.getElementById("examChapter");
  const titleInput = document.getElementById("examTitle");
  const classInput = document.getElementById("examClass");
  const subjectInput = document.getElementById("examSubject");
  const linkInput = document.getElementById("examDriveLink");
  const status = document.getElementById("examStatus");

  if (!chapterInput || !titleInput || !linkInput) {
    console.error("Exam inputs not found in DOM");
    return;
  }

  const chapter = chapterInput.value.trim();
  const title = titleInput.value.trim();
  const cls = classInput.value;
  const subject = subjectInput.value;
  const link = linkInput.value.trim();

  if (!chapter || !title || !link) {
    status.innerText = "Please fill all fields.";
    return;
  }

  try {

    const examRef = doc(collection(db, "examQuestions"));

    await setDoc(examRef, {
      chapter: chapter,
      title: title,
      class: cls,
      subject: subject,
      driveLink: link,
      createdAt: new Date()
    });

    status.innerText = "Exam added successfully ✅";

    chapterInput.value = "";
    titleInput.value = "";
    linkInput.value = "";

    loadExams();

  } catch (error) {
    console.error("Exam Save Error:", error);
    status.innerText = error.message;
  }
};


// Load Exams
async function loadExams(){
  examTableAdmin.innerHTML="";
  const snapshot=await getDocs(collection(db,"examQuestions"));
  snapshot.forEach(docSnap=>{
    const d=docSnap.data();
    examTableAdmin.innerHTML+=`
      <tr>
        <td>${d.class}</td>
        <td>${d.subject}</td>
        <td>${d.chapter}</td>
        <td>${d.title}</td>
        <td><button onclick="deleteExam('${docSnap.id}')">Delete</button></td>
      </tr>`;
  });
}

window.deleteExam = async function(id){
  await deleteDoc(doc(db,"examQuestions",id));
  loadExams();
};


showTab("dashboard");