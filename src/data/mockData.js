export const BOOTHS = [
  { id: 'B-141', name: 'Booth 141 - Connaught Place', lat: 28.6295, lng: 77.1896, voters: 892,  topIssue: 'Road Damage',  coverage: 78, engagement: 82, density: 'High',   officer: 'Ranjit Kamble' },
  { id: 'B-142', name: 'Booth 142 - Karol Bagh', lat: 28.6414, lng: 77.1869, voters: 1034, topIssue: 'Water Supply', coverage: 65, engagement: 68, density: 'Medium',  officer: 'Priya Singh'   },
  { id: 'B-143', name: 'Booth 143 - Patel Nagar', lat: 28.6352, lng: 77.2005, voters: 756,  topIssue: 'Electricity',  coverage: 49, engagement: 51, density: 'Low',     officer: 'Sonal Mishra'  },
  { id: 'B-144', name: 'Booth 144 - Rajiv Chowk', lat: 28.6328, lng: 77.2197, voters: 810,  topIssue: 'Healthcare',   coverage: 72, engagement: 76, density: 'High',    officer: 'Hari Thakur'   },
  { id: 'B-145', name: 'Booth 145 - Civil Lines', lat: 28.6476, lng: 77.2316, voters: 673,  topIssue: 'Water Supply', coverage: 61, engagement: 64, density: 'Medium',  officer: 'Deepak Sawant' },
  { id: 'B-146', name: 'Booth 146 - Kasturba Nagar', lat: 28.6160, lng: 77.1874, voters: 656,  topIssue: 'Road Damage',  coverage: 38, engagement: 41, density: 'Low',     officer: 'Mala Pawar'    },
  { id: 'B-147', name: 'Booth 147 - New Delhi', lat: 28.5921, lng: 77.2046, voters: 945,  topIssue: 'Electricity',  coverage: 75, engagement: 79, density: 'High',   officer: 'Vikram Desai'  },
  { id: 'B-148', name: 'Booth 148 - Green Park', lat: 28.5504, lng: 77.1974, voters: 812,  topIssue: 'Water Supply', coverage: 68, engagement: 71, density: 'Medium',  officer: 'Anjali Verma'  },
  { id: 'B-149', name: 'Booth 149 - Dwarka', lat: 28.5921, lng: 77.0461, voters: 1123, topIssue: 'Road Damage',  coverage: 82, engagement: 85, density: 'High',   officer: 'Suresh Kumar'  },
  { id: 'B-150', name: 'Booth 150 - South Delhi', lat: 28.5244, lng: 77.1855, voters: 734,  topIssue: 'Healthcare',   coverage: 55, engagement: 58, density: 'Medium',  officer: 'Meera Sharma'  },
  { id: 'B-151', name: 'Booth 151 - Hauz Khas', lat: 28.5506, lng: 77.2034, voters: 567,  topIssue: 'Drainage',     coverage: 42, engagement: 45, density: 'Low',     officer: 'Arjun Singh'   },
  { id: 'B-152', name: 'Booth 152 - Noida Border', lat: 28.5355, lng: 77.3710, voters: 1089, topIssue: 'Electricity',  coverage: 71, engagement: 74, density: 'High',   officer: 'Neha Kapoor'   },
];

