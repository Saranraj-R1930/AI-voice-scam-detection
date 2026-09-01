/* VoxShield AI - Storage Manager (LocalStorage API) */

const STORAGE_KEYS = {
  HISTORY: 'voxshield_history_v1',
  STATS: 'voxshield_stats_v1'
};

const StorageManager = {
  // Get all history logs
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) {
        return this.seedInitialHistory();
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read history from localStorage:', e);
      return [];
    }
  },

  // Save new analysis record
  saveAnalysis(record) {
    const history = this.getHistory();
    const newEntry = {
      id: 'VS-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      dateStr: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      filename: record.filename || 'Voice Recording / Call Transcript',
      riskScore: record.riskScore,
      riskLevel: record.riskLevel,
      threatCount: record.threatCategories ? record.threatCategories.filter(t => t.detected).length : 0,
      detectedPhrases: record.detectedPhrases || [],
      threatCategories: record.threatCategories || [],
      timeline: record.timeline || [],
      explanation: record.explanation || '',
      recommendations: record.recommendations || [],
      transcript: record.transcript || ''
    };

    history.unshift(newEntry);
    
    // Limit to last 50 entries
    if (history.length > 50) history.pop();

    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.updateStatsOnNewSave(newEntry);
    } catch (e) {
      console.error('Failed to save record to localStorage:', e);
    }

    return newEntry;
  },

  // Delete single record
  deleteAnalysis(id) {
    let history = this.getHistory();
    history = history.filter(item => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.recalculateStats(history);
    } catch (e) {
      console.error('Failed to delete history item:', e);
    }
  },

  // Clear all history
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.STATS);
      this.seedInitialHistory();
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  },

  // Aggregated Stats
  getStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) {
        const history = this.getHistory();
        return this.recalculateStats(history);
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read stats:', e);
      return { totalCalls: 0, highRiskCalls: 0, avgRiskScore: 0, threatsDetected: 0 };
    }
  },

  // Update aggregated stats on new item
  updateStatsOnNewSave(record) {
    const stats = this.getStats();
    stats.totalCalls += 1;
    if (record.riskScore >= 76) stats.highRiskCalls += 1;
    stats.threatsDetected += record.threatCount;
    
    // Recalculate average score
    const history = this.getHistory();
    const totalScore = history.reduce((sum, h) => sum + h.riskScore, 0);
    stats.avgRiskScore = Math.round(totalScore / history.length);

    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to update stats:', e);
    }
  },

  // Recalculate stats from entire history array
  recalculateStats(history) {
    if (!history || history.length === 0) {
      const emptyStats = { totalCalls: 0, highRiskCalls: 0, avgRiskScore: 0, threatsDetected: 0 };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(emptyStats));
      return emptyStats;
    }

    const totalCalls = history.length;
    const highRiskCalls = history.filter(h => h.riskScore >= 76).length;
    const threatsDetected = history.reduce((sum, h) => sum + (h.threatCount || 0), 0);
    const avgRiskScore = Math.round(history.reduce((sum, h) => sum + h.riskScore, 0) / totalCalls);

    const stats = { totalCalls, highRiskCalls, avgRiskScore, threatsDetected };
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save recalculated stats:', e);
    }
    return stats;
  },

  // Initial seed data so user sees active demo stats
  seedInitialHistory() {
    const seed = [
      {
        id: 'VS-demo-01',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        dateStr: 'Today, 2 hours ago',
        filename: 'Tanglish Bank Scam Call Sample.wav',
        riskScore: 87,
        riskLevel: 'HIGH RISK',
        threatCount: 4,
        detectedPhrases: ['immediate ah', 'bank account block', 'OTP sollunga', 'police case'],
        threatCategories: [
          { key: 'urgency', name: 'Urgency Manipulation', detected: true, confidence: 92 },
          { key: 'financial', name: 'Financial Pressure', detected: true, confidence: 88 },
          { key: 'credential', name: 'Credential Request', detected: true, confidence: 96 },
          { key: 'threat', name: 'Threat / Intimidation', detected: true, confidence: 85 }
        ],
        timeline: [
          { time: '00:08', text: 'Urgency indicator detected: "immediate ah"' },
          { time: '00:18', text: 'Impersonation detected: "SBI Bank customer support"' },
          { time: '00:32', text: 'Threat detected: "account block aagum"' },
          { time: '00:45', text: 'Credential request detected: "OTP sollunga"' }
        ],
        explanation: 'Multiple high-risk scam indicators were identified. The conversation exerts severe urgency, threatens account blockage, impersonates bank staff, and demands confidential OTP credentials.',
        recommendations: [
          'Do NOT share OTP, PIN, password, or CVV under any circumstances.',
          'Hang up immediately if the caller demands instant action.',
          'Call your official bank helpline number directly to verify.'
        ],
        transcript: 'Hello sir, I am calling from SBI Bank customer support. Your account has suspicious activity and will be blocked within 10 minutes. Share the OTP sent to your phone immediately to unblock.'
      },
      {
        id: 'VS-demo-02',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        dateStr: 'Yesterday',
        filename: 'Courier Delivery Refund Scam.mp3',
        riskScore: 68,
        riskLevel: 'SUSPICIOUS',
        threatCount: 3,
        detectedPhrases: ['fedex customs', 'pay fine', 'money transfer'],
        threatCategories: [
          { key: 'impersonation', name: 'Impersonation', detected: true, confidence: 90 },
          { key: 'financial', name: 'Financial Pressure', detected: true, confidence: 80 },
          { key: 'social', name: 'Social Engineering', detected: true, confidence: 75 }
        ],
        timeline: [
          { time: '00:12', text: 'Impersonation detected: "fedex customs officer"' },
          { time: '00:27', text: 'Financial demand detected: "pay clearance fee"' }
        ],
        explanation: 'Suspicious delivery impersonation asking for upfront payment.',
        recommendations: [
          'Verify package tracking on official website.',
          'Never transfer money to personal UPI handles for package delivery.'
        ],
        transcript: 'Hello, your FedEx parcel is stuck at customs due to illegal items. You must transfer Rs. 5000 fine to customs UPI now.'
      },
      {
        id: 'VS-demo-03',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        dateStr: '2 days ago',
        filename: 'Doctor Appointment Confirmation.wav',
        riskScore: 12,
        riskLevel: 'SAFE',
        threatCount: 0,
        detectedPhrases: [],
        threatCategories: [],
        timeline: [
          { time: '00:05', text: 'Standard greeting' }
        ],
        explanation: 'No scam patterns or pressure tactics detected in this conversation.',
        recommendations: [
          'Normal conversation profile.'
        ],
        transcript: 'Hi Doctor, confirming our consultation appointment for tomorrow 4 PM. Thank you.'
      }
    ];

    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(seed));
      this.recalculateStats(seed);
    } catch (e) {
      console.error('Failed to seed initial data:', e);
    }

    return seed;
  }
};
