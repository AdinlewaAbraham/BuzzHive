import React, {useState} from 'react'
import { FcGoogle } from "react-icons/fc";
import { SigninWithGoogle } from '@/utils/userAuthentication/SigninWithGoogle';
import { CircularProgress } from "@mui/joy";

const LoginPage = () => {
    const [isSigningIn, setisSigningIn] = useState(false);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-lg bg-accent-blue px-2 py-4">
        {!isSigningIn ? (
          <button
            className="flex items-center justify-center"
            onClick={() => {
              setisSigningIn(true);
              SigninWithGoogle(setisSigningIn);
            }}
          >
            <i className="mr-1 flex items-center">
              <FcGoogle size={25} />
            </i>
            Sign in with Google
          </button>
        ) : (
          <div className="flex items-center justify-center">
            <i className="mr-2 flex items-center">
              <CircularProgress size="sm" variant="plain" />
            </i>
            logging in...
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage