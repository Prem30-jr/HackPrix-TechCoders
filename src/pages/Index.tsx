"use client"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { SignedIn, SignedOut } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/layout/Header"
import {
  QrCode,
  Scan,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Lock,
  Smartphone,
} from "lucide-react"

const Index = () => {
  const features = [
    {
      icon: QrCode,
      title: "Generate QR Codes",
      description: "Create secure, digitally signed payment QR codes instantly",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Scan,
      title: "Scan & Pay",
      description: "Scan QR codes to process payments with military-grade security",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Every transaction is cryptographically signed and verified",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Lightning-fast transaction processing with real-time updates",
      color: "from-orange-500 to-red-500",
    },
  ]

  const benefits = [
    "End-to-end encryption for all transactions",
    "Offline-first architecture with sync capabilities",
    "Real-time credit balance tracking",
    "Comprehensive transaction history",
    "Multi-device synchronization",
    "Advanced fraud protection",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Next-Gen Payment Platform
              </Badge>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Secure Payments
                </span>
                <br />
                <span className="text-foreground">Made Simple</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience the future of digital payments with blockchain-powered security, instant QR code generation,
                and seamless transaction processing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <SignedOut>
                <Link to="/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/sign-in">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold border-2 hover:bg-accent/50"
                  >
                    Sign In
                  </Button>
                </Link>
              </SignedOut>

              <SignedIn>
                <Link to="/generate">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                  >
                    Generate QR Code
                    <QrCode className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                </Link>
                <Link to="/scan">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold border-2 hover:bg-accent/50"
                  >
                    <Scan className="mr-2 h-5 w-5" />
                    Scan Payment
                  </Button>
                </Link>
              </SignedIn>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">256-bit</div>
                <div className="text-muted-foreground">Encryption Security</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{"<"}1s</div>
                <div className="text-muted-foreground">Transaction Speed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-muted-foreground">Uptime Guarantee</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Modern Payments
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with cutting-edge technology to provide the most secure and efficient payment experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Why Choose
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  OFF_PAY?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                We've built the most secure and user-friendly payment platform with enterprise-grade features that work
                seamlessly across all devices.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10">
                <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <Lock className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <div className="text-2xl font-bold mb-2">Secure</div>
                        <div className="text-blue-100">Bank-level encryption</div>
                      </div>
                      <div className="text-center">
                        <Globe className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <div className="text-2xl font-bold mb-2">Global</div>
                        <div className="text-blue-100">Worldwide access</div>
                      </div>
                      <div className="text-center">
                        <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <div className="text-2xl font-bold mb-2">Mobile</div>
                        <div className="text-blue-100">Cross-platform</div>
                      </div>
                      <div className="text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <div className="text-2xl font-bold mb-2">Social</div>
                        <div className="text-blue-100">Split bills easily</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Payments?</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join thousands of users who trust OFF_PAY for their secure payment needs
            </p>

            <SignedOut>
              <Link to="/sign-up">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/generate">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    Generate QR Code
                  </Button>
                </Link>
                <Link to="/scan">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                  >
                    <Scan className="mr-2 h-5 w-5" />
                    Scan Payment
                  </Button>
                </Link>
              </div>
            </SignedIn>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">OP</span>
            </div>
            <span className="text-xl font-bold">OFF_PAY</span>
          </div>
          <p className="text-gray-400 mb-4">Secure, fast, and reliable payment solutions for the modern world.</p>
          <p className="text-gray-500 text-sm">
            © 2024 OFF_PAY. All rights reserved. Built with security and privacy in mind.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Index
