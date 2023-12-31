import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider,  updatePassword } from "/firebase.js";
import { db, doc, setDoc, getDoc, updateDoc, collection, addDoc, onSnapshot, deleteDoc, query, where, getDocs, serverTimestamp  } from "/firebase.js";
import { storage, ref, uploadBytesResumable, getDownloadURL,} from "/firebase.js";


const userProfile = document.getElementById('user-profile');
let navProfile = document.getElementById('nav-profile');
let loader = document.getElementById('loader');



const getUserData = async (uid) => {
  loader.style.display = "flex";
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
  loader.style.display = "none";
  } else {
    console.log("No such document!");
    loader.style.display = "none";
  }
}


const getCurrentBlogs = async (uid) => {
  try {
    const Bloglist = document.getElementById("Bloglist");
    Bloglist.innerHTML = '';
    const q = query(collection(db, "blogs"), where("uid", "==", uid));
    loader.style.display = "flex";
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id,doc.data().title,doc.data().blog)
      Bloglist.innerHTML += `
      <div class="card w-70 mb-3">
        <div class="user-info">
          <div>
           <img id="user-profile" src="${doc.data().user.picture ? doc.data().user.picture : "images/chat-users.png"}" class="chat-users" width="42" height="42" alt="" />
          </div>
          <div>
            <h4 class="name">${doc.data().user.fullName}</h4>
          </div>
        </div>
       <div>
         <h5 class="card-title">${doc.data().title}</h5>
         <p class="card-text">${doc.data().blog}</p>
         <p class="card-text time">${doc.data().time.toDate().toDateString()}</p>
         <div class="right">  
           <a type="button" class="btn button" onclick='delBlog("${doc.id}")'>Delete</a>
           <a type="button" data-bs-toggle="modal" data-bs-target="#exampleModal" data-bs-whatever="@mdo" 
           class="btn button" onclick='editBlog("${doc.id}","${doc.data().title}","${doc.data().blog}")'>Edit</a>        
         </div>
       </div>
      </div> `
    });
    loader.style.display = "none";
  } catch (error) {
    console.log(error);
    loader.style.display = "none";
  }
}


let updateId = "";
let updatedTitle = document.getElementById('update-title');
let updatedBlog = document.getElementById('update-blog');
const editBlog = (id, title, blog ) => {
  updateId = id;
  updatedTitle.value = title;
  updatedBlog.value = blog;
}


  if(location.pathname === "/dashboard.html"){
    let updateModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    const updateBLogBtn = document.getElementById('updateBlog-btn');
    updateBLogBtn && updateBLogBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      try{
        loader.style.display = "flex";
        console.log(updateId,updatedTitle,updatedBlog )
        const currentUser = auth.currentUser;
        await updateDoc(doc(db, "blogs", updateId), {
          title: updatedTitle.value,
          blog: updatedBlog.value
        });
        updateId = '';  
        updateModal.hide();
        loader.style.display = "none";
        getCurrentBlogs(currentUser.uid)
        Swal.fire({
          icon: 'Success!',
          title: 'Blog Edited Successfully.',
        });
      }catch(error){
        console.log(error)
      }
    });
  }



const getAllBlogs = async (uid) => {
  try {
    const Allbloglist = document.getElementById("allBlogList");
    loader.style.display = "flex";
    const q = query(collection(db, "blogs"), where("uid", "!=", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      Allbloglist.innerHTML += `
      <div class="card w-70 mb-3">
        <div class="user-info">
          <div>
           <img id="user-profile" src="${doc.data().user.picture ? doc.data().user.picture : "images/chat-users.png"}" class="chat-users" width="40" height="40" alt="" />
          </div>
          <div>
            <h5 class="name">${doc.data().user.fullName}</h5>
          </div>
        </div>
       <div>
         <h4 class="card-title">${doc.data().title}</h4>
         <p class="card-text">${doc.data().blog}</p>
         <p class="card-text time">${doc.data().time.toDate().toDateString()}</p>
         <a class="view-blogs card-text color" href="user.html?user=${doc.data().uid}">View ${doc.data().user.fullName}'s All Blogs </a>
       </div>
      </div>
      `
    });
    loader.style.display = "none";
  } catch (error) {
    console.log(error);
    loader.style.display = "none";
  }
}


