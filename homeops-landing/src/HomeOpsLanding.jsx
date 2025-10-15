import React, { useState } from 'react';
import { Menu, X, ArrowRight, Brain, Users, Zap, LayoutDashboard, Sparkles, ShoppingCart, DollarSign, MessageSquare, Repeat, Check, Star } from 'lucide-react';

// HomeOps Logo Component
const HomeOpsLogo = ({ size = 48 }) => {
  const gradientId = `homeops-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="HomeOps agent logo">
      <defs>
        <linearGradient id={gradientId} x1="220" y1="300" x2="820" y2="880" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4C6FFF"/>
          <stop offset="100%" stopColor="#9C4DFF"/>
        </linearGradient>
      </defs>
      <path d="M256 520 L512 320 L768 520 V740 Q768 776 732 776 H292 Q256 776 256 740 Z" fill="none" stroke={`url(#${gradientId})`} strokeWidth="44" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M392 620 Q512 704 632 620" fill="none" stroke={`url(#${gradientId})`} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="420" y1="560" x2="470" y2="560" stroke={`url(#${gradientId})`} strokeWidth="28" strokeLinecap="round"/>
      <line x1="554" y1="560" x2="604" y2="560" stroke={`url(#${gradientId})`} strokeWidth="28" strokeLinecap="round"/>
      <path d="M256 600 Q216 616 200 648" fill="none" stroke={`url(#${gradientId})`} strokeWidth="32" strokeLinecap="round"/>
      <path d="M768 600 Q808 616 824 648" fill="none" stroke={`url(#${gradientId})`} strokeWidth="32" strokeLinecap="round"/>
      <path d="M188 650 q22 22 0 44 q-22 -22 0 -44 Z" fill="none" stroke={`url(#${gradientId})`} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M836 650 q22 22 0 44 q-22 -22 0 -44 Z" fill="none" stroke={`url(#${gradientId})`} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="430" y1="776" x2="430" y2="852" stroke={`url(#${gradientId})`} strokeWidth="32" strokeLinecap="round"/>
      <line x1="594" y1="776" x2="594" y2="852" stroke={`url(#${gradientId})`} strokeWidth="32" strokeLinecap="round"/>
      <line x1="388" y1="852" x2="472" y2="852" stroke={`url(#${gradientId})`} strokeWidth="20" strokeLinecap="round"/>
      <line x1="552" y1="852" x2="636" y2="852" stroke={`url(#${gradientId})`} strokeWidth="20" strokeLinecap="round"/>
    </svg>
  );
};

