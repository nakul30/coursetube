import React from 'react'
import { useRef } from "react";
import { db,app } from '../../config/firebase-config';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc , getDoc } from 'firebase/firestore';
import { setUserDetails } from "../../config/userSlice";
import styles from "../../styles/Auth.module.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
function Login() {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    let navigate = useNavigate();
    const dispatch = useDispatch();

    function handleLogin() {
        const authentication = getAuth();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        // console.log(authentication);

        signInWithEmailAndPassword(authentication, email, password).then(
            async (response) => {
                // console.log("Response",response);
                const docRef = doc(db, "users", response.user.uid);
                const docSnap = await getDoc(docRef);
                // console.log("Doc Snap:",docSnap.data());
                dispatch(
                    setUserDetails({
                        uid: response.user.uid,
                        email: response.user.email,
                        name: docSnap.data().name,
                        courses: Object.keys(docSnap.data().courses),
                    })
                );

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
            <label htmlFor="email">Email</label>
            <input
                type="email"
                required={true}
                name="email"
                ref={emailRef}
            ></input>
            <label htmlFor="password">Password</label>
            <input
                type="password"
                required={true}
                name="password"
                ref={passwordRef}
            ></input>
            <button onClick={handleLogin}>Login</button>
            <div style={{ textAlign: 'center', margin: '0 auto', width: 'fit-content' }}>
                <div>
                Use the following credentials to login:
                </div>
                <div>Email:nakul@testing2.com</div>
                <div>
                Password:nakul@testing
                </div>
                
            </div>
        </div>
        
    )
}

export default Login
