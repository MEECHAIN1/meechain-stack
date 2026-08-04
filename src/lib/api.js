import { useState, useEffect, useCallback } from 'react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Pub/Sub system for real-time blockchain/smart contract events in MeeChain
const eventListeners = new Set();

export const blockchainEvents = {
  subscribe(listener) {
    eventListeners.add(listener);
    return () => eventListeners.delete(listener);
  },
  emit(event, data) {
    console.log(`[MeeChain EVM Event] Emitting ${event}:`, data);
    eventListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (e) {
        console.error('Error in blockchain event listener:', e);
      }
    });
    // Also dispatch as native CustomEvent on window to bridge with non-React/iframe modules
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
};

// Client-side simulation of MeeChain Magic Layer state
function getAddressState(address) {
  const cleanAddress = address || '0xMeeBuilderDemo';
  const key = `meechain-state-${cleanAddress}`;
  let state = localStorage.getItem(key);
  if (!state) {
    state = {
      address: cleanAddress,
      relicsHeld: 3,
      totalRitualsConfirmed: 12,
      totalBlessingsSent: 5,
      level: 1,
      xp: 350,
      maxXp: 1000,
      title: 'Novice Mage',
      badges: [
        { id: 'badge_first_ritual', label: '✦ First Ritual', trigger: 'Earned by confirming your first quest', earnedAt: new Date(Date.now() - 3600000).toISOString(), seen: true, icon: '⚡', color: '#7c85ff', desc: 'Confirm your first dApp quest successfully.' },
        { id: 'badge_guardian', label: '✦ Guardian Shield', trigger: 'Earned by analyzing the network status', earnedAt: new Date(Date.now() - 7200000).toISOString(), seen: true, icon: '🛡️', color: '#45a0ff', desc: 'Analyze the network health dashboard.' }
      ],
      timeline: [
        { type: 'Mint Relic', status: 'Success', timestamp: new Date(Date.now() - 1200000).toISOString() },
        { type: 'Confirm Ritual', status: 'Confirmed', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { type: 'Send Blessing', status: 'Transmitted', timestamp: new Date(Date.now() - 7200000).toISOString() }
      ],
      quests: [
        { id: 'q1', label: 'Activate Magic Key', desc: 'ยืนยันและเปิดใช้งาน Magic Address ตัวแทนของคุณ', mode: 'manual', completed: false },
        { id: 'q2', label: 'Check Orb Pulse', desc: 'เฝ้าดูความเสถียรของสัญญาณ Magic Orb ประจำชั่วโมง', mode: 'auto', completed: true },
        { id: 'q3', label: 'Ask MeeBot for Advice', desc: 'สอบถาม MeeBot เพื่อรับแนวทางบำเพ็ญใน Magic Layer', mode: 'manual', completed: false }
      ]
    };
    localStorage.setItem(key, JSON.stringify(state));
  } else {
    try {
      state = JSON.parse(state);
      // Ensure level and gamification parameters exist if state was already saved
      if (state.level === undefined) {
        state.level = 1;
        state.xp = 350;
        state.maxXp = 1000;
        state.title = 'Novice Mage';
      }
      if (!state.badges || !state.badges.length) {
        state.badges = [
          { id: 'badge_first_ritual', label: '✦ First Ritual', trigger: 'Earned by confirming your first quest', earnedAt: new Date(Date.now() - 3600000).toISOString(), seen: true, icon: '⚡', color: '#7c85ff', desc: 'Confirm your first dApp quest successfully.' },
          { id: 'badge_guardian', label: '✦ Guardian Shield', trigger: 'Earned by analyzing the network status', earnedAt: new Date(Date.now() - 7200000).toISOString(), seen: true, icon: '🛡️', color: '#45a0ff', desc: 'Analyze the network health dashboard.' }
        ];
      }
    } catch (e) {
      localStorage.removeItem(key);
      return getAddressState(cleanAddress);
    }
  }
  return state;
}

function saveAddressState(address, state) {
  const cleanAddress = address || '0xMeeBuilderDemo';
  localStorage.setItem(`meechain-state-${cleanAddress}`, JSON.stringify(state));
}

function getMockResponse(path, options = {}) {
  const cleanPath = path.split('?')[0];
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Compute live tick-up block height
  const startBlock = 154239;
  const secondsElapsed = Math.floor(Date.now() / 6000);
  const currentBlock = startBlock + secondsElapsed;

  if (cleanPath === '/health') {
    return { status: 'ok', chainId: '13390', mock: true };
  }

  if (cleanPath === '/api/magic/orb') {
    return {
      chainEnergy: {
        label: 'Chain Height',
        status: '🟢',
        detail: `#${currentBlock.toLocaleString()}`
      },
      validatorForce: {
        label: 'Guardians Online',
        status: '🟢',
        detail: '128 Validators'
      }
    };
  }

  if (cleanPath === '/api/magic/realm-vision') {
    return {
      latestBlock: `#${currentBlock.toLocaleString()}`,
      guardiansOnline: '128 Validators',
      recentTransactions: [
        { txHash: '0x' + Math.random().toString(16).substr(2, 6), amount: `${(Math.random() * 500 + 50).toFixed(0)} MEE`, from: '0xMeeBuilderDemo', to: '0xSacredShrine' },
        { txHash: '0x' + Math.random().toString(16).substr(2, 6), amount: `${(Math.random() * 200 + 10).toFixed(0)} MEE`, from: '0xWanderingMage', to: '0xMeeBuilderDemo' },
        { txHash: '0x' + Math.random().toString(16).substr(2, 6), amount: `${(Math.random() * 1000 + 100).toFixed(0)} MEE`, from: '0xGuardianPrime', to: '0xArchiveVault' }
      ],
      chainId: '13390',
      message: '🌌 Vision Live'
    };
  }

  // Address-bound endpoints
  if (cleanPath.startsWith('/api/magic/hall/')) {
    const address = cleanPath.split('/').pop();
    const state = getAddressState(address);
    return {
      realmVision: {
        adventurers: [
          {
            address: address,
            relicsHeld: state.relicsHeld,
            totalRitualsConfirmed: state.totalRitualsConfirmed,
            totalBlessingsSent: state.totalBlessingsSent
          }
        ]
      },
      badgeCollection: state.badges,
      questLog: {
        totalRitualsConfirmed: state.totalRitualsConfirmed,
        totalBlessingsSent: state.totalBlessingsSent,
        timeline: state.timeline
      }
    };
  }

  if (cleanPath.startsWith('/api/magic/achievements/')) {
    const address = cleanPath.split('/').pop();
    if (address === 'ack' && method === 'POST') {
      const { address: addr, badgeIds } = body;
      const state = getAddressState(addr);
      state.badges = state.badges.map(b => badgeIds.includes(b.id) ? { ...b, seen: true } : b);
      saveAddressState(addr, state);
      return { success: true };
    } else {
      const state = getAddressState(address);
      return { data: { badges: state.badges } };
    }
  }

  if (cleanPath.startsWith('/api/magic/daily-quest/')) {
    const address = cleanPath.split('/').pop();
    if (address === 'confirm' && method === 'POST') {
      const { address: addr, questId } = body;
      const state = getAddressState(addr);
      state.quests = state.quests.map(q => q.id === questId ? { ...q, completed: true } : q);
      
      // Unlock badge b3 for q1, b4 for q3
      if (questId === 'q1' && !state.badges.some(b => b.id === 'b3')) {
        state.badges.push({
          id: 'b3',
          label: '✦ Key Activated',
          trigger: 'เปิดใช้งานกุญแจเวทมนตร์สำเร็จ',
          earnedAt: new Date().toISOString(),
          seen: false
        });
      }
      if (questId === 'q3' && !state.badges.some(b => b.id === 'b4')) {
        state.badges.push({
          id: 'b4',
          label: '✦ Sage Apprentice',
          trigger: 'สอบถามความรู้จากวิญญาณผู้พิทักษ์ MeeBot',
          earnedAt: new Date().toISOString(),
          seen: false
        });
      }

      state.totalRitualsConfirmed += 1;
      state.timeline.unshift({
        type: `Confirm Quest: ${questId === 'q1' ? 'Activate Key' : 'Ask MeeBot'}`,
        status: 'Success',
        timestamp: new Date().toISOString()
      });
      saveAddressState(addr, state);
      return { success: true };
    } else {
      const state = getAddressState(address);
      const completedCount = state.quests.filter(q => q.completed).length;
      return {
        data: {
          quests: state.quests,
          completedCount: completedCount,
          totalCount: state.quests.length
        }
      };
    }
  }

  if (cleanPath.startsWith('/api/magic/quest-log/')) {
    const address = cleanPath.split('/').pop();
    const state = getAddressState(address);
    return {
      data: {
        totalRitualsConfirmed: state.totalRitualsConfirmed,
        totalBlessingsSent: state.totalBlessingsSent,
        timeline: state.timeline
      }
    };
  }

  if (cleanPath.startsWith('/api/magic/user-stats/')) {
    const address = cleanPath.split('/').pop();
    const state = getAddressState(address);
    if (options.method === 'POST') {
      const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {});
      if (parsedBody.level !== undefined) state.level = Number(parsedBody.level);
      if (parsedBody.xp !== undefined) state.xp = Number(parsedBody.xp);
      if (parsedBody.maxXp !== undefined) state.maxXp = Number(parsedBody.maxXp);
      if (parsedBody.title !== undefined) state.title = parsedBody.title;
      if (parsedBody.badges !== undefined) state.badges = parsedBody.badges;
      saveAddressState(address, state);
      return {
        success: true,
        data: {
          level: state.level,
          xp: state.xp,
          maxXp: state.maxXp,
          title: state.title,
          badges: state.badges
        }
      };
    } else {
      return {
        data: {
          level: state.level,
          xp: state.xp,
          maxXp: state.maxXp,
          title: state.title,
          badges: state.badges
        }
      };
    }
  }

  if (cleanPath === '/api/magic/sage') {
    const { message, address: addr } = body;
    const msg = (message || '').toLowerCase();

    let text = "🧙 ข้าได้รับกระแสจิตของเจ้าแล้ว... พลังเวทย์ในตัวเจ้ากำลังสอดประสานกับเครือข่าย MeeChain จงบำเพ็ญเพียรและทำภารกิจประจำวันให้สำเร็จเพื่อปลดล็อคพลังที่แท้จริง!";
    let suggestedAction = null;

    if (msg.includes('stake') || msg.includes('pool')) {
      text = "🧙 การ Stake เหรียญ MEE ใน Magic Layer จะได้รับ Blessing point และช่วยเพิ่มเกราะกำบังให้กับ Realm ยิ่งเจ้า Stake มาก พลังเวทย์คุ้มครองก็จะแข็งแกร่งยิ่งขึ้น!";
      suggestedAction = "เปิดดู Network Pulse";
    } else if (msg.includes('relic') || msg.includes('mint')) {
      text = "🧙 การ Mint Relic คือการหลอมรวมไอเทมโบราณจากบล็อกเชน เจ้าสามารถสร้างวัตถุศักดิ์สิทธิ์ประจำตัวได้ที่ Realm Hall เพื่อสะสมค่าพลังเวทย์!";
      suggestedAction = "ตรวจสอบ Profile";
    } else if (msg.includes('quest') || msg.includes('ภารกิจ')) {
      text = "🧙 บอร์ด Quest วันนี้มีภารกิจคอยเจ้าอยู่! หากสำเร็จภารกิจ 'Activate Magic Key' หรือ 'Ask MeeBot' เจ้าจะได้รับตราสัญลักษณ์เกียรติยศ (Badges) เพื่อประดับใน Vault ของเจ้า!";
      suggestedAction = "ไป Daily Quest";
    } else if (msg.includes('guardian') || msg.includes('ผู้พิทักษ์')) {
      text = "🧙 เหล่า Guardians กำลังเฝ้าตรวจตราเครือข่ายอย่างใกล้ชิด! ค่า Latency ขณะนี้เสถียรดีและไม่มีภัยคุกคามใดๆ คุกคาม Magic Layer ในขณะนี้";
      suggestedAction = "เปิดดู Guardian Ops";
    } else if (msg.includes('hello') || msg.includes('สวัสดี') || msg.includes('บอท') || msg.includes('ช่วย')) {
      text = "🧙 ยินดีต้อนรับผู้ผจญภัย! ข้าคือ MeeBot ผู้แปลรหัสคาถาจากสรวงสวรรค์บล็อกเชน เจ้าอยากถามเรื่องอะไร? ลองพิมพ์ว่า 'stake', 'relic', 'quest' หรือขอคำแนะนำภารกิจได้เลย!";
    }

    return {
      data: {
        text,
        suggestedAction
      }
    };
  }

  return {};
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const text = await response.text();
    
    // Check if the server returned HTML (starts with <!doctype or <!DOCTYPE)
    if (text.trim().startsWith('<!')) {
      return getMockResponse(path, options);
    }

    const json = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(json.error || `Request failed: ${response.status}`);
    }

    return json;
  } catch (error) {
    // On any fetch or parsing error, fallback gracefully to mock data
    console.warn(`Fetch to ${path} failed, falling back to client-side mock data:`, error);
    return getMockResponse(path, options);
  }
}

