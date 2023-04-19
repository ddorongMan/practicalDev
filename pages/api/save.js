import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCx72-zs2oWlTkvtRERZHUw00nrHqsgxFU",
    authDomain: "practical-dev-172fa.firebaseapp.com",
    projectId: "practical-dev-172fa",
    storageBucket: "practical-dev-172fa.appspot.com",
    messagingSenderId: "269067363916",
    appId: "1:269067363916:web:9332df9a331f4d7960f6e9"
};

export default async function handler(request, response) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const date = new Date();
    const cur = date.getFullYear() + "" + (date.getMonth()+1) + "" + date.getDate();

    try{
        await setDoc(doc(db, "stocks", cur), request.body);

    }catch(e) {
        console.error("Error adding document : "+ e);
    }

    response.status(200).json();
}