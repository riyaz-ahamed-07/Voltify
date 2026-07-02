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
          className="relative pt-20 pb-32 overflow-hidden bg-slate-950" 
          id="hero-section"
        >
          {/* Atmospheric ambient highlights */}
          <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[140px] -z-20" />
          <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-sky-500/5 rounded-full blur-[160px] -z-20" />

          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest font-mono">Hardware-Free Analytics</span>
              </div>
              
              <h1 className="font-display font-semibold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight">
                Understand your energy. <br/>
                <span className="text-gradient">Lower your bills.</span>
              </h1>
              
              <p className="text-gray-450 max-w-xl text-base md:text-lg leading-relaxed font-normal">
                Voltify automatically estimates your appliance-level energy consumption from your monthly utility statements. Track efficiency targets, set savings goals, and reduce waste without installing expensive monitoring hardware.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleGetStarted}
                  className="bg-primary text-slate-950 px-8 py-4 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] transform duration-150"
                >
                  <span>Analyze Bill</span>
                  <ArrowRight className="size-4" />
                </button>
                
                <Link 
                  to="/login"
                  className="border border-white/10 text-white bg-white/5 backdrop-blur-md px-8 py-4 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] transform duration-150"
                >
                  <Play className="size-4 text-primary" />
                  <span>View Live Demo</span>
                </Link>
              </div>
            </div>

            {/* Right Graphics/Component-Rendered Mock Dashboard Column */}
            <div className="lg:col-span-5 relative z-10" id="preview">
              <div className="relative group">
                {/* Visual interface console */}
                <div className="relative rounded-2xl p-6 border border-white/[0.06] shadow-xl bg-slate-900/60 backdrop-blur-md">
                  <div className="flex justify-between items-center pb-4 border-b border-white/[0.06] mb-6">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">Energy Disaggregation active</span>
                    </div>
                    <div className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase font-semibold">PREVIEW</div>
                  </div>
                  
                  {/* Grid layout parameters */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-white/[0.04]">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-1 font-mono">Current Load</span>
                      <div className="text-xl font-bold font-mono text-primary">17.4 kWh</div>
                      <div className="text-[9px] text-emerald-400 font-medium mt-1 font-mono">↓ 12% vs last month</div>
                    </div>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-white/[0.04]">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider block mb-1 font-mono">Estimated Savings</span>
                      <div className="text-xl font-bold font-mono text-volt-pink">₹134.40</div>
                      <div className="text-[9px] text-volt-pink font-medium mt-1 font-mono">Weekly streak: active</div>
                    </div>
                  </div>
                  
                  {/* Appliance runtimes list */}
                  <div className="bg-slate-950/40 rounded-xl p-4.5 border border-white/[0.04] space-y-4">
                    <h4 className="text-[10px] font-mono text-gray-300 font-bold tracking-wider uppercase">Appliance Load Allocation</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-350 flex items-center gap-2">
                          <span className="size-2 rounded-full bg-cyan-400" />
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
                        <span className="text-gray-350 flex items-center gap-2">
                          <span className="size-2 rounded-full bg-indigo-400" />
                          Refrigerator (WHO 4°C)
                        </span>
                        <span className="font-mono text-gray-400 text-xs">18%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: '18%' }} />
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
                <div className="h-20 w-full flex items-end space-x-2 border-b border-white/[0.06] pb-2">
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
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Product</h4>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" href="#features">Features</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" href="#how-it-works">How it Works</a>
              <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" href="#preview">System Preview</a>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Guidelines</h4>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">DISCOM Rates</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">BEE Standards</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">WHO Comfort</Link>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Company</h4>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">About Us</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">Blog</Link>
              <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal" to="/">Security Specs</Link>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="font-bold text-[10px] uppercase tracking-widest text-white mb-2 font-mono">Support</h4>
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
