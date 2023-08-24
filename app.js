import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "/firebase.js";
import { db, doc, setDoc, getDoc, updateDoc, collection, addDoc, onSnapshot, deleteDoc, query, where, getDocs } from "/firebase.js";
import { storage, ref, uploadBytesResumable, getDownloadURL,} from "/firebase.js";

const userProfile = document.getElementById('user-profile');
let navProfile = document.getElementById('nav-profile');
const ids = [];



onAuthStateChanged(auth, (user) => {
  if (user) {
    let uid = localStorage.getItem('uid')
    getUserData(user.uid);
    if (user && uid) {
      if (location.pathname !== '/profile.html' && location.pathname !== '/dashboard.html' && location.pathname !== '/blogs.html') {
        location.href = "profile.html"
      }
    } else if (location.pathname == "/dashboard.html" && location.pathname == '/blogs.html'){
        navProfile.style.display = 'block';
    } else {
      if (location.pathname !== '/index.html' && location.pathname !== "signup.html") {
        location.href = "index.html"
      }
    }
  } 
});


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
      userName.innerHTML = docSnap.data().fullName;
      userEmail.innerHTML = docSnap.data().signupEmail;
      console.log(userProfile)
      if (docSnap.data().picture) {
        userProfile.src = docSnap.data().picture; 
      } 
    } else {
      if (docSnap.data().picture) {
        userProfile.src = docSnap.data().picture; 
      } 
    } 
  } else {
    console.log("No such document!");
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
        text: errorMessage,
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
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: errorMessage,
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
    location.href = 'login.html';
    console.log('gaya')
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
  let uid = localStorage.getItem('uid')
  let fullName = document.getElementById('signup-name');
  let signupEmail = document.getElementById('signup-email');
  let imageUrl = await uploadFile(fileInput.files[0])
  console.log(fileInput.files[0])
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    await updateDoc(userRef, {
      fullName: fullName.value,
      signupEmail: signupEmail.value,
      picture: imageUrl,
    });
    Swal.fire({
      icon: 'success!',
      title: 'Profile updated successfully.',
    });
  } else {
    console.log("Document does not exist!");
  }
})


// const q = query(collection(db, "users"));
// const querySnapshot = await getDocs(q);
// querySnapshot.forEach((doc) => {
//   // doc.data() is never undefined for query doc snapshots
//   console.log(doc.id, " => ", doc.data());
// });


let greetingTime = document.getElementById('time');
let time = new Date().getHours();

if(location.pathname == '/index.html' || location.pathname == '/blogs.html'){
  if (time >= 5 && time < 12) {
    greetingTime.innerHTML = 'Good Morning Readers';
  } else if (time >= 12 && time < 18) {
    greetingTime.innerHTML = 'Good AfterNoon Readers';
  } else {
    greetingTime.innerHTML = 'Good Evening Readers'
  }
}


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
                 <div class="right">  
                   <a href="#" class="btn button" onclick='delBlog("${title.doc.id}")'>Delete</a>
                   <a href="#" class="btn button" onclick='editBlog(this,"${title.doc.id}")'>Edit</a>
                 </div>
               </div>
              </div>
              `
          }
      })
  });
}
getBlogs()


const addBlog = async () => {
  try {
      let title = document.getElementById("title");
      let blog = document.getElementById('blog');
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