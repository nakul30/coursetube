import { useRef } from "react";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../../config/userSlice.js";
import { setDoc, doc } from "firebase/firestore";
import { app, db, authentication } from "../../config/firebase-config";
import { useNavigate } from "react-router-dom";
import React from "react";
import styles from "../../styles/Auth.module.css";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

function Register() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const passwordRef = useRef(null);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  function handleRegister(e) {
    console.log("Registration handled");
    e.preventDefault();
    const authentication = getAuth(app);
    // const authentication = getAuth();

    const name = nameRef.current.value;
    const email = emailRef;
    const password = passwordRef.current.value;
    console.log(authentication);
    createUserWithEmailAndPassword(authentication, email, password).then
     (async (response) => {
      console.log(response.user);
        console.log(response);
        dispatch(
          setUserDetails({
            uid: response.user.uid,
            email: response.user.email,
            name: name,
            courses: [],
          })
        );
        await setDoc(doc(db, "users", response.user.uid), {
          name: name,
          email: email,
          chapters: {},
        });
        navigate("/");
        sessionStorage.setItem(
          "Auth Token",
          response._tokenResponse.refreshToken
        );
      }
    );
  }
  return (
    <div className={styles.auth}>
      <label htmlFor="name">Name</label>
      <input type="text" required={true} name="name" ref={nameRef}></input>
      <label htmlFor="email">Email</label>
      <input type="email" required={true} name="email" ref={emailRef}></input>
      <label htmlFor="password">Password</label>
      <input
        type="password"
        required={true}
        name="password"
        ref={passwordRef}
      ></input>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
