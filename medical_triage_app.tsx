import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Send, Trash2, User, Sparkles, Heart, MessageCircle, TrendingUp, Shield, Zap, Brain, ChevronRight, X, Pill, Stethoscope, HeartPulse, Droplet, Wind, Star } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function MedicalTriageApp() {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [allergies, setAllergies] = useState('');
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('triage');
  const [metrics, setMetrics] = useState({ total: 0, urgent: 0, consultation: 0, selfcare: 0 });
  const [showWelcome, setShowWelcome] = useState(true);
  const [particles, setParticles] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
    fetchMetrics();
    generateParticles();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateParticles = () => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      const data = await res.json();
      setMetrics({
        total: data.total_requests || 0,
        urgent: data.urgency_distribution?.urgence || 0,
        consultation: data.urgency_distribution?.consultation || 0,
        selfcare: data.urgency_distribution?.['auto-soin'] || 0
      });
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          age: age ? parseInt(age) : null,
          allergies: allergies || null
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
        fetchHistory();
        fetchMetrics();
        setChatMessages([{
          role: 'assistant',
          content: `Based on your symptoms, I've classified this as: ${data.urgency_level}. ${data.advice}`
        }]);
      } else {
        setError(data.detail || 'Triage failed');
      }
    } catch (err) {
      setError('Connection error. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput })
      });

      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    }
  };

  const clearHistory = async () => {
    if (confirm('Are you sure you want to clear all history?')) {
      try {
        await fetch(`${API_BASE}/history`, { method: 'DELETE' });
        setHistory([]);
        fetchMetrics();
      } catch (err) {
        console.error('Failed to clear history:', err);
      }
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgence': return 'from-red-500 via-pink-500 to-orange-500';
      case 'consultation': return 'from-yellow-500 via-orange-500 to-amber-500';
      case 'auto-soin': return 'from-green-500 via-emerald-500 to-teal-500';
      default: return 'from-blue-500 via-cyan-500 to-indigo-500';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'urgence': return <AlertCircle className="w-8 h-8" />;
      case 'consultation': return <Clock className="w-8 h-8" />;
      case 'auto-soin': return <CheckCircle className="w-8 h-8" />;
      default: return <Activity className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full blur-2xl animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}rem`,
              height: `${particle.size}rem`,
              background: `radial-gradient(circle, rgba(167, 139, 250, 0.4), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3))`,
              animation: `float ${particle.duration}s infinite ease-in-out`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/30 via-pink-600/20 to-transparent pointer-events-none" />
      
      {/* Animated Gradient Mesh */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-3xl shadow-2xl max-w-2xl mx-4 p-12 border-2 border-purple-500/30 relative overflow-hidden animate-scaleIn">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse" />
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-6 right-6 p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:rotate-90 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl animate-pulse">
                  <Stethoscope className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text animate-shimmer">
                Medical Triage Assistant
              </h1>
              
              <p className="text-gray-300 text-center text-lg mb-8 leading-relaxed">
                Your intelligent health companion powered by advanced AI. Get instant symptom analysis, 
                personalized medical guidance, and connect with healthcare professionals when needed.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 border border-red-500/30 text-center transform hover:scale-105 transition-all duration-300">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />
                  <p className="text-sm font-bold text-red-300">Emergency Detection</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30 text-center transform hover:scale-105 transition-all duration-300">
                  <Clock className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
                  <p className="text-sm font-bold text-yellow-300">24/7 Availability</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30 text-center transform hover:scale-105 transition-all duration-300">
                  <Brain className="w-10 h-10 mx-auto mb-3 text-green-400" />
                  <p className="text-sm font-bold text-green-300">AI-Powered Analysis</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
              >
                Get Started
                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Modern Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="relative p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl">
                  <HeartPulse className="w-10 h-10 text-white animate-heartbeat" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                  Health Triage Pro
                </h1>
                <p className="text-gray-400 text-sm font-medium mt-1">Advanced AI Medical Analysis System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-xl flex items-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
                <span className="text-green-300 font-bold text-sm">System Online</span>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="group relative bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-10 h-10 text-purple-400 group-hover:scale-110 transition-transform" />
                  <Star className="w-6 h-6 text-purple-300 opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500" />
                </div>
                <p className="text-gray-400 text-sm font-semibold mb-2">Total Requests</p>
                <p className="text-5xl font-black text-white group-hover:text-purple-300 transition-colors">{metrics.total}</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-red-900/40 via-red-800/30 to-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border-2 border-red-500/30 hover:border-red-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="w-10 h-10 text-red-400 group-hover:scale-110 transition-transform animate-pulse" />
                  <Star className="w-6 h-6 text-red-300 opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500" />
                </div>
                <p className="text-gray-400 text-sm font-semibold mb-2">Emergency Cases</p>
                <p className="text-5xl font-black text-white group-hover:text-red-300 transition-colors">{metrics.urgent}</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-yellow-900/40 via-yellow-800/30 to-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border-2 border-yellow-500/30 hover:border-yellow-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <Star className="w-6 h-6 text-yellow-300 opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500" />
                </div>
                <p className="text-gray-400 text-sm font-semibold mb-2">Consultations</p>
                <p className="text-5xl font-black text-white group-hover:text-yellow-300 transition-colors">{metrics.consultation}</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-green-900/40 via-green-800/30 to-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border-2 border-green-500/30 hover:border-green-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
                  <Star className="w-6 h-6 text-green-300 opacity-0 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500" />
                </div>
                <p className="text-gray-400 text-sm font-semibold mb-2">Self-Care</p>
                <p className="text-5xl font-black text-white group-hover:text-green-300 transition-colors">{metrics.selfcare}</p>
              </div>
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-slate-800/80 via-purple-900/60 to-slate-800/80 backdrop-blur-xl p-3 rounded-3xl border-2 border-purple-500/40 shadow-2xl shadow-purple-500/30">
            <button
              onClick={() => setActiveTab('triage')}
              className={`relative px-10 py-4 rounded-2xl font-black text-lg transition-all duration-500 flex items-center gap-3 overflow-hidden group ${
                activeTab === 'triage'
                  ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 text-white shadow-2xl shadow-fuchsia-500/80 scale-105 border-2 border-fuchsia-400'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/70 hover:scale-[1.02]'
              }`}
            >
              {activeTab === 'triage' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmerSlow" />
              )}
              <Activity className={`w-7 h-7 ${activeTab === 'triage' ? 'animate-spin-slow drop-shadow-lg' : ''}`} />
              <span className="relative z-10">Symptom Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`relative px-10 py-4 rounded-2xl font-black text-lg transition-all duration-500 flex items-center gap-3 overflow-hidden group ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 text-white shadow-2xl shadow-cyan-500/80 scale-105 border-2 border-cyan-400'
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/70 hover:scale-[1.02]'
              }`}
            >
              {activeTab === 'chat' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmerSlow" />
              )}
              <MessageCircle className={`w-7 h-7 ${activeTab === 'chat' ? 'animate-bounce drop-shadow-lg' : ''}`} />
              <span className="relative z-10">AI Assistant</span>
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'triage' ? (
              <div className="relative bg-gradient-to-br from-slate-900/70 via-purple-900/30 to-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border-2 border-purple-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-pink-600/5 to-blue-600/5 animate-pulse" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white">Patient Information</h2>
                      <p className="text-gray-400 text-sm mt-1">Complete the form for AI-powered analysis</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className="block text-lg font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                        Describe Your Symptoms *
                      </label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full px-6 py-5 bg-gradient-to-br from-slate-950/80 to-purple-950/30 border-2 border-purple-500/40 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 text-white placeholder-gray-500 transition-all duration-300 hover:border-purple-400/60 backdrop-blur-xl text-lg"
                        rows={6}
                        placeholder="e.g., I have a persistent headache, fever of 38.5°C, and mild chest discomfort..."
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-black mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                          Age (years)
                        </label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full px-6 py-5 bg-gradient-to-br from-slate-950/80 to-blue-950/30 border-2 border-blue-500/40 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-500 transition-all duration-300 hover:border-blue-400/60 backdrop-blur-xl text-lg"
                          placeholder="35"
                          min="0"
                          max="120"
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
                          Known Allergies
                        </label>
                        <input
                          type="text"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          className="w-full px-6 py-5 bg-gradient-to-br from-slate-950/80 to-green-950/30 border-2 border-green-500/40 rounded-2xl focus:ring-4 focus:ring-green-500/50 focus:border-green-400 text-white placeholder-gray-500 transition-all duration-300 hover:border-green-400/60 backdrop-blur-xl text-lg"
                          placeholder="None"
                        />
                      </div>
                    </div>

                    {/* Quick Symptom Buttons */}
                    <div>
                      <p className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Quick Symptom Presets
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                          type="button"
                          onClick={() => setSymptoms("I have a fever of 39°C for 3 days with body aches")}
                          className="group relative px-5 py-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 rounded-2xl text-orange-300 text-sm font-bold hover:from-orange-500/40 hover:to-red-500/40 hover:border-orange-400 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/30 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          <span className="text-2xl mb-2 block">🤒</span>
                          <span className="relative z-10">Fever</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSymptoms("I have chest pain radiating to my left arm")}
                          className="group relative px-5 py-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 border-2 border-red-500/50 rounded-2xl text-red-300 text-sm font-bold hover:from-red-500/40 hover:to-pink-500/40 hover:border-red-400 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/30 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          <span className="text-2xl mb-2 block">💔</span>
                          <span className="relative z-10">Chest Pain</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSymptoms("I have a headache and feeling tired")}
                          className="group relative px-5 py-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 rounded-2xl text-blue-300 text-sm font-bold hover:from-blue-500/40 hover:to-cyan-500/40 hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          <span className="text-2xl mb-2 block">🤕</span>
                          <span className="relative z-10">Headache</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSymptoms("I have difficulty breathing and shortness of breath")}
                          className="group relative px-5 py-4 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-2 border-purple-500/50 rounded-2xl text-purple-300 text-sm font-bold hover:from-purple-500/40 hover:to-indigo-500/40 hover:border-purple-400 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                          <span className="text-2xl mb-2 block">😮‍💨</span>
                          <span className="relative z-10">Breathing</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={loading || !symptoms.trim()}
                        className="flex-1 relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white py-6 rounded-2xl font-black text-xl shadow-2xl shadow-fuchsia-500/60 hover:shadow-fuchsia-500/80 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group overflow-hidden hover:scale-[1.02] active:scale-95 border-2 border-fuchsia-400/50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        {loading ? (
                          <>
                            <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="relative z-10">Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-7 h-7 group-hover:rotate-12 transition-transform drop-shadow-lg" />
                            <span className="relative z-10 drop-shadow-lg">Analyze Symptoms</span>
                            <ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform drop-shadow-lg" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSymptoms('');
                          setAge('');
                          setAllergies('');
                          setResult(null);
                          setError('');
                        }}
                        className="px-8 py-6 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-red-500/50 hover:shadow-red-500/70 hover:from-red-500 hover:to-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-red-400/50"
                      >
                        <Trash2 className="w-6 h-6 drop-shadow-lg" />
                      </button>
                    </div>

                    {error && (
                      <div className="p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500/50 rounded-2xl flex items-start gap-4 animate-shake">
                        <AlertCircle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-red-300 mb-1">Error Occurred</p>
                          <p className="text-red-200 text-sm">{error}</p>
                        </div>
                      </div>
                    )}

                    {result && (
                      <div className={`relative p-8 bg-gradient-to-br ${getUrgencyColor(result.urgency_level)} rounded-3xl shadow-2xl animate-slideUp overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                        <div className="relative z-10">
                          <div className="flex items-start gap-6 mb-6">
                            <div className="p-5 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl">
                              {getUrgencyIcon(result.urgency_level)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-3xl font-black mb-2 text-white drop-shadow-lg">
                                {result.urgency_level.toUpperCase()}
                              </h3>
                              <div className="flex items-center gap-3">
                                <div className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl">
                                  <p className="text-sm font-bold text-white">
                                    Confidence: {(result.confidence * 100).toFixed(0)}%
                                  </p>
                                </div>
                                <div className="h-3 w-3 bg-white rounded-full animate-ping" />
                              </div>
                            </div>
                          </div>
                          <p className="text-white text-lg leading-relaxed font-medium mb-6 drop-shadow">
                            {result.advice}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.detected_symptoms?.map((symptom: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl text-sm font-bold text-white border border-white/30"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-br from-slate-900/70 via-blue-900/30 to-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border-2 border-blue-500/30 overflow-hidden h-[800px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-cyan-600/5 to-purple-600/5 animate-pulse" />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-xl">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white">AI Medical Assistant</h2>
                      <p className="text-gray-400 text-sm mt-1">Ask me anything about your health concerns</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-4 custom-scrollbar">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-6">
                          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
                            <MessageCircle className="w-12 h-12 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-white mb-3">Start a Conversation</h3>
                            <p className="text-gray-400 mb-6">Ask about symptoms, treatments, or general health advice</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <button
                              onClick={() => {
                                setChatInput("What should I do if I have a fever?");
                                document.getElementById('chat-input')?.focus();
                              }}
                              className="group p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 rounded-2xl text-left hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400 transition-all duration-300 hover:scale-105"
                            >
                              <Droplet className="w-8 h-8 text-purple-400 mb-3 group-hover:rotate-12 transition-transform" />
                              <p className="text-white font-bold text-sm">What should I do if I have a fever?</p>
                            </button>
                            <button
                              onClick={() => {
                                setChatInput("When should I see a doctor?");
                                document.getElementById('chat-input')?.focus();
                              }}
                              className="group p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-2xl text-left hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400 transition-all duration-300 hover:scale-105"
                            >
                              <Stethoscope className="w-8 h-8 text-blue-400 mb-3 group-hover:rotate-12 transition-transform" />
                              <p className="text-white font-bold text-sm">When should I see a doctor?</p>
                            </button>
                            <button
                              onClick={() => {
                                setChatInput("How can I treat a headache?");
                                document.getElementById('chat-input')?.focus();
                              }}
                              className="group p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 rounded-2xl text-left hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400 transition-all duration-300 hover:scale-105"
                            >
                              <Pill className="w-8 h-8 text-green-400 mb-3 group-hover:rotate-12 transition-transform" />
                              <p className="text-white font-bold text-sm">How can I treat a headache?</p>
                            </button>
                            <button
                              onClick={() => {
                                setChatInput("What are signs of an emergency?");
                                document.getElementById('chat-input')?.focus();
                              }}
                              className="group p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/40 rounded-2xl text-left hover:from-red-500/30 hover:to-orange-500/30 hover:border-red-400 transition-all duration-300 hover:scale-105"
                            >
                              <Shield className="w-8 h-8 text-red-400 mb-3 group-hover:rotate-12 transition-transform" />
                              <p className="text-white font-bold text-sm">What are signs of an emergency?</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-4 animate-slideUp ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                              <Brain className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] p-5 rounded-3xl ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl'
                                : 'bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border-2 border-slate-600/50 text-white shadow-xl'
                            }`}
                          >
                            <p className="text-base leading-relaxed">{msg.content}</p>
                          </div>
                          {msg.role === 'user' && (
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleChatSubmit} className="flex gap-4">
                    <input
                      id="chat-input"
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 px-6 py-5 bg-gradient-to-br from-slate-950/80 to-blue-950/30 border-2 border-blue-500/40 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 text-white placeholder-gray-500 transition-all duration-300 hover:border-blue-400/60 backdrop-blur-xl text-lg"
                      placeholder="Type your health question..."
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-8 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center gap-3 group"
                    >
                      <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            <div className="relative bg-gradient-to-br from-slate-900/70 via-pink-900/30 to-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border-2 border-pink-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/5 via-purple-600/5 to-blue-600/5 animate-pulse" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-7 h-7 text-pink-400" />
                    <h3 className="text-2xl font-black text-white">Recent History</h3>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="p-3 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
                  >
                    <Trash2 className="w-5 h-5 text-red-400 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-700 to-gray-600 rounded-3xl flex items-center justify-center mb-4 opacity-50">
                        <Clock className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No history yet</p>
                      <p className="text-gray-600 text-sm mt-2">Start by analyzing symptoms</p>
                    </div>
                  ) : (
                    history.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="group p-5 bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl rounded-2xl border-2 border-slate-600/40 hover:border-pink-500/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 bg-gradient-to-br ${getUrgencyColor(item.urgency_level)} rounded-xl shadow-lg`}>
                            {getUrgencyIcon(item.urgency_level)}
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-white text-sm">{item.urgency_level.toUpperCase()}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                          {item.symptoms}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-slate-900/50 via-purple-900/30 to-slate-900/50 backdrop-blur-xl rounded-2xl border-2 border-purple-500/20">
            <Shield className="w-5 h-5 text-purple-400" />
            <p className="text-gray-400 text-sm font-medium">
              This is an AI-powered triage assistant. For emergencies, call your local emergency number immediately.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        @keyframes shimmerSlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 15s infinite ease-in-out;
        }
        
        .animate-shimmerSlow {
          animation: shimmerSlow 3s infinite;
        }
        
        .animate-heartbeat {
          animation: heartbeat 1.5s infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #db2777);
        }
      `}</style>
    </div>
  );
}
