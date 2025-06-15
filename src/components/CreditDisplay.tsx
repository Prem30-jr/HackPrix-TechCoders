"use client"

import type React from "react"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { useCredits } from "@/hooks/useCredits"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Plus, Minus, TrendingUp, Wallet } from "lucide-react"
import { useLocation } from "react-router-dom"

const CreditDisplay: React.FC = () => {
  const { credits, isLoading, refreshCredits } = useCredits()
  const location = useLocation()

  useEffect(() => {
    refreshCredits()
  }, [location.pathname, refreshCredits])

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="h-8 w-32 bg-muted rounded-lg mb-4"></div>
            <div className="h-12 w-24 bg-muted rounded-lg"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!credits) {
    return null
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white border-0 shadow-2xl overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="text-lg flex items-center font-semibold">
            <div className="bg-white/20 rounded-lg p-2 mr-3">
              <Wallet className="h-5 w-5" />
            </div>
            Credit Balance
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="flex flex-col space-y-4">
            <motion.div
              className="text-4xl font-black"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              ₹{credits.balance.toFixed(2)}
            </motion.div>

            {credits.history.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium text-white/80">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Recent Activity
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {credits.history.slice(0, 3).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                    >
                      <div className="flex items-center">
                        {entry.type === "credit" ? (
                          <div className="bg-green-500 rounded-full p-1 mr-3">
                            <Plus className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="bg-red-500 rounded-full p-1 mr-3">
                            <Minus className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold">
                            {entry.type === "credit" ? "+" : "-"}₹{entry.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-white/70">{new Date(entry.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CreditDisplay