const HomeOpsLanding = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <HomeOpsLogo size={56} stroke="#2563eb" />
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                HomeOps
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition">How It Works</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">Pricing</a>
              <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg transition">
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6">
            <a href="#features" className="text-xl text-slate-600" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-xl text-slate-600" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" className="text-xl text-slate-600" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight px-4">
            Run your family like
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              the high-performer you are
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            HomeOps is your AI agent that reads your emails, schedules your calendar, and handles the invisible work of family coordination. Finally, an end to being the family project manager.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16 px-4">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-base sm:text-lg hover:shadow-2xl transition flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-white text-slate-700 rounded-full font-semibold text-base sm:text-lg border-2 border-slate-200 hover:border-slate-300 transition">
              Watch Demo
            </button>
          </div>

          {/* Product Screenshot Placeholder */}
          <div className="relative max-w-5xl mx-auto px-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"></div>
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-auto text-xs sm:text-sm text-slate-500 font-medium">HomeOps Dashboard</div>
              </div>
              
              {/* Iframe for screenshots */}
              <div className="w-full bg-gradient-to-br from-slate-100 to-slate-50" style={{ height: '400px', minHeight: '300px' }}>
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center">
                    <HomeOpsLogo size={100} stroke="#94a3b8" />
                    <p className="text-slate-400 mt-6 text-base sm:text-lg">Product screenshots coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-4 sm:px-6 bg-white/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-6 sm:mb-8">Trusted by high-performing families</p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12 opacity-60">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-400">FAMILY+</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-400">MODERN PARENTS</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-400">BALANCED</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-400">THRIVING</div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4">
              Stop juggling.
              <br />
              Start <span className="text-blue-600">orchestrating</span>.
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              The mental load isn't just about remembering tasks. It's about processing endless emails, coordinating schedules, and ensuring nothing falls through the cracks. Let AI handle it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 px-4">
            {[
              {
                icon: Brain,
                title: "Email Intelligence Agent",
                description: "AI automatically reads and summarizes important emails from schools, sports teams, doctors, and activities - surfacing only what matters."
              },
              {
                icon: Users,
                title: "Smart Calendar Scheduling",
                description: "Your agent intelligently schedules events, appointments, and activities directly on your family calendar without you lifting a finger."
              },
              {
                icon: Zap,
                title: "Mental Load Elimination",
                description: "Stop being the family project manager. Our AI handles the invisible work of coordination, reminders, and follow-ups."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 hover:shadow-xl transition">
                <feature.icon size={48} className="text-blue-600 mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 px-4">
            Everything you need.
            <br />
            <span className="text-slate-500">Nothing you don't.</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 px-4">
            {[
              {
                icon: MessageSquare,
                title: "Inbox Intelligence",
                description: "AI reads through all your emails and extracts important information from schools, sports, activities, and appointments.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Sparkles,
                title: "Smart Email Summaries",
                description: "Get daily digests of what actually matters - permission slips, schedule changes, important announcements.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: LayoutDashboard,
                title: "Automatic Calendar Scheduling",
                description: "Your AI agent automatically adds events, games, practices, and appointments to your family calendar.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Brain,
                title: "Mental Load Assistant",
                description: "AI handles follow-ups, reminders, and coordination so you can stop being the family project manager.",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: Zap,
                title: "Proactive Notifications",
                description: "Get alerts about upcoming deadlines, required actions, and important family events before they slip through the cracks.",
                gradient: "from-indigo-500 to-blue-500"
              },
              {
                icon: Repeat,
                title: "Smart Prioritization",
                description: "AI learns what's truly urgent vs. routine, ensuring you focus on what actually needs your attention.",
                gradient: "from-violet-500 to-purple-500"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 hover:shadow-xl transition group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition flex items-center justify-center`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              Start free and scale as your family grows. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 px-4 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200 hover:border-slate-300 transition relative">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter</h3>
                <div className="mb-4">
                  <span className="text-4xl sm:text-5xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-600 ml-2">forever</span>
                </div>
                <p className="text-slate-600">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">50 AI chats per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Basic email intelligence</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Calendar scheduling</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Email summaries</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Up to 4 family members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Email support</span>
                </li>
              </ul>
              
              <button className="w-full px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition">
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-blue-500 hover:border-blue-600 transition relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star size={16} />
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-6 mt-4">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl sm:text-5xl font-bold text-slate-900">$15</span>
                  <span className="text-slate-600 ml-2">/month</span>
                </div>
                <p className="text-slate-600">For growing families</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">500 AI chats per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Advanced email intelligence</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Smart calendar automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Proactive notifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Mental load insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Up to 6 family members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Mobile apps</span>
                </li>
              </ul>
              
              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition">
                Start 14-Day Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200 hover:border-slate-300 transition relative">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Family+</h3>
                <div className="mb-4">
                  <span className="text-4xl sm:text-5xl font-bold text-slate-900">$30</span>
                  <span className="text-slate-600 ml-2">/month</span>
                </div>
                <p className="text-slate-600">For large families</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Unlimited AI chats</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Full email automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Custom agent workflows</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Priority email processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">Unlimited family members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">White-glove setup</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">24/7 phone support</span>
                </li>
              </ul>
              
              <button className="w-full px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition">
                Contact Sales
              </button>
            </div>
          </div>

          {/* Pricing FAQ */}
          <div className="mt-16 sm:mt-20 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Frequently asked questions</h3>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">What counts as an AI chat?</h4>
                <p className="text-slate-600 text-sm">Each conversation thread with our AI assistant counts as one chat. Follow-up questions in the same conversation don't count separately.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Can I change plans anytime?</h4>
                <p className="text-slate-600 text-sm">Yes! Upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Is there a free trial?</h4>
                <p className="text-slate-600 text-sm">Yes! All paid plans come with a 14-day free trial. No credit card required to start.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">What if I go over my chat limit?</h4>
                <p className="text-slate-600 text-sm">We'll send you a notification when you're near your limit. You can upgrade anytime or wait for your limit to reset next month.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to lighten your load?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100">
              Join thousands of families who've transformed chaos into clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-base sm:text-lg hover:shadow-2xl transition">
                Start Free 14-Day Trial
              </button>
              <button className="px-8 py-4 bg-transparent text-white rounded-full font-semibold text-base sm:text-lg border-2 border-white hover:bg-white/10 transition">
                Schedule Demo
              </button>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 mt-6">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ready to lighten your load?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100">
              Join thousands of families who've transformed chaos into clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-base sm:text-lg hover:shadow-2xl transition">
                Start Free 14-Day Trial
              </button>
              <button className="px-8 py-4 bg-transparent text-white rounded-full font-semibold text-base sm:text-lg border-2 border-white hover:bg-white/10 transition">
                Schedule Demo
              </button>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 mt-6">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <HomeOpsLogo size={32} stroke="#ffffff" />
                <span className="text-xl font-bold">HomeOps</span>
              </div>
              <p className="text-slate-400 text-sm">The operating system for high-performing families.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            © 2025 HomeOps. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeOpsLanding;