export const api = {
  health: () => request('/health'),
  orb: () => request('/api/magic/orb'),
  hall: (address) => request(`/api/magic/hall/${address}`),
  achievements: (address) => request(`/api/magic/achievements/${address}`),
  ackAchievements: (address, badgeIds) => request('/api/magic/achievements/ack', {
    method: 'POST',
    body: JSON.stringify({ address, badgeIds })
  }),
  dailyQuest: (address) => request(`/api/magic/daily-quest/${address}`),
  confirmQuest: async (address, questId) => {
    const res = await request('/api/magic/daily-quest/confirm', {
      method: 'POST',
      body: JSON.stringify({ address, questId })
    });
    if (res && !res.error) {
      blockchainEvents.emit('QuestCompleted', { address, questId });
    }
    return res;
  },
  questLog: (address) => request(`/api/magic/quest-log/${address}`),
  realmVision: () => request('/api/magic/realm-vision'),
  sageByMessage: (message, address) => request('/api/magic/sage', {
    method: 'POST',
    body: JSON.stringify({ message, address })
  }),
  sageByAddress: (address) => request('/api/magic/sage', {
    method: 'POST',
    body: JSON.stringify({ address })
  }),
  getUserStats: (address) => request(`/api/magic/user-stats/${address}`),
  updateUserStats: async (address, stats) => {
    const res = await request(`/api/magic/user-stats/${address}`, {
      method: 'POST',
      body: JSON.stringify(stats)
    });
    if (res && !res.error) {
      if (stats && stats.level !== undefined) {
        blockchainEvents.emit('LevelUp', { address, level: stats.level });
      }
    }
    return res;
  }
};

