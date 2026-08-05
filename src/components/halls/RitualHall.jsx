import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Terminal, 
  Activity, 
  CheckCircle, 
  Server, 
  ShieldAlert, 
  Wrench, 
  Flame, 
  Coins, 
  TrendingUp, 
  Send, 
  Globe, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Play, 
  Volume2, 
  Award, 
  BookOpen,
  Check,
  Zap,
  Cpu,
  Monitor,
  HeartPulse,
  Share2,
  FileText
} from 'lucide-react';
import { api, blockchainEvents } from '../../lib/api';
import { useLevelUpSound } from '../../lib/sounds';

export default function RitualHall({ magicAddress, onNavigate, messages = [], onSend, busy = false }) {
  const { playLevelUp, playMagicChime, playEpicFanfare, playDrumRoll } = useLevelUpSound();
  const [viewMode, setViewMode] = useState('widgets');
  
  // Persistence key
  const stateKey = `meechain-ritual-state-${magicAddress || '0xMeeBuilderDemo'}`;

  // Initial local state or saved state
  const [activeStep, setActiveStep] = useState(() => {
    try {
      const saved = localStorage.getItem(`${stateKey}-active`);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [stepStatuses, setStepStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem(`${stateKey}-statuses`);
      return saved ? JSON.parse(saved) : ['idle', 'idle', 'idle', 'idle', 'idle', 'idle'];
    } catch {
      return ['idle', 'idle', 'idle', 'idle', 'idle', 'idle'];
    }
  });

  // Save states
  useEffect(() => {
    localStorage.setItem(`${stateKey}-active`, activeStep.toString());
  }, [activeStep, stateKey]);

  useEffect(() => {
    localStorage.setItem(`${stateKey}-statuses`, JSON.stringify(stepStatuses));
  }, [stepStatuses, stateKey]);

  // Step 1 states (React Dashboard & Themes)
  const [dashboardTheme, setDashboardTheme] = useState('purple-blue-cyan');
  const [selectedPreviewTab, setSelectedPreviewTab] = useState('token');
  const [isBuildingDashboard, setIsBuildingDashboard] = useState(false);
  const [dashboardLogs, setDashboardLogs] = useState([]);

  // Step 2 states (Contract Address Binding)
  const [tokenAddress, setTokenAddress] = useState('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9');
  const [questAddress, setQuestAddress] = useState('0x68B1D87F95878fE05B998F19b66F4baba5De1aed');
  const [rpcNodeUrl, setRpcNodeUrl] = useState('https://rpc.meechain.live');
  const [meeBalance, setMeeBalance] = useState('1,250,000');
  const [transferAmount, setTransferAmount] = useState('500');
  const [transferTarget, setTransferTarget] = useState('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferHistory, setTransferHistory] = useState([
    { tx: '0xa41b...cf12', from: '0xMeeBuilderDemo', to: '0x59c6995e...', amount: '1,000 MEE', status: 'Confirmed' },
    { tx: '0x992d...41a3', from: '0xMeeBuilderDemo', to: '0x70997970...', amount: '250 MEE', status: 'Confirmed' }
  ]);

  // Step 3 states (E2E Tests)
  const [isTesting, setIsTesting] = useState(false);
  const [testConsole, setTestConsole] = useState([]);
  const [testStats, setTestStats] = useState({ passed: 0, failed: 0, latency: '—', total: 4 });
  const testConsoleEndRef = useRef(null);

  // Step 4 states (Monitoring / Scouter Panel)
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [liveTps, setLiveTps] = useState(2450);
  const [liveLatency, setLiveLatency] = useState(42);
  const [failoverMode, setFailoverMode] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Step 5 states (Production Launch & Vercel)
  const [vercelProjectId, setVercelProjectId] = useState('prj_XNRGrqVMuVl9wA0VCFu0TeIoQ3m8');
  const [productionDomain, setProductionDomain] = useState('explorer.meechain.link');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState([]);
  const [isLiveOnline, setIsLiveOnline] = useState(false);

  // Step 6 states (Jubilee Celebration)
  const [isJubilant, setIsJubilant] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  // Sound effects controller helper
  const triggerSound = (type) => {
    try {
      if (type === 'chime') playMagicChime();
      else if (type === 'fanfare') playEpicFanfare();
      else if (type === 'drumroll') playDrumRoll();
    } catch (err) {
      console.warn('Audio synthesis warning:', err);
    }
  };

  // Auto-scroll the test terminal
  useEffect(() => {
    if (testConsoleEndRef.current) {
      testConsoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [testConsole]);

  // Real-time live metrics tick
  useEffect(() => {
    if (!monitoringEnabled) return;
    const interval = setInterval(() => {
      // Random walk for TPS and Latency to simulate real chain load
      setLiveTps(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 150);
        const base = failoverMode ? 320 : 2450;
        return Math.max(100, Math.min(4500, prev + delta));
      });
      setLiveLatency(prev => {
        const delta = Math.floor((Math.random() - 0.5) * 6);
        const base = failoverMode ? 310 : 42;
        return Math.max(20, Math.min(500, base + delta));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [monitoringEnabled, failoverMode]);

  // Dynamic monitoring failover alerts handling
  useEffect(() => {
    if (failoverMode) {
      setActiveAlerts([
        { id: 'alert-rpc', title: '🚨 Primary RPC Node Latency spikes > 300ms', severity: 'critical', time: 'Just now' },
        { id: 'alert-failover', title: '⚠️ Sentinel: Active Backup Node redirection initiated', severity: 'warning', time: '1s ago' }
      ]);
    } else {
      setActiveAlerts([]);
    }
  }, [failoverMode]);

  // STEP 1 RUNNER: Deploy React Dashboard
  const startDashboardBuild = () => {
    setIsBuildingDashboard(true);
    triggerSound('drumroll');
    setDashboardLogs([]);
    
    const logs = [
      '🔮 Initializing MeeChain Magic Transmuter Engine...',
      '📦 Bundling assets using Vite and ESBuild compilers...',
      '🧪 Injecting core Tailwind utility directives...',
      '🎨 Applying Theme Gradients: Purple (ม่วง) ➔ Blue (น้ำเงิน) ➔ Cyan (ฟ้า)...',
      '🧱 Generating Page Modules: [Token Hall, Quest Hall, Monitoring Hall]',
      '⚡ Optimizing code structures and asset footprints...',
      '✅ Transmutation complete! MeeChain Dashboard built successfully.'
    ];

    logs.forEach((logText, idx) => {
      setTimeout(() => {
        setDashboardLogs(prev => [...prev, logText]);
        if (idx === logs.length - 1) {
          setIsBuildingDashboard(false);
          triggerSound('chime');
          setStepStatuses(prev => {
            const next = [...prev];
            next[0] = 'completed';
            return next;
          });
          setActiveStep(2);
        }
      }, (idx + 1) * 750);
    });
  };

  // STEP 2 RUNNER: Contract Bindings simulated transfers
  const handleTransferTokens = (e) => {
    e.preventDefault();
    if (!transferAmount || !transferTarget) return;
    setIsTransferring(true);
    triggerSound('drumroll');

    setTimeout(() => {
      const parsedBal = parseFloat(meeBalance.replace(/,/g, '')) || 0;
      const amountNum = parseFloat(transferAmount) || 0;
      if (parsedBal >= amountNum) {
        setMeeBalance((parsedBal - amountNum).toLocaleString());
      }
      
      const newTx = {
        tx: '0x' + Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16)).join('') + '...' + Array.from({length: 4}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        from: '0xMeeBuilderDemo',
        to: transferTarget.substring(0, 10) + '...',
        amount: `${amountNum.toLocaleString()} MEE`,
        status: 'Confirmed'
      };

      setTransferHistory(prev => [newTx, ...prev]);
      setIsTransferring(false);
      triggerSound('chime');
      
      // Update step status if not already completed
      setStepStatuses(prev => {
        const next = [...prev];
        next[1] = 'completed';
        return next;
      });
      if (activeStep === 2) {
        setActiveStep(3);
      }
    }, 1500);
  };

  // STEP 3 RUNNER: End-to-End Test execution
  const startE2ETesting = () => {
    setIsTesting(true);
    setTestConsole([]);
    setTestStats({ passed: 0, failed: 0, latency: 'Measuring...', total: 4 });
    triggerSound('drumroll');

    const testLogs = [
      { text: '🚀 Launching Playwright E2E Ritual Suite...', type: 'info' },
      { text: 'ℹ️ Connecting to Headless Chrome sandboxed instance...', type: 'muted' },
      { text: '🧪 Running Test Suite #1: Player Login Integration...', type: 'cmd' },
      { text: '✔ PASSED: Wallet Authentication and session keys established.', type: 'success' },
      { text: '🧪 Running Test Suite #2: Quest Board Interaction & Claim...', type: 'cmd' },
      { text: '✔ PASSED: claimQuest() contract call resolved. Bounty registers.', type: 'success' },
      { text: '🧪 Running Test Suite #3: ERC20 MEEToken Minting Loop...', type: 'cmd' },
      { text: '✔ PASSED: mint() call succeeded. Balance updated within 800ms.', type: 'success' },
      { text: '🧪 Running Test Suite #4: Explorer Ledger Indexing Sync...', type: 'cmd' },
      { text: '✔ PASSED: Transaction hash successfully retrieved from explorer indexer.', type: 'success' }
    ];

    testLogs.forEach((log, idx) => {
      setTimeout(() => {
        setTestConsole(prev => [...prev, log]);
        
        // Update stats progress
        if (log.type === 'success') {
          setTestStats(prev => ({
            ...prev,
            passed: prev.passed + 1,
            latency: `${Math.floor(25 + Math.random() * 25)}ms`
          }));
        }

        if (idx === testLogs.length - 1) {
          setIsTesting(false);
          triggerSound('chime');
          setStepStatuses(prev => {
            const next = [...prev];
            next[2] = 'completed';
            return next;
          });
          setActiveStep(4);
        }
      }, (idx + 1) * 900);
    });
  };

  // STEP 5 RUNNER: Deploy on Vercel
  const executeProductionDeploy = () => {
    setIsDeploying(true);
    setIsLiveOnline(false);
    triggerSound('drumroll');
    setDeployLogs([]);

    const steps = [
      `🛸 Fetching metadata configurations for project id: ${vercelProjectId}...`,
      '📦 Creating build package artifacts (HTML/React assets optimized)...',
      `📡 Injecting live production domain binding: https://${productionDomain}...`,
      '🔒 Applying TLS Security Certificates and DNS configurations...',
      '☁️ Deploying to Edge Server containers (routing networks synchronized)...',
      '🎉 Deployment broadcast successful! MeeChain is now LIVE in production.'
    ];

    steps.forEach((lineText, idx) => {
      setTimeout(() => {
        setDeployLogs(prev => [...prev, lineText]);
        if (idx === steps.length - 1) {
          setIsDeploying(false);
          setIsLiveOnline(true);
          triggerSound('fanfare');
          setStepStatuses(prev => {
            const next = [...prev];
            next[4] = 'completed';
            return next;
          });
          setActiveStep(6);
        }
      }, (idx + 1) * 1100);
    });
  };

  // STEP 6 RUNNER: Jubilee Celebration (confetti explosion + permanent stats award)
  const executeJubileeCelebration = () => {
    setIsJubilant(true);
    triggerSound('fanfare');
    
    // Massive confetti burst
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.4 }
    });

    // Award badge of MeeChain Sentinel
    const systemBadge = {
      id: 'badge_meechain_production',
      label: '🏆 MeeChain Sentinel',
      desc: 'Launched MeeChain Production Command, linking servers and consensus ledgers.',
      icon: '🛡️',
      color: '#06b6d4'
    };

    api.getUserStats(magicAddress).then((res) => {
      const stats = res.data || { level: 1, xp: 350, maxXp: 1000, badges: [] };
      const hasBadge = stats.badges?.some(b => b.id === systemBadge.id);
      const updatedBadges = hasBadge ? stats.badges : [...(stats.badges || []), systemBadge];
      
      // Award massive 1000 XP for the grand launch celebration
      let nextXp = (stats.xp || 0) + 1000;
      let nextLevel = stats.level || 1;
      let nextMaxXp = stats.maxXp || 1000;
      
      if (nextXp >= nextMaxXp) {
        nextXp -= nextMaxXp;
        nextLevel += 1;
        nextMaxXp = Math.floor(nextMaxXp * 1.5);
      }

      api.updateUserStats(magicAddress, {
        level: nextLevel,
        xp: nextXp,
        maxXp: nextMaxXp,
        title: 'Master Architect of MeeChain',
        badges: updatedBadges
      }).then(() => {
        setUnlockedBadges(updatedBadges);
        setStepStatuses(prev => {
          const next = [...prev];
          next[5] = 'completed';
          return next;
        });
        
        // Auto-refresh the main HUD via dispatch event
        const completedEvent = new CustomEvent('QuestCompleted', { detail: 'production_launch' });
        window.dispatchEvent(completedEvent);
      });
    });

    setTimeout(() => {
      setIsJubilant(false);
    }, 4000);
  };

  const handleQuickAction = (actionId) => {
    triggerSound('chime');
    if (actionId === 'bridge') {
      if (onSend) onSend("How to bridge assets to MeeChain?");
    } else if (actionId === 'rpc') {
      setViewMode('launch');
      setActiveStep(4);
    } else if (actionId === 'quests') {
      if (onNavigate) onNavigate('quest');
    } else if (actionId === 'mee') {
      if (onNavigate) onNavigate('realm');
    } else if (actionId === 'contracts') {
      setViewMode('launch');
      setActiveStep(2);
    } else if (actionId === 'validator') {
      if (onNavigate) onNavigate('network');
    }
  };

  const handlePlayAction = (playId) => {
    if (playId === 'daily-quest') {
      triggerSound('chime');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onSend) onSend("Tell me about my active daily quests.");
    } else if (playId === 'spell-cast') {
      triggerSound('fanfare');
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      if (onSend) onSend("Cast a magic spell for the launch!");
    } else if (playId === 'battle') {
      triggerSound('drumroll');
      if (onSend) onSend("How can I engage in Arena Battle?");
    } else if (playId === 'mystery-box') {
      triggerSound('chime');
      confetti({ particleCount: 60, spread: 50 });
      if (onSend) onSend("Open a mystery box!");
    } else if (playId === 'music-ritual') {
      triggerSound('fanfare');
      if (onSend) onSend("Play the music ritual track.");
    } else if (playId === 'achievement') {
      if (onNavigate) onNavigate('academy');
    }
  };

  const systemStatus = {
    rpc: failoverMode ? 'latency alert' : 'active',
    contracts: stepStatuses[1] === 'completed' ? 'ready' : 'ready',
    db: 'syncing',
    bridge: 'active',
    security: 'ok',
    perf: 'optimal'
  };

  const handleOperateAction = (opId) => {
    triggerSound('chime');
    if (opId === 'rpc-health') {
      setFailoverMode(prev => !prev);
    } else if (opId === 'contracts') {
      setViewMode('launch');
      setActiveStep(2);
    } else if (opId === 'db-sync') {
      triggerSound('chime');
    } else if (opId === 'bridge-validator') {
      if (onNavigate) onNavigate('network');
    } else if (opId === 'security-audit') {
      setViewMode('launch');
      setActiveStep(3);
    } else if (opId === 'performance') {
      setViewMode('launch');
      setActiveStep(4);
    }
  };

  const handleLearnAction = (learnId) => {
    triggerSound('chime');
    if (learnId === 'intro') {
      if (onSend) onSend("Tell me about getting started on MeeChain.");
    } else if (learnId === 'bridge-guide') {
      if (onSend) onSend("Show me the MeeChain bridge guide.");
    } else if (learnId === 'smart-contracts') {
      if (onSend) onSend("What smart contracts are deployed on MeeChain?");
    } else if (learnId === 'nft-evolution') {
      if (onSend) onSend("How does NFT evolution work on MeeChain?");
    } else if (learnId === 'faq') {
      if (onSend) onSend("Show me the FAQ.");
    } else if (learnId === 'community') {
      if (onNavigate) onNavigate('council');
    }
  };

  // Helper values
  const getStepProgress = () => {
    const completedCount = stepStatuses.filter(s => s === 'completed').length;
    return Math.round((completedCount / 6) * 100);
  };

  return (
    <section id="ritual-hall-main" className="glass-panel hall-section relative overflow-hidden" style={{ borderRadius: '24px' }}>
      
      {/* Premium Magical CSS Backgrounds */}
      <style>{`
        .bg-meechain-gradient {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(37, 99, 235, 0.15) 50%, rgba(6, 182, 212, 0.15) 100%);
        }
        .text-meechain-glow {
          text-shadow: 0 0 15px rgba(168, 85, 247, 0.6);
        }
        .border-meechain {
          border-color: rgba(168, 85, 247, 0.35);
        }
        .glow-cyan-card {
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);
        }
        @keyframes sweep-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-text {
          background: linear-gradient(to right, #a855f7, #3b82f6, #06b6d4, #a855f7);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: sweep-gradient 8s ease infinite;
        }
        .cli-glow {
          box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.1);
        }
        .widget-box {
          background: rgba(10, 8, 28, 0.6) !important;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(99, 102, 241, 0.2) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5) !important;
          transition: all 0.3s ease-in-out;
          border-radius: 16px;
        }
        .widget-box:hover {
          border-color: rgba(99, 102, 241, 0.45) !important;
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.2) !important;
        }
        .ritual-btn {
          background-color: rgba(30, 41, 59, 0.7);
          transition: all 0.2s ease-in-out;
        }
        .ritual-btn:hover {
          background-color: rgba(51, 65, 85, 0.8);
          transform: translateY(-1px);
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="relative p-6 md:p-8 bg-meechain-gradient border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 text-purple-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/25">
            <Sparkles className="w-3.5 h-3.5" /> Production Gatekeeper
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-white mt-2 leading-none">
            Ritual Hall: <span className="animated-gradient-text">MeeChain Production Launch</span>
          </h2>
          <p className="text-xs text-white/60 mt-1.5 max-w-2xl leading-relaxed">
            The sacred launch pad enabling MeeChain builders and guardians to synthesize production dashboards, map smart contracts, run Playwright trials, monitor nodes, and broadcast the live web portals to the mainnet.
          </p>
        </div>

        {/* Global Progress Dial */}
        <div className="shrink-0 z-10 flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
          <div className="text-right">
            <span className="text-[9px] uppercase font-black text-white/40 block">Ritual Progress</span>
            <span className="text-2xl font-black text-[#f7c55f]">{getStepProgress()}%</span>
          </div>
          <div className="relative w-14 h-14 rounded-full border-4 border-white/5 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-cyan-500 fill-none"
                strokeWidth="4"
                strokeDasharray="150"
                strokeDashoffset={150 - (150 * getStepProgress()) / 100}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="text-sm font-bold text-white">⚙</div>
          </div>
        </div>
      </div>

      {/* VIEW SELECTOR TAB BAR */}
      <div className="px-6 md:px-8 py-4 border-b border-white/5 bg-black/20 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={() => {
              triggerSound('chime');
              setViewMode('widgets');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
              viewMode === 'widgets' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'bg-white/5 text-white/50 border-white/5 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            <span>🪄 Magic Widgets Dashboard</span>
          </button>
          <button 
            onClick={() => {
              triggerSound('chime');
              setViewMode('launch');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
              viewMode === 'launch' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'bg-white/5 text-white/50 border-white/5 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            <span>🚀 Production Launch Sequence</span>
          </button>
        </div>

        <div className="text-[10px] font-mono text-white/30">
          Mode: <span className="text-[#f7c55f] uppercase font-black">{viewMode === 'widgets' ? '🪄 Live Suite' : '🚀 Checklist'}</span>
        </div>
      </div>

      {viewMode === 'widgets' ? (
        /* WIDGETS SUITE VIEW */
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
          
          {/* Main Title Banner & Interactive Checklist Summary */}
          <div className="relative text-center py-10 px-6 bg-slate-950/60 rounded-3xl border-2 border-indigo-500/20 shadow-[inset_0_4px_30px_rgba(124,133,255,0.06),0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7c85ff]/50 to-transparent"></div>
            
            <div className="max-w-2xl mx-auto">
              <span className="text-[10px] text-[#7c85ff] tracking-widest uppercase font-black bg-[#7c85ff]/10 px-3 py-1 rounded-full border border-[#7c85ff]/20">
                MeeChain Magic Control Suite
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-white tracking-wide mt-4 flex items-center justify-center gap-2.5">
                🪄 MeeChain Magic Hall Widgets
              </h2>
              <p className="text-xs text-white/60 mt-3 leading-relaxed">
                Raid the AI guide, activate system-wide shortcuts, run node operations telemetry, play for legendary badges, and study the sacred documentation — all within a single unified workspace.
              </p>
            </div>

            {/* Overall launch checklist progress bar */}
            <div className="mt-8 max-w-lg mx-auto bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex justify-between items-center mb-2 font-bold text-white/70">
                <span>Ritual Milestone Completion</span>
                <span className="text-[#f7c55f]">
                  {stepStatuses.filter(s => s === 'completed').length} / 6 Complete
                </span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/10 relative">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${getStepProgress()}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-sweep w-full h-full" style={{ animationDuration: '2s' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/30 font-mono mt-2.5">
                <span>Genesis: Block #0</span>
                <button 
                  onClick={() => {
                    triggerSound('chime');
                    setStepStatuses(['idle', 'idle', 'idle', 'idle', 'idle', 'idle']);
                    setActiveStep(1);
                  }}
                  className="text-white/40 hover:text-white underline transition-all font-sans font-bold"
                >
                  Reset Sequence Progress 🔄
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout: Balanced 12-Column Responsive Layout based on Component Importance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-6 items-stretch">
            {/* Primary Hero Widget: AI Assistant Guide (Spans 2 cols on lg, 7 cols on xl) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-7 flex flex-col">
              <MeeBotWidget onSend={onSend} busy={busy} messages={messages} />
            </div>

            {/* High-Importance Controls: Quick Actions (Spans 1 col on lg, 5 cols on xl) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-5 flex flex-col gap-4">
              <QuickActionsWidget onAction={handleQuickAction} />
            </div>

            {/* ✦ FULL WIDTH MONITORING RELICS SECTION ✦ */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-12">
              <MonitoringRelicsSection 
                liveTps={liveTps} 
                liveLatency={liveLatency} 
                failoverMode={failoverMode}
                onSimulateNormal={() => { setLiveTps(125); setLiveLatency(85); setFailoverMode(false); }}
                onSimulateWarning={() => { setLiveTps(240); setLiveLatency(210); setFailoverMode(false); }}
                onSimulateCritical={() => { setLiveTps(310); setLiveLatency(420); setFailoverMode(true); }}
              />
            </div>

            {/* Secondary Tier Widgets: 3 Equal Columns on xl (4 cols each) */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-4 flex flex-col">
              <PlayWidget onAction={handlePlayAction} />
            </div>
            <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-4 flex flex-col">
              <OperateWidget onAction={handleOperateAction} systemStatus={systemStatus} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-4 flex flex-col">
              <LearnWidget onAction={handleLearnAction} />
            </div>
          </div>
        </div>
      ) : (
        /* ORIGINAL 6-STEP COCKPIT VIEW */
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE 6 STEP COCKPIT */}
        <div className="lg:col-span-5 grid gap-4">
          <div className="p-5 bg-gradient-to-b from-[#0c1834] to-[#040816] rounded-2xl border-2 border-[#f7c55f]/20 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#f7c55f] mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Sacred Checklist Blueprint
            </h3>

            <div className="grid gap-3">
              {[
                { step: 1, title: 'Step 1: Deploy React Dashboard', desc: 'Theme Gradient (ม่วง–น้ำเงิน–ฟ้า) with Vite' },
                { step: 2, title: 'Step 2: Bind Smart Contracts', desc: 'MEEToken.sol & QuestSystem.sol connections' },
                { step: 3, title: 'Step 3: Run Full E2E Trials', desc: 'Playwright automation login ➔ claim ➔ mint flow' },
                { step: 4, title: 'Step 4: Scouter Monitoring', desc: 'Prometheus & Grafana node metrics integration' },
                { step: 5, title: 'Step 5: Launch to Production', desc: 'Warp-speed Vercel deploy & DNS binding' },
                { step: 6, title: 'Step 6: Celebrate Jubilee', desc: 'Airdrop rewards, badging, and community ritual' }
              ].map((item) => {
                const isCompleted = stepStatuses[item.step - 1] === 'completed';
                const isActive = activeStep === item.step;
                
                return (
                  <div
                    key={item.step}
                    id={`ritual-step-card-${item.step}`}
                    onClick={() => setActiveStep(item.step)}
                    className={`p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : isCompleted 
                        ? 'bg-emerald-950/10 border-emerald-500/30 hover:border-emerald-500/50' 
                        : 'bg-black/30 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Left circular marker */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCompleted 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : isActive 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 animate-pulse' 
                          : 'bg-white/5 text-white/40 border border-white/5'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : item.step}
                      </div>
                      
                      <div className="text-left overflow-hidden">
                        <h4 className={`text-xs font-black tracking-wide truncate ${isActive ? 'text-purple-300' : isCompleted ? 'text-emerald-400' : 'text-white/80'}`}>
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-white/40 truncate mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    {/* Step State Badge */}
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 ${
                      isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                        : isActive 
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25' 
                        : 'bg-white/5 text-white/30'
                    }`}>
                      {isCompleted ? 'Ready' : isActive ? 'Active' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-between text-center gap-2">
            <div className="flex-1">
              <span className="text-[9px] text-white/40 block font-bold uppercase tracking-wider">TPS Monitor</span>
              <strong className="text-sm font-mono text-cyan-400">{liveTps} tps</strong>
            </div>
            <div className="w-[1px] bg-white/5 h-8 align-middle self-center"></div>
            <div className="flex-1">
              <span className="text-[9px] text-white/40 block font-bold uppercase tracking-wider">Node Latency</span>
              <strong className="text-sm font-mono text-cyan-400">{liveLatency} ms</strong>
            </div>
            <div className="w-[1px] bg-white/5 h-8 align-middle self-center"></div>
            <div className="flex-1">
              <span className="text-[9px] text-white/40 block font-bold uppercase tracking-wider">Gas Level</span>
              <strong className="text-sm font-mono text-emerald-400">0.14 Gwei</strong>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE STEP INTERACTION TERMINAL */}
        <div className="lg:col-span-7 grid gap-6">

          {/* STEP 1 DETAIL ACTION */}
          {activeStep === 1 && (
            <div id="ritual-workspace-1" className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-5 animate-in fade-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 tracking-widest font-black uppercase">Phase 5.1</span>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide mt-1">Deploy React Dashboard Interface</h3>
                </div>
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 text-xs font-bold shrink-0">
                  ⚡ Vite + Tailwind Setup
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                Compile and build the primary react asset packets with dynamic MeeChain Theme gradients (Purple ➔ Blue ➔ Cyan). This prepares the three essential halls: Token Hall, Quest Hall, and the Scouter Monitor.
              </p>

              {/* Theme Selector Widget */}
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Visual Theme Gradient</label>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setDashboardTheme('purple-blue-cyan')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      dashboardTheme === 'purple-blue-cyan' 
                        ? 'bg-purple-500/20 text-purple-200 border-purple-500' 
                        : 'bg-black/30 text-white/40 border-white/5 hover:text-white'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></span>
                    MeeChain (ม่วง-น้ำเงิน-ฟ้า)
                  </button>
                </div>
              </div>

              {/* Interactive Mock Dashboard Preview Inside Step 1 */}
              <div className="p-4 bg-black/50 border border-white/5 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Simulated Layout Preview</span>
                  <div className="flex gap-1.5">
                    {['token', 'quest', 'monitor'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setSelectedPreviewTab(tab)}
                        className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider transition-all ${
                          selectedPreviewTab === tab ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-white/40 hover:text-white'
                        }`}
                      >
                        {tab} Hall
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPreviewTab === 'token' && (
                  <div className="h-28 bg-gradient-to-br from-purple-950/20 to-black rounded-lg p-3 text-left space-y-2 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-[10px] text-purple-300 block">MEEToken Balances</strong>
                        <span className="text-lg font-mono font-black text-white">1,250,000 MEE</span>
                      </div>
                      <Coins className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-[8px] font-mono text-white/40 flex justify-between">
                      <span>Address: 0xCf7Ed3A...Fc9</span>
                      <span className="text-emerald-400">● Live Synchronization</span>
                    </div>
                  </div>
                )}

                {selectedPreviewTab === 'quest' && (
                  <div className="h-28 bg-gradient-to-br from-blue-950/20 to-black rounded-lg p-3 text-left space-y-2 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-[10px] text-blue-300 block">QuestSystem Ledger</strong>
                        <span className="text-xs font-bold text-white/80">3 Badges & Quests Active</span>
                      </div>
                      <Award className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="h-6 bg-white/5 rounded-full flex items-center px-2 text-[8px] text-white/60">
                      🛡️ Complete Step: Defeat Goblin Horde (1/3 Completed)
                    </div>
                  </div>
                )}

                {selectedPreviewTab === 'monitor' && (
                  <div className="h-28 bg-gradient-to-br from-cyan-950/20 to-black rounded-lg p-3 text-left space-y-2 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-[10px] text-cyan-300 block">Prometheus Sentinel</strong>
                        <span className="text-sm font-mono font-black text-white">Consensus TPS: 2,450 / sec</span>
                      </div>
                      <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                      <div className="bg-white/5 p-1 rounded">RPC Latency: 42ms</div>
                      <div className="bg-emerald-500/10 text-emerald-400 p-1 rounded text-center">Alertmanager: Online</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Build Command Output Log */}
              {dashboardLogs.length > 0 && (
                <div className="p-3 bg-black/80 rounded-xl border border-white/5 font-mono text-[10px] text-cyan-400 space-y-1 h-32 overflow-y-auto cli-glow">
                  {dashboardLogs.map((log, idx) => (
                    <div key={idx} className={idx === dashboardLogs.length - 1 ? 'animate-pulse text-[#f7c55f]' : ''}>
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {/* Build Action Button */}
              <button 
                id="ritual-deploy-dashboard-btn"
                onClick={startDashboardBuild}
                disabled={isBuildingDashboard}
                className="w-full py-4 bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-600 hover:from-purple-600 hover:via-blue-500 hover:to-cyan-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isBuildingDashboard ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transmuting Assets...
                  </>
                ) : (
                  <>🪄 Build & Deploy React Dashboard</>
                )}
              </button>
            </div>
          )}

          {/* STEP 2 DETAIL ACTION */}
          {activeStep === 2 && (
            <div id="ritual-workspace-2" className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-5 animate-in fade-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 tracking-widest font-black uppercase">Phase 5.2</span>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide mt-1">Integrate Smart Contract Addresses</h3>
                </div>
                <div className="p-2 bg-[#f7c55f]/10 text-[#f7c55f] rounded-xl border border-[#f7c55f]/20 text-xs font-bold shrink-0">
                  ⛓️ EVM Contract Sync
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Bridge the React front-end directly with MeeChain RPC nodes. Track token balances of <strong>MEEToken.sol</strong> and achievements of <strong>QuestSystem.sol</strong> using mock RPC calls.
              </p>

              {/* Addresses Settings Forms */}
              <div className="grid gap-3.5 text-xs text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-black tracking-wider mb-1">MEEToken.sol Address</label>
                    <input 
                      className="w-full px-3 py-2 bg-black/55 border border-white/5 rounded-lg text-white font-mono outline-none focus:border-purple-500 transition-all text-[11px]" 
                      value={tokenAddress} 
                      onChange={(e) => setTokenAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-black tracking-wider mb-1">QuestSystem.sol Address</label>
                    <input 
                      className="w-full px-3 py-2 bg-black/55 border border-white/5 rounded-lg text-white font-mono outline-none focus:border-purple-500 transition-all text-[11px]" 
                      value={questAddress} 
                      onChange={(e) => setQuestAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 uppercase font-black tracking-wider mb-1">MeeChain RPC Node Url</label>
                  <input 
                    className="w-full px-3 py-2 bg-black/55 border border-white/5 rounded-lg text-white font-mono outline-none focus:border-purple-500 transition-all text-[11px]" 
                    value={rpcNodeUrl} 
                    onChange={(e) => setRpcNodeUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Real-time MEE token tracker & transfer utility */}
              <div className="p-4 bg-gradient-to-br from-purple-950/10 to-black rounded-xl border border-white/5 space-y-4 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <strong className="text-[11px] uppercase tracking-wider text-white">MEEToken Ledger State</strong>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">1 MEE = 1 energy</span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[9px] text-white/40 uppercase font-bold">MeeBuilder Balance</span>
                    <h4 className="text-xl font-mono font-black text-white">{meeBalance} MEE</h4>
                  </div>
                  <div className="text-[10px] text-white/40 text-right leading-relaxed font-mono">
                    <span className="block">RPC Call: <strong className="text-white">balanceOf({magicAddress?.substring(0, 8)}...)</strong></span>
                    <span className="block">System Gas Limit: <strong className="text-white">21000</strong></span>
                  </div>
                </div>

                {/* Simulated Transfer Component */}
                <form onSubmit={handleTransferTokens} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end pt-2 border-t border-white/5">
                  <div className="sm:col-span-4">
                    <label className="block text-[9px] text-white/40 uppercase font-bold mb-1">Transfer Amount</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-3 py-2 bg-black/50 border border-white/5 rounded-lg text-white font-mono focus:border-cyan-400 outline-none text-xs" 
                      value={transferAmount} 
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-[9px] text-white/40 uppercase font-bold mb-1">Recipient Hex</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-3 py-2 bg-black/50 border border-white/5 rounded-lg text-white font-mono focus:border-cyan-400 outline-none text-xs" 
                      value={transferTarget} 
                      onChange={(e) => setTransferTarget(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button 
                      type="submit" 
                      disabled={isTransferring}
                      className="w-full py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-[11px] font-bold rounded-lg border border-purple-500/25 shadow flex items-center justify-center gap-1.5 uppercase transition-all"
                    >
                      {isTransferring ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Transfer
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Transfer Ledger list */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[9px] text-white/30 uppercase font-mono tracking-wider">MeeChain Transfer Ledger Logs</span>
                  <div className="grid gap-1.5 max-h-24 overflow-y-auto">
                    {transferHistory.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] bg-black/40 p-2 rounded-lg border border-white/5 font-mono">
                        <div className="flex items-center gap-2 text-white/70">
                          <span className="text-emerald-400">✔</span>
                          <span>Tx: {item.tx}</span>
                          <span className="text-white/30">|</span>
                          <span>To: {item.to}</span>
                        </div>
                        <strong className="text-purple-300">{item.amount}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 DETAIL ACTION */}
          {activeStep === 3 && (
            <div id="ritual-workspace-3" className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-5 animate-in fade-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 tracking-widest font-black uppercase">Phase 5.3</span>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide mt-1">Run Full End-to-End Suite</h3>
                </div>
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 text-xs font-bold shrink-0">
                  🤖 Playwright Trials
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Execute automatic integration test runs. Playwright launches a mock browser workspace and exercises the crucial flow sequences: user authentication ➔ claim quest bounty ➔ mint token ➔ indexer explorer verification.
              </p>

              {/* Live Testing Stats Panel */}
              <div className="grid grid-cols-3 gap-3.5 text-center bg-black/40 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[9px] uppercase font-bold text-white/40 block">Tests Passed</span>
                  <strong className="text-lg font-mono text-emerald-400">{testStats.passed} / {testStats.total}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-white/40 block">Tests Failed</span>
                  <strong className="text-lg font-mono text-rose-500">{testStats.failed}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-white/40 block">E2E Latency</span>
                  <strong className="text-lg font-mono text-cyan-400">{testStats.latency}</strong>
                </div>
              </div>

              {/* Interactive Headless Browser Terminal */}
              <div className="p-4 bg-black/90 rounded-2xl border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <strong className="text-[10px] font-mono text-[#d4e3ff]">playwright-e2e-runner @ meechain-test-suite</strong>
                  </div>
                  <span className="text-[9px] font-mono text-white/30 uppercase">Node environment</span>
                </div>

                <div className="h-44 overflow-y-auto bg-black p-3.5 rounded-xl border border-white/5 font-mono text-xs text-[#b8cffd] leading-relaxed select-text space-y-2 scrollable-terminal">
                  {testConsole.length === 0 ? (
                    <div className="text-center py-10 text-white/30">
                      <div>⚙</div>
                      <p className="text-[10px] uppercase font-bold mt-2">CLI Console idle. Press "Execute E2E Trial" below.</p>
                    </div>
                  ) : (
                    testConsole.map((log, idx) => {
                      let color = '#d4e3ff';
                      if (log.type === 'info') color = '#f7c55f';
                      if (log.type === 'cmd') color = '#3dd9ff';
                      if (log.type === 'success') color = '#34d399';
                      if (log.type === 'muted') color = '#475569';

                      return (
                        <div key={idx} style={{ color }} className="whitespace-pre-wrap">
                          {log.text}
                        </div>
                      );
                    })
                  )}
                  <div ref={testConsoleEndRef}></div>
                </div>
              </div>

              {/* Run Tests Button */}
              <button 
                id="ritual-run-tests-btn"
                onClick={startE2ETesting}
                disabled={isTesting}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running Automation Suite ({testStats.passed}/4)...
                  </>
                ) : (
                  <>🛡️ Run E2E Test Suite</>
                )}
              </button>
            </div>
          )}

          {/* STEP 4 DETAIL ACTION */}
          {activeStep === 4 && (
            <div id="ritual-workspace-4" className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-5 animate-in fade-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 tracking-widest font-black uppercase">Phase 5.4</span>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide mt-1">Set Up Scouter Monitoring Nodes</h3>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-bold shrink-0">
                  📈 Prometheus & Grafana
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Activate real-time telemetry monitors. Collect live consensus block metrics with <strong>Prometheus</strong> and visual node stats like latency levels or TPS triggers with the <strong>Grafana Scouter Dashboard</strong>.
              </p>

              {/* Simulated Prometheus/Grafana Scouter Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                
                {/* Prometheus Scouter card */}
                <div className="p-4 bg-gradient-to-b from-[#0c2024] to-black rounded-xl border border-cyan-500/20 glow-cyan-card flex flex-col justify-between h-36">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-cyan-400">Prometheus Daemon</span>
                    <HeartPulse className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 uppercase font-mono">Consensus Stats</span>
                    <h4 className="text-lg font-mono font-black text-white">{monitoringEnabled ? liveTps : 0} TPS</h4>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
                    <span>Exporter Status</span>
                    <span className="text-emerald-400">🟢 Scraper Online</span>
                  </div>
                </div>

                {/* Grafana Dashboard latency card */}
                <div className="p-4 bg-gradient-to-b from-[#1b1c24] to-black rounded-xl border border-purple-500/20 flex flex-col justify-between h-36">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-purple-300">Grafana Dashboard</span>
                    <Monitor className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 uppercase font-mono">Chain Latency</span>
                    <h4 className="text-lg font-mono font-black text-white">{monitoringEnabled ? liveLatency : 0} ms</h4>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono text-white/40">
                    <span>Theme Sync</span>
                    <span className="text-purple-400">🛡️ Scouter Live</span>
                  </div>
                </div>

              </div>

              {/* Alertmanager Notification Test Module */}
              <div className="p-4 bg-black/50 rounded-xl border border-white/5 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                    <strong className="text-[11px] uppercase tracking-wider text-white">Alertmanager Sentinel</strong>
                  </div>
                  
                  {/* Failover status pill */}
                  <span className={`text-[8px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    failoverMode ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                  }`}>
                    {failoverMode ? '🚨 RPC FAILOVER ACTIVE' : '🟢 STABLE'}
                  </span>
                </div>

                <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                  Toggle node lag triggers manually to verify the Alertmanager automatic failover. This ensures traffic immediately redirects to backup nodes in case the primary RPC server stalls.
                </p>

                {/* Alert logs listing */}
                {activeAlerts.length > 0 && (
                  <div className="p-2.5 bg-red-950/10 border border-red-500/20 rounded-lg space-y-1.5">
                    {activeAlerts.map(alert => (
                      <div key={alert.id} className="flex justify-between text-[10px] text-red-400 font-mono font-bold">
                        <span>{alert.title}</span>
                        <span className="text-[8px] text-white/30">{alert.time}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => setFailoverMode(!failoverMode)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all border ${
                    failoverMode 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  }`}
                >
                  {failoverMode ? '✔ Reset Primary RPC Connection' : '⚡ Simulate High-Latency RPC Failover'}
                </button>
              </div>

              {/* Save Step Progress Button */}
              <button 
                id="ritual-complete-monitoring-btn"
                onClick={() => {
                  triggerSound('chime');
                  setStepStatuses(prev => {
                    const next = [...prev];
                    next[3] = 'completed';
                    return next;
                  });
                  setActiveStep(5);
                }}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <>📈 Confirm Monitoring Scouter Active</>
              </button>
            </div>
          )}

          {/* STEP 5 DETAIL ACTION */}
          {activeStep === 5 && (
            <div id="ritual-workspace-5" className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-5 animate-in fade-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 tracking-widest font-black uppercase">Phase 5.5</span>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide mt-1">Deploy to Production Gate</h3>
                </div>
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 text-xs font-bold shrink-0">
                  🚀 Vercel Hosting Sync
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Commit dashboard assets to Vercel production hosting servers under Project ID: <strong>{vercelProjectId}</strong>. Route and map your custom dns domain alias <strong>{productionDomain}</strong> to bring MeeChain live.
              </p>

              {/* Deploy settings input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left text-xs">
                <div>
                  <label className="block text-[10px] text-white/40 uppercase font-black tracking-wider mb-1">Vercel Project ID</label>
                  <input 
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/5 rounded-lg text-white font-mono focus:border-purple-500 outline-none text-[11px]" 
                    value={vercelProjectId} 
                    onChange={(e) => setVercelProjectId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 uppercase font-black tracking-wider mb-1">Custom Domain Alias</label>
                  <input 
                    className="w-full px-3 py-2.5 bg-black/50 border border-white/5 rounded-lg text-white font-mono focus:border-purple-500 outline-none text-[11px]" 
                    value={productionDomain} 
                    onChange={(e) => setProductionDomain(e.target.value)}
                  />
                </div>
              </div>

              {/* Deploy Output logs */}
              {deployLogs.length > 0 && (
                <div className="p-3 bg-black/90 rounded-xl border border-white/5 font-mono text-[10px] text-cyan-400 space-y-1 h-28 overflow-y-auto cli-glow">
                  {deployLogs.map((log, idx) => (
                    <div key={idx} className={idx === deployLogs.length - 1 ? 'animate-pulse text-[#f7c55f]' : ''}>
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {/* Status Indicator Live Deployment card */}
              {isLiveOnline && (
                <div className="p-4 bg-gradient-to-r from-emerald-950/10 to-black rounded-xl border border-emerald-500/30 flex items-center justify-between text-left">
                  <div>
                    <strong className="text-xs font-bold text-emerald-400 block">✔ Domain Successfully Synced</strong>
                    <span className="text-[10px] font-mono text-white/60">Target: <a href={`https://${productionDomain}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{productionDomain}</a></span>
                  </div>
                  <span className="text-xs font-bold text-white font-mono bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                    LIVE ON EDGE
                  </span>
                </div>
              )}

              {/* Deploy button */}
              <button 
                id="ritual-deploy-vercel-btn"
                onClick={executeProductionDeploy}
                disabled={isDeploying}
                className="w-full py-4 bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-700 hover:from-purple-600 hover:via-blue-500 hover:to-indigo-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isDeploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Broadcasting Assets to Edge Nodes...
                  </>
                ) : (
                  <>🚀 Cast Production Launch Spell</>
                )}
              </button>
            </div>
          )}

          {/* STEP 6 DETAIL ACTION */}
          {activeStep === 6 && (
            <div id="ritual-workspace-6" className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-5 animate-in fade-in duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-[#ffd700] tracking-widest font-black uppercase">Phase 5.6</span>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide mt-1">Unleash Community Grand Jubilee</h3>
                </div>
                <div className="p-2 bg-[#ffd700]/10 text-[#f7c55f] rounded-xl border border-[#f7c55f]/20 text-xs font-bold shrink-0">
                  🎉 Community Ritual
                </div>
              </div>

              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Celebrate production launch with your community network. Unleash a massive celebratory ripple to distribute special XP points, unlock custom achievements, and declare the MeeChain Magic Hall fully operational!
              </p>

              {/* Badge visual display card */}
              <div className="p-5 bg-gradient-to-br from-[#1c1409]/90 to-[#040816]/90 rounded-2xl border-2 border-[#ffd700]/30 shadow-2xl relative overflow-hidden text-left space-y-4">
                <div className="absolute right-2 bottom-2 text-8xl opacity-[0.03] pointer-events-none">🏆</div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-black/40 border-2 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.4)] flex items-center justify-center text-3.5xl shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white tracking-wide uppercase leading-tight">MeeChain Sentinel Badge</h4>
                    <span className="inline-block mt-1 px-2.5 py-0.5 text-[8px] uppercase font-black bg-[#ffd700]/25 text-[#ffd700] rounded-full border border-[#ffd700]/30 tracking-wider">
                      Legendary Mythic Artifact
                    </span>
                  </div>
                </div>

                <p className="text-xs text-white/75 leading-relaxed font-medium">
                  This divine seal identifies you as a key master architect of the MeeChain mainnet. Clears any latent quest block log and unlocks absolute admin access.
                </p>

                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/40 pt-2 border-t border-white/5">
                  <span>Award Reward</span>
                  <span className="text-[#ffd700] flex items-center gap-1 font-mono">+1,000 XP & Level-Up</span>
                </div>
              </div>

              {/* Celebrate action button */}
              <button 
                id="ritual-jubilee-celebrate-btn"
                onClick={executeJubileeCelebration}
                disabled={isJubilant}
                className="w-full py-5 bg-gradient-to-r from-[#ffd700] via-[#f7c55f] to-[#ff9900] hover:from-[#ffea00] hover:via-[#ffd700] hover:to-[#ffaa00] hover:scale-[1.02] active:scale-[0.98] text-black text-xs font-black rounded-xl shadow-[0_4px_30px_rgba(247,197,95,0.45)] transition-all animate-pulse-glow uppercase tracking-wider"
              >
                {isJubilant ? '✨ CELEBRATING GRAND JUBILEE ✨' : '🎊 Release Grand Jubilee Celebration'}
              </button>

              <div className="flex justify-center gap-4 text-[10px] font-mono text-white/30 pt-1">
                <span>Contributors Educated</span>
                <span>•</span>
                <span>Guardians Ready</span>
                <span>•</span>
                <span>Explorer Online</span>
              </div>
            </div>
          )}

        </div>

      </div>

      )}

    </section>
  );
}

// ============================================================
// ✦ MONITORING RELICS SECTION — Comprehensive RPG Relic Cards ✦
// ============================================================
export function MonitoringRelicsSection({ 
  liveTps = 125, 
  liveLatency = 85, 
  failoverMode = false, 
  onSimulateNormal, 
  onSimulateWarning, 
  onSimulateCritical 
}) {
  const alertState = getAlertThresholdState(liveTps, liveLatency, failoverMode);

  // Latency percentage for gauge needle (0ms to 400ms)
  const latencyPercent = Math.min(Math.max((liveLatency / 400) * 100, 10), 96);
  // TPS percentage for gauge needle (0 to 250 tps)
  const tpsPercent = Math.min(Math.max((liveTps / 250) * 100, 12), 96);

  return (
    <div className="w-full space-y-6 text-left my-4">
      {/* Title Header */}
      <div className="text-center relative py-2">
        <div className="flex items-center justify-center gap-3">
          <span className="text-[#f7c55f] text-lg animate-pulse font-serif">✦</span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 font-serif drop-shadow-[0_2px_10px_rgba(247,197,95,0.3)]">
            MONITORING RELICS
          </h2>
          <span className="text-[#f7c55f] text-lg animate-pulse font-serif">✦</span>
        </div>
        <p className="text-xs md:text-sm text-slate-300 mt-1 font-sans tracking-wide">
          Watch over the MeeChain network performance and health.
        </p>

        {/* Interactive Simulation Controls */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scraper Sim:</span>
          <button 
            onClick={onSimulateNormal}
            className="px-3 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold transition-all shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-pointer"
          >
            🟢 Healthy (85ms)
          </button>
          <button 
            onClick={onSimulateWarning}
            className="px-3 py-1 rounded-full bg-amber-950/80 hover:bg-amber-800 text-amber-300 border border-amber-500/50 text-[10px] font-bold transition-all shadow-[0_0_8px_rgba(245,158,11,0.2)] cursor-pointer"
          >
            ⚠️ High Load (210ms)
          </button>
          <button 
            onClick={onSimulateCritical}
            className="px-3 py-1 rounded-full bg-red-950/80 hover:bg-red-800 text-red-300 border border-red-500/50 text-[10px] font-bold transition-all shadow-[0_0_8px_rgba(239,68,68,0.2)] cursor-pointer"
          >
            🚨 Alert / Failover
          </button>
        </div>
      </div>

      {/* 3 Comprehensive Relic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ================= CARD 1: Orb of Connectivity ================= */}
        <div className="relative group rounded-3xl p-5 bg-gradient-to-b from-[#09152e] via-[#050b18] to-[#02050e] border-2 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_45px_rgba(6,182,212,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
          {/* Card Top Border Corner Accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-2xl pointer-events-none" />

          <div>
            {/* Header Title & Badge */}
            <div className="text-center space-y-1.5 mb-3">
              <h3 className="text-xl font-black text-white font-serif tracking-wide drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                Orb of Connectivity
              </h3>
              <div className="inline-block px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-black uppercase tracking-widest text-cyan-300">
                RPC STATUS
              </div>
            </div>

            {/* Glowing Orb Illustration SVG */}
            <div className="relative w-full h-40 my-2 flex items-center justify-center">
              {/* Outer Blue Aura Glow */}
              <div className="absolute w-36 h-36 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
              <div className="absolute w-24 h-24 rounded-full bg-blue-600/30 blur-md" />

              <svg className="w-32 h-32 relative z-10 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="orbGlow" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#a5f3fc" />
                    <stop offset="35%" stopColor="#06b6d4" />
                    <stop offset="70%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </radialGradient>
                  <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>
                </defs>

                {/* Pedestal Base */}
                <ellipse cx="50" cy="85" rx="36" ry="10" fill="url(#pedestalGrad)" stroke="#06b6d4" strokeWidth="1.5" />
                <path d="M22 85 L32 68 L68 68 L78 85 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <polygon points="35,68 50,62 65,68 50,74" fill="#0284c7" opacity="0.6" />

                {/* Pedestal Gem */}
                <polygon points="50,70 54,75 50,80 46,75" fill="#38bdf8" className="animate-pulse" />

                {/* Magical Orb Sphere */}
                <circle cx="50" cy="42" r="28" fill="url(#orbGlow)" />
                {/* Internal Swirl Light */}
                <ellipse cx="44" cy="36" rx="18" ry="10" fill="#ffffff" opacity="0.4" transform="rotate(-20 44 36)" />
                <circle cx="40" cy="30" r="4" fill="#ffffff" opacity="0.8" />

                {/* Energy Rings */}
                <ellipse cx="50" cy="42" rx="34" ry="8" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.7" transform="rotate(15 50 42)" className="animate-spin" style={{ animationDuration: '8s' }} />
              </svg>
            </div>

            {/* Metric Display */}
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Latency</span>
              <div className="text-3xl font-black font-mono text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                {liveLatency} <span className="text-base font-sans font-semibold text-cyan-200">ms</span>
              </div>
            </div>

            {/* Spectrum Gauge Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="relative w-full h-3 rounded-full bg-slate-900 border border-slate-700 overflow-hidden p-0.5">
                {/* Multi-color Spectrum Gradient */}
                <div className="w-full h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" />
                {/* Pointer Needle */}
                <div 
                  className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_8px_#ffffff] border border-slate-900 transition-all duration-500 transform -translate-x-1/2"
                  style={{ left: `${latencyPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold font-mono">
                <span className="text-emerald-400">Healthy</span>
                <span className="text-red-400">Warning &gt; 300ms</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Pills */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-cyan-500/20">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${
              liveLatency > 300 
                ? 'bg-red-950/80 text-red-300 border-red-500/60 animate-bounce' 
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
            }`}>
              {liveLatency > 300 ? '🚨 HIGH LATENCY' : '✓ ALL SYSTEMS GO'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-300 bg-slate-900/80 border border-slate-700/60 flex items-center gap-1">
              👥 128 GUARDIANS
            </span>
          </div>
        </div>


        {/* ================= CARD 2: Blade of Quests ================= */}
        <div className="relative group rounded-3xl p-5 bg-gradient-to-b from-[#2a1b06] via-[#120a02] to-[#080401] border-2 border-amber-500/40 hover:border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:shadow-[0_0_45px_rgba(245,158,11,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
          {/* Card Top Border Corner Accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-2xl pointer-events-none" />

          <div>
            {/* Header Title & Badge */}
            <div className="text-center space-y-1.5 mb-3">
              <h3 className="text-xl font-black text-white font-serif tracking-wide drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                Blade of Quests
              </h3>
              <div className="inline-block px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-[10px] font-black uppercase tracking-widest text-amber-300">
                CONTRACT ACTIVITY
              </div>
            </div>

            {/* Glowing Sword Illustration SVG */}
            <div className="relative w-full h-40 my-2 flex items-center justify-center">
              {/* Outer Golden Aura Glow */}
              <div className="absolute w-36 h-36 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
              <div className="absolute w-20 h-28 bg-yellow-500/25 blur-md" />

              <svg className="w-32 h-32 relative z-10 drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>
                  <linearGradient id="hiltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>

                {/* Pedestal Base */}
                <ellipse cx="50" cy="85" rx="36" ry="10" fill="#1c1003" stroke="#d97706" strokeWidth="1.5" />
                <rect x="25" y="75" width="50" height="10" fill="#2d1a04" stroke="#f59e0b" strokeWidth="1" rx="2" />

                {/* Sword Blade */}
                <polygon points="50,10 57,62 50,66 43,62" fill="url(#bladeGrad)" stroke="#fef08a" strokeWidth="1" />
                {/* Blade Center Fuller Line */}
                <line x1="50" y1="14" x2="50" y2="62" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />

                {/* Crossguard */}
                <path d="M30 63 Q50 67 70 63 Q50 60 30 63 Z" fill="#d97706" stroke="#fef08a" strokeWidth="1" />
                <circle cx="50" cy="63" r="3" fill="#38bdf8" />

                {/* Hilt & Pommel */}
                <rect x="47" y="66" width="6" height="14" fill="url(#hiltGrad)" rx="1" />
                <circle cx="50" cy="82" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

                {/* Runic Energy Sparks */}
                <circle cx="34" cy="30" r="1.5" fill="#fef08a" className="animate-ping" />
                <circle cx="66" cy="45" r="2" fill="#fbbf24" className="animate-bounce" />
                <circle cx="38" cy="52" r="1" fill="#f59e0b" className="animate-pulse" />
              </svg>
            </div>

            {/* Metric Display */}
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Pending Queue</span>
              <div className="text-2xl font-black font-mono text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                3 Pending Txns
              </div>
            </div>

            {/* Dual Progress Bar (Approvals vs Executed) */}
            <div className="space-y-1.5 mb-4">
              <div className="relative w-full h-3 rounded-full bg-slate-900 border border-slate-700 overflow-hidden flex">
                <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: '25%' }} />
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: '75%' }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold font-mono">
                <span className="text-cyan-400">● 48 Approvals</span>
                <span className="text-amber-400">● 672 Executed</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Pills */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-amber-500/20">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-amber-300 bg-amber-950/80 border border-amber-500/50 flex items-center gap-1">
              ⚔️ ACTIVE CONTRACTS
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-300 bg-slate-900/80 border border-slate-700/60 flex items-center gap-1">
              📜 720 LOGS
            </span>
          </div>
        </div>


        {/* ================= CARD 3: Sacred Coin of MEE ================= */}
        <div className="relative group rounded-3xl p-5 bg-gradient-to-b from-[#21092e] via-[#0e0317] to-[#040108] border-2 border-purple-500/40 hover:border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_45px_rgba(168,85,247,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
          {/* Card Top Border Corner Accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-400 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-400 rounded-tr-2xl pointer-events-none" />

          <div>
            {/* Header Title & Badge */}
            <div className="text-center space-y-1.5 mb-3">
              <h3 className="text-xl font-black text-white font-serif tracking-wide drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
                Sacred Coin of MEE
              </h3>
              <div className="inline-block px-3 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-[10px] font-black uppercase tracking-widest text-purple-300">
                NETWORK TPS
              </div>
            </div>

            {/* Glowing Coin Illustration SVG */}
            <div className="relative w-full h-40 my-2 flex items-center justify-center">
              {/* Outer Purple Aura Glow */}
              <div className="absolute w-36 h-36 rounded-full bg-purple-600/20 blur-xl animate-pulse" />
              <div className="absolute w-24 h-24 rounded-full bg-amber-500/20 blur-md" />

              <svg className="w-32 h-32 relative z-10 drop-shadow-[0_0_20px_rgba(234,179,8,0.7)]" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="coinGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#eab308" />
                    <stop offset="85%" stopColor="#a16207" />
                    <stop offset="100%" stopColor="#713f12" />
                  </radialGradient>
                </defs>

                {/* Pedestal Base */}
                <ellipse cx="50" cy="85" rx="36" ry="10" fill="#1e0b2b" stroke="#a855f7" strokeWidth="1.5" />
                <path d="M22 85 L32 70 L68 70 L78 85 Z" fill="#2e1045" stroke="#c084fc" strokeWidth="1" />

                {/* Coin Shadow & Pedestal Mount */}
                <ellipse cx="50" cy="68" rx="22" ry="6" fill="#170524" />

                {/* Golden MEE Coin */}
                <circle cx="50" cy="42" r="26" fill="url(#coinGrad)" stroke="#fef08a" strokeWidth="2" />
                <circle cx="50" cy="42" r="22" fill="none" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="4 2" />

                {/* Center "M" Emblem */}
                <text x="50" y="51" textAnchor="middle" fill="#582f0e" fontSize="26" fontWeight="900" fontFamily="serif">
                  M
                </text>
                <text x="49" y="50" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="900" fontFamily="serif">
                  M
                </text>

                {/* Mystical Sparkles */}
                <circle cx="30" cy="24" r="1.5" fill="#fef08a" className="animate-ping" />
                <circle cx="70" cy="28" r="2" fill="#c084fc" className="animate-pulse" />
              </svg>
            </div>

            {/* Metric Display */}
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Current TPS</span>
              <div className="text-3xl font-black font-mono text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                {liveTps} <span className="text-base font-sans font-semibold text-purple-200">tx/s</span>
              </div>
            </div>

            {/* Spectrum Gauge Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="relative w-full h-3 rounded-full bg-slate-900 border border-slate-700 overflow-hidden p-0.5">
                {/* Multi-color Spectrum Gradient */}
                <div className="w-full h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" />
                {/* Pointer Needle */}
                <div 
                  className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_8px_#ffffff] border border-slate-900 transition-all duration-500 transform -translate-x-1/2"
                  style={{ left: `${tpsPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold font-mono">
                <span className="text-emerald-400">Stable</span>
                <span className="text-red-400">High Load &gt; 250 tx/s</span>
              </div>
            </div>
          </div>

          {/* Bottom Status Pills */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-purple-500/20">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border ${
              liveTps > 200 
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/60' 
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
            }`}>
              {liveTps > 200 ? '⚡ LOAD ALERT' : '🛡️ TPS STABLE'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-purple-200 bg-purple-950/80 border border-purple-500/50 flex items-center gap-1">
              🔄 {failoverMode ? '1 Failover Event' : '0 Failover Events'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// 🔮 Artifacts & Telemetry Monitor Card with Responsive Tailwind Bindings
// ============================================================
export function ArtifactsTelemetryCard(props) {
  return <MonitoringRelicsSection {...props} />;
}

// ============================================================
// 1️⃣  MeeBotWidget — AI Guide (Magic ✨)
// ============================================================
export function MeeBotWidget({ onSend, busy, messages }) {
  return (
    <div className="glass-panel widget-box h-full min-h-[420px] flex flex-col p-5">
      <header className="widget-head pb-3 border-b border-indigo-500/30 text-left">
        <h3 className="text-lg font-bold text-indigo-200">🪄 MeeBot Magic</h3>
        <p className="text-xs text-indigo-400 mt-1">Your AI Guide to the Ritual dApp</p>
      </header>

      <div className="widget-body flex-1 overflow-y-auto space-y-3 my-3 px-3 py-2 border border-dashed border-indigo-500/40 rounded-lg bg-slate-900/40 text-left">
        {messages.length === 0 ? (
          <p className="text-indigo-300/50 text-xs italic">Ask me about bridges, quests, contracts...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`text-xs leading-relaxed ${msg.role === 'assistant' ? 'text-indigo-200' : 'text-emerald-300'}`}>
              <span className="font-semibold">{msg.role === 'assistant' ? '🪄 MeeBot: ' : '👤 Guest: '}</span>
              {msg.text}
            </div>
          ))
        )}
        {busy && <p className="text-indigo-300/70 text-xs animate-pulse">✨ กำลังร่ายมนต์...</p>}
      </div>

      <footer className="widget-footer flex gap-2 pt-2 border-t border-indigo-500/30">
        <input
          type="text"
          placeholder="Ask me anything..."
          className="flex-1 px-3 py-2 rounded-lg text-xs bg-slate-800 border border-indigo-500/30 text-indigo-100 placeholder-indigo-400/50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              onSend(e.target.value);
              e.target.value = '';
            }
          }}
        />
        <button
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-all shrink-0"
          onClick={(e) => {
            const input = e.target.closest('.widget-footer').querySelector('input');
            if (input.value.trim()) {
              onSend(input.value);
              input.value = '';
            }
          }}
        >
          Ask
        </button>
      </footer>
    </div>
  );
}

// ============================================================
// 2️⃣  QuickActionsWidget — Ritual Shortcuts (⚡)
// ============================================================
export function QuickActionsWidget({ onAction }) {
  const actions = [
    { id: 'bridge', label: '🌉 How to Bridge?', emoji: '🌉' },
    { id: 'rpc', label: '🔗 RPC Status', emoji: '🔗' },
    { id: 'quests', label: '🎯 Daily Quests', emoji: '🎯' },
    { id: 'mee', label: '💰 Get MEE', emoji: '💰' },
    { id: 'contracts', label: '📜 Contracts', emoji: '📜' },
    { id: 'validator', label: '👑 Validator', emoji: '👑' },
  ];

  return (
    <div className="glass-panel widget-box p-5 h-full flex flex-col justify-between text-left">
      <header className="widget-head pb-3 border-b border-emerald-500/30">
        <h3 className="text-lg font-bold text-emerald-200">⚡ Quick Actions</h3>
        <p className="text-xs text-emerald-400 mt-1">Ritual shortcuts</p>
      </header>

      <div className="widget-body grid grid-cols-2 gap-2 mt-3 flex-1">
        {actions.map((act) => (
          <button
            key={act.id}
            className="ritual-btn group relative px-3 py-2 rounded-lg text-[11px] font-semibold bg-slate-800 border border-emerald-500/40 text-emerald-200 hover:bg-slate-700 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/40 transition-all overflow-hidden"
            onClick={() => onAction(act.id)}
          >
            <span className="relative z-10 flex items-center justify-center gap-1.5 truncate">
              <span>{act.emoji}</span> 
              <span>{act.label.split(' ').slice(1).join(' ')}</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 3️⃣  PlayWidget — Gaming/Engagement (🎮)
// ============================================================
export function PlayWidget({ onAction }) {
  const playItems = [
    { id: 'daily-quest', label: 'Daily Quest', emoji: '🎯', desc: '+10 XP' },
    { id: 'spell-cast', label: 'Cast Spell', emoji: '✨', desc: 'Earn Badge' },
    { id: 'battle', label: 'Arena Battle', emoji: '⚔️', desc: 'Compete' },
    { id: 'mystery-box', label: 'Mystery Box', emoji: '🎁', desc: 'Random NFT' },
    { id: 'music-ritual', label: 'Music Ritual', emoji: '🎵', desc: 'Harmonize' },
    { id: 'achievement', label: 'Achievements', emoji: '🏆', desc: 'View All' },
  ];

  return (
    <div className="glass-panel widget-box p-5 h-full flex flex-col justify-between text-left">
      <header className="widget-head pb-3 border-b border-purple-500/30">
        <h3 className="text-lg font-bold text-purple-200">🎮 Play & Earn</h3>
        <p className="text-xs text-purple-400 mt-1">Interactive rituals for XP & rewards</p>
      </header>

      <div className="widget-body space-y-2 mt-3 flex-1">
        {playItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-purple-500/30 hover:border-purple-400 hover:bg-slate-700 text-left group transition-all"
            onClick={() => onAction(item.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg group-hover:animate-bounce shrink-0">{item.emoji}</span>
              <div className="truncate">
                <p className="text-xs font-semibold text-purple-200">{item.label}</p>
                <p className="text-[10px] text-purple-400/70">{item.desc}</p>
              </div>
            </div>
            <span className="text-purple-400 group-hover:text-purple-300 font-bold shrink-0">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 4️⃣  OperateWidget — System Management (🔧)
// ============================================================
export function OperateWidget({ onAction, systemStatus }) {
  const operateItems = [
    { id: 'rpc-health', label: 'RPC Health', emoji: '🏥', status: systemStatus?.rpc || 'checking' },
    { id: 'contracts', label: 'Contracts', emoji: '📋', status: systemStatus?.contracts || 'ready' },
    { id: 'db-sync', label: 'DB Sync', emoji: '🔄', status: systemStatus?.db || 'syncing' },
    { id: 'bridge-validator', label: 'Bridge Validator', emoji: '⛓️', status: systemStatus?.bridge || 'active' },
    { id: 'security-audit', label: 'Security Audit', emoji: '🔐', status: systemStatus?.security || 'ok' },
    { id: 'performance', label: 'Performance', emoji: '⚡', status: systemStatus?.perf || 'optimal' },
  ];

  const statusColor = (status) => {
    if (status === 'active' || status === 'ok' || status === 'optimal' || status === 'ready') return 'text-emerald-400';
    if (status === 'checking' || status === 'syncing' || status.includes('alert')) return 'text-yellow-400 animate-pulse';
    return 'text-red-400';
  };

  return (
    <div className="glass-panel widget-box p-5 h-full flex flex-col justify-between text-left">
      <header className="widget-head pb-3 border-b border-cyan-500/30">
        <h3 className="text-lg font-bold text-cyan-200">🔧 Operate</h3>
        <p className="text-xs text-cyan-400 mt-1">System control & monitoring</p>
      </header>

      <div className="widget-body space-y-2 mt-3 flex-1">
        {operateItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-700 transition-all text-left"
            onClick={() => onAction(item.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg shrink-0">{item.emoji}</span>
              <span className="text-xs font-semibold text-cyan-200 truncate">{item.label}</span>
            </div>
            <span className={`text-[10px] font-bold ${statusColor(item.status)} capitalize shrink-0`}>
              {item.status}
            </span>
          </button>
        ))}
      </div>

      <footer className="widget-footer mt-4 pt-3 border-t border-cyan-500/30 flex gap-2">
        <button 
          onClick={() => onAction('db-sync')}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-600/20 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-600/40 transition-all"
        >
          🔄 Refresh
        </button>
        <button 
          onClick={() => onAction('rpc-health')}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-600/20 border border-red-500/50 text-red-200 hover:bg-red-600/40 transition-all"
        >
          🚨 Failover
        </button>
      </footer>
    </div>
  );
}

// ============================================================
// 5️⃣  LearnWidget — Documentation & Guides (📚)
// ============================================================
export function LearnWidget({ onAction }) {
  const learnItems = [
    { id: 'intro', label: 'Getting Started', emoji: '🚀', section: 'Basics' },
    { id: 'bridge-guide', label: 'Bridge Guide', emoji: '🌉', section: 'Integration' },
    { id: 'smart-contracts', label: 'Smart Contracts', emoji: '📜', section: 'Dev' },
    { id: 'nft-evolution', label: 'NFT Evolution', emoji: '🎨', section: 'Features' },
    { id: 'faq', label: 'FAQ', emoji: '❓', section: 'Help' },
    { id: 'community', label: 'Community', emoji: '👥', section: 'Social' },
  ];

  return (
    <div className="glass-panel widget-box p-5 h-full flex flex-col justify-between text-left">
      <header className="widget-head pb-3 border-b border-blue-500/30">
        <h3 className="text-lg font-bold text-blue-200">📚 Learn</h3>
        <p className="text-xs text-blue-400 mt-1">Documentation & guides</p>
      </header>

      <div className="widget-body space-y-2 mt-3 flex-1">
        {learnItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 border border-blue-500/30 hover:border-blue-400 hover:bg-slate-700 group transition-all text-left"
            onClick={() => onAction(item.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg group-hover:scale-110 transition-transform shrink-0">{item.emoji}</span>
              <div className="truncate">
                <p className="text-xs font-semibold text-blue-200">{item.label}</p>
                <p className="text-[10px] text-blue-400/70">{item.section}</p>
              </div>
            </div>
            <span className="text-blue-400 group-hover:text-blue-300 text-xs shrink-0 font-bold">→</span>
          </button>
        ))}
      </div>

      <footer className="widget-footer mt-4 pt-3 border-t border-blue-500/30">
        <button 
          onClick={() => onAction('intro')}
          className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600/30 to-blue-700/30 border border-blue-500/50 text-blue-200 hover:from-blue-600/50 hover:to-blue-700/50 transition-all"
        >
          📖 Full Docs
        </button>
      </footer>
    </div>
  );
}

// ============================================================
// 6️⃣  MagicHallContainer — Layout all widgets
// ============================================================
export function MagicHallContainer({ meebot, quickActions, play, operate, learn }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 mb-2">
            🪄 MeeChain Magic Hall
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            Ritualized Web3 music economy — ask, act, learn, earn
          </p>
        </div>

        {/* Grid Layout: Balanced 12-Column Responsive Layout based on Component Importance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-6 items-stretch">
          {/* Primary Hero Widget: AI Assistant Guide (Spans 2 cols on lg, 7 cols on xl) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-7 flex flex-col">
            <MeeBotWidget {...meebot} />
          </div>

          {/* High-Importance Shortcuts (Spans 1 col on lg, 5 cols on xl) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-5 flex flex-col">
            <QuickActionsWidget {...quickActions} />
          </div>

          {/* ✦ FULL WIDTH MONITORING RELICS SECTION ✦ */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-12">
            <MonitoringRelicsSection />
          </div>

          {/* Secondary Tier Widgets: 3 Equal Columns on xl (4 cols each) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-4 flex flex-col">
            <PlayWidget {...play} />
          </div>
          <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-4 flex flex-col">
            <OperateWidget {...operate} />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-4 flex flex-col">
            <LearnWidget {...learn} />
          </div>
        </div>
      </div>
    </div>
  );
}
