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
const firestore = firebase.firestore();
function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        {
          user ?<div className="chat">
          <div className="head"></div>
          <div className="txts"><Chat/></div>
          <div className="input"><input className="textInput"></input></div>
        </div> : <SignIn/>
        }
      </header>
    </div>
  );
}

function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <button id="sign" onClick={signInWithGoogle}>Sign in with google</button>
  );
}
function Chat(){
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, {idField:'id'});
  return(

    <div>
     {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      {console.log(messages)}
    </div>
  )
  
}
function ChatMessage(props) {
  const { text } = props.message;
  return <p>{text}</p>
}
export default App;
