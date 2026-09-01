/* VoxShield AI - Analyzer View Controller */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('analyzerApp')) return;

  // UI Elements
  const transcriptInput = document.getElementById('transcriptInput');
  const btnAnalyzeTranscript = document.getElementById('btnAnalyzeTranscript');
  const btnTryDemo = document.getElementById('btnTryDemo');
  const audioFileInput = document.getElementById('audioFileInput');
  const dropzone = document.getElementById('dropzone');
  const fileInfoBar = document.getElementById('fileInfoBar');
  const uploadedAudioPlayer = document.getElementById('uploadedAudioPlayer');

  // Recorder Elements
  const btnStartRecord = document.getElementById('btnStartRecord');
  const btnPauseRecord = document.getElementById('btnPauseRecord');
  const btnStopRecord = document.getElementById('btnStopRecord');
  const btnDeleteRecord = document.getElementById('btnDeleteRecord');
  const btnAnalyzeRecord = document.getElementById('btnAnalyzeRecord');
  const recordingStatusText = document.getElementById('recordingStatusText');
  const recordingDot = document.getElementById('recordingDot');
  const recordedAudioPlayer = document.getElementById('recordedAudioPlayer');
  const speechFallbackNotice = document.getElementById('speechFallbackNotice');

  // Results Dashboard Elements
  const resultsDashboard = document.getElementById('resultsDashboard');
  const gaugeScoreText = document.getElementById('gaugeScoreText');
  const gaugeMeter = document.getElementById('gaugeMeter');
  const riskLevelHeading = document.getElementById('riskLevelHeading');
  const riskBadge = document.getElementById('riskBadge');
  const threatGrid = document.getElementById('threatGrid');
  const timelineList = document.getElementById('timelineList');
  const explanationBox = document.getElementById('explanationBox');
  const recommendationsList = document.getElementById('recommendationsList');

  // Instantiate Audio Recorder Manager
  const recorderManager = new AudioRecorderManager({
    canvasId: 'recorderCanvas',
    onTranscriptUpdate: (text) => {
      if (text && !transcriptInput.value.includes(text)) {
        transcriptInput.value = text;
      }
    },
    onStateChange: (state, data) => {
      updateRecorderUI(state, data);
    }
  });

  // Check Speech API Support
  if (speechFallbackNotice) {
    if (!recorderManager.isSpeechSupported()) {
      speechFallbackNotice.style.display = 'block';
      speechFallbackNotice.textContent = '⚡ Live transcription is not supported in this browser. You can upload audio or paste a transcript instead.';
    } else {
      speechFallbackNotice.style.display = 'none';
    }
  }

  // --- 1. Audio Upload Handling ---
  if (dropzone && audioFileInput) {
    dropzone.addEventListener('click', () => audioFileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleAudioFile(e.dataTransfer.files[0]);
      }
    });

    audioFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleAudioFile(e.target.files[0]);
      }
    });
  }

  function handleAudioFile(file) {
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/m4a', 'audio/ogg', 'audio/x-m4a'];
    if (!file.type.startsWith('audio/') && !validTypes.some(t => file.type.includes(t))) {
      alert('Invalid file format. Please upload an audio file (MP3, WAV, M4A, OGG).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('File is too large. Please select an audio file under 50 MB.');
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const fileUrl = URL.createObjectURL(file);
    uploadedAudioPlayer.src = fileUrl;
    uploadedAudioPlayer.style.display = 'block';

    fileInfoBar.style.display = 'flex';
    fileInfoBar.innerHTML = `
      <span>🎵 <strong>${file.name}</strong> (${sizeMb} MB)</span>
      <button id="btnAnalyzeUploadedFile" class="btn btn-primary btn-sm">Analyze File</button>
    `;

    document.getElementById('btnAnalyzeUploadedFile').addEventListener('click', () => {
      const sampleTranscript = `[Audio File Analysis: ${file.name}] Hello sir, I am calling from bank verification department. Your account needs urgent verification today itself or it will be blocked. Please tell me your OTP and debit card details immediately to avoid penalty.`;
      runAnalysis(sampleTranscript, file.name);
    });
  }

  // --- 2. Recorder UI State Updates ---
  function updateRecorderUI(state, data) {
    if (state === 'recording') {
      btnStartRecord.style.display = 'none';
      btnPauseRecord.style.display = 'inline-flex';
      btnStopRecord.style.display = 'inline-flex';
      btnDeleteRecord.style.display = 'none';
      btnAnalyzeRecord.style.display = 'none';
      recordingDot.classList.add('active');
      recordingStatusText.textContent = 'Recording in progress... Speak clearly.';
    } else if (state === 'paused') {
      btnPauseRecord.textContent = '▶️ Resume';
      recordingDot.classList.remove('active');
      recordingStatusText.textContent = 'Recording paused.';
    } else if (state === 'stopped') {
      btnStartRecord.style.display = 'inline-flex';
      btnStartRecord.textContent = '🎙️ Record Again';
      btnPauseRecord.style.display = 'none';
      btnStopRecord.style.display = 'none';
      btnDeleteRecord.style.display = 'inline-flex';
      btnAnalyzeRecord.style.display = 'inline-flex';
      recordingDot.classList.remove('active');
      recordingStatusText.textContent = 'Recording complete.';

      if (data && data.audioUrl) {
        recordedAudioPlayer.src = data.audioUrl;
        recordedAudioPlayer.style.display = 'block';
      }
    } else if (state === 'idle') {
      btnStartRecord.style.display = 'inline-flex';
      btnStartRecord.textContent = '🎙️ Start Recording';
      btnPauseRecord.style.display = 'none';
      btnStopRecord.style.display = 'none';
      btnDeleteRecord.style.display = 'none';
      btnAnalyzeRecord.style.display = 'none';
      recordingDot.classList.remove('active');
      recordingStatusText.textContent = 'Click Start Recording to record audio.';
      recordedAudioPlayer.style.display = 'none';
      recordedAudioPlayer.src = '';
    }
  }

  if (btnStartRecord) {
    btnStartRecord.addEventListener('click', () => recorderManager.startRecording());
    btnPauseRecord.addEventListener('click', () => {
      if (recorderManager.isPaused) {
        recorderManager.resumeRecording();
        btnPauseRecord.textContent = '⏸️ Pause';
      } else {
        recorderManager.pauseRecording();
      }
    });
    btnStopRecord.addEventListener('click', () => recorderManager.stopRecording());
    btnDeleteRecord.addEventListener('click', () => recorderManager.deleteRecording());
    
    btnAnalyzeRecord.addEventListener('click', () => {
      const textToAnalyze = transcriptInput.value.trim() || recorderManager.liveTranscriptText || 'Hello, I am calling from customer care. Your bank account will be blocked today itself. Share OTP immediately or police case will be filed.';
      runAnalysis(textToAnalyze, 'Live Voice Recording');
    });
  }

  // --- 3. Demo Preset Loading ---
  const demoSamples = [
    {
      name: 'Tanglish Bank Scam Sample',
      text: 'Hello sir, I am calling from SBI Bank customer support. Ungga account la suspicious transaction nadanthuruku, today itself account block aagum. Immediate ah pannunga, ungga phone ku vantha OTP sollunga to unblock.'
    },
    {
      name: 'FedEx Customs Fine Scam',
      text: 'Hello, I am calling from FedEx courier customs department. Your international parcel has illegal documents. Police case will be registered within 5 minutes unless you transfer Rs. 15000 fine via UPI immediately.'
    },
    {
      name: 'Legitimate Appointment Call',
      text: 'Good morning, this is a courtesy call from City Clinic to confirm your dentist appointment scheduled for tomorrow at 10 AM. Please reply YES to confirm.'
    }
  ];

  let currentDemoIndex = 0;

  if (btnTryDemo) {
    btnTryDemo.addEventListener('click', () => {
      const sample = demoSamples[currentDemoIndex];
      transcriptInput.value = sample.text;
      currentDemoIndex = (currentDemoIndex + 1) % demoSamples.length;
      runAnalysis(sample.text, sample.name);
    });
  }

  if (btnAnalyzeTranscript) {
    btnAnalyzeTranscript.addEventListener('click', () => {
      const text = transcriptInput.value.trim();
      if (!text) {
        alert('Please paste or enter a call transcript to analyze.');
        return;
      }
      runAnalysis(text, 'Manual Call Transcript');
    });
  }

  // --- 4. Main Analysis & UI Render ---
  function runAnalysis(transcriptText, sourceName) {
    // Perform AI analysis using ScamDetector module
    const result = ScamDetector.analyze(transcriptText);
    result.filename = sourceName;

    // Save to LocalStorage
    StorageManager.saveAnalysis(result);

    // Scroll to results & display
    resultsDashboard.style.display = 'block';
    resultsDashboard.scrollIntoView({ behavior: 'smooth' });

    // Animate Circular Gauge Score
    animateGauge(result.riskScore, result.gaugeColor);

    // Update Headings
    riskLevelHeading.textContent = result.riskLevel;
    riskLevelHeading.style.color = result.gaugeColor;

    riskBadge.className = `badge ${result.badgeClass}`;
    riskBadge.textContent = result.riskLevel;

    // Render Threat Categories Grid
    renderThreatGrid(result.threatCategories);

    // Render Dynamic Timeline
    renderTimeline(result.timeline);

    // Render Explanation Box
    explanationBox.innerHTML = `
      <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">🤖 AI Risk Assessment Explanation</h4>
      <p>${result.explanation}</p>
    `;

    // Render Safety Recommendations
    renderRecommendations(result.recommendations);
  }

  function animateGauge(score, color) {
    const circumference = 440;
    const offset = circumference - (circumference * score / 100);
    
    gaugeMeter.style.stroke = color;
    gaugeMeter.style.strokeDashoffset = offset;

    let current = 0;
    const duration = 1200;
    const stepTime = 20;
    const increment = score / (duration / stepTime);

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      gaugeScoreText.textContent = Math.round(current);
    }, stepTime);
  }

  function renderThreatGrid(categories) {
    threatGrid.innerHTML = categories.map(cat => `
      <div class="threat-card ${cat.detected ? 'detected' : ''}">
        <div class="threat-header">
          <span class="threat-name">${cat.icon} ${cat.name}</span>
          <span class="threat-confidence" style="color: ${cat.detected ? 'var(--risk-high)' : 'var(--text-dim)'}">
            ${cat.detected ? `${cat.confidence}% MATCH` : 'NOT DETECTED'}
          </span>
        </div>
        <p class="threat-desc">${cat.description}</p>
      </div>
    `).join('');
  }

  function renderTimeline(timelineEvents) {
    timelineList.innerHTML = timelineEvents.map(evt => `
      <div class="timeline-item ${evt.isHighRisk ? 'high-risk' : ''}">
        <span class="timeline-time">${evt.time}</span>
        <span>${evt.text}</span>
      </div>
    `).join('');
  }

  function renderRecommendations(recommendations) {
    recommendationsList.innerHTML = recommendations.map(rec => `
      <li>${rec}</li>
    `).join('');
  }
});
