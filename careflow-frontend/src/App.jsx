import { useState, useEffect, useRef } from "react";
import {
  Activity, BedDouble, FlaskConical, ShieldCheck, Search, ArrowRight,
  AlertTriangle, CheckCircle2, Database, Brain, GitMerge, MessageSquare,
  Menu, X, ChevronDown, CircleDot, Send, UploadCloud, RefreshCw, BarChart2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Legend,
} from 'recharts';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedConflict, setExpandedConflict] = useState(null);
  const [data, setData] = useState({ metrics: [], conflicts: [], insights: [] });
  const [chartData, setChartData] = useState({ labTurnaround: [], bedOccupancy: [] });
  const [loading, setLoading] = useState(true);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hello! I am CareFlow AI. Ask me about bed status, laboratory delays, or data conflicts." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Upload state
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/dashboard').then(res => res.json()),
      fetch('http://localhost:3001/api/charts').then(res => res.json())
    ]).then(([dashboardData, chartsData]) => {
      setData(dashboardData);
      setChartData(chartsData);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch data:", err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      
      // Simulate slight delay for AI typing effect
      setTimeout(() => {
        setIsTyping(false);
        setChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
      }, 600);
    } catch (err) {
      setIsTyping(false);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Error connecting to AI backend." }]);
    }
  };

  const handleFileUpload = async () => {
    setUploadStatus("uploading");
    try {
      const res = await fetch('http://localhost:3001/api/upload', { method: 'POST' });
      const data = await res.json();
      setTimeout(() => {
        setUploadStatus(data.message);
        setTimeout(() => setUploadStatus(null), 3000);
      }, 1500); // simulate upload time
    } catch (err) {
      setUploadStatus("Upload failed.");
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f4f6ef] flex items-center justify-center text-green-800 text-2xl font-semibold">Loading CareFlow AI...</div>;
  }

  const { metrics, conflicts, insights } = data;

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'BedDouble': return BedDouble;
      case 'FlaskConical': return FlaskConical;
      case 'ShieldCheck': return ShieldCheck;
      default: return Activity;
    }
  };

  return (
    <main className="min-h-screen bg-green-50 text-slate-800 font-sans pb-20">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-green-100/40 blur-3xl" />
      </div>

      <nav className="sticky top-4 z-50 mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-700 text-white">
            <Activity size={20} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-green-800">
            CareFlow AI
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm font-medium lg:flex">
          <a href="#dashboard" className="hover:text-green-700 transition">Dashboard</a>
          <a href="#visualizations" className="hover:text-green-700 transition">Visualizations</a>
          <a href="#reconciliation" className="hover:text-green-700 transition">Reconciliation</a>
          <a href="#integrations" className="hover:text-green-700 transition">Integrations</a>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <button className="flex items-center gap-2 rounded-full bg-green-800 px-5 py-3 text-sm font-semibold text-white hover:bg-green-900 transition shadow-md">
            <CircleDot size={16} className="text-green-300 animate-pulse" />
            Live Status
          </button>
        </div>

        <button className="lg:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <section id="dashboard" className="mx-auto mt-6 max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8 md:p-16 text-white shadow-2xl relative">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="grid items-center gap-12 lg:grid-cols-2 relative z-10">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
              <Brain size={16} className="text-green-200" />
              AI-Powered Hospital Operations
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-tight md:text-7xl">
              One Trusted View.
              <span className="block text-green-200 mt-2">
                For Every Critical Decision.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-green-100">
              Automatically reconcile admissions, laboratory and bed occupancy
              data into one explainable operational picture—without manually
              compiling reports.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-medium text-green-200 tracking-wider uppercase">Hospital Operations</p>
                <h3 className="text-2xl font-bold mt-1">Today's Status</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-green-400/20 px-3 py-1.5 text-xs font-semibold border border-green-300/30">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-300" />
                LIVE
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatusCard label="Bed Occupancy" value="138 / 150" />
              <StatusCard label="Available Beds" value="12" />
              <StatusCard label="Lab Queue" value="31 Pending" />
              <StatusCard label="Data Confidence" value="96%" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="font-bold tracking-wider text-sm text-green-700 uppercase">Today's Operations</p>
          <h2 className="mt-3 text-4xl font-bold text-slate-900">See What Needs Attention</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = getIcon(metric.icon);
            return (
              <div key={metric.title} className="group rounded-[2rem] bg-white p-8 shadow-md border border-slate-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-800 mb-6 transition group-hover:scale-110 group-hover:bg-green-200">
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{metric.title}</h3>
                <p className="mt-4 text-5xl font-black text-green-800 tracking-tight">{metric.value}</p>
                <p className="mt-3 text-slate-500 font-medium">{metric.subtitle}</p>
                <div className="mt-6 inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700 border border-green-100">
                  {metric.status}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW: Data Visualizations Section */}
      <section id="visualizations" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8">
          <h2 className="mt-3 text-4xl font-bold text-[#0d2a4a] flex items-center gap-3">
            <BarChart2 size={36} className="text-[#8baf40]" />
            Operational Trends
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white p-8 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50">
            <h3 className="text-xl font-bold text-[#0d2a4a] mb-8">Lab Turnaround vs SLA (Minutes)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.labTurnaround} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={true} stroke="#cbd5e1" tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} dy={15} />
                  <YAxis axisLine={true} stroke="#cbd5e1" tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', color: '#64748b' }} />
                  <ReferenceLine y={60} label={{ position: 'inside', value: 'SLA Limit (60m)', fill: '#94a3b8', fontSize: 13 }} stroke="#ef4444" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="turnaroundMins" name="Avg Turnaround" stroke="#8baf40" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#8baf40' }} activeDot={{ r: 7, fill: '#8baf40', stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-50">
            <h3 className="text-xl font-bold text-[#0d2a4a] mb-8">Bed Occupancy by Department</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.bedOccupancy} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={true} stroke="#cbd5e1" tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} dy={10} />
                  <YAxis dataKey="name" type="category" axisLine={true} stroke="#cbd5e1" tickLine={false} tick={{fill: '#94a3b8', fontSize: 13}} dx={-10} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', color: '#94a3b8' }} payload={[
                    { value: 'Available', type: 'square', id: 'available', color: '#e2e8f0' },
                    { value: 'Dirty', type: 'square', id: 'dirty', color: '#f59e0b' },
                    { value: 'Maintenance', type: 'square', id: 'maintenance', color: '#64748b' },
                    { value: 'Occupied', type: 'square', id: 'occupied', color: '#8baf40' }
                  ]} />
                  <Bar dataKey="occupied" stackId="a" fill="#8baf40" />
                  <Bar dataKey="dirty" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="maintenance" stackId="a" fill="#64748b" />
                  <Bar dataKey="available" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section id="insights" className="bg-green-950 px-6 py-28 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="mx-auto max-w-6xl relative z-10">
          <p className="font-bold tracking-wider text-sm text-green-300 uppercase">AI Operational Insights</p>
          <h2 className="mt-3 text-4xl font-bold">Your AI Operations Analyst</h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md hover:bg-white/10 transition">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${insight.type === 'alert' ? 'bg-amber-500/20 text-amber-300' : 'bg-green-400/20 text-green-300'} mb-6`}>
                  {insight.type === "alert" ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <h3 className="text-xl font-bold">{insight.title}</h3>
                <p className="mt-4 leading-relaxed text-green-100/70">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reconciliation" className="mx-auto max-w-6xl px-6 py-28">
        <div className="text-center mb-12">
          <p className="font-bold tracking-wider text-sm text-green-700 uppercase bg-green-100 inline-block px-3 py-1 rounded-full">Transparent Reconciliation</p>
          <h2 className="mt-4 text-4xl font-bold text-slate-900">One Number. Fully Explainable.</h2>
        </div>

        <div className="mt-10 max-w-4xl mx-auto space-y-4">
          {conflicts.map((conflict, index) => (
            <div key={index} className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md">
              <button
                onClick={() => setExpandedConflict(expandedConflict === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${conflict.confidence === 'High' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-800">{conflict.patient}</p>
                    <p className="mt-1 text-sm text-slate-500 font-medium">
                      Conflict detected between operational sources
                    </p>
                  </div>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform duration-300 ${expandedConflict === index ? "rotate-180" : ""}`} size={24} />
              </button>

              {expandedConflict === index && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <DataBox title="Source 1" value={conflict.source1} />
                    <DataBox title="Source 2" value={conflict.source2} />
                  </div>
                  <div className="mt-6 rounded-2xl bg-green-50 p-6 border border-green-100">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <Brain size={20} />
                      <p className="font-bold text-lg">AI Resolution: {conflict.resolution}</p>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed ml-7">
                      Rule / Reason: {conflict.reason}
                    </p>
                    <div className="mt-4 ml-7 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-green-700 shadow-sm border border-green-100">
                      <CircleDot size={12} className={conflict.confidence === 'High' ? 'text-green-500' : 'text-amber-500'} />
                      Confidence: {conflict.confidence}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* UPDATED: Interactive AI Chat */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 rounded-[3rem] bg-gradient-to-br from-green-100 to-green-50 p-8 md:p-12 lg:grid-cols-2 border border-green-200/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
          <div className="relative z-10 flex flex-col justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-800 text-white shadow-lg">
              <MessageSquare size={32} />
            </div>
            <h2 className="mt-8 text-4xl font-bold text-slate-900 leading-tight">Ask CareFlow AI</h2>
            <p className="mt-4 text-slate-600 font-medium text-lg leading-relaxed">
              Interact directly with the Operations Insight Agent. Ask natural language questions about dirty beds, delayed tests, or staff assignments.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-green-800 border border-green-200">"Which beds are dirty?"</span>
              <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-green-800 border border-green-200">"Show lab delays"</span>
              <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-green-800 border border-green-200">"Who is assigned to patient 318?"</span>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-6 shadow-xl relative z-10 border border-slate-50 flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm font-medium leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-green-800 text-white rounded-br-none shadow-md' 
                      : 'bg-green-50 text-slate-700 border border-green-100 rounded-bl-none'
                  }`}>
                    {msg.role === 'ai' && <Brain size={16} className="inline mr-2 text-green-700 mb-0.5" />}
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-green-50 text-slate-500 border border-green-100 rounded-2xl rounded-bl-none p-4 flex gap-1 items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleChatSubmit} className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about hospital operations..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
              />
              <button 
                type="submit" 
                disabled={!chatInput.trim() || isTyping}
                className="absolute right-2 top-2 bottom-2 bg-green-700 text-white p-2 rounded-full hover:bg-green-800 disabled:opacity-50 transition"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* NEW: Data Integrations Section */}
      <section id="integrations" className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-[3rem] bg-white p-10 md:p-16 border border-slate-100 shadow-lg flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900">Data Integrations</h2>
            <p className="mt-4 text-slate-600 leading-relaxed max-w-lg">
              Connect your Hospital Information System (HIS) and Laboratory systems. Upload CSV exports or configure live API keys to keep CareFlow AI synced in real-time.
            </p>
          </div>
          <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100 w-full md:w-auto min-w-[300px] flex flex-col items-center justify-center">
            {uploadStatus === "uploading" ? (
              <div className="flex flex-col items-center">
                <RefreshCw size={48} className="text-green-700 animate-spin mb-4" />
                <p className="text-green-800 font-bold">Syncing Data...</p>
              </div>
            ) : uploadStatus ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={48} className="text-green-600 mb-4" />
                <p className="text-green-800 font-bold text-center">{uploadStatus}</p>
              </div>
            ) : (
              <>
                <Database size={48} className="text-green-700 mb-6" />
                <button 
                  onClick={handleFileUpload}
                  className="w-full flex items-center justify-center gap-2 bg-white text-green-800 font-bold py-4 px-6 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition"
                >
                  <UploadCloud size={20} />
                  Upload Source CSV
                </button>
              </>
            )}
          </div>
        </div>
      </section>
      
    </main>
  );
}

function StatusCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 border border-white/5 backdrop-blur-sm">
      <p className="text-sm font-medium text-green-200 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function QuickMetric({ title, value }) {
  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 md:border-b-0 md:border-r md:px-6 md:pb-0 md:first:pl-0 md:last:border-0 md:last:pr-0">
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="mt-2 text-3xl font-black text-green-800">{value}</p>
    </div>
  );
}

function DataBox({ title, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      <p className="text-base font-semibold text-slate-700">{value}</p>
    </div>
  );
}
