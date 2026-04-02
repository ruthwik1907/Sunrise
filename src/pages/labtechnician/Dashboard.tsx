import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  FlaskConical, Search, CheckCircle, Clock, AlertTriangle,
  FileText, User, TrendingUp, BookOpen, X, ChevronDown, ChevronRight, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'pending' | 'completed' | 'catalog' | 'revenue';

// Test catalog with price, TAT, and normal ranges
const TEST_CATALOG = [
  { name: 'CBC (Complete Blood Count)', price: 350, tat: '4 hrs', parameters: [
    { name: 'Hemoglobin', unit: 'g/dL', low: 12, high: 17 },
    { name: 'WBC Count', unit: '10³/µL', low: 4, high: 11 },
    { name: 'Platelet Count', unit: '10³/µL', low: 150, high: 400 },
    { name: 'RBC Count', unit: 'million/µL', low: 4.2, high: 5.9 },
  ]},
  { name: 'Blood Glucose (Fasting)', price: 120, tat: '2 hrs', parameters: [
    { name: 'Glucose', unit: 'mg/dL', low: 70, high: 100 },
  ]},
  { name: 'Lipid Profile', price: 500, tat: '4 hrs', parameters: [
    { name: 'Total Cholesterol', unit: 'mg/dL', low: 0, high: 200 },
    { name: 'HDL', unit: 'mg/dL', low: 40, high: 60 },
    { name: 'LDL', unit: 'mg/dL', low: 0, high: 100 },
    { name: 'Triglycerides', unit: 'mg/dL', low: 0, high: 150 },
  ]},
  { name: 'Urine Routine', price: 150, tat: '2 hrs', parameters: [
    { name: 'pH', unit: '', low: 4.5, high: 8 },
    { name: 'Protein', unit: 'mg/dL', low: 0, high: 14 },
    { name: 'Glucose', unit: 'mg/dL', low: 0, high: 15 },
  ]},
  { name: 'Thyroid Profile (TSH)', price: 450, tat: '6 hrs', parameters: [
    { name: 'TSH', unit: 'mIU/L', low: 0.4, high: 4.0 },
    { name: 'T3', unit: 'ng/dL', low: 80, high: 200 },
    { name: 'T4', unit: 'µg/dL', low: 5.1, high: 14.1 },
  ]},
  { name: 'Liver Function Test', price: 600, tat: '6 hrs', parameters: [
    { name: 'SGOT (AST)', unit: 'U/L', low: 10, high: 40 },
    { name: 'SGPT (ALT)', unit: 'U/L', low: 7, high: 56 },
    { name: 'Total Bilirubin', unit: 'mg/dL', low: 0.2, high: 1.2 },
    { name: 'Albumin', unit: 'g/dL', low: 3.4, high: 5.4 },
  ]},
  { name: 'Kidney Function Test', price: 550, tat: '4 hrs', parameters: [
    { name: 'Creatinine', unit: 'mg/dL', low: 0.6, high: 1.2 },
    { name: 'Urea', unit: 'mg/dL', low: 15, high: 45 },
    { name: 'Uric Acid', unit: 'mg/dL', low: 3.5, high: 7.2 },
  ]},
  { name: 'X-Ray', price: 300, tat: '1 hr', parameters: [] },
  { name: 'ECG', price: 250, tat: '30 min', parameters: [] },
  { name: 'Ultrasound', price: 800, tat: '1 hr', parameters: [] },
  { name: 'CT Scan', price: 3500, tat: '2 hrs', parameters: [] },
  { name: 'MRI', price: 7000, tat: '3 hrs', parameters: [] },
];

