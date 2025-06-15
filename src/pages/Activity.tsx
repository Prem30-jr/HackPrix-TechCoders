import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, Flame } from 'lucide-react';

const Activity = () => {
  // Generate calendar data for the last month
  const generateCalendarData = () => {
    const data = [];
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Get the first day of the month
    const firstDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    // Get the last day of the month
    const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    
    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      data.push({ date: null, isActive: false, transactions: 0 });
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), i);
      data.push({
        date,
        isActive: Math.random() > 0.7, // 30% chance of having a payment
        transactions: Math.floor(Math.random() * 3) + 1 // 1-3 transactions per active day
      });
    }
    
    return data;
  };

  const calendarData = generateCalendarData();
  const currentStreak = 7; // Example streak
  const longestStreak = 14; // Example longest streak
  const totalTransactions = calendarData.filter(day => day.isActive).length;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[new Date().getMonth() - 1];

  return (
    <div className="min-h-screen pt-16 pb-16 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Payment Activity</h1>
          <p className="text-muted-foreground">
            Track your daily payment activity and maintain your streak
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/80 backdrop-blur-xs border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                  <p className="text-xl font-bold">{currentStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-xs border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Longest Streak</p>
                  <p className="text-xl font-bold">{longestStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-xs border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Payments</p>
                  <p className="text-xl font-bold">{totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Calendar */}
        <Card className="bg-card/80 backdrop-blur-xs border-border/60">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-center">{currentMonth}</h2>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground mb-1">
                  {day}
                </div>
              ))}
              {calendarData.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`aspect-square rounded-sm flex flex-col items-center justify-center text-xs
                    ${day.date ? (day.isActive ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-card/50 text-muted-foreground') : 'bg-transparent'}`}
                >
                  {day.date && (
                    <>
                      <span>{day.date.getDate()}</span>
                      {day.isActive && (
                        <span className="text-[10px] mt-0.5">{day.transactions} tx</span>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Activity; 