export const VOTERS = [
  { id:'MH-2024-1001', name:'Ramesh Yadav',   age:45, gender:'Male',   booth:'Booth 142', category:'Farmer',         schemes:['PM Kisan','Ujjwala'],       status:'Active'   },
  { id:'MH-2024-1002', name:'Sunita Devi',    age:38, gender:'Female', booth:'Booth 142', category:'Women',          schemes:['PM Awas'],                  status:'Active'   },
  { id:'MH-2024-1003', name:'Aakash Singh',   age:22, gender:'Male',   booth:'Booth 141', category:'Student',        schemes:[],                           status:'Active'   },
  { id:'MH-2024-1004', name:'Kamla Bai',      age:68, gender:'Female', booth:'Booth 143', category:'Senior Citizen', schemes:['Ayushman','PM Awas','Ujjwala'], status:'Active' },
  { id:'MH-2024-1005', name:'Mohan Patel',    age:51, gender:'Male',   booth:'Booth 144', category:'Business Owner', schemes:['MSME Credit'],              status:'Active'   },
  { id:'MH-2024-1006', name:'Priya Chavan',   age:29, gender:'Female', booth:'Booth 141', category:'Women',          schemes:['PM Awas','Ujjwala'],        status:'Active'   },
  { id:'MH-2024-1007', name:'Dinesh Kumar',   age:58, gender:'Male',   booth:'Booth 145', category:'Farmer',         schemes:['PM Kisan','Crop Insurance'],status:'Active'   },
  { id:'MH-2024-1008', name:'Anita Desai',    age:34, gender:'Female', booth:'Booth 146', category:'Women',          schemes:['Ujjwala'],                  status:'Active'   },
  { id:'MH-2024-1009', name:'Vijay Shinde',   age:41, gender:'Male',   booth:'Booth 142', category:'Farmer',         schemes:['PM Kisan'],                 status:'Pending'  },
  { id:'MH-2024-1010', name:'Meena Joshi',    age:72, gender:'Female', booth:'Booth 143', category:'Senior Citizen', schemes:['Ayushman','PM Awas','Pension'], status:'Active' },
  { id:'MH-2024-1011', name:'Sachin Wagh',    age:19, gender:'Male',   booth:'Booth 144', category:'Student',        schemes:[],                           status:'Active'   },
  { id:'MH-2024-1012', name:'Rashmi Shah',    age:47, gender:'Female', booth:'Booth 141', category:'Business Owner', schemes:['MSME Credit'],              status:'Active'   },
  { id:'MH-2024-1013', name:'Govind Nair',    age:65, gender:'Male',   booth:'Booth 145', category:'Senior Citizen', schemes:['Ayushman','Pension'],       status:'Active'   },
  { id:'MH-2024-1014', name:'Kavita More',    age:31, gender:'Female', booth:'Booth 146', category:'Women',          schemes:['PM Awas','Ujjwala'],        status:'Active'   },
  { id:'MH-2024-1015', name:'Haresh Borge',   age:53, gender:'Male',   booth:'Booth 142', category:'Farmer',         schemes:['PM Kisan','Ujjwala','Crop Insurance'], status:'Pending' },
  { id:'MH-2024-1016', name:'Neha Patil',     age:25, gender:'Female', booth:'Booth 143', category:'Student',        schemes:[],                           status:'Active'   },
  { id:'MH-2024-1017', name:'Ram Choudhary',  age:48, gender:'Male',   booth:'Booth 144', category:'Farmer',         schemes:['PM Kisan','Crop Insurance'],status:'Active'   },
  { id:'MH-2024-1018', name:'Sushila Pawar',  age:70, gender:'Female', booth:'Booth 145', category:'Senior Citizen', schemes:['Ayushman','PM Awas','Pension'], status:'Active' },
  { id:'MH-2024-1019', name:'Nitin Rane',     age:36, gender:'Male',   booth:'Booth 141', category:'Business Owner', schemes:[],                           status:'Inactive' },
  { id:'MH-2024-1020', name:'Usha Tiwari',    age:43, gender:'Female', booth:'Booth 146', category:'Women',          schemes:['Ujjwala'],                  status:'Active'   },
];

