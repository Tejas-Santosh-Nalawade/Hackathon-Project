"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff, Loader2, Heart, Sparkles } from "lucide-react"
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
        <h2 className="font-serif text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent mb-4">
          {isSignUp ? "Welcome, Beautiful Soul" : "Welcome Back, Dear"}
        </h2>
        <p className="text-gray-700 text-lg font-medium leading-relaxed">
          {isSignUp
            ? "Create your safe space for wellness, growth, and support. Join thousands of amazing women."
            : "We're so glad you're here. Let's continue your journey of growth and wellness."}
        </p>
      </div>

      {/* Google OAuth - Prominent at Top */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 sm:p-6 rounded-2xl border-2 border-purple-200/50 shadow-lg hover:shadow-xl transition-shadow">
          <p className="text-center text-sm sm:text-base font-bold text-purple-700 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">Quick Sign In with Google</span>
            <span className="sm:hidden">Sign in with Google</span>
            <Sparkles className="w-4 h-4 text-pink-500" />
          </p>
          <div className="flex justify-center w-full">
            <div className="w-full max-w-sm">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                size="large"
                text={isSignUp ? "signup_with" : "signin_with"}
                width="100%"
                logo_alignment="center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-300 to-transparent flex-1" />
        <span className="text-base text-gray-600 font-semibold">or use email</span>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent flex-1" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name field - only for signup */}
        {isSignUp && (
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              Your Name
            </label>
            <Input
              type="text"
              name="name"
              placeholder="e.g., Priya"
              value={formData.name}
              onChange={handleChange}
              className="h-14 text-lg bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl font-medium"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Email field */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-3">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-5 w-5 h-5 text-purple-500" />
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="h-14 text-lg pl-12 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl font-medium"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-3">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-5 w-5 h-5 text-purple-500" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="h-14 text-lg pl-12 pr-12 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 rounded-xl font-medium"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-5 text-gray-500 hover:text-purple-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-base font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Remember me / Forgot password */}
        {!isSignUp && (
          <div className="flex items-center justify-between text-base">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-purple-600"
              />
              <span className="text-gray-700 font-medium">Remember me</span>
            </label>
            <a
              href="#"
              className="text-purple-600 hover:text-pink-600 transition-colors font-bold"
            >
              Forgot password?
            </a>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 hover:from-purple-700 hover:via-pink-600 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] mt-8"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {isSignUp ? "Create My HerSpace 💜" : "Enter My Space ✨"}
        </Button>

        {/* Toggle signup/login */}
        <div className="text-center mt-8 pt-8 border-t-2 border-gradient-to-r from-purple-200 to-pink-200">
          <p className="text-base text-gray-700 font-medium">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setFormData({ email: "", password: "", name: "" })
                setError("")
              }}
              className="text-purple-600 hover:text-pink-600 font-bold transition-colors text-lg"
            >
              {isSignUp ? "Sign in here" : "Join us today"}
            </button>
          </p>
        </div>

        {/* Privacy note */}
        <p className="text-sm text-gray-600 text-center mt-6 leading-relaxed font-medium">
          🔒 Your data is private and secure. We never share your information.
          <br />
          <a href="#" className="text-purple-600 hover:text-pink-600 font-bold underline">
            Learn about our privacy
          </a>
        </p>
      </form>

      {/* Heart accent - shows care */}
      <div className="mt-10 flex justify-center">
        <div className="flex items-center gap-2 text-pink-500">
          <Heart className="w-6 h-6 animate-pulse" fill="currentColor" />
          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Made with love for you</span>
          <Heart className="w-6 h-6 animate-pulse" fill="currentColor" />
        </div>
      </div>
    </div>
  )
}
