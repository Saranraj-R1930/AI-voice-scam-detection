/* VoxShield AI - Client-Side Risk Analysis & Scam Detection Engine */

const ScamDetector = {
  // Multilingual & Tanglish Dictionaries
  dictionaries: {
    urgency: {
      name: 'Urgency Manipulation',
      weight: 15,
      icon: '🚨',
      keywords: [
        'immediately', 'urgent', 'right now', 'act fast', 'within minutes', 'within 5 minutes', 'within 10 minutes',
        'last chance', 'expire', 'expiring', 'today itself', 'unauthorized access', 'limited time', 'right away',
        // Tanglish
        'immediate ah', 'udane', 'seekiram', 'now itself', 'urgenta', 'udaney', 'quick ah',
        // Tamil
        'உடனடியாக', 'சீக்கிரம்', 'இப்போதே', 'உடனே'
      ]
    },

    financial: {
      name: 'Financial Pressure',
      weight: 20,
      icon: '💳',
      keywords: [
        'payment', 'transfer', 'money', 'bank', 'upi', 'gpay', 'phonepe', 'paytm', 'wire',
        'refund', 'deposit', 'fine', 'penalty', 'account', 'transaction', 'balance', 'charge',
        // Tanglish
        'panam', 'money transfer', 'bank account', 'kattungga', 'upi id', 'refund panro', 'money anuppu', 'cash',
        // Tamil
        'பணம்', 'வங்கி', 'பரிமாற்றம்', 'கணக்கு', 'அனுப்புங்கள்', 'தொகை'
      ]
    },

    credential: {
      name: 'Credential Request',
      weight: 25,
      icon: '🔐',
      keywords: [
        'otp', 'pin', 'cvv', 'password', 'verification code', 'card details', 'net banking',
        'login credentials', 'expiry date', 'secret key', 'passcode', 'atm pin',
        // Tanglish
        'otp sollunga', 'pin number', 'password sollungga', 'cvv number', 'verification code sollungga', 'otp anuppu',
        // Tamil
        'கடவுச்சொல்', 'ரகசிய எண்', 'ஓடிபி'
      ]
    },

    threat: {
      name: 'Threat / Intimidation',
      weight: 20,
      icon: '⚠️',
      keywords: [
        'police', 'arrest', 'court', 'legal action', 'blocked account', 'account block',
        'criminal case', 'jail', 'warrant', 'cbi', 'cyber crime', 'suspend', 'suspended', 'penalty',
        // Tanglish
        'police case', 'arrest panro', 'account block aagum', 'legal action', 'case poduvom', 'jail la poduvom', 'sim block',
        // Tamil
        'காவல்துறை', 'கைது', 'வழக்கு', 'தடை', 'கணக்கு முடக்கம்'
      ]
    },

    impersonation: {
      name: 'Impersonation',
      weight: 10,
      icon: '👤',
      keywords: [
        'bank manager', 'bank employee', 'police officer', 'customer support', 'customer care',
        'courier company', 'fedex', 'tax department', 'customs officer', 'telecom department',
        'rbi officer', 'income tax', 'support desk',
        // Tanglish
        'bank la irundhu call', 'police officer pesuren', 'customer care pesuren', 'fedex manager', 'sbi officer',
        // Tamil
        'வங்கி அதிகாரி', 'காவல் அதிகாரி', 'வாடிக்கையாளர் சேவை'
      ]
    },

    social: {
      name: 'Fake Reward / Social Engineering',
      weight: 10,
      icon: '🎁',
      keywords: [
        'lottery', 'prize', 'won', 'gift', 'cashback', 'special offer', 'job offer',
        'double your money', 'claim refund', 'lucky winner', 'reward points',
        // Tanglish
        'prize jeichitinga', 'lottery gift', 'cashback vanthuruku', 'refund tharo', 'lucky winner நீங்க',
        // Tamil
        'பரிசு', 'லாட்டரி', 'வெற்றி'
      ]
    }
  },

  // Main Analysis Method
  analyze(rawText) {
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return this.getEmptyAnalysis();
    }

    const text = rawText.toLowerCase();
    const words = text.split(/\s+/);
    
    let totalRiskScore = 0;
    const threatCategories = [];
    const detectedPhrases = [];
    const timeline = [];
    let eventCounter = 1;

    // Scan each category
    Object.keys(this.dictionaries).forEach(catKey => {
      const category = this.dictionaries[catKey];
      const matches = [];

      category.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          if (!matches.includes(keyword)) {
            matches.push(keyword);
          }
          if (!detectedPhrases.includes(keyword)) {
            detectedPhrases.push(keyword);
          }
        }
      });

      const isDetected = matches.length > 0;
      let confidence = 0;

      if (isDetected) {
        // Calculate confidence based on keyword match density
        confidence = Math.min(98, 65 + (matches.length * 12));
        totalRiskScore += category.weight;

        // Generate synthetic timeline event based on approximate word index
        const firstMatchWordIndex = words.findIndex(w => matches.some(m => m.includes(w)));
        const approxSeconds = firstMatchWordIndex >= 0 ? Math.max(5, Math.floor(firstMatchWordIndex * 1.8)) : eventCounter * 12;
        const timeStr = this.formatSeconds(approxSeconds);

        timeline.push({
          time: timeStr,
          timeSec: approxSeconds,
          category: category.name,
          icon: category.icon,
          isHighRisk: category.weight >= 20,
          text: `${category.name} indicator detected: "${matches[0]}"`
        });

        eventCounter++;
      }

      threatCategories.push({
        key: catKey,
        name: category.name,
        icon: category.icon,
        detected: isDetected,
        confidence: isDetected ? confidence : 0,
        matches: matches,
        description: isDetected
          ? `Detected ${matches.length} suspicious pattern(s): ${matches.slice(0, 3).map(m => `"${m}"`).join(', ')}.`
          : `No suspicious ${category.name.toLowerCase()} patterns detected.`
      });
    });

    // Cap score at 100
    totalRiskScore = Math.min(100, Math.max(0, totalRiskScore));

    // Sort timeline chronologically
    timeline.sort((a, b) => a.timeSec - b.timeSec);

    // Determine Risk Level
    let riskLevel = 'SAFE';
    let riskClass = 'safe';
    let badgeClass = 'badge-safe';
    let gaugeColor = '#10b981';

    if (totalRiskScore > 75) {
      riskLevel = 'HIGH RISK';
      riskClass = 'high';
      badgeClass = 'badge-high';
      gaugeColor = '#ef4444';
    } else if (totalRiskScore > 50) {
      riskLevel = 'SUSPICIOUS';
      riskClass = 'suspicious';
      badgeClass = 'badge-suspicious';
      gaugeColor = '#f97316';
    } else if (totalRiskScore > 25) {
      riskLevel = 'LOW RISK';
      riskClass = 'low';
      badgeClass = 'badge-low';
      gaugeColor = '#06b6d4';
    }

    // Dynamic AI Explanation synthesis
    const explanation = this.generateExplanation(totalRiskScore, riskLevel, threatCategories);

    // Safety Recommendations
    const recommendations = this.generateRecommendations(totalRiskScore, threatCategories);

    return {
      riskScore: totalRiskScore,
      riskLevel: riskLevel,
      riskClass: riskClass,
      badgeClass: badgeClass,
      gaugeColor: gaugeColor,
      detectedPhrases: detectedPhrases,
      threatCategories: threatCategories,
      timeline: timeline.length > 0 ? timeline : [{ time: '00:00', text: 'No scam patterns identified in conversation audio/transcript.' }],
      explanation: explanation,
      recommendations: recommendations,
      transcript: rawText
    };
  },

  formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  generateExplanation(score, level, categories) {
    const detectedNames = categories.filter(c => c.detected).map(c => c.name);
    
    if (score === 0) {
      return "AI Risk Assessment complete. No known voice scam patterns, high-pressure urgency keywords, or illegal credential requests were detected in this transcript.";
    }

    if (score <= 25) {
      return `AI Risk Assessment calculated a Low Risk profile (${score}/100). Found minor language markers related to ${detectedNames.join(', ')}. Routine verification is advised.`;
    }

    if (score <= 50) {
      return `AI Risk Assessment identified suspicious contextual triggers (${score}/100). The conversation contains indicators of ${detectedNames.join(' and ')}. Exercise caution before fulfilling any requests.`;
    }

    if (score <= 75) {
      return `AI Risk Assessment flagged this conversation as SUSPICIOUS (${score}/100). Multiple scam indicators detected: ${detectedNames.join(', ')}. This combination matches known social engineering tactics.`;
    }

    return `AI Risk Assessment detected severe HIGH RISK scam signals (${score}/100). The conversation exhibits critical coercion triggers including ${detectedNames.join(', ')}. This pattern strongly mirrors illegal voice imposter and banking scams.`;
  },

  generateRecommendations(score, categories) {
    const recs = [];
    const hasCredential = categories.find(c => c.key === 'credential' && c.detected);
    const hasFinancial = categories.find(c => c.key === 'financial' && c.detected);
    const hasThreat = categories.find(c => c.key === 'threat' && c.detected);
    const hasImpersonation = categories.find(c => c.key === 'impersonation' && c.detected);

    if (score >= 76) {
      recs.push('DO NOT share OTPs, bank passwords, PINs, or card CVVs under any circumstance.');
      recs.push('Do NOT transfer money or make instant UPI payments under phone pressure.');
      recs.push('Immediately disconnect the call. Legitimate banks and government agencies never threaten immediate arrest or demand instant money via phone.');
      recs.push('Report the caller number and transcript to the official Cyber Crime Portal (e.g. 1930 / cybercrime.gov.in).');
      recs.push('Contact your bank directly using the official telephone number printed on your debit card.');
    } else if (score >= 51) {
      if (hasCredential) recs.push('Never reveal OTP or banking verification codes to incoming callers.');
      if (hasFinancial) recs.push('Refuse any request to initiate money transfers or open third-party apps.');
      if (hasImpersonation) recs.push('Independently look up the caller agency phone number and verify their identity.');
      recs.push('Take a pause. Scammers rely on artificial urgency to bypass your critical thinking.');
    } else {
      recs.push('Verify the identity of unknown callers before discussing personal account details.');
      recs.push('Avoid sharing sensitive personal information unless you initiated the telephone call.');
      recs.push('Keep your mobile banking applications and passwords secured with 2FA.');
    }

    return recs;
  },

  getEmptyAnalysis() {
    return {
      riskScore: 0,
      riskLevel: 'SAFE',
      riskClass: 'safe',
      badgeClass: 'badge-safe',
      gaugeColor: '#10b981',
      detectedPhrases: [],
      threatCategories: Object.keys(this.dictionaries).map(k => ({
        key: k,
        name: this.dictionaries[k].name,
        icon: this.dictionaries[k].icon,
        detected: false,
        confidence: 0,
        matches: [],
        description: 'No text input provided.'
      })),
      timeline: [{ time: '00:00', text: 'Please provide or record a transcript to start analysis.' }],
      explanation: 'No transcript text was provided for analysis.',
      recommendations: ['Upload an audio file, record audio, or paste a call transcript to view risk assessment.'],
      transcript: ''
    };
  }
};
