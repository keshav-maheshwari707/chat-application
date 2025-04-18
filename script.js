// 🔧 Firebase Config (replace with your own config)
const firebaseConfig = {
  apiKey: "AIzaSyAXwVuFHsnmiRN-tan7JlsEgsJcESGAjGQ",
  authDomain: "real-time-chat-app-1b00c.firebaseapp.com",
  projectId: "real-time-chat-app-1b00c",
  storageBucket: "real-time-chat-app-1b00c.firebasestorage.app",
  messagingSenderId: "624744882702",
  appId: "1:624744882702:web:52aaf14e05c6f427f2d25f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔐 Signup
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signed up!");
      window.location = "friends.html";
    })
    .catch(err => alert(err.message));
}

// 🔐 Login
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Logged in!");
      window.location = "friends.html";
    })
    .catch(err => alert(err.message));
}

// 🔓 Logout
function logout() {
  auth.signOut().then(() => {
    alert("Logged out!");
    window.location = "index.html";
  });
}

// ➕ Add Friend
function addFriend() {
  const friendEmail = document.getElementById("friendEmail").value;
  const user = auth.currentUser;
  if (!user || !friendEmail) return;

  db.collection("users").doc(user.email).set({
    friends: firebase.firestore.FieldValue.arrayUnion(friendEmail)
  }, { merge: true }).then(() => {
    alert("Friend added!");
    loadFriends();
  });
}

// 📜 Load Friends
function loadFriends() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("users").doc(user.email).get().then(doc => {
    const data = doc.data();
    const friends = data?.friends || [];
    const list = document.getElementById("friendsList");
    list.innerHTML = "";
    friends.forEach(friend => {
      const btn = document.createElement("button");
      btn.textContent = friend;
      btn.onclick = () => openChat(friend);
      list.appendChild(btn);
    });
  });
}

// 🔄 Navigate to chat with friend
function openChat(friend) {
  window.location = `chat.html?friend=${encodeURIComponent(friend)}`;
}

// 💬 Send message in private chat
function sendMessage() {
  const msg = document.getElementById("messageInput").value;
  const user = auth.currentUser;
  const friend = new URLSearchParams(window.location.search).get("friend");
  if (!user || !friend || !msg.trim()) return;

  const room = [user.email, friend].sort().join("_");
  db.collection("messages_" + room).add({
    text: msg,
    user: user.email,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });
  document.getElementById("messageInput").value = "";
}

// 📡 Listen for messages in private chat
if (window.location.pathname.includes("chat.html")) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location = "index.html";
    } else {
      const friend = new URLSearchParams(window.location.search).get("friend");
      const room = [user.email, friend].sort().join("_");
      db.collection("messages_" + room).orderBy("time")
        .onSnapshot(snapshot => {
          const chatBox = document.getElementById("chatBox");
          chatBox.innerHTML = "";
          snapshot.forEach(doc => {
            const msg = doc.data();
            const time = msg.time?.toDate().toLocaleTimeString() || "";
            chatBox.innerHTML += `<div><strong>${msg.user}:</strong> ${msg.text} <small>(${time})</small></div>`;
          });
          chatBox.scrollTop = chatBox.scrollHeight;
        });
    }
  });
}

// 👫 Load friends on friends.html
if (window.location.pathname.includes("friends.html")) {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location = "index.html";
    } else {
      loadFriends();
    }
  });
}

// Function to toggle dark mode
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  
  // Save dark mode preference in localStorage
  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.removeItem('darkMode');
  }
}

// Check for saved dark mode preference on page load
window.onload = function () {
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }
};
