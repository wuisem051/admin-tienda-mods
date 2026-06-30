import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBzc_hyzUgGzcgJ26MHjQw8Z-OkBi4SvFk",
    authDomain: "apkuniversal-e9d02.firebaseapp.com",
    projectId: "apkuniversal-e9d02",
    storageBucket: "apkuniversal-e9d02.firebasestorage.app",
    messagingSenderId: "295325273856",
    appId: "1:295325273856:web:1c8276a95578d36963ede5",
    measurementId: "G-1HLVKKB7WW"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
