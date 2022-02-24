// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue } from  "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

class FireBase {
    #database;
    #userCode = 0;
    #prefix = "jdh5563";
    #codeKey = this.#prefix + "code";

    constructor(){
        if(!FireBase.firebaseInstance){
            // Your web app's Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyCFB5nHqUp3RwLZDbVdzLTNrR00yhHU2DI",
                authDomain: "fractal-generator-2334f.firebaseapp.com",
                projectId: "fractal-generator-2334f",
                storageBucket: "fractal-generator-2334f.appspot.com",
                messagingSenderId: "623997342755",
                appId: "1:623997342755:web:8d182c6e57eeb74f618d96",
                measurementId: "G-HD4JWFY7RM"
              };

            // Initialize Firebase
            initializeApp(firebaseConfig);

            this.#database = getDatabase();

            const code = localStorage.getItem(this.#codeKey);
            if(code)
                this.setUserCode(code);

            FireBase.firebaseInstance = this;
        }

        return FireBase.firebaseInstance;
    }

    // Return a reference to the given part of the database
    getReference(path = false){
        return path ? ref(this.#database, path) : ref(this.#database);
    }

    getUserCode(){
        return this.#userCode;
    }

    setUserCode(code){
        this.#userCode = code;
        localStorage.setItem(this.#codeKey, code);
    }

    getUserData(path){
        return get(this.getReference(path));
    }

    createPost(title, content, canvasSrc){
        if(!this.#userCode) this.setUserCode(push(this.getReference(), { })._path.pieces_[0]);
        
        onValue(this.getReference(this.#userCode), () => location.href = '/community.html', { onlyOnce: true });
        push(this.getReference(this.#userCode + '/posts'), { title: title, content: content, canvasSrc: canvasSrc });
    }
}

const firebaseInstance = new FireBase();

export { firebaseInstance };