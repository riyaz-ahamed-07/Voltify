// src/pages/Landing.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Play, Check, Globe, Share2, Award, Cpu, ShieldCheck, UserCheck, UploadCloud, TrendingDown } from 'lucide-react';
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
    <div className="antialiased h-dvh flex flex-col text-on-surface bg-slate-950 font-headline selection:bg-primary/20 selection:text-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/[0.06] shadow-sm">
        <div className="flex justify-between items-center w-full px-6 md:px-10 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.01]">
            <img src="/logo.gif" alt="Voltify Logo" className="size-10 object-contain" />
            <span className="font-display font-bold text-xl tracking-tight text-white">Voltify</span>
          </Link>
          
          {/* Removed features links as requested */}
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link className="hidden md:inline-block text-gray-400 hover:text-white transition-colors text-sm font-semibold tracking-wide px-4 py-2" to="/dashboard">Dashboard</Link>
            ) : (
              <Link className="hidden md:inline-block text-gray-400 hover:text-white transition-colors text-sm font-semibold tracking-wide px-4 py-2" to="/login">Sign In</Link>
            )}
            <button 
              onClick={handleGetStarted}
              className="bg-primary text-slate-950 px-6 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all"
            >
              {isAuthenticated ? 'Go to App' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* Snap scroll container — sits below the sticky nav */}
      <main className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {/* ① Hero Section */}
        <section
          className="relative h-[calc(100vh-73px)] overflow-y-auto snap-start snap-always flex flex-col justify-center bg-slate-950"
          id="hero-section"
        >
          {/* Atmospheric ambient highlights */}
          <div className="absolute top-1/4 left-1/3 size-[350px] bg-primary/5 rounded-full blur-[140px] -z-20" />
          <div className="absolute bottom-1/4 right-1/3 size-[450px] bg-sky-500/5 rounded-full blur-[160px] -z-20" />

          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col gap-8 text-left">
              <div className="inline-flex w-fit items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
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
                  to={isAuthenticated ? '/dashboard' : '/login'}
                  className="border border-white/10 text-white bg-white/5 backdrop-blur-md px-8 py-4 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] transform duration-150"
                >
                  <Play className="size-4 text-primary" />
                  <span>{isAuthenticated ? 'Go to App' : 'View Live Demo'}</span>
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
                    <h4 className="text-[10px] font-mono text-gray-300 font-semibold tracking-wider uppercase">Appliance Load Allocation</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-355 flex items-center gap-2">
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
                        <span className="text-gray-355 flex items-center gap-2">
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

        {/* ② The 3 Infrastructure Tiers Section */}
        <section className="h-[calc(100vh-73px)] overflow-y-auto snap-start snap-always flex flex-col justify-center bg-surface-container-lowest/40 relative border-t border-white/5" id="features">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-10 space-y-2">
              <h2 className="font-display font-semibold text-3xl text-white">
                Three Tiers of <span className="text-gradient font-semibold">Energy Inclusion</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-xs sm:text-sm font-light leading-relaxed">
                Voltify works for every household in India, completely independent of your electrical infrastructure or income level.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tier 1 */}
              <div className="relative rounded-2xl p-6 border border-white/[0.06] bg-slate-900/60 backdrop-blur-md transition-all duration-300 group flex flex-col justify-between hover:border-white/12">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">TIER 1 (80% OF INDIA)</span>
                    <span className="text-[9px] text-gray-500 font-mono">Normal Meter</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">Manual Bill Decoupler</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 font-normal">
                    OCR statement ingestion (Tesseract) + basic appliance settings. Calculates a calibrated daily baseline estimate using regional weather indices.
                  </p>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-3.5 border border-white/[0.04] space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>Calibration Factor:</span>
                    <span className="text-white">Active</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>Disaggregation:</span>
                    <span className="text-primary font-bold">Rule-based Math</span>
                  </div>
                </div>
              </div>
              
              {/* Tier 2 */}
              <div className="relative rounded-2xl p-6 border border-white/[0.06] bg-slate-900/60 backdrop-blur-md transition-all duration-300 group flex flex-col justify-between hover:border-white/12">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-volt-pink bg-volt-pink/10 px-2 py-0.5 rounded border border-volt-pink/20 font-bold">TIER 2 (SMART METERS)</span>
                    <span className="text-[9px] text-gray-500 font-mono">DISCOM Connected</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">Automated Ingest Pipeline</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 font-normal">
                    Pulls hourly total household metrics directly from DISCOM Open APIs (OAuth2). Employs advanced LSTM/GRU logic to read appliance fingerprints.
                  </p>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-3.5 border border-white/[0.04] space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>Ingestion Interval:</span>
                    <span className="text-white">Hourly / 15-Min</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>Disaggregation:</span>
                    <span className="text-volt-pink font-bold">LSTM AI Models</span>
                  </div>
                </div>
              </div>
              
              {/* Tier 3 */}
              <div className="relative rounded-2xl p-6 border border-white/[0.06] bg-slate-900/60 backdrop-blur-md transition-all duration-300 group flex flex-col justify-between hover:border-white/12">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">TIER 3 (SMART PLUGS)</span>
                    <span className="text-[9px] text-gray-500 font-mono">IoT Connected</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">Per-Appliance Monitoring</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 font-normal">
                    Plugs directly into smart home APIs (Tuya IoT Cloud, Tapo SDK). Obtains exact real-time wattage reports for high-drain hardware with zero guesses.
                  </p>
                </div>
                <div className="bg-slate-950/40 rounded-xl p-3.5 border border-white/[0.04] space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>Refresh Rate:</span>
                    <span className="text-white">Real-Time (WebSocket)</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>Disaggregation:</span>
                    <span className="text-emerald-400 font-bold">Direct Readings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ③ The 4 Intelligence Layers Section */}
        <section className="h-[calc(100vh-73px)] overflow-y-auto snap-start snap-always flex flex-col justify-center relative border-t border-white/[0.06] bg-slate-950" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-10 space-y-2">
              <h2 className="font-display font-semibold text-3xl text-white">
                The 4 Architecture <span className="text-gradient">Layers</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-xs sm:text-sm font-light leading-relaxed">
                Voltify's core functionality is organized into four logical stacks to provide stability and explainability.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Layer 1 */}
              <div className="bg-slate-900/40 border border-white/[0.05] p-5 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="text-[10px] font-mono text-primary bg-primary/10 w-fit px-2 py-0.5 rounded border border-primary/25 mb-3 font-bold">01 / FOUNDATION</div>
                  <h3 className="font-display font-semibold text-base text-white mb-2">Ingestion & Norms</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    Multer ingestion pipelines, Tesseract OCR parsers, and state-specific TNEB tariff slab configs to standardize all inputs.
                  </p>
                </div>
              </div>
              
              {/* Layer 2 */}
              <div className="bg-slate-900/40 border border-white/[0.05] p-5 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 w-fit px-2 py-0.5 rounded border border-cyan-500/25 mb-3 font-bold">02 / INTELLIGENCE</div>
                  <h3 className="font-display font-semibold text-base text-white mb-2">Predictive Models</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    ARIMA (24-48 hr) and Facebook Prophet (monthly) models forecast bills, while Isolation Forest detects active load anomalies.
                  </p>
                </div>
              </div>
              
              {/* Layer 3 */}
              <div className="bg-slate-900/40 border border-white/[0.05] p-5 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="text-[10px] font-mono text-volt-pink bg-volt-pink/10 w-fit px-2 py-0.5 rounded border border-volt-pink/25 mb-3 font-bold">03 / ENGAGEMENT</div>
                  <h3 className="font-display font-semibold text-base text-white mb-2">AI Memory & Play</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    VoltBuddy chatbot (powered by Cognee), segmented leaderboards, streaks, multipliers, and adaptive weekly challenges.
                  </p>
                </div>
              </div>
              
              {/* Layer 4 */}
              <div className="bg-slate-900/40 border border-white/[0.05] p-5 rounded-xl flex flex-col justify-between group">
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 w-fit px-2 py-0.5 rounded border border-emerald-500/25 mb-3 font-bold">04 / SAFETY & TRUST</div>
                  <h3 className="font-display font-semibold text-base text-white mb-2">Comfort-Safe Savings</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4">
                    CSS tradeoffs show exact comfort-to-savings ratios. Hardcoded guardrails enforce BEE/WHO thresholds (AC &ge; 24°C, Fridge &ge; 4°C).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 New Cognee Memory Engine Highlight Section */}
        <section className="h-[calc(100vh-73px)] overflow-y-auto snap-start snap-always flex flex-col justify-center bg-slate-950/60 relative border-t border-white/5" id="cognee-engine">
          <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Description Column */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 rounded-full px-4 py-1.5 border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Cognitive Memory Engine</span>
              </div>
              <h2 className="font-display font-semibold text-3xl sm:text-4xl text-white leading-tight">
                Self-Improving Memory Layer <br/>
                <span className="text-gradient">Powered by Cognee</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Voltify integrates deeply with Cognee's hybrid graph-vector memory layer. Every user conversation, daily check-in logs, and appliance loads are structured into an ontological knowledge graph unique to their home ID. Volt does not forget what was agreed upon in the last session.
              </p>
              
              {/* API Lifecycle Details */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-900/60 border border-white/[0.04] rounded-xl font-mono">
                  <div className="text-primary text-xs font-bold mb-1">remember()</div>
                  <div className="text-[10px] text-gray-500 leading-normal">Ingests raw text and files into user-specific graph nodes.</div>
                </div>
                <div className="p-4 bg-slate-900/60 border border-white/[0.04] rounded-xl font-mono">
                  <div className="text-cyan-400 text-xs font-bold mb-1">recall()</div>
                  <div className="text-[10px] text-gray-500 leading-normal">Retrieves deep relationships using semantic similarity checks.</div>
                </div>
                <div className="p-4 bg-slate-900/60 border border-white/[0.04] rounded-xl font-mono">
                  <div className="text-volt-pink text-xs font-bold mb-1">improve()</div>
                  <div className="text-[10px] text-gray-500 leading-normal">Consolidates short-term sessions into long-term habits.</div>
                </div>
                <div className="p-4 bg-slate-900/60 border border-white/[0.04] rounded-xl font-mono">
                  <div className="text-white text-xs font-bold mb-1">forget()</div>
                  <div className="text-[10px] text-gray-500 leading-normal">Surgically wipes dataset context upon resetting memories.</div>
                </div>
              </div>
            </div>

            {/* Right Graph Simulation Graphic Column */}
            <div className="rounded-2xl border border-white/[0.06] p-6 bg-slate-900/40 backdrop-blur-sm relative overflow-hidden flex flex-col justify-center h-[340px]">
              <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="flex flex-col gap-4 relative z-10 text-left font-mono">
                <div className="text-[9px] text-gray-500 uppercase tracking-widest border-b border-white/[0.06] pb-2 font-bold mb-2">Cognee Knowledge Graph Visualizer</div>
                
                {/* Node 1 */}
                <div className="flex items-center gap-3 bg-[#111111] p-3 rounded-lg border border-white/[0.05] w-fit">
                  <span className="text-xs">👤</span>
                  <div>
                    <div className="text-[10px] font-bold text-white">User c077d2de</div>
                    <div className="text-[9px] text-gray-500">Node type: UserProfile</div>
                  </div>
                </div>
                {/* Connector Arrow */}
                <div className="h-6 w-0.5 bg-[#333333] ml-6 relative">
                  <span className="absolute bottom-0 -left-[3px] text-[8px] text-gray-600">▼</span>
                </div>
                
                {/* Node 2 */}
                <div className="flex items-center gap-3 bg-[#111111] p-3 rounded-lg border border-white/[0.05] w-fit ml-8">
                  <span className="text-xs">🎯</span>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400">Monthly target: ₹1,000</div>
                    <div className="text-[9px] text-gray-500">Relationship: SET_SAVINGS_TARGET</div>
                  </div>
                </div>
                {/* Connector Arrow */}
                <div className="h-6 w-0.5 bg-[#333333] ml-14 relative">
                  <span className="absolute bottom-0 -left-[3px] text-[8px] text-gray-600">▼</span>
                </div>
                
                {/* Node 3 */}
                <div className="flex items-center gap-3 bg-[#111111] p-3 rounded-lg border border-white/[0.05] w-fit ml-16">
                  <span className="text-xs">❄️</span>
                  <div>
                    <div className="text-[10px] font-bold text-cyan-400">AC Temp Preference: 23°C</div>
                    <div className="text-[9px] text-gray-500">Relationship: OPTIMIZED_BY_COACH</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ④ CTA + Footer snap section */}
        <section className="h-[calc(100vh-73px)] overflow-y-auto snap-start snap-always flex flex-col relative border-t border-white/[0.06]">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          {/* CTA — grows to fill the space above the footer */}
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
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
          </div>

          {/* Footer — pinned to the bottom of the last snap section */}
          <footer className="bg-slate-950 text-gray-500 pt-10 pb-8 border-t border-white/[0.06] relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-10 max-w-7xl mx-auto">
              <div className="col-span-1 space-y-3">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.gif" alt="Voltify Logo" className="size-8 object-contain" />
                  <span className="font-display font-bold text-lg text-white tracking-tight">Voltify</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed font-normal">
                  Smart, hardware-free electricity disaggregation for residential efficiency.
                </p>
              </div>

              <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-[10px] uppercase tracking-widest text-white mb-1 font-mono">Product</h4>
                  <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" href="#features">Features</a>
                  <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" href="#how-it-works">How it Works</a>
                  <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" href="#preview">System Preview</a>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-[10px] uppercase tracking-widest text-white mb-1 font-mono">Guidelines</h4>
                  <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" href="https://www.tristarenergy.in/blog/tangedco-electricity-tariff-rates-2026" target="_blank" rel="noopener noreferrer">DISCOM Rates</a>
                  <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" href="https://beeindia.in/standards-labeling/" target="_blank" rel="noopener noreferrer">BEE Standards</a>
                  <a className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" href="https://www.who.int/publications/i/item/9789241550376" target="_blank" rel="noopener noreferrer">WHO Comfort</a>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-[10px] uppercase tracking-widest text-white mb-1 font-mono">Company</h4>
                  <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" to="/info/about">About Us</Link>
                  <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" to="/info/blog">Blog</Link>
                  <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" to="/info/security">Security Specs</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-[10px] uppercase tracking-widest text-white mb-1 font-mono">Support</h4>
                  <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" to="/info/support">User Support</Link>
                  <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" to="/info/api">API Details</Link>
                  <Link className="text-gray-400 hover:text-primary transition-colors text-xs font-normal font-sans" to="/info/contact">Contact Team</Link>
                </div>
              </div>

              <div className="col-span-1 md:col-span-4 pt-5 border-t border-white/[0.06] text-center md:text-left text-gray-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
                <span className="font-normal font-sans">&copy; 2026 Voltify Energy Systems. All rights reserved.</span>
                <div className="flex gap-6 text-gray-400">
                  <Link className="hover:text-primary transition-colors font-sans" to="/info/privacy">Privacy Policy</Link>
                  <Link className="hover:text-primary transition-colors font-sans" to="/info/terms">Terms of Use</Link>
                </div>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
