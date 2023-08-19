import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth , createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc,  updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref,  uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject  } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

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
const userProfile = document.getElementById('user-profile');


const getUserData = async (uid) => {
  try{
    const docRef = doc(db, "users", uid); 
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {  
    let fullName = document.getElementById('signup-name');
    let signupEmail = document.getElementById('signup-email');
    let userName = document.getElementById('userName');
    let userEmail = document.getElementById('userEmail');
    if(location.pathname === '/profile.html' ){
      fullName.value = docSnap.data().fullName;
      signupEmail.value = docSnap.data().signupEmail;
      if(docSnap.data().picture){
         userProfile.src = docSnap.data().picture;
      }
    } else{
        userName.innerHTML = docSnap.data().fullName;
        userEmail.innerHTML = docSnap.data().signupEmail;
        if(docSnap.data().picture){
          userProfile.src = docSnap.data().picture; 
          console.log(docSnap.data()) 
        }
    }  
    } else {
      console.log("No such document!");
    }
  } catch (error){
    console.log(error)
  }
}


onAuthStateChanged(auth, (user) => {
  if (user) {
    let uid = localStorage.getItem('uid');
    getUserData(user.uid);
    getAllUsers(user.email)
    if (user  && uid) {
      if (location.pathname !== '/profile.html' && location.pathname !== '/chat.html' ) {
         location.href = 'profile.html'
      }
    }
  } else {
    if(location.pathname !== '/index.html' && location.pathname != '/signup.html'){
         location.href = 'index.html'
    }
  }
});


const getAllUsers = async (email) => {
  try {
    const q = query(collection(db, "users"), where("email", "!=", email));
    const querySnapshot = await getDocs(q);
    console.log(query(collection(db, 'users')))
    console.log(where('email', '!=' , email))

    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  } catch (error) {
    console.log("Error fetching users:", error);
  }
}



let signupbtn = document.getElementById('signup-btn');

signupbtn && signupbtn.addEventListener('click', function(event) {
  event.preventDefault();
  let fullName = document.getElementById('signup-name');
  let signupEmail = document.getElementById('signup-email');
  let signupPassword = document.getElementById('signup-pass');
  createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value)
  .then( async (userCredential) => {
    try{
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName.value,
        signupEmail: signupEmail.value,
        signupPassword: signupPassword.value
      });
      localStorage.setItem("uid", user.uid);
      location.href = 'profile.html';
    }catch(error){
      console.log(error)
    }
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    if(errorMessage == "Firebase: Error (auth/email-already-in-use)." ){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Account Already Exist!',
        footer: '<a href="index.html">log in</a>'
      })
    }
    signupEmail.value = "";
    signupPassword.value = "";
  });
})


let loginbtn = document.getElementById('login-btn');

loginbtn && loginbtn.addEventListener('click', function(event) {
  event.preventDefault();
  let loginEmail = document.getElementById('login-email');
  let loginPassword = document.getElementById('login-pass');

  signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("uid", user.uid);
      loginEmail.value = "";
      loginPassword.value = "";
      location.href = 'profile.html'
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if(errorMessage == "Firebase: Error (auth/wrong-password)." ){
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'You enter Wrong Password!',
          footer: '<a href="">Forget Password?</a>'
        })
      }else if(errorMessage == 'Firebase: Error (auth/user-not-found).'){
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'User Not Found!',
          footer: '<a href="">Forget Password?</a>'
        })
      }
      loginEmail.value = "";
      loginPassword.value = "";
    })
}) 


let logoutBtn = document.getElementById('logout-btn');

logoutBtn && logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  signOut(auth).then(() => {
    localStorage.clear();
    location.href = 'index.html';
  }).catch((error) => {
    console.log(error);
  });
})

const uploadFile = (file) => {
  return new Promise ((resolve , reject) => {
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
             break;
          case 'running':
             console.log('Upload is running');
             break;
        }
      }, 
      (error) => {
         reject(error)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
        resolve(downloadURL);
        });
      }
    );  
  })
}

const fileInput = document.getElementById('file-input');

fileInput && fileInput.addEventListener('change', () =>{
  console.log(fileInput.files[0])
  userProfile.src = URL.createObjectURL(fileInput.files[0])
} 
)

let updateProfileBtn = document.getElementById('update-profile-btn');

updateProfileBtn && updateProfileBtn.addEventListener('click', async () => {
  try{  
    let uid = localStorage.getItem('uid')
    let fullName = document.getElementById('signup-name');
    let signupEmail = document.getElementById('signup-email');
    let imageURl = await uploadFile(fileInput.files[0])
    console.log(fileInput.files[0])
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
       await updateDoc(userRef, {
       fullName: fullName.value,
       signupEmail: signupEmail.value,
       picture: imageURl 
      });
      Swal.fire({
        icon: 'success!',
        title: 'Profile updated successfully.',
      });
    } else {
      console.log("Document does not exist!");
    }
  } catch(error) {
    console.log(error)
  }
})