// this redirects the user to the sign in page if they are not signed in


import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default AuthWrapper;
