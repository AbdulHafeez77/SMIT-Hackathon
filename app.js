import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth , createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc,  updateDoc, collection, addDoc, onSnapshot, deleteDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
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
const userProfile = document.getElementById('user-profile');
const ids = [];



let navProfile = document.getElementById('nav-profile');
let loginNav = document.getElementById("login");
let signNav = document.getElementById('sign');

onAuthStateChanged(auth, (user) => {
  if (user) {
    let uid = localStorage.getItem('uid')
    getUserData(user.uid);
    if(user && location.pathname == "/index.html"){
      navProfile.style.display = 'block';
      loginNav.innerHTML = "Log out";
      loginNav.id = 'logout-btn';
      signNav.innerHTML = 'Create a Blog';
      signNav.href = '#';
      signNav.id = 'create-blog';
      console.log(signNav);
      console.log(loginNav)
    } 
  } 
});



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
    // location.href = 'index.html';
    console.log('gaya')
  }).catch((error) => {
    console.log(error);
  });
})




const getUserData = async (uid) => {
  const docRef = doc(db, "users", uid); 
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {  
    let fullName = document.getElementById('signup-name');
    let signupEmail = document.getElementById('signup-email');
    let userName = document.getElementById('userName');
    let userEmail = document.getElementById('userEmail');
    if(location.pathname === '/profile.html'){
      fullName.value = docSnap.data().fullName;
      signupEmail.value = docSnap.data().signupEmail;
      if(docSnap.data().picture){
        userProfile.src = docSnap.data().picture;  
      } 
    } else if(location.pathname === '/index.html'){
      console.log(userEmail)
      // userName.innerHTML = docSnap.data().fullName;
      // userEmail.innerHTML = docSnap.data().signupEmail;
      if (docSnap.data().picture) {
        userProfile.src = docSnap.data().picture; 
      } 
    }  
  } else {
    console.log("No such document!");
  }
}


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
      picture: imageURl,
    });
    Swal.fire({
      icon: 'success!',
      title: 'Profile updated successfully.',
    });
  } else {
    console.log("Document does not exist!");
  }
})


const q = query(collection(db, "users"));

const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  console.log(doc.id, " => ", doc.data());
});


let creatingBlog = document.getElementById('creating-blog');
let greetingTime = document.getElementById('time');
console.log(greetingTime)
let time = new Date().getHours();
console.log(time)
if( time < 12){
   greetingTime.innerHTML = 'Good Morning Readers';
}else if(time >= 12){
  greetingTime.innerHTML = 'Good AfterNoon Readers';
  if(time >= 18){
    greetingTime.innerHTML = 'Good Evening Readers'
  }
} 


signNav && signNav.addEventListener('click', (event) => {
  event.preventDefault();
  creatingBlog.style.display = 'block';
  console.log("chala");
})


const getBlogs = () => {
  onSnapshot(collection(db, "blogs"), (data) => {
      data.docChanges().forEach((title) => {
          ids.push(title.doc.id)
          if (title.type === 'removed') {
            let dblog = document.getElementById(title.doc.id);
            if (dblog) {
              dblog.remove()
            }
          } else if (title.type === 'added' && location.pathname == "/index.html") {
              let list = document.getElementById("list");
              list.innerHTML += `
              <div class="card w-75 mb-3">
                <div class="user-info">
                  <div>
                   <img id="user-profile" src="images/chat-users.png" class="chat-users" width="34" height="34" alt="" />
                  </div>
                  <div>
                    <p class="name font-weight-bold" id="userName"> </p>
                    <p class="margin name" id="userEmail"> </p>
                  </div>
                </div>
               <div id='${title.doc.id}'>
                 <h5 class="card-title">${title.doc.data().title}</h5>
                 <p class="card-text">${title.doc.data().blog}</p>
                 <p class="card-text time">${title.doc.data().time}</p>
                 <a href="#" class="btn btn-warning" onclick='delBlog("${title.doc.id}")'>Delete</a>
                 <a href="#" class="btn btn-warning" onclick='editBlog(this,"${title.doc.id}")'>Edit</a>
               </div>
              </div>
              `
              creatingBlog.style.display = 'none';
          }
      })
  });
}

getBlogs()


const addBlog = async () => {
  try {
      let title = document.getElementById("title");
      let blog = document.getElementById('blog');
      creatingBlog.display = 'none';
      let date = new Date()
      const docRef = await addDoc(collection(db, "blogs"), {
          title: title.value,
          blog: blog.value,
          time: date.toLocaleString()
      });
      title.value = ""
      blog.value = ''
  } catch (err) {
      console.log(err)
  }

}

async function delBlog(id) {
  await deleteDoc(doc(db, "blogs", id));
  console.log("blog deleted")
}


var edit = false;
async function editBlog(e, id) {
  if (edit) {
    let updatedTitle = e.parentNode.querySelector(".card-title").textContent;
    let updatedBlog = e.parentNode.querySelector(".card-text").textContent;
    await updateDoc(doc(db, "blogs", id), {
      title: updatedTitle,
      blog: updatedBlog
    });
    e.parentNode.querySelector(".card-title").contentEditable = false;
    e.parentNode.querySelector(".card-text").contentEditable = false;
    e.innerHTML = "Edit";
    edit = false;
  } else {
    e.parentNode.querySelector(".card-title").contentEditable = true;
    e.parentNode.querySelector(".card-text").contentEditable = true;
    e.parentNode.querySelector(".card-title").focus();
    e.parentNode.querySelector(".card-text").focus();
    e.innerHTML = "Update";
    edit = true;
  }
}


window.addBlog = addBlog;
window.delBlog = delBlog;
window.editBlog = editBlog;