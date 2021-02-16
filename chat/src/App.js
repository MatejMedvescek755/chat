import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

var firebaseConfig = {
  apiKey: "AIzaSyBVWYvKa7pxSYlxXD9Kl4ztPKWbrm84_iY",
  authDomain: "peak-emitter-303107.firebaseapp.com",
  projectId: "peak-emitter-303107",
  storageBucket: "peak-emitter-303107.appspot.com",
  messagingSenderId: "589741657198",
  appId: "1:589741657198:web:741a174f32ab1e3902ea7f"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore
function App() {
  return (
    <div className="App">
      <header className="App-header">
        {
          auth == true && <div></div>
        }
      </header>
    </div>
  );
}

export default App;
