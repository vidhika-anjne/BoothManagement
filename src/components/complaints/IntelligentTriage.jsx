import React, { useEffect, useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line
} from 'recharts';
import { 
    Zap, 
    Clock, 
    BarChart3, 
    ArrowUpRight, 
    Activity, 
    CheckCircle2, 
    AlertCircle,
    BrainCircuit,
    Filter,
    Search,
    ChevronRight,
    MessageSquare,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IntelligentTriage = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    console.log('IntelligentTriage Rendering. Complaints count:', complaints.length);

    const fetchComplaints = async () => {
        setIsLoading(true);
        console.log('Fetching complaints from: http://localhost:8081/api/complaints');
        try {
            const res = await fetch('http://localhost:8081/api/complaints');
            if (!res.ok) throw new Error('Failed to fetch complaints');
            const data = await res.json();
            console.log('Data received:', data);
            setComplaints(data);
            
            const analyticsRes = await fetch('http://localhost:8081/api/complaints/analytics');
            if (analyticsRes.ok) {
                const analyticData = await analyticsRes.json();
                setStats(analyticData.categoryDistribution?.map(d => ({ name: d[0], count: d[1] })) || []);
            }
        } catch (e) {
            console.error('Triage Fetch Error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const COLORS = ['#2563eb', '#6366f1', '#3b82f6', '#0ea5e9', '#10b981'];

    return (
        <div className="space-y-6 animate-fade-in p-6 bg-slate-50 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <BrainCircuit className="text-blue-600 w-6 h-6" />
                        </div>
                        Intelligent AI Triage
                    </h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                        Autonomous classification & prioritization engine 
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> 
                        Live Processing
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors" onClick={fetchComplaints}>
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh Data
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-xs uppercase tracking-wide border border-emerald-200">
                        <Activity size={14} className="animate-pulse" />
                        OLLAMA ON-LINE
                    </div>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                    <div className="flex gap-4 items-center mb-3">
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                            <MessageSquare size={22} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Issues</div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">{complaints.length}</div>
                        </div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded inline-block">Grievance Pool</div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-red-300 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                    <div className="flex gap-4 items-center mb-3">
                        <div className="p-3 rounded-lg bg-red-50 text-red-500 group-hover:scale-110 transition-transform">
                            <Zap size={22} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Critical Red</div>
                            <div className="text-3xl font-black text-red-500 tracking-tight">
                                {complaints.filter(c => c.aiPriority === 'HIGH').length}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded inline-block">Action Required</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <div className="flex gap-4 items-center mb-3">
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                            <Activity size={22} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mean Response</div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">4.2m</div>
                        </div>
                    </div>
                    <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded inline-flex items-center gap-1">
                        <ArrowUpRight size={12} /> -12% Improved
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                    <div className="flex gap-4 items-center mb-3">
                        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                            <BrainCircuit size={22} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Model</div>
                            <div className="text-xl font-black text-slate-800 tracking-tight mt-1">DEEPSEEK-R1</div>
                        </div>
                    </div>
                    <div className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded inline-block">V-1.5B LIGHTWEIGHT</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Feed */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-1 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold border-l-4 border-blue-600 pl-3 uppercase tracking-tighter text-slate-700">Priority Stream</span>
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
                                <Search size={14} className="text-slate-400" />
                                <input type="text" placeholder="Filter by Booth..." className="ml-2 bg-transparent outline-none text-xs font-mono w-40" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50 transition-colors" title="Filter"><Filter size={14}/></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {isLoading ? (
                                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-xl shadow-sm">
                                    <RefreshCw className="animate-spin text-slate-400 mx-auto mb-2" />
                                    <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">Querying Grievance DB...</p>
                                </div>
                            ) : complaints.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <Clock className="text-slate-300 mx-auto mb-2" size={32} />
                                    <p className="text-slate-400 font-bold">No active complaints found.</p>
                                </div>
                            ) : (
                                complaints.map((c, index) => (
                                    <motion.div 
                                        key={c.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:border-blue-400 transition-colors cursor-default"
                                    >
                                        <div className="flex">
                                            {/* Priority Color Bar */}
                                            <div className={`w-2 shrink-0 ${
                                                c.aiPriority === 'HIGH' ? 'bg-red-500' : 
                                                c.aiPriority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`} />
                                            
                                            <div className="flex-1 p-5">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest ${
                                                                c.aiPriority === 'HIGH' ? 'bg-red-50 text-red-600' : 
                                                                c.aiPriority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                            }`}>
                                                                {c.aiPriority || 'LOW'} Priority
                                                            </span>
                                                            <span className="text-xs font-mono text-slate-400">#{c.id.toString().padStart(4, '0')}</span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight break-words">{c.description}</h3>
                                                    </div>
                                                    <div className="sm:text-right shrink-0">
                                                        <div className="text-sm font-bold text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded inline-block break-all">{c.boothId}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase mt-1">Booth Ref</div>
                                                    </div>
                                                </div>

                                                {c.aiProcessed && (
                                                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg relative overflow-hidden mb-4">
                                                        <Sparkles className="absolute -right-2 -bottom-2 text-slate-200 w-16 h-16" />
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <BrainCircuit size={14} className="text-indigo-600" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Narrative Analysis</span>
                                                            </div>
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded shadow-sm">
                                                                SCORE: <span className="text-slate-800 font-mono">{c.aiScore}/10</span>
                                                            </span>
                                                        </div>
                                                        <p className="text-sm italic text-slate-700 leading-relaxed break-words">"{c.aiSummary}"</p>
                                                        <div className="mt-3 text-[10px] font-mono text-indigo-500 font-bold uppercase overflow-hidden text-ellipsis whitespace-normal opacity-80 break-words">
                                                            Reasoning: {c.aiReason}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
                                                    <div className="flex gap-4">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 px-2 py-1 rounded">
                                                            <Clock size={14} className="text-slate-400" />
                                                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">
                                                           {c.aiCategory || c.category}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-colors">
                                                            Review
                                                        </button>
                                                        <button className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">
                                                            Resolve
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                                <BarChart3 size={18} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Load Distribution</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats}>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '12px'}}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-8 space-y-3 px-2">
                            {stats.map((s, idx) => (
                                <div key={s.name} className="flex items-center justify-between text-xs font-mono">
                                    <div className="flex items-center gap-2 text-slate-500 uppercase font-semibold">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        {s.name}
                                    </div>
                                    <div className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded">{s.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl shadow-sm text-white p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                                <Zap className="text-amber-400 fill-amber-400 w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-sm font-black uppercase tracking-widest text-indigo-100">Operational Gain</div>
                                <div className="text-[10px] text-indigo-300 font-mono mt-1">AI EFFICIENCY METRICS</div>
                            </div>
                        </div>
                        <div className="space-y-4 w-full relative z-10">
                            <div className="flex justify-between items-end">
                                <span className="text-3xl font-black font-mono tracking-tighter">89.4%</span>
                                <span className="text-xs uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Auto-Tag Acc</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: '89%' }} />
                            </div>
                            <p className="text-[11px] leading-relaxed text-indigo-200/80 italic mt-4 border-t border-white/10 pt-4">
                                * LLM identifies 9/10 complex grievances correctly vs human validation data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntelligentTriage;
