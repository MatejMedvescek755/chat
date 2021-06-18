import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import React, { Component, useRef, useState, useEffect, useContext } from "react";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  //CONFIG
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const MyContext = React.createContext();
var rid = "";
var recieverRef;
var senderRef;
var receiverRefId;
var senderRefId;


function App() {
  const [user] = useAuthState(auth);
  var [currentConvo, setCurrentConvo] = useState(firestore.collection("group"))
  return (
    <div className="App">
      <header className="App-header">
        <MyContext.Provider value={{
          state: currentConvo,
          setState: setCurrentConvo
        }}>
          {user ? (
            <>
              <div className="contacts">
                <div className="add-contact">
                  <NewConvo></NewConvo>
                </div>
                <Contacts />
              </div>
              <div className="chat">
                <div className="head">
                  <SignOut />
                </div>
                <div className="txts">
                  <Chat />
                </div>
              </div>
            </>
          ) : (<div className="main">
            <SignIn />
          </div>
          )}
        </MyContext.Provider>
      </header>
    </div>
  );
}

function NewConvo() {
  const [formValue, setFormValue] = useState("");
  var display = false;
  var rid = formValue;
  var { uid, photoURL } = auth.currentUser;
  const newConvo = async (e) => {
    e.preventDefault()
    if (formValue === "") {
      display = true;
    } else {
      const users = firestore.collection("messages/users/users");
      users.where("uid", "==", rid).get().then((snap) => {
        console.log(snap.empty)
        if (snap.empty)
          console.log("user doesnt exist")
        else {
          console.log("heyy")
          const userRef = firestore.collection("messages/users/users/");
          recieverRef = firestore.collection("messages/users/users/" + rid + "/convo/" + uid + "/" + uid);
          senderRef = firestore.collection("messages/users/users/" + uid + "/convo/" + rid + "/" + rid);
          senderRefId = firestore.collection("messages/users/users/" + uid + "/convo/").doc(rid);
          receiverRefId = firestore.collection("messages/users/users/" + rid + "/convo/").doc(uid);
          userRef.doc(uid).get(formValue).then((doc) => {
            if (doc.exists) {
              console.log("we are in");
              recieverRef.add({
                text: "",
                uid,
                photoURL,
              });
              receiverRefId.set({
                text: uid,
                uid,
              });
              senderRefId.set({
                text: rid,
                uid,
              });
            } else {
              console.log("user doesnt exist");
            }
            userRef.doc(rid).get(formValue).then((doc) => {
              if (doc.exists) {
                senderRef.add({
                  text: "",
                  uid,
                  photoURL,
                });
              }
            });
          });
        }
      });
    }

  };
  return (
    <>
      <form className="convo" onSubmit={newConvo}>
        <input
          className="add"
          value={formValue}
          onChange={(evt) => {
            setFormValue(evt.target.value);
          }}
        ></input>
        <button className="btn-convo"><span className="front-side">
          add
        </span></button>
        {display && <div className="err">user doesn't exist</div>}
      </form>
    </>
  );
}



//firestore.collection("messages/users/users/" + uid + "/convo")
function Contacts() {
  const uid = auth.currentUser.uid;
  const [item, setItem] = useState();
  var empty = false;
  useEffect(() => {
    console.log("mounted");
    const convoRef = firestore.collection("messages/users/users/" + uid + "/convo");
    convoRef.get().then((snapshot) => {
      var convos = [];
      snapshot.forEach((doc) => {
        const data = doc.data().text;
        convos.push(data);
      }); setItem(convos);
    }).catch((error) => console.log(error));
  }, []);
  if (empty) {
    <Empty></Empty>;
  } else {
    if (item !== undefined) {
      if (item.length !== 0) {
        return (
          <div className="list">
            {item && item.map((doc) => {
              return (
                <Contact className="contact" text={doc} key={doc}></Contact>
              );
            })}
          </div>
        );
      } else {
        return (
          <>
            <Empty></Empty>
          </>
        );
      }
    } else {
      return (
        <Loading />
      )
    }
  }
}

function Contact(props) {
  const uid = auth.currentUser.uid;
  const { text, photoURL } = props;
  var setCurrentConvo = useContext(MyContext);
  setCurrentConvo = setCurrentConvo.setState
  return (
    <>
      <div className="contact " onClick={() => {
        rid = text
        setCurrentConvo(firestore.collection("messages/users/users/" + uid + "/convo/" + text + "/" + text))
      }}>
        <img className="icon" src={photoURL}></img>
        <p>{text}</p>
      </div>
    </>
  );
}

function Empty() {
  console.log("empty");
  return (
    <div className="empty">user doesn't have any active conversations</div>
  );
}

function Loading() {
  console.log("loading");
  return (
    <>
      <div className="loading">
        <div className="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </>
  );
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const userRef = firestore.collection("messages/users/users");
    const { uid, photoURL } = auth.currentUser;
    userRef.doc(uid).set({
      uid,
      photoURL,
    });
  } else {
    console.log("no user is signed in");
  }
});

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <button id="sign" onClick={signInWithGoogle}>
      <div className="google-icon"></div>
      <div className="text-signin">sign in with google</div>
    </button>
  );
}
function SignOut() {
  var handler = useContext(MyContext)
  handler = handler.setState;
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => {
        handler(firestore.collection("group"))
        rid = "";
        auth.signOut()
      }}>
        <span className="front-log-out">
          Sign Out
        </span>
      </button>
    )
  );
}

function Chat() {
  var context = useContext(MyContext);
  const messagesRef = context.state;
  const bottomDiv = useRef();
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e) => {
    const { uid, photoURL } = auth.currentUser;
    e.preventDefault();
    if (formValue !== "") {
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });
      console.log(rid)
      if (rid !== "") {
        await firestore.collection("messages/users/users/" + rid + "/convo/" + uid + "/" + uid).add({
          text: formValue,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid,
          photoURL,
        });
      }
      setFormValue("");
      bottomDiv.current.scrollIntoView({ behavior: "smooth" });
    }

  };
  return (
    <div>
      <div className="chats">
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={bottomDiv}></div>
      </div>
      <form id="text" onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => {
            setFormValue(e.target.value);
          }}
          className="textInput"
        ></input>{" "}
        <button className="send">
          <span className="front">
            send
          </span>
        </button>
      </form>
    </div>
  );
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  if (messageClass == "sent") {
    return (
      <div className="msgSent">
        <p>{text}</p> <img className="icon" src={photoURL}></img>
      </div>
    );
  } else if (messageClass == "received") {
    return (
      <div className="msgReceived">
        <img className="icon" src={photoURL} alt=""></img>
        <p>{text}</p>
      </div>
    );
  }
}
export default App;
