
import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import Header from '@/components/layout/Header';
import CreditDisplay from '@/components/CreditDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Profile = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and view your credits
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    {user?.profileImageUrl ? (
                      <AvatarImage src={user.profileImageUrl} alt={user.fullName || user.username || 'User'} />
                    ) : (
                      <AvatarFallback className="text-2xl">{
                        user?.firstName?.charAt(0) || 
                        user?.username?.charAt(0) || 
                        'U'
                      }</AvatarFallback>
                    )}
                  </Avatar>
                  <h2 className="text-2xl font-bold mb-1">
                    {user?.fullName || user?.username || 'User'}
                  </h2>
                  {user?.emailAddresses && user.emailAddresses.length > 0 && (
                    <p className="text-muted-foreground">
                      {user.emailAddresses[0].emailAddress}
                    </p>
                  )}
                  
                  <div className="mt-6 w-full">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-xl font-bold">
                          {user?.createdAt ? 
                            new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            'N/A'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Member Since</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-xl font-bold">
                          {typeof user?.publicMetadata?.transactionCount === 'number' 
                            ? user.publicMetadata.transactionCount 
                            : 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Transactions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <CreditDisplay />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
