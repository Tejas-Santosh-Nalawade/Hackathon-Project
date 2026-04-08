import { AuthForm } from "@/components/auth-form"
import { Sparkles, Heart, Shield } from "lucide-react"

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Left side - Branding & Message */}
      <div className="lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 p-6 sm:p-8 lg:p-16 flex flex-col justify-between shadow-2xl min-h-[40vh] lg:min-h-screen">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 sm:gap-4 mb-10 sm:mb-16 lg:mb-24">
            <div className="w-18 h-18  sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-xl p-1.5 sm:p-2 ring-2 sm:ring-4 ring-white/40">
              <img
                src="/logo.jpg"
                alt="HerSpace Logo"
                width={96}
                height={96}
                className="object-cover rounded-xl sm:rounded-xl"
              />
            </div>
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-2xl">HerSpace</span>
          </div>

          {/* Main Message */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-white leading-tight mb-4 sm:mb-6 lg:mb-8 drop-shadow-xl">
              Your Safe Space for
              <br />
              <span className="italic font-bold bg-gradient-to-r from-white via-pink-100 to-rose-100 bg-clip-text text-transparent">
                Growth & Wellness
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white font-medium leading-relaxed drop-shadow-lg mb-4 sm:mb-6 lg:mb-8">
              Empowering working women with holistic support designed just for you.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 sm:px-5 py-2 sm:py-2.5 border border-white/30">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-semibold text-sm sm:text-base">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 sm:px-5 py-2 sm:py-2.5 border border-white/30">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
                <span className="text-white font-semibold text-sm sm:text-base">Wellness</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 sm:px-5 py-2 sm:py-2.5 border border-white/30">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-semibold text-sm sm:text-base">100% Private</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="space-y-4 hidden sm:block">
          <div className="bg-white/25 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/40 shadow-2xl">
            <p className="text-white text-sm sm:text-base lg:text-lg italic mb-3 sm:mb-4 leading-relaxed font-medium">
              "FitHer's gentle approach to wellness has transformed my work-life balance. I finally feel supported and understood."
            </p>
            <p className="text-white font-bold text-base sm:text-lg">— Priya S., Product Manager</p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-16">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </main>
  )
}