export const SEGMENTS = [
  { id:'farmers',  emoji:'🌾', name:'Farmers',         count:1243, color:'#10b981', topIssue:'Water scarcity',   scheme:'PM Kisan Samman'    },
  { id:'students', emoji:'🎓', name:'Students',        count:687,  color:'#3b82f6', topIssue:'Scholarship gaps', scheme:'Scholarship Scheme'  },
  { id:'seniors',  emoji:'👴', name:'Senior Citizens', count:512,  color:'#f59e0b', topIssue:'Healthcare',       scheme:'Ayushman Bharat'     },
  { id:'women',    emoji:'👩', name:'Women',           count:1384, color:'#ec4899', topIssue:'Safety & housing', scheme:'PM Awas Yojana'      },
  { id:'business', emoji:'🏪', name:'Business Owners', count:395,  color:'#8b5cf6', topIssue:'Loan access',      scheme:'MSME Credit Scheme'  },
];

export const ISSUES = [
  { id:'ISS-001', title:'Water Supply Disrupted – Sector B',   category:'Water Supply',  booth:'Booth 142', reporter:'Ramesh Yadav',  date:'2026-03-05', priority:'High', status:'Open'        },
  { id:'ISS-002', title:'Pothole on Main Road Near School',    category:'Road Damage',   booth:'Booth 141', reporter:'Priya Chavan',  date:'2026-03-04', priority:'Med',  status:'In Progress' },
  { id:'ISS-003', title:'Frequent Evening Power Cuts',         category:'Electricity',   booth:'Booth 143', reporter:'Kamla Bai',     date:'2026-03-03', priority:'High', status:'Open'        },
  { id:'ISS-004', title:'No Doctor at Primary Health Center',  category:'Healthcare',    booth:'Booth 144', reporter:'Mohan Patel',   date:'2026-03-02', priority:'High', status:'Open'        },
  { id:'ISS-005', title:'Pipeline Leakage – Housing Colony',   category:'Water Supply',  booth:'Booth 145', reporter:'Dinesh Kumar',  date:'2026-03-01', priority:'Med',  status:'In Progress' },
  { id:'ISS-006', title:'Post-Monsoon Road Repair Pending',    category:'Road Damage',   booth:'Booth 146', reporter:'Kavita More',   date:'2026-02-28', priority:'Low',  status:'Resolved'    },
  { id:'ISS-007', title:'Open Drainage Health Hazard',         category:'Drainage',      booth:'Booth 142', reporter:'Sunita Devi',   date:'2026-02-27', priority:'High', status:'Open'        },
  { id:'ISS-008', title:'6 Street Lights Non-functional',      category:'Street Lights', booth:'Booth 141', reporter:'Aakash Singh',  date:'2026-02-26', priority:'Low',  status:'Resolved'    },
  { id:'ISS-009', title:'Garbage Collection Stopped – 1 Week', category:'Garbage',      booth:'Booth 143', reporter:'Neha Patil',    date:'2026-02-25', priority:'Med',  status:'In Progress' },
  { id:'ISS-010', title:'Contaminated Water Complaints',       category:'Water Supply',  booth:'Booth 144', reporter:'Ram Choudhary', date:'2026-02-24', priority:'High', status:'Open'        },
];

export const CAMPAIGNS = [
  { id:1, title:'Water Crisis Awareness Drive', desc:'Informing voters about water conservation schemes and reporting mechanisms for supply issues.', status:'Active',    progress:68,  reach:2840, color:'#3b82f6', date:'Mar 1 – Mar 15',  channels:['SMS','WhatsApp'] },
  { id:2, title:'PM Kisan Enrollment',          desc:'Outreach to eligible farmers for PM Kisan Samman Nidhi — door to door by booth workers.',     status:'Active',    progress:45,  reach:1243, color:'#10b981', date:'Feb 20 – Mar 20', channels:['Voice','App']    },
  { id:3, title:'Women Safety Initiative',       desc:'Inform women voters about helpline numbers, safety schemes, and nearest support centers.',     status:'Completed', progress:100, reach:1384, color:'#ec4899', date:'Feb 1 – Feb 28',  channels:['WhatsApp','SMS'] },
  { id:4, title:'Youth Scholarship Drive',       desc:'Connecting students with scholarship portals and walk-in registration at Booth 141 office.',   status:'Planned',   progress:0,   reach:687,  color:'#8b5cf6', date:'Mar 10 – Mar 30', channels:['App','SMS']     },
  { id:5, title:'Senior Citizen Health Camp',    desc:'Free health check-up camp and Ayushman Bharat card enrollment for senior citizens.',           status:'Active',    progress:32,  reach:512,  color:'#f59e0b', date:'Mar 5 – Mar 18',  channels:['Voice','SMS']   },
  { id:6, title:'Road Damage Mapping',           desc:'Citizen survey to digitally map all road damage reports for municipality action.',              status:'Active',    progress:55,  reach:1548, color:'#6366f1', date:'Feb 25 – Mar 15', channels:['App','WhatsApp']},
];

