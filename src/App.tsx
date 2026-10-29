// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BrainCircuit, CheckCircle2, XCircle, ChevronRight, RefreshCw, 
  BarChart3, Settings, Play, Target, Award, MessageSquare, 
  Send, Loader2, Sparkles, ShieldCheck, Zap, HelpCircle, 
  Check, ArrowRight, RotateCcw, Cpu, Layers, Flame, BookOpen
} from 'lucide-react';

// Default Domain List for AZ-104
const DOMAINS = [
  "Manage Azure identities and governance (15-20%)",
  "Implement and manage storage (15-20%)",
  "Deploy and manage Azure compute resources (20-25%)",
  "Configure and manage virtual networking (25-30%)",
  "Monitor and maintain Azure resources (10-15%)"
];

// Rich fallback dataset with real-world AZ-104 scenarios
const MOCK_QUESTIONS = [
  {
    id: 1,
    domain: "Manage Azure identities and governance (15-20%)",
    difficulty: "Level 2",
    scenario: "Your company has a Microsoft Entra ID tenant named contoso.com. You create an Azure policy named Enforce-Tags that restricts resource creation if specific tags are missing. A developer reports they cannot deploy a Virtual Machine in RG-Production.",
    question: "What should you check first to determine why the deployment was denied?",
    options: [
      "Check Microsoft Entra ID Role Assignments for the developer account.",
      "Inspect Azure Activity Log for policy deny events and evaluation details.",
      "Verify if the developer has sufficient Azure subscription credits.",
      "Review the Azure Firewall rule sets for restricted ports during deployment."
    ],
    correctIndex: 1,
    explanation: "Azure Policy evaluation details are recorded directly in the Activity Log under Policy events. When a resource deployment is denied by an 'Audit' or 'Deny' policy rule, the Activity log displays the exact policy assignment and missing parameters (e.g., missing tags)."
  },
  {
    id: 2,
    domain: "Implement and manage storage (15-20%)",
    difficulty: "Level 1",
    scenario: "You have an Azure Storage account named `stdata2026` configured with Blob storage. You need to configure dynamic access so that data older than 90 days is moved to Cool storage, and data older than 365 days is moved to Archive storage.",
    question: "Which feature of Azure Storage should you configure?",
    options: [
      "Storage Access Keys regeneration policy",
      "Lifecycle Management rules",
      "Object Replication rules",
      "Azure Import/Export Service"
    ],
    correctIndex: 1,
    explanation: "Azure Blob Storage Lifecycle Management offers a rule-based policy that you can use to transition your data to the appropriate access tiers (Hot to Cool, Cool to Archive) or expire data at the end of its lifecycle."
  },
  {
    id: 3,
    domain: "Deploy and manage Azure compute resources (20-25%)",
    difficulty: "Level 3",
    scenario: "You deploy an Azure Virtual Machine Scale Set (VMSS) running a Web API workload. During peak hours, CPU utilization spikes above 85% across all instances. You need to scale out automatically only when CPU exceeds 80% for more than 10 minutes.",
    question: "Which scale policy configuration fulfills this operational requirement?",
    options: [
      "Manual scale configuration set to max instance capacity of 10",
      "Metric-based Autoscale rule using Average CPU Percentage > 80% with a duration/time window of 10 minutes",
      "Scheduled autoscale rule set to scale out every day at 09:00 AM",
      "Azure Load Balancer health probe alert rule configured with a webhook"
    ],
    correctIndex: 1,
    explanation: "Metric-based autoscale in Azure VMSS evaluates custom metrics like CPU Percentage. Setting the operator to Greater Than (80%) and the duration window to 10 minutes ensures scale-out events trigger only during sustained traffic spikes."
  },
  {
    id: 4,
    domain: "Configure and manage virtual networking (25-30%)",
    difficulty: "Level 2",
    scenario: "You have two Virtual Networks named VNet1 (10.1.0.0/16) and VNet2 (10.2.0.0/16) in the East US region connected via VNet Peering. VM1 in VNet1 cannot ping VM2 in VNet2.",
    question: "Which NSG rule or network configuration is the most likely cause if VNet peering status is 'Connected'?",
    options: [
      "VNet Peering does not support ICMP traffic across regions under any condition.",
      "An inbound NSG rule on VM2's network interface or subnet is blocking ICMP (ping) traffic.",
      "The virtual network gateway missing on VNet1 stops internal subnet routing.",
      "DNS resolution is required for IP-based ping commands in Azure."
    ],
    correctIndex: 1,
    explanation: "VNet Peering allows full IP connectivity. Standard ping uses ICMP traffic. By default, Azure NSG rules allow VNet-to-VNet inbound traffic, but custom NSGs or local OS firewalls (e.g. Windows Firewall) often block inbound ICMP ECHO requests by default."
  },
  {
    id: 5,
    domain: "Monitor and maintain Azure resources (10-15%)",
    difficulty: "Level 2",
    scenario: "You manage multiple Web Apps on Azure App Service. You need to create an automated action that sends an SMS alert to the SysOps team whenever server response time exceeds 3 seconds.",
    question: "What two Azure Monitor components should you configure?",
    options: [
      "Azure Log Analytics Workspace and Network Watcher topology",
      "Azure Monitor Alert Rule and an Action Group with SMS receiver notification",
      "Application Insights Profiler and Azure Advisor recommendations",
      "Azure Resource Health alert and Cost Management budget group"
    ],
    correctIndex: 1,
    explanation: "Azure Monitor Alert Rules trigger when metric conditions (like response time) pass thresholds. The actual delivery (SMS, Email, Push, Webhook) is handled by attaching an Azure Action Group configured with SMS receivers."
  }
];

