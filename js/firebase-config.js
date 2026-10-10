import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";


import { getFirestore } 
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";



export const firebaseConfig = {

  apiKey: "AIzaSyA3FtRpvhS69V-AUlBfkZUv-yT3xMQHKT0",

  authDomain: "annyspa.firebaseapp.com",

  projectId: "annyspa",

  storageBucket: "annyspa.firebasestorage.app",

  messagingSenderId: "1056834865797",

  appId: "1:1056834865797:web:0c362e50cf437c1e3ff7ec",

  measurementId: "G-XKWKRG86DX"

};



const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);



export const BUSINESS_WHATSAPP = "573215730734";