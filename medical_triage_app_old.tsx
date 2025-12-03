import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Send, Trash2, User, Sparkles, Heart, MessageCircle, TrendingUp, Shield, Zap, Brain, ChevronRight, X } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function MedicalTriageApp() {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [allergies, setAllergies] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('triage');
  const [metrics, setMetrics] = useState({ total: 0, urgent: 0, consultation: 0, selfcare: 0 });
  const [showWelcome, setShowWelcome] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    fetchMetrics();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      const data = await res.json();
      setMetrics({
        total: data.total_requests || 0,
        urgent: data.urgency_counts?.urgence || 0,
        consultation: data.urgency_counts?.consultation || 0,
        selfcare: data.urgency_counts?.['auto-soin'] || 0
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

  const handleSubmit = async (e) => {
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

  const handleChatSubmit = async (e) => {
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
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I cannot respond right now.' 
      }]);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_BASE}/history`, { method: 'DELETE' });
      fetchHistory();
      fetchMetrics();
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'urgence': return 'text-red-600 bg-red-50 border-red-200';
      case 'consultation': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'auto-soin': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'urgence': return <AlertCircle className="w-6 h-6" />;
      case 'consultation': return <Clock className="w-6 h-6" />;
      case 'auto-soin': return <CheckCircle className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1400ms' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-float"></div>
        <div className="absolute top-40 right-40 w-3 h-3 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-60 w-2 h-2 bg-pink-400 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-60 right-20 w-3 h-3 bg-cyan-400 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl transform animate-scale-in">
            <button 
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <Heart className="w-20 h-20 text-pink-500 animate-pulse" />
                <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to Medical Triage AI</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Our advanced AI system analyzes your symptoms in real-time and provides instant medical triage recommendations. 
                Get started by describing your symptoms below.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Instant Analysis</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">AI Powered</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Secure & Private</p>
                </div>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                Get Started
                <ChevronRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header with Stats */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse"></div>
              <Heart className="w-14 h-14 text-pink-500 animate-pulse relative z-10" />
              <Sparkles className="w-7 h-7 text-yellow-300 absolute -top-1 -right-1 animate-bounce z-10" />
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Medical Triage AI
            </h1>
          </div>
          <p className="text-gray-300 text-xl mb-6">Advanced AI-powered symptom analysis and urgency classification</p>
          
          {/* Live Stats Bar */}
          <div className="flex justify-center gap-3 flex-wrap">
            <div className="px-4 py-2 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-semibold">System Online</span>
            </div>
            <div className="px-4 py-2 bg-blue-500/10 backdrop-blur-lg border border-blue-500/30 rounded-xl">
              <TrendingUp className="w-4 h-4 inline mr-2 text-blue-400" />
              <span className="text-blue-300 text-sm font-semibold">{metrics.total} Analyses</span>
            </div>
            <div className="px-4 py-2 bg-purple-500/10 backdrop-blur-lg border border-purple-500/30 rounded-xl">
              <Brain className="w-4 h-4 inline mr-2 text-purple-400" />
              <span className="text-purple-300 text-sm font-semibold">AI Powered</span>
            </div>
            <div className="px-4 py-2 bg-green-500/10 backdrop-blur-lg border border-green-500/30 rounded-xl">
              <Shield className="w-4 h-4 inline mr-2 text-green-400" />
              <span className="text-green-300 text-sm font-semibold">HIPAA Compliant</span>
            </div>
          </div>
        </header>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-3xl font-bold text-white">{metrics.total}</span>
            </div>
            <p className="text-blue-300 font-semibold">Total Analyses</p>
            <div className="mt-3 h-1 bg-blue-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-lg border border-red-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-3xl font-bold text-white">{metrics.urgent}</span>
            </div>
            <p className="text-red-300 font-semibold">Urgent Cases</p>
            <div className="mt-3 h-1 bg-red-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-3/4 animate-pulse"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-3xl font-bold text-white">{metrics.consultation}</span>
            </div>
            <p className="text-yellow-300 font-semibold">Consultations</p>
            <div className="mt-3 h-1 bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 w-1/2 animate-pulse"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-3xl font-bold text-white">{metrics.selfcare}</span>
            </div>
            <p className="text-green-300 font-semibold">Self-Care</p>
            <div className="mt-3 h-1 bg-green-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Enhanced */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 backdrop-blur-lg p-1.5 rounded-2xl border border-slate-700 inline-flex gap-2 shadow-xl">
            <button
              onClick={() => setActiveTab('triage')}
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 ${
                activeTab === 'triage'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-6 h-6" />
              <span>Triage Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="md:col-span-2">
            {activeTab === 'triage' ? (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  Patient Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
                      Describe Your Symptoms *
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full px-5 py-4 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-500 transition-all duration-300 hover:border-purple-500/50"
                      rows="5"
                      placeholder="e.g., I have a persistent headache, fever of 38.5°C, and mild chest discomfort..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-3">
                        Age (years)
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-5 py-4 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-blue-500/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-300 hover:border-blue-500/50"
                        placeholder="35"
                        min="0"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-3">
                        Known Allergies
                      </label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="w-full px-5 py-4 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-green-500/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500 transition-all duration-300 hover:border-green-500/50"
                        placeholder="None"
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSymptoms("I have a fever of 39°C for 3 days with body aches")}
                      className="px-4 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/40 rounded-xl text-orange-300 text-sm font-semibold hover:from-orange-500/30 hover:to-red-500/30 hover:border-orange-500/60 transition-all duration-300 hover:scale-105"
                    >
                      🤒 Fever
                    </button>
                    <button
                      onClick={() => setSymptoms("I have chest pain radiating to my left arm")}
                      className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500/40 rounded-xl text-red-300 text-sm font-semibold hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-500/60 transition-all duration-300 hover:scale-105"
                    >
                      💔 Chest Pain
                    </button>
                    <button
                      onClick={() => setSymptoms("I have a headache and feeling tired")}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-xl text-blue-300 text-sm font-semibold hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-500/60 transition-all duration-300 hover:scale-105"
                    >
                      🤕 Headache
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-purple-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group overflow-hidden hover:scale-[1.02] active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      {loading ? (
                        <>
                          <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Analyzing Your Symptoms...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform animate-pulse" />
                          <span>Analyze with AI</span>
                          <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>

                  {/* Additional Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setSymptoms('');
                        setAge('');
                        setAllergies('');
                        setResult(null);
                        setError('');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-xl font-semibold hover:from-slate-600 hover:to-slate-500 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Clear Form
                    </button>
                    <button
                      onClick={() => {
                        const examples = [
                          { symptoms: "Fever, cough, and fatigue for 2 days", age: "45", allergies: "None" },
                          { symptoms: "Severe headache and dizziness", age: "30", allergies: "Penicillin" },
                          { symptoms: "Chest pain and shortness of breath", age: "55", allergies: "None" }
                        ];
                        const example = examples[Math.floor(Math.random() * examples.length)];
                        setSymptoms(example.symptoms);
                        setAge(example.age);
                        setAllergies(example.allergies);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-blue-500 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      Try Example
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-5 bg-red-500/10 border-2 border-red-500/50 rounded-xl text-red-300 backdrop-blur-lg animate-shake">
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    {error}
                  </div>
                )}

                {result && (
                  <div className={`mt-8 p-8 rounded-2xl border-2 backdrop-blur-lg transform transition-all duration-500 hover:scale-[1.02] ${
                    result.urgency_level?.toLowerCase() === 'urgence' 
                      ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/20' 
                      : result.urgency_level?.toLowerCase() === 'consultation'
                      ? 'bg-yellow-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                      : 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/20'
                  }`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 rounded-2xl ${
                        result.urgency_level?.toLowerCase() === 'urgence' 
                          ? 'bg-red-500/20' 
                          : result.urgency_level?.toLowerCase() === 'consultation'
                          ? 'bg-yellow-500/20'
                          : 'bg-green-500/20'
                      }`}>
                        {getUrgencyIcon(result.urgency_level)}
                      </div>
                      <div>
                        <h3 className={`text-3xl font-bold ${
                          result.urgency_level?.toLowerCase() === 'urgence' 
                            ? 'text-red-400' 
                            : result.urgency_level?.toLowerCase() === 'consultation'
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}>
                          {result.urgency_level?.toUpperCase()}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">AI Diagnosis Complete</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/30 rounded-xl p-5 mb-5">
                      <p className="text-gray-200 text-lg leading-relaxed">{result.advice}</p>
                    </div>
                    
                    {result.detected_symptoms && result.detected_symptoms.length > 0 && (
                      <div className="mb-5">
                        <p className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Detected Symptoms:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.detected_symptoms.map((s, i) => (
                            <span key={i} className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-gray-200 text-sm font-medium backdrop-blur-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-600/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-400 text-sm">AI Confidence:</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                            style={{ width: `${(result.confidence * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  AI Medical Assistant
                </h2>
                
                <div className="h-[500px] overflow-y-auto mb-6 p-6 bg-slate-900/50 rounded-xl border border-slate-700 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div className="animate-fade-in">
                        <div className="relative inline-block mb-6">
                          <Sparkles className="w-20 h-20 text-purple-400 animate-pulse" />
                          <div className="absolute inset-0 bg-purple-500/20 blur-2xl animate-pulse"></div>
                        </div>
                        <p className="text-gray-300 text-xl font-semibold mb-2">Ask me anything about your symptoms...</p>
                        <p className="text-gray-500 text-sm">I'm here to help 24/7 with AI-powered medical insights</p>
                        <div className="mt-6 flex gap-2 justify-center flex-wrap">
                          <button 
                            onClick={() => setChatInput("What should I do for a fever?")}
                            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-gray-300 transition-all duration-300"
                          >
                            💊 Fever advice
                          </button>
                          <button 
                            onClick={() => setChatInput("When should I see a doctor?")}
                            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-gray-300 transition-all duration-300"
                          >
                            🏥 When to see doctor
                          </button>
                          <button 
                            onClick={() => setChatInput("How to treat a headache?")}
                            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-gray-300 transition-all duration-300"
                          >
                            🤕 Headache treatment
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                          <div className={`max-w-[80%] px-6 py-4 rounded-2xl shadow-lg ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                              : 'bg-slate-700/50 text-gray-200 border border-slate-600 backdrop-blur-sm'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit(e)}
                    className="flex-1 px-5 py-4 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500 transition-all duration-300 hover:border-cyan-500/50"
                    placeholder="Type your question here..."
                  />
                  <button
                    onClick={handleChatSubmit}
                    className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 group overflow-hidden hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Send className="w-6 h-6 group-hover:translate-x-2 group-hover:rotate-12 transition-transform relative z-10" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - History */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border-2 border-purple-500/20 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-purple-400" />
                  History
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-red-400 hover:text-red-300 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-500/20 border-2 border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105 font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-500">No history yet</p>
                    <p className="text-gray-600 text-sm mt-1">Your analyses will appear here</p>
                  </div>
                ) : (
                  history.slice(-20).reverse().map((item, i) => (
                    <div 
                      key={i} 
                      className="p-4 bg-gradient-to-br from-slate-900/60 to-slate-800/60 rounded-xl border-2 border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer group hover:scale-[1.02]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider ${
                          item.urgency_level === 'urgence' ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 text-red-300 border-2 border-red-500/50 shadow-lg shadow-red-500/20' :
                          item.urgency_level === 'consultation' ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20' :
                          'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border-2 border-green-500/50 shadow-lg shadow-green-500/20'
                        }`}>
                          {item.urgency_level}
                        </span>
                        <span className="text-xs text-gray-500 group-hover:text-purple-400 transition-colors font-semibold">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-200 transition-colors leading-relaxed">
                        {item.symptoms}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-lg border-2 border-purple-500/20 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Important Notice</p>
            </div>
            <p className="text-gray-300 text-base mb-2 font-semibold">
              This is a demonstration system for educational purposes only.
            </p>
            <p className="text-gray-400 text-sm">
              Always consult a qualified healthcare professional for medical advice.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105">
                Learn More
              </button>
              <button className="px-6 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-300 hover:scale-105">
                Contact Support
              </button>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.6));
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8));
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}