export default function App() {
  // Application State
  const [view, setView] = useState('setup'); // 'setup', 'quiz', 'results'
  
  // Quiz Configurations
  const [selectedCount, setSelectedCount] = useState(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [apiKey, setApiKey] = useState('');

  // Active Quiz State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({}); // { [qId]: optionIndex }
  const [revealedAnswers, setRevealedAnswers] = useState({}); // { [qId]: boolean }
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // AI Explanation State
  const [aiQueries, setAiQueries] = useState({}); // { [qId]: [ {role, text} ] }
  const [currentQueryInput, setCurrentQueryInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // History & Progress Storage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('az104_sim_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('az104_sim_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Generate Questions (API call with Fallback)
  const handleStartExam = async () => {
    setIsLoadingQuestions(true);

    if (!apiKey) {
      // Use client-side smart filtering + fallback generation
      setTimeout(() => {
        let pool = [...MOCK_QUESTIONS];
        if (selectedDomain !== 'All') {
          pool = pool.filter(q => q.domain === selectedDomain);
        }
        if (selectedDifficulty !== 'All') {
          pool = pool.filter(q => q.difficulty === selectedDifficulty);
        }
        if (pool.length < selectedCount) {
          // Fill up with remaining fallback questions
          const extraNeeded = selectedCount - pool.length;
          const filler = MOCK_QUESTIONS.filter(q => !pool.includes(q)).slice(0, extraNeeded);
          pool = [...pool, ...filler];
        }
        // Duplicate/slice to meet requested length cleanly
        let result = [];
        while (result.length < selectedCount && pool.length > 0) {
          result = result.concat(pool);
        }
        result = result.slice(0, selectedCount).map((q, idx) => ({ ...q, id: idx + 1 }));

        setQuestions(result);
        setCurrentIndex(0);
        setSelectedOptions({});
        setRevealedAnswers({});
        setAiQueries({});
        setIsLoadingQuestions(false);
        setView('quiz');
      }, 700);
      return;
    }

    // Call Gemini API if Key is provided
    try {
      const prompt = `Generate ${selectedCount} realistic Microsoft Azure AZ-104 exam scenario questions. 
Domain Focus: ${selectedDomain}. Difficulty Level: ${selectedDifficulty}(where 1 = Easy/Fundamental, 2 = Medium/Applied Scenario, 3 = Hard/Complex Troubleshooting). 
Return strictly a JSON array matching this exact structure, with no markdown formatting outside the JSON:
[
  {
    "id": 1,
    "domain": "Domain Name",
    "difficulty": "Level : Easy/Medium/Hard",
    "scenario": "Detailed Azure scenario paragraph...",
    "question": "Clear question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "In-depth technical explanation referencing Microsoft docs concepts."
  }
]`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await res.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        setQuestions(parsed.map((q, idx) => ({ ...q, id: idx + 1 })));
        setCurrentIndex(0);
        setSelectedOptions({});
        setRevealedAnswers({});
        setAiQueries({});
        setView('quiz');
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.warn("AI generation failed or quota reached. Falling back to built-in AZ-104 engine.", err);
	  alert("AI generation failed or quota reached. Check your AI Console and API Key. Falling back to built-in AZ-104 engine.", err);
      // Fallback
      setQuestions(MOCK_QUESTIONS.slice(0, selectedCount));
      setCurrentIndex(0);
      setSelectedOptions({});
      setRevealedAnswers({});
      setView('quiz');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Answer Select Handlers
  const handleSelectOption = (qId, optionIdx) => {
    if (revealedAnswers[qId]) return; // lock once confirmed
    setSelectedOptions(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleConfirmAnswer = (qId) => {
    if (selectedOptions[qId] === undefined) return;
    setRevealedAnswers(prev => ({ ...prev, [qId]: true }));
  };

  // AI Tutor Query
  const handleAskAiTutor = async () => {
    if (!currentQueryInput.trim()) return;
    const currentQ = questions[currentIndex];
    const qId = currentQ.id;

    const userMessage = currentQueryInput;
    setCurrentQueryInput('');

    // Append to query history
    const prevHistory = aiQueries[qId] || [];
    const updatedHistory = [...prevHistory, { role: 'user', text: userMessage }];
    setAiQueries(prev => ({ ...prev, [qId]: updatedHistory }));
    setIsAiThinking(true);

    try {
      const systemInstruction = `You are a Microsoft Certified Azure Solutions Architect and expert trainer for AZ-104. 
Context Question: "${currentQ.question}"
Scenario: "${currentQ.scenario}"
Correct Answer: "${currentQ.options[currentQ.correctIndex]}"
Explanation: "${currentQ.explanation}"
Provide concise, accurate, and encouraging advice for the user's specific query.`;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble analyzing that specific request right now. Check your permissions and connection.";

      setAiQueries(prev => ({
        ...prev,
        [qId]: [...updatedHistory, { role: 'model', text: aiReply }]
      }));
    } catch (e) {
      setAiQueries(prev => ({
        ...prev,
        [qId]: [...updatedHistory, { role: 'model', text: "For detailed exam tips on this topic, refer to Microsoft Learn's documentation on Azure Resource Management and NSG rules." }]
      }));
    } finally {
      setIsAiThinking(false);
    }
  };

  // Finish Exam & Logic
  const handleFinishExam = () => {
    let score = 0;
    const domainStats = {};

    questions.forEach((q) => {
      const isCorrect = selectedOptions[q.id] === q.correctIndex;
      if (isCorrect) score++;

      if (!domainStats[q.domain]) {
        domainStats[q.domain] = { total: 0, correct: 0 };
      }
      domainStats[q.domain].total += 1;
      if (isCorrect) domainStats[q.domain].correct += 1;
    });

    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      domainStats
    };

    setHistory(prev => [newRecord, ...prev]);
    setView('results');
  };

  // Stats Calculations
  const stats = useMemo(() => {
    if (history.length === 0) return { totalTaken: 0, avgScore: 0, highestScore: 0 };
    const totalTaken = history.length;
    const avgScore = Math.round(history.reduce((acc, curr) => acc + curr.percentage, 0) / totalTaken);
    const highestScore = Math.max(...history.map(h => h.percentage));
    return { totalTaken, avgScore, highestScore };
  }, [history]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Animated Sci-Fi Mesh & Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[180px]"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10 flex flex-col min-h-screen">
        
        {/* Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6 mb-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-cyan-950/20">
          <div className="flex items-center space-x-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/30">
              <Cpu className="w-7 h-7 stroke-[2.2]" />
              <div className="absolute inset-0 rounded-xl bg-cyan-400 blur-md opacity-40 -z-10"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  AZ-104 SIMULATOR
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  PRO ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Microsoft Azure Administrator Certification Prep</p>
            </div>
          </div>

          {/* Quick Metrics Header Stats */}
          <div className="flex items-center space-x-4 md:space-x-6 text-xs md:text-sm">
            <div className="flex items-center space-x-2 bg-slate-950/50 px-3.5 py-2 rounded-xl border border-slate-800/60">
              <Target className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-400 text-[11px] block leading-none">Exams Taken</span>
                <span className="font-bold text-slate-200">{stats.totalTaken}</span>
                <span className="text-slate-400 text-[11px] block leading-none">Correct / Total</span>
                <span className="font-bold text-slate-200">
				{ history.reduce((sum, record) => sum + record.score, 0)} / {history.reduce((sum, record) => sum + record.total, 0)}
				</span>
              
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/50 px-3.5 py-2 rounded-xl border border-slate-800/60">
              <Award className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 text-[11px] block leading-none">Avg Accuracy</span>
                <span className="font-bold text-slate-200">{stats.avgScore}%</span>
              </div>
            </div>
          </div>
        </header>

        {/* View Router */}
        {view === 'setup' && (
          <SetupView 
            selectedCount={selectedCount}
            setSelectedCount={setSelectedCount}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedDomain={selectedDomain}
            setSelectedDomain={setSelectedDomain}
            apiKey={apiKey}
            setApiKey={setApiKey}
            onStart={handleStartExam}
            isLoading={isLoadingQuestions}
            history={history}
            onResetHistory={() => setHistory([])}
          />
        )}

        {view === 'quiz' && (
          <QuizView 
            questions={questions}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            selectedOptions={selectedOptions}
            revealedAnswers={revealedAnswers}
            onSelectOption={handleSelectOption}
            onConfirmAnswer={handleConfirmAnswer}
            onFinish={handleFinishExam}
            aiQueries={aiQueries}
            currentQueryInput={currentQueryInput}
            setCurrentQueryInput={setCurrentQueryInput}
            onAskAi={handleAskAiTutor}
            isAiThinking={isAiThinking}
            apiKey={apiKey}
          />
        )}

        {view === 'results' && (
          <ResultsView 
            history={history}
            questions={questions}
            selectedOptions={selectedOptions}
            onRetake={() => setView('setup')}
          />
        )}

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>Aligned with Microsoft AZ-104 Exam Objectives (2026)</span>
          </div>
          <span>Built for High Performance & Dark Theme Visuals</span>
        </footer>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Setup Screen Component
// ----------------------------------------------------------------------
function SetupView({
  selectedCount, setSelectedCount,
  selectedDifficulty, setSelectedDifficulty,
  selectedDomain, setSelectedDomain,
  apiKey, setApiKey,
  onStart, isLoading,
  history, onResetHistory
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      
      {/* Configuration Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-48 h-48 text-cyan-400" />
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Exam Simulator Configurations</h2>
          </div>

          {/* Question Count Selection */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-semibold text-slate-300 flex items-center justify-between">
              <span>Question Count</span>
              <span className="text-xs text-cyan-400 font-mono">{selectedCount} Questions</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
              {[5, 10, 20, 30, 40].map(count => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border ${
                    selectedCount === count 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Selection */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-semibold text-slate-300 flex items-center justify-between">
              <span>Domain Focus</span>
              <span className="text-xs text-slate-400">Target Specific Skill Area</span>
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            >
              <option value="All">All Domains (Full Exam Mix)</option>
              {DOMAINS.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-semibold text-slate-300">Difficulty Rating</label>
            <div className="grid grid-cols-4 gap-2.5">
              {['All', 'Level 1', 'Level 2', 'Level 3'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={`py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 border ${
                    selectedDifficulty === lvl
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  {lvl === 'All' ? 'Adaptive' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Gemini API Key */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gemini API Key (Optional for Unlimited AI Generation)</span>
              </label>
            </div>
            <input
              type="password"
              placeholder="Paste custom API Key (Leave empty to use built-in Azure engine)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800/90 rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Launch Button */}
          <button
            onClick={onStart}
            disabled={isLoading}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 font-black text-base tracking-wider uppercase shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                <span>Compiling Azure Exam Engine...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                <span>Launch Exam Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* History & Quick Stats Sidebar */}
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-200">Recent Sessions</h3>
            </div>
            {history.length > 0 && (
              <button 
                onClick={onResetHistory} 
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="my-auto py-12 text-center text-slate-500 space-y-3">
              <BookOpen className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-xs">No simulation sessions recorded yet. Start your first practice exam to track progress!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {history.map((record) => {
                const isPass = record.percentage >= 70;
                return (
                  <div 
                    key={record.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-300">{record.date}</div>
                      <div className="text-[11px] text-slate-500">
                        {record.score} / {record.total} Questions
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                        isPass 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' 
                          : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                      }`}>
                        {record.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------------------------
// Active Exam / Quiz View Component
// ----------------------------------------------------------------------
function QuizView({
  questions, currentIndex, setCurrentIndex,
  selectedOptions, revealedAnswers,
  onSelectOption, onConfirmAnswer, onFinish,
  aiQueries, currentQueryInput, setCurrentQueryInput,
  onAskAi, isAiThinking, apiKey
}) {
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const isConfirmed = revealedAnswers[currentQ.id];
  const userSelected = selectedOptions[currentQ.id];
  const isCorrect = userSelected === currentQ.correctIndex;
  const chatMessages = aiQueries[currentQ.id] || [];

  return (
    <div className="space-y-6 mb-8">
      
      {/* Top Navigation & Progress Bar */}
	  
      <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="px-3 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono text-xs font-bold">
            Q {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
            {currentQ.domain}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full md:w-64 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <button
          onClick={onFinish}
          className="w-full md:w-auto px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
        >
          Finish & Grade Exam
        </button>
      </div>

      {/* Question Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl space-y-6 relative">
        
        {/* Scenario Header Tag */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-400 text-[11px] font-mono border border-slate-800">
            {currentQ.difficulty || 'Level 2'}
          </span>
          {isConfirmed && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
              isCorrect 
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80' 
                : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{isCorrect ? 'Correct Answer' : 'Incorrect Answer'}</span>
            </span>
          )}
        </div>

        {/* Scenario Description */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/60 text-slate-300 text-lg leading-relaxed font-sans">
          <p className="font-semibold text-slate-400 text-xs mb-1 uppercase tracking-wider">Scenario Context</p>
          {currentQ.scenario}
        </div>

        {/* Specific Question Prompt */}
        <h3 className="text-base md:text-lg font-bold text-white tracking-wide">
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isThisSelected = userSelected === idx;
            const isThisCorrect = currentQ.correctIndex === idx;
			

            let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-300';
            if (isThisSelected) {
              borderStyle = 'border-cyan-500 bg-cyan-950/30 text-white shadow-md shadow-cyan-950/50';
            }
            if (isConfirmed) {
              if (isThisCorrect) {
                borderStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
              } else if (isThisSelected && !isThisCorrect) {
                borderStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => onSelectOption(currentQ.id, idx)}
                disabled={isConfirmed}
                className={`w-full p-4 rounded-xl border text-left text-sm transition-all duration-200 flex items-start space-x-3 ${borderStyle}`}
              >
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                  isThisSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950' : 'border-slate-700 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
		
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 text-xs font-bold transition-colors"
          >
            Previous
          </button>
						
          {!isConfirmed ? (
            <button
              onClick={() => onConfirmAnswer(currentQ.id)}
              disabled={userSelected === undefined}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg shadow-cyan-500/20"
            >
              Confirm Answer
            </button>
          ) : (
			
            <button
			
              onClick={ (currentIndex === questions.length - 1) ? () => onFinish() :  () => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              //disabled= {isLastQuestion}//{currentIndex === questions.length - 1}*/
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>{(currentIndex === questions.length - 1) ? "Finish Exam" : "Next Question"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Answer Explanation & AI Assistant Block */}
        {isConfirmed && (
          <div className="mt-6 p-5 rounded-xl bg-slate-950/90 border border-cyan-800/40 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Zap className="w-4 h-4" />
              <h4 className="font-bold text-sm">Detailed Azure Explanation</h4>
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {currentQ.explanation}
            </p>

            {/* AI Interactive Query Box */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ask AI Azure Tutor</span>
                </span>
                {!apiKey && <span className="text-[10px] text-slate-500">Fast Fallback Enabled</span>}
              </div>

              {/* Chat Thread */}
              {chatMessages.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-2.5 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-cyan-950/40 border border-cyan-800/30 text-cyan-200 ml-6' 
                          : 'bg-slate-900 border border-slate-800 text-slate-300 mr-6'
                      }`}
                    >
                      <span className="font-bold text-[10px] block opacity-60 mb-0.5">
                        {msg.role === 'user' ? 'You' : 'Azure AI Tutor'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ask a question about this scenario..."
                  value={currentQueryInput}
                  onChange={(e) => setCurrentQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onAskAi()}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={onAskAi}
                  disabled={isAiThinking}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors disabled:opacity-50"
                >
                  {isAiThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Results & Analytics Dashboard Component
// ----------------------------------------------------------------------
function ResultsView({ history, questions, selectedOptions, onRetake }) {
  const latestResult = history[0] || { score: 0, total: 1, percentage: 0, domainStats: {} };
  const isPassed = latestResult.percentage >= 70;

  return (
    <div className="space-y-8 mb-8">
      
      {/* Overview Banner */}
      <div className="p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className={`inline-flex p-4 rounded-2xl ${isPassed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
          {isPassed ? <Award className="w-12 h-12" /> : <Flame className="w-12 h-12" />}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white">
          {isPassed ? 'Exam Simulation Passed!' : 'Needs Practice'}
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
          {isPassed 
            ? 'Great job! You met the Microsoft benchmark threshold of 70% accuracy.'
            : 'Review your weak domain areas below before attempting your actual AZ-104 certification.'}
        </p>

        <div className="flex items-center justify-center space-x-6 pt-2">
          <div className="text-center">
            <span className="text-3xl font-black text-cyan-400">{latestResult.percentage}%</span>
            <span className="text-xs text-slate-500 block">Final Score</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800"></div>
          <div className="text-center">
            <span className="text-3xl font-black text-slate-200">{latestResult.score} / {latestResult.total}</span>
            <span className="text-xs text-slate-500 block">Correct Items</span>
          </div>
        </div>

        <button
          onClick={onRetake}
          className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm tracking-wider uppercase shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all inline-flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Configure New Simulation</span>
        </button>
      </div>

      {/* Domain Breakdown */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-200 text-base flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Domain Performance Analysis</span>
        </h3>

        <div className="space-y-4 pt-2">
          {Object.entries(latestResult.domainStats || {}).map(([domain, stat]) => {
            const domainPct = Math.round((stat.correct / stat.total) * 100);
            return (
              <div key={domain} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{domain}</span>
                  <span className="text-cyan-400 font-mono">{domainPct}% ({stat.correct}/{stat.total})</span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${domainPct >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${domainPct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
