/* VoxShield AI - Recorder, Web Audio API Visualizer & Speech Recognition */

class AudioRecorderManager {
  constructor(options = {}) {
    this.canvasId = options.canvasId || 'waveformCanvas';
    this.onTranscriptUpdate = options.onTranscriptUpdate || null;
    this.onStateChange = options.onStateChange || null;

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioUrl = null;
    
    this.audioContext = null;
    this.analyserNode = null;
    this.animFrameId = null;
    this.stream = null;

    this.speechRecognition = null;
    this.isRecording = false;
    this.isPaused = false;
    this.liveTranscriptText = '';

    this.initCanvas();
    this.initSpeechRecognition();
  }

  initCanvas() {
    this.canvas = document.getElementById(this.canvasId);
    if (this.canvas) {
      this.canvasCtx = this.canvas.getContext('2d');
      this.drawIdleWaveform();
    }
  }

  // Web Speech API Initialization
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        this.liveTranscriptText = transcript.trim();
        if (typeof this.onTranscriptUpdate === 'function') {
          this.onTranscriptUpdate(this.liveTranscriptText);
        }
      };

      this.speechRecognition.onerror = (event) => {
        console.warn('Speech Recognition notice/error:', event.error);
      };
    } else {
      console.log('Web Speech API is not supported in this browser environment.');
    }
  }

  isSpeechSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Microphone Permission & Start Recording
  async startRecording() {
    try {
      this.audioChunks = [];
      this.liveTranscriptText = '';
      
      // Request mic permission only now
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        this.stopAudioContext();
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.isPaused = false;

      // Start Web Audio API Visualizer
      this.startAudioContext(this.stream);

      // Start Speech Recognition if supported
      if (this.speechRecognition) {
        try {
          this.speechRecognition.start();
        } catch (e) {
          console.warn('Speech recognition start fallback:', e);
        }
      }

      this.notifyState('recording');
      return true;
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Microphone permission was denied or is unavailable on your device.');
      this.notifyState('error');
      return false;
    }
  }

  pauseRecording() {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      if (this.speechRecognition) {
        try { this.speechRecognition.stop(); } catch (e) {}
      }
      this.notifyState('paused');
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
      if (this.speechRecognition) {
        try { this.speechRecognition.start(); } catch (e) {}
      }
      this.notifyState('recording');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;

      // Stop mic stream tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      if (this.speechRecognition) {
        try { this.speechRecognition.stop(); } catch (e) {}
      }

      this.notifyState('stopped');
    }
  }

  deleteRecording() {
    this.stopRecording();
    this.audioChunks = [];
    this.audioBlob = null;
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
    this.liveTranscriptText = '';
    this.drawIdleWaveform();
    this.notifyState('idle');
  }

  // Web Audio Visualizer Canvas
  startAudioContext(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 64;
      source.connect(this.analyserNode);

      this.renderWaveform();
    } catch (e) {
      console.warn('AudioContext visualization setup warning:', e);
    }
  }

  stopAudioContext() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
    }
    this.drawIdleWaveform();
  }

  renderWaveform() {
    if (!this.canvas || !this.analyserNode || !this.isRecording || this.isPaused) {
      this.drawIdleWaveform();
      return;
    }

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);

    const width = this.canvas.width;
    const height = this.canvas.height;
    this.canvasCtx.clearRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      
      const gradient = this.canvasCtx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#00f2fe');
      gradient.addColorStop(0.5, '#7f53ac');
      gradient.addColorStop(1, '#ff0844');

      this.canvasCtx.fillStyle = gradient;
      this.canvasCtx.fillRect(x, (height - barHeight) / 2, barWidth - 2, barHeight);

      x += barWidth;
    }

    this.animFrameId = requestAnimationFrame(() => this.renderWaveform());
  }

  drawIdleWaveform() {
    if (!this.canvasCtx || !this.canvas) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.canvasCtx.clearRect(0, 0, width, height);

    // Draw futuristic ambient static wave
    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(0, height / 2);
    for (let i = 0; i < width; i += 10) {
      const y = height / 2 + Math.sin(i * 0.05) * 6;
      this.canvasCtx.lineTo(i, y);
    }
    this.canvasCtx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.stroke();
  }

  notifyState(state) {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(state, {
        audioUrl: this.audioUrl,
        audioBlob: this.audioBlob,
        transcript: this.liveTranscriptText
      });
    }
  }
}