onAuthStateChanged(auth, (user) => {
  if (user) {
    let uid = localStorage.getItem('uid')
    getUserData(user.uid);
    if(location.pathname === "/dashboard.html"){
      getCurrentBlogs(user.uid);  
    }
    if(location.pathname === '/blogs.html'){
      getAllBlogs(user.uid); 
    }
    if (user && uid) {
      if (location.pathname !== '/profile.html' && location.pathname !== '/dashboard.html' && location.pathname !== '/blogs.html' && location.pathname !== "/user.html") {
        location.href = "profile.html"
      }
    } else if (location.pathname == "/dashboard.html" && location.pathname == '/blogs.html'){
        navProfile.style.display = 'block';
    } 
  } else {
    if (location.pathname !== '/index.html' && location.pathname !== "/signup.html") {
      location.href = "index.html"
    }
  }
});


let signupbtn = document.getElementById('signup-btn');
signupbtn && signupbtn.addEventListener('click', function(event) {
  event.preventDefault();
  loader.style.display = "flex";
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
      loader.style.display = "none";
      location.href = 'profile.html';
    }catch(error){
      console.log(error)
      loader.style.display = "none";
    }
  })
  .catch((error) => {
    loader.style.display = "none";
    const errorCode = error.code;
    const errorMessage = error.message;
    if(errorMessage == "Firebase: Error (auth/email-already-in-use)." ){
      Swal.fire({
        icon: 'Error',
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
  loader.style.display = "flex";
  let loginEmail = document.getElementById('login-email');
  let loginPassword = document.getElementById('login-pass');
  signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem("uid", user.uid);
      loginEmail.value = "";
      loginPassword.value = "";
      loader.style.display = "none";
      location.href = 'profile.html'
    })
    .catch((error) => {
      loader.style.display = "none";
      const errorCode = error.code;
      const errorMessage = error.message;
      if(errorMessage == "Firebase: Error (auth/wrong-password)." ){
        Swal.fire({
          icon: 'Error',
          title: 'Oops...',
          text: 'You enter Wrong Password!',
        })
      }else if(errorMessage == 'Firebase: Error (auth/user-not-found).'){
        Swal.fire({
          icon: 'Error',
          title: 'Oops...',
          text: 'User Not Found!',
        })
      }else{
        Swal.fire({
          icon: 'Error',
          title: 'Oops...',
          text: errorMessage,
        })
      }
      loginEmail.value = "";
      loginPassword.value = "";
    })
}) 


let logoutBtn = document.getElementById('logout-btn');
logoutBtn && logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  loader.style.display = "flex";
  signOut(auth).then(() => {
    localStorage.clear();
    loader.style.display = "none";
    location.href = 'index.html';
b  }).catch((error) => {
    console.log(error);
    loader.style.display = "none";
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
})


const updateUserPassword = (oldP, newP) =>{
  loader.style.display = "flex";
  new Promise( (resolve, reject) =>{
    const currentUser = auth.currentUser;
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      oldP
    )
    reauthenticateWithCredential(currentUser, credential).then((res) => {
      updatePassword(currentUser, newP).then(() => {
        resolve(res);
        loader.style.display = "none";
        Swal.fire({
          icon: 'Success!',
          title: 'Password updated successfully.',
        });
      }).catch((error) => {
        reject(error)
        loader.style.display = "none";
        Swal.fire({
          icon: 'Error',
          title: 'Oops...',
          text: error.message,
        })
      });
    }).catch((error) => {
      loader.style.display = "none";
      Swal.fire({
        icon: 'Error',
        title: 'Oops...',
        text: error.message,
      })
    });
  })
}


let updateProfileBtn = document.getElementById('update-profile-btn');
updateProfileBtn && updateProfileBtn.addEventListener('click', async () => {
  try{
    loader.style.display = "flex";
    let uid = localStorage.getItem('uid');
    let fullName = document.getElementById('signup-name');
    let oldPass = document.getElementById('oldPass');
    let newPass = document.getElementById('newPass');
    if(oldPass.value && newPass.value){
      await updateUserPassword(oldPass.value, newPass.value)
    }
    console.log(oldPass)
    const user =  {
      fullName: fullName.value,
    }
    if(fileInput.files[0]){
      user.picture = await uploadFile(fileInput.files[0])
    }
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      await updateDoc(userRef, user);
      loader.style.display = "none";
      Swal.fire({
        icon: 'Success!',
        title: 'Profile updated successfully.',
      });
    } else {
      console.log("Document does not exist!");
    }
  }catch(err){
    console.log(err.message)
    loader.style.display = "none";
  }
})