export const INSIGHTS = [
  { type:'Alert',       color:'#ef4444', bgColor:'rgba(239,68,68,.1)',    icon:'AlertTriangle', title:'Water Complaints Surge in Booth 145',          body:'Water complaints increased 340% in 2 weeks. 87 voters affected. Immediate intervention recommended.',                                            confidence:94, action:'View affected voters'    },
  { type:'Opportunity', color:'#10b981', bgColor:'rgba(16,185,129,.1)',   icon:'TrendingUp',    title:'Scholarship Adoption Very Low Among Youth',     body:'Only 12% of eligible youth voters (age 18–25) in Booths 141 & 143 have enrolled in available scholarship schemes.',                           confidence:88, action:'Launch enrollment drive'  },
  { type:'Insight',     color:'#3b82f6', bgColor:'rgba(59,130,246,.1)',   icon:'Users',         title:'Ward 8 Has High Farmer Concentration',          body:'Booths 142 & 145 have 58% farmer demographic. PM Kisan, crop insurance campaigns would yield 3.2× engagement.',                               confidence:91, action:'Create farmer campaign'   },
  { type:'Risk',        color:'#f59e0b', bgColor:'rgba(245,158,11,.1)',   icon:'ShieldAlert',   title:'Low Engagement in Booth 146',                   body:'Engagement score dropped to 31% — lowest in ward. 3 field workers inactive for 7+ days.',                                                      confidence:85, action:'Assign new workers'       },
  { type:'Insight',     color:'#8b5cf6', bgColor:'rgba(139,92,246,.1)',   icon:'Sparkles',      title:'PM Awas Yojana: 143 More Eligible',             body:'AI identified 143 additional Booth 142 voters who meet eligibility criteria but haven\'t applied yet.',                                          confidence:96, action:'Start outreach'            },
  { type:'Alert',       color:'#ef4444', bgColor:'rgba(239,68,68,.1)',    icon:'Zap',           title:'Electricity Complaints Rising: Booth 143',      body:'7 duplicate electricity complaints indicate infrastructure failure, not individual issues. Escalation needed.',                                  confidence:89, action:'Escalate to MSEDCL'       },
  { type:'Opportunity', color:'#10b981', bgColor:'rgba(16,185,129,.1)',   icon:'Heart',         title:'Senior Citizens: Healthcare Camp Needed',       body:'68% of voters 65+ have not accessed Ayushman Bharat. A physical camp at Booth 144 would enroll 200+ residents.',                               confidence:93, action:'Schedule health camp'      },
  { type:'Insight',     color:'#3b82f6', bgColor:'rgba(59,130,246,.1)',   icon:'BarChart2',     title:'WhatsApp Primary Channel for 62% Voters',      body:'Survey data shows WhatsApp preferred by 62% of active voters. SMS fallback needed for remaining 38%.',                                          confidence:87, action:'Update comm strategy'      },
  { type:'Risk',        color:'#f59e0b', bgColor:'rgba(245,158,11,.1)',   icon:'Clock',         title:'4 Critical Issues Unresolved for 7+ Days',      body:'ISS-001, ISS-003, ISS-004, ISS-010 are critical and unresolved. Voter dissatisfaction rising in Booths 142–144.',                               confidence:97, action:'Escalate issues'           },
];

