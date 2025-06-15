"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { MenuIcon, X, User, Sparkles } from "lucide-react"
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import NetworkStatus from "../NetworkStatus"

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Generate", path: "/generate" },
    { label: "Scan", path: "/scan" },
    { label: "Transactions", path: "/transactions" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-border/50 py-3"
          : "bg-transparent py-6",
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg">OP</span>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              OFF_PAY
            </span>
            <span className="text-xs text-muted-foreground font-medium -mt-1">Secure Payments</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="w-px h-6 bg-border mx-4" />

          <SignedIn>
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center hover:bg-accent/50",
                  location.pathname === "/profile"
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
              <div className="scale-110">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all",
                    },
                  }}
                />
              </div>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center space-x-3">
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </SignedOut>

          <NetworkStatus />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-accent/50 transition-colors focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <MenuIcon className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <SignedIn>
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                    location.pathname === "/profile"
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Link>
              </SignedIn>

              <SignedOut>
                <div className="pt-4 space-y-3 border-t border-border/50">
                  <Link to="/sign-in" className="block">
                    <Button variant="ghost" className="w-full justify-start text-base py-3">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/sign-up" className="block">
                    <Button className="w-full justify-start text-base py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </SignedOut>

              <div className="pt-4 border-t border-border/50">
                <NetworkStatus />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