let passwordReset = document.getElementById('password-reset');
let passwords = document.getElementById('passwords');
passwords && passwords.addEventListener('click',  () =>{
  passwordReset.style.display = 'block';
})


let greetingTime = document.getElementById('time');
let greetbg = document.getElementById('greet');
let time = new Date().getHours();
if(location.pathname == '/dashboard.html' || location.pathname == '/blogs.html' || location.pathname == '/user.html'){
  if (time >= 5 && time < 12) {
    loader.style.display = "flex";
    greetingTime.innerHTML = 'Good Morning Readers';
    greetbg.style.backgroundImage = "url('images/morning.jpg')"
    loader.style.display = "none";
  } else if (time >= 12 && time < 18) {
    loader.style.display = "flex";
    greetingTime.innerHTML = 'Good Afternoon Readers';
    greetbg.style.backgroundImage = "url('images/afternoon.jpg')"
    loader.style.display = "none";
  } else {
    loader.style.display = "flex";
    greetingTime.innerHTML = 'Good Evening Readers'
    greetbg.style.backgroundImage = "url('images/evening.jpg')"
    loader.style.display = "none";
  }
}


const submitBlog = async () => {
  try {
    loader.style.display = "flex";
      let title = document.getElementById("title");
      let blog = document.getElementById('blog');
      const currentUser = auth.currentUser;
      const userRef = doc(db, "users", currentUser.uid); 
      const userData = await getDoc(userRef);
      console.log(userData.data())
      const docRef = await addDoc(collection(db, "blogs"), {
          title: title.value,
          blog: blog.value,
          time: serverTimestamp(),
          uid: currentUser.uid,
          user: userData.data()
      });
      getCurrentBlogs(currentUser.uid)
      title.value = ""
      blog.value = ''
      loader.style.display = "none";
      Swal.fire({
        icon: 'Success!',
        title: 'Blog Published Successfully.',
      });
  } catch (err) {
      console.log(err)
      loader.style.display = "none";
  }
}

let addBlog = document.getElementById('addBlog');
addBlog && addBlog.addEventListener('click', submitBlog);


async function delBlog(id) {
  loader.style.display = "flex";
  const currentUser = auth.currentUser;
  await deleteDoc(doc(db, "blogs", id));
  loader.style.display = "none";
  Swal.fire({
    icon: 'Success!',
    title: 'Blog Deleted Successfully.',
  });
  getCurrentBlogs(currentUser.uid)
}


const getUserBlogs =  async() => {
  try{
    loader.style.display = "flex";
    const urlParams = new URLSearchParams(location.search);
    const user = urlParams.get('user');
    const userBloglist = document.getElementById("userBloglist");
    const userDetails = document.getElementById('userDetails');
    const userRef = doc(db, "users", user); 
    const userData = await getDoc(userRef);
    userDetails.innerHTML = `<div style="width: 20rem;" class="card profile-card mt-4">
                               <img height="auto" src="${userData.data().picture ? userData.data().picture : "images/user-icon.jpg"}" 
                               class="card-img-top card-pic" alt="profile">
                               <h5 class="card-title center mt-3 color2">${userData.data().fullName}</h5>
                               <p class="card-text center color2">${userData.data().signupEmail}</p>
                             </div> `
    userBloglist.innerHTML = '';
    const q = query(collection(db, "blogs"), where("uid", "==", user));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      userBloglist.innerHTML += `
      <div class="card w-70 mb-3">
        <div class="user-info">
          <div>
           <img id="user-profile" src="${doc.data().user.picture ? doc.data().user.picture : "images/chat-users.png"}" class="chat-users" width="42" height="42" alt="" />
          </div>
          <div>
            <h4 class="name">${doc.data().user.fullName}</h4>
          </div>
        </div>
        <div>
          <h5 class="card-title">${doc.data().title}</h5>
          <p class="card-text">${doc.data().blog}</p>
          <p class="card-text time">${doc.data().time.toDate().toDateString()}</p>
        </div>
      </div> `
    });
    loader.style.display = "none";
  } catch(error) {
    console.log(error)
    loader.style.display = "none";
  }
  } 


if(location.pathname === "/user.html" ){
  getUserBlogs()
}


window.delBlog = delBlog;
window.editBlog = editBlog;