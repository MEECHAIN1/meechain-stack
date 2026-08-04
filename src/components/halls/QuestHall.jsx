import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api, useBlockchain, blockchainEvents } from '../../lib/api';
import { useLevelUpSound } from '../../lib/sounds';
import { 
  Shield, 
  Sword, 
  Trophy, 
  Sparkles, 
  Plus, 
  Award, 
  CheckCircle, 
  ChevronDown, 
  Lock, 
  Unlock, 
  Coins, 
  Flame, 
  Zap, 
  BookOpen, 
  Compass, 
  User, 
  Check, 
  Terminal,
  Volume2,
  Gift,
  PlusCircle,
  Eye,
  Info,
  BadgeAlert
} from 'lucide-react';

export default function QuestHall({ quests, onQuestConfirm, magicAddress, onNavigate }) {
  const { playLevelUp } = useLevelUpSound();
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'sandbox'
  const stateKey = `meechain-quest-state-${magicAddress || '0xMeeBuilderDemo'}`;

  // Core Gamification State (Connected to real-time smart contract / API)
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(350);
  const [maxXp, setMaxXp] = useState(1000);
  const [activeQuests, setActiveQuests] = useState([]);
  const [boardQuests, setBoardQuests] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [levelUpOverlay, setLevelUpOverlay] = useState(null); // null or { oldLevel, newLevel, oldTitle, newTitle }
  
  // Create Quest Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestDesc, setNewQuestDesc] = useState('');
  const [newQuestReward, setNewQuestReward] = useState('300 XP');
  const [newQuestTarget, setNewQuestTarget] = useState(3);
  const [newQuestCategory, setNewQuestCategory] = useState('Battle');

  // Claiming Reward Animation State
  const [showChestModal, setShowChestModal] = useState(false);
  const [claimingQuest, setClaimingQuest] = useState(null);
  const [chestState, setChestState] = useState('closed'); // 'closed' | 'bouncing' | 'open'
  const [coinsClaimed, setCoinsClaimed] = useState([]);
  const [copiedAddress, setCopiedAddress] = useState(null);

  // Sandbox/Playground State variables
  const [contractAddress, setContractAddress] = useState('0x68B1D87F95878fE05B998F19b66F4baba5De1aed');
  const [questName, setQuestName] = useState('First Quest');
  const [questDesc, setQuestDesc] = useState('Intro quest');
  const [rewardXp, setRewardXp] = useState('100');
  const [expiry, setExpiry] = useState('1690000000');
  const [category, setCategory] = useState('1');
  const [magicPower, setMagicPower] = useState('50');
  const [deployerKey, setDeployerKey] = useState('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
  const [playerKey, setPlayerKey] = useState('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
  const [rpcUrl, setRpcUrl] = useState('https://rpc.meechain.live');
  const [questIdToQuery, setQuestIdToQuery] = useState('0');
  
  const [activeStep, setActiveStep] = useState(1); // 1, 2, 3, 4
  const [terminalLogs, setTerminalLogs] = useState([
    { text: '🧙 MeeChain Forge Terminal initialized.', type: 'info' },
    { text: 'Ready to cast smart contract rituals. Select a step to generate cast commands.', type: 'muted' }
  ]);
  const [isCasting, setIsCasting] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null);

  const getTitleForLevel = (lvl) => {
    if (lvl >= 3) return 'Arch-Mage';
    if (lvl === 2) return 'Adept Alchemist';
    return 'Novice Mage';
  };

  const {
    level: chainLevel,
    xp: chainXp,
    maxXp: chainMaxXp,
    badges: chainBadges,
    refetch: refetchChain
  } = useBlockchain(magicAddress);

  // Sync real-time blockchain/API state to local gamification display state
  useEffect(() => {
    if (chainLevel !== undefined) setLevel(chainLevel);
    if (chainXp !== undefined) setXp(chainXp);
    if (chainMaxXp !== undefined) setMaxXp(chainMaxXp);
    if (chainBadges !== undefined) setEarnedBadges(chainBadges);
  }, [chainLevel, chainXp, chainMaxXp, chainBadges]);

  // Initialize and load gamification state from localStorage & API
  useEffect(() => {
    const savedState = localStorage.getItem(stateKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setActiveQuests(parsed.activeQuests || []);
        setBoardQuests(parsed.boardQuests || []);
      } catch (err) {
        console.error('Error loading saved quest state', err);
        resetToDefaultState();
      }
    } else {
      resetToDefaultState();
    }
  }, [magicAddress]);

  // Save current active quests and boards to localStorage
  const saveCurrentState = (updatedData = {}) => {
    const stateToSave = {
      activeQuests: updatedData.activeQuests || activeQuests,
      boardQuests: updatedData.boardQuests || boardQuests,
    };
    localStorage.setItem(stateKey, JSON.stringify(stateToSave));
  };

  const resetToDefaultState = () => {
    const defaultActive = [
      { id: 'dragon_slayer', label: 'Dragon Slayer', desc: 'Slay the fire-breathing beast in MeeMountain', progress: 2, target: 5, reward: '1000 XP', image: '🐉', completed: false, claimed: false },
      { id: 'treasure_hunt', label: 'Treasure Hunt', desc: 'Uncover the lost vault of MeeChain', progress: 1, target: 3, reward: '500 XP', image: '🪙', completed: false, claimed: false },
      { id: 'rescue_villagers', label: 'Rescue the Villagers', desc: 'Protect the innocent souls from invaders', progress: 4, target: 4, reward: '0.5 ETH', image: '🛡️', completed: true, claimed: false }
    ];

    const defaultBoard = [
      { id: 'goblin_raid', label: 'Goblin Raid', desc: 'Stop the goblin army from pillaging our farms', reward: '300 XP', status: 'Open', category: 'Battle' },
      { id: 'ancient_puzzle', label: 'Ancient Puzzle', desc: 'Solve the enigmatic runic encryption code', reward: '0.2 ETH', status: 'Open', category: 'Intellect' },
      { id: 'lost_relic', label: 'Lost Relic', desc: 'Retrieve the mystical shard from the ruins', reward: '750 XP', status: 'Open', category: 'Explore' },
      { id: 'defend_castle', label: 'Defend the Castle', desc: 'Hold the gates against the incoming dragon riders', reward: '1000 XP + 1 NFT', status: 'Locked', category: 'Legendary' }
    ];

    setActiveQuests(defaultActive);
    setBoardQuests(defaultBoard);

    localStorage.setItem(stateKey, JSON.stringify({
      activeQuests: defaultActive,
      boardQuests: defaultBoard
    }));
  };

  // Gamification Actions
  const handleJoinQuest = (quest) => {
    // If locked, return
    if (quest.status === 'Locked') return;

    // Check if already joined
    if (activeQuests.some(q => q.label === quest.label)) {
      alert('This quest is already active in your quest hall!');
      return;
    }

    const questTarget = quest.label.toLowerCase().includes('puzzle') ? 3 : quest.label.toLowerCase().includes('relic') ? 1 : 5;
    const newActive = {
      id: `active_${Date.now()}`,
      label: quest.label,
      desc: quest.desc,
      progress: 0,
      target: questTarget,
      reward: quest.reward,
      image: quest.category === 'Battle' ? '⚔️' : quest.category === 'Intellect' ? '🔮' : quest.category === 'Explore' ? '🗺️' : '🌟',
      completed: false,
      claimed: false
    };

    const updatedActive = [...activeQuests, newActive];
    const updatedBoard = boardQuests.map(bq => bq.id === quest.id ? { ...bq, status: 'Joined' } : bq);

    setActiveQuests(updatedActive);
    setBoardQuests(updatedBoard);
    saveCurrentState({ activeQuests: updatedActive, boardQuests: updatedBoard });

    // Confetti burst for joining
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 }
    });
  };

  const handleIncrementProgress = (questId) => {
    const updatedActive = activeQuests.map(q => {
      if (q.id === questId && q.progress < q.target) {
        const nextProgress = q.progress + 1;
        const isCompletedNow = nextProgress >= q.target;
        
        if (isCompletedNow) {
          // Sparkle trigger on complete
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              colors: ['#f7c55f', '#58d79f', '#ff7c85']
            });
          }, 100);

          // Emit QuestCompleted event in real-time
          blockchainEvents.emit('QuestCompleted', { address: magicAddress, questId });
        }

        return {
          ...q,
          progress: nextProgress,
          completed: isCompletedNow
        };
      }
      return q;
    });

    setActiveQuests(updatedActive);
    saveCurrentState({ activeQuests: updatedActive });
  };

  const handleStartClaimFlow = (quest) => {
    setClaimingQuest(quest);
    setChestState('closed');
    setShowChestModal(true);
    setCoinsClaimed([]);
  };

  const executeClaimReward = () => {
    if (!claimingQuest) return;

    setChestState('bouncing');

    // Bounce animation timeout
    setTimeout(() => {
      setChestState('open');
      
      // Giant explosion of gold confetti
      confetti({
        particleCount: 150,
        spread: 100,
        colors: ['#ffd700', '#f7c55f', '#fff5cc', '#ff9900'],
        origin: { y: 0.6 }
      });

      // Generate visual coin bursts inside the modal
      const newCoins = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        delay: i * 0.08,
        left: 40 + Math.random() * 20,
        top: 40 + Math.random() * 20
      }));
      setCoinsClaimed(newCoins);

      // Parse and reward XP/ETH/NFT
      let xpToAward = 0;
      let ethToAward = 0;
      let gotBadge = null;

      if (claimingQuest.reward.includes('XP')) {
        xpToAward = parseInt(claimingQuest.reward) || 300;
      }
      if (claimingQuest.reward.includes('ETH')) {
        ethToAward = parseFloat(claimingQuest.reward) || 0.1;
      }

      // Check badge unlocks
      const nextBadges = [...earnedBadges];
      if (claimingQuest.id === 'dragon_slayer' && !earnedBadges.some(b => b.id === 'badge_dragon_slayer')) {
        gotBadge = { id: 'badge_dragon_slayer', label: '🐉 Dragon Slayer', desc: 'Successfully vanquished the mountain terror.', icon: '🐉', color: '#ff7070' };
        nextBadges.push(gotBadge);
      } else if (claimingQuest.id === 'treasure_hunt' && !earnedBadges.some(b => b.id === 'badge_treasure')) {
        gotBadge = { id: 'badge_treasure', label: '👑 Vault Breaker', desc: 'Unlocked the ancient treasures of MeeChain.', icon: '💎', color: '#3dd9ff' };
        nextBadges.push(gotBadge);
      } else if (claimingQuest.id === 'rescue_villagers' && !earnedBadges.some(b => b.id === 'badge_rescue')) {
        gotBadge = { id: 'badge_rescue', label: '🛡️ Village Protector', desc: 'Shielded innocent souls from the dark forces.', icon: '🛡️', color: '#58d79f' };
        nextBadges.push(gotBadge);
      }

      // Add to overall stats
      let finalXp = xp + xpToAward;
      let finalLevel = level;
      let finalMaxXp = maxXp;

      // Handle Level Up
      if (finalXp >= finalMaxXp) {
        finalXp = finalXp - finalMaxXp;
        finalLevel += 1;
        finalMaxXp = Math.floor(finalMaxXp * 1.5);

        // Gorgeous level-up overlay and sound
        setLevelUpOverlay({
          oldLevel: level,
          newLevel: finalLevel,
          oldTitle: getTitleForLevel(level),
          newTitle: getTitleForLevel(finalLevel)
        });

        // Play synthetic magic sound effect (anticipatory drumroll + epic brass/chime!)
        playLevelUp(finalLevel);

        // Huge multi-burst for leveling up!
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.4 }
          });
          
          // Unlock Level-up specific badges
          if (finalLevel === 2) {
            nextBadges.push({ id: 'badge_lvl2', label: '🔮 Adept Alchemist', desc: 'Reached Level 2. Power and intellect grow.', icon: '🔮', color: '#e0aaff' });
          } else if (finalLevel === 3) {
            nextBadges.push({ id: 'badge_lvl3', label: '🛡️ Arch-Mage', desc: 'Reached Level 3. Unlock legendary castle defense.', icon: '👑', color: '#f7c55f' });
          }
        }, 1000);
      }

      // Mark as claimed and update lists
      const updatedActive = activeQuests.map(aq => aq.id === claimingQuest.id ? { ...aq, claimed: true } : aq);
      
      // Update board status of this quest to "Completed"
      const matchedBq = boardQuests.find(bq => claimingQuest.label.includes(bq.label));
      const updatedBoard = boardQuests.map(bq => {
        if (matchedBq && bq.id === matchedBq.id) {
          return { ...bq, status: 'Completed' };
        }
        // Unlock legendary defend castle if reached level 3
        if (bq.id === 'defend_castle' && finalLevel >= 3) {
          return { ...bq, status: 'Open' };
        }
        return bq;
      });

      // Confirm to parent App so MeeBot can record logs/badges
      if (onQuestConfirm && claimingQuest.id) {
        onQuestConfirm(claimingQuest.id);
      }

      // Save states
      setLevel(finalLevel);
      setXp(finalXp);
      setMaxXp(finalMaxXp);
      setActiveQuests(updatedActive);
      setBoardQuests(updatedBoard);
      setEarnedBadges(nextBadges);
      
      // Update blockchain ledger
      api.updateUserStats(magicAddress, {
        level: finalLevel,
        xp: finalXp,
        maxXp: finalMaxXp,
        title: getTitleForLevel(finalLevel),
        badges: nextBadges
      }).then(() => {
        console.log('Real-time ledger state updated successfully.');
      });

      saveCurrentState({
        activeQuests: updatedActive,
        boardQuests: updatedBoard
      });

    }, 800);
  };

  const handleCreateQuest = (e) => {
    e.preventDefault();
    if (!newQuestName.trim() || !newQuestDesc.trim()) return;

    const newBq = {
      id: `custom_${Date.now()}`,
      label: newQuestName,
      desc: newQuestDesc,
      reward: newQuestReward,
      status: 'Open',
      category: newQuestCategory
    };

    const updatedBoard = [newBq, ...boardQuests];
    setBoardQuests(updatedBoard);
    saveCurrentState({ boardQuests: updatedBoard });

    // Reset create modal
    setNewQuestName('');
    setNewQuestDesc('');
    setNewQuestReward('300 XP');
    setNewQuestTarget(3);
    setShowCreateModal(false);

    // Simulated ledger transaction broadcast alert
    setTerminalLogs(prev => [
      { text: `🔮 [Blockchain Transaction] Sent to QuestSystem.sol`, type: 'info' },
      { text: `TxHash: 0x${Math.random().toString(16).substr(2, 40)}`, type: 'success' },
      { text: `Event Emitted: QuestCreated("${newQuestName}", reward: "${newQuestReward}")`, type: 'event' },
      ...prev
    ]);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // COMPUTED VALUES FOR SANDBOX TERMINAL (FOUNDRY)
  const getCommand = (step) => {
    switch (step) {
      case 1:
        return `cast send ${contractAddress} \\\n"createQuest(string,string,uint256,uint256,uint8,uint256)" \\\n"${questName}" "${questDesc}" ${rewardXp} ${expiry} ${category} ${magicPower} \\\n--rpc-url ${rpcUrl} \\\n--private-key ${deployerKey}`;
      case 2:
        return `cast call ${contractAddress} \\\n"getQuest(uint256)" ${questIdToQuery} \\\n--rpc-url ${rpcUrl}`;
      case 3:
        return `cast send ${contractAddress} \\\n"completeQuest(uint256)" ${questIdToQuery} \\\n--rpc-url ${rpcUrl} \\\n--private-key ${playerKey}`;
      case 4:
        return `cast logs \\\n--address ${contractAddress} \\\n--rpc-url ${rpcUrl}`;
      default:
        return '';
    }
  };

  const handleCopy = (step, text) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(step);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleCopyAddress = (key, address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(key);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const executeRitualStep = (step) => {
    setIsCasting(true);
    
    // Create authentic CLI mock response based on actual inputs
    setTimeout(() => {
      let mockOutput = [];
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const blockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const blockNum = Math.floor(154200 + Math.random() * 200);

      if (step === 1) {
        mockOutput = [
          { text: `Executing Step 1: Create Quest via cast send...`, type: 'info' },
          { text: `$ cast send ${contractAddress} "createQuest(...)"`, type: 'cmd' },
          { text: `blockHash           ${blockHash}`, type: 'success' },
          { text: `blockNumber         ${blockNum}`, type: 'success' },
          { text: `cumulativeGasUsed   45120`, type: 'success' },
          { text: `from                0xac0974bec39... (Deployer)`, type: 'success' },
          { text: `gasUsed             45120`, type: 'success' },
          { text: `status              1 (Success)`, type: 'success' },
          { text: `transactionHash     ${txHash}`, type: 'success' },
          { text: `\n[🔥 Emitted Events]`, type: 'warn' },
          { text: `  - QuestCreated(`, type: 'event' },
          { text: `      questId: ${questIdToQuery},`, type: 'event' },
          { text: `      label: "${questName}",`, type: 'event' },
          { text: `      desc: "${questDesc}",`, type: 'event' },
          { text: `      rewardXp: ${rewardXp},`, type: 'event' },
          { text: `      rewardPower: ${magicPower}`, type: 'event' },
          { text: `    )`, type: 'event' },
          { text: `🎉 Ritual Completed: Quest successfully created on the ledger!`, type: 'info' }
        ];
      } else if (step === 2) {
        mockOutput = [
          { text: `Executing Step 2: Fetch Quest via cast call...`, type: 'info' },
          { text: `$ cast call ${contractAddress} "getQuest(uint256)" ${questIdToQuery}`, type: 'cmd' },
          { text: `[Decoded Return Output]:`, type: 'warn' },
          { text: `  1) string: "${questName}"`, type: 'success' },
          { text: `  2) string: "${questDesc}"`, type: 'success' },
          { text: `  3) uint256: ${rewardXp}`, type: 'success' },
          { text: `  4) uint256: ${expiry}`, type: 'success' },
          { text: `  5) uint8: ${category}`, type: 'success' },
          { text: `  6) uint256: ${magicPower}`, type: 'success' },
          { text: `  7) bool: false (completed)`, type: 'success' },
          { text: `🔍 Quest is registered and ready in contract memory.`, type: 'info' }
        ];
      } else if (step === 3) {
        mockOutput = [
          { text: `Executing Step 3: Complete Quest via cast send...`, type: 'info' },
          { text: `$ cast send ${contractAddress} "completeQuest(${questIdToQuery})"`, type: 'cmd' },
          { text: `blockHash           ${blockHash}`, type: 'success' },
          { text: `blockNumber         ${blockNum + 1}`, type: 'success' },
          { text: `cumulativeGasUsed   68930`, type: 'success' },
          { text: `from                0x59c6995... (Player)`, type: 'success' },
          { text: `gasUsed             68930`, type: 'success' },
          { text: `status              1 (Success)`, type: 'success' },
          { text: `transactionHash     ${txHash}`, type: 'success' },
          { text: `\n[🔥 Emitted Events]`, type: 'warn' },
          { text: `  - QuestCompleted(`, type: 'event' },
          { text: `      player: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d,`, type: 'event' },
          { text: `      questId: ${questIdToQuery},`, type: 'event' },
          { text: `      earnedXp: ${rewardXp},`, type: 'event' },
          { text: `      earnedPower: ${magicPower}`, type: 'event' },
          { text: `    )`, type: 'event' },
          { text: `🏆 Success! Quest state transitioned to 'Completed' inside the virtual EVM state.`, type: 'info' }
        ];

        // Real-time integration: Actually reward the user with the rewardXp from their sandbox cast!
        const xpToGain = Number(rewardXp) || 100;
        api.getUserStats(magicAddress).then((statsRes) => {
          const currentStats = statsRes.data || { level: 1, xp: 350, maxXp: 1000, badges: [] };
          let newXp = (currentStats.xp || 0) + xpToGain;
          let newLevel = currentStats.level || 1;
          let newMaxXp = currentStats.maxXp || 1000;
          let leveledUp = false;
          const nextBadges = [...(currentStats.badges || [])];

          if (newXp >= newMaxXp) {
            newXp = newXp - newMaxXp;
            newLevel += 1;
            newMaxXp = Math.floor(newMaxXp * 1.5);
            leveledUp = true;

            if (newLevel === 2 && !nextBadges.some(b => b.id === 'badge_lvl2')) {
              nextBadges.push({ id: 'badge_lvl2', label: '🔮 Adept Alchemist', desc: 'Reached Level 2. Power and intellect grow.', icon: '🔮', color: '#e0aaff' });
            } else if (newLevel === 3 && !nextBadges.some(b => b.id === 'badge_lvl3')) {
              nextBadges.push({ id: 'badge_lvl3', label: '🛡️ Arch-Mage', desc: 'Reached Level 3. Unlock legendary castle defense.', icon: '👑', color: '#f7c55f' });
            }
          }

          api.updateUserStats(magicAddress, {
            level: newLevel,
            xp: newXp,
            maxXp: newMaxXp,
            title: getTitleForLevel(newLevel),
            badges: nextBadges
          }).then(() => {
            // Update local display immediately
            setLevel(newLevel);
            setXp(newXp);
            setMaxXp(newMaxXp);
            setEarnedBadges(nextBadges);

            if (leveledUp) {
              setLevelUpOverlay({
                oldLevel: currentStats.level || 1,
                newLevel: newLevel,
                oldTitle: getTitleForLevel(currentStats.level || 1),
                newTitle: getTitleForLevel(newLevel)
              });

              // Play synthesized magic sound (anticipatory drumroll + epic brass/chime!)
              playLevelUp(newLevel);

              setTimeout(() => {
                confetti({
                  particleCount: 150,
                  spread: 80,
                  origin: { y: 0.5 }
                });
              }, 400);
            }
          });
        });
      } else if (step === 4) {
        mockOutput = [
          { text: `Executing Step 4: Extract Event Logs via cast logs...`, type: 'info' },
          { text: `$ cast logs --address ${contractAddress}`, type: 'cmd' },
          { text: `Found 3 log entries matching criteria.`, type: 'muted' },
          { text: `\n[Log #1]`, type: 'warn' },
          { text: `  Address: ${contractAddress}`, type: 'muted' },
          { text: `  Event: QuestCreated(${questIdToQuery}, "${questName}", "${questDesc}", ${rewardXp}, ${magicPower})`, type: 'success' },
          { text: `  Block: ${blockNum}`, type: 'muted' },
          { text: `\n[Log #2]`, type: 'warn' },
          { text: `  Address: ${contractAddress}`, type: 'muted' },
          { text: `  Event: QuestCompleted(0x59c6995e998f97a5..., ${questIdToQuery}, ${rewardXp}, ${magicPower})`, type: 'success' },
          { text: `  Block: ${blockNum + 1}`, type: 'muted' },
          { text: `\n[Log #3]`, type: 'warn' },
          { text: `  Address: ${contractAddress}`, type: 'muted' },
          { text: `  Event: LeaderboardUpdated(0x59c6995e998f97a5..., totalXp: ${rewardXp}, totalPower: ${magicPower})`, type: 'success' },
          { text: `  Block: ${blockNum + 1}`, type: 'muted' },
          { text: `\n[Log #4] (LevelUp Triggered!)`, type: 'warn' },
          { text: `  Event: LevelUp(0x59c6995e998f97a5..., newLevel: ${Number(rewardXp) >= 100 ? '2' : '1'})`, type: 'event' },
          { text: `  Detail: Player XP (${rewardXp}) reached or exceeded level-up threshold!`, type: 'success' },
          { text: `✨ Ritual checklist flow validated completely! 🌌`, type: 'info' }
        ];

        // Trigger local quest confirmation state update for the user in parent
        if (onQuestConfirm) {
          onQuestConfirm('q1');
        }
      }

      setTerminalLogs(prev => [...prev, ...mockOutput]);
      setIsCasting(false);
      
      // Auto advance step
      if (step < 4) {
        setActiveStep(step + 1);
      }
    }, 850);
  };

  const clearTerminal = () => {
    setTerminalLogs([
      { text: '🧙 MeeChain Forge Terminal cleared.', type: 'info' },
      { text: 'Ready to cast smart contract rituals. Choose steps below.', type: 'muted' }
    ]);
    setActiveStep(1);
  };

  return (
    <section className="glass-panel hall-section relative overflow-hidden" style={{ minHeight: '800px', borderRadius: '24px' }}>
      
      {/* Dynamic Embedded CSS Styles for Premium Gaming FX */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(247, 197, 95, 0.4); }
          50% { box-shadow: 0 0 30px rgba(247, 197, 95, 0.8); }
        }
        @keyframes float-coin {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-300px) scale(0.6) rotate(360deg); opacity: 0; }
        }
        @keyframes chest-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-5deg) scale(1.05); }
          30% { transform: rotate(5deg) scale(1.05); }
          45% { transform: rotate(-3deg) scale(1.05); }
          60% { transform: rotate(3deg) scale(1.05); }
          75% { transform: rotate(-2deg) scale(1.05); }
          90% { transform: rotate(1deg) scale(1.05); }
        }
        @keyframes shine-slide {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        .animate-chest-bounce {
          animation: chest-shake 0.6s infinite ease-in-out;
        }
        .shiny-glow::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-25deg);
          animation: shine-slide 3s infinite ease-in-out;
        }
        .scrollable-terminal::-webkit-scrollbar {
          width: 6px;
        }
        .scrollable-terminal::-webkit-scrollbar-track {
          background: #02060e;
        }
        .scrollable-terminal::-webkit-scrollbar-thumb {
          background: #1b2e5a;
          border-radius: 4px;
        }
        .medieval-border {
          border: 1px solid rgba(247, 197, 95, 0.35);
          position: relative;
        }
        .medieval-border::before {
          content: '✦';
          position: absolute;
          top: -10px; left: 10px;
          color: var(--gold);
          font-size: 11px;
          background: #0b1731;
          padding: 0 4px;
        }
        @keyframes candle-flicker {
          0%, 100% {
            opacity: 0.8;
            transform: scale(0.95) translateY(1px);
            filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.7));
          }
          50% {
            opacity: 1;
            transform: scale(1.1) translateY(-1px);
            filter: drop-shadow(0 0 20px rgba(245, 158, 11, 1));
          }
        }
        .animate-candle {
          animation: candle-flicker 2s infinite ease-in-out;
        }
        @keyframes subtle-breath {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.02); filter: brightness(1.15); }
        }
        .animate-breath {
          animation: subtle-breath 4s infinite ease-in-out;
        }
      `}</style>

      {/* Embedded Fantasy Header Navigation inside the Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-[rgba(126,151,255,0.15)] mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#f7c55f] to-[#ffaa00] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(247,197,95,0.35)] border border-[#f7c55f]">
            <Shield className="w-6 h-6 text-[#071225]" fill="#071225" />
          </div>
          <div>
            <span className="text-xs text-[#f7c55f] tracking-widest uppercase font-bold">MeeChain Magic Hall</span>
            <div className="flex gap-4 mt-1">
              <button onClick={() => onNavigate('realm')} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Home</button>
              <button onClick={() => onNavigate('academy')} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Academy</button>
              <button onClick={() => onNavigate('guardian')} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Guardian</button>
              <button onClick={() => onNavigate('archive')} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Archive</button>
              <button onClick={() => onNavigate('realm')} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">Dashboard</button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('board')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'board' ? 'bg-[#f7c55f] text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Quest Hall
            </button>
            <button 
              onClick={() => setActiveTab('sandbox')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'sandbox' ? 'bg-[#7c85ff] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Sandbox Ritual
            </button>
          </div>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(magicAddress || '0xMeeBuilderDemo');
              alert('Copied Magic Address!');
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#213a77] to-[#14234b] text-xs font-mono font-bold text-cyan-400 rounded-xl border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(61,217,255,0.1)]"
          >
            {(magicAddress || '0xMeeBuilderDemo').slice(0, 6)}...{(magicAddress || '0xMeeBuilderDemo').slice(-4)} 🔗
          </button>
        </div>
      </div>

      {activeTab === 'board' ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Main Quest Hall Gilded Title Banner & Interactive Candles */}
          <div className="relative text-center py-12 px-6 bg-slate-950/60 rounded-3xl border-2 border-[#f7c55f]/25 shadow-[inset_0_4px_30px_rgba(247,197,95,0.06),0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Candle Left */}
            <div className="absolute left-4 md:left-8 bottom-6 flex flex-col items-center">
              <div className="relative w-4 h-16 bg-gradient-to-b from-amber-100 to-amber-300 rounded-md border border-[#f7c55f]/40 shadow-md">
                {/* Candle Flame Flicker */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-4 bg-orange-500 rounded-full animate-candle filter drop-shadow-[0_0_12px_#fb8500] flex items-center justify-center">
                  <div className="w-1.5 h-2 bg-yellow-200 rounded-full"></div>
                </div>
                {/* Melting wax detail */}
                <div className="absolute top-1 left-0.5 w-1 h-3 bg-amber-100 rounded-full opacity-75"></div>
              </div>
              <span className="text-[10px] text-white/30 font-mono mt-1">🕯️ Ritual</span>
            </div>

            {/* Candle Right */}
            <div className="absolute right-4 md:right-8 bottom-6 flex flex-col items-center">
              <div className="relative w-4 h-16 bg-gradient-to-b from-amber-100 to-amber-300 rounded-md border border-[#f7c55f]/40 shadow-md">
                {/* Candle Flame Flicker */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-4 bg-orange-500 rounded-full animate-candle filter drop-shadow-[0_0_12px_#fb8500] flex items-center justify-center">
                  <div className="w-1.5 h-2 bg-yellow-200 rounded-full"></div>
                </div>
                {/* Melting wax detail */}
                <div className="absolute top-1.5 right-0.5 w-1.5 h-4 bg-amber-100 rounded-full opacity-75"></div>
              </div>
              <span className="text-[10px] text-white/30 font-mono mt-1">🕯️ Sanctuary</span>
            </div>

            {/* Glowing magic runes on background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#f7c55f_1px,transparent_1px)] [background-size:24px_24px]"></div>

            {/* Gilded metal plaque */}
            <div className="relative inline-block px-10 py-3.5 bg-gradient-to-b from-[#111c35] to-[#0a1122] border-2 border-[#f7c55f]/60 rounded-2xl shadow-[0_0_25px_rgba(247,197,95,0.25)] mb-4">
              <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#f7c55f]/50 border border-black/50 shadow-inner"></span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#f7c55f]/50 border border-black/50 shadow-inner"></span>
              <span className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#f7c55f]/50 border border-black/50 shadow-inner"></span>
              <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#f7c55f]/50 border border-black/50 shadow-inner"></span>
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-sm text-[#f7c55f] filter drop-shadow-[0_0_4px_#f7c55f]">✦</span>
              <h1 className="font-serif text-2xl md:text-4xl font-extrabold tracking-widest text-gradient bg-gradient-to-r from-[#ffd700] via-[#f7c55f] to-[#ff9900] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] uppercase">
                Ritual Quest Board
              </h1>
            </div>

            <p className="text-sm text-white/70 max-w-lg mx-auto leading-relaxed font-medium mt-1">
              Embark on epic tasks, unlock sacred runes, and claim legendary rewards on the MeeChain Magic Ledger!
            </p>

            <div className="flex justify-center mt-5">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#b38318] via-[#f7c55f] to-[#9a6f11] text-black text-xs font-black rounded-xl border border-[#ffd700]/30 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(247,197,95,0.3)] flex items-center gap-2 uppercase tracking-widest hover:brightness-110"
              >
                <Plus className="w-4 h-4 text-black stroke-[3px]" />
                Forge Custom Quest
              </button>
            </div>
          </div>

          {/* MEECHAIN SACRED CONTRACT ARTIFACTS / LEDGER ITEMS - Highly Visible RPG Cards */}
          <div className="p-6 bg-gradient-to-b from-[#0c1834] to-[#040816] rounded-2xl border-2 border-[#f7c55f]/40 shadow-[0_15px_40px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd700]/40 to-transparent"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 mb-6 gap-3">
              <div>
                <span className="text-[10px] text-[#f7c55f] font-mono tracking-widest uppercase font-bold">MeeChain Registry</span>
                <h3 className="font-serif text-lg md:text-xl font-bold text-white tracking-wide">
                  Sacred Ledger Artifacts & Runes
                </h3>
              </div>
              <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full border border-white/5">
                Verified Mainnet Nodes & Contracts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: RPC Node */}
              <div className="relative p-5 bg-gradient-to-br from-[#0c2438]/95 to-[#040a16]/95 rounded-2xl border-2 border-cyan-500/35 hover:border-cyan-400/70 shadow-[0_4px_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                <div className="absolute right-2 bottom-2 text-7xl opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">🔮</div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-black/40 border-2 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        🔮
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white tracking-wide leading-tight group-hover:text-cyan-400 transition-colors">Orb of Connectivity</h4>
                        <span className="inline-block mt-1 px-2.5 py-0.5 text-[8px] uppercase font-black bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 tracking-wider">
                          MeeChain RPC Node
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed mb-5 min-h-[48px] font-medium">
                    The divine communication channel bridging our dApp interfaces with MeeChain's consensus layer.
                  </p>
                </div>
                <div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/5 mb-4 flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-[10px] font-mono text-cyan-400/80 truncate select-all">https://rpc.meechain.live/health</span>
                    <button 
                      onClick={() => handleCopyAddress('rpc', 'https://rpc.meechain.live/health')}
                      className="text-[9px] font-mono uppercase bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-400 px-2 py-1 rounded border border-cyan-500/20 transition-all shrink-0 font-bold"
                    >
                      {copiedAddress === 'rpc' ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/40">
                    <span>Node Status</span>
                    <span className="text-emerald-400 flex items-center gap-1">🟢 Active</span>
                  </div>
                </div>
              </div>

              {/* Card 2: QuestSystem Contract */}
              <div className="relative p-5 bg-gradient-to-br from-[#382c16]/95 to-[#040a16]/95 rounded-2xl border-2 border-amber-500/45 hover:border-amber-400/75 shadow-[0_4px_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                <div className="absolute right-2 bottom-2 text-7xl opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">⚔️</div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-black/40 border-2 border-amber-500/45 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        ⚔️
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white tracking-wide leading-tight group-hover:text-amber-400 transition-colors">Blade of Quests</h4>
                        <span className="inline-block mt-1 px-2.5 py-0.5 text-[8px] uppercase font-black bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 tracking-wider">
                          QuestSystem Contract
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed mb-5 min-h-[48px] font-medium">
                    The principal rulebook ledger containing conditions, parameters, and celestial XP requirements of all adventurer quests.
                  </p>
                </div>
                <div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/5 mb-4 flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-[10px] font-mono text-amber-400/80 truncate select-all">0x68B1D87F95878fE05B998F19b66F4baba5De1aed</span>
                    <button 
                      onClick={() => handleCopyAddress('quest', '0x68B1D87F95878fE05B998F19b66F4baba5De1aed')}
                      className="text-[9px] font-mono uppercase bg-amber-500/10 hover:bg-amber-500/30 text-amber-400 px-2 py-1 rounded border border-amber-500/20 transition-all shrink-0 font-bold"
                    >
                      {copiedAddress === 'quest' ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/40">
                    <span>Contract State</span>
                    <span className="text-emerald-400 flex items-center gap-1">🟢 Deployed (ใหม่)</span>
                  </div>
                </div>
              </div>

              {/* Card 3: SimpleToken (MEE) Contract */}
              <div className="relative p-5 bg-gradient-to-br from-[#281638]/95 to-[#040a16]/95 rounded-2xl border-2 border-purple-500/40 hover:border-purple-400/75 shadow-[0_4px_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                <div className="absolute right-2 bottom-2 text-7xl opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">🪙</div>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-black/40 border-2 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        🪙
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white tracking-wide leading-tight group-hover:text-purple-400 transition-colors">Sacred Coin of MEE</h4>
                        <span className="inline-block mt-1 px-2.5 py-0.5 text-[8px] uppercase font-black bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30 tracking-wider">
                          SimpleToken (MEE)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed mb-5 min-h-[48px] font-medium">
                    The tokenized life-force and standard energy currency used across all transaction relays and blessing exchanges.
                  </p>
                </div>
                <div>
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/5 mb-4 flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-[10px] font-mono text-purple-400/80 truncate select-all">0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9</span>
                    <button 
                      onClick={() => handleCopyAddress('token', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9')}
                      className="text-[9px] font-mono uppercase bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 px-2 py-1 rounded border border-purple-500/20 transition-all shrink-0 font-bold"
                    >
                      {copiedAddress === 'token' ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/40">
                    <span>Currency Standard</span>
                    <span className="text-purple-400 flex items-center gap-1">🛡️ ERC20 / MEE</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Gamification Hud System: Level & XP Bar + Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* XP and Level Card styled like a magical matrix */}
            <div className="lg:col-span-8 p-6 bg-gradient-to-br from-[#0c1936] to-[#040a17] rounded-2xl border-2 border-white/5 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(124,133,255,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  {/* Glowing Level Badge */}
                  <div className="w-14 h-14 bg-gradient-to-tr from-[#ffdf8c] via-[#f7c55f] to-[#ffaa00] rounded-2xl flex items-center justify-center text-[#071225] font-black text-2xl shadow-[0_0_20px_rgba(247,197,95,0.4)] border-2 border-[#ffd700]">
                    {level}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2 leading-none">
                      Level {level}
                      <span className="text-[10px] px-3 py-1 bg-[#f7c55f]/15 text-[#f7c55f] border border-[#f7c55f]/30 rounded-full font-black uppercase tracking-wider">
                        {level >= 3 ? 'Arch-Mage' : level === 2 ? 'Adept Alchemist' : 'Novice Mage'}
                      </span>
                    </h3>
                    <p className="text-xs text-white/50 mt-1.5 font-medium">Earn XP to evolve on-chain wizard title and unlock legendary content</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[#f7c55f] font-bold tracking-widest">{xp} / {maxXp} XP</span>
                </div>
              </div>

              {/* Progress bar container (Liquid Magical Flask theme) with RPG Glowing effect */}
              <div className="w-full h-7 bg-black/80 rounded-full border-2 border-[#f7c55f]/40 p-1 relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] animate-magical-glow flex items-center">
                <div 
                  className="h-full bg-gradient-to-r from-[#ffd700] via-[#ffd700] via-[#f7c55f] to-[#ffaa00] rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${Math.max(3, Math.min(100, (xp / maxXp) * 100))}%` }}
                >
                  {/* Diagonal moving highlight stripe (Running Light Effect) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-sweep w-1/2 h-full" style={{ animationDuration: '2.5s' }}></div>
                  
                  {/* Magical liquid bubbles floating up */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] opacity-60"></div>
                  
                  {/* Floating sparkles inside the bar */}
                  <div className="absolute inset-0 pointer-events-none">
                    <span className="absolute left-[15%] top-1 w-1 h-1 bg-white rounded-full animate-ping opacity-75" style={{ animationDelay: '0.2s', animationDuration: '3s' }}></span>
                    <span className="absolute left-[45%] top-1.5 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping opacity-60" style={{ animationDelay: '1.1s', animationDuration: '4s' }}></span>
                    <span className="absolute left-[75%] top-1 w-1 h-1 bg-white rounded-full animate-ping opacity-80" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }}></span>
                  </div>

                  {/* Leading edge flame/spark emitter */}
                  <div className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center">
                    {/* Pulsing focal point */}
                    <span className="w-3 h-3 bg-white rounded-full shadow-[0_0_12px_#fff,0_0_20px_#ffd700] animate-ping absolute"></span>
                    <span className="w-2.5 h-2.5 bg-[#ffd700] rounded-full shadow-[0_0_8px_#ffd700] animate-pulse"></span>
                    
                    {/* Spark particles rising from leading edge */}
                    <span className="absolute -top-3 w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce opacity-80" style={{ animationDelay: '0.1s' }}></span>
                    <span className="absolute -bottom-3 w-1 h-1 bg-yellow-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>

                {/* Ambient sparkle overlays in the background of progress container */}
                <span className="absolute -top-2 left-[20%] text-[10px] text-amber-200/40 animate-sparkle-slow">✦</span>
                <span className="absolute -bottom-2.5 left-[65%] text-[11px] text-yellow-300/35 animate-sparkle-fast">✦</span>
                <span className="absolute -top-1.5 left-[80%] text-[9px] text-white/50 animate-sparkle-slow">✨</span>
              </div>
            </div>

            {/* Badges showcase card */}
            <div className="lg:col-span-4 p-6 bg-gradient-to-br from-[#0c1936] to-[#040a17] rounded-2xl border-2 border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#f7c55f] mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#f7c55f]" />
                  Your Badges ({earnedBadges.length})
                </h4>
                <div className="flex flex-wrap gap-3 mt-2">
                  {earnedBadges.map((badge, idx) => (
                    <div 
                      key={idx} 
                      className="group relative cursor-pointer"
                      title={`${badge.label}: ${badge.desc}`}
                    >
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border hover:scale-110 active:scale-95 transition-all shadow-md duration-200"
                        style={{ 
                          backgroundColor: 'rgba(5, 15, 35, 0.8)', 
                          borderColor: badge.color || 'var(--violet)',
                          boxShadow: `0 0 10px ${badge.color || 'var(--violet)'}40`
                        }}
                      >
                        {badge.icon}
                      </div>
                      
                      {/* Badge Lore Tooltip */}
                      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-3 bg-[#030a1c] border-2 border-white/10 rounded-xl text-[10px] text-white/80 z-20 shadow-2xl font-normal animate-in fade-in zoom-in-95 duration-150">
                        <strong className="text-white block mb-1 font-bold">{badge.label}</strong>
                        {badge.desc}
                      </div>
                    </div>
                  ))}
                  {earnedBadges.length === 0 && (
                    <div className="text-xs text-white/40 italic py-2">No badges earned yet. Complete quests to claim!</div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* YOUR ACTIVE QUESTS SECTION */}
          <div className="p-6 bg-gradient-to-b from-[#0e1c3a]/95 to-[#071225]/95 rounded-2xl border-2 border-[#f7c55f]/40 shadow-[0_12px_45px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className="absolute top-4 right-4 text-[9px] text-white/20 font-mono tracking-widest uppercase">Vault State Protected</div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#f7c55f] text-xl filter drop-shadow-[0_0_4px_#f7c55f]">✦</span>
              <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2 uppercase">
                Active Contracts
                <span className="text-xs px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-black tracking-wider">
                  {activeQuests.filter(q => q.completed && !q.claimed).length} CLAIMABLE
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {activeQuests.filter(q => !q.claimed).map((quest) => {
                // Determine category theme for active quests for distinct card looks
                const isActiveCompleted = quest.completed;
                let activeCardStyle = 'border-2 border-blue-500/30 bg-gradient-to-br from-[#091124]/95 to-[#040816]/95 hover:border-blue-500/50 shadow-[0_4px_15px_rgba(59,130,246,0.1)]';
                let glowStyle = 'border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
                let tagClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                
                if (isActiveCompleted) {
                  activeCardStyle = 'border-2 border-[#f7c55f] bg-gradient-to-br from-[#1c1409]/95 to-[#050818]/95 shadow-[0_0_25px_rgba(247,197,95,0.35)] animate-pulse-glow';
                  glowStyle = 'border-[#f7c55f] shadow-[0_0_15px_rgba(247,197,95,0.5)]';
                  tagClass = 'bg-[#f7c55f]/20 text-[#f7c55f] border border-[#f7c55f]/30';
                } else if (quest.image === '🐉' || quest.image === '⚔️' || quest.image === '🛡️') {
                  activeCardStyle = 'border-2 border-rose-500/35 bg-gradient-to-br from-[#160a0f]/95 to-[#040816]/95 hover:border-rose-500/60 shadow-[0_4px_15px_rgba(239,68,68,0.15)]';
                  glowStyle = 'border-rose-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
                  tagClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                } else if (quest.image === '🪙' || quest.image === '🗺️' || quest.image === '💎' || quest.image === '🧭') {
                  activeCardStyle = 'border-2 border-emerald-500/35 bg-gradient-to-br from-[#081216]/95 to-[#040816]/95 hover:border-emerald-500/60 shadow-[0_4px_15px_rgba(16,185,129,0.15)]';
                  glowStyle = 'border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
                  tagClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                }

                return (
                  <div 
                    key={quest.id} 
                    className={`relative p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group ${activeCardStyle}`}
                  >
                    {/* Decorative faint background avatar icon */}
                    <div className="absolute right-2 bottom-2 text-8xl opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                      {quest.image}
                    </div>

                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3.5">
                          {/* Circle avatar match image 2/3 style */}
                          <div className={`w-12 h-12 rounded-full bg-black/40 border-2 flex items-center justify-center text-2.5xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${glowStyle}`}>
                            {quest.image}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white tracking-wide leading-tight group-hover:text-[#f7c55f] transition-colors">{quest.label}</h3>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-[8px] uppercase font-bold rounded-full tracking-wider ${tagClass}`}>
                              Bounty: {quest.reward}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-white/75 leading-relaxed mb-5 min-h-[40px] font-medium">{quest.desc}</p>
                    </div>

                    <div>
                      {/* Compact progress display */}
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-white/40 mb-1.5">
                        <span>Task Progress</span>
                        <span className={quest.completed ? 'text-[#f7c55f] font-extrabold' : 'text-white/75 font-bold'}>{quest.progress} / {quest.target}</span>
                      </div>
                      
                      {/* Visual progress indicators */}
                      <div className="flex gap-1.5 mb-5">
                        {Array.from({ length: quest.target }).map((_, stepIdx) => (
                          <div 
                            key={stepIdx} 
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${stepIdx < quest.progress ? (quest.completed ? 'bg-[#f7c55f] shadow-[0_0_8px_#f7c55f]' : 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]') : 'bg-white/10'}`}
                          />
                        ))}
                      </div>

                      {/* Quick Trigger Button */}
                      {quest.completed ? (
                        <button 
                          onClick={() => handleStartClaimFlow(quest)}
                          className="w-full py-3 bg-gradient-to-r from-[#ffd700] to-[#f7c55f] hover:from-[#ffea00] hover:to-[#ffd700] hover:scale-[1.02] active:scale-[0.98] text-black text-xs font-black rounded-xl shadow-[0_4px_15px_rgba(247,197,95,0.4)] transition-all animate-pulse-glow uppercase tracking-wider"
                        >
                          Claim Bounty 🎁
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleIncrementProgress(quest.id)}
                          className="w-full py-3 bg-gradient-to-r from-[#17c964] to-[#12a150] hover:from-[#1bfb7c] hover:to-[#17c964] hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-black rounded-xl shadow-[0_4px_12px_rgba(23,201,100,0.25)] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                          <Plus className="w-4 h-4 stroke-[3px]" />
                          Complete Step
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {activeQuests.filter(q => !q.claimed).length === 0 && (
                <div className="col-span-3 text-center py-10 bg-black/20 rounded-xl border-2 border-dashed border-white/5">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">No active contracts in scroll log.</p>
                  <p className="text-[10px] text-white/30 mt-1 max-w-xs mx-auto">Unfold the Quest Board below to authorize and assign a magic contract to your address!</p>
                </div>
              )}
            </div>
          </div>

          {/* QUEST BOARD (REDESIGNED TO MATCH PORTRAITS & BORDERS LIKE IMAGES 2 & 3) */}
          <div className="p-6 bg-gradient-to-b from-[#0c1834] to-[#040816] rounded-2xl border-2 border-[#f7c55f]/40 shadow-[0_15px_40px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f7c55f]/30 to-transparent"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 mb-6 gap-3">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#f7c55f]" />
                <h3 className="text-md font-extrabold text-white tracking-wider uppercase font-serif">Available Bounties</h3>
              </div>
              <span className="text-[10px] bg-[#ffd700]/10 text-[#f7c55f] px-3 py-1 rounded-full border border-[#f7c55f]/20 font-mono tracking-widest">REAL-TIME SYNCED ON MEECHAIN</span>
            </div>

            {/* Redesigned card-style lists with thick category colored glows (Image 2 & 3) */}
            <div className="grid gap-5">
              {boardQuests.map((quest) => {
                // Category styling dictionary
                const catStyles = {
                  'Battle': {
                    emoji: '👹',
                    color: '#ef4444',
                    borderClass: 'border-2 border-rose-500/40 bg-gradient-to-br from-[#1b0a11]/95 to-[#040816]/95 hover:border-rose-500/70 shadow-[0_4px_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]',
                    glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.4)] border-rose-500/40',
                    textClass: 'text-rose-400',
                    tagClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                  },
                  'Intellect': {
                    emoji: '🔮',
                    color: '#a855f7',
                    borderClass: 'border-2 border-purple-500/40 bg-gradient-to-br from-[#110a1d]/95 to-[#040816]/95 hover:border-purple-500/70 shadow-[0_4px_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]',
                    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.4)] border-purple-500/40',
                    textClass: 'text-purple-400',
                    tagClass: 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                  },
                  'Explore': {
                    emoji: '💎',
                    color: '#10b981',
                    borderClass: 'border-2 border-emerald-500/40 bg-gradient-to-br from-[#081316]/95 to-[#040816]/95 hover:border-emerald-500/70 shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]',
                    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.4)] border-emerald-500/40',
                    textClass: 'text-emerald-400',
                    tagClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  },
                  'Legendary': {
                    emoji: '🏰',
                    color: '#f59e0b',
                    borderClass: 'border-2 border-amber-500/55 bg-gradient-to-br from-[#20150b]/95 to-[#040816]/95 hover:border-amber-500/80 shadow-[0_4px_25px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] animate-breath',
                    glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.5)] border-amber-500/50',
                    textClass: 'text-amber-400',
                    tagClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black'
                  }
                };

                const style = catStyles[quest.category] || catStyles['Legendary'];

                return (
                  <div 
                    key={quest.id} 
                    className={`relative p-5 rounded-2xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 group ${style.borderClass}`}
                  >
                    {/* Left block with circular avatar (Image 2 & 3 style) */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Premium Circle Portrait with glow */}
                      <div className={`w-14 h-14 rounded-full bg-black/40 border-2 flex items-center justify-center text-3xl shrink-0 transition-transform duration-300 group-hover:scale-110 ${style.glowClass}`}>
                        {quest.label === 'Goblin Raid' ? '👺' : quest.label === 'Ancient Puzzle' ? '🔮' : quest.label === 'Lost Relic' ? '💎' : quest.label === 'Defend the Castle' ? '🏰' : style.emoji}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif text-md md:text-lg font-bold text-white tracking-wide group-hover:text-[#f7c55f] transition-colors leading-none">
                            {quest.label}
                          </h4>
                          <span className={`px-2.5 py-0.5 text-[9px] uppercase font-bold rounded-full tracking-wider ${style.tagClass}`}>
                            {quest.category}
                          </span>
                        </div>
                        <p className="text-xs text-white/75 leading-relaxed font-medium">
                          {quest.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right action controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 justify-end">
                      
                      {/* Reward Badge */}
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5 shrink-0">
                        <Coins className="w-4 h-4 text-[#f7c55f] drop-shadow-[0_0_4px_rgba(247,197,95,0.4)]" />
                        <span className="text-xs text-white/90 font-black tracking-wider">{quest.reward}</span>
                      </div>

                      {/* Action Button matching premium theme */}
                      <div className="w-full sm:w-auto text-right">
                        {quest.status === 'Locked' ? (
                          <div className="px-5 py-2.5 bg-slate-900/60 text-white/30 text-xs font-black rounded-lg border border-white/5 flex items-center justify-center gap-1.5 cursor-not-allowed select-none min-w-[130px] shadow-[inset_0_1px_5px_rgba(0,0,0,0.5)]">
                            <Lock className="w-3.5 h-3.5 text-white/25" />
                            Level 3 Req
                          </div>
                        ) : quest.status === 'Joined' ? (
                          <div className="px-5 py-2.5 bg-white/5 text-white/40 text-xs font-black rounded-lg border border-white/10 text-center min-w-[130px] select-none uppercase tracking-wider">
                            Active Contract
                          </div>
                        ) : quest.status === 'Completed' ? (
                          <div className="px-5 py-2.5 bg-green-500/10 text-green-400 text-xs font-black rounded-lg border border-green-500/30 text-center min-w-[130px] flex items-center justify-center gap-1.5 select-none uppercase tracking-wider">
                            Completed ✓
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleJoinQuest(quest)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-600 hover:via-blue-500 hover:to-indigo-600 text-white text-xs font-black rounded-lg border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.35)] transition-all uppercase tracking-wider min-w-[130px] text-center"
                          >
                            Join Quest
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Persistent System Status Log Banner (Image 2 & 3 Success Notification) */}
            <div className="mt-8 p-3.5 bg-gradient-to-r from-[#11241f] via-[#091613] to-[#11241f] rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_10px_#34d399]"></span>
              <p className="text-[11px] font-mono font-medium text-emerald-400 tracking-wide break-all">
                ✔ Quest active_{activeQuests.find(q => q.completed && !q.claimed)?.id || '1785447339756'} has been successfully verified on the magic ledger!
              </p>
            </div>

          </div>
        </div>
      ) : (
        /* FOUNDRY TERMINAL SPELLBOOK & SANDBOX */
        <div className="grid gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#7c85ff] font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Smart Contract Playground (Sandbox)
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Ritual Checklist Flow (EVM Tools)</h3>
            <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed">
              Test dApp contract actions end-to-end using the terminal emulator. Generate and copy commands using <strong className="text-white">cast</strong> (Foundry toolset) to broadcast live transactions to MeeChain nodes!
            </p>
          </div>

          {/* Interactive Flow Roadmap Progress Bar */}
          <div className="p-5 bg-black/30 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <strong className="text-xs text-white/70">Castle Map: Foundry RPC Progress</strong>
              <span className="text-[11px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full font-mono">Step {activeStep} / 4</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { step: 1, label: '1. Create Quest', desc: 'cast send createQuest' },
                { step: 2, label: '2. Get Quest', desc: 'cast call getQuest' },
                { step: 3, label: '3. Complete Quest', desc: 'cast send completeQuest' },
                { step: 4, label: '4. Leaderboard Logs', desc: 'cast logs emitted' }
              ].map((item, idx) => (
                <div key={item.step} className="flex items-center">
                  <div 
                    onClick={() => setActiveStep(item.step)}
                    className={`flex-1 p-3.5 rounded-xl cursor-pointer transition-all border text-center ${activeStep === item.step ? 'bg-[#7c85ff]/10 border-[#7c85ff] shadow-[0_0_15px_rgba(124,133,255,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                  >
                    <div className={`text-xs font-bold ${activeStep === item.step ? 'text-[#f7c55f]' : 'text-white/80'}`}>{item.label}</div>
                    <div className="text-[10px] text-white/30 font-mono mt-1 leading-none">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Parameters Spell Panel */}
            <div className="lg:col-span-5 p-5 bg-[#0b1731] rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7c55f] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Ritual Parameters (EVM)
                </h4>
                <button 
                  onClick={() => {
                    setContractAddress('0x68B1D87F95878fE05B998F19b66F4baba5De1aed');
                    setQuestName('First Quest');
                    setQuestDesc('Intro quest');
                    setRewardXp('100');
                    setExpiry('1690000000');
                    setCategory('1');
                    setMagicPower('50');
                    setQuestIdToQuery('0');
                    setRpcUrl('https://rpc.meechain.live');
                  }}
                  className="text-[10px] text-white/40 hover:text-white transition-colors"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="grid gap-3.5 text-xs">
                <div>
                  <label className="block text-[11px] text-white/50 mb-1">Quest Contract Target</label>
                  <input 
                    className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white font-mono focus:border-cyan-400 transition-all outline-none" 
                    value={contractAddress} 
                    onChange={(e) => setContractAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-white/50 mb-1">Quest Title</label>
                    <input 
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white focus:border-cyan-400 transition-all outline-none" 
                      value={questName} 
                      onChange={(e) => setQuestName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/50 mb-1">Quest Desc</label>
                    <input 
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white focus:border-cyan-400 transition-all outline-none" 
                      value={questDesc} 
                      onChange={(e) => setQuestDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-white/50 mb-1">Reward XP</label>
                    <input 
                      type="number"
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white focus:border-cyan-400 transition-all outline-none" 
                      value={rewardXp} 
                      onChange={(e) => setRewardXp(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/50 mb-1">Expiry (epoch)</label>
                    <input 
                      type="number"
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white focus:border-cyan-400 transition-all outline-none" 
                      value={expiry} 
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/50 mb-1">Power (uint256)</label>
                    <input 
                      type="number"
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white focus:border-cyan-400 transition-all outline-none" 
                      value={magicPower} 
                      onChange={(e) => setMagicPower(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-white/50 mb-1">Quest ID</label>
                    <input 
                      type="number"
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white focus:border-cyan-400 transition-all outline-none" 
                      value={questIdToQuery} 
                      onChange={(e) => setQuestIdToQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/50 mb-1">Category (uint8)</label>
                    <select
                      className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white focus:border-cyan-400 transition-all outline-none cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="1">1 (Intro / Core)</option>
                      <option value="2">2 (Guardian Oath)</option>
                      <option value="3">3 (Epic Expedition)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-white/50 mb-1">Local RPC Node URL</label>
                  <input 
                    className="w-full px-3 py-2 bg-black/40 border border-white/5 rounded-lg text-white font-mono focus:border-cyan-400 transition-all outline-none" 
                    value={rpcUrl} 
                    onChange={(e) => setRpcUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* CLI Command generator */}
            <div className="lg:col-span-7 grid gap-4">
              <div className="p-5 bg-black/30 rounded-2xl border border-[#7c85ff]/30 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <strong className="text-xs text-[#7c85ff] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Generated CLI Command (Foundry)
                  </strong>
                  <button 
                    onClick={() => handleCopy(activeStep, getCommand(activeStep))}
                    className="px-3 py-1 bg-gradient-to-r from-[#7c85ff] to-[#5963ff] hover:scale-105 active:scale-95 text-white text-[11px] font-bold rounded-lg transition-all"
                  >
                    {copyStatus === activeStep ? '✓ Copied' : 'Copy Code'}
                  </button>
                </div>
                
                <pre className="p-4 bg-black/60 border border-white/5 rounded-xl text-cyan-400 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap word-break">
                  {getCommand(activeStep)}
                </pre>
              </div>

              <button
                disabled={isCasting}
                onClick={() => executeRitualStep(activeStep)}
                className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-[#12a150] text-white hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)]"
              >
                {isCasting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Casting Ritual Command...
                  </>
                ) : (
                  <>🪄 Execute Ritual Simulation (Step {activeStep})</>
                )}
              </button>
            </div>

          </div>

          {/* Interactive terminal */}
          <div className="p-5 bg-[#050c18] rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
                <strong className="text-xs font-mono text-[#9bb0e4]">meechain-sandbox-rpc @ foundry-v2</strong>
              </div>
              <button 
                onClick={clearTerminal}
                className="text-[10px] text-white/40 hover:text-white transition-colors"
              >
                Clear Screen 🗑️
              </button>
            </div>

            <div className="h-60 overflow-y-auto bg-black/80 border border-white/5 rounded-xl p-4 font-mono text-xs leading-relaxed text-[#d4e3ff] scrollable-terminal">
              {terminalLogs.map((log, idx) => {
                let color = '#d4e3ff';
                if (log.type === 'info') color = '#f7c55f';
                if (log.type === 'cmd') color = '#3dd9ff';
                if (log.type === 'success') color = '#34d399';
                if (log.type === 'warn') color = '#a78bfa';
                if (log.type === 'event') color = '#f472b6';
                if (log.type === 'muted') color = '#475569';

                return (
                  <div key={idx} style={{ color }} className="mb-1.5 whitespace-pre-wrap">
                    {log.text}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-white/30 mt-3 font-mono">
              <span>EVM Node RPC Server: ACTIVE</span>
              <span>Supported Events: QuestCreated, QuestCompleted, LeaderboardUpdated, LevelUp</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM QUEST MODAL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-md bg-gradient-to-b from-[#0e1c3a] to-[#071225] rounded-2xl border border-[#f7c55f]/40 p-6 shadow-[0_10px_50px_rgba(247,197,95,0.15)] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-[#f7c55f] flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Create Custom Quest
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-white/40 hover:text-white text-md font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuest} className="grid gap-4 text-xs">
              <div>
                <label className="block text-white/50 mb-1 font-bold">Quest Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Slay the Kraken"
                  value={newQuestName}
                  onChange={(e) => setNewQuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-white font-medium focus:border-[#f7c55f] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1 font-bold">Quest Description</label>
                <textarea 
                  required
                  placeholder="e.g. Defeat the sea beast ravaging the MeeChain shore and retrieve the core pearl."
                  value={newQuestDesc}
                  onChange={(e) => setNewQuestDesc(e.target.value)}
                  rows="3"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-white font-medium focus:border-[#f7c55f] outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 mb-1 font-bold">Category</label>
                  <select 
                    value={newQuestCategory}
                    onChange={(e) => setNewQuestCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-white font-bold outline-none cursor-pointer"
                  >
                    <option value="Battle">Battle ⚔️</option>
                    <option value="Intellect">Intellect 🔮</option>
                    <option value="Explore">Explore 🗺️</option>
                    <option value="Legendary">Legendary 👑</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 mb-1 font-bold">Rewards</label>
                  <select 
                    value={newQuestReward}
                    onChange={(e) => setNewQuestReward(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/5 rounded-xl text-white font-bold outline-none cursor-pointer"
                  >
                    <option value="300 XP">300 XP</option>
                    <option value="500 XP">500 XP</option>
                    <option value="750 XP">750 XP</option>
                    <option value="1000 XP">1000 XP</option>
                    <option value="0.2 ETH">0.2 ETH</option>
                    <option value="0.5 ETH">0.5 ETH</option>
                    <option value="1000 XP + 1 NFT">1000 XP + NFT</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-white/5 text-white/60 hover:text-white rounded-xl text-xs font-bold border border-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#2c69ea] to-[#124bce] text-white rounded-xl text-xs font-bold border border-[#2c69ea]"
                >
                  Deploy Quest ⚔️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TREASURE CHEST REWARD CLAIM MODAL */}
      {showChestModal && claimingQuest && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm text-center relative p-6 bg-gradient-to-b from-[#0b1731] to-[#040914] rounded-2xl border border-[#f7c55f]/40 shadow-[0_0_50px_rgba(247,197,95,0.3)] overflow-hidden">
            
            {/* Visual Coin Explosion Particles */}
            {coinsClaimed.map((coin) => (
              <div 
                key={coin.id}
                className="absolute text-2xl select-none text-yellow-400"
                style={{
                  left: `${coin.left}%`,
                  top: `${coin.top}%`,
                  animation: `float-coin 1.5s ease-out forwards`,
                  animationDelay: `${coin.delay}s`,
                }}
              >
                🪙
              </div>
            ))}

            <h3 className="text-xl font-black bg-gradient-to-r from-[#ffd700] via-[#f7c55f] to-[#ff9900] bg-clip-text text-transparent drop-shadow uppercase tracking-wider mb-2">
              Quest Complete!
            </h3>
            <p className="text-xs text-white/60 mb-6">{claimingQuest.label}</p>

            {/* Treasure Chest Interactive SVG */}
            <div className="my-8 flex justify-center">
              <div 
                onClick={chestState === 'closed' ? executeClaimReward : null}
                className={`w-40 h-40 cursor-pointer flex items-center justify-center relative ${chestState === 'closed' ? 'hover:scale-105 active:scale-95 duration-200' : ''} ${chestState === 'bouncing' ? 'animate-chest-bounce' : ''}`}
              >
                {chestState === 'closed' || chestState === 'bouncing' ? (
                  /* CLOSED CHEST */
                  <svg className="w-32 h-32 text-yellow-600 filter drop-shadow-[0_0_15px_rgba(247,197,95,0.3)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 7C2 5.34315 3.34315 4 5 4H19C20.6569 4 22 5.34315 22 7V8C22 8.55228 21.5523 9 21 9H3C2.44772 9 2 8.55228 2 8V7Z" fill="#ffb703" stroke="#a66a00" strokeWidth="0.5"/>
                    <path d="M3 10H21V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V10Z" fill="#fb8500" stroke="#a66a00" strokeWidth="0.5"/>
                    <rect x="11" y="8" width="2" height="4" rx="1" fill="#ffb703" stroke="#212529" strokeWidth="0.5"/>
                    <circle cx="12" cy="11" r="1.5" fill="#ffd166"/>
                  </svg>
                ) : (
                  /* OPENED CHEST */
                  <svg className="w-32 h-32 text-yellow-600 filter drop-shadow-[0_0_30px_rgba(247,197,95,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                    <g transform="translate(0, -3)">
                      <path d="M2 4C2 2.9 2.9 2 4 2H20C21.1 2 22 2.9 22 4V5H2V4Z" fill="#ffd166" stroke="#ffb703" strokeWidth="0.5"/>
                      {/* Coins peaking out */}
                      <circle cx="6" cy="10" r="3" fill="#ffb703"/>
                      <circle cx="12" cy="9" r="4.5" fill="#ffd166"/>
                      <circle cx="18" cy="10" r="3" fill="#ffb703"/>
                    </g>
                    <path d="M3 8H21V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V8Z" fill="#fb8500" stroke="#a66a00" strokeWidth="0.5"/>
                    <rect x="11" y="6" width="2" height="4" rx="1" fill="#fff" stroke="#212529" strokeWidth="0.5"/>
                  </svg>
                )}
                {chestState === 'closed' && (
                  <span className="absolute bottom-1 bg-[#f7c55f] text-black text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">
                    CLICK TO CLAIM
                  </span>
                )}
              </div>
            </div>

            {chestState === 'open' ? (
              <div className="animate-in fade-in duration-300">
                <p className="text-md font-extrabold text-[#ffd700] flex items-center justify-center gap-1">
                  Received {claimingQuest.reward}!
                </p>
                <p className="text-[10px] text-white/50 mt-1">XP has been transferred directly to your Magic Level bar</p>
                <button 
                  onClick={() => setShowChestModal(false)}
                  className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10"
                >
                  Close Hall Gates
                </button>
              </div>
            ) : (
              <div className="text-white/40 text-[10px]">
                Click the magical chest above to broadcast your victory to the ledger!
              </div>
            )}

          </div>
        </div>
      )}

      {/* LEVEL UP CELEBRATORY OVERLAY */}
      {levelUpOverlay && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md text-center p-8 bg-gradient-to-b from-[#0e1c3a] to-[#040a17] rounded-3xl border-2 border-[#f7c55f] shadow-[0_0_60px_rgba(247,197,95,0.4)] animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
            
            {/* Spinning decorative background rings */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <div className="w-80 h-80 border-4 border-dashed border-[#f7c55f] rounded-full animate-[spin_40s_infinite_linear]"></div>
              <div className="absolute w-60 h-60 border border-[#f7c55f] rounded-full animate-[spin_20s_infinite_linear]"></div>
            </div>

            <div className="relative z-10">
              <span className="text-5xl animate-bounce inline-block mb-4">🔮</span>
              <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#ffd700] via-[#f7c55f] to-[#ffaa00] bg-clip-text text-transparent uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(247,197,95,0.3)]">
                LEVEL UP!
              </h2>
              <p className="text-xs text-white/50 tracking-wider font-semibold uppercase mt-1">MeeChain Magic Ledger Updated</p>
              
              <div className="my-8 flex justify-center items-center gap-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center min-w-[80px]">
                  <span className="text-[10px] text-white/40 font-bold block mb-1">LEVEL</span>
                  <span className="text-2xl font-black text-white/60">{levelUpOverlay.oldLevel}</span>
                </div>
                <div className="text-2xl text-[#f7c55f] animate-pulse">➔</div>
                <div className="p-4 bg-gradient-to-br from-[#ffd700]/10 to-[#ffaa00]/10 rounded-2xl border-2 border-[#f7c55f] text-center min-w-[80px] shadow-[0_0_15px_rgba(247,197,95,0.2)]">
                  <span className="text-[10px] text-[#f7c55f] font-black block mb-1">LEVEL</span>
                  <span className="text-3xl font-black text-[#f7c55f]">{levelUpOverlay.newLevel}</span>
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-white/5 mb-6">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">New Mage Title Unlocked</span>
                <strong className="block text-lg text-[#f7c55f] mt-1 drop-shadow-md">
                  {levelUpOverlay.newTitle}
                </strong>
                <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                  {levelUpOverlay.newLevel === 2 
                    ? "Your magic potency expands. You can now transmute digital artifacts." 
                    : "You are recognized as a sovereign architect of the MeeChain Command!"}
                </p>
              </div>

              <div className="flex gap-2.5 mb-4">
                <button 
                  onClick={() => playLevelUp(levelUpOverlay.newLevel)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 active:scale-95 text-white/90 text-[11px] font-bold rounded-lg border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Volume2 className="w-4 h-4 text-[#f7c55f]" />
                  Replay Magic Fanfare 🔊
                </button>
              </div>

              <button 
                onClick={() => setLevelUpOverlay(null)}
                className="w-full py-3 bg-gradient-to-r from-[#ffd700] to-[#f7c55f] hover:scale-[1.02] active:scale-[0.98] text-black text-xs font-black rounded-xl shadow-[0_4px_20px_rgba(247,197,95,0.3)] transition-all uppercase tracking-wider"
              >
                Continue Questing 🪄
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
