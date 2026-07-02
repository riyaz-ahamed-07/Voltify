// src/pages/Landing.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Play, Check, Globe, Share2, Award, Cpu, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="antialiased min-h-screen flex flex-col text-on-surface bg-slate-950 font-headline selection:bg-primary/20 selection:text-white">
      {/* Navigation Bar */}
      <nav className="bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/[0.06] shadow-sm">
        <div className="flex justify-between items-center w-full px-6 md:px-10 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-[1.01]">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="size-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">Voltify</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            <a className="text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 px-4 py-2 rounded-xl text-sm font-medium" href="#features">Features</a>
            <a className="text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 px-4 py-2 rounded-xl text-sm font-medium" href="#how-it-works">How it Works</a>
            <a className="text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 px-4 py-2 rounded-xl text-sm font-medium" href="#preview">System Preview</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link className="hidden md:inline-block text-gray-400 hover:text-white transition-colors text-sm font-semibold tracking-wide px-4 py-2" to="/login">Sign In</Link>
            <button 
              onClick={handleGetStarted}
              className="bg-primary text-slate-950 px-6 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="relative pt-32 pb-48 overflow-hidden bg-slate-950 min-h-screen flex items-center justify-center" 
          id="hero-section"
        >
          {/* Atmospheric ambient highlights */}
          <div className="absolute top-1/4 left-1/3 size-[350px] bg-primary/5 rounded-full blur-[140px] -z-20" />
          <div className="absolute bottom-1/4 right-1/3 size-[450px] bg-sky-500/5 rounded-full blur-[160px] -z-20" />

          {/* Background Text (Z-0) */}
          <div className="absolute top-[15%] md:top-[12%] left-1/2 -translate-x-1/2 w-full text-center z-0 px-4 pointer-events-none">
            <h1 className="font-display font-bold text-[3.5rem] sm:text-7xl md:text-[8rem] lg:text-[11rem] text-white/90 tracking-tighter leading-[0.9]">
              Voltify <br />
              <span className="text-primary/90 text-transparent bg-clip-text bg-gradient-to-b from-primary to-emerald-600">Energy.</span>
            </h1>
          </div>

          {/* Center Image and Button (Z-10) */}
          <div className="relative z-10 mt-24 md:mt-40 flex flex-col items-center">
            {/* Robot Image */}
            <div className="relative group">
              <img 
                src="/robot.png" 
                alt="AI Energy Robot" 
                className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl object-contain drop-shadow-[0_0_80px_rgba(16,185,129,0.3)] transition-transform duration-700 group-hover:scale-[1.02]"
                onError={(e) => {
                  // Fallback transparent robot image if /robot.png is not found
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3';
                }}
              />
              
              {/* Button at the bottom of the image */}
              <div className="absolute -bottom-6 md:-bottom-10 left-1/2 -translate-x-1/2 z-20 w-max">
                <button 
                  onClick={handleGetStarted}
                  className="bg-primary text-slate-950 px-8 py-4 md:px-12 md:py-5 rounded-full text-sm md:text-base font-bold uppercase tracking-widest hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all flex items-center justify-center gap-3 hover:scale-105 transform duration-300 ring-4 ring-slate-950"
                >
                  <span>Get Instant Pricing</span>
                </button>
              </div>

              {/* Floating feature badges (similar to reference UI) */}
              <div className="absolute top-1/4 -left-8 md:-left-24 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 shadow-xl animate-float">
                <div className="p-1.5 md:p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Zap className="size-4 md:size-5" /></div>
                <div className="hidden md:block">
                  <p className="text-lg md:text-xl font-bold text-white font-mono">1.35 <span className="text-xs text-gray-400">kWh</span></p>
                  <p className="text-xs text-blue-400">₹ 10.15</p>
                </div>
                <div className="md:hidden text-xs font-bold text-white">Save Energy</div>
              </div>

              <div className="absolute top-1/3 -right-8 md:-right-24 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 shadow-xl animate-float-delayed">
                <div className="p-1.5 md:p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Cpu className="size-4 md:size-5" /></div>
                <div className="hidden md:block">
                  <p className="text-lg md:text-xl font-bold text-white font-mono">2.45 <span className="text-xs text-gray-400">kWh</span></p>
                  <p className="text-xs text-emerald-400">₹ 18.20</p>
                </div>
                <div className="md:hidden text-xs font-bold text-white">Smart AC</div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Prop Section */}
        <section className="py-24 bg-surface-container-lowest/40 relative border-t border-white/5" id="features">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-display font-semibold text-3xl md:text-4xl text-white">
                Your Monthly Bill, <span className="text-gradient font-semibold">Decoded</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
                Voltify disaggregates your monthly utility parameters against regional baseline estimates, yielding an accurate approximation of your household's heaviest consumption points.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-card rounded-2xl p-8 transition-all duration-300 group flex flex-col justify-between">
                <div>
                  <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors duration-200">
                    <Cpu className="size-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">Appliance Disaggregation</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">
                    Our mathematical model breaks down your billing rate and total consumption to isolate high-drain appliances.
                  </p>
                </div>
                {/* Clean data load graphic */}
                <div className="h-20 w-full flex items-end gap-2 border-b border-white/[0.06] pb-2">
                  <div className="w-1/5 bg-primary/20 hover:bg-primary/30 rounded-t-lg h-[30%] transition-all duration-200" />
                  <div className="w-1/5 bg-primary/25 hover:bg-primary/35 rounded-t-lg h-[55%] transition-all duration-200" />
                  <div className="w-1/5 bg-primary rounded-t-lg h-[95%] transition-all duration-200" />
                  <div className="w-1/5 bg-primary/50 hover:bg-primary/60 rounded-t-lg h-[75%] transition-all duration-200" />
                  <div className="w-1/5 bg-primary/20 hover:bg-primary/30 rounded-t-lg h-[45%] transition-all duration-200" />
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="relative rounded-2xl p-8 border border-white/[0.06] bg-slate-900/60 backdrop-blur-md transition-all duration-300 group flex flex-col justify-between hover:border-white/12">
                <div>
                  <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-volt-pink/30 transition-colors duration-200">
                    <Award className="size-5 text-volt-pink" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">Gamified Conservation</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">
                    Earn points by keeping your consumption below targeted limits. Challenge yourself with saving tasks and compete locally.
                  </p>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-4 border border-white/[0.04] flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">Target multiplier</div>
                    <div className="font-mono font-bold text-base text-white">1.15x Multiplier</div>
                  </div>
                  <span className="text-[10px] font-semibold text-volt-pink bg-volt-pink/10 px-2.5 py-1 rounded-full uppercase">Active</span>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="relative rounded-2xl p-8 border border-white/[0.06] bg-slate-900/60 backdrop-blur-md transition-all duration-300 group flex flex-col justify-between hover:border-white/12">
                <div>
                  <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors duration-200">
                    <ShieldCheck className="size-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">Efficiency Standards</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 font-normal">
                    Establish operating baselines aligned directly with BEE and WHO guidelines to balance safety and consumption.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 bg-slate-950/40 p-2 rounded-lg border border-white/[0.04]">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[11px] text-gray-300">AC calibrated to BEE 24°C</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-950/40 p-2 rounded-lg border border-white/[0.04]">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[11px] text-gray-305">Refrigerator calibrated to 4°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 relative border-t border-white/[0.06]" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-20">
              <h2 className="font-display font-semibold text-3xl md:text-4xl text-white">
                How Voltify <span className="text-gradient">Works</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {/* Central connection timeline path (desktop) */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-white/[0.06] z-0" />
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="size-20 rounded-2xl bg-slate-900 border border-white/[0.06] flex items-center justify-center mb-6 group-hover:border-primary/40 group-hover:scale-[1.02] transition-all duration-300">
                  <Cpu className="size-8 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                </div>
                <div className="bg-primary/10 text-primary font-semibold text-[9px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest font-mono border border-primary/20">
                  Step 01
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">Set Up Profile</h3>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed font-normal">
                  Configure your dashboard parameters. Input your geographic region, power utility provider, and active billing rates.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="size-20 rounded-2xl bg-slate-900 border border-white/[0.06] flex items-center justify-center mb-6 group-hover:border-primary/40 group-hover:scale-[1.02] transition-all duration-300">
                  <Cpu className="size-8 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                </div>
                <div className="bg-primary/10 text-primary font-semibold text-[9px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest font-mono border border-primary/20">
                  Step 02
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">Upload Statements</h3>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed font-normal">
                  Simply provide your monthly statements or enter basic bill statistics manually to feed the disaggregation model.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="size-20 rounded-2xl bg-slate-900 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-[1.02] transition-all duration-300">
                  <Zap className="size-8 text-primary" />
                </div>
                <div className="bg-primary text-slate-950 font-semibold text-[9px] px-3 py-1 rounded-full mb-4 uppercase tracking-widest font-mono">
                  Step 03
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">Optimize Usage</h3>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed font-normal">
                  Explore disaggregated metrics, tune temperature controls to BEE guidelines, and save on electricity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="py-24 relative overflow-hidden border-t border-white/[0.06]">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
            <h2 className="font-display font-semibold text-3xl md:text-5xl text-white">
              Ready to take control?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base font-normal">
              Join thousands of energy-smart households managing their consumption, cutting costs, and earning efficiency credits.
            </p>
            <div className="pt-4">
              <button 
                onClick={handleGetStarted}
                className="bg-primary text-slate-950 px-10 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all hover:scale-[1.02] transform duration-150"
              >
                Start Saving Today
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Organized Footer */}
      <footer className="bg-slate-950 text-gray-500 pt-16 pb-10 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-primary" />
              <span className="font-display font-bold text-xl text-white tracking-tight">Voltify</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-normal">
              Providing smart, hardware-free electricity disaggregation models and supporting residential efficiency conservation.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Product</h4>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" href="#features">Features</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" href="#how-it-works">How it Works</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" href="#preview">System Preview</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Guidelines</h4>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">DISCOM Rates</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">BEE Standards</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">WHO Comfort</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Company</h4>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">About Us</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">Blog</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">Security Specs</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Support</h4>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">User Support</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">API Details</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">Contact Team</Link>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-4 mt-12 pt-8 border-t border-white/[0.06] text-center md:text-left text-gray-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-normal">© 2026 Voltify Energy Systems. All rights reserved.</span>
            <div className="flex gap-6 text-gray-400">
              <Link className="hover:text-primary transition-colors" to="/">Privacy Policy</Link>
              <Link className="hover:text-primary transition-colors" to="/">Terms of Use</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