export const ACTIVITY = [
  { color:'#10b981', text:'<strong>Priya Singh</strong> added 4 new voters in Booth 142',    time:'2 min'  },
  { color:'#ef4444', text:'New <strong>Water Supply</strong> issue reported at Booth 145',   time:'14 min' },
  { color:'#6366f1', text:'<strong>Ramesh Yadav</strong> enrolled in PM Kisan Samman',       time:'28 min' },
  { color:'#f59e0b', text:'AI generated <strong>9 new insights</strong> from booth data',   time:'45 min' },
  { color:'#3b82f6', text:'Campaign <strong>"Women Safety"</strong> reached 1,384 voters',  time:'1 hr'   },
  { color:'#8b5cf6', text:'Booth 144 <strong>health camp survey</strong> completed — 89',   time:'2 hr'   },
  { color:'#10b981', text:'Road Damage ISS-006 <strong>marked as resolved</strong>',        time:'3 hr'   },
];

export const NOTIFICATIONS = [
  {
    id: 'N-001', issueRef: 'ISS-008', type: 'resolved',
    title: '6 Street Lights Repaired — Gandhi Chowk, Booth 141',
    body: 'All 6 non-functional street lights near Gandhi Chowk, Booth 141 have been repaired, rewired and fully commissioned by BSES Delhi. Nighttime safety in the locality is completely restored.',
    category: 'Street Lights', booth: 'Booth 141', resolvedDate: '2026-03-08',
    resolvedBy: 'BSES Delhi', sentTo: 1240, channels: ['SMS', 'WhatsApp'],
    beforeDesc: 'All 6 lights non-functional since Feb 26 — area pitch-dark at night',
    afterDesc: '6/6 lights repaired, tested & commissioned successfully',
    visualType: 'streetlight', read: false, time: '2 hours ago',
  },
  {
    id: 'N-002', issueRef: 'ISS-006', type: 'resolved',
    title: 'Road Repaired — Main Junction, Booth 146',
    body: 'Post-monsoon road damage at the main junction near Booth 146 has been fully repaired. PWD Delhi laid 120m of fresh asphalt and refreshed road markings.',
    category: 'Roads & Drainage', booth: 'Booth 146', resolvedDate: '2026-03-07',
    resolvedBy: 'PWD Delhi', sentTo: 823, channels: ['SMS'],
    beforeDesc: 'Large potholes causing vehicle damage & daily accidents',
    afterDesc: 'New tar surface laid; road markings refreshed',
    visualType: 'road', read: false, time: '1 day ago',
  },
  {
    id: 'N-003', issueRef: 'ISS-002', type: 'in-progress',
    title: 'Pothole Repair Underway — School Road, Booth 141',
    body: 'Repair work has commenced on the dangerous pothole near the school entry road, Booth 141. Temporary patchwork is done; full resurfacing is expected within 2 working days.',
    category: 'Roads & Drainage', booth: 'Booth 141', resolvedDate: '2026-03-06',
    resolvedBy: 'PMC Roads Dept.', sentTo: 756, channels: ['WhatsApp'],
    beforeDesc: 'Deep pothole causing accidents & injuries near school gate',
    afterDesc: 'Temporary patch done; full resurfacing in progress',
    visualType: 'pothole', read: true, time: '2 days ago',
  },
];

export const FIELD_WORKERS = [
  { id:'fw1', name:'Priya Singh',   initials:'PS', booth:'Booth 142', online:true,  color:'#6366f1' },
  { id:'fw2', name:'Ranjit Kamble', initials:'RK', booth:'Booth 141', online:true,  color:'#10b981' },
  { id:'fw3', name:'Sonal Mishra',  initials:'SM', booth:'Booth 143', online:false, color:'#f59e0b' },
  { id:'fw4', name:'Hari Thakur',   initials:'HT', booth:'Booth 144', online:true,  color:'#ec4899' },
  { id:'fw5', name:'Deepak Sawant', initials:'DS', booth:'Booth 145', online:false, color:'#8b5cf6' },
  { id:'fw6', name:'Mala Pawar',    initials:'MP', booth:'Booth 146', online:true,  color:'#3b82f6' },
];

export const RECENT_CAMPAIGNS = [
  { color:'#3b82f6', title:'Water Awareness SMS',      meta:'2,840 sent · 2 days ago',     badge:'Sent'      },
  { color:'#10b981', title:'Kisan WhatsApp Drive',     meta:'1,243 delivered · 4 days ago', badge:'Delivered' },
  { color:'#f59e0b', title:'Health Camp Voice Alert',  meta:'512 called · 1 week ago',     badge:'Completed' },
];

export const GRAPH_DATA = {
  nodes: [
    { id:'v1',  label:'Ramesh Yadav',  type:'voter',  group:1 },
    { id:'v2',  label:'Sunita Devi',   type:'voter',  group:1 },
    { id:'v3',  label:'Kamla Bai',     type:'voter',  group:1 },
    { id:'v4',  label:'Aakash Singh',  type:'voter',  group:1 },
    { id:'v5',  label:'Priya Chavan',  type:'voter',  group:1 },
    { id:'v6',  label:'Mohan Patel',   type:'voter',  group:1 },
    { id:'v7',  label:'Dinesh Kumar',  type:'voter',  group:1 },
    { id:'v8',  label:'Meena Joshi',   type:'voter',  group:1 },
    { id:'b1',  label:'Booth 141',     type:'booth',  group:2 },
    { id:'b2',  label:'Booth 142',     type:'booth',  group:2 },
    { id:'b3',  label:'Booth 143',     type:'booth',  group:2 },
    { id:'w1',  label:'Ward 8',        type:'ward',   group:3 },
    { id:'s1',  label:'PM Kisan',      type:'scheme', group:4 },
    { id:'s2',  label:'PM Awas',       type:'scheme', group:4 },
    { id:'s3',  label:'Ayushman',      type:'scheme', group:4 },
    { id:'s4',  label:'Scholarship',   type:'scheme', group:4 },
    { id:'s5',  label:'Ujjwala',       type:'scheme', group:4 },
    { id:'i1',  label:'Water Supply',  type:'issue',  group:5 },
    { id:'i2',  label:'Road Damage',   type:'issue',  group:5 },
    { id:'i3',  label:'Electricity',   type:'issue',  group:5 },
    { id:'i4',  label:'Healthcare',    type:'issue',  group:5 },
    { id:'wk1', label:'Priya Singh',   type:'worker', group:6 },
    { id:'wk2', label:'Ranjit Kamble', type:'worker', group:6 },
  ],
  links: [
    { source:'v1', target:'b2',  label:'lives in'    },
    { source:'v2', target:'b2',  label:'lives in'    },
    { source:'v3', target:'b3',  label:'lives in'    },
    { source:'v4', target:'b1',  label:'lives in'    },
    { source:'v5', target:'b1',  label:'lives in'    },
    { source:'v6', target:'b2',  label:'lives in'    },
    { source:'v7', target:'b2',  label:'lives in'    },
    { source:'v8', target:'b3',  label:'lives in'    },
    { source:'b1', target:'w1',  label:'part of'     },
    { source:'b2', target:'w1',  label:'part of'     },
    { source:'b3', target:'w1',  label:'part of'     },
    { source:'v1', target:'s1',  label:'eligible for'},
    { source:'v1', target:'s2',  label:'eligible for'},
    { source:'v2', target:'s2',  label:'eligible for'},
    { source:'v3', target:'s3',  label:'eligible for'},
    { source:'v4', target:'s4',  label:'eligible for'},
    { source:'v5', target:'s2',  label:'eligible for'},
    { source:'v6', target:'s5',  label:'enrolled in' },
    { source:'v7', target:'s1',  label:'enrolled in' },
    { source:'v8', target:'s3',  label:'enrolled in' },
    { source:'v1', target:'i1',  label:'reported'    },
    { source:'v2', target:'i1',  label:'reported'    },
    { source:'v3', target:'i3',  label:'reported'    },
    { source:'v4', target:'i2',  label:'reported'    },
    { source:'v5', target:'i2',  label:'reported'    },
    { source:'v6', target:'i1',  label:'reported'    },
    { source:'v8', target:'i4',  label:'reported'    },
    { source:'wk1',target:'b2',  label:'manages'     },
    { source:'wk2',target:'b1',  label:'manages'     },
    { source:'wk1',target:'v1',  label:'assigned to' },
    { source:'wk1',target:'v2',  label:'assigned to' },
  ],
};

