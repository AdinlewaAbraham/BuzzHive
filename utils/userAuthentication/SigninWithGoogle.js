import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
export const SigninWithGoogle = (setisSigningInFunc) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async () => {
      setisSigningInFunc(false);
    })
    .catch((err) => {
      console.error(err)
      setisSigningInFunc(false);
    });
};
