import React, { useState } from 'react';

interface SignUpPageProps {
  onLogin: () => void;
  onSubmit: () => void;
  onGoToLanding: () => void;
}

export function SignUpPage({ onLogin, onSubmit, onGoToLanding }: SignUpPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate signup submission and log in
    onSubmit();
  };

  return (
    <div className="min-h-screen text-on-surface bg-background flex flex-col font-sans overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (Visible on width >= md)                                   */}
      {/* ========================================================================= */}
      <main className="hidden md:flex flex-row flex-1 min-h-screen">
        
        {/* Left Side: Brand Panel */}
        <section className="flex flex-col justify-center items-start w-1/2 bg-primary-container p-margin-desktop text-on-primary-container relative overflow-hidden flex-shrink-0 select-none">
          {/* Background Network Graphic Overlay */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <img 
              alt="Abstract Network" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2hDySm2DzeOIG-0httVWOJmGd00EASHltDM7QYz5SJTKqn9ZaHdTMSrmz7JbC1MkUMqP11zuprkkvYI2XZFVYf82Ak-3aSHewKUvNlpuLU5xg-ySmXtCFVgodMovUlCGfpwFCuFNXAUYz7-eMM9bQ_e_pMlYa00Ly5RS-M-JUXSMaxgL1CQKHmVQQYpO-ZvxtgfV8iJwFuuDqh6pRCx1JNuPpMjVM4ObToZiP8u-pkwdM3Ubhd0XRxalWuAOvt17Q1bPqWxqOMg-o"
            />
          </div>
          <div className="relative z-10 max-w-[576px]">
            <div className="mb-xl cursor-pointer" onClick={onGoToLanding}>
              <span className="font-headline-md text-headline-md font-black text-on-primary-container select-none">CollabHub</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl mb-lg leading-tight font-black">
              Join the Future of Work
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container opacity-90 mb-xl">
              Empower your team with a platform designed for high-performance collaboration. Build faster, communicate clearer, and stay organized in one unified workspace.
            </p>
            
            <div className="grid grid-cols-1 gap-md">
              <div className="flex items-center gap-md p-md bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="material-symbols-outlined text-on-primary-container">speed</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold">Lightning Fast</span>
                  <span className="font-body-sm text-body-sm opacity-80">Optimized for speed and efficiency.</span>
                </div>
              </div>
              <div className="flex items-center gap-md p-md bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="material-symbols-outlined text-on-primary-container">security</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold">Enterprise Security</span>
                  <span className="font-body-sm text-body-sm opacity-80">Your data is safe with our advanced protocols.</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Brand copyright */}
          <div className="absolute bottom-margin-desktop left-margin-desktop opacity-60">
            <p className="font-label-sm text-label-sm">© 2026 CollabHub Inc.</p>
          </div>
        </section>

        {/* Right Side: Signup Form */}
        <section className="flex flex-col justify-center items-center w-1/2 bg-surface-container-lowest p-margin-desktop">
          <div className="w-full max-w-[448px]">
            <div className="mb-xl">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-xs font-black leading-tight">Create an account</h2>
              <p className="font-body-md text-body-md text-on-surface-variant font-medium">Start your 14-day free trial today.</p>
            </div>
            
            {/* Social Signups */}
            <div className="flex flex-row gap-md mb-xl">
              <button 
                type="button"
                onClick={onSubmit}
                className="flex items-center justify-center gap-sm flex-1 py-sm px-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors text-on-surface font-label-md cursor-pointer active:scale-95 duration-150"
              >
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZqKQdnOJQhy0UPqhlz4XBhxKUk7rTcZ-wuBwZJL1izH3Fi38x5hj0mxF7Osix7OHRB_gtv2bXvMCcvkiQ-7g2hZy7a4rJonyfREtF3lgjxiopYCBbfCQ_82yY1bF7IOJI3biLm12kXxki8WLiCA1jZ68__VlKOi0jY49aSmI0S_GGWCu2WUJKGOUnZ6vZ_2R1T7M77R9X7I8qjN8qelFu8VhXKBGDChU59r27qz69ijsbuvpMujRWpTfvPfOX3T2zembMZ_xP0fYQ" />
                Google
              </button>
              <button 
                type="button"
                onClick={onSubmit}
                className="flex items-center justify-center gap-sm flex-1 py-sm px-md border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors text-on-surface font-label-md cursor-pointer active:scale-95 duration-150"
              >
                <span className="material-symbols-outlined text-xl">terminal</span>
                GitHub
              </button>
            </div>

            <div className="relative flex items-center mb-xl">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Or continue with email</span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-lg">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant font-bold ml-xs" htmlFor="desktop-name">Full Name</label>
                <input 
                  id="desktop-name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-on-surface outline-none transition-all placeholder:text-outline/60" 
                  placeholder="Alex Johnson" 
                  required
                  type="text"
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant font-bold ml-xs" htmlFor="desktop-email">Work Email</label>
                <input 
                  id="desktop-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-on-surface outline-none transition-all placeholder:text-outline/60" 
                  placeholder="name@company.com" 
                  required
                  type="email"
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant font-bold ml-xs" htmlFor="desktop-password">Password</label>
                <div className="relative">
                  <input 
                    id="desktop-password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface-container-lowest text-on-surface outline-none transition-all placeholder:text-outline/60 pr-10" 
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
                <p className="font-label-sm text-label-sm text-on-surface-variant font-medium">At least 8 characters with a mix of letters and numbers.</p>
              </div>
              <div className="flex items-start gap-sm py-xs">
                <input 
                  id="desktop-terms" 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" 
                  required
                  type="checkbox"
                />
                <label className="font-body-sm text-body-sm text-on-surface-variant select-none" htmlFor="desktop-terms">
                  I agree to the <a className="text-primary hover:underline font-bold" href="#">Terms of Service</a> and <a className="text-primary hover:underline font-bold" href="#">Privacy Policy</a>.
                </label>
              </div>
              <button 
                type="submit"
                className="w-full py-md px-xl bg-primary hover:bg-primary/95 text-on-primary font-bold font-label-md rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                Create Account
              </button>
            </form>
            
            <div className="mt-xl text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant font-semibold">
                Already have an account?{' '}
                <a onClick={onLogin} className="text-primary font-black hover:underline cursor-pointer">Login</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW (Visible on width < md)                                     */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col items-center min-h-screen bg-background w-full">
        {/* Brand Header */}
        <header className="w-full pt-xl pb-lg px-margin-mobile flex justify-center items-center select-none cursor-pointer" onClick={onGoToLanding}>
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
            </div>
            <span className="font-headline-md text-headline-md font-black text-primary">CollabHub</span>
          </div>
        </header>

        {/* Middle Section: Heading and Form */}
        <main className="w-full max-w-[448px] px-margin-mobile flex flex-col flex-grow">
          <div className="mb-xl text-center">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xs font-black leading-tight">Create Account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant font-medium">Join thousands of high-performance teams.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Name Field */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant ml-xs font-bold" htmlFor="mobile-name">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">person</span>
                <input 
                  id="mobile-name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-xl pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all pr-10" 
                  placeholder="John Doe" 
                  required
                  type="text"
                />
              </div>
            </div>
            {/* Email Field */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant ml-xs font-bold" htmlFor="mobile-email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">mail</span>
                <input 
                  id="mobile-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-xl pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all pr-10" 
                  placeholder="name@company.com" 
                  required
                  type="email"
                />
              </div>
            </div>
            {/* Password Field */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant ml-xs font-bold" htmlFor="mobile-password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input 
                  id="mobile-password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-xl pr-12 py-md bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all" 
                  placeholder="••••••••" 
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant cursor-pointer"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="pt-sm">
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold font-label-md text-label-md py-lg rounded-lg shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-sm cursor-pointer"
              >
                Sign Up
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Social Signup Section */}
          <div className="mt-xl">
            <div className="relative flex items-center justify-center mb-lg">
              <div className="border-t border-outline-variant w-full absolute"></div>
              <span className="bg-background px-md relative font-label-sm text-label-sm text-outline font-black select-none">OR CONTINUE WITH</span>
            </div>
            <div className="grid grid-cols-3 gap-md">
              <button 
                onClick={onSubmit}
                className="flex items-center justify-center py-md border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer active:scale-95 duration-100"
              >
                <img alt="Google" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtYk2t9LwpudUT0P7_i2y7iuVF8Zpnr5C_98F-NejK0O9wawXIx2uBZbxVal28VlFlKpLCuHkuqqE5kbfGox5Q3hqBT6zdBiMjdhealzfwHF7rfGNFQAkEu868QQy3WjdG0a2RX4v4BfHiiOoRhoCsJvFv9htPpVlScgHGdWeg3UcND2AGolWU5JMKz-HwDioQzHjF4bDQhHnEVIpGyLV2KRUejLmm2PEBo_n_JOv4BM-j02NGkcywxzTBhRYnXCj1cbyz4PJ9QOqk" />
              </button>
              <button 
                onClick={onSubmit}
                className="flex items-center justify-center py-md border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer active:scale-95 duration-100"
              >
                <img alt="Microsoft" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGcMLrfdipY2KTrPFdoQSMNW5Y157II20FdST85J0enCdmzmcz800jlOl_GVd1KdrvsqejzSQU66OKGrub7lw-Q3IWJzhelOJ-McUdPr-uk2yggbaU8FSPAxfI2xY4MW8XThtUHyG8MB8m8lC_vlN4sfw2WBGfaGPnwu0P38ovX9nikRYo9V_c0n5tMeJP12IYnKEV-EjCx-siOHGdqF-j6wCO_zWog55Ffci6D571DSltaDQwqetY8WXySBz7qePUCFELaHwb6vBc" />
              </button>
              <button 
                type="button"
                onClick={onSubmit}
                className="flex items-center justify-center py-md border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer active:scale-95 duration-100 text-on-surface"
              >
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
              </button>
            </div>
          </div>
        </main>

        {/* Bottom Section: Footer Links */}
        <footer className="w-full py-xl px-margin-mobile flex flex-col items-center gap-md flex-shrink-0">
          <p className="font-body-sm text-body-sm text-on-surface-variant font-semibold select-none">
            Already have an account?{' '}
            <a onClick={onLogin} className="text-primary font-black hover:underline cursor-pointer">Log In</a>
          </p>
          <div className="flex gap-lg mt-md select-none">
            <a className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
          </div>
          <p className="font-label-sm text-label-sm text-outline-variant mt-sm select-none">© 2026 CollabHub Inc.</p>
        </footer>
      </div>

    </div>
  );
}
