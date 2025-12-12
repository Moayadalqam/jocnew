# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JOC Taekwondo Analyzer Pro - An AI-powered video analysis platform for the Jordan Olympic Committee. The platform provides biomechanical analysis of Taekwondo techniques using MediaPipe pose detection.

Built by QUALIA SOLUTIONS for Jordan Olympic Committee.

## Architecture

The project has two main implementations:

1. **React Frontend (primary, deployed on Vercel)**: Modern React/Vite SPA in `/frontend`
2. **Streamlit App (legacy)**: Python-based app in `app.py` (original prototype)
3. **Injury Prevention System**: Separate Streamlit dashboard in `/injury_prevention_system`

### Frontend Architecture (React)

- **Entry**: `frontend/src/main.jsx` → `App.jsx`
- **State**: React hooks with state lifted to App.jsx (analysisData, videoFile, athletes, sessions, annotations)
- **Styling**: TailwindCSS with custom JOC theme (joc-gold: #D4AF37, joc-dark: #1a1a2e)
- **Animations**: Framer Motion
- **Pose Detection**: MediaPipe via `usePoseDetection` hook (currently returns mock data - real integration needed)

**Key Components** (`frontend/src/components/`):
- `VideoAnalyzer.jsx`: Video upload, playback controls, pose analysis
- `BiomechanicsTab.jsx`: Joint angles, velocity, phase timing charts
- `ComparisonTab.jsx`: Side-by-side video comparison
- `InjuryPreventionTab.jsx`: ACL risk, knee valgus, fatigue monitoring
- `ScoringTab.jsx`: World Taekwondo scoring simulation
- `AIDetectionTab.jsx`: Automatic kick type recognition
- `MobileCameraTab.jsx`: Camera capture for mobile devices

**Data Flow**:
- `App.jsx` manages all shared state (analysisData, videoFile, athletes, sessions, annotations)
- State is passed down to child components via props
- Tab components receive and update state through props (e.g., `setAnalysisData`, `setAthletes`)

## Common Commands

### Frontend Development
```bash
cd frontend
npm install
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to frontend/dist
npm run preview  # Preview production build
```

### Streamlit Apps (Legacy/Alternative)
```bash
pip install -r requirements.txt
streamlit run app.py

# Injury Prevention Dashboard
cd injury_prevention_system
pip install -r requirements.txt
python run.py    # or: streamlit run dashboard.py
```

### Deployment (Vercel)
The project deploys via Vercel. See `vercel.json` for config:
- Build: `cd frontend && npm install && npm run build`
- Output: `frontend/dist`
- Framework: Vite

## Technical Notes

### Kick Types Supported
Dollyo Chagi (Roundhouse), Yeop Chagi (Side), Ap Chagi (Front), Dwi Chagi (Back), Naeryo Chagi (Axe), Dwi Huryeo Chagi (Spinning Hook), Bandae Dollyo (Reverse Roundhouse), Mom Dollyo Chagi (Tornado)

### MediaPipe Landmark Indices (used in pose analysis)
- Hips: LEFT_HIP=23, RIGHT_HIP=24
- Knees: LEFT_KNEE=25, RIGHT_KNEE=26
- Ankles: LEFT_ANKLE=27, RIGHT_ANKLE=28
- Shoulders: LEFT_SHOULDER=11, RIGHT_SHOULDER=12

### ACWR (Injury Prevention)
Acute:Chronic Workload Ratio thresholds:
- 0.8-1.3: Optimal zone
- 1.3-1.5: Elevated risk
- 1.5-2.0: High risk
- >2.0: Critical

### TailwindCSS Custom Theme
Defined in `frontend/tailwind.config.js`:
- `joc-gold`: #D4AF37
- `joc-dark`: #1a1a2e
- `joc-darker`: #16213e
- `joc-accent`: #0f3460
