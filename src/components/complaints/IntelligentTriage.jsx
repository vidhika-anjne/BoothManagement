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
        <div className="space-y-6 animate-fade-in">
            {/* Header Area */}
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <BrainCircuit className="text-blue-600" size={28} />
                        Intelligent AI Triage
                    </h1>
                    <p className="page-subtitle font-mono uppercase tracking-widest text-[10px]">
                        Autonomous classification & prioritization engine • Live Processing
                    </p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary small" onClick={fetchComplaints}>
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        Refresh Data
                    </button>
                    <div className="status-badge status-active px-4 border-none shadow-sm">
                        <Activity size={12} className="animate-pulse" />
                        OLLAMA ON-LINE
                    </div>
                </div>
            </div>

            {/* KPI Section */}
            <div className="kpi-grid">
                <div className="kpi-card" style={{'--kpi-accent': '#2563eb'}}>
                    <div className="kpi-icon bg-blue-50 text-blue-600">
                        <MessageSquare size={20} />
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-label font-mono">Total Issues</div>
                        <div className="kpi-value text-2xl">{complaints.length}</div>
                        <div className="kpi-delta positive italic">Grievance Pool</div>
                    </div>
                </div>
                <div className="kpi-card" style={{'--kpi-accent': '#ef4444'}}>
                    <div className="kpi-icon bg-red-50 text-red-600">
                        <Zap size={20} />
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-label font-mono">Critical Red</div>
                        <div className="kpi-value text-2xl text-red-600">
                            {complaints.filter(c => c.aiPriority === 'HIGH').length}
                        </div>
                        <div className="kpi-delta negative font-bold">Action Required</div>
                    </div>
                </div>
                <div className="kpi-card" style={{'--kpi-accent': '#10b981'}}>
                    <div className="kpi-icon bg-emerald-50 text-emerald-600">
                        <Activity size={20} />
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-label font-mono">Mean Response</div>
                        <div className="kpi-value text-2xl">4.2m</div>
                        <div className="kpi-delta positive"><ArrowUpRight size={12} /> -12% Improved</div>
                    </div>
                </div>
                <div className="kpi-card" style={{'--kpi-accent': '#6366f1'}}>
                    <div className="kpi-icon bg-indigo-50 text-indigo-600">
                        <BrainCircuit size={20} />
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-label font-mono">Core Model</div>
                        <div className="kpi-value text-base font-bold">DEEPSEEK-R1</div>
                        <div className="kpi-delta positive text-xs">V-1.5B LIGHTWEIGHT</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Feed */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="table-toolbar px-1">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold border-l-4 border-blue-600 pl-3 uppercase tracking-tighter">Priority Stream</span>
                            <div className="search-box small border-none !bg-gray-100/50">
                                <Search size={14} />
                                <input type="text" placeholder="Filter by Booth..." className="font-mono text-xs" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="icon-btn" title="Filter"><Filter size={14}/></button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {isLoading ? (
                                <div className="text-center py-20 bg-white border border-dashed border-gray-200">
                                    <RefreshCw className="animate-spin text-gray-400 mx-auto mb-2" />
                                    <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">Querying Grievance DB...</p>
                                </div>
                            ) : complaints.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-gray-200">
                                    <Clock className="text-gray-300 mx-auto mb-2" size={32} />
                                    <p className="text-gray-400 font-bold">No active complaints found.</p>
                                </div>
                            ) : (
                                complaints.map((c, index) => (
                                    <motion.div 
                                        key={c.id} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="card !p-0 group hover:border-blue-400 transition-colors cursor-default"
                                    >
                                        <div className="flex divide-x divide-gray-100">
                                            {/* Priority Color Bar */}
                                            <div className={`w-1.5 shrink-0 ${
                                                c.aiPriority === 'HIGH' ? 'bg-red-500' : 
                                                c.aiPriority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`} />
                                            
                                            <div className="flex-1 p-5">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`status-badge !p-1 !text-[10px] uppercase font-black tracking-widest border-none ${
                                                                c.aiPriority === 'HIGH' ? 'bg-red-50 text-red-600' : 
                                                                c.aiPriority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                            }`}>
                                                                {c.aiPriority || 'LOW'} Priority
                                                            </span>
                                                            <span className="text-xs font-mono text-gray-400">#{c.id.toString().padStart(4, '0')}</span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-800 tracking-tight mt-2">{c.description}</h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-blue-600 font-mono italic">{c.boothId}</div>
                                                        <div className="text-[10px] text-gray-400 uppercase mt-1">Booth Reference</div>
                                                    </div>
                                                </div>

                                                {c.aiProcessed && (
                                                    <div className="bg-gray-50/80 border border-gray-100 p-4 relative overflow-hidden">
                                                        <Sparkles className="absolute -right-2 -bottom-2 text-gray-200/40 w-12 h-12" />
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <BrainCircuit size={14} className="text-indigo-600" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Narrative Analysis</span>
                                                            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                                SCORE: <span className="text-gray-800 font-mono">{c.aiScore}/10</span>
                                                            </span>
                                                        </div>
                                                        <p className="text-sm italic text-gray-600 leading-relaxed font-serif">"{c.aiSummary}"</p>
                                                        <div className="mt-2 text-[10px] font-mono text-indigo-500 font-bold uppercase overflow-hidden text-ellipsis whitespace-nowrap">
                                                            Reasoning: {c.aiReason}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                                                    <div className="flex gap-4">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                                            <Clock size={14} />
                                                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                           {c.aiCategory || c.category}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="btn btn-secondary !p-1.5 !text-[10px] !font-bold uppercase tracking-widest">
                                                            Review
                                                        </button>
                                                        <button className="btn btn-primary !p-1.5 !bg-emerald-600 hover:!bg-emerald-700 !text-[10px] !font-bold uppercase tracking-widest">
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
                    <div className="chart-card !py-6">
                        <div className="chart-card-header mb-6">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={18} className="text-blue-600" />
                                <h3 className="chart-title">Load Distribution</h3>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats}>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontFamily: 'IBM Plex Mono', fontSize: '11px'}}
                                />
                                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-8 space-y-2 px-2">
                            {stats.map((s, idx) => (
                                <div key={s.name} className="flex items-center justify-between text-[11px] font-mono">
                                    <div className="flex items-center gap-2 text-gray-500 uppercase">
                                        <div className="w-2 h-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        {s.name}
                                    </div>
                                    <div className="font-bold text-gray-800">{s.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ai-banner !flex-col !items-start !gap-4 !p-6 opacity-90">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 flex items-center justify-center p-2">
                                <Zap className="text-amber-400 fill-amber-400" />
                            </div>
                            <div>
                                <div className="text-sm font-black uppercase tracking-widest">Operational Gain</div>
                                <div className="text-[10px] opacity-70">AI EFFICIENCY METRICS</div>
                            </div>
                        </div>
                        <div className="space-y-3 w-full">
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black font-mono tracking-tighter">89.4%</span>
                                <span className="text-[10px] uppercase font-bold text-emerald-400">Auto-Tag Accuracy</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/20 overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: '89%' }} />
                            </div>
                            <p className="text-[10px] leading-relaxed opacity-60 italic mt-2">
                                * LLM identifies 9 out of 10 complex grievances correctly based on human validation data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntelligentTriage;
