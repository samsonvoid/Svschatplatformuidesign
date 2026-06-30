import React, { useState } from 'react';
import { SOCKET_URL } from '../../App';

interface LoginPageProps {
  onSignUp: () => void;
  onSubmit: () => void;
  onGoToLanding: () => void;
}

export function LoginPage({ onSignUp, onSubmit, onGoToLanding }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = () => {
    setError('OAuth login (Google, GitHub, Microsoft) is currently under construction. Please use your email and password credentials to log in.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${SOCKET_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }
      
      // Successfully authenticated!
      sessionStorage.setItem('collabhub_token', data.token);
      if (data.user) {
        sessionStorage.setItem('collabhub_user', JSON.stringify(data.user));
      }
      onSubmit();
    } catch (err: any) {
      console.error('[Login Error]:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen text-on-surface bg-background flex flex-col font-sans overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (Visible on width >= md)                                   */}
      {/* ========================================================================= */}
      <main className="hidden md:flex flex-row flex-grow min-h-screen">
        
        {/* Left Side: Brand Panel */}
        <section 
          style={{ 
            backgroundColor: '#004ad3', 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', 
            backgroundSize: '32px 32px' 
          }}
          className="md:w-1/2 flex flex-col justify-between p-margin-desktop text-white flex-shrink-0 select-none"
        >
          <div className="cursor-pointer" onClick={onGoToLanding}>
            <span className="font-headline-md text-headline-md font-black text-white select-none">CollabHub</span>
          </div>
          
          <div className="max-w-[576px] mb-xl">
            <h1 className="font-headline-xl text-headline-xl mb-md font-black leading-tight">Welcome Back</h1>
            <p className="font-body-lg text-body-lg opacity-90 leading-relaxed">
              Unify your team communication in one powerful space. Streamline workflows, manage projects, and maintain clarity across every conversation with CollabHub's high-performance workspace.
            </p>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <img 
              alt="Team Collaboration" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb-Y1ra7HRiZjOuK7N1vUxjUSM844E1Akn1b4QO-OvAWtic2E3DEhK66ZkB_1aqyNescKaq8i7jsSCRqXbwSOU5tKtr1X5QZvQZXeRb8cpdBkm4eafGbEEdEkidx7z8TiRSwV93i97Tf22p1lLUt3dtL618zdcvFRUdRmiohUcRIq7-OmEqzfWqEYXzbZ24s9hVJUeHSJFGQoWqf6u4xfs_XeJt4pwoTdX3lVqdDKgbvbOLSZblEVBHew7NnkhIp1b1ZOvY41e4sYC"
            />
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="bg-surface-container-lowest md:w-1/2 flex items-center justify-center p-margin-desktop">
          <div className="w-full max-w-[440px]">
            <div className="mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs font-black leading-tight">Login to your account</h2>
              <p className="font-body-md text-body-md text-on-surface-variant font-medium">Enter your credentials to access your workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-lg">
              {error && (
                <div className="p-md rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-label-md text-xs flex items-start gap-sm select-none animate-fade-in">
                  <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
                  <span className="leading-snug">{error}</span>
                </div>
              )}
              <div className="space-y-sm">
                <label className="font-label-md text-label-md text-on-surface-variant block font-bold ml-xs" htmlFor="desktop-email">Email Address</label>
                <input 
                  id="desktop-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md placeholder:text-outline/60" 
                  placeholder="name@company.com" 
                  required
                  type="email"
                />
              </div>
              <div className="space-y-sm">
                <div className="flex justify-between items-center px-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-bold" htmlFor="desktop-password">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:underline font-bold" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <input 
                    id="desktop-password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-md py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md pr-10" 
                    placeholder="••••••••" 
                    required
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-on-primary hover:opacity-90 active:scale-[0.98] transition-all font-label-md text-label-md py-md rounded-lg font-black shadow-md cursor-pointer"
              >
                Login
              </button>
            </form>

            <div className="relative my-xl">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-outline-variant"></span>
              </div>
              <div className="relative flex justify-center text-label-sm">
                <span className="px-md bg-surface-container-lowest text-on-surface-variant font-bold select-none">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <button 
                onClick={handleSocialLogin}
                className="flex items-center justify-center gap-sm py-sm px-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-label-md text-on-surface cursor-pointer active:scale-95 duration-100"
              >
                <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKm1Avd-a8pPaCA-5Av75kUyy1bbpCLGkFw7mSaPGZ4lfBLdDT86uiygvF3j57b7rCeXrYkUGGziKXEAddYHTUeVbSJa0SsktqJngiLacOIAWYdpA7ZIHf9eyNBxvuo0qrEs7c7SX1WUE-gCOjH5BgdEX8LRtJ9as20MiUg1lBeoYQWA5GL9k2MeueFwY1tVVBSJPKFopyPBqZt31tN-zjzraiSOFcb4JiDSVjAFpB1_nQ6S1M4hpcyE4W5tGKjThTKcK7u6dXljOG" />
                Google
              </button>
              <button 
                onClick={handleSocialLogin}
                className="flex items-center justify-center gap-sm py-sm px-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-label-md text-on-surface cursor-pointer active:scale-95 duration-100"
              >
                <span className="material-symbols-outlined text-[20px]">terminal</span>
                GitHub
              </button>
            </div>

            <div className="mt-xl text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant font-semibold select-none">
                Don't have an account?{' '}
                <a onClick={onSignUp} className="text-primary font-black hover:underline cursor-pointer">Sign up for free</a>
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Desktop Footer (Visible on width >= md) */}
      <footer className="hidden md:block w-full border-t border-outline-variant bg-surface-container-lowest px-margin-desktop py-md flex-shrink-0 select-none">
        <div className="flex flex-row justify-between items-center max-w-[1280px] mx-auto w-full">
          <span className="font-body-sm text-body-sm text-on-surface-variant opacity-70">© 2026 CollabHub Inc. All rights reserved.</span>
          <div className="flex gap-lg">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Help Center</a>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW (Visible on width < md)                                     */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col items-center justify-between min-h-screen bg-surface w-full">
        {/* Brand Header */}
        <header className="w-full pt-xl px-margin-mobile flex flex-col items-center select-none cursor-pointer" onClick={onGoToLanding}>
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            </div>
            <span className="font-headline-md text-headline-md font-black text-primary">CollabHub</span>
          </div>
        </header>

        {/* Login Form Container */}
        <main className="w-full max-w-[448px] px-margin-mobile py-xl flex flex-col gap-lg">
          <div className="flex flex-col gap-xs">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-black leading-tight">Login</h1>
            <p className="font-body-md text-body-md text-on-surface-variant font-medium">Access your collaborative workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            {error && (
              <div className="p-md rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-label-md text-xs flex items-start gap-sm select-none animate-fade-in">
                <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
                <span className="leading-snug">{error}</span>
              </div>
            )}
            {/* Email Address */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1 font-bold" htmlFor="mobile-email">Email Address</label>
              <input 
                id="mobile-email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-md py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline/60" 
                placeholder="name@company.com" 
                required
                type="email"
              />
            </div>
            {/* Password Address */}
            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-md text-label-md text-on-surface-variant font-bold" htmlFor="mobile-password">Password</label>
                <a className="font-label-sm text-label-sm text-primary hover:underline font-bold" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <input 
                  id="mobile-password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-md py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10" 
                  placeholder="••••••••" 
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            {/* Submit Button */}
            <button 
              type="submit"
              className="mt-sm w-full py-md bg-primary hover:bg-primary/95 text-on-primary font-black font-label-md text-label-md rounded-lg shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              Login
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center gap-md py-sm">
            <div className="h-px bg-outline-variant flex-grow"></div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold select-none">Or continue with</span>
            <div className="h-px bg-outline-variant flex-grow"></div>
          </div>

          {/* Social Authentication */}
          <div className="grid grid-cols-2 gap-md">
            <button 
              onClick={handleSocialLogin}
              className="flex items-center justify-center gap-sm py-md bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors cursor-pointer active:scale-95 duration-100"
            >
              <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKm1Avd-a8pPaCA-5Av75kUyy1bbpCLGkFw7mSaPGZ4lfBLdDT86uiygvF3j57b7rCeXrYkUGGziKXEAddYHTUeVbSJa0SsktqJngiLacOIAWYdpA7ZIHf9eyNBxvuo0qrEs7c7SX1WUE-gCOjH5BgdEX8LRtJ9as20MiUg1lBeoYQWA5GL9k2MeueFwY1tVVBSJPKFopyPBqZt31tN-zjzraiSOFcb4JiDSVjAFpB1_nQ6S1M4hpcyE4W5tGKjThTKcK7u6dXljOG" />
              <span className="font-label-md text-label-md text-on-surface font-bold">Google</span>
            </button>
            <button 
              onClick={handleSocialLogin}
              className="flex items-center justify-center gap-sm py-md bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container transition-colors cursor-pointer active:scale-95 duration-100"
            >
              <img alt="Microsoft Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf0weip3u2J0rUAFELKsB_Cwsu2zWrZYZEJk4Y5X6etO7dMbBN70nM5zdBt401g7I1aaQ8ls__EcNGZbW5RzSw3jTHyeQVzqGOGdQZByAf3Chh25Ja20dyNUtjERMnKHEBEhbedA78a0TdzdUMabTKEFXB-yTipjpYs3iI4JAMEDemPpyiH1zfv-Ij1FQyolzQOghgIMzuSQdWOd18Ek_IJd9LlPNCKANmBpUkUywssDEwQGao0-HbPo7c6XrAVNJkFgzTOd7SbIzO" />
              <span className="font-label-md text-label-md text-on-surface font-bold">Microsoft</span>
            </button>
          </div>
        </main>

        {/* Mobile Footer Links */}
        <footer className="w-full pb-xl px-margin-mobile flex flex-col items-center gap-lg flex-shrink-0">
          <p className="font-body-sm text-body-sm text-on-surface-variant font-semibold select-none">
            Don't have an account?{' '}
            <a onClick={onSignUp} className="text-primary font-black hover:underline cursor-pointer">Sign Up</a>
          </p>
          <div className="flex flex-col items-center gap-sm pt-md border-t border-outline-variant w-full max-w-xs select-none">
            <div className="flex gap-md">
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Terms</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Support</a>
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-xs">© 2026 CollabHub Inc.</p>
          </div>
        </footer>
      </div>

    </div>
  );
}
