import React, { useState } from "react";
import { SigninWithGoogle } from "@/utils/userAuthentication/SigninWithGoogle";
import { CircularProgress } from "@mui/joy";
import { GrGoogle } from "react-icons/gr";
const SignInButton = () => {
  const [isSigningIn, setisSigningIn] = useState(false);
  return (
    <div className="flex h-9 items-center justify-center rounded-lg bg-accent-blue relative text-white">
      {!isSigningIn ? (
        <button
          className="flex items-center justify-center  absolute inset-0"
          onClick={() => {
            setisSigningIn(true);
            SigninWithGoogle(setisSigningIn);
          }}
        >
          <i className="mr-2 flex items-center">
            <GrGoogle />
          </i>
          Sign in with Google
        </button>
      ) : (
        <div className="flex items-center justify-center">
          <i className="mr-2 flex items-center">
            <CircularProgress size="sm" variant="plain" />
          </i>
          Logging in...
        </div>
      )}
    </div>
  );
};

export default SignInButton;
