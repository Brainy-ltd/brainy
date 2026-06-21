import React, { useState } from 'react';
import logoBrainy from '../../logo_brainy.png';
import { users } from '../data';
import { User } from '../types';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  MessageSquare,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  // Credentials are never pre-filled — the user must type them in.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid academic email address.');
      return;
    }

    setIsLoading(true);

    // Authenticate against the credentials defined in src/data/users.json.
    setTimeout(() => {
      const matchedUser = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password,
      );

      setIsLoading(false);

      if (!matchedUser) {
        setError('Invalid email or password. Please check your credentials.');
        return;
      }

      onLogin(matchedUser);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-surface-low flex flex-col md:flex-row font-sans text-on-surface">
      
      {/* LEFT COLUMN: BRAND SHOWCASE & GRAPHIC GRADIENT PANEL (Hidden on small mobile, visible on medium screens) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-charcoal relative overflow-hidden flex-col justify-between p-12 lg:p-16 select-none">
        
        {/* Decorative background visual elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-charcoal to-charcoal z-0"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl z-0"></div>
        <div className="absolute bottom-[-15%] left-[-15%] w-[400px] h-[400px] rounded-full bg-secondary/15 blur-3xl z-0"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] z-0"></div>



        {/* Middle Value Proposition Callouts */}
        <div className="my-auto space-y-8 max-w-lg z-10">
          <div className="space-y-4">
            <span className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Learning Space
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight font-sans">
              Accelerate your <span className="text-primary">academic potential</span> with AI.
            </h2>
            <p className="text-sm lg:text-base text-warm-gray leading-relaxed font-medium">
              A comprehensive virtual campus hub bringing textbook search, smart course recommendations, live virtual classrooms, and community feedback prioritizations in one beautifully unified space.
            </p>
          </div>

          {/* Feature highlights grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-xl flex gap-3 hover:bg-white/[0.05] transition-all">
              <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Virtual Library</h4>
                <p className="text-[11px] text-warm-gray mt-1 leading-normal">Smart textbook recommendations and academic library guides.</p>
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 rounded-xl flex gap-3 hover:bg-white/[0.05] transition-all">
              <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Feedback Co-Creation</h4>
                <p className="text-[11px] text-warm-gray mt-1 leading-normal">Participate in priority roadmaps to build a better campus.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright / trust badges */}
        <div className="flex items-center justify-between text-xs text-warm-gray z-10 pt-6 border-t border-white/5">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" /> Multi-factor Encryption
          </span>
          <span>© 2026 Portal.</span>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM PANEL */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white relative">
        
        {/* Background ambient lighting for mobile login */}
        <div className="md:hidden absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl z-0"></div>
        <div className="md:hidden absolute bottom-0 left-0 w-64 h-64 rounded-full bg-secondary/5 blur-3xl z-0"></div>

        <div className="mx-auto w-full max-w-md space-y-8 z-10">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center">
            <div className="group select-none">
              <img
                src={logoBrainy}
                alt="Academic Logo"
                className="w-44 h-44 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            
            <h1 className="text-2xl font-black text-charcoal tracking-tight mt-5">
              Welcome back to <span className="text-primary font-black">Academic Portal</span>
            </h1>
            <p className="text-xs text-warm-gray font-semibold mt-1">
              Sign in with your credentials to enter your dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-error-container text-on-error-container border border-error/25 rounded-lg text-xs font-semibold flex items-center gap-2 animate-shake">
                <span className="w-1.5 h-1.5 bg-error rounded-full shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-black text-charcoal uppercase tracking-wider block">
                Academic Email
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-outline" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@brainy.edu"
                  value={email}
                  onChange={(e) => {
                    setError('');
                    setEmail(e.target.value);
                  }}
                  className="block w-full bg-white border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg py-2.5 pl-9 pr-4 text-xs font-semibold placeholder:text-outline/75 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <label htmlFor="password" className="text-xs font-black text-charcoal uppercase tracking-wider block">
                  Password
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => {
                    e.preventDefault();
                    alert("A password reset email would be triggered in production.");
                  }}
                  className="text-[10px] font-extrabold text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-outline" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => {
                    setError('');
                    setPassword(e.target.value);
                  }}
                  className="block w-full bg-white border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg py-2.5 pl-9 pr-10 text-xs font-semibold placeholder:text-outline/75 outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-charcoal"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary/30 w-4 h-4 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-on-primary font-extrabold rounded-xl shadow-md hover:bg-gold-dark hover:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-primary/45 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed select-none active:scale-98 text-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-on-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </div>
              )}
            </button>
          </form>

          {/* Support Info */}
          <div className="text-center text-[10px] text-warm-gray font-semibold pt-4">
            Need an academic account or enrollment help? <br />
            <a 
              href="#support" 
              onClick={(e) => {
                e.preventDefault();
                alert("Please contact your campus administration office at admin@brainy.edu.");
              }}
              className="text-primary hover:underline font-extrabold"
            >
              Contact Registrar Support
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
