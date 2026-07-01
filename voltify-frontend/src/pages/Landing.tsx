// src/pages/Landing.tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Play, Check, Globe, Share2, Award, Cpu, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [glowStyle, setGlowStyle] = useState({ left: '0px', top: '0px', opacity: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Mouse tracking radial glow for premium cyberpunk backdrop
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
    <div className="antialiased min-h-screen flex flex-col text-on-surface bg-background font-headline selection:bg-primary/30 selection:text-white">
      {/* Premium Header/Navigation */}
      <nav className="bg-surface/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center w-full px-6 md:px-10 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-cyan">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tighter text-neon-cyan">Voltify</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <a className="text-gray-300 hover:text-primary hover:bg-white/5 transition-all duration-200 px-4 py-2 rounded-xl text-sm font-medium" href="#features">Features</a>
            <a className="text-gray-300 hover:text-primary hover:bg-white/5 transition-all duration-200 px-4 py-2 rounded-xl text-sm font-medium" href="#how-it-works">How it Works</a>
            <a className="text-gray-300 hover:text-primary hover:bg-white/5 transition-all duration-200 px-4 py-2 rounded-xl text-sm font-medium" href="#preview">System Preview</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link className="hidden md:inline-block text-gray-400 hover:text-white transition-colors text-sm font-semibold tracking-wide uppercase px-4 py-2" to="/login">Sign In</Link>
            <button 
              onClick={handleGetStarted}
              className="bg-primary text-slate-950 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-cyan animate-pulse-glow"
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
          className="relative pt-16 pb-28 overflow-hidden grid-bg" 
          id="hero-section"
        >
          {/* Mouse-tracking Radial Glow */}
          <div 
            className="w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] absolute pointer-events-none -z-10 transition-opacity duration-300"
            style={{
              left: glowStyle.left,
              top: glowStyle.top,
              opacity: glowStyle.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Atmospheric ambient highlights */}
          <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[140px] -z-20 animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-purple-500/5 rounded-full blur-[160px] -z-20 animate-float" />

          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center space-x-2.5 bg-white/5 backdrop-blur-md rounded-full px-4.5 py-1.5 border border-white/10 hover:border-primary/45 transition-colors duration-300">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-ping" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest font-mono">Next-Gen Energy AI</span>
              </div>
              
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight">
                Master Your <br/>
                <span className="text-gradient">Energy Intelligence</span>
              </h1>
              
              <p className="text-gray-400 max-w-xl text-base md:text-lg leading-relaxed font-light">
                No smart meter installed? No hardware trackers needed. Transform raw monthly electricity bills into highly detailed, appliance-level telemetry insights and slash up to 30% of wastage.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5">
                <button 
                  onClick={handleGetStarted}
                  className="bg-primary text-slate-950 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-cyan-300 transition-all shadow-cyan flex items-center justify-center space-x-2.5 hover:scale-[1.02] transform duration-200"
                >
                  <span>Analyze My Bill</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <Link 
                  to="/login"
                  className="border border-white/10 text-white bg-white/5 backdrop-blur-md px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:border-primary/40 transition-all flex items-center justify-center space-x-2.5 hover:scale-[1.02] transform duration-200"
                >
                  <Play className="w-4 h-4 text-primary" />
                  <span>See Live Demo</span>
                </Link>
              </div>
            </div>

            {/* Right Graphics/Component-Rendered Mock Dashboard Column */}
            <div className="lg:col-span-5 relative z-10" id="preview">
              <div className="relative group">
                {/* Glow outline wrapper */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-45 transition duration-1000 group-hover:duration-200" />
                
                {/* Visual interface console */}
                <div className="relative glass-card rounded-2xl p-6 border border-white/10 shadow-2xl bg-surface-container-low/95">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">Active Telemetry Engine: On</span>
                    </div>
                    <div className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase font-semibold">LIVE REPORT</div>
                  </div>
                  
                  {/* Grid layout parameters */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-white/5">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-1 font-mono">Calibrated Load</span>
                      <div className="text-xl font-bold font-mono text-primary">17.4 kWh</div>
                      <div className="text-[9px] text-emerald-400 font-medium mt-1 font-mono">↓ 12% vs last month</div>
                    </div>
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-white/5">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-1 font-mono">Estimated Savings</span>
                      <div className="text-xl font-bold font-mono text-volt-pink">₹134.40</div>
                      <div className="text-[9px] text-volt-pink font-medium mt-1 font-mono">Active Streak: 7 Days</div>
                    </div>
                  </div>
                  
                  {/* Appliance runtimes list */}
                  <div className="bg-surface-container-lowest/80 rounded-xl p-4.5 border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-mono text-gray-300 font-bold tracking-wider uppercase">APPLIANCE TELEMETRY BREAKDOWN</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-cyan" />
                          Air Conditioner (BEE 24°C)
                        </span>
                        <span className="font-mono text-gray-400 text-xs">32%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: '32%' }} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-300 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                          Refrigerator (WHO 4°C)
                        </span>
                        <span className="font-mono text-gray-400 text-xs">18%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Prop Section */}
        <section className="py-24 bg-surface-container-lowest/40 relative border-t border-white/5" id="features">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                Your Monthly Bill, <span className="text-gradient font-black">Decoded</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
                Advanced machine learning models perform disaggregation mathematical modeling on basic monthly power statistics to give you hardware-free appliance level telemetry.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-card rounded-2xl p-8 glow-hover transition-all duration-300 group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/40 transition-colors duration-300">
                    <Cpu className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-3">AI Estimation Engine</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                    Highly optimized calculations mapping monthly parameters to hourly appliance disaggregation weights.
                  </p>
                </div>
                {/* High tech load index bar visual */}
                <div className="h-20 w-full flex items-end space-x-2 border-b border-white/5 pb-2">
                  <div className="w-1/5 bg-primary/20 hover:bg-primary/40 rounded-t-md h-[30%] transition-all duration-300" />
                  <div className="w-1/5 bg-primary/30 hover:bg-primary/50 rounded-t-md h-[55%] transition-all duration-300" />
                  <div className="w-1/5 bg-primary rounded-t-md h-[95%] shadow-cyan transition-all duration-300" />
                  <div className="w-1/5 bg-primary/55 hover:bg-primary/75 rounded-t-md h-[75%] transition-all duration-300" />
                  <div className="w-1/5 bg-primary/25 hover:bg-primary/45 rounded-t-md h-[45%] transition-all duration-300" />
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="glass-card rounded-2xl p-8 glow-hover transition-all duration-300 group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-volt-pink/40 transition-colors duration-300">
                    <Award className="w-5 h-5 text-volt-pink" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-3">Streak & Coins Rewards</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                    Gamify your household energy consumption. Stay regular, achieve goals, and earn coins redeemable for premium rewards.
                  </p>
                </div>
                <div className="bg-surface/50 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">PROJECTED MULTIPLIER</div>
                    <div className="font-mono font-bold text-lg text-white">1.15x Telemetry</div>
                  </div>
                  <span className="text-[10px] font-bold text-volt-pink bg-volt-pink/15 px-2.5 py-1 rounded-full uppercase">Active</span>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="glass-card rounded-2xl p-8 glow-hover transition-all duration-300 group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-tertiary-fixed-dim/40 transition-colors duration-300">
                    <ShieldCheck className="w-5 h-5 text-tertiary-fixed-dim" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mb-3">Comfort-Safe Target Calibration</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light">
                    Configure thresholds recommended by organizations like BEE and WHO to maximize savings while protecting home safety.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5 bg-surface/50 p-2 rounded-lg border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-mono text-[11px] text-gray-300">AC standard calibrated to 24°C</span>
                  </div>
                  <div className="flex items-center space-x-2.5 bg-surface/50 p-2 rounded-lg border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[11px] text-gray-300">WHO safe cold temp: 4°C active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 relative border-t border-white/5" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-20">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                Savings Process in <span className="text-gradient font-black">3 Steps</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {/* Central connection timeline path (desktop) */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-white/5 z-0" />
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/50 group-hover:scale-[1.04] transition-all duration-300 shadow-md">
                  <Cpu className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors duration-300" />
                </div>
                <div className="bg-primary/10 text-primary font-bold text-[9px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest font-mono border border-primary/20">
                  Step 01
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">Create Account</h3>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed font-light">
                  Instantly set up your dashboard profile. Customize basic configurations based on your active state and energy provider rules.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/50 group-hover:scale-[1.04] transition-all duration-300 shadow-md">
                  <Cpu className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors duration-300" />
                </div>
                <div className="bg-primary/10 text-primary font-bold text-[9px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest font-mono border border-primary/20">
                  Step 02
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">Calibrate Billing parameters</h3>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed font-light">
                  Input basic telemetry limits or feed manually from your last electricity statement to boot calculations.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/50 group-hover:scale-[1.04] transition-all duration-300 shadow-lg shadow-cyan/10">
                  <Zap className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="bg-primary text-slate-950 font-bold text-[9px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest font-mono">
                  Step 03
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">Optimize & Accumulate</h3>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed font-light">
                  Explore active disaggregation metrics, tune sliders to achieve comfort objectives, and harvest daily coin benefits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="py-24 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white">
              Ready to take control?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base font-light">
              Join thousands of smart households optimizing runtime indexes, saving on utility bills, and competing on global DISCOM ranks.
            </p>
            <div className="pt-4">
              <button 
                onClick={handleGetStarted}
                className="bg-primary text-slate-950 px-10 py-4.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-cyan-300 transition-all shadow-cyan hover:scale-[1.04] transform duration-300 animate-pulse-glow"
              >
                Start Saving Today
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Organized Footer */}
      <footer className="bg-surface-container-lowest text-gray-500 pt-16 pb-10 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-xl text-white tracking-tight">Voltify</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Supercharging homes with hardware-free, disaggregated electrical power estimations and rewarding conservation efforts.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Product</h4>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#features">Features</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#how-it-works">How it Works</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#preview">System Preview</a>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Telemetry</h4>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">DISCOM Rates</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">BEE Standards</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">WHO Comfort</a>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Company</h4>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">About Us</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">Blog Log</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">Security Specs</a>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Support</h4>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">User Support</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">API Telemetry</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-light" href="#">Contact Team</a>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-4 mt-12 pt-8 border-t border-white/5 text-center md:text-left text-gray-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-light">© 2026 Voltify Energy Intelligence Systems. All rights reserved.</span>
            <div className="flex space-x-6 text-gray-400">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
