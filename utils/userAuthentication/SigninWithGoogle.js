import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
export const SigninWithGoogle = () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      console.log(user)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
    });
};
