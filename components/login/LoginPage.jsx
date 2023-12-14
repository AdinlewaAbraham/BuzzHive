import React, { useState } from "react";
import SignInButton from "./SignInButton";
import { SiHive } from "react-icons/si";

const LoginPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <i className="flex justify-center">
              <SiHive size={40} />
            </i>
            <h2 className="mt-6 text-center text-3xl font-extrabold ">
              Sign in to Buzzhive
            </h2>
            <p className="text-muted mt-2 text-center text-sm ">
              Connect with your Google account
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <SignInButton />{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
