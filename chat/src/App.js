import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import React, { useRef, useState } from 'react'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  //CONFIG
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
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
          user ? <div className="chat">
            <div className="head"><SignOut /></div>
            <div className="txts"><Chat /></div>
          </div> : <SignIn />
        }
      </header>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button id="sign" onClick={signInWithGoogle}>Sign in with google</button>
  );
}
function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function Chat() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  console.log(useCollectionData(query, { idField: 'id' }))
  const sendMessage = async (e) => {
    const { uid, photoURL } = auth.currentUser;
    e.preventDefault();
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
  }
  return (

    <div>
      <div className="chats">
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>
      <form onSubmit = {sendMessage}>
        <div className="input"><input value={formValue} onChange={(e) =>{setFormValue(e.target.value)}} className="textInput"></input> <button className="send">send</button></div>
      </form>
    </div>
  )
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  if(messageClass == 'sent'){
    return (<div className="msgSent">
    <p>{text}</p> <img className="icon"  src={photoURL}></img>
    </div>)
  }else if(messageClass == 'received'){
    return (<div className="msgReceived">
    <img className="icon" src={photoURL}></img><p>{text}</p>
    </div>)
  }
}




export default App;
