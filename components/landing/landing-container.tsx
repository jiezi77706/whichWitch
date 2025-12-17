"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HomePage } from "./home-page"
import { FeaturePage1 } from "./feature-page-1"
import { FeaturePage2 } from "./feature-page-2"
import { FeaturePage3 } from "./feature-page-3"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function LandingContainer() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const router = useRouter()

  const pages = [
    { component: HomePage, title: "Home" },
    { component: FeaturePage1, title: "Multi-Chain Revenue Sharing" },
    { component: FeaturePage2, title: "AI-Powered Content Moderation" },
    { component: FeaturePage3, title: "Community-Driven Voting" },
  ]

  // Handle scroll navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return
      
      e.preventDefault()
      setIsScrolling(true)
      
      if (e.deltaY > 0 && currentPage < pages.length - 1) {
        setCurrentPage(prev => prev + 1)
      } else if (e.deltaY < 0 && currentPage > 0) {
        setCurrentPage(prev => prev - 1)
      }
      
      setTimeout(() => setIsScrolling(false), 800)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return
      
      if (e.key === 'ArrowDown' && currentPage < pages.length - 1) {
        setIsScrolling(true)
        setCurrentPage(prev => prev + 1)
        setTimeout(() => setIsScrolling(false), 800)
      } else if (e.key === 'ArrowUp' && currentPage > 0) {
        setIsScrolling(true)
        setCurrentPage(prev => prev - 1)
        setTimeout(() => setIsScrolling(false), 800)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentPage, isScrolling, pages.length])

  const navigateToApp = () => {
    router.push('/app')
  }

  const navigateToPage = (pageIndex: number) => {
    if (isScrolling) return
    setIsScrolling(true)
    setCurrentPage(pageIndex)
    setTimeout(() => setIsScrolling(false), 800)
  }

  const CurrentPageComponent = pages[currentPage].component

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-md flex items-center justify-center">
              <Image
                src="/logos/whichwitch-logo.jpg"
                alt="Whichwitch Logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Whichwitch
            </span>
          </div>

          <Button 
            onClick={navigateToApp}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Enter App
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <main className="h-screen pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="h-full"
          >
            <CurrentPageComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => navigateToPage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentPage === index
                ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] scale-125"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
            title={page.title}
          />
        ))}
      </div>

      {/* Scroll Indicators */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        {currentPage > 0 && (
          <button
            onClick={() => navigateToPage(currentPage - 1)}
            className="p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
        
        <div className="text-xs text-muted-foreground font-mono bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/40">
          {currentPage + 1} / {pages.length}
        </div>
        
        {currentPage < pages.length - 1 && (
          <button
            onClick={() => navigateToPage(currentPage + 1)}
            className="p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 animate-bounce"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Page Title */}
      <div className="fixed top-24 left-6 z-40">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm font-mono text-muted-foreground bg-background/60 backdrop-blur-sm px-3 py-1 rounded-md border border-border/30"
        >
          {pages[currentPage].title}
        </motion.div>
      </div>
    </div>
  )
}