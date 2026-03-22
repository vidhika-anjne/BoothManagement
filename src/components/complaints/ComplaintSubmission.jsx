import React, { useState } from 'react';
import { 
    MessageSquare, 
    Clock, 
    Target, 
    ShieldAlert, 
    Sparkles, 
    Send,
    MapPin,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComplaintSubmission = () => {
    const [form, setForm] = useState({
        category: '', description: '', duration: '', impact: '', details: '', boothId: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: 'info', message: 'AI Analysis in progress...' });
        
        try {
            const res = await fetch('http://localhost:8081/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setStatus({ type: 'success', message: 'Grievance recorded. AI has prioritized your request for immediate attention.' });
                setForm({ category: '', description: '', duration: '', impact: '', details: '', boothId: '' });
            } else {
                setStatus({ type: 'error', message: 'Submission failed. Please verify connection to helpdesk.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Network error. Civic services temporarily unreachable.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-6">
            {/* AI Banner Header */}
            <div className="ai-banner">
                <div className="ai-banner-icon bg-white/20">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="ai-banner-title uppercase tracking-tighter">AI-Driven Grievance Portal</h2>
                    <p className="ai-banner-sub">Intelligent triage system for accelerated civic resolution</p>
                </div>
                <div className="ai-banner-tag">HIGH PRIORITY CHANNEL</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card space-y-4">
                        <h3 className="card-title flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-blue-600" />
                            How it works
                        </h3>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                                <p>Describe your issue in plain language. Detail the impact on your community.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                                <p>Our AI analyzes the urgency, category, and scale of the problem instantly.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                                <p>High-impact issues are auto-flagged for the Booth Administrator's dashboard.</p>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gray-50/50 border-dashed">
                        <p className="text-xs text-slate-500 font-mono italic">
                            "AI identifies patterns in descriptions to prevent duplicate reports and cluster related issues."
                        </p>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5" />
                                        Category
                                    </label>
                                    <select 
                                        className="select-sm w-full"
                                        value={form.category} 
                                        onChange={e => setForm({...form, category: e.target.value})}
                                        required>
                                        <option value="">Select Service Area</option>
                                        <option>Water Supply</option>
                                        <option>Electricity</option>
                                        <option>Road & Potholes</option>
                                        <option>Sanitation/Waste</option>
                                        <option>Public Healthcare</option>
                                        <option>Other / Complex</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Booth ID / Locality
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. DEL-45" 
                                        className="select-sm w-full"
                                        value={form.boothId} 
                                        onChange={e => setForm({...form, boothId: e.target.value})} 
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Issue Description
                                </label>
                                <textarea 
                                    placeholder="Describe the problem. Mention specific landmarks if possible..."
                                    className="select-sm w-full min-h-[120px] pt-3"
                                    value={form.description} 
                                    onChange={e => setForm({...form, description: e.target.value})} 
                                    required 
                                />
                                <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-widest">
                                    * AI performs better with detailed descriptions (&gt; 50 chars)
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        Persistence
                                    </label>
                                    <select 
                                        className="select-sm w-full"
                                        value={form.duration} 
                                        onChange={e => setForm({...form, duration: e.target.value})}>
                                        <option value="">Duration of issue</option>
                                        <option>Today</option>
                                        <option>1–2 days</option>
                                        <option>3–7 days</option>
                                        <option>&gt; 1 week</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="flex items-center gap-2">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        Scale of Impact
                                    </label>
                                    <select 
                                        className="select-sm w-full"
                                        value={form.impact} 
                                        onChange={e => setForm({...form, impact: e.target.value})}>
                                        <option value="">Community Impact</option>
                                        <option>Individual House</option>
                                        <option>Few adjacent houses</option>
                                        <option>Entire street</option>
                                        <option>Whole locality</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`btn btn-primary full-btn group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {isSubmitting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                )}
                                {isSubmitting ? 'PROCESSING...' : 'SUBMIT DIRECT TO AI TRIAGE'}
                            </button>
                            
                            <AnimatePresence>
                                {status.message && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex items-center gap-3 p-4 border font-mono text-xs uppercase tracking-widest ${
                                            status.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 
                                            status.type === 'info' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                        {status.type === 'error' ? <AlertCircle className="w-4 h-4" /> : 
                                         status.type === 'info' ? <Sparkles className="w-4 h-4 animate-pulse" /> : 
                                         <CheckCircle2 className="w-4 h-4" />}
                                        {status.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintSubmission;
