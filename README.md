# VoxShield AI – Voice Scam Detection System

> **Tagline:** "Detect the voice. Understand the risk. Stay protected."

[![GitHub Pages Ready](https://img.shields.io/badge/Deployment-GitHub%20Pages-brightgreen)](https://pages.github.com/)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue)](#technology)
[![Zero Backend](https://img.shields.io/badge/Backend-None%20%28100%25%20Client--Side%29-orange)](#architecture)

---

## 📌 Problem Statement

Telephone-based voice scams (vishing), impersonation fraud, and social engineering attacks are rapidly escalating globally. Fraudsters frequently manipulate victims using artificial urgency, threats of legal action, impersonation of financial or law enforcement authorities, and high-pressure demands for One-Time Passwords (OTPs), PINs, or urgent wire transfers.

Many individuals—especially elderly or vulnerable callers—struggle to recognize deceptive social engineering patterns in real time during coercive phone calls.

---

## 🛡️ Solution

**VoxShield AI** is an innovative, privacy-first, client-side web platform designed to analyze suspicious voice calls, live microphone audio, and transcripts for voice scam indicators. 

Operating **100% inside the client browser** using Vanilla JavaScript, HTML5, Web Audio API, and MediaRecorder API, VoxShield AI calculates realistic heuristic risk scores (0–100), classifies threat categories, generates chronological event timelines, provides explainable AI summaries, and recommends immediate protective actions—without uploading user audio to external servers.

---

## ✨ Key Features

- **🎙️ Multi-Input Voice & Transcript Analyzer:**
  - **Audio File Upload:** Drag-and-drop support for MP3, WAV, M4A, OGG formats with metadata extraction (file name, size, duration) and waveform audio playback.
  - **Live Browser Microphone Recorder:** Record audio directly via `MediaRecorder API` with Start, Pause, Resume, Stop, Playback, and Delete controls.
  - **Web Audio API Frequency Visualizer:** Dynamic canvas spectrum visualizer rendering voice frequency waveforms during microphone recording.
  - **Browser Speech-to-Text:** Converts speech to live transcripts using `Web Speech API` with graceful fallback handling for unsupported browsers.
  - **Transcript Analyzer:** Text input area for pasting call transcripts directly.
  - **⚡ Demo Mode:** One-click instant evaluation using pre-configured high-risk Tanglish & English scam call scenarios.

- **🤖 Client-Side Risk Analysis Engine (`scamDetector.js`):**
  - **Multi-Vector Indicator Detection:** Scans text patterns across 6 core threat vectors:
    1. 🚨 **Urgency Manipulation** (*"immediately"*, *"within minutes"*, *"udane"*, *"act fast"*)
    2. 💳 **Financial Pressure** (*"money transfer"*, *"bank account"*, *"wire"*, *"panam"*)
    3. 🔐 **Credential Requests** (*"OTP"*, *"PIN"*, *"CVV"*, *"password"*, *"OTP sollunga"*)
    4. ⚠️ **Threat / Intimidation** (*"police case"*, *"account block"*, *"arrest"*, *"court"*)
    5. 👤 **Impersonation** (*"SBI officer"*, *"police manager"*, *"FedEx customs"*)
    6. 🎁 **Social Engineering / Rewards** (*"lottery winner"*, *"gift"*, *"cashback"*)
  - **Weighted Scoring Engine:** Calculates a capped 0–100 risk score with phrase deduplication:
    - `0 – 25` 🟢 **SAFE**
    - `26 – 50` 🔷 **LOW RISK**
    - `51 – 75` 🟧 **SUSPICIOUS**
    - `76 – 100` 🔴 **HIGH RISK**
  - **Multilingual Support:** Normalized dictionaries covering **English**, **Tamil**, and **Tanglish** scam dialects (e.g., *"account block aagum"*, *"immediate ah pannunga"*).

- **📊 AI Analysis Dashboard & Visuals:**
  - Animated SVG circular risk gauge ring.
  - Threat category grid cards with confidence percentages and indicators.
  - Chronological event timeline with estimated timestamps (e.g. `00:12 → Urgency detected`).
  - Dynamic AI summary explanation panel.
  - Actionable safety recommendations tailored to risk score levels.

- **📈 Analytics Dashboard & History:**
  - KPI metrics tracking total calls analyzed, high-risk counts, mean risk score, and detected threat totals.
  - Visual distribution breakdown charts built with CSS/SVG.
  - Interactive history log table stored in browser `localStorage`.
  - Detailed inspection modal popups for historical call reports.
  - Option to clear history and reset statistics.

- **🔒 Privacy-First Architecture:**
  - No user account or sign-up required.
  - Zero server databases or external tracking.
  - All audio processing and pattern recognition executed strictly on the client device.

---

## 🛠️ Technology Stack

- **HTML5:** Semantic structural markup, SVG vector graphics, HTML5 `<canvas>`, `<audio>`.
- **CSS3:** Custom properties (CSS variables), glassmorphism design system, flexbox/grid layouts, keyframe animations, mobile media queries.
- **Vanilla JavaScript (ES6+):** Modular OOP architecture, rule-based NLP regex engines, DOM manipulation.
- **Web Audio API & MediaRecorder API:** Real-time microphone audio capture, frequency analyzer nodes, canvas rendering.
- **Web Speech API:** Browser speech-to-text transcription service (`SpeechRecognition`).
- **LocalStorage API:** Client-side persistent data storage for history logs and analytics metrics.

---

## 📐 System Architecture

```text
  ┌─────────────────────────────────────────────────────────┐
  │                    VoxShield AI Web                     │
  └────────────────────────────┬────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌─────────────────┐
│ Audio Upload │       │ Live Mic Rec │       │ Text Transcript │
│ (MP3/WAV/OGG)│       │(MediaRecorder│       │  (Manual/Demo)  │
└──────┬───────┘       └──────┬───────┘       └────────┬────────┘
       │                      │                        │
       └──────────────────────┼────────────────────────┘
                              ▼
                ┌───────────────────────────┐
                │  Web Speech / Text Input  │
                └─────────────┬─────────────┘
                              ▼
                ┌───────────────────────────┐
                │     scamDetector.js       │
                │  (Multilingual NLP Match) │
                └─────────────┬─────────────┘
                              ▼
                ┌───────────────────────────┐
                │  Risk Score (0–100) &     │
                │  Threat Matrix Synthesis  │
                └─────────────┬─────────────┘
                              ▼
       ┌──────────────────────┼───────────────────────┐
       ▼                      ▼                       ▼
┌──────────────┐      ┌───────────────┐       ┌───────────────┐
│ Circular SVG │      │ Event Timeline│       │ Safety Action │
│ Risk Gauge   │      │  & AI Report  │       │ Recommendations│
└──────────────┘      └───────────────┘       └───────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    LocalStorage   │
                    │ (History & Stats) │
                    └───────────────────┘
```

---

## ⚡ How It Works

1. **Input Selection:** The user uploads an audio file, starts microphone recording, pastes a call transcript, or clicks **"Try Demo"**.
2. **Speech Recognition:** Live microphone speech is converted into transcript text via the browser's native Web Speech API.
3. **Pattern Analysis:** `scamDetector.js` normalizes the text and evaluates indicators across 6 threat vectors (Urgency, Financial, Credential, Threat, Impersonation, Social Engineering).
4. **Risk Calculation:** Weighted scores are aggregated (capped at 100) and assigned a risk tier (SAFE, LOW RISK, SUSPICIOUS, HIGH RISK).
5. **Dashboard Rendering:** The UI dynamically animates the circular gauge, populates threat cards, renders timestamped timeline events, synthesizes an AI explanation, and presents security recommendations.
6. **Local Persistence:** Results are automatically indexed in `localStorage` for dashboard metrics and history inspection.

---

## 🚀 Installation & Local Setup

Because VoxShield AI uses strictly static client-side web technologies, **no backend, node modules, build tools, or database servers are required.**

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/voxshield-ai.git
   ```
2. Open the project folder:
   ```bash
   cd voxshield-ai
   ```
3. Double-click `index.html` or launch it using any web browser (Chrome, Edge, Safari, Firefox).

---

## 🌐 GitHub Pages Deployment Guide

VoxShield AI is **100% GitHub Pages compatible**.

### Step-by-Step Deployment:
1. Create a public repository on GitHub (e.g. `voxshield-ai`).
2. Push all project files (`index.html`, `analyzer.html`, `dashboard.html`, `history.html`, `css/`, `js/`, `assets/`, `README.md`).
3. On GitHub, navigate to:
   **Repository Settings** → **Pages** (under Code and automation).
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Choose `main` (or `master`) branch and `/ (root)` directory.
   - Click **Save**.
5. After 1–2 minutes, your website will be live at:
   `https://<your-username>.github.io/voxshield-ai/`

---

## ⚠️ Disclaimer & Limitations

> [!NOTE]
> **Prototype & Heuristic Scope:**  
> VoxShield AI is a client-side web prototype developed for hackathon and educational demonstration purposes. The risk score is derived from client-side heuristic pattern matching and keyword dictionaries. Production-grade commercial scam protection requires trained neural speech models, acoustic feature extraction, multi-layered NLP pipelines, larger voice datasets, and phone carrier integration.

---

## 🔮 Future Enhancements & Roadmap

- [ ] **Deepfake & Synthetic Voice Detection:** Integration of spectral audio classifier models to detect AI-generated voice clones.
- [ ] **Real-Time Acoustic Prosody Analysis:** Pitch, stress, and hesitation jitter detection using WebAssembly (Wasm).
- [ ] **Expanded Multilingual Dictionaries:** Extended support for Hindi, Telugu, Kannada, Bengali, and regional dialects.
- [ ] **Federated On-Device Learning:** Privacy-preserving crowdsourced scam pattern intelligence.
- [ ] **Real-Time Call Overlay:** Mobile companion app for live caller ID protection.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
