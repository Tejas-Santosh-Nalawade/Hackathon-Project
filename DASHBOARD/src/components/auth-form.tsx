"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff, Loader2, Heart } from "lucide-react"

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate auth - in production, connect to backend
    setTimeout(() => {
      if (formData.email && formData.password) {
        // Store user data in localStorage (for demo)
        localStorage.setItem("user", JSON.stringify({
          name: isSignUp ? formData.name : formData.email.split("@")[0],
          email: formData.email,
        }))
        navigate("/")
      } else {
        setError("Please fill in all fields")
      }
      setIsLoading(false)
    }, 800)
  }

  const handleSocialAuth = (provider: string) => {
    // Simulate social auth
    setIsLoading(true)
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({
        name: "Priya S.",
        email: "priya@example.com",
        provider: provider,
      }))
      navigate("/")
    }, 800)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-foreground mb-2">
          {isSignUp ? "Welcome, Future You" : "Welcome Back"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isSignUp
            ? "Create your safe space for wellness, growth, and support."
            : "We're so glad you're here. Let's continue your journey."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name field - only for signup */}
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Name
            </label>
            <Input
              type="text"
              name="name"
              placeholder="Priya"
              value={formData.name}
              onChange={handleChange}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 pr-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Remember me / Forgot password */}
        {!isSignUp && (
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a
              href="#"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </a>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 h-auto mt-6"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSignUp ? "Create My HerSpace" : "Enter My Space"}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <div className="h-px bg-border flex-1" />
        </div>

        {/* Social Auth */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialAuth("google")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-foreground"
            disabled={isLoading}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialAuth("apple")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-foreground"
            disabled={isLoading}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.05 13.5c-.91 0-1.82.55-2.25 1.51.93.64 1.54 1.76 1.54 3.02 0 2.05-1.53 3.76-3.75 3.76-1.35 0-2.59-.7-3.3-1.81-.29-.47-.5-1-.58-1.54-.15-1.02.15-2.19.91-3.06 1.06-1.2 3-1.98 5.13-1.98 1.65 0 3.14.54 4.3 1.55-.56-.87-1.46-1.45-2.7-1.45zM6.5 13c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            Apple
          </button>
        </div>

        {/* Toggle signup/login */}
        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setFormData({ email: "", password: "", name: "" })
                setError("")
              }}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isSignUp ? "Sign in" : "Join us"}
            </button>
          </p>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Your data is private and secure. We never share your information.
          <br />
          <a href="#" className="text-primary hover:underline">
            Learn about our privacy
          </a>
        </p>
      </form>

      {/* Heart accent - shows care */}
      <div className="mt-8 flex justify-center">
        <Heart className="w-5 h-5 text-primary/40" fill="currentColor" />
      </div>
    </div>
  )
}