export const NODE_COLORS = { voter:'#6366f1', booth:'#10b981', ward:'#f59e0b', scheme:'#8b5cf6', issue:'#ef4444', worker:'#3b82f6' };
export const NODE_SIZES  = { voter:12, booth:18, ward:22, scheme:14, issue:14, worker:14 };

export const VOTER_DB = [
  { voterId: 'MHA2401001', name: 'Ramesh Yadav', aadhaar: '234567890123', dob: '1980-03-10', booth: 'Booth 142', status: 'Active', officer: 'Priya Singh', enrolled: '2024-01-15', gender: 'Male' },
  { voterId: 'MHA2401002', name: 'Sunita Devi',  aadhaar: '345678901234', dob: '1987-07-22', booth: 'Booth 142', status: 'Active', officer: 'Priya Singh', enrolled: '2024-02-01', gender: 'Female' },
  { voterId: 'DEL2401003', name: 'Aakash Singh', aadhaar: '456789012345', dob: '2004-11-05', booth: 'Booth 141', status: 'Active', officer: 'Ranjit Kamble', enrolled: '2024-07-10', gender: 'Male' },
  { voterId: 'DEL2401004', name: 'Kamla Bai',    aadhaar: '567890123456', dob: '1958-01-20', booth: 'Booth 143', status: 'Active', officer: 'Sonal Mishra', enrolled: '2024-03-05', gender: 'Female' },
  { voterId: 'MHA2401005', name: 'Mohan Patel',  aadhaar: '678901234567', dob: '1972-05-15', booth: 'Booth 144', status: 'Pending', officer: 'Hari Thakur', enrolled: '2026-02-20', gender: 'Male' },
  { voterId: 'DEL2401006', name: 'Priya Chavan', aadhaar: '789012345678', dob: '1995-08-30', booth: 'Booth 141', status: 'Active', officer: 'Ranjit Kamble', enrolled: '2024-06-12', gender: 'Female' },
  { voterId: 'MHA2401007', name: 'Dinesh Kumar', aadhaar: '890123456789', dob: '1968-11-25', booth: 'Booth 145', status: 'Active', officer: 'Deepak Sawant', enrolled: '2024-01-08', gender: 'Male' },
  { voterId: 'DEL2401008', name: 'Anita Desai',  aadhaar: '901234567890', dob: '1990-02-14', booth: 'Booth 146', status: 'Active', officer: 'Mala Pawar', enrolled: '2023-12-25', gender: 'Female' },
];

export const AI_MESSAGES = [
  'Dear Voter, the Water Supply scheme in Booth 142 is approved. Enroll at your nearest booth office. — Ward 8',
  'Dear Farmer, you are eligible for PM Kisan Samman ₹6000/yr. Contact Booth Worker Priya Singh: 98XXXXXXXX.',
  'Dear Senior Citizen, free health camp on Mar 12 at Booth 144. Bring Aadhaar card. Ayushman Bharat enrollment.',
  'Dear Student, scholarship portal now open. Register at booth/online before Mar 31. Ward 8 Education Drive.',
  'Important: Ward 8 road repair work begins Mar 10. Temporary diversions in Booth 141 area. Plan accordingly.',
];
