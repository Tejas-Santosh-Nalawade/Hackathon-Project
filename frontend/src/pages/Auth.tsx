import { AuthForm } from "@/components/auth-form"

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Left side - Branding & Message */}
      <div className="lg:w-1/2 bg-linear-to-br from-[oklch(0.85_0.08_175)] to-[oklch(0.75_0.10_175)] p-6 lg:p-12 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-20">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-1">
              <img
                src="/logo.jpg"
                alt="HerSpace Logo"
                width={48}
                height={48}
                className="object-cover rounded-lg"
              />
            </div>
            <span className="text-2xl font-semibold text-white">HerSpace</span>
          </div>

          {/* Main Message */}
          <div className="mb-12">
            <h1 className="font-serif text-4xl lg:text-5xl text-white leading-tight mb-6">
              Your Space for Growth,
              <br />
              <span className="italic">Wellness & Balance</span>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Join thousands of working women who are discovering holistic support designed just for them. From wellness coaching to career growth, we're here for every moment.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="space-y-6">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-6">
            <p className="text-white/90 text-sm italic mb-3">
              "FitHer's gentle approach to wellness has made the biggest difference in my work-life balance. I finally feel supported."
            </p>
            <p className="text-white font-medium">— Priya S., Product Manager</p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="lg:w-1/2 bg-background flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </main>
  )
}
