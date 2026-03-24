import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Clock, 
    Target, 
    ShieldAlert, 
    Sparkles, 
    Send,
    MapPin,
    AlertCircle,
    CheckCircle2,
    BrainCircuit,
    RefreshCw,
    ListTree,
    Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComplaintSubmission = () => {
    const [form, setForm] = useState({
        category: '', description: '', duration: '', impact: '', details: '', ac: 'delhi cantt', partName: '', section: '', userImageUrl: ''
    });
    const [parts, setParts] = useState([]);
    const [sections, setSections] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch parts for Delhi Cantt
        const fetchParts = async () => {
            try {
                const res = await fetch('http://localhost:8081/api/booths/parts?ac=delhi%20cantt');
                if (res.ok) {
                    const data = await res.json();
                    setParts(data);
                }
            } catch (error) {
                console.error("Failed to fetch parts:", error);
            }
        };
        fetchParts();
    }, []);

    useEffect(() => {
        if (form.partName) {
            // Fetch sections for the selected part
            const fetchSections = async () => {
                try {
                    const res = await fetch(`http://localhost:8081/api/booths/sections`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ac: 'delhi cantt', part: form.partName }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSections(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch sections:", error);
                }
            };
            fetchSections();
        } else {
            setSections([]);
        }
    }, [form.partName]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: 'info', message: 'AI Analysis in progress...' });
        
        const complaintData = { ...form, boothId: `${form.ac}-${form.partName}-${form.section}` };

        try {
            const res = await fetch('http://localhost:8081/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complaintData)
            });
            if (res.ok) {
                setStatus({ type: 'success', message: 'Grievance recorded. AI has prioritized your request for immediate attention.' });
                setForm({ category: '', description: '', duration: '', impact: '', details: '', ac: 'delhi cantt', partName: '', section: '', userImageUrl: '' });
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
            <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white shadow-lg relative overflow-hidden mb-6">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-xl"></div>
                <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                    <Sparkles className="w-8 h-8 text-blue-100" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight mb-1">AI-Driven Grievance Portal</h2>
                    <p className="text-blue-200 text-sm">Intelligent AI triage system for accelerated civic resolution</p>
                </div>
                <div className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider flex-shrink-0">
                    HIGH PRIORITY CHANNEL
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <ShieldAlert className="w-5 h-5 text-blue-600" />
                            How it works
                        </h3>
                        <div className="space-y-5 text-sm text-gray-600">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-100 shadow-sm">1</div>
                                <p className="pt-1 leading-relaxed">Describe your issue in plain language. Detail the impact on your community.</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-100 shadow-sm">2</div>
                                <p className="pt-1 leading-relaxed">Our AI analyzes the urgency, category, and scale of the problem instantly.</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold border border-blue-100 shadow-sm">3</div>
                                <p className="pt-1 leading-relaxed">High-impact issues are auto-flagged for the Booth Administrator's dashboard.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl border border-blue-100 border-dashed p-5">
                        <p className="text-sm text-blue-700 font-mono italic flex items-start gap-2">
                            <BrainCircuit className="w-5 h-5 shrink-0 text-blue-500" />
                            "AI identifies patterns in descriptions to prevent duplicate reports and cluster related issues together."
                        </p>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        <Target className="w-4 h-4 text-blue-500" />
                                        Category
                                    </label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
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
                                                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Part Name
                                    </label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                                        value={form.partName} 
                                        onChange={e => setForm({...form, partName: e.target.value, section: ''})}
                                        required>
                                        <option value="">Select Part</option>
                                        {parts.map((part, index) => <option key={`${part.partName}-${index}`} value={part.partName}>{part.partName}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        <ListTree className="w-4 h-4 text-blue-500" />
                                        Section
                                    </label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                                        value={form.section} 
                                        onChange={e => setForm({...form, section: e.target.value})}
                                        required
                                        disabled={!form.partName || sections.length === 0}>
                                        <option value="">Select Section</option>
                                        {sections.map(section => <option key={section} value={section}>{section}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                    Issue Description
                                </label>
                                <textarea 
                                    placeholder="Describe the problem in detail. Mention specific landmarks if possible..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm min-h-[140px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none resize-y"
                                    value={form.description} 
                                    onChange={e => setForm({...form, description: e.target.value})} 
                                    required 
                                />
                                <p className="text-xs text-blue-600/70 font-mono mt-2 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    AI performs better with detailed descriptions (&gt; 50 chars)
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        Persistence
                                    </label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                                        value={form.duration} 
                                        onChange={e => setForm({...form, duration: e.target.value})}>
                                        <option value="">Duration of issue</option>
                                        <option>Today</option>
                                        <option>1–2 days</option>
                                        <option>3–7 days</option>
                                        <option>&gt; 1 week</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        <ShieldAlert className="w-4 h-4 text-blue-500" />
                                        Scale of Impact
                                    </label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
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

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    <Camera className="w-4 h-4 text-blue-500" />
                                    Photo URL (Optional)
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="https://example.com/image.jpg" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                                    value={form.userImageUrl} 
                                    onChange={e => setForm({...form, userImageUrl: e.target.value})} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`w-full py-4 px-6 rounded-lg text-white font-bold tracking-wide flex items-center justify-center gap-3 transition-all ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}`}>
                                {isSubmitting ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                                {isSubmitting ? 'PROCESSING WITH AI...' : 'SUBMIT TO AI TRIAGE'}
                            </button>
                            
                            <AnimatePresence>
                                {status.message && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex items-center gap-3 p-4 rounded-lg font-mono text-xs uppercase tracking-widest ${
                                            status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
                                            status.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        }`}>
                                        {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : 
                                         status.type === 'info' ? <Sparkles className="w-5 h-5 animate-pulse shrink-0" /> : 
                                         <CheckCircle2 className="w-5 h-5 shrink-0" />}
                                        <span className="leading-relaxed">{status.message}</span>
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
