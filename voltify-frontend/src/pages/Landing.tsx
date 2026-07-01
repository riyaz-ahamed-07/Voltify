// src/pages/Landing.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Play, Check, Globe, Share2, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [glowStyle, setGlowStyle] = useState({ left: '0px', top: '0px', opacity: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Mouse tracking radial glow for cyberpunk effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGlowStyle({
      left: `${x}px`,
      top: `${y}px`,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setGlowStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="antialiased min-h-screen flex flex-col font-headline text-body-md text-on-surface bg-background">
      {/* TopNavBar */}
      <nav className="bg-surface/80 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 md:px-10 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary-container/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-container" />
            </div>
            <span className="font-display font-bold text-xl tracking-tighter text-primary">Voltify</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            <a className="text-primary font-bold border-b-2 border-primary pb-1 hover:bg-primary-container/10 transition-all duration-300 px-2 rounded" href="#features">Features</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors hover:bg-primary-container/10 transition-all duration-300 px-2 py-1 rounded" href="#how-it-works">How it Works</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors hover:bg-primary-container/10 transition-all duration-300 px-2 py-1 rounded" href="#intelligence">Intelligence</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link className="hidden md:block text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider" to="/login">Sign In</Link>
            <button 
              onClick={handleGetStarted}
              className="bg-primary-container text-on-primary-container px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container/90 transition-colors shadow-[0_0_15px_rgba(0,229,255,0.3)] animate-pulse-glow"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative pt-12 pb-24 overflow-hidden" 
          id="hero-section"
        >
          {/* Radial Glow Container */}
          <div 
            className="w-[450px] h-[450px] bg-primary-container/15 rounded-full blur-[100px] absolute pointer-events-none -z-10 transition-opacity duration-300"
            style={{
              left: glowStyle.left,
              top: glowStyle.top,
              opacity: glowStyle.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Background Static Glows */}
          <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-primary-container/10 rounded-full blur-[100px] -z-10 animate-float-slow" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-tertiary-container/10 rounded-full blur-[120px] -z-10 animate-float" />

          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-surface-container-high rounded-full px-4 py-1 border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-default">
                <Zap className="w-4 h-4 text-tertiary animate-pulse" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Next-Gen Energy AI</span>
              </div>
              
              <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-on-surface leading-tight tracking-tight">
                Master Your <br/>
                <span className="text-gradient">Energy Intelligence.</span>
              </h1>
              
              <p className="font-headline text-on-surface-variant max-w-lg text-base md:text-lg leading-relaxed">
                No smart meter? No problem. Transform your bills into actionable insights and save up to 30% on electricity with our predictive AI models.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={handleGetStarted}
                  className="bg-primary-container text-on-primary-container px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary-container/90 transition-all animate-pulse-glow flex items-center justify-center space-x-2"
                >
                  <span>Analyze My Bill</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link 
                  to="/login"
                  className="border border-outline-variant text-on-surface px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high hover:text-primary transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 text-primary" />
                  <span>See Demo Dashboard</span>
                </Link>
              </div>
            </div>

            <div className="relative z-10 mt-6 lg:mt-0">
              <div className="glass-card rounded-2xl p-1 animate-float-slow border-primary/20 max-w-xl mx-auto shadow-2xl relative">
                <img 
                  alt="Voltify Artificial Intelligence Telemetry Dashboard Mockup" 
                  className="w-full h-auto rounded-xl object-cover relative z-0" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsXQElOg2AjZfMmIOMQIDi4xziWYlKOSGcgJrN01SSMkB9blOvEUdBBEozz0-gT5Ki_23uvx0X_zK03O_2YRfLqjxCBKqL3FuXruRL33J07GaYezPkytlEAi92dpGDL5SGcpU5sBd91xSQRoO8_Gk-cSQP9TIBLzTmwiVdfJnhiHbnlsZ-wtylqqnWeLqtTmN92Js3uVWEUiQJAoXyR_W13yZxQLuUhm-t29gTNoVlzaR1XX1Jj2YU1uQEJHpg7Kbea0dFd3YF1Xh-"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Value Prop Section */}
        <section className="py-20 bg-surface-container-lowest relative" id="features">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-14 space-y-4">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface">Your Bill, <span className="text-gradient">Decoded.</span></h2>
              <p className="font-headline text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                We use advanced machine learning algorithms to disaggregate your monthly utility bill, providing appliance-level estimates without the need for expensive hardware monitors.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-card rounded-2xl p-8 glow-hover transition-all duration-300 group animate-float-slow">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-on-surface mb-3">AI Monitoring</h3>
                <p className="font-headline text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Visualize your energy distribution over time. Understand when you peak and what drives your costs.
                </p>
                {/* Abstract Bar Chart Graphics */}
                <div className="h-24 w-full flex items-end space-x-2 border-b border-outline-variant/30 pb-2">
                  <div className="w-1/5 bg-primary/20 hover:bg-primary/40 rounded-t-md h-1/3 transition-all duration-300" />
                  <div className="w-1/5 bg-primary/40 hover:bg-primary/60 rounded-t-md h-2/3 transition-all duration-300" />
                  <div className="w-1/5 bg-primary rounded-t-md h-full shadow-[0_0_10px_rgba(195,245,255,0.5)] transition-all duration-300 transform hover:-translate-y-1" />
                  <div className="w-1/5 bg-primary/60 hover:bg-primary/80 rounded-t-md h-4/5 transition-all duration-300" />
                  <div className="w-1/5 bg-primary/30 hover:bg-primary/50 rounded-t-md h-1/2 transition-all duration-300" />
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="glass-card rounded-2xl p-8 glow-hover transition-all duration-300 group animate-float">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center mb-6 group-hover:border-tertiary/50 transition-colors">
                  <Zap className="w-5 h-5 text-tertiary" />
                </div>
                <h3 className="font-display font-bold text-xl text-on-surface mb-3">Prediction & Forecasting</h3>
                <p className="font-headline text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Anticipate future bills based on weather forecasts, historical usage, and current rates.
                </p>
                <div className="bg-surface-container-highest rounded-lg p-4 border border-outline-variant/30 flex items-center justify-between hover:border-tertiary/30 transition-colors cursor-default">
                  <div>
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Next Month Est.</div>
                    <div className="font-display font-bold text-2xl text-on-surface">₹4,250</div>
                  </div>
                  <span className="text-[10px] font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded-full uppercase">15% SAVED</span>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="glass-card rounded-2xl p-8 glow-hover transition-all duration-300 group animate-float-delayed">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center mb-6 group-hover:border-primary-fixed-dim/50 transition-colors">
                  <Zap className="w-5 h-5 text-volt-pink animate-pulse" />
                </div>
                <h3 className="font-display font-bold text-xl text-on-surface mb-3">Actionable Recommendations</h3>
                <p className="font-headline text-sm text-on-surface-variant mb-6 leading-relaxed">
                  Get personalized advice on how to shift usage away from peak times and lower your carbon footprint.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 bg-surface-container/50 p-2 rounded border border-outline-variant/20 hover:bg-surface-container transition-colors cursor-default">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                    <span className="font-mono text-xs text-on-surface-variant">Run geyser off-peak (6–9 AM)</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-surface-container/50 p-2 rounded border border-outline-variant/20 hover:bg-surface-container transition-colors cursor-default">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-mono text-xs text-on-surface-variant">Set AC to optimal 24°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 relative" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface">Intelligence in <span className="text-gradient">3 Steps</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-outline-variant/30 z-0" />
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-6 border-2 border-outline-variant group-hover:border-primary group-hover:scale-105 transition-all duration-300">
                  <Zap className="w-8 h-8 text-on-surface group-hover:text-primary transition-colors" />
                </div>
                <div className="bg-primary/20 text-primary font-bold text-[10px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Step 01</div>
                <h3 className="font-display font-bold text-lg text-on-surface mb-2">Create Account</h3>
                <p className="font-headline text-xs text-on-surface-variant max-w-xs leading-relaxed">Securely sign up and connect your profile settings to DISCOM guidelines.</p>
              </div>
              
              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-6 border-2 border-outline-variant group-hover:border-primary group-hover:scale-105 transition-all duration-300">
                  <LayoutGrid className="w-8 h-8 text-on-surface group-hover:text-primary transition-colors" />
                </div>
                <div className="bg-primary/20 text-primary font-bold text-[10px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Step 02</div>
                <h3 className="font-display font-bold text-lg text-on-surface mb-2">Upload Data</h3>
                <p className="font-headline text-xs text-on-surface-variant max-w-xs leading-relaxed">Simply upload a PDF of your electricity bill or enter your basic billing parameters manually.</p>
              </div>
              
              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-6 border-2 border-outline-variant group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(0,229,255,0.2)] animate-pulse-glow">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div className="bg-primary-container text-on-primary-container font-bold text-[10px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Step 03</div>
                <h3 className="font-display font-bold text-lg text-on-surface mb-2">Get Insights</h3>
                <p className="font-headline text-xs text-on-surface-variant max-w-xs leading-relaxed">Instantly view your detailed electrical appliance breakdown and active saving advice.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden border-t border-outline-variant/30">
          <div className="absolute inset-0 bg-primary-container/5 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-on-surface mb-6">Ready to take control?</h2>
            <p className="font-headline text-on-surface-variant mb-8 text-base">Join thousands of users who are already optimizing their energy consumption.</p>
            <button 
              onClick={handleGetStarted}
              className="bg-primary-container text-on-primary-container px-10 py-4.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-primary-container/90 transition-all shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:scale-105 transform duration-300 animate-pulse-glow"
            >
              Start Saving Today
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest text-primary pt-16 pb-10 border-t border-outline-variant/20 opacity-90 hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="col-span-1 mb-8 md:mb-0">
            <div className="font-display font-bold text-2xl text-primary mb-4">Voltify</div>
            <p className="text-on-surface-variant text-sm leading-relaxed">Empowering homes with intelligent energy insights.</p>
          </div>
          
          <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-on-surface mb-2">Product</h4>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#features">Features</a>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">Pricing</a>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">API Docs</a>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-on-surface mb-2">Company</h4>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">About</a>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">Blog</a>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">Careers</a>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-on-surface mb-2">Legal</h4>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">Privacy Policy</a>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">Terms of Service</a>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-on-surface mb-2">Support</h4>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">Contact Support</a>
              <a className="text-on-surface-variant hover:text-tertiary transition-colors text-xs" href="#">Help Center</a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-4 mt-12 pt-8 border-t border-outline-variant/10 text-center md:text-left text-on-surface-variant text-xs flex flex-col md:flex-row justify-between items-center">
            <span>© 2026 Voltify Energy Intelligence. All rights reserved.</span>
            <div className="flex space-x-4 mt-4 md:mt-0 text-on-surface-variant">
              <a className="hover:text-primary transition-all duration-300 hover:-translate-y-0.5" href="#">
                <Globe className="w-4 h-4" />
              </a>
              <a className="hover:text-primary transition-all duration-300 hover:-translate-y-0.5" href="#">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
