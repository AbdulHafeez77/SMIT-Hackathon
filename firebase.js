import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth , createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc,  updateDoc, collection, addDoc, onSnapshot, deleteDoc, query, where, getDocs, serverTimestamp  } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyDCoP7JIi6z2kTBDSvQUBsDekeo7zeJrWM",
  authDomain: "todo-app-26721.firebaseapp.com",
  databaseURL: "https://todo-app-26721-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "todo-app-26721",
  storageBucket: "todo-app-26721.appspot.com",
  messagingSenderId: "913827042033",
  appId: "1:913827042033:web:c29d5e0e22e1d04eae8f50",
  measurementId: "G-M0C7Q8L2ZE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);
const storage = getStorage();

export {app, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } 
export {db, doc, setDoc, getDoc,  updateDoc, collection, addDoc, onSnapshot, deleteDoc, query, where, getDocs, serverTimestamp}
export{storage, ref, uploadBytesResumable, getDownloadURL,   }