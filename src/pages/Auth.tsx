
import React from 'react';
import { motion } from 'framer-motion';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';

const Auth = () => {
  const location = useLocation();
  const isSignUp = location.pathname === '/sign-up';
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp 
              ? 'Sign up to create and manage your QR transactions'
              : 'Sign in to access your QR transaction history'
            }
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-card shadow-md rounded-lg p-6 border border-border/40">
            {isSignUp ? (
              <SignUp signInUrl="/sign-in" redirectUrl="/" />
            ) : (
              <SignIn signUpUrl="/sign-up" redirectUrl="/" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
