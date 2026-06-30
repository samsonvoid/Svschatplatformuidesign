import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen text-on-surface bg-background selection:bg-primary-container selection:text-on-primary-container flex flex-col font-sans overflow-x-hidden">
      
      {/* 1. Header Area (Responsive Layout) */}
      <header className="sticky top-0 w-full z-50 flex justify-between items-center px-md md:px-lg py-md bg-surface/90 backdrop-blur-md border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-md">
          <span className="font-headline-sm text-headline-sm font-black text-primary select-none">CollabHub</span>
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-lg ml-xl">
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Features</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Solutions</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Pricing</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors font-label-md text-label-md cursor-pointer">Resources</a>
          </nav>
        </div>

        {/* Desktop CTA & Login */}
        <div className="hidden md:flex items-center gap-md">
          <button 
            onClick={onLogin}
            className="text-on-surface-variant font-semibold hover:text-primary transition-colors font-label-md text-label-md px-md py-sm cursor-pointer"
          >
            Log In
          </button>
          <button 
            onClick={onSignUp}
            className="bg-primary hover:bg-primary/95 text-on-primary px-md py-sm rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex md:hidden items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-sm text-on-surface-variant active:scale-95 transition-all rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[64px] left-0 w-full bg-white z-[45] border-b border-outline-variant shadow-lg flex flex-col p-lg gap-md animate-fade-in">
          <a className="text-on-surface font-semibold hover:text-primary transition-colors py-sm border-b border-slate-100 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a className="text-on-surface font-semibold hover:text-primary transition-colors py-sm border-b border-slate-100 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
          <a className="text-on-surface font-semibold hover:text-primary transition-colors py-sm border-b border-slate-100 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a className="text-on-surface font-semibold hover:text-primary transition-colors py-sm border-b border-slate-100 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Resources</a>
          <div className="flex flex-col gap-sm mt-md">
            <button 
              onClick={() => { setMobileMenuOpen(false); onLogin(); }}
              className="w-full py-md border border-outline-variant text-primary rounded-lg font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
            >
              Log In
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onSignUp(); }}
              className="w-full py-md bg-primary text-white rounded-lg font-label-md text-label-md font-bold shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-xl">
        
        {/* 2. Hero Section */}
        {/* Desktop Hero (Show on >= md) */}
        <section className="hidden md:flex px-margin-desktop py-xl lg:py-32 flex-col items-center text-center max-w-[1280px] mx-auto">
          <h1 className="font-headline-xl text-headline-xl mb-md max-w-[896px] tracking-tight text-on-surface leading-tight font-black">
            Unify Your Team's Communication
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-[672px]">
            Experience the power of real-time chat and intelligent dashboards. CollabHub brings your conversations, files, and insights into one seamless workspace.
          </p>
          <div className="flex gap-md mb-24">
            <button 
              onClick={onSignUp}
              className="bg-primary hover:bg-primary/95 text-on-primary px-xl py-md rounded-lg font-label-md text-label-md hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              Get Started for Free
            </button>
            <button 
              onClick={onLogin}
              className="bg-surface-container-low text-primary px-xl py-md rounded-lg font-label-md text-label-md border border-outline-variant hover:bg-surface-container transition-all cursor-pointer"
            >
              View Demo
            </button>
          </div>
          {/* Desktop Preview */}
          <div className="w-full relative rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-2xl">
            <img 
              className="w-full h-auto object-cover" 
              alt="Dashboard Preview Desktop" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7cyjpa1cucjJUYw22ej_Gl1ryph3Am6zcQZeRT_a78ydFz99jPXkKKTANCbFXrt6JtoazLclOe9CI90802eKFBiD4xN8vAZKF7m_pDr0NbFW8P8-JzzVCjodZcSNlAmF7hhXTt5vMXlfy8GAgszozwmfrYSwwPns-K5pIFr7dWtBW76Wf_usf89zjOMhmz2ColSFVjA0gAehhDU0pOnTqfyNBXeaima6yhKRC24uwzICX9UnyP2LFM4_jeL19Gz8r0o3V0Uc9DtfF"
            />
          </div>
        </section>

        {/* Mobile Hero (Show on < md) */}
        <section className="flex md:hidden px-md pt-xl flex-col gap-lg text-center items-center">
          <div className="flex flex-col gap-sm">
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-black leading-tight">
              Effortless team <span className="text-primary">collaboration</span>.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[320px] mx-auto">
              Unified workspace for high-performance teams to communicate, share, and build faster.
            </p>
          </div>
          <div className="w-full flex flex-col gap-md pt-md">
            <button 
              onClick={onSignUp}
              className="w-full py-md bg-primary text-white rounded-lg font-label-md text-label-md font-bold shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Get Started
            </button>
            <button 
              onClick={onLogin}
              className="w-full py-md bg-surface border border-outline-variant text-primary rounded-lg font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
            >
              Log In
            </button>
          </div>
          {/* Mobile Preview */}
          <div className="w-full mt-lg overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm">
            <img 
              className="w-full h-48 object-cover" 
              alt="Dashboard Preview Mobile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVFGZjjpxZjap8T-jQ8vpsxTBM9k6cnOIFGdct6QEtENOEwhLMt4Fyy8mRQIhLk7LFbCDsvpQoBCkRK-kdD0nsA3XiYHTM02D-KE6Ua2jxEF2FX79TxDsmDjMCR6lZkjstoCEgnYgP7f8OvBVzbZh0Pc3WapgxOW-QLyz34Y6FcCxodCSpTMUKifxrdlT2CZkgp0FE07j0P0DfflPLjWSP--OW9Rc8HYkZSzr8Pc5ToFHCzn7y5qtWV9Hyl5XZTV6PLnIvfCEgy2yd"
            />
          </div>
        </section>

        {/* 3. Social Proof Row (Desktop Only) */}
        <section className="hidden md:block bg-surface-container-low py-xl px-margin-desktop text-center mt-12">
          <p className="font-label-sm text-label-sm text-outline mb-lg uppercase tracking-widest font-bold">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-xl opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <img alt="Acme Corp" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbzz3sWi8vdEijdooG0kmtwwFkRlLQHLt9HAbhTTry3IBdTnwDd15H5HOGtY8Bn7hzSQR2pkUMw7DZ1RNyVShGdgI6XgBAWd9xdv1lOqEM0EZrqMYxP_QbBuvNtPd_sioBEsMMUpdizdb7165MbmJ3Rjse9BS6X2q68j-nv9TV8kYLmrTSOUUsIBl1FgaMgFECcjkPNWnO-ICrgtOZqyFhBDwpRSUhSBJ-2tlGhUaAQYL14iK6B3Odkze7JOpO7ClTESq3O0MWGnnp" />
            <img alt="GlobalFlow" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4DRVz4RK0Q7ryBlbPnZ44-xnvtMqQP3Xa-EmPqWhB9bzZuw9IDTq7oehmeuGaFQGx416YxxGxQMABbFEJYmyCf1QLha2efJbSKgNcEEF4602gC1MBRFh32RdXVSAHJHrX4WSSIECnUlelTyJ0RawXLPXCriv7YnwDNbD0N5zi5pow7_E_p9H2-PJi8Yr0XjIXZHvaAFBE7wngPG9yw7m3cOvQwKpFGd-1rgQXixNw7prihvjqKl9AS21KoOjxoP4N9ojbgxF2rnL-" />
            <img alt="TechStream" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBbxgQFMxCCe1lKy5SORZ5NQRAyXXfTItYkeLWqjaNMVVDZMp1SIn8ImaY3odmxDPcb-7t3OFg7YMIleyw0fnY8zFR21uiksU2gRLZnGj6acg5ZoOJfYc0RqARxSg1jRFrSgKpUo651zLPpDjUV5H7cFbkklALjk9TuwErOGwk0yD4WIqjo0sKENHynbW7iMDDZpZ4qVu8siqhcml75R-LyTlsdTzussWdaveTBBjGEo20M6tMOZhN6-CrlIJfsTIGa5TGprUjIOg1" />
            <img alt="NovaSoft" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwzO106-DjNSclALGx_xMECA_iEnAx9B6gmUhcO2XHhJgmrxz4Uhmr5behLlV-jZIbwTBA-aJ_AEoa0tDVZ9G3AuZiWq0J5hKFp5E3IAHTtX9-uTkWgcD7WQdYEQLofRLg3k7Zh-y1iMbpotBFJ7whfhPcWERNYbnyR94lRshuqlvjJkyq2-kB4e_Syg5e5iypXTmDIFIWN-HduUHq-IDZ1SLISSanjCzVCc2UWx1VepKMq5VJHe9h9C-sqTt5_wTnNUkEjVE4a7NS" />
            <img alt="Vortex" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEcISSRMOIQWNKLSIdhHBmoSwC0WWVbcgKma6GInqPRdXKkY1B7bcMZsExZv482-4gQJEOcPC9hPXseVF7HZk8sDGLzay7JMhXWs6dvjCHgOd54zRw58Me6Es6ZRgOctX9X7hPkaAP2s0AUW4xEyay_V4QT6q5zXqi-PPoq6z2h2iKzTXy7SDWCoJv8OZQ4TJpRU3E9fNW9bCWNJN50UcaUldIvpQtUoRV6AGgtzbslm70mi2rXBUHquHgt67bbkRgjHBcsLPpXmBQ" />
          </div>
        </section>

        {/* 4. Features / Value Propositions (Responsive Layout) */}
        {/* Desktop Features & Deep-Dives (>= md) */}
        <section className="hidden md:block py-32 px-margin-desktop max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            <div className="p-lg rounded-xl bg-white border border-outline-variant hover:border-primary/30 transition-colors group select-none shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-md group-hover:bg-primary transition-colors duration-300">
                <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors duration-300">chat_bubble</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-sm text-on-surface font-bold">Seamless Messaging</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Instant connectivity with threads, emojis, and real-time typing indicators for effortless collaboration.</p>
            </div>
            <div className="p-lg rounded-xl bg-white border border-outline-variant hover:border-primary/30 transition-colors group select-none shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-md group-hover:bg-primary transition-colors duration-300">
                <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors duration-300">folder_shared</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-sm text-on-surface font-bold">Centralized Files</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Organize project assets in one place with powerful search and version history across all your conversations.</p>
            </div>
            <div className="p-lg rounded-xl bg-white border border-outline-variant hover:border-primary/30 transition-colors group select-none shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center mb-md group-hover:bg-primary transition-colors duration-300">
                <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors duration-300">insights</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-sm text-on-surface font-bold">Team Insights</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Visualize productivity trends and project health with automated reporting and smart dashboards.</p>
            </div>
          </div>

          {/* Feature Deep-Dive: Chat */}
          <div className="flex flex-col md:flex-row items-center gap-24 mt-24">
            <div className="w-full md:w-1/2">
              <span className="font-label-md text-label-md text-primary bg-primary-container/10 px-md py-sm rounded-full mb-md inline-block font-bold">Conversation First</span>
              <h2 className="font-headline-lg text-headline-lg mb-md text-on-surface font-black">Messaging built for focus</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
                Cut through the noise with structured threads. CollabHub's chat interface minimizes distractions, allowing teams to dive deep into topics without losing context.
              </p>
              <ul className="space-y-md">
                <li className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">Multi-level threading to keep replies organized</span>
                </li>
                <li className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">Integrated video calling for quick syncs</span>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-surface-container p-sm rounded-2xl shadow-sm border border-outline-variant">
                <img 
                  className="rounded-xl w-full shadow-lg" 
                  alt="A detailed view of a professional chat interface." 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVfUtquK_PclHYjEyEwXNlwzQ_dyYOC4HtfhJD6d-87uVmNDruQZjvYcL1hxcL8rCOBzjO3lKLvWjmS8vAqTQHX_ekMf9R21ByrQVbUFAa5kynkyRDg8b_QD1w9wSDUJXklLwiASyMyxTtdja5K2SA2V5lquuNTZRj4Fn2AwVZQzBIgTd3ztsJ2JhwY-M88YrmXCqbn1Qwd8OiwLYS2ANNhx7_NA2uGi1PXPnLINL685swmdwx-SIjO59Vd3FuDX1MBIw1VlwvTB2J"
                />
              </div>
            </div>
          </div>

          {/* Feature Deep-Dive: Dashboard */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-24 mt-24">
            <div className="w-full md:w-1/2">
              <span className="font-label-md text-label-md text-primary bg-primary-container/10 px-md py-sm rounded-full mb-md inline-block font-bold">Data Driven</span>
              <h2 className="font-headline-lg text-headline-lg mb-md text-on-surface font-black">Dashboards that drive action</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
                Transform raw communication into actionable data. Our smart dashboards track task completion, response times, and project milestones in real-time.
              </p>
              <ul className="space-y-md">
                <li className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">Customizable widgets for project tracking</span>
                </li>
                <li className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">Automated weekly performance reports</span>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-surface-container p-sm rounded-2xl shadow-sm border border-outline-variant">
                <img 
                  className="rounded-xl w-full shadow-lg" 
                  alt="A close-up view of an analytics dashboard widget." 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDY-5hR73yI_Rle7ixch7T52C3UH4lYftbVVbxbQLGXUxnPXQKgJc6WGx1BAKEuoB3CvSgH5S7u4tJu7xeAi61GSW6pceCWVCRtv7BIiJj-iC9vh5gJIlOkQf_y4Z5TDsxNXL4cgnMiGRr0cKv5R9GA_vef-U1ItoH42DIJdG2huZ5a0HXSs1XEPCcUSVPnturDSc33vgXa4B09QIWjsi6_8FENVnc3QbEsN5xOxstUujFmbZZpOMJhXFD6SopXC4ME_IuhTPIZwziQ"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Features List (Show on < md) */}
        <section className="block md:hidden px-md flex flex-col gap-md mt-16">
          <div className="flex flex-col gap-xs mb-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface font-black">Key Features</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant font-bold">Optimized for your mobile workflow.</p>
          </div>
          <div className="flex flex-col gap-md">
            {/* Mobile Feature Card 1 */}
            <div className="p-lg bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col gap-sm shadow-sm select-none">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Real-time Sync</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Messages and files update instantly across all your devices without refreshing.</p>
            </div>
            {/* Mobile Feature Card 2 */}
            <div className="p-lg bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col gap-sm shadow-sm select-none">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Team Spaces</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Organize conversations by projects or departments with granular permissions.</p>
            </div>
            {/* Mobile Feature Card 3 */}
            <div className="p-lg bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col gap-sm shadow-sm select-none">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Enterprise Security</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">End-to-end encryption and multi-factor authentication for your peace of mind.</p>
            </div>
          </div>
        </section>

        {/* 5. Solutions Card (Responsive) */}
        <section className="px-md md:px-margin-desktop max-w-[1280px] mx-auto w-full mt-16">
          <div className="bg-primary p-lg md:p-xl rounded-xl text-white flex flex-col gap-md overflow-hidden relative shadow-md">
            <div className="relative z-10 flex flex-col gap-xs max-w-[576px]">
              <h2 className="font-headline-md text-headline-md font-black leading-tight">Built for Remote Teams</h2>
              <p className="font-body-sm text-body-sm text-blue-100 font-semibold">Scale your communication infrastructure effortlessly and coordinate deliverables in real time.</p>
            </div>
            <div className="relative z-10">
              <button 
                onClick={onSignUp}
                className="bg-white text-primary px-lg py-sm rounded-full font-label-md text-label-md font-bold hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
              >
                Explore Solutions
              </button>
            </div>
            {/* Abstract background element */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-container rounded-full opacity-50 blur-xl"></div>
          </div>
        </section>

        {/* 6. Final CTA (Responsive) */}
        {/* Desktop CTA Banner (>= md) */}
        <section className="hidden md:block px-margin-desktop mt-16">
          <div className="max-w-[1280px] mx-auto bg-surface-container-high p-xl md:p-16 rounded-3xl relative overflow-hidden border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-xl">
            {/* Left Side: Content */}
            <div className="flex-1 flex flex-col items-start text-left max-w-[550px]">
              <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider mb-sm">CollabHub Workspace</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-md font-black leading-tight">Ready to boost productivity?</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">Join over 10,000 teams using CollabHub to stay ahead.</p>
              <div className="flex gap-md">
                <button 
                  onClick={onSignUp}
                  className="bg-primary hover:bg-primary/95 text-on-primary px-xl py-md rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer font-bold border-none"
                >
                  Start Your Free Trial
                </button>
              </div>
            </div>

            {/* Right Side: Mockup Slideshow */}
            <div className="flex-1 w-full max-w-[500px] h-[320px] rounded-2xl bg-white dark:bg-slate-900 border border-outline-variant/50 overflow-hidden relative shadow-lg p-md flex items-center justify-center">
              
              {/* Slide 0: Chat Mockup */}
              <div className={`absolute inset-0 p-md flex flex-col gap-sm transition-all duration-700 transform ${
                activeSlide === 0 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
              }`}>
                <div className="flex items-center gap-sm border-b border-outline-variant/20 pb-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  <span className="text-[10px] text-on-surface-variant/60 font-mono ml-xs">#collabhub-general</span>
                </div>
                <div className="flex-1 flex flex-col gap-sm justify-end">
                  <div className="self-start bg-slate-100 dark:bg-slate-800 p-sm rounded-r-xl rounded-tl-xl max-w-[80%] shadow-sm text-left">
                    <p className="text-[11px] font-bold text-primary">Jamali NM</p>
                    <p className="text-[11px] text-on-surface-variant">Did we deploy the notification service?</p>
                  </div>
                  <div className="self-end bg-primary/10 p-sm rounded-l-xl rounded-tr-xl max-w-[80%] shadow-sm text-left">
                    <p className="text-[11px] font-bold text-primary">You</p>
                    <p className="text-[11px] text-on-surface">Yes, and quick reply action logs are live! 🚀</p>
                    <span className="text-[9px] text-primary float-right mt-1 font-bold">read —●</span>
                  </div>
                </div>
              </div>

              {/* Slide 1: File Storage Mockup */}
              <div className={`absolute inset-0 p-md flex flex-col gap-sm transition-all duration-700 transform ${
                activeSlide === 1 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
              }`}>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-xs">
                  <span className="text-[11px] font-bold text-on-surface">Shared Workspace Files</span>
                  <span className="material-symbols-outlined text-[16px] text-primary">search</span>
                </div>
                <div className="flex-1 flex flex-col gap-xs pt-xs">
                  <div className="flex items-center justify-between p-xs bg-slate-100/50 dark:bg-slate-800/40 rounded border border-outline-variant/10">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">picture_as_pdf</span>
                      <span className="text-[10px] font-medium text-on-surface truncate max-w-[150px]">architecture_spec.pdf</span>
                    </div>
                    <span className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold">1.2 MB</span>
                  </div>
                  <div className="flex items-center justify-between p-xs bg-slate-100/50 dark:bg-slate-800/40 rounded border border-outline-variant/10">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">image</span>
                      <span className="text-[10px] font-medium text-on-surface truncate max-w-[150px]">login_design_v2.png</span>
                    </div>
                    <span className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold">840 KB</span>
                  </div>
                  <div className="flex items-center justify-between p-xs bg-slate-100/50 dark:bg-slate-800/40 rounded border border-outline-variant/10">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                      <span className="text-[10px] font-medium text-on-surface truncate max-w-[150px]">readme_guide.md</span>
                    </div>
                    <span className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold">14 KB</span>
                  </div>
                </div>
              </div>

              {/* Slide 2: Bento Velocity Analytics Mockup */}
              <div className={`absolute inset-0 p-md flex flex-col gap-sm transition-all duration-700 transform ${
                activeSlide === 2 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
              }`}>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-xs">
                  <span className="text-[11px] font-bold text-on-surface font-black">Performance Bento</span>
                  <span className="text-[9px] bg-green-500/10 text-green-600 px-1.5 rounded font-bold flex items-center gap-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live
                  </span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-sm pt-xs">
                  <div className="p-xs bg-slate-100/50 dark:bg-slate-800/40 rounded border border-outline-variant/10 flex flex-col justify-between text-left">
                    <span className="text-[9px] text-on-surface-variant font-medium">Message Velocity</span>
                    <span className="text-xs font-black text-primary">1,240 / hr</span>
                  </div>
                  <div className="p-xs bg-slate-100/50 dark:bg-slate-800/40 rounded border border-outline-variant/10 flex flex-col justify-between text-left">
                    <span className="text-[9px] text-on-surface-variant font-medium">Delivery Latency</span>
                    <span className="text-xs font-black text-green-600">84ms</span>
                  </div>
                  <div className="col-span-2 p-xs bg-slate-100/50 dark:bg-slate-800/40 rounded border border-outline-variant/10 flex items-center justify-between text-left">
                    <span className="text-[9px] text-on-surface-variant font-medium">PWA Push Status</span>
                    <span className="text-[9px] text-primary font-bold">VAPID Connected</span>
                  </div>
                </div>
              </div>

              {/* Indicator Dots */}
              <div className="absolute bottom-2.5 flex gap-xs">
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeSlide === 0 ? 'bg-primary w-3' : 'bg-outline-variant'}`}></span>
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeSlide === 1 ? 'bg-primary w-3' : 'bg-outline-variant'}`}></span>
                <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeSlide === 2 ? 'bg-primary w-3' : 'bg-outline-variant'}`}></span>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile CTA Card (< md) */}
        <section className="block md:hidden px-md mt-16">
          <div className="bg-surface-container-high p-xl rounded-xl text-center flex flex-col gap-md border border-outline-variant/30 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface font-black">Ready to boost productivity?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Join over 10,000 teams using CollabHub to stay ahead.</p>
            <button 
              onClick={onSignUp}
              className="w-full py-md bg-primary text-white rounded-lg font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
            >
              Start Your Free Trial
            </button>
          </div>
        </section>

      </main>

      {/* 7. Footer (Responsive) */}
      {/* Footer Desktop (>= md) */}
      <footer className="hidden md:flex w-full px-xl py-lg justify-between items-center gap-md bg-surface-container-low border-t border-outline-variant flex-shrink-0">
        <div className="flex flex-col gap-xs items-center md:items-start select-none">
          <span className="font-headline-sm text-headline-sm font-black text-on-surface">CollabHub</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 CollabHub Inc. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-lg">
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Security</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Help Center</a>
        </div>
      </footer>

      {/* Footer Mobile (< md) */}
      <footer className="flex md:hidden w-full px-md py-lg flex-col items-center gap-md bg-surface-container-low border-t border-outline-variant flex-shrink-0">
        <div className="font-headline-sm text-headline-sm font-black text-on-surface">CollabHub</div>
        <div className="flex flex-wrap justify-center gap-md">
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Security</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Help Center</a>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center opacity-70">
          © 2026 CollabHub Inc. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
