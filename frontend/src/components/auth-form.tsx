"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff, Loader2, Heart } from "lucide-react"
import { register, login, socialAuth, type RegisterData, type LoginCredentials } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'

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
  const { toast } = useToast()

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
    setError("")

    try {
      if (isSignUp) {
        // Register new user
        if (!formData.name || !formData.email || !formData.password) {
          setError("Please fill in all fields")
          setIsLoading(false)
          return
        }

        const registerData: RegisterData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }

        await register(registerData)
        
        toast({
          title: "Welcome to HerSpace! 💜",
          description: `Account created successfully for ${formData.name}`,
        })
        
        navigate("/")
      } else {
        // Login existing user
        if (!formData.email || !formData.password) {
          setError("Please enter email and password")
          setIsLoading(false)
          return
        }

        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password,
        }

        await login(credentials)
        
        toast({
          title: "Welcome back! 💜",
          description: "You're logged in successfully",
        })
        
        navigate("/")
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.")
      toast({
        title: "Authentication Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({
        title: "Google Sign-In Failed",
        description: "No credential received",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await socialAuth({
        id_token: credentialResponse.credential,
      })
      
      toast({
        title: "Welcome! 💜",
        description: "Signed in with Google successfully",
      })
      
      navigate("/")
    } catch (err: any) {
      setError(err.message || "Google authentication failed")
      toast({
        title: "Authentication Error",
        description: err.message || "Google sign-in failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    toast({
      title: "Google Sign-In Failed",
      description: "Please try again or use email/password",
      variant: "destructive",
    })
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

        {/* Google OAuth */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text={isSignUp ? "signup_with" : "signin_with"}
            width="384"
          />
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
