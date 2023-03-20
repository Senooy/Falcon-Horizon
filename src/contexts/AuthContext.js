import React from "react";
// Firebase auth functions
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
// Firebase auth instance
import firebaseAuth from "lib/firebase";
import { createUserDocument } from "lib/firebase";
import { db } from "lib/firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

// Google oauth provider
const provider = new GoogleAuthProvider();
// Contexts
export const AuthContext = React.createContext(null);

export const ContextProvider = (props) => {
  // States to check auth status
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    // Listener updates auth status when detects change
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setIsSignedIn(true);
        getUserData(user);
        // setUser(user);
      } else {
        setIsSignedIn(false);
        setUser(null);
      }
    });
  }, []);
  // Functions handling auth
  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      return;
    } catch (err) {
      console.log(err.message);
      return err.message;
    }
  };
  const signUp = async (email, password, salesCode) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      if (user) {
        await createUserDocument(user, { salesCode });
      }
      return;
    } catch (err) {
      console.log(err.message);
      return err.message;
    }
  };
  const signOut = async () => {
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (err) {
      console.log(err.message);
    }
  };
  const googleSignIn = async () => {
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (err) {
      console.log(err.message);
    }
  };

  const createUserDocument = async (user, additionalData) => {
    const { email } = user;
    const { salesCode } = additionalData;
    try {
      await addDoc(collection(db, "users"), {
        salesCode,
        email,
        createdAt: new Date(),
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const getUserData = async (user) => {
    try {
      // const querySnapshot = await getDocs(collection(db, "users"));
      // if (querySnapshot.exists) {
      //   querySnapshot.forEach((doc) => {
      //     setUser({
      //       ...user,
      //       profileData: user.email === doc.data().email && doc.data(),
      //     });
      //   });
      // }

      const q = query(
        collection(db, "users"),
        where("email", "==", `${user.email}`)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser({ ...user, profileData: doc.data() });
      });
    } catch (error) {
      console.log("error", error);
    }
  };
  // Context provider
  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user,
        signIn,
        signUp,
        signOut,
        googleSignIn,
        getUserData,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