export function useBlockchain(address) {
  const [stats, setStats] = useState({
    level: 1,
    xp: 350,
    maxXp: 1000,
    title: 'Novice Mage',
    badges: [],
    quests: [],
    timeline: [],
    totalRitualsConfirmed: 0,
    totalBlessingsSent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatsAndQuests = useCallback(async () => {
    if (!address) return;
    try {
      setLoading(true);
      const [statsRes, hallRes, questRes] = await Promise.all([
        api.getUserStats(address),
        api.hall(address),
        api.dailyQuest(address)
      ]);

      const questData = questRes?.data?.quests || questRes?.quests || [];
      const hallData = hallRes?.realmVision?.adventurers?.[0] || {};
      const badgeData = hallRes?.badgeCollection || [];
      const timelineData = hallRes?.questLog?.timeline || [];

      setStats({
        level: statsRes?.data?.level ?? statsRes?.level ?? 1,
        xp: statsRes?.data?.xp ?? statsRes?.xp ?? 350,
        maxXp: statsRes?.data?.maxXp ?? statsRes?.maxXp ?? 1000,
        title: statsRes?.data?.title ?? statsRes?.title ?? 'Novice Mage',
        badges: statsRes?.data?.badges ?? statsRes?.badges ?? badgeData,
        quests: questData,
        timeline: timelineData,
        totalRitualsConfirmed: hallData.totalRitualsConfirmed ?? 0,
        totalBlessingsSent: hallData.totalBlessingsSent ?? 0
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching blockchain stats", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchStatsAndQuests();

    const handleEvent = (event, data) => {
      console.log(`[useBlockchain hook] Event '${event}' caught! Triggering auto-refresh...`);
      fetchStatsAndQuests();
    };

    // Listen to our custom event system
    const unsubscribe = blockchainEvents.subscribe((event, data) => {
      if (event === 'QuestCompleted' || event === 'LevelUp') {
        handleEvent(event, data);
      }
    });

    // Also listen to window DOM CustomEvents for maximum compatibility
    const onQuestCompleted = (e) => handleEvent('QuestCompleted', e.detail);
    const onLevelUp = (e) => handleEvent('LevelUp', e.detail);

    window.addEventListener('QuestCompleted', onQuestCompleted);
    window.addEventListener('LevelUp', onLevelUp);

    return () => {
      unsubscribe();
      window.removeEventListener('QuestCompleted', onQuestCompleted);
      window.removeEventListener('LevelUp', onLevelUp);
    };
  }, [address, fetchStatsAndQuests]);

  return {
    ...stats,
    loading,
    error,
    refetch: fetchStatsAndQuests
  };
}

export function toMetricValue(detail, fallback = '—') {
  if (!detail) return fallback;
  const blockMatch = detail.match(/#([\d,]+)/);
  if (blockMatch) return blockMatch[1];
  const numberMatch = detail.match(/([\d,.]+)/);
  return numberMatch ? numberMatch[1] : detail;
}