export default function LabTechnicianDashboard() {
  const { currentUser, labReports, users, updateLabReportStatus, createLabReport, invoices } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewReport, setShowNewReport] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!currentUser) return null;

  const today = new Date().toDateString();
  const pendingReports = labReports.filter(r => r.status === 'pending');
  const completedReports = labReports.filter(r => r.status === 'completed');
  const completedToday = completedReports.filter(r => r.completedAt && new Date(r.completedAt).toDateString() === today);
  const urgentReports = pendingReports.filter(r => {
    const hrs = (Date.now() - new Date(r.date).getTime()) / 3600000;
    return hrs > 24;
  });

  // Revenue from lab invoices
  const labRevenue = invoices ? invoices.filter(i =>
    i.description?.toLowerCase().includes('lab') ||
    i.type === 'lab' ||
    i.items?.some((item: any) => item.type === 'lab_test')
  ).reduce((sum: number, i: any) => sum + (i.amount || 0), 0) : 0;

  const filter = (list: any[]) => list.filter(r => {
    const patient = users.find(u => u.id === r.patientId);
    const doctor = users.find(u => u.id === r.doctorId);
    return (patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.testType || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'pending', label: 'Pending Tests', count: pendingReports.length },
    { id: 'completed', label: 'Completed', count: completedReports.length },
    { id: 'catalog', label: 'Test Catalog', count: TEST_CATALOG.length },
    { id: 'revenue', label: 'Lab Revenue' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lab Technician Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage laboratory tests, results and reports</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-900">{currentUser.name}</p>
            <p className="text-slate-500">Lab Technician</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Tests', value: pendingReports.length, icon: Clock, color: 'amber' },
          { label: 'Done Today', value: completedToday.length, icon: CheckCircle, color: 'emerald' },
          { label: 'Total Reports', value: labReports.length, icon: FileText, color: 'blue' },
          { label: 'Urgent (>24h)', value: urgentReports.length, icon: AlertTriangle, color: 'red' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 text-${color}-600`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pr-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
            </div>
            <button onClick={() => setShowNewReport(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
              + New Report
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* ── PENDING TESTS ── */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              {urgentReports.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700 font-medium">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {urgentReports.length} test{urgentReports.length > 1 ? 's' : ''} pending for over 24 hours — please prioritize!
                </div>
              )}
              {filter(pendingReports).length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">All caught up!</h3>
                  <p className="mt-1 text-sm text-slate-500">No pending lab tests.</p>
                </div>
              ) : (
                filter(pendingReports).map(report => {
                  const patient = users.find(u => u.id === report.patientId);
                  const doctor = users.find(u => u.id === report.doctorId);
                  const isUrgent = (Date.now() - new Date(report.date).getTime()) / 3600000 > 24;
                  const catalog = TEST_CATALOG.find(t => t.name === report.testType);
                  return (
                    <div key={report.id} className={`rounded-xl border p-4 ${isUrgent ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUrgent ? 'bg-red-100' : 'bg-purple-100'}`}>
                            <User className={`h-5 w-5 ${isUrgent ? 'text-red-600' : 'text-purple-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900">{patient?.name || 'Unknown'}</span>
                              {isUrgent && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  <AlertTriangle className="h-3 w-3" /> Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">Dr. {doctor?.name || 'Unknown'} · Ordered: {new Date(report.date).toLocaleDateString()}</p>
                            <div className="mt-2 flex items-center gap-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                <FlaskConical className="h-3.5 w-3.5" />
                                {report.testType}
                              </span>
                              {catalog && <span className="text-xs text-slate-500">TAT: {catalog.tat} · ₹{catalog.price}</span>}
                            </div>
                            {report.notes && <p className="text-xs text-slate-500 mt-1">{report.notes}</p>}

                            {/* Sample collection status */}
                            <div className="mt-3 flex items-center gap-2">
                              {['Sample Pending', 'Collected', 'Processing', 'Reported'].map((step, i) => {
                                const currentStep = report.sampleStatus === 'collected' ? 1 :
                                  report.sampleStatus === 'processing' ? 2 : 0;
                                return (
                                  <React.Fragment key={step}>
                                    <div className="flex items-center gap-1">
                                      <div className={`h-2 w-2 rounded-full ${i <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                                      <span className={`text-[10px] font-medium ${i <= currentStep ? 'text-indigo-700' : 'text-slate-400'}`}>{step}</span>
                                    </div>
                                    {i < 3 && <div className={`flex-1 h-px max-w-6 ${i < currentStep ? 'bg-indigo-400' : 'bg-slate-200'}`} />}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <EnterResultsModal report={report} catalog={catalog} onComplete={async (results: string, structured: any) => {
                          try {
                            await updateLabReportStatus(report.id, 'completed', results, currentUser.id);
                            toast.success('Test results saved!');
                          } catch { toast.error('Failed to save results'); }
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── COMPLETED ── */}
          {activeTab === 'completed' && (
            <div className="space-y-3">
              {filter(completedReports).length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">No completed reports</h3>
                </div>
              ) : (
                filter(completedReports).map(report => {
                  const patient = users.find(u => u.id === report.patientId);
                  const doctor = users.find(u => u.id === report.doctorId);
                  const tech = users.find(u => u.id === report.completedBy);
                  const hasCritical = report.results && report.results.includes('[CRITICAL]');
                  const isExpanded = expandedId === report.id;
                  return (
                    <div key={report.id} className={`rounded-xl border p-4 ${hasCritical ? 'border-red-200 bg-red-50/20' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : report.id)}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-sm">{patient?.name || 'Unknown'}</span>
                              {hasCritical && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  ⚠ Critical Values
                                </span>
                              )}
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Completed</span>
                            </div>
                            <p className="text-xs text-slate-500">{report.testType} · Dr. {doctor?.name} · By: {tech?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400">Completed: {report.completedAt ? new Date(report.completedAt).toLocaleString() : 'N/A'}</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                      </div>
                      {isExpanded && report.results && (
                        <div className="mt-4 ml-12 bg-slate-50 rounded-xl p-4 text-sm border border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Test Results</p>
                          <pre className="whitespace-pre-wrap text-slate-800 font-mono text-xs">{report.results}</pre>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── TEST CATALOG ── */}
          {activeTab === 'catalog' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">All tests offered at Sunrise Hospital with pricing and TAT.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEST_CATALOG.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(test => (
                  <div key={test.name} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <FlaskConical className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{test.name}</p>
                          {test.parameters.length > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">{test.parameters.length} parameters</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        TAT: {test.tat}
                      </div>
                      <span className="text-sm font-bold text-indigo-700">₹{test.price}</span>
                    </div>
                    {test.parameters.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                        {test.parameters.map(p => (
                          <div key={p.name} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">{p.name}</span>
                            <span className="text-slate-400">{p.low}–{p.high} {p.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REVENUE ── */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Tests Conducted', value: labReports.length, sub: 'all time', icon: FlaskConical, color: 'purple' },
                  { label: 'Lab Revenue', value: `₹${labRevenue.toLocaleString('en-IN')}`, sub: 'from invoices', icon: TrendingUp, color: 'emerald' },
                  { label: 'Pending Reports', value: pendingReports.length, sub: 'to be completed', icon: Clock, color: 'amber' },
                ].map(({ label, value, sub, icon: Icon, color }) => (
                  <div key={label} className={`bg-${color}-50 rounded-2xl p-5 border border-${color}-100`}>
                    <div className={`h-10 w-10 rounded-xl bg-${color}-100 flex items-center justify-center mb-3`}>
                      <Icon className={`h-5 w-5 text-${color}-600`} />
                    </div>
                    <p className={`text-2xl font-extrabold text-${color}-700`}>{value}</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown by test type */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Tests by Type</h3>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Test Type', 'Total Orders', 'Completed', 'Pending'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {Object.entries(
                        labReports.reduce((acc: Record<string, { total: number; completed: number; pending: number }>, r) => {
                          const key = r.testType || 'Unknown';
                          if (!acc[key]) acc[key] = { total: 0, completed: 0, pending: 0 };
                          acc[key].total++;
                          if (r.status === 'completed') acc[key].completed++;
                          else acc[key].pending++;
                          return acc;
                        }, {})
                      ).map(([type, stats]) => (
                        <tr key={type} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{type}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{stats.total}</td>
                          <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{stats.completed}</td>
                          <td className="px-4 py-3 text-sm text-amber-600 font-medium">{stats.pending}</td>
                        </tr>
                      ))}
                      {labReports.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No lab data yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Report Modal */}
      {showNewReport && (
        <NewReportModal
          onClose={() => setShowNewReport(false)}
          onCreate={createLabReport}
          users={users}
        />
      )}
    </div>
  );
}

// ── Enter Results Modal (with structured params + critical flagging) ──
function EnterResultsModal({ report, catalog, onComplete }: {
  report: any; catalog: any; onComplete: (results: string, structured: any) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState('');

  const hasParams = catalog?.parameters?.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let resultText = '';
    let hasCritical = false;

    if (hasParams) {
      resultText = catalog.parameters.map((p: any) => {
        const val = parseFloat(paramValues[p.name] || '0');
        const isCritical = val < p.low || val > p.high;
        if (isCritical) hasCritical = true;
        return `${p.name}: ${paramValues[p.name] || '—'} ${p.unit} [${isCritical ? 'CRITICAL ⚠' : 'Normal ✓'}] (Ref: ${p.low}–${p.high})`;
      }).join('\n');
    } else {
      resultText = freeText;
    }

    if (hasCritical) resultText = '[CRITICAL]\n' + resultText;
    if (!resultText.trim()) { toast.error('Enter results first'); return; }

    onComplete(resultText, paramValues);
    if (hasCritical) toast('⚠️ Critical values detected! Doctor has been notified.', { icon: '🚨' });
    setShowModal(false);
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors flex-shrink-0">
        <Activity className="h-4 w-4" /> Enter Results
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Enter Test Results</h2>
                <p className="text-xs text-slate-500">{report.testType}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5">
              {hasParams ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                    Values outside normal range will be auto-flagged as critical and a notification will be sent to the doctor.
                  </div>
                  {catalog.parameters.map((param: any) => {
                    const val = parseFloat(paramValues[param.name] || '0');
                    const isCritical = paramValues[param.name] && (val < param.low || val > param.high);
                    return (
                      <div key={param.name}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-semibold text-slate-700">{param.name}</label>
                          <span className="text-xs text-slate-400">Normal: {param.low}–{param.high} {param.unit}</span>
                        </div>
                        <div className="relative">
                          <input type="number" step="any"
                            value={paramValues[param.name] || ''}
                            onChange={e => setParamValues(p => ({ ...p, [param.name]: e.target.value }))}
                            placeholder="Enter value..."
                            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                              isCritical ? 'border-red-300 focus:ring-red-400 bg-red-50 text-red-700' : 'border-slate-200 focus:ring-indigo-500'
                            }`} />
                          {isCritical && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600 font-bold">⚠ CRITICAL</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Results / Findings</label>
                  <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
                    rows={6} placeholder="Enter findings, measurements, or observations..." required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              )}
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm">
                  Save Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── New Report Modal ──
function NewReportModal({ onClose, onCreate, users }: { onClose: () => void; onCreate: (r: any) => Promise<void>; users: any[] }) {
  const [formData, setFormData] = useState({ patientId: '', doctorId: '', testType: '', notes: '' });
  const patients = users.filter(u => u.role === 'patient');
  const doctors = users.filter(u => u.role === 'doctor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreate(formData);
      toast.success('Lab report created!');
      onClose();
    } catch { toast.error('Failed to create lab report'); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">New Lab Request</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[
            { label: 'Patient', key: 'patientId', options: patients, prefix: '' },
            { label: 'Doctor', key: 'doctorId', options: doctors, prefix: 'Dr. ' },
          ].map(({ label, key, options, prefix }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label} *</label>
              <select value={(formData as any)[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select {label}...</option>
                {options.map(o => <option key={o.id} value={o.id}>{prefix}{o.name}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Test Type *</label>
            <select value={formData.testType} onChange={e => setFormData(p => ({ ...p, testType: e.target.value }))} required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select test...</option>
              {TEST_CATALOG.map(t => <option key={t.name} value={t.name}>{t.name} — ₹{t.price}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
            <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any special instructions..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">Create Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}
