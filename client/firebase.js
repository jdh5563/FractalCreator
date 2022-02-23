// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getDatabase, ref, set, get, push, onValue } from  "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

class FireBase {
    #database;
    #teamCode = 0;
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
                this.setTeamCode(code);

            FireBase.firebaseInstance = this;
        }

        return FireBase.firebaseInstance;
    }

    // Return a reference to the given part of the database
    getReference(path = false){
        return path ? ref(this.#database, path) : ref(this.#database);
    }

    getTeamCode(){
        return this.#teamCode;
    }

    setTeamCode(code){
        this.#teamCode = code;
        localStorage.setItem(this.#codeKey, code);
    }

    updateDatabase(teams, names){
        if(this.getTeamCode()){
            this.getUserData(this.getTeamCode()).then(snapshot => {
                set(this.getReference(this.getTeamCode()), { teams: teams, names: names, posts: snapshot.val().posts });
                });
        }
        else{
            this.setTeamCode(push(this.getReference(), { teams: teams, names: names})._path.pieces_[0]);
        }
    }

    getUserData(path){
        return get(this.getReference(path));
    }

    createPost(title, content, canvasSrc){
        push(this.getReference(this.getTeamCode() + '/posts'), { title: title, content: content, canvasSrc: canvasSrc });
        onValue(this.getReference(this.getTeamCode()), async () => await fetch('/community.html'), { onlyOnce: true });
    }
}

const firebaseInstance = new FireBase();

export { firebaseInstance };