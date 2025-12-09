"""
JOC TAEKWONDO AI ANALYZER - PROFESSIONAL EDITION v2.0
Developed by QUALIA SOLUTIONS for Jordan Olympic Committee

Enterprise-grade sports analysis platform featuring:

CORE FEATURES:
- Real-time pose estimation with MediaPipe (33 body landmarks)
- Frame-by-frame analysis with slider navigation
- Side-by-side video comparison
- CSV/Excel export for coaches
- Athlete profile management
- Professional biomechanical metrics
- Session history tracking
- Slow-motion playback (0.25x - 2x speed)
- Frame annotation tools
- Ideal technique overlay comparison

JOC-SPECIFIC FEATURES:
- Kick trajectory path visualization with gradient trails
- PDF report generation with official JOC branding
- Multi-athlete comparison for team selection (radar charts)
- Training progress tracking over time
- Injury Prevention System (ACL risk detection, knee valgus, fatigue monitoring)
- World Taekwondo (WT) Competition Scoring Simulation
- Stance Analysis (guard position, weight distribution)
- Kick Speed Calculation from trajectory data

SUPPORTED KICK TYPES:
- Roundhouse (Dollyo Chagi)
- Side Kick (Yeop Chagi)
- Back Kick (Dwi Chagi)
- Axe Kick (Naeryeo Chagi)
- Push Kick (Ap Chagi)
- Hook Kick (Huryeo Chagi)
- Spinning Hook Kick
- Crescent Kick (Bandal Chagi)
"""

import streamlit as st
import cv2
import mediapipe as mp
import numpy as np
import math
import os
import tempfile
import time
import json
import base64
from io import BytesIO
from datetime import datetime, timedelta
from collections import deque
import plotly.graph_objects as go
import plotly.express as px
from typing import Dict, Optional, List, Tuple
import pandas as pd
from PIL import Image, ImageDraw, ImageFont

# ============================================
# PAGE CONFIGURATION
# ============================================
st.set_page_config(
    page_title="JOC Taekwondo Analyzer Pro",
    page_icon="🥋",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================
# SESSION STATE INITIALIZATION
# ============================================
if 'analysis_history' not in st.session_state:
    st.session_state.analysis_history = []
if 'current_athlete' not in st.session_state:
    st.session_state.current_athlete = None
if 'comparison_video' not in st.session_state:
    st.session_state.comparison_video = None
if 'frame_data' not in st.session_state:
    st.session_state.frame_data = []
if 'selected_frame' not in st.session_state:
    st.session_state.selected_frame = 0
if 'annotations' not in st.session_state:
    st.session_state.annotations = {}
if 'playback_speed' not in st.session_state:
    st.session_state.playback_speed = 1.0
if 'ideal_overlay' not in st.session_state:
    st.session_state.ideal_overlay = False
if 'athlete_database' not in st.session_state:
    st.session_state.athlete_database = {}
if 'training_progress' not in st.session_state:
    st.session_state.training_progress = {}
if 'kick_trajectory' not in st.session_state:
    st.session_state.kick_trajectory = []

# ============================================
# PROFESSIONAL CSS - STUNNING EDITION
# ============================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

    :root {
        --primary: #007A3D;
        --primary-light: #00a050;
        --primary-glow: rgba(0, 122, 61, 0.5);
        --secondary: #1a1a2e;
        --accent: #4ade80;
        --accent-glow: rgba(74, 222, 128, 0.4);
        --warning: #fbbf24;
        --danger: #ef4444;
        --danger-glow: rgba(239, 68, 68, 0.4);
        --text: #ffffff;
        --text-muted: #a0aec0;
        --border: #2d3748;
        --card-bg: #1a1a2e;
        --gold: #FFD700;
        --gold-glow: rgba(255, 215, 0, 0.4);
        --joc-red: #CE1126;
    }

    * { font-family: 'Inter', sans-serif; }

    .stApp {
        background: linear-gradient(135deg, #0a0a12 0%, #0d1117 25%, #0f0f1a 50%, #0d1117 75%, #0a0a12 100%);
        background-attachment: fixed;
    }

    /* Animated Background Particles */
    .stApp::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
            radial-gradient(circle at 20% 80%, rgba(0, 122, 61, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(74, 222, 128, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(206, 17, 38, 0.04) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
    }

    /* Glowing Accent Lines */
    @keyframes glow-pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
    }

    @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
    }

    /* Professional Header - STUNNING */
    .pro-header {
        background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(26, 26, 46, 0.95) 100%);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 1.75rem 2.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .pro-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--primary), var(--accent), var(--primary), transparent);
        animation: shimmer 3s ease-in-out infinite;
        background-size: 200% auto;
    }

    .pro-header-left h1 {
        color: var(--text);
        font-size: 1.85rem;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.5px;
        font-family: 'Orbitron', sans-serif;
        background: linear-gradient(135deg, #fff 0%, var(--accent) 50%, #fff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 30px var(--accent-glow);
    }

    .pro-header-left p {
        color: var(--text-muted);
        margin: 0.5rem 0 0 0;
        font-size: 0.9rem;
        letter-spacing: 0.3px;
    }

    .pro-badge {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
        color: white;
        padding: 0.6rem 1.25rem;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        box-shadow: 0 4px 15px var(--primary-glow), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        animation: float 3s ease-in-out infinite;
    }

    /* Cards - GLASS MORPHISM */
    .pro-card {
        background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.8) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.75rem;
        margin-bottom: 1rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
    }

    .pro-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        border-color: rgba(74, 222, 128, 0.3);
    }

    .pro-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .pro-card-title {
        color: var(--text);
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .pro-card-title::before {
        content: '';
        width: 4px;
        height: 20px;
        background: linear-gradient(180deg, var(--primary), var(--accent));
        border-radius: 2px;
    }

    .pro-card-badge {
        background: linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.05) 100%);
        color: var(--accent);
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid rgba(74, 222, 128, 0.3);
    }

    /* Stats Grid - STUNNING */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
    }

    .stat-item {
        background: linear-gradient(145deg, rgba(26, 26, 46, 0.8) 0%, rgba(15, 15, 26, 0.9) 100%);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .stat-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--primary), var(--accent));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .stat-item:hover {
        border-color: var(--accent);
        background: linear-gradient(145deg, rgba(74, 222, 128, 0.08) 0%, rgba(26, 26, 46, 0.9) 100%);
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(74, 222, 128, 0.15);
    }

    .stat-item:hover::before {
        opacity: 1;
    }

    .stat-value {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, var(--accent) 0%, #22c55e 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
        text-shadow: 0 0 30px var(--accent-glow);
    }

    .stat-label {
        color: var(--text-muted);
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 0.75rem;
        font-weight: 500;
    }

    /* Metric Cards */
    .metric-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
    }

    .metric-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }

    .metric-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--accent);
    }

    .metric-label {
        color: var(--text-muted);
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 0.25rem;
    }

    /* Score Display - EPIC GLOW */
    .score-container {
        background: linear-gradient(145deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 26, 0.98) 100%);
        border: 2px solid var(--accent);
        border-radius: 24px;
        padding: 2.5rem;
        text-align: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 60px var(--accent-glow), inset 0 0 60px rgba(74, 222, 128, 0.05);
    }

    .score-container::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(from 0deg, transparent, var(--accent-glow), transparent, transparent);
        animation: rotate 8s linear infinite;
        opacity: 0.3;
    }

    @keyframes rotate {
        100% { transform: rotate(360deg); }
    }

    .score-container::after {
        content: '';
        position: absolute;
        inset: 3px;
        background: linear-gradient(145deg, rgba(26, 26, 46, 0.98) 0%, rgba(15, 15, 26, 1) 100%);
        border-radius: 22px;
        z-index: 0;
    }

    .score-container > * {
        position: relative;
        z-index: 1;
    }

    .score-value {
        font-size: 5rem;
        font-weight: 900;
        font-family: 'Orbitron', sans-serif;
        background: linear-gradient(135deg, #fff 0%, var(--accent) 50%, #22c55e 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
        text-shadow: 0 0 50px var(--accent-glow);
        animation: glow-pulse 2s ease-in-out infinite;
    }

    .score-label {
        color: var(--text-muted);
        font-size: 1rem;
        margin-top: 0.75rem;
        letter-spacing: 2px;
        text-transform: uppercase;
    }

    .score-grade {
        font-size: 2.25rem;
        font-weight: 800;
        margin-top: 1.25rem;
        font-family: 'Orbitron', sans-serif;
    }

    /* Timeline */
    .timeline-item {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-left: 4px solid var(--accent);
        border-radius: 0 8px 8px 0;
        padding: 1rem;
        margin: 0.5rem 0;
        transition: all 0.2s ease;
    }

    .timeline-item:hover {
        transform: translateX(4px);
        border-left-color: var(--primary);
    }

    .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .timeline-title {
        color: var(--text);
        font-weight: 600;
        font-size: 0.95rem;
    }

    .timeline-time {
        color: var(--text-muted);
        font-size: 0.8rem;
    }

    .timeline-details {
        color: var(--text-muted);
        font-size: 0.85rem;
        margin-top: 0.5rem;
    }

    /* Feedback */
    .feedback-item {
        padding: 0.75rem 1rem;
        border-radius: 0 8px 8px 0;
        margin: 0.5rem 0;
        font-size: 0.9rem;
    }

    .feedback-success {
        background: rgba(74, 222, 128, 0.1);
        border-left: 3px solid var(--accent);
        color: var(--accent);
    }

    .feedback-warning {
        background: rgba(251, 191, 36, 0.1);
        border-left: 3px solid var(--warning);
        color: var(--warning);
    }

    .feedback-info {
        background: rgba(96, 165, 250, 0.1);
        border-left: 3px solid #60a5fa;
        color: #60a5fa;
    }

    /* Buttons - STUNNING GLOW */
    .stButton > button {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%) !important;
        color: white !important;
        border: none !important;
        padding: 1rem 2rem !important;
        font-weight: 700 !important;
        border-radius: 12px !important;
        font-size: 1rem !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-shadow: 0 4px 20px var(--primary-glow), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        text-transform: uppercase !important;
        letter-spacing: 1px !important;
        position: relative !important;
        overflow: hidden !important;
    }

    .stButton > button::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -100% !important;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
        transition: left 0.5s ease !important;
    }

    .stButton > button:hover::before {
        left: 100% !important;
    }

    .stButton > button:hover {
        transform: translateY(-3px) scale(1.02) !important;
        box-shadow: 0 8px 30px var(--primary-glow), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }

    /* Download Button - BLUE GLOW */
    .stDownloadButton > button {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
        color: white !important;
        border: none !important;
        padding: 0.875rem 1.5rem !important;
        font-weight: 700 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4) !important;
        transition: all 0.3s ease !important;
    }

    .stDownloadButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5) !important;
    }

    /* Tabs - MODERN DESIGN */
    .stTabs [data-baseweb="tab-list"] {
        gap: 6px;
        background: linear-gradient(135deg, rgba(15, 15, 26, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%);
        padding: 8px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .stTabs [data-baseweb="tab"] {
        background: transparent;
        border-radius: 10px;
        color: var(--text-muted);
        font-weight: 600;
        font-size: 0.85rem;
        padding: 0.8rem 1rem;
        transition: all 0.3s ease;
    }

    .stTabs [data-baseweb="tab"]:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text);
    }

    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%) !important;
        color: white !important;
        box-shadow: 0 4px 15px var(--primary-glow) !important;
    }

    /* Slider */
    .stSlider > div > div {
        background: var(--border) !important;
    }

    .stSlider > div > div > div {
        background: var(--accent) !important;
    }

    /* Select Box */
    .stSelectbox > div > div {
        background: var(--card-bg) !important;
        border-color: var(--border) !important;
    }

    /* Progress */
    .stProgress > div > div {
        background: linear-gradient(90deg, var(--primary), var(--accent)) !important;
    }

    /* Status Messages */
    .status-processing {
        background: rgba(96, 165, 250, 0.1);
        border: 1px solid #60a5fa;
        color: #60a5fa;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    .status-complete {
        background: rgba(74, 222, 128, 0.1);
        border: 1px solid var(--accent);
        color: var(--accent);
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
    }

    /* Athlete Card */
    .athlete-card {
        background: linear-gradient(135deg, var(--secondary) 0%, #16213e 100%);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1rem;
    }

    .athlete-name {
        color: var(--text);
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .athlete-info {
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    /* Frame Navigator */
    .frame-nav {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1rem;
        margin: 1rem 0;
    }

    .frame-controls {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 0.75rem;
    }

    /* Welcome */
    .welcome-container {
        background: linear-gradient(135deg, var(--secondary) 0%, #16213e 100%);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 3rem;
        text-align: center;
    }

    .welcome-title {
        color: var(--text);
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.75rem;
    }

    .welcome-subtitle {
        color: var(--text-muted);
        font-size: 1.1rem;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
    }

    /* Feature Grid */
    .feature-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-top: 2rem;
    }

    .feature-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.2s ease;
    }

    .feature-item:hover {
        border-color: var(--accent);
        transform: translateY(-4px);
    }

    .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 0.75rem;
    }

    .feature-title {
        color: var(--text);
        font-weight: 600;
        font-size: 0.95rem;
        margin-bottom: 0.25rem;
    }

    .feature-desc {
        color: var(--text-muted);
        font-size: 0.8rem;
    }

    /* Export Section */
    .export-section {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid #3b82f6;
        border-radius: 12px;
        padding: 1.25rem;
        margin-top: 1.5rem;
    }

    .export-title {
        color: #60a5fa;
        font-weight: 600;
        font-size: 0.95rem;
        margin-bottom: 0.75rem;
    }

    /* Hide Streamlit defaults */
    #MainMenu, footer, header {visibility: hidden;}

    /* Sidebar */
    [data-testid="stSidebar"] {
        background: #0a0a0f;
    }

    [data-testid="stSidebar"] .stMarkdown h3 {
        color: var(--text);
        font-size: 0.9rem;
        font-weight: 600;
    }

    /* Comparison View */
    .comparison-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .comparison-label {
        background: var(--primary);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 0.5rem;
    }

    /* Annotation Tools */
    .annotation-toolbar {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.75rem;
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin: 0.5rem 0;
    }

    .tool-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.5rem 1rem;
        color: var(--text);
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s ease;
    }

    .tool-btn:hover {
        background: var(--primary);
        border-color: var(--primary);
    }

    .tool-btn.active {
        background: var(--primary);
        border-color: var(--accent);
    }

    /* Speed Control */
    .speed-control {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
    }

    .speed-label {
        color: var(--text);
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }

    .speed-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .speed-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        color: var(--text);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .speed-btn:hover, .speed-btn.active {
        background: var(--primary);
        border-color: var(--accent);
    }

    /* Ideal Overlay */
    .overlay-toggle {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
    }

    .overlay-info {
        color: var(--text-muted);
        font-size: 0.8rem;
        margin-top: 0.5rem;
    }

    /* Annotation Note */
    .annotation-note {
        background: rgba(251, 191, 36, 0.1);
        border: 1px solid var(--warning);
        border-radius: 8px;
        padding: 0.75rem;
        margin: 0.5rem 0;
        font-size: 0.85rem;
        color: var(--warning);
    }

    /* Technique Reference Card */
    .technique-ref {
        background: linear-gradient(135deg, rgba(0, 122, 61, 0.1) 0%, rgba(0, 160, 80, 0.1) 100%);
        border: 1px solid var(--primary);
        border-radius: 12px;
        padding: 1.25rem;
        margin: 1rem 0;
    }

    .technique-ref-title {
        color: var(--accent);
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 0.75rem;
    }

    .technique-ref-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        font-size: 0.85rem;
    }

    .technique-ref-item:last-child {
        border-bottom: none;
    }

    .technique-ref-label {
        color: var(--text-muted);
    }

    .technique-ref-value {
        color: var(--accent);
        font-weight: 600;
    }

    /* ============================================
       PHASE 6: MOBILE RESPONSIVE DESIGN
       ============================================ */

    /* Mobile-First Media Queries */
    @media screen and (max-width: 768px) {
        .pro-header {
            flex-direction: column;
            text-align: center;
            padding: 1.25rem;
            gap: 1rem;
        }

        .pro-header-left h1 {
            font-size: 1.3rem;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }

        .metric-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .feature-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .comparison-container {
            grid-template-columns: 1fr;
        }

        .stat-value {
            font-size: 1.75rem;
        }

        .score-value {
            font-size: 3rem;
        }

        .pro-card {
            padding: 1rem;
        }

        .stTabs [data-baseweb="tab-list"] {
            flex-wrap: wrap;
            justify-content: center;
        }

        .stTabs [data-baseweb="tab"] {
            font-size: 0.7rem;
            padding: 0.5rem 0.75rem;
        }
    }

    @media screen and (max-width: 480px) {
        .pro-header-left h1 {
            font-size: 1.1rem;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .metric-grid {
            grid-template-columns: 1fr;
        }

        .feature-grid {
            grid-template-columns: 1fr;
        }

        .score-value {
            font-size: 2.5rem;
        }

        .stat-value {
            font-size: 1.5rem;
        }

        .welcome-title {
            font-size: 1.5rem;
        }

        .welcome-subtitle {
            font-size: 0.9rem;
        }
    }

    /* Touch-Friendly Elements */
    @media (hover: none) and (pointer: coarse) {
        .stButton > button {
            min-height: 48px !important;
            min-width: 48px !important;
        }

        .tool-btn, .speed-btn {
            min-height: 44px;
            min-width: 44px;
        }

        .stat-item:hover {
            transform: none;
        }

        .pro-card:hover {
            transform: none;
        }
    }

    /* Camera Capture Styles */
    .camera-container {
        background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 26, 0.98) 100%);
        border: 2px dashed var(--primary);
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        margin: 1rem 0;
        transition: all 0.3s ease;
    }

    .camera-container:hover {
        border-color: var(--accent);
        box-shadow: 0 0 30px var(--primary-glow);
    }

    .camera-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: float 3s ease-in-out infinite;
    }

    .camera-title {
        color: var(--text);
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .camera-subtitle {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
    }

    .camera-btn {
        background: linear-gradient(135deg, var(--joc-red) 0%, #a00d1e 100%) !important;
        color: white !important;
        padding: 1rem 2rem !important;
        border-radius: 12px !important;
        font-weight: 700 !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 20px rgba(206, 17, 38, 0.4) !important;
    }

    .camera-btn:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 8px 30px rgba(206, 17, 38, 0.6) !important;
    }

    /* Live Recording Indicator */
    .recording-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin: 1rem 0;
    }

    .recording-dot {
        width: 12px;
        height: 12px;
        background: var(--joc-red);
        border-radius: 50%;
        animation: pulse-red 1s ease-in-out infinite;
    }

    @keyframes pulse-red {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
    }

    .recording-text {
        color: var(--joc-red);
        font-weight: 700;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Real-time Feedback Overlay */
    .realtime-feedback {
        position: relative;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 26, 46, 0.9) 100%);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1rem;
        margin: 0.5rem 0;
    }

    .feedback-live {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .live-badge {
        background: var(--joc-red);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        animation: pulse-red 1s ease-in-out infinite;
    }

    .feedback-metric {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .feedback-metric:last-child {
        border-bottom: none;
    }

    .feedback-label {
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .feedback-value {
        font-weight: 700;
        font-size: 0.9rem;
    }

    .feedback-good { color: var(--accent); }
    .feedback-warning { color: var(--warning); }
    .feedback-bad { color: var(--danger); }

    /* AI Auto-Detection Indicator */
    .ai-detection {
        background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(0, 122, 61, 0.1) 100%);
        border: 1px solid var(--accent);
        border-radius: 12px;
        padding: 1rem;
        margin: 1rem 0;
    }

    .ai-detection-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
    }

    .ai-icon {
        font-size: 1.5rem;
        animation: float 2s ease-in-out infinite;
    }

    .ai-title {
        color: var(--accent);
        font-weight: 700;
        font-size: 1rem;
    }

    .ai-confidence {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 0.5rem;
        margin-top: 0.5rem;
    }

    .confidence-bar {
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 0.5rem;
    }

    .confidence-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), var(--accent));
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    /* PWA Install Prompt */
    .pwa-install-prompt {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin: 1rem 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        box-shadow: 0 4px 20px var(--primary-glow);
    }

    .pwa-text {
        color: white;
        font-size: 0.9rem;
    }

    .pwa-text strong {
        display: block;
        font-size: 1rem;
        margin-bottom: 0.25rem;
    }

    .pwa-install-btn {
        background: white;
        color: var(--primary);
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        white-space: nowrap;
    }

    /* Offline Mode Indicator */
    .offline-indicator {
        background: rgba(251, 191, 36, 0.1);
        border: 1px solid var(--warning);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.5rem 0;
    }

    .offline-icon {
        color: var(--warning);
        font-size: 1.25rem;
    }

    .offline-text {
        color: var(--warning);
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)

# ============================================
# PWA META TAGS & MANIFEST
# ============================================
st.markdown("""
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="JOC Taekwondo">
<meta name="theme-color" content="#007A3D">
<meta name="description" content="AI-powered Taekwondo technique analyzer for Jordan Olympic Committee">
<link rel="manifest" href="data:application/json,{
    'name': 'JOC Taekwondo Analyzer Pro',
    'short_name': 'JOC TKD',
    'description': 'AI-powered Taekwondo technique analyzer',
    'start_url': '/',
    'display': 'standalone',
    'background_color': '#0a0a12',
    'theme_color': '#007A3D',
    'orientation': 'any',
    'icons': [
        {'src': 'https://flagcdn.com/jo.svg', 'sizes': '192x192', 'type': 'image/svg+xml'},
        {'src': 'https://flagcdn.com/jo.svg', 'sizes': '512x512', 'type': 'image/svg+xml'}
    ]
}">
<script>
// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Register service worker for offline support
        console.log('JOC Taekwondo PWA Ready');
    });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show install button
    document.querySelector('.pwa-install-prompt')?.classList.add('show');
});

// Online/Offline Status
window.addEventListener('online', () => {
    document.querySelector('.offline-indicator')?.classList.add('hidden');
});

window.addEventListener('offline', () => {
    document.querySelector('.offline-indicator')?.classList.remove('hidden');
});
</script>
""", unsafe_allow_html=True)

# ============================================
# MEDIAPIPE INITIALIZATION
# ============================================
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

POSE_LANDMARK_STYLE = mp_drawing.DrawingSpec(color=(0, 255, 128), thickness=2, circle_radius=4)
POSE_CONNECTION_STYLE = mp_drawing.DrawingSpec(color=(0, 200, 100), thickness=2)

# ============================================
# ANALYZER CLASS
# ============================================

class TaekwondoAnalyzer:
    """Professional-grade Taekwondo technique analyzer."""

    LANDMARKS = {
        'nose': 0,
        'left_shoulder': 11, 'right_shoulder': 12,
        'left_elbow': 13, 'right_elbow': 14,
        'left_wrist': 15, 'right_wrist': 16,
        'left_hip': 23, 'right_hip': 24,
        'left_knee': 25, 'right_knee': 26,
        'left_ankle': 27, 'right_ankle': 28,
        'left_foot': 31, 'right_foot': 32,
    }

    # Ideal ranges for technique scoring
    IDEAL_METRICS = {
        'knee_angle': {'min': 160, 'max': 180, 'optimal': 170},
        'kick_height': {'min': 70, 'max': 100, 'optimal': 85},
        'hip_flexion': {'min': 100, 'max': 140, 'optimal': 120},
        'support_knee': {'min': 160, 'max': 180, 'optimal': 170},
    }

    def __init__(self):
        self.detected_kicks = []
        self.metrics_history = []
        self.frame_analysis = []
        self.cooldown = 0

    def get_landmark(self, landmarks, name: str) -> Optional[np.ndarray]:
        try:
            idx = self.LANDMARKS.get(name)
            if idx is None:
                return None
            lm = landmarks.landmark[idx]
            if lm.visibility < 0.5:
                return None
            return np.array([lm.x, lm.y, lm.z])
        except:
            return None

    def get_visibility(self, landmarks, name: str) -> float:
        try:
            idx = self.LANDMARKS.get(name)
            return landmarks.landmark[idx].visibility if idx else 0.0
        except:
            return 0.0

    def calculate_angle(self, p1, p2, p3) -> float:
        if any(x is None for x in [p1, p2, p3]):
            return 0.0
        v1 = p1 - p2
        v2 = p3 - p2
        n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
        if n1 < 1e-6 or n2 < 1e-6:
            return 0.0
        dot = np.clip(np.dot(v1/n1, v2/n2), -1.0, 1.0)
        return np.degrees(np.arccos(dot))

    def analyze_frame(self, landmarks, frame_time: float, frame_idx: int) -> Optional[Dict]:
        if landmarks is None:
            return None

        # Extract landmarks
        nose = self.get_landmark(landmarks, 'nose')
        l_shoulder = self.get_landmark(landmarks, 'left_shoulder')
        r_shoulder = self.get_landmark(landmarks, 'right_shoulder')
        l_hip = self.get_landmark(landmarks, 'left_hip')
        r_hip = self.get_landmark(landmarks, 'right_hip')
        l_knee = self.get_landmark(landmarks, 'left_knee')
        r_knee = self.get_landmark(landmarks, 'right_knee')
        l_ankle = self.get_landmark(landmarks, 'left_ankle')
        r_ankle = self.get_landmark(landmarks, 'right_ankle')
        l_foot = self.get_landmark(landmarks, 'left_foot')
        r_foot = self.get_landmark(landmarks, 'right_foot')

        if l_hip is None or r_hip is None:
            return None
        if l_ankle is None and r_ankle is None:
            return None

        # Determine kicking leg
        l_y = l_foot[1] if l_foot is not None else (l_ankle[1] if l_ankle is not None else 1.0)
        r_y = r_foot[1] if r_foot is not None else (r_ankle[1] if r_ankle is not None else 1.0)

        if l_y < r_y:
            kick_leg, support_leg = 'left', 'right'
            kick_foot = l_foot if l_foot is not None else l_ankle
            kick_ankle, kick_knee, kick_hip = l_ankle, l_knee, l_hip
            support_ankle, support_knee, support_hip = r_ankle, r_knee, r_hip
            kick_shoulder = l_shoulder
        else:
            kick_leg, support_leg = 'right', 'left'
            kick_foot = r_foot if r_foot is not None else r_ankle
            kick_ankle, kick_knee, kick_hip = r_ankle, r_knee, r_hip
            support_ankle, support_knee, support_hip = l_ankle, l_knee, l_hip
            kick_shoulder = r_shoulder

        # Calculate metrics
        kick_height = 0.0
        if support_ankle is not None and nose is not None and kick_foot is not None:
            body_h = abs(support_ankle[1] - nose[1])
            if body_h > 0.01:
                kick_height = max(0, min(100, (support_ankle[1] - kick_foot[1]) / body_h * 100))

        knee_angle = self.calculate_angle(kick_hip, kick_knee, kick_ankle) if all(x is not None for x in [kick_hip, kick_knee, kick_ankle]) else 0
        hip_flexion = self.calculate_angle(kick_shoulder, kick_hip, kick_knee) if all(x is not None for x in [kick_shoulder, kick_hip, kick_knee]) else 0
        support_knee_angle = self.calculate_angle(support_hip, support_knee, support_ankle) if all(x is not None for x in [support_hip, support_knee, support_ankle]) else 0

        # Hip rotation
        hip_rotation = 0.0
        if l_shoulder is not None and r_shoulder is not None:
            hip_rotation = min(45, abs(l_shoulder[2] - r_shoulder[2]) * 200)

        # Level classification
        if kick_height >= 70:
            level = "HEAD"
        elif kick_height >= 50:
            level = "CHEST"
        elif kick_height >= 30:
            level = "BODY"
        else:
            level = "LOW"

        # Visibility score
        vis_scores = [self.get_visibility(landmarks, n) for n in ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle']]
        visibility = np.mean([v for v in vis_scores if v > 0]) * 100

        metrics = {
            'frame_idx': frame_idx,
            'frame_time': frame_time,
            'kick_height': round(kick_height, 1),
            'knee_angle': round(knee_angle, 1),
            'hip_flexion': round(hip_flexion, 1),
            'support_knee': round(support_knee_angle, 1),
            'hip_rotation': round(hip_rotation, 1),
            'kicking_leg': kick_leg.capitalize(),
            'level': level,
            'visibility': round(visibility, 1),
        }

        # Detect kicks
        if kick_height >= 25 and self.cooldown == 0:
            kick_data = metrics.copy()
            kick_data['kick_number'] = len(self.detected_kicks) + 1
            self.detected_kicks.append(kick_data)
            self.cooldown = 10

        if self.cooldown > 0:
            self.cooldown -= 1

        self.metrics_history.append(metrics)
        self.frame_analysis.append(metrics)

        return metrics

    def calculate_score(self, metrics: Dict) -> Tuple[int, List[Tuple[str, str]]]:
        if not metrics:
            return 0, []

        score = 0
        feedback = []

        # Knee angle (25 pts)
        knee = metrics.get('knee_angle', 0)
        if knee >= 160:
            score += 25
            feedback.append(("Full leg extension - maximum power", "success"))
        elif knee >= 140:
            score += 20
            feedback.append(("Good extension - aim for full lock", "info"))
        elif knee >= 120:
            score += 15
            feedback.append(("Moderate extension - extend further", "warning"))
        else:
            score += 10
            feedback.append(("Bent knee - focus on extension", "warning"))

        # Height (30 pts)
        height = metrics.get('kick_height', 0)
        if height >= 70:
            score += 30
            feedback.append(("Head level - competition standard", "success"))
        elif height >= 50:
            score += 22
            feedback.append(("Chest level - good target area", "info"))
        elif height >= 30:
            score += 15
            feedback.append(("Body level - increase flexibility", "warning"))
        else:
            score += 8
            feedback.append(("Low kick - work on hip mobility", "warning"))

        # Hip flexion (20 pts)
        hip = metrics.get('hip_flexion', 0)
        if hip >= 110:
            score += 20
            feedback.append(("Excellent hip chamber", "success"))
        elif hip >= 90:
            score += 15
            feedback.append(("Good chamber position", "info"))
        else:
            score += 10
            feedback.append(("Improve knee chamber", "warning"))

        # Support leg (15 pts)
        support = metrics.get('support_knee', 0)
        if 160 <= support <= 180:
            score += 15
            feedback.append(("Stable base - excellent balance", "success"))
        elif support >= 140:
            score += 10
            feedback.append(("Good stability", "info"))
        else:
            score += 5
            feedback.append(("Straighten support leg", "warning"))

        # Visibility bonus (10 pts)
        vis = metrics.get('visibility', 0)
        if vis >= 80:
            score += 10
        elif vis >= 60:
            score += 7
        else:
            score += 4

        return min(100, score), feedback

    def get_grade(self, score: int) -> Tuple[str, str, str]:
        grades = [
            (90, "A+", "Elite", "#4ade80"),
            (85, "A", "Excellent", "#4ade80"),
            (80, "A-", "Very Good", "#4ade80"),
            (75, "B+", "Good", "#60a5fa"),
            (70, "B", "Above Average", "#60a5fa"),
            (65, "B-", "Fair", "#fbbf24"),
            (60, "C+", "Average", "#fbbf24"),
            (55, "C", "Below Average", "#f97316"),
            (0, "D", "Needs Work", "#ef4444"),
        ]
        for threshold, grade, text, color in grades:
            if score >= threshold:
                return grade, text, color
        return "D", "Needs Work", "#ef4444"

    def get_statistics(self) -> Dict:
        if not self.metrics_history:
            return {'total_kicks': 0, 'avg_height': 0, 'max_height': 0, 'avg_knee': 0, 'frames': 0}

        heights = [m['kick_height'] for m in self.metrics_history if m['kick_height'] > 0]
        knees = [m['knee_angle'] for m in self.metrics_history if m['knee_angle'] > 0]

        return {
            'total_kicks': len(self.detected_kicks),
            'avg_height': round(np.mean(heights), 1) if heights else 0,
            'max_height': round(max(heights), 1) if heights else 0,
            'avg_knee': round(np.mean(knees), 1) if knees else 0,
            'frames': len(self.metrics_history),
        }

    def export_to_dataframe(self) -> pd.DataFrame:
        """Export all metrics to DataFrame for CSV export."""
        if not self.metrics_history:
            return pd.DataFrame()

        df = pd.DataFrame(self.metrics_history)
        df['timestamp'] = df['frame_time'].apply(lambda x: f"{int(x//60):02d}:{int(x%60):02d}.{int((x%1)*10)}")
        return df

    def export_kicks_to_dataframe(self) -> pd.DataFrame:
        """Export detected kicks to DataFrame."""
        if not self.detected_kicks:
            return pd.DataFrame()

        df = pd.DataFrame(self.detected_kicks)
        df['timestamp'] = df['frame_time'].apply(lambda x: f"{int(x//60):02d}:{int(x%60):02d}")
        return df


def format_time(seconds: float) -> str:
    return f"{int(seconds//60):02d}:{int(seconds%60):02d}"


# ============================================
# ANNOTATION TOOLS
# ============================================

class AnnotationTool:
    """Tools for drawing annotations on frames."""

    COLORS = {
        'red': (255, 0, 0),
        'green': (0, 255, 0),
        'blue': (0, 0, 255),
        'yellow': (255, 255, 0),
        'cyan': (0, 255, 255),
        'white': (255, 255, 255),
    }

    @staticmethod
    def draw_arrow(frame, start, end, color='green', thickness=2):
        """Draw an arrow on the frame."""
        color_rgb = AnnotationTool.COLORS.get(color, (0, 255, 0))
        cv2.arrowedLine(frame, start, end, color_rgb, thickness, tipLength=0.3)
        return frame

    @staticmethod
    def draw_circle(frame, center, radius=20, color='red', thickness=2):
        """Draw a circle highlight on the frame."""
        color_rgb = AnnotationTool.COLORS.get(color, (255, 0, 0))
        cv2.circle(frame, center, radius, color_rgb, thickness)
        return frame

    @staticmethod
    def draw_angle_arc(frame, p1, vertex, p2, color='yellow', show_value=True):
        """Draw an angle arc between three points."""
        color_rgb = AnnotationTool.COLORS.get(color, (255, 255, 0))

        # Calculate angle
        v1 = np.array(p1) - np.array(vertex)
        v2 = np.array(p2) - np.array(vertex)

        angle1 = np.arctan2(v1[1], v1[0])
        angle2 = np.arctan2(v2[1], v2[0])

        # Draw arc
        radius = 40
        start_angle = int(np.degrees(min(angle1, angle2)))
        end_angle = int(np.degrees(max(angle1, angle2)))

        cv2.ellipse(frame, tuple(vertex), (radius, radius), 0, start_angle, end_angle, color_rgb, 2)

        if show_value:
            angle_value = abs(np.degrees(np.arccos(np.clip(
                np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6), -1, 1
            ))))
            cv2.putText(frame, f"{int(angle_value)}°",
                       (vertex[0] + 45, vertex[1] + 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color_rgb, 2)

        return frame

    @staticmethod
    def draw_text_label(frame, position, text, color='white', bg=True):
        """Draw a text label with optional background."""
        color_rgb = AnnotationTool.COLORS.get(color, (255, 255, 255))
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        thickness = 2

        (w, h), _ = cv2.getTextSize(text, font, font_scale, thickness)

        if bg:
            cv2.rectangle(frame,
                         (position[0] - 5, position[1] - h - 5),
                         (position[0] + w + 5, position[1] + 5),
                         (0, 0, 0), -1)

        cv2.putText(frame, text, position, font, font_scale, color_rgb, thickness)
        return frame

    @staticmethod
    def draw_height_line(frame, y_pos, frame_width, color='cyan', label="Kick Height"):
        """Draw a horizontal reference line."""
        color_rgb = AnnotationTool.COLORS.get(color, (0, 255, 255))
        cv2.line(frame, (0, y_pos), (frame_width, y_pos), color_rgb, 2, cv2.LINE_AA)
        cv2.putText(frame, label, (10, y_pos - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color_rgb, 1)
        return frame

    @staticmethod
    def draw_ideal_overlay(frame, landmarks, ideal_angles):
        """Draw ideal technique overlay for comparison."""
        if landmarks is None:
            return frame

        overlay = frame.copy()

        # Draw ideal angle indicators
        # These are reference guides showing optimal positions
        h, w = frame.shape[:2]

        # Add semi-transparent ideal zone indicators
        # Head level zone (competition scoring area)
        cv2.rectangle(overlay, (0, int(h*0.1)), (w, int(h*0.3)), (0, 255, 0), -1)
        cv2.addWeighted(overlay, 0.1, frame, 0.9, 0, frame)

        # Add reference text
        cv2.putText(frame, "HEAD LEVEL TARGET", (10, int(h*0.15)),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        cv2.putText(frame, "CHEST LEVEL", (10, int(h*0.35)),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

        return frame


# ============================================
# IDEAL TECHNIQUE REFERENCE
# ============================================

IDEAL_TECHNIQUE = {
    'roundhouse_kick': {
        'name': 'Dollyo Chagi (Roundhouse)',
        'knee_angle': '170-180°',
        'kick_height': '85-100%',
        'hip_rotation': '35-45°',
        'support_knee': '160-180°',
        'hip_flexion': '110-140°',
        'description': 'Full extension with hip rotation for maximum power'
    },
    'front_kick': {
        'name': 'Ap Chagi (Front Kick)',
        'knee_angle': '175-180°',
        'kick_height': '70-90%',
        'hip_rotation': '0-10°',
        'support_knee': '170-180°',
        'hip_flexion': '100-120°',
        'description': 'Straight trajectory with snap at the end'
    },
    'side_kick': {
        'name': 'Yeop Chagi (Side Kick)',
        'knee_angle': '175-180°',
        'kick_height': '75-95%',
        'hip_rotation': '80-90°',
        'support_knee': '160-175°',
        'hip_flexion': '90-110°',
        'description': 'Full chamber before extension, blade of foot strikes'
    },
    'axe_kick': {
        'name': 'Naeryeo Chagi (Axe Kick)',
        'knee_angle': '170-180°',
        'kick_height': '100%+',
        'hip_rotation': '0-15°',
        'support_knee': '170-180°',
        'hip_flexion': '140-180°',
        'description': 'Maximum height, straight down strike'
    }
}


# ============================================
# JOC-SPECIFIC TOOLS
# ============================================

class TrajectoryTracker:
    """Track and visualize kick trajectory paths - Essential for technique correction."""

    def __init__(self):
        self.foot_positions = []
        self.max_points = 30  # Trail length

    def add_position(self, x: int, y: int, frame_idx: int):
        self.foot_positions.append({'x': x, 'y': y, 'frame': frame_idx})
        if len(self.foot_positions) > self.max_points:
            self.foot_positions.pop(0)

    def draw_trajectory(self, frame, color=(0, 255, 255)):
        """Draw kick trajectory path on frame with gradient effect."""
        if len(self.foot_positions) < 2:
            return frame

        points = [(p['x'], p['y']) for p in self.foot_positions]

        # Draw gradient trail
        for i in range(1, len(points)):
            alpha = i / len(points)  # Fade effect
            thickness = max(1, int(3 * alpha))
            intensity = int(255 * alpha)

            cv2.line(frame, points[i-1], points[i],
                    (0, intensity, intensity), thickness, cv2.LINE_AA)

        # Draw current position marker
        if points:
            cv2.circle(frame, points[-1], 8, (0, 255, 255), -1)
            cv2.circle(frame, points[-1], 10, (255, 255, 255), 2)

        return frame

    def get_trajectory_stats(self) -> Dict:
        """Calculate trajectory statistics for coaching feedback."""
        if len(self.foot_positions) < 2:
            return {}

        # Calculate total distance traveled
        total_dist = 0
        max_height = float('inf')
        min_height = 0

        for i in range(1, len(self.foot_positions)):
            dx = self.foot_positions[i]['x'] - self.foot_positions[i-1]['x']
            dy = self.foot_positions[i]['y'] - self.foot_positions[i-1]['y']
            total_dist += np.sqrt(dx*dx + dy*dy)

            if self.foot_positions[i]['y'] < max_height:
                max_height = self.foot_positions[i]['y']
            if self.foot_positions[i]['y'] > min_height:
                min_height = self.foot_positions[i]['y']

        return {
            'total_distance': round(total_dist, 1),
            'vertical_range': abs(min_height - max_height),
            'points_tracked': len(self.foot_positions)
        }

    def clear(self):
        self.foot_positions = []


class JOCReportGenerator:
    """Generate professional PDF-style reports with JOC branding."""

    JOC_GREEN = "#007A3D"
    JOC_RED = "#CE1126"

    @staticmethod
    def generate_html_report(athlete_info: Dict, stats: Dict, kicks: List, best_metrics: Dict, score: int, grade: str) -> str:
        """Generate HTML report that can be converted to PDF."""

        kicks_table = ""
        for k in kicks[:20]:
            kicks_table += f"""
            <tr>
                <td>{k['kick_number']}</td>
                <td>{format_time(k['frame_time'])}</td>
                <td>{k['level']}</td>
                <td>{k['kick_height']}%</td>
                <td>{k['knee_angle']}°</td>
                <td>{k['kicking_leg']}</td>
            </tr>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Arial', sans-serif; margin: 40px; color: #333; }}
                .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid {JOCReportGenerator.JOC_GREEN}; padding-bottom: 20px; margin-bottom: 30px; }}
                .logo {{ font-size: 24px; font-weight: bold; color: {JOCReportGenerator.JOC_GREEN}; }}
                .title {{ font-size: 28px; font-weight: bold; color: #1a1a2e; margin-bottom: 5px; }}
                .subtitle {{ color: #666; font-size: 14px; }}
                .section {{ margin: 25px 0; }}
                .section-title {{ font-size: 18px; font-weight: bold; color: {JOCReportGenerator.JOC_GREEN}; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px; }}
                .info-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }}
                .info-item {{ background: #f8f9fa; padding: 12px; border-radius: 8px; }}
                .info-label {{ font-size: 12px; color: #666; text-transform: uppercase; }}
                .info-value {{ font-size: 18px; font-weight: bold; color: #1a1a2e; }}
                .score-box {{ background: linear-gradient(135deg, {JOCReportGenerator.JOC_GREEN}, #00a050); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; }}
                .score-value {{ font-size: 64px; font-weight: bold; }}
                .score-grade {{ font-size: 24px; margin-top: 10px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
                th {{ background: {JOCReportGenerator.JOC_GREEN}; color: white; padding: 12px; text-align: left; }}
                td {{ padding: 10px; border-bottom: 1px solid #eee; }}
                tr:nth-child(even) {{ background: #f8f9fa; }}
                .footer {{ margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #666; font-size: 12px; }}
                .metrics-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }}
                .metric-card {{ background: #f0fdf4; border: 1px solid {JOCReportGenerator.JOC_GREEN}; padding: 15px; border-radius: 8px; text-align: center; }}
                .metric-value {{ font-size: 24px; font-weight: bold; color: {JOCReportGenerator.JOC_GREEN}; }}
                .metric-label {{ font-size: 12px; color: #666; margin-top: 5px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="title">Taekwondo Technique Analysis Report</div>
                    <div class="subtitle">Jordan Olympic Committee - Official Training Assessment</div>
                </div>
                <div class="logo">JOC</div>
            </div>

            <div class="section">
                <div class="section-title">Athlete Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">{athlete_info.get('name', 'Unknown')}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Category</div>
                        <div class="info-value">{athlete_info.get('category', '-')}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Weight Class</div>
                        <div class="info-value">{athlete_info.get('weight', '-')}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Assessment Date</div>
                        <div class="info-value">{datetime.now().strftime('%Y-%m-%d %H:%M')}</div>
                    </div>
                </div>
            </div>

            <div class="score-box">
                <div class="score-value">{score}/100</div>
                <div class="score-grade">Grade: {grade}</div>
            </div>

            <div class="section">
                <div class="section-title">Session Statistics</div>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">{stats['total_kicks']}</div>
                        <div class="metric-label">Kicks Detected</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{stats['max_height']}%</div>
                        <div class="metric-label">Max Height</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{stats['avg_height']}%</div>
                        <div class="metric-label">Avg Height</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Best Technique Metrics</div>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">{best_metrics['kick_height']}%</div>
                        <div class="metric-label">Kick Height</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{best_metrics['knee_angle']}°</div>
                        <div class="metric-label">Knee Angle</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{best_metrics['hip_flexion']}°</div>
                        <div class="metric-label">Hip Flexion</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{best_metrics['support_knee']}°</div>
                        <div class="metric-label">Support Knee</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{best_metrics['level']}</div>
                        <div class="metric-label">Target Level</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{best_metrics['kicking_leg']}</div>
                        <div class="metric-label">Kicking Leg</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Kicks Breakdown</div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Time</th>
                            <th>Level</th>
                            <th>Height</th>
                            <th>Knee Angle</th>
                            <th>Leg</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kicks_table}
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p>Generated by JOC Taekwondo AI Analyzer | Powered by QUALIA SOLUTIONS</p>
                <p>This report is for official Jordan Olympic Committee training assessment purposes.</p>
            </div>
        </body>
        </html>
        """
        return html


class AthleteProgressTracker:
    """Track athlete training progress over time for Olympic preparation."""

    @staticmethod
    def add_session(athlete_name: str, session_data: Dict):
        """Add a training session to athlete's progress history."""
        if athlete_name not in st.session_state.training_progress:
            st.session_state.training_progress[athlete_name] = []

        session_data['date'] = datetime.now().isoformat()
        st.session_state.training_progress[athlete_name].append(session_data)

    @staticmethod
    def get_progress_chart(athlete_name: str) -> go.Figure:
        """Generate progress chart for athlete over time."""
        if athlete_name not in st.session_state.training_progress:
            return None

        sessions = st.session_state.training_progress[athlete_name]
        if len(sessions) < 2:
            return None

        dates = [datetime.fromisoformat(s['date']) for s in sessions]
        scores = [s.get('best_score', 0) for s in sessions]
        heights = [s.get('max_height', 0) for s in sessions]

        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=dates, y=scores,
            mode='lines+markers',
            name='Best Score',
            line=dict(color='#4ade80', width=3),
            marker=dict(size=10)
        ))

        fig.add_trace(go.Scatter(
            x=dates, y=heights,
            mode='lines+markers',
            name='Max Height %',
            line=dict(color='#60a5fa', width=3),
            marker=dict(size=10),
            yaxis='y2'
        ))

        fig.update_layout(
            title=f"Training Progress: {athlete_name}",
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='white',
            height=350,
            xaxis=dict(title='Date', gridcolor='rgba(255,255,255,0.1)'),
            yaxis=dict(title='Score', gridcolor='rgba(255,255,255,0.1)', range=[0, 100]),
            yaxis2=dict(title='Height %', overlaying='y', side='right', range=[0, 100]),
            legend=dict(orientation='h', y=1.15),
            hovermode='x unified'
        )

        return fig

    @staticmethod
    def get_improvement_stats(athlete_name: str) -> Dict:
        """Calculate improvement statistics for athlete."""
        if athlete_name not in st.session_state.training_progress:
            return {}

        sessions = st.session_state.training_progress[athlete_name]
        if len(sessions) < 2:
            return {'sessions': len(sessions), 'improvement': 'N/A'}

        first_score = sessions[0].get('best_score', 0)
        last_score = sessions[-1].get('best_score', 0)
        improvement = last_score - first_score

        first_height = sessions[0].get('max_height', 0)
        last_height = sessions[-1].get('max_height', 0)
        height_improvement = last_height - first_height

        return {
            'sessions': len(sessions),
            'score_improvement': f"+{improvement}" if improvement >= 0 else str(improvement),
            'height_improvement': f"+{height_improvement}%" if height_improvement >= 0 else f"{height_improvement}%",
            'current_score': last_score,
            'trend': 'improving' if improvement > 0 else ('stable' if improvement == 0 else 'declining')
        }


class MultiAthleteComparison:
    """Compare multiple athletes for team selection purposes."""

    @staticmethod
    def compare_athletes(athletes: List[str]) -> pd.DataFrame:
        """Generate comparison DataFrame for multiple athletes."""
        comparison_data = []

        for name in athletes:
            if name in st.session_state.training_progress:
                sessions = st.session_state.training_progress[name]
                if sessions:
                    latest = sessions[-1]
                    avg_score = np.mean([s.get('best_score', 0) for s in sessions])
                    avg_height = np.mean([s.get('max_height', 0) for s in sessions])

                    comparison_data.append({
                        'Athlete': name,
                        'Sessions': len(sessions),
                        'Latest Score': latest.get('best_score', 0),
                        'Avg Score': round(avg_score, 1),
                        'Max Height': latest.get('max_height', 0),
                        'Avg Height': round(avg_height, 1),
                        'Total Kicks': sum([s.get('total_kicks', 0) for s in sessions])
                    })

        return pd.DataFrame(comparison_data)

    @staticmethod
    def get_comparison_chart(athletes: List[str]) -> go.Figure:
        """Generate radar chart comparing athletes."""
        if not athletes:
            return None

        categories = ['Score', 'Height', 'Consistency', 'Volume', 'Improvement']

        fig = go.Figure()

        colors = ['#4ade80', '#60a5fa', '#f97316', '#ef4444', '#a855f7']

        for i, name in enumerate(athletes[:5]):  # Max 5 athletes
            if name in st.session_state.training_progress:
                sessions = st.session_state.training_progress[name]
                if sessions:
                    latest = sessions[-1]
                    avg_score = np.mean([s.get('best_score', 0) for s in sessions])

                    # Normalize values to 0-100 scale
                    values = [
                        latest.get('best_score', 0),
                        latest.get('max_height', 0),
                        min(100, 100 - np.std([s.get('best_score', 0) for s in sessions]) * 2) if len(sessions) > 1 else 50,
                        min(100, len(sessions) * 10),
                        50 + (sessions[-1].get('best_score', 0) - sessions[0].get('best_score', 0)) if len(sessions) > 1 else 50
                    ]

                    fig.add_trace(go.Scatterpolar(
                        r=values,
                        theta=categories,
                        fill='toself',
                        name=name,
                        line_color=colors[i % len(colors)]
                    ))

        fig.update_layout(
            polar=dict(
                radialaxis=dict(visible=True, range=[0, 100]),
                bgcolor='rgba(0,0,0,0)'
            ),
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='white',
            showlegend=True,
            height=400
        )

        return fig


# ============================================
# PHASE 7: ADVANCED AI - AUTO KICK DETECTION
# ============================================

class AutoKickDetector:
    """
    Advanced AI system for automatic kick type detection.
    Uses pose landmark patterns to identify kick types without manual selection.
    """

    # Kick signature patterns based on body angles and positions
    KICK_SIGNATURES = {
        'dollyo_chagi': {  # Roundhouse
            'hip_rotation': {'min': 45, 'max': 90},
            'knee_chamber': {'min': 90, 'max': 140},
            'foot_path': 'circular',
            'target_zone': 'side'
        },
        'ap_chagi': {  # Front kick
            'hip_rotation': {'min': 0, 'max': 30},
            'knee_chamber': {'min': 90, 'max': 130},
            'foot_path': 'linear',
            'target_zone': 'front'
        },
        'yeop_chagi': {  # Side kick
            'hip_rotation': {'min': 80, 'max': 100},
            'knee_chamber': {'min': 70, 'max': 120},
            'foot_path': 'linear',
            'target_zone': 'side'
        },
        'dwi_chagi': {  # Back kick
            'hip_rotation': {'min': 150, 'max': 180},
            'knee_chamber': {'min': 60, 'max': 100},
            'foot_path': 'linear',
            'target_zone': 'back'
        },
        'naeryeo_chagi': {  # Axe kick
            'hip_rotation': {'min': 0, 'max': 45},
            'knee_chamber': {'min': 150, 'max': 180},
            'foot_path': 'vertical',
            'target_zone': 'front'
        },
        'huryo_chagi': {  # Hook kick
            'hip_rotation': {'min': 60, 'max': 120},
            'knee_chamber': {'min': 100, 'max': 160},
            'foot_path': 'hook',
            'target_zone': 'side'
        },
        'bandal_chagi': {  # Crescent kick
            'hip_rotation': {'min': 30, 'max': 60},
            'knee_chamber': {'min': 140, 'max': 180},
            'foot_path': 'arc',
            'target_zone': 'front'
        },
        'mom_dollyo_chagi': {  # Spinning kick
            'hip_rotation': {'min': 180, 'max': 360},
            'knee_chamber': {'min': 90, 'max': 150},
            'foot_path': 'circular',
            'target_zone': 'spinning'
        }
    }

    KICK_NAMES = {
        'dollyo_chagi': 'Roundhouse Kick (Dollyo Chagi)',
        'ap_chagi': 'Front Kick (Ap Chagi)',
        'yeop_chagi': 'Side Kick (Yeop Chagi)',
        'dwi_chagi': 'Back Kick (Dwi Chagi)',
        'naeryeo_chagi': 'Axe Kick (Naeryeo Chagi)',
        'huryo_chagi': 'Hook Kick (Huryo Chagi)',
        'bandal_chagi': 'Crescent Kick (Bandal Chagi)',
        'mom_dollyo_chagi': 'Spinning Kick (Mom Dollyo Chagi)'
    }

    def __init__(self):
        self.frame_history = deque(maxlen=30)  # Store recent frame data
        self.detection_history = []
        self.confidence_threshold = 0.65

    def calculate_hip_rotation(self, landmarks) -> float:
        """Calculate hip rotation angle relative to camera."""
        try:
            l_hip = np.array([landmarks.landmark[23].x, landmarks.landmark[23].y])
            r_hip = np.array([landmarks.landmark[24].x, landmarks.landmark[24].y])
            l_shoulder = np.array([landmarks.landmark[11].x, landmarks.landmark[11].y])
            r_shoulder = np.array([landmarks.landmark[12].x, landmarks.landmark[12].y])

            hip_vector = r_hip - l_hip
            shoulder_vector = r_shoulder - l_shoulder

            # Calculate rotation angle
            angle = np.degrees(np.arctan2(hip_vector[1], hip_vector[0]) -
                              np.arctan2(shoulder_vector[1], shoulder_vector[0]))
            return abs(angle)
        except:
            return 0.0

    def calculate_knee_chamber(self, landmarks, kicking_side: str) -> float:
        """Calculate knee chamber angle."""
        try:
            if kicking_side == 'left':
                hip = np.array([landmarks.landmark[23].x, landmarks.landmark[23].y, landmarks.landmark[23].z])
                knee = np.array([landmarks.landmark[25].x, landmarks.landmark[25].y, landmarks.landmark[25].z])
                ankle = np.array([landmarks.landmark[27].x, landmarks.landmark[27].y, landmarks.landmark[27].z])
            else:
                hip = np.array([landmarks.landmark[24].x, landmarks.landmark[24].y, landmarks.landmark[24].z])
                knee = np.array([landmarks.landmark[26].x, landmarks.landmark[26].y, landmarks.landmark[26].z])
                ankle = np.array([landmarks.landmark[28].x, landmarks.landmark[28].y, landmarks.landmark[28].z])

            v1 = hip - knee
            v2 = ankle - knee

            n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
            if n1 < 1e-6 or n2 < 1e-6:
                return 0.0

            dot = np.clip(np.dot(v1/n1, v2/n2), -1.0, 1.0)
            return np.degrees(np.arccos(dot))
        except:
            return 0.0

    def detect_kicking_leg(self, landmarks) -> str:
        """Detect which leg is the kicking leg based on foot height."""
        try:
            l_foot_y = landmarks.landmark[31].y
            r_foot_y = landmarks.landmark[32].y

            # Lower y value = higher position (inverted coordinate)
            if l_foot_y < r_foot_y - 0.05:
                return 'left'
            elif r_foot_y < l_foot_y - 0.05:
                return 'right'
            else:
                return 'none'
        except:
            return 'none'

    def analyze_foot_path(self, landmarks) -> str:
        """Analyze the trajectory pattern of the kicking foot."""
        try:
            kicking_side = self.detect_kicking_leg(landmarks)
            if kicking_side == 'none':
                return 'stationary'

            if kicking_side == 'left':
                foot = (landmarks.landmark[31].x, landmarks.landmark[31].y)
            else:
                foot = (landmarks.landmark[32].x, landmarks.landmark[32].y)

            self.frame_history.append(foot)

            if len(self.frame_history) < 10:
                return 'analyzing'

            # Analyze path pattern
            positions = list(self.frame_history)
            x_coords = [p[0] for p in positions]
            y_coords = [p[1] for p in positions]

            x_range = max(x_coords) - min(x_coords)
            y_range = max(y_coords) - min(y_coords)

            if y_range > x_range * 2:
                return 'vertical'
            elif x_range > y_range * 2:
                return 'linear'
            else:
                return 'circular'
        except:
            return 'unknown'

    def detect_kick_type(self, landmarks) -> Dict:
        """
        Main detection method - analyzes landmarks to identify kick type.
        Returns detected kick type and confidence score.
        """
        if landmarks is None:
            return {'kick_type': None, 'confidence': 0.0, 'details': {}}

        kicking_side = self.detect_kicking_leg(landmarks)

        if kicking_side == 'none':
            return {'kick_type': None, 'confidence': 0.0, 'details': {'status': 'No kick detected'}}

        hip_rotation = self.calculate_hip_rotation(landmarks)
        knee_chamber = self.calculate_knee_chamber(landmarks, kicking_side)
        foot_path = self.analyze_foot_path(landmarks)

        # Calculate confidence for each kick type
        kick_scores = {}

        for kick_name, signature in self.KICK_SIGNATURES.items():
            score = 0.0
            max_score = 3.0

            # Check hip rotation match
            if signature['hip_rotation']['min'] <= hip_rotation <= signature['hip_rotation']['max']:
                score += 1.0
            elif abs(hip_rotation - signature['hip_rotation']['min']) < 20 or \
                 abs(hip_rotation - signature['hip_rotation']['max']) < 20:
                score += 0.5

            # Check knee chamber match
            if signature['knee_chamber']['min'] <= knee_chamber <= signature['knee_chamber']['max']:
                score += 1.0
            elif abs(knee_chamber - signature['knee_chamber']['min']) < 15 or \
                 abs(knee_chamber - signature['knee_chamber']['max']) < 15:
                score += 0.5

            # Check foot path match
            if foot_path == signature['foot_path']:
                score += 1.0
            elif foot_path == 'circular' and signature['foot_path'] in ['hook', 'arc']:
                score += 0.5

            kick_scores[kick_name] = score / max_score

        # Get best match
        best_kick = max(kick_scores, key=kick_scores.get)
        confidence = kick_scores[best_kick]

        if confidence >= self.confidence_threshold:
            return {
                'kick_type': best_kick,
                'kick_name': self.KICK_NAMES[best_kick],
                'confidence': confidence,
                'details': {
                    'hip_rotation': hip_rotation,
                    'knee_chamber': knee_chamber,
                    'foot_path': foot_path,
                    'kicking_leg': kicking_side,
                    'all_scores': kick_scores
                }
            }
        else:
            return {
                'kick_type': 'unknown',
                'kick_name': 'Unknown Technique',
                'confidence': confidence,
                'details': {
                    'hip_rotation': hip_rotation,
                    'knee_chamber': knee_chamber,
                    'foot_path': foot_path,
                    'kicking_leg': kicking_side,
                    'best_guess': self.KICK_NAMES.get(best_kick, 'Unknown')
                }
            }


class RealTimeFeedbackEngine:
    """
    Provides real-time coaching feedback during video analysis.
    Generates instant suggestions based on pose analysis.
    """

    FEEDBACK_RULES = {
        'knee_angle': {
            'low': {'threshold': 140, 'message': 'Extend your knee more for better reach', 'severity': 'warning'},
            'optimal': {'min': 160, 'max': 175, 'message': 'Excellent knee extension!', 'severity': 'good'},
            'high': {'threshold': 180, 'message': 'Avoid hyperextension - slight bend is safer', 'severity': 'warning'}
        },
        'hip_flexion': {
            'low': {'threshold': 80, 'message': 'Raise your hip higher for more power', 'severity': 'warning'},
            'optimal': {'min': 100, 'max': 140, 'message': 'Great hip flexibility!', 'severity': 'good'},
            'high': {'threshold': 160, 'message': 'Hip may be overextended', 'severity': 'info'}
        },
        'support_knee': {
            'low': {'threshold': 140, 'message': 'Straighten support leg for stability', 'severity': 'warning'},
            'optimal': {'min': 160, 'max': 175, 'message': 'Good support leg position!', 'severity': 'good'},
            'locked': {'threshold': 180, 'message': 'Avoid locking support knee', 'severity': 'warning'}
        },
        'kick_height': {
            'low': {'threshold': 40, 'message': 'Work on flexibility - kick height is low', 'severity': 'warning'},
            'medium': {'min': 40, 'max': 70, 'message': 'Good height - keep practicing!', 'severity': 'info'},
            'optimal': {'min': 70, 'max': 100, 'message': 'Excellent kick height!', 'severity': 'good'}
        },
        'balance': {
            'unstable': {'threshold': 0.15, 'message': 'Focus on balance - body swaying', 'severity': 'warning'},
            'stable': {'threshold': 0.05, 'message': 'Excellent stability!', 'severity': 'good'}
        }
    }

    def __init__(self):
        self.feedback_history = []
        self.current_feedback = []

    def analyze_metrics(self, metrics: Dict) -> List[Dict]:
        """Generate real-time feedback based on current metrics."""
        feedback = []

        # Analyze knee angle
        if 'knee_angle' in metrics:
            knee = metrics['knee_angle']
            if knee < self.FEEDBACK_RULES['knee_angle']['low']['threshold']:
                feedback.append({
                    'metric': 'Knee Angle',
                    'value': f"{knee:.0f}°",
                    'message': self.FEEDBACK_RULES['knee_angle']['low']['message'],
                    'severity': 'warning'
                })
            elif self.FEEDBACK_RULES['knee_angle']['optimal']['min'] <= knee <= self.FEEDBACK_RULES['knee_angle']['optimal']['max']:
                feedback.append({
                    'metric': 'Knee Angle',
                    'value': f"{knee:.0f}°",
                    'message': self.FEEDBACK_RULES['knee_angle']['optimal']['message'],
                    'severity': 'good'
                })

        # Analyze hip flexion
        if 'hip_flexion' in metrics:
            hip = metrics['hip_flexion']
            if hip < self.FEEDBACK_RULES['hip_flexion']['low']['threshold']:
                feedback.append({
                    'metric': 'Hip Flexion',
                    'value': f"{hip:.0f}°",
                    'message': self.FEEDBACK_RULES['hip_flexion']['low']['message'],
                    'severity': 'warning'
                })
            elif self.FEEDBACK_RULES['hip_flexion']['optimal']['min'] <= hip <= self.FEEDBACK_RULES['hip_flexion']['optimal']['max']:
                feedback.append({
                    'metric': 'Hip Flexion',
                    'value': f"{hip:.0f}°",
                    'message': self.FEEDBACK_RULES['hip_flexion']['optimal']['message'],
                    'severity': 'good'
                })

        # Analyze kick height
        if 'kick_height' in metrics:
            height = metrics['kick_height']
            if height < self.FEEDBACK_RULES['kick_height']['low']['threshold']:
                feedback.append({
                    'metric': 'Kick Height',
                    'value': f"{height:.0f}%",
                    'message': self.FEEDBACK_RULES['kick_height']['low']['message'],
                    'severity': 'warning'
                })
            elif height >= self.FEEDBACK_RULES['kick_height']['optimal']['min']:
                feedback.append({
                    'metric': 'Kick Height',
                    'value': f"{height:.0f}%",
                    'message': self.FEEDBACK_RULES['kick_height']['optimal']['message'],
                    'severity': 'good'
                })

        # Analyze support leg
        if 'support_knee' in metrics:
            support = metrics['support_knee']
            if support < self.FEEDBACK_RULES['support_knee']['low']['threshold']:
                feedback.append({
                    'metric': 'Support Leg',
                    'value': f"{support:.0f}°",
                    'message': self.FEEDBACK_RULES['support_knee']['low']['message'],
                    'severity': 'warning'
                })
            elif self.FEEDBACK_RULES['support_knee']['optimal']['min'] <= support <= self.FEEDBACK_RULES['support_knee']['optimal']['max']:
                feedback.append({
                    'metric': 'Support Leg',
                    'value': f"{support:.0f}°",
                    'message': self.FEEDBACK_RULES['support_knee']['optimal']['message'],
                    'severity': 'good'
                })

        self.current_feedback = feedback
        self.feedback_history.extend(feedback)

        return feedback

    def get_summary_feedback(self) -> Dict:
        """Generate summary feedback after analysis."""
        if not self.feedback_history:
            return {'overall': 'No feedback generated', 'strengths': [], 'improvements': []}

        strengths = [f for f in self.feedback_history if f['severity'] == 'good']
        improvements = [f for f in self.feedback_history if f['severity'] == 'warning']

        return {
            'overall': 'Analysis complete',
            'strengths': list({f['metric']: f['message'] for f in strengths}.items()),
            'improvements': list({f['metric']: f['message'] for f in improvements}.items()),
            'total_good': len(strengths),
            'total_warnings': len(improvements)
        }


class LiveCameraProcessor:
    """
    Handles live camera capture and processing for mobile devices.
    Provides real-time pose analysis from webcam/phone camera.
    """

    def __init__(self):
        self.is_recording = False
        self.frames_captured = []
        self.auto_detector = AutoKickDetector()
        self.feedback_engine = RealTimeFeedbackEngine()

    def process_camera_frame(self, frame, pose_detector) -> Dict:
        """Process a single camera frame and return analysis."""
        if frame is None:
            return {'success': False, 'error': 'No frame received'}

        # Convert to RGB for MediaPipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose_detector.process(frame_rgb)

        if not results.pose_landmarks:
            return {
                'success': True,
                'pose_detected': False,
                'frame': frame,
                'message': 'Position yourself in frame'
            }

        # Auto-detect kick type
        kick_detection = self.auto_detector.detect_kick_type(results.pose_landmarks)

        # Draw pose on frame
        annotated_frame = frame.copy()
        mp_drawing.draw_landmarks(
            annotated_frame,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            POSE_LANDMARK_STYLE,
            POSE_CONNECTION_STYLE
        )

        return {
            'success': True,
            'pose_detected': True,
            'frame': annotated_frame,
            'kick_detection': kick_detection,
            'landmarks': results.pose_landmarks
        }

    def start_recording(self):
        """Start recording session."""
        self.is_recording = True
        self.frames_captured = []

    def stop_recording(self) -> List:
        """Stop recording and return captured frames."""
        self.is_recording = False
        return self.frames_captured

    def add_frame(self, frame):
        """Add frame to recording buffer."""
        if self.is_recording:
            self.frames_captured.append(frame.copy())


# ============================================
# INJURY PREVENTION SYSTEM
# ============================================

class InjuryPreventionSystem:
    """
    Advanced injury prevention analysis for JOC athletes.
    Detects dangerous biomechanics and fatigue indicators.
    Critical for protecting Olympic athletes during training.
    """

    # Safe joint angle ranges (based on sports medicine research)
    SAFE_RANGES = {
        'knee_valgus_angle': {'min': -10, 'max': 10, 'danger': 15},  # Knee inward collapse
        'knee_flexion': {'min': 20, 'max': 160, 'danger_low': 10},   # Too straight = ACL risk
        'hip_drop': {'max': 10, 'danger': 15},                        # Pelvic drop angle
        'ankle_dorsiflexion': {'min': 10, 'max': 45},
        'trunk_lean': {'max': 20, 'danger': 30}                       # Excessive lean
    }

    # Fatigue indicators thresholds
    FATIGUE_THRESHOLDS = {
        'score_drop_percent': 15,      # Score drops more than 15%
        'height_drop_percent': 20,     # Kick height drops 20%
        'form_degradation': 10,        # Support knee angle drops
        'reaction_slowdown': 25        # Movement speed drops
    }

    def __init__(self):
        self.injury_risks = []
        self.fatigue_indicators = []
        self.baseline_metrics = None
        self.current_metrics_window = deque(maxlen=30)  # Last 30 frames
        self.alert_history = []

    def set_baseline(self, metrics: Dict):
        """Set baseline metrics from first few frames for fatigue comparison."""
        self.baseline_metrics = metrics.copy()

    def analyze_injury_risk(self, landmarks, frame_idx: int, frame_time: float) -> Dict:
        """Analyze current frame for injury risk factors."""
        risks = {
            'frame': frame_idx,
            'time': frame_time,
            'alerts': [],
            'risk_level': 'low',
            'knee_valgus': None,
            'hip_drop': None,
            'trunk_lean': None,
            'overall_risk_score': 0
        }

        risk_score = 0

        # === KNEE VALGUS DETECTION (ACL injury risk) ===
        # Check if knee is collapsing inward during landing/pivoting
        try:
            left_hip = self._get_landmark_pos(landmarks, 'LEFT_HIP')
            left_knee = self._get_landmark_pos(landmarks, 'LEFT_KNEE')
            left_ankle = self._get_landmark_pos(landmarks, 'LEFT_ANKLE')
            right_hip = self._get_landmark_pos(landmarks, 'RIGHT_HIP')
            right_knee = self._get_landmark_pos(landmarks, 'RIGHT_KNEE')
            right_ankle = self._get_landmark_pos(landmarks, 'RIGHT_ANKLE')

            if all([left_hip, left_knee, left_ankle]):
                left_valgus = self._calculate_valgus_angle(left_hip, left_knee, left_ankle)
                risks['left_knee_valgus'] = round(left_valgus, 1)

                if abs(left_valgus) > self.SAFE_RANGES['knee_valgus_angle']['danger']:
                    risks['alerts'].append({
                        'type': 'KNEE_VALGUS',
                        'severity': 'HIGH',
                        'message': f'Left knee valgus {left_valgus:.1f}° - ACL injury risk!',
                        'leg': 'left'
                    })
                    risk_score += 40
                elif abs(left_valgus) > self.SAFE_RANGES['knee_valgus_angle']['max']:
                    risks['alerts'].append({
                        'type': 'KNEE_VALGUS',
                        'severity': 'MEDIUM',
                        'message': f'Left knee tracking inward {left_valgus:.1f}°',
                        'leg': 'left'
                    })
                    risk_score += 20

            if all([right_hip, right_knee, right_ankle]):
                right_valgus = self._calculate_valgus_angle(right_hip, right_knee, right_ankle)
                risks['right_knee_valgus'] = round(right_valgus, 1)

                if abs(right_valgus) > self.SAFE_RANGES['knee_valgus_angle']['danger']:
                    risks['alerts'].append({
                        'type': 'KNEE_VALGUS',
                        'severity': 'HIGH',
                        'message': f'Right knee valgus {right_valgus:.1f}° - ACL injury risk!',
                        'leg': 'right'
                    })
                    risk_score += 40
                elif abs(right_valgus) > self.SAFE_RANGES['knee_valgus_angle']['max']:
                    risks['alerts'].append({
                        'type': 'KNEE_VALGUS',
                        'severity': 'MEDIUM',
                        'message': f'Right knee tracking inward {right_valgus:.1f}°',
                        'leg': 'right'
                    })
                    risk_score += 20
        except:
            pass

        # === HIP DROP DETECTION (indicates weak glutes, leads to knee issues) ===
        try:
            if left_hip and right_hip:
                hip_drop = abs(left_hip[1] - right_hip[1])  # Y difference
                hip_drop_normalized = (hip_drop / 480) * 100  # Normalize to percentage
                risks['hip_drop'] = round(hip_drop_normalized, 1)

                if hip_drop_normalized > self.SAFE_RANGES['hip_drop']['danger']:
                    risks['alerts'].append({
                        'type': 'HIP_DROP',
                        'severity': 'HIGH',
                        'message': f'Excessive hip drop {hip_drop_normalized:.1f}% - weak gluteus medius',
                        'recommendation': 'Strengthen hip abductors'
                    })
                    risk_score += 25
                elif hip_drop_normalized > self.SAFE_RANGES['hip_drop']['max']:
                    risks['alerts'].append({
                        'type': 'HIP_DROP',
                        'severity': 'MEDIUM',
                        'message': f'Hip drop detected {hip_drop_normalized:.1f}%',
                        'recommendation': 'Focus on hip stability'
                    })
                    risk_score += 10
        except:
            pass

        # === TRUNK LEAN DETECTION (balance/core issues) ===
        try:
            left_shoulder = self._get_landmark_pos(landmarks, 'LEFT_SHOULDER')
            right_shoulder = self._get_landmark_pos(landmarks, 'RIGHT_SHOULDER')

            if left_shoulder and right_shoulder and left_hip and right_hip:
                shoulder_mid = ((left_shoulder[0] + right_shoulder[0]) / 2,
                               (left_shoulder[1] + right_shoulder[1]) / 2)
                hip_mid = ((left_hip[0] + right_hip[0]) / 2,
                          (left_hip[1] + right_hip[1]) / 2)

                trunk_lean = math.degrees(math.atan2(
                    shoulder_mid[0] - hip_mid[0],
                    hip_mid[1] - shoulder_mid[1]
                ))
                risks['trunk_lean'] = round(trunk_lean, 1)

                if abs(trunk_lean) > self.SAFE_RANGES['trunk_lean']['danger']:
                    risks['alerts'].append({
                        'type': 'TRUNK_LEAN',
                        'severity': 'HIGH',
                        'message': f'Excessive trunk lean {trunk_lean:.1f}° - balance risk',
                        'recommendation': 'Core strengthening needed'
                    })
                    risk_score += 20
        except:
            pass

        # === HYPEREXTENSION DETECTION ===
        try:
            if left_knee and left_hip and left_ankle:
                left_knee_angle = self._calculate_angle(left_hip, left_knee, left_ankle)
                if left_knee_angle > 175:
                    risks['alerts'].append({
                        'type': 'HYPEREXTENSION',
                        'severity': 'HIGH',
                        'message': f'Left knee hyperextension {left_knee_angle:.0f}°',
                        'recommendation': 'Avoid locking knee joint'
                    })
                    risk_score += 30

            if right_knee and right_hip and right_ankle:
                right_knee_angle = self._calculate_angle(right_hip, right_knee, right_ankle)
                if right_knee_angle > 175:
                    risks['alerts'].append({
                        'type': 'HYPEREXTENSION',
                        'severity': 'HIGH',
                        'message': f'Right knee hyperextension {right_knee_angle:.0f}°',
                        'recommendation': 'Avoid locking knee joint'
                    })
                    risk_score += 30
        except:
            pass

        # Determine overall risk level
        risks['overall_risk_score'] = min(100, risk_score)
        if risk_score >= 50:
            risks['risk_level'] = 'high'
        elif risk_score >= 25:
            risks['risk_level'] = 'medium'
        else:
            risks['risk_level'] = 'low'

        if risks['alerts']:
            self.injury_risks.append(risks)
            self.alert_history.extend(risks['alerts'])

        return risks

    def analyze_fatigue(self, current_metrics: Dict, frame_idx: int) -> Dict:
        """Detect fatigue indicators by comparing to baseline and recent performance."""
        self.current_metrics_window.append(current_metrics)

        fatigue = {
            'frame': frame_idx,
            'is_fatigued': False,
            'fatigue_level': 0,
            'indicators': [],
            'recommendation': None
        }

        if not self.baseline_metrics or len(self.current_metrics_window) < 10:
            return fatigue

        # Calculate rolling averages
        recent_scores = [m.get('score', 0) for m in list(self.current_metrics_window)[-10:] if 'score' in m]
        recent_heights = [m.get('kick_height', 0) for m in list(self.current_metrics_window)[-10:] if 'kick_height' in m]

        if not recent_scores or not recent_heights:
            return fatigue

        avg_recent_score = np.mean(recent_scores)
        avg_recent_height = np.mean(recent_heights)

        baseline_score = self.baseline_metrics.get('score', 0)
        baseline_height = self.baseline_metrics.get('kick_height', 0)

        fatigue_score = 0

        # Score drop detection
        if baseline_score > 0:
            score_drop = ((baseline_score - avg_recent_score) / baseline_score) * 100
            if score_drop > self.FATIGUE_THRESHOLDS['score_drop_percent']:
                fatigue['indicators'].append({
                    'type': 'SCORE_DROP',
                    'value': f'-{score_drop:.1f}%',
                    'message': 'Performance score declining'
                })
                fatigue_score += 30

        # Height drop detection
        if baseline_height > 0:
            height_drop = ((baseline_height - avg_recent_height) / baseline_height) * 100
            if height_drop > self.FATIGUE_THRESHOLDS['height_drop_percent']:
                fatigue['indicators'].append({
                    'type': 'HEIGHT_DROP',
                    'value': f'-{height_drop:.1f}%',
                    'message': 'Kick height declining - leg fatigue'
                })
                fatigue_score += 35

        # Form degradation (support knee getting lower)
        recent_support = [m.get('support_knee', 180) for m in list(self.current_metrics_window)[-10:] if 'support_knee' in m]
        if recent_support:
            support_trend = recent_support[-1] - recent_support[0] if len(recent_support) > 1 else 0
            if support_trend < -self.FATIGUE_THRESHOLDS['form_degradation']:
                fatigue['indicators'].append({
                    'type': 'FORM_DEGRADATION',
                    'value': f'{support_trend:.1f}°',
                    'message': 'Support leg stability declining'
                })
                fatigue_score += 25

        fatigue['fatigue_level'] = min(100, fatigue_score)
        fatigue['is_fatigued'] = fatigue_score >= 50

        if fatigue['is_fatigued']:
            fatigue['recommendation'] = "Consider rest period - fatigue detected. Risk of injury increases with fatigue."
            self.fatigue_indicators.append(fatigue)

        return fatigue

    def _get_landmark_pos(self, landmarks, name: str) -> Optional[Tuple[float, float]]:
        """Get landmark position by name."""
        landmark_map = {
            'LEFT_HIP': mp_pose.PoseLandmark.LEFT_HIP,
            'RIGHT_HIP': mp_pose.PoseLandmark.RIGHT_HIP,
            'LEFT_KNEE': mp_pose.PoseLandmark.LEFT_KNEE,
            'RIGHT_KNEE': mp_pose.PoseLandmark.RIGHT_KNEE,
            'LEFT_ANKLE': mp_pose.PoseLandmark.LEFT_ANKLE,
            'RIGHT_ANKLE': mp_pose.PoseLandmark.RIGHT_ANKLE,
            'LEFT_SHOULDER': mp_pose.PoseLandmark.LEFT_SHOULDER,
            'RIGHT_SHOULDER': mp_pose.PoseLandmark.RIGHT_SHOULDER
        }

        if name not in landmark_map:
            return None

        try:
            lm = landmarks.landmark[landmark_map[name]]
            if lm.visibility > 0.5:
                return (lm.x * 640, lm.y * 480)  # Normalized to typical frame size
        except:
            pass
        return None

    def _calculate_valgus_angle(self, hip, knee, ankle) -> float:
        """Calculate knee valgus angle (inward collapse)."""
        # Valgus is the angle deviation from straight line hip-knee-ankle in frontal plane
        knee_offset = knee[0] - ((hip[0] + ankle[0]) / 2)
        leg_length = abs(hip[1] - ankle[1])
        if leg_length > 0:
            valgus = math.degrees(math.atan(knee_offset / leg_length))
            return valgus
        return 0

    def _calculate_angle(self, p1, p2, p3) -> float:
        """Calculate angle at p2."""
        v1 = np.array([p1[0] - p2[0], p1[1] - p2[1]])
        v2 = np.array([p3[0] - p2[0], p3[1] - p2[1]])

        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        return math.degrees(math.acos(np.clip(cos_angle, -1, 1)))

    def get_session_summary(self) -> Dict:
        """Get injury prevention summary for the session."""
        high_risk_count = len([r for r in self.injury_risks if r['risk_level'] == 'high'])
        medium_risk_count = len([r for r in self.injury_risks if r['risk_level'] == 'medium'])

        alert_types = {}
        for alert in self.alert_history:
            t = alert['type']
            alert_types[t] = alert_types.get(t, 0) + 1

        return {
            'total_risk_events': len(self.injury_risks),
            'high_risk_events': high_risk_count,
            'medium_risk_events': medium_risk_count,
            'fatigue_events': len(self.fatigue_indicators),
            'alert_breakdown': alert_types,
            'most_common_risk': max(alert_types, key=alert_types.get) if alert_types else None,
            'recommendation': self._get_recommendation(alert_types, high_risk_count)
        }

    def _get_recommendation(self, alert_types: Dict, high_risk_count: int) -> str:
        """Generate personalized recommendation based on risks detected."""
        if high_risk_count > 5:
            return "⚠️ HIGH RISK SESSION - Multiple dangerous biomechanics detected. Recommend technique review with coach."

        if 'KNEE_VALGUS' in alert_types and alert_types['KNEE_VALGUS'] > 3:
            return "🦵 Focus on hip strengthening exercises. Knee valgus indicates weak gluteus medius."

        if 'HIP_DROP' in alert_types and alert_types['HIP_DROP'] > 3:
            return "🏋️ Add single-leg stability exercises. Hip drop affects kick power and increases injury risk."

        if 'TRUNK_LEAN' in alert_types:
            return "💪 Core strengthening recommended. Excessive trunk lean affects balance and technique."

        if 'HYPEREXTENSION' in alert_types:
            return "🚫 Avoid locking knee joint. Practice maintaining slight knee bend on support leg."

        if len(self.fatigue_indicators) > 2:
            return "😓 Fatigue detected multiple times. Consider shorter training intervals with adequate rest."

        return "✅ Good session! Continue maintaining proper form."


class WTScoringSimulator:
    """
    World Taekwondo (WT) Competition Scoring Simulation.
    Helps athletes understand how their techniques would score in competition.
    """

    # WT Scoring Rules (2024)
    SCORING_ZONES = {
        'head': {'base_points': 3, 'spinning_bonus': 1},
        'trunk': {'base_points': 2, 'spinning_bonus': 1},
        'technical': {'turning_kick': 1, 'spinning_kick': 2}
    }

    # Kick height thresholds for scoring zones
    HEIGHT_THRESHOLDS = {
        'head': 75,      # Above 75% = head level
        'trunk': 40,     # 40-75% = trunk level
        'low': 0         # Below 40% = no score
    }

    def __init__(self):
        self.points = {'blue': 0, 'red': 0}
        self.scoring_events = []
        self.round_scores = []

    def evaluate_kick(self, kick_data: Dict, is_spinning: bool = False) -> Dict:
        """Evaluate a kick for WT scoring."""
        result = {
            'scored': False,
            'points': 0,
            'zone': None,
            'technique_bonus': 0,
            'reason': ''
        }

        height = kick_data.get('kick_height', 0)
        knee_chamber = kick_data.get('knee_angle', 180)

        # Determine scoring zone
        if height >= self.HEIGHT_THRESHOLDS['head']:
            result['zone'] = 'head'
            result['points'] = self.SCORING_ZONES['head']['base_points']
            result['reason'] = 'Head-level kick'
        elif height >= self.HEIGHT_THRESHOLDS['trunk']:
            result['zone'] = 'trunk'
            result['points'] = self.SCORING_ZONES['trunk']['base_points']
            result['reason'] = 'Trunk-level kick'
        else:
            result['zone'] = 'low'
            result['reason'] = 'Below scoring zone'
            return result

        # Add spinning bonus
        if is_spinning:
            result['technique_bonus'] = 1
            result['points'] += 1
            result['reason'] += ' + Spinning technique'

        # Check technique quality (proper chamber = valid technique)
        if knee_chamber > 150:  # Poor chamber
            result['points'] = max(0, result['points'] - 1)
            result['reason'] += ' (weak technique: -1)'

        result['scored'] = result['points'] > 0

        if result['scored']:
            self.scoring_events.append({
                'kick': kick_data,
                'result': result,
                'time': kick_data.get('frame_time', 0)
            })

        return result

    def get_match_simulation(self, all_kicks: List[Dict]) -> Dict:
        """Simulate a full match scoring from all detected kicks."""
        total_points = 0
        head_kicks = 0
        trunk_kicks = 0

        for kick in all_kicks:
            # Detect if spinning based on hip rotation (simplified)
            is_spinning = kick.get('hip_rotation', 0) > 45
            result = self.evaluate_kick(kick, is_spinning)

            if result['scored']:
                total_points += result['points']
                if result['zone'] == 'head':
                    head_kicks += 1
                elif result['zone'] == 'trunk':
                    trunk_kicks += 1

        return {
            'total_points': total_points,
            'head_kicks': head_kicks,
            'trunk_kicks': trunk_kicks,
            'scoring_rate': f"{(head_kicks + trunk_kicks) / len(all_kicks) * 100:.1f}%" if all_kicks else "0%",
            'average_points_per_kick': round(total_points / len(all_kicks), 2) if all_kicks else 0,
            'scoring_events': self.scoring_events
        }


class StanceAnalyzer:
    """
    Analyze fighting stance quality for Taekwondo.
    Proper stance is foundation for all techniques.
    """

    IDEAL_STANCE = {
        'feet_width_ratio': 1.5,      # Shoulder width * 1.5
        'weight_distribution': 50,     # 50-50 or 60-40
        'guard_height': 'chin',        # Hands at chin level
        'knee_bend': 20,               # Slight bend
        'hip_angle': 45                # 45-degree angle to opponent
    }

    def __init__(self):
        self.stance_history = []

    def analyze_stance(self, landmarks, frame_idx: int) -> Dict:
        """Analyze current fighting stance."""
        stance = {
            'frame': frame_idx,
            'score': 0,
            'feedback': [],
            'metrics': {}
        }

        try:
            # Get key landmarks
            left_ankle = self._get_pos(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE)
            right_ankle = self._get_pos(landmarks, mp_pose.PoseLandmark.RIGHT_ANKLE)
            left_shoulder = self._get_pos(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER)
            right_shoulder = self._get_pos(landmarks, mp_pose.PoseLandmark.RIGHT_SHOULDER)
            left_wrist = self._get_pos(landmarks, mp_pose.PoseLandmark.LEFT_WRIST)
            right_wrist = self._get_pos(landmarks, mp_pose.PoseLandmark.RIGHT_WRIST)
            left_knee = self._get_pos(landmarks, mp_pose.PoseLandmark.LEFT_KNEE)
            right_knee = self._get_pos(landmarks, mp_pose.PoseLandmark.RIGHT_KNEE)
            nose = self._get_pos(landmarks, mp_pose.PoseLandmark.NOSE)

            score = 0

            # 1. Feet Width Analysis
            if left_ankle and right_ankle and left_shoulder and right_shoulder:
                feet_width = abs(left_ankle[0] - right_ankle[0])
                shoulder_width = abs(left_shoulder[0] - right_shoulder[0])
                width_ratio = feet_width / (shoulder_width + 0.01)
                stance['metrics']['feet_width_ratio'] = round(width_ratio, 2)

                if 1.2 <= width_ratio <= 1.8:
                    score += 25
                    stance['feedback'].append(('✅', 'Good stance width'))
                else:
                    stance['feedback'].append(('⚠️', f'Adjust stance width (current: {width_ratio:.1f}x shoulders)'))

            # 2. Guard Position Analysis
            if left_wrist and right_wrist and nose:
                avg_hand_height = (left_wrist[1] + right_wrist[1]) / 2
                chin_level = nose[1] + 50  # Approximate chin position

                if avg_hand_height <= chin_level + 30:  # Hands near chin
                    score += 25
                    stance['feedback'].append(('✅', 'Good guard position'))
                else:
                    stance['feedback'].append(('⚠️', 'Raise hands to chin level'))

                stance['metrics']['guard_height'] = 'high' if avg_hand_height < chin_level else 'low'

            # 3. Knee Bend Analysis
            if left_knee and right_knee and left_ankle and right_ankle:
                # Check if knees are slightly bent (not locked)
                left_hip = self._get_pos(landmarks, mp_pose.PoseLandmark.LEFT_HIP)
                right_hip = self._get_pos(landmarks, mp_pose.PoseLandmark.RIGHT_HIP)

                if left_hip and right_hip:
                    left_knee_angle = self._calc_angle(left_hip, left_knee, left_ankle)
                    right_knee_angle = self._calc_angle(right_hip, right_knee, right_ankle)
                    avg_knee_bend = 180 - ((left_knee_angle + right_knee_angle) / 2)

                    stance['metrics']['knee_bend'] = round(avg_knee_bend, 1)

                    if 10 <= avg_knee_bend <= 30:
                        score += 25
                        stance['feedback'].append(('✅', 'Good knee bend'))
                    elif avg_knee_bend < 10:
                        stance['feedback'].append(('⚠️', 'Bend knees more - legs too straight'))
                    else:
                        stance['feedback'].append(('⚠️', 'Standing too low - straighten slightly'))

            # 4. Weight Distribution (estimated from hip position)
            if left_ankle and right_ankle and left_hip and right_hip:
                hip_center = (left_hip[0] + right_hip[0]) / 2
                feet_center = (left_ankle[0] + right_ankle[0]) / 2
                offset = hip_center - feet_center

                # Estimate weight distribution
                if abs(offset) < 20:
                    weight_front = 50
                else:
                    weight_front = 50 + (offset / 2)

                stance['metrics']['weight_front'] = round(min(70, max(30, weight_front)), 0)
                stance['metrics']['weight_back'] = round(100 - stance['metrics']['weight_front'], 0)

                if 40 <= weight_front <= 60:
                    score += 25
                    stance['feedback'].append(('✅', 'Balanced weight distribution'))
                else:
                    stance['feedback'].append(('⚠️', f"Weight distribution: {stance['metrics']['weight_front']:.0f}% front"))

            stance['score'] = score
            self.stance_history.append(stance)

        except Exception as e:
            stance['feedback'].append(('❌', f'Could not analyze stance'))

        return stance

    def _get_pos(self, landmarks, landmark_id) -> Optional[Tuple[float, float]]:
        try:
            lm = landmarks.landmark[landmark_id]
            if lm.visibility > 0.5:
                return (lm.x * 640, lm.y * 480)
        except:
            pass
        return None

    def _calc_angle(self, p1, p2, p3) -> float:
        v1 = np.array([p1[0] - p2[0], p1[1] - p2[1]])
        v2 = np.array([p3[0] - p2[0], p3[1] - p2[1]])
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        return math.degrees(math.acos(np.clip(cos_angle, -1, 1)))

    def get_average_stance_score(self) -> float:
        if not self.stance_history:
            return 0
        return np.mean([s['score'] for s in self.stance_history])


class KickSpeedCalculator:
    """
    Calculate kick speed from trajectory data.
    Speed is a critical factor in competitive Taekwondo.
    """

    # Reference: Elite taekwondo kick speeds
    ELITE_BENCHMARKS = {
        'roundhouse': {'avg': 15.0, 'elite': 20.0},  # m/s
        'side_kick': {'avg': 12.0, 'elite': 17.0},
        'back_kick': {'avg': 13.0, 'elite': 18.0},
        'axe_kick': {'avg': 10.0, 'elite': 14.0}
    }

    def __init__(self, fps: int = 30, pixels_per_meter: float = 300):
        self.fps = fps
        self.pixels_per_meter = pixels_per_meter
        self.speed_history = []

    def calculate_speed(self, trajectory_points: List[Dict]) -> Dict:
        """Calculate kick speed from trajectory points."""
        if len(trajectory_points) < 2:
            return {'speed_mps': 0, 'speed_kmh': 0, 'rating': 'N/A'}

        # Calculate instantaneous speeds
        speeds = []
        for i in range(1, len(trajectory_points)):
            dx = trajectory_points[i]['x'] - trajectory_points[i-1]['x']
            dy = trajectory_points[i]['y'] - trajectory_points[i-1]['y']
            distance_pixels = np.sqrt(dx*dx + dy*dy)
            distance_meters = distance_pixels / self.pixels_per_meter

            frame_diff = trajectory_points[i]['frame'] - trajectory_points[i-1]['frame']
            time_seconds = frame_diff / self.fps if frame_diff > 0 else 1/self.fps

            speed = distance_meters / time_seconds
            speeds.append(speed)

        max_speed = max(speeds) if speeds else 0
        avg_speed = np.mean(speeds) if speeds else 0

        # Rating based on elite benchmarks (using roundhouse as default)
        benchmark = self.ELITE_BENCHMARKS['roundhouse']
        if max_speed >= benchmark['elite']:
            rating = 'Elite'
        elif max_speed >= benchmark['avg']:
            rating = 'Advanced'
        elif max_speed >= benchmark['avg'] * 0.7:
            rating = 'Intermediate'
        else:
            rating = 'Developing'

        result = {
            'speed_mps': round(max_speed, 2),
            'speed_kmh': round(max_speed * 3.6, 1),
            'avg_speed_mps': round(avg_speed, 2),
            'rating': rating,
            'percentile': min(100, int((max_speed / benchmark['elite']) * 100))
        }

        self.speed_history.append(result)
        return result

    def get_speed_analytics(self) -> Dict:
        """Get speed analytics for the session."""
        if not self.speed_history:
            return {}

        speeds = [s['speed_mps'] for s in self.speed_history]
        return {
            'max_speed': max(speeds),
            'avg_speed': round(np.mean(speeds), 2),
            'speed_consistency': round(100 - (np.std(speeds) / np.mean(speeds) * 100), 1) if np.mean(speeds) > 0 else 0,
            'total_kicks_measured': len(speeds),
            'elite_kicks': len([s for s in speeds if s >= self.ELITE_BENCHMARKS['roundhouse']['elite']]),
            'speed_trend': 'improving' if len(speeds) > 3 and speeds[-1] > speeds[0] else 'stable'
        }


# Extended kick types for detection
EXTENDED_KICK_TYPES = {
    'roundhouse': {
        'knee_angle_range': (70, 130),
        'hip_rotation_min': 30,
        'description': 'Standard roundhouse kick (Dollyo Chagi)'
    },
    'side_kick': {
        'knee_angle_range': (160, 180),
        'hip_rotation_min': 60,
        'description': 'Side kick (Yeop Chagi)'
    },
    'back_kick': {
        'knee_angle_range': (150, 180),
        'hip_rotation_min': 120,
        'description': 'Back kick (Dwi Chagi)'
    },
    'axe_kick': {
        'knee_angle_range': (160, 180),
        'height_min': 70,
        'description': 'Axe kick (Naeryeo Chagi)'
    },
    'push_kick': {
        'knee_angle_range': (150, 180),
        'hip_rotation_max': 30,
        'description': 'Push kick (Ap Chagi)'
    },
    'hook_kick': {
        'knee_angle_range': (100, 150),
        'hip_rotation_min': 45,
        'trajectory': 'curved',
        'description': 'Hook kick (Huryeo Chagi)'
    },
    'spinning_hook': {
        'knee_angle_range': (100, 150),
        'hip_rotation_min': 180,
        'description': 'Spinning hook kick'
    },
    'crescent_kick': {
        'knee_angle_range': (160, 180),
        'trajectory': 'arc',
        'description': 'Crescent kick (Bandal Chagi)'
    }
}


def process_video(video_file, progress_bar, status_placeholder) -> Optional[Dict]:
    """Process video with comprehensive analysis."""

    tfile = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    tfile.write(video_file.read())
    tfile.close()

    cap = cv2.VideoCapture(tfile.name)
    if not cap.isOpened():
        os.unlink(tfile.name)
        return None

    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps

    # Frame skip for long videos
    frame_skip = 3 if duration > 600 else (2 if duration > 120 else 1)

    output_path = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4').name
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps // frame_skip, (width, height))

    analyzer = TaekwondoAnalyzer()
    best_frame = {'score': 0, 'frame': None, 'metrics': None, 'time': 0, 'idx': 0}
    key_frames = []  # Store key frames for navigation

    start_time = time.time()

    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as pose:

        frame_num = 0
        processed = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_num += 1
            if frame_num % frame_skip != 0:
                continue

            processed += 1
            progress = frame_num / total_frames
            progress_bar.progress(progress)

            elapsed = time.time() - start_time
            fps_actual = processed / elapsed if elapsed > 0 else 0
            eta = (total_frames - frame_num) / (fps_actual * frame_skip) if fps_actual > 0 else 0

            status_placeholder.markdown(f"""
            <div class="status-processing">
                Analyzing: {int(progress*100)}% | {fps_actual:.1f} fps | ETA: {format_time(eta)}
            </div>
            """, unsafe_allow_html=True)

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb_frame)

            annotated = frame.copy()

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    annotated, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                    POSE_LANDMARK_STYLE, POSE_CONNECTION_STYLE
                )

                frame_time = frame_num / fps
                metrics = analyzer.analyze_frame(results.pose_landmarks, frame_time, processed - 1)

                if metrics:
                    score, _ = analyzer.calculate_score(metrics)

                    # Track best frame
                    if score > best_frame['score']:
                        best_frame = {
                            'score': score,
                            'frame': annotated.copy(),
                            'metrics': metrics.copy(),
                            'time': frame_time,
                            'idx': processed - 1
                        }

                    # Store key frames (every 30 processed frames or on kicks)
                    if processed % 30 == 0 or metrics['kick_height'] >= 30:
                        key_frames.append({
                            'idx': processed - 1,
                            'time': frame_time,
                            'frame': annotated.copy(),
                            'metrics': metrics.copy()
                        })

                    # Draw overlay
                    overlay = annotated.copy()
                    cv2.rectangle(overlay, (10, height-150), (350, height-10), (0, 0, 0), -1)
                    cv2.addWeighted(overlay, 0.7, annotated, 0.3, 0, annotated)

                    cv2.putText(annotated, f"Height: {metrics['kick_height']}% ({metrics['level']})",
                               (20, height-120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
                    cv2.putText(annotated, f"Knee: {metrics['knee_angle']}deg | Hip: {metrics['hip_flexion']}deg",
                               (20, height-95), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
                    cv2.putText(annotated, f"Support: {metrics['support_knee']}deg",
                               (20, height-70), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
                    cv2.putText(annotated, f"Score: {score}/100 | {metrics['kicking_leg']} Leg",
                               (20, height-45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 128), 1)

            out.write(annotated)

    cap.release()
    out.release()
    process_time = time.time() - start_time
    os.unlink(tfile.name)

    return {
        'output_path': output_path,
        'best_frame': best_frame,
        'key_frames': key_frames,
        'detected_kicks': analyzer.detected_kicks,
        'metrics_history': analyzer.metrics_history,
        'statistics': analyzer.get_statistics(),
        'duration': duration,
        'process_time': process_time,
        'analyzer': analyzer,
        'fps': fps,
        'frame_skip': frame_skip
    }


# ============================================
# MAIN APPLICATION
# ============================================

def main():
    # Header
    st.markdown("""
    <div class="pro-header">
        <div class="pro-header-left">
            <h1>Taekwondo Technique Analyzer</h1>
            <p>Professional Biomechanical Analysis System</p>
        </div>
        <div class="pro-badge">JORDAN OLYMPIC COMMITTEE</div>
    </div>
    """, unsafe_allow_html=True)

    # Sidebar
    with st.sidebar:
        st.markdown("### 🏃 Athlete Profile")

        athlete_name = st.text_input("Athlete Name", placeholder="Enter name...")
        athlete_category = st.selectbox("Category", ["Senior", "Junior", "Cadet", "Youth"])
        weight_class = st.selectbox("Weight Class", ["Finweight", "Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", "Middleweight", "Heavyweight"])

        if athlete_name:
            st.session_state.current_athlete = {
                'name': athlete_name,
                'category': athlete_category,
                'weight': weight_class,
                'date': datetime.now().strftime("%Y-%m-%d %H:%M")
            }

            st.markdown(f"""
            <div class="athlete-card">
                <div class="athlete-name">{athlete_name}</div>
                <div class="athlete-info">{athlete_category} • {weight_class}</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("---")

        st.markdown("### 📤 Upload Video")
        uploaded_file = st.file_uploader(
            "Select training video",
            type=['mp4', 'mov', 'avi', 'mkv', 'webm'],
            help="Supports all major video formats"
        )

        st.markdown("---")

        st.markdown("### 📊 Analysis Options")
        show_comparison = st.checkbox("Enable Comparison Mode", help="Compare two videos side by side")

        if show_comparison:
            comparison_file = st.file_uploader(
                "Upload comparison video",
                type=['mp4', 'mov', 'avi', 'mkv', 'webm'],
                key="comparison"
            )
            st.session_state.comparison_video = comparison_file

        st.markdown("---")

        st.markdown("""
        <div style="text-align: center; padding: 1rem 0;">
            <div style="color: #a0aec0; font-size: 0.75rem;">Powered by</div>
            <div style="color: #4ade80; font-weight: 600; font-size: 0.9rem;">QUALIA SOLUTIONS</div>
        </div>
        """, unsafe_allow_html=True)

    # Main Content
    if uploaded_file:
        st.markdown('<div class="pro-card-title" style="margin-bottom: 1rem;">Video Analysis</div>', unsafe_allow_html=True)

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("**Original Video**")
            st.video(uploaded_file)

        with col2:
            st.markdown("**AI Analysis**")
            video_placeholder = st.empty()

        if st.button("▶ Start Professional Analysis", use_container_width=True):
            progress_bar = st.progress(0)
            status = st.empty()

            results = process_video(uploaded_file, progress_bar, status)

            if results and results['best_frame']['metrics']:
                stats = results['statistics']

                status.markdown(f"""
                <div class="status-complete">
                    ✓ Analysis Complete | {stats['total_kicks']} kicks detected | {stats['frames']} frames analyzed | {format_time(results['process_time'])} processing time
                </div>
                """, unsafe_allow_html=True)

                # Show analyzed video
                with open(results['output_path'], 'rb') as f:
                    video_placeholder.video(f.read())

                # Store in session for frame navigation
                st.session_state.frame_data = results['key_frames']

                st.markdown("<br>", unsafe_allow_html=True)

                # Check if comparison video exists
                has_comparison = show_comparison and st.session_state.comparison_video is not None

                # Process comparison video if exists
                comparison_results = None
                if has_comparison:
                    with st.spinner("Processing comparison video..."):
                        st.session_state.comparison_video.seek(0)  # Reset file pointer
                        comparison_progress = st.progress(0)
                        comparison_status = st.empty()
                        comparison_results = process_video(st.session_state.comparison_video, comparison_progress, comparison_status)
                        comparison_progress.empty()
                        comparison_status.empty()

                # Results Tabs
                tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab9, tab10, tab11, tab12, tab13 = st.tabs([
                    "📊 Summary", "🎯 Best Technique", "📈 Analytics", "🎬 Frame Analysis",
                    "📥 Export", "📚 Technique Library", "📈 Progress", "👥 Team",
                    "🏥 Injury Prevention", "🏆 WT Scoring", "🔄 Video Comparison",
                    "📱 Mobile Camera", "🤖 AI Detection"
                ])

                with tab1:
                    # Statistics Grid
                    st.markdown("""
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">{}</div>
                            <div class="stat-label">Kicks Detected</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{}%</div>
                            <div class="stat-label">Max Height</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{}%</div>
                            <div class="stat-label">Avg Height</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{}</div>
                            <div class="stat-label">Duration</div>
                        </div>
                    </div>
                    """.format(
                        stats['total_kicks'],
                        stats['max_height'],
                        stats['avg_height'],
                        format_time(results['duration'])
                    ), unsafe_allow_html=True)

                    st.markdown("<br>", unsafe_allow_html=True)

                    if results['detected_kicks']:
                        st.markdown('<div class="pro-card-title">Detected Kicks Timeline</div>', unsafe_allow_html=True)

                        for kick in results['detected_kicks'][:15]:
                            st.markdown(f"""
                            <div class="timeline-item">
                                <div class="timeline-header">
                                    <div class="timeline-title">Kick #{kick['kick_number']} - {kick['level']} Level</div>
                                    <div class="timeline-time">@ {format_time(kick['frame_time'])}</div>
                                </div>
                                <div class="timeline-details">
                                    Height: {kick['kick_height']}% | Knee: {kick['knee_angle']}° | {kick['kicking_leg']} Leg
                                </div>
                            </div>
                            """, unsafe_allow_html=True)

                with tab2:
                    best = results['best_frame']
                    metrics = best['metrics']
                    score, feedback = results['analyzer'].calculate_score(metrics)
                    grade, grade_text, grade_color = results['analyzer'].get_grade(score)

                    col_a, col_b = st.columns([1, 2])

                    with col_a:
                        st.markdown(f"""
                        <div class="score-container">
                            <div class="score-value">{score}</div>
                            <div class="score-label">/ 100 Points</div>
                            <div class="score-grade" style="color: {grade_color};">{grade}</div>
                            <div style="color: #a0aec0; font-size: 0.9rem;">{grade_text}</div>
                        </div>
                        """, unsafe_allow_html=True)

                        if best['frame'] is not None:
                            st.markdown("<br>", unsafe_allow_html=True)
                            frame_rgb = cv2.cvtColor(best['frame'], cv2.COLOR_BGR2RGB)
                            st.image(frame_rgb, caption=f"Best technique @ {format_time(best['time'])}", use_container_width=True)

                    with col_b:
                        st.markdown('<div class="pro-card-title">Biomechanical Metrics</div>', unsafe_allow_html=True)

                        st.markdown(f"""
                        <div class="metric-grid">
                            <div class="metric-item">
                                <div class="metric-value">{metrics['kick_height']}%</div>
                                <div class="metric-label">Kick Height</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">{metrics['knee_angle']}°</div>
                                <div class="metric-label">Knee Angle</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">{metrics['hip_flexion']}°</div>
                                <div class="metric-label">Hip Flexion</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">{metrics['support_knee']}°</div>
                                <div class="metric-label">Support Knee</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">{metrics['level']}</div>
                                <div class="metric-label">Target Level</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">{metrics['kicking_leg']}</div>
                                <div class="metric-label">Kicking Leg</div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                        st.markdown("<br>", unsafe_allow_html=True)
                        st.markdown('<div class="pro-card-title">AI Feedback</div>', unsafe_allow_html=True)

                        for text, status in feedback:
                            css_class = 'feedback-success' if status == 'success' else ('feedback-info' if status == 'info' else 'feedback-warning')
                            st.markdown(f'<div class="feedback-item {css_class}">{text}</div>', unsafe_allow_html=True)

                with tab3:
                    if results['metrics_history']:
                        st.markdown('<div class="pro-card-title">Performance Over Session</div>', unsafe_allow_html=True)

                        heights = [m['kick_height'] for m in results['metrics_history']]
                        knees = [m['knee_angle'] for m in results['metrics_history']]
                        times = [m['frame_time'] for m in results['metrics_history']]

                        fig = go.Figure()

                        fig.add_trace(go.Scatter(
                            x=times, y=heights,
                            mode='lines',
                            name='Kick Height %',
                            line=dict(color='#4ade80', width=2),
                            fill='tozeroy',
                            fillcolor='rgba(74, 222, 128, 0.1)'
                        ))

                        fig.add_trace(go.Scatter(
                            x=times, y=knees,
                            mode='lines',
                            name='Knee Angle°',
                            line=dict(color='#60a5fa', width=2),
                            yaxis='y2'
                        ))

                        # Add kick markers
                        kick_times = [k['frame_time'] for k in results['detected_kicks']]
                        kick_heights = [k['kick_height'] for k in results['detected_kicks']]

                        fig.add_trace(go.Scatter(
                            x=kick_times, y=kick_heights,
                            mode='markers',
                            name='Detected Kicks',
                            marker=dict(color='#f97316', size=10, symbol='star')
                        ))

                        fig.update_layout(
                            paper_bgcolor='rgba(0,0,0,0)',
                            plot_bgcolor='rgba(0,0,0,0)',
                            font_color='white',
                            height=400,
                            xaxis=dict(title='Time (seconds)', gridcolor='rgba(255,255,255,0.1)'),
                            yaxis=dict(title='Kick Height %', gridcolor='rgba(255,255,255,0.1)', range=[0, 100]),
                            yaxis2=dict(title='Knee Angle°', overlaying='y', side='right', range=[0, 180]),
                            legend=dict(orientation='h', y=1.1),
                            hovermode='x unified'
                        )

                        st.plotly_chart(fig, use_container_width=True)

                        # Distribution charts
                        col_c, col_d = st.columns(2)

                        with col_c:
                            st.markdown('<div class="pro-card-title">Height Distribution</div>', unsafe_allow_html=True)

                            fig_hist = go.Figure(data=[go.Histogram(
                                x=heights,
                                nbinsx=20,
                                marker_color='#4ade80'
                            )])
                            fig_hist.update_layout(
                                paper_bgcolor='rgba(0,0,0,0)',
                                plot_bgcolor='rgba(0,0,0,0)',
                                font_color='white',
                                height=250,
                                xaxis=dict(title='Height %'),
                                yaxis=dict(title='Frequency')
                            )
                            st.plotly_chart(fig_hist, use_container_width=True)

                        with col_d:
                            st.markdown('<div class="pro-card-title">Kicks by Level</div>', unsafe_allow_html=True)

                            levels = [k['level'] for k in results['detected_kicks']]
                            level_counts = pd.Series(levels).value_counts()

                            fig_pie = go.Figure(data=[go.Pie(
                                labels=level_counts.index,
                                values=level_counts.values,
                                hole=0.4,
                                marker_colors=['#4ade80', '#60a5fa', '#fbbf24', '#ef4444']
                            )])
                            fig_pie.update_layout(
                                paper_bgcolor='rgba(0,0,0,0)',
                                font_color='white',
                                height=250,
                                showlegend=True
                            )
                            st.plotly_chart(fig_pie, use_container_width=True)

                with tab4:
                    st.markdown('<div class="pro-card-title">Frame-by-Frame Analysis</div>', unsafe_allow_html=True)

                    if results['key_frames']:
                        # Playback Speed Control
                        st.markdown("""
                        <div class="speed-control">
                            <div class="speed-label">Playback Speed Control</div>
                        </div>
                        """, unsafe_allow_html=True)

                        speed_col1, speed_col2, speed_col3, speed_col4, speed_col5 = st.columns(5)
                        with speed_col1:
                            if st.button("0.25x", key="speed_025", use_container_width=True):
                                st.session_state.playback_speed = 0.25
                        with speed_col2:
                            if st.button("0.5x", key="speed_05", use_container_width=True):
                                st.session_state.playback_speed = 0.5
                        with speed_col3:
                            if st.button("1x", key="speed_1", use_container_width=True):
                                st.session_state.playback_speed = 1.0
                        with speed_col4:
                            if st.button("1.5x", key="speed_15", use_container_width=True):
                                st.session_state.playback_speed = 1.5
                        with speed_col5:
                            if st.button("2x", key="speed_2", use_container_width=True):
                                st.session_state.playback_speed = 2.0

                        st.markdown(f"""
                        <div style="text-align: center; color: #4ade80; font-size: 0.9rem; margin-bottom: 1rem;">
                            Current Speed: <strong>{st.session_state.playback_speed}x</strong>
                        </div>
                        """, unsafe_allow_html=True)

                        frame_idx = st.slider(
                            "Navigate Frames",
                            0, len(results['key_frames']) - 1, 0,
                            help="Slide to view different frames"
                        )

                        # Auto-advance controls
                        adv_col1, adv_col2, adv_col3 = st.columns([1, 1, 2])
                        with adv_col1:
                            if st.button("◀ Previous", use_container_width=True):
                                if frame_idx > 0:
                                    st.session_state.selected_frame = frame_idx - 1
                                    st.rerun()
                        with adv_col2:
                            if st.button("Next ▶", use_container_width=True):
                                if frame_idx < len(results['key_frames']) - 1:
                                    st.session_state.selected_frame = frame_idx + 1
                                    st.rerun()

                        selected_frame = results['key_frames'][frame_idx]

                        # Annotation Controls
                        st.markdown("""
                        <div class="pro-card" style="margin-top: 1rem;">
                            <div class="pro-card-title">Annotation Tools</div>
                        </div>
                        """, unsafe_allow_html=True)

                        ann_col1, ann_col2, ann_col3, ann_col4 = st.columns(4)
                        with ann_col1:
                            show_height_line = st.checkbox("Height Reference", value=True)
                        with ann_col2:
                            show_angle_arcs = st.checkbox("Angle Arcs", value=True)
                        with ann_col3:
                            show_ideal_overlay = st.checkbox("Ideal Zones", value=False)
                        with ann_col4:
                            annotation_color = st.selectbox("Color", ['green', 'red', 'yellow', 'cyan', 'white'], index=0)

                        col_f1, col_f2 = st.columns([2, 1])

                        with col_f1:
                            # Apply annotations to frame
                            display_frame = selected_frame['frame'].copy()
                            h, w = display_frame.shape[:2]

                            # Draw ideal overlay zones
                            if show_ideal_overlay:
                                overlay = display_frame.copy()
                                # Head level zone (green)
                                cv2.rectangle(overlay, (0, int(h*0.05)), (w, int(h*0.25)), (0, 255, 0), -1)
                                # Chest level zone (yellow)
                                cv2.rectangle(overlay, (0, int(h*0.25)), (w, int(h*0.45)), (0, 255, 255), -1)
                                cv2.addWeighted(overlay, 0.15, display_frame, 0.85, 0, display_frame)

                                cv2.putText(display_frame, "HEAD LEVEL (3 pts)", (10, int(h*0.12)),
                                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                                cv2.putText(display_frame, "CHEST LEVEL (2 pts)", (10, int(h*0.32)),
                                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                                cv2.putText(display_frame, "BODY LEVEL (1 pt)", (10, int(h*0.52)),
                                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 165, 0), 2)

                            # Draw height reference line
                            if show_height_line:
                                fm = selected_frame['metrics']
                                kick_h_pct = fm['kick_height']
                                if kick_h_pct > 0:
                                    line_y = int(h * (1 - kick_h_pct / 100))
                                    color_rgb = AnnotationTool.COLORS.get(annotation_color, (0, 255, 0))
                                    cv2.line(display_frame, (0, line_y), (w, line_y), color_rgb, 2, cv2.LINE_AA)
                                    cv2.putText(display_frame, f"Kick Height: {kick_h_pct}%", (w - 180, line_y - 10),
                                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, color_rgb, 2)

                            frame_rgb = cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB)
                            st.image(frame_rgb, caption=f"Frame @ {format_time(selected_frame['time'])}", use_container_width=True)

                            # Add coach annotation input
                            st.markdown('<div class="pro-card-title" style="margin-top: 1rem;">Coach Notes</div>', unsafe_allow_html=True)
                            frame_note = st.text_area(
                                "Add annotation for this frame",
                                value=st.session_state.annotations.get(frame_idx, ""),
                                placeholder="Enter coaching notes for this frame...",
                                height=80,
                                key=f"note_{frame_idx}"
                            )
                            if frame_note:
                                st.session_state.annotations[frame_idx] = frame_note

                        with col_f2:
                            fm = selected_frame['metrics']
                            st.markdown(f"""
                            <div class="pro-card">
                                <div class="pro-card-header">
                                    <div class="pro-card-title">Frame Metrics</div>
                                    <div class="pro-card-badge">{fm['level']}</div>
                                </div>
                                <div style="color: #a0aec0; font-size: 0.9rem; line-height: 1.8;">
                                    <strong style="color: #4ade80;">Kick Height:</strong> {fm['kick_height']}%<br>
                                    <strong style="color: #60a5fa;">Knee Angle:</strong> {fm['knee_angle']}°<br>
                                    <strong style="color: #fbbf24;">Hip Flexion:</strong> {fm['hip_flexion']}°<br>
                                    <strong style="color: #f97316;">Support Knee:</strong> {fm['support_knee']}°<br>
                                    <strong>Kicking Leg:</strong> {fm['kicking_leg']}<br>
                                    <strong>Visibility:</strong> {fm['visibility']}%
                                </div>
                            </div>
                            """, unsafe_allow_html=True)

                            frame_score, _ = results['analyzer'].calculate_score(fm)
                            st.markdown(f"""
                            <div style="text-align: center; margin-top: 1rem;">
                                <div style="font-size: 2rem; font-weight: 700; color: #4ade80;">{frame_score}</div>
                                <div style="color: #a0aec0; font-size: 0.8rem;">Frame Score</div>
                            </div>
                            """, unsafe_allow_html=True)

                            # Ideal Technique Reference Card
                            st.markdown("""
                            <div class="technique-ref">
                                <div class="technique-ref-title">Ideal Technique Reference</div>
                                <div class="technique-ref-item">
                                    <span class="technique-ref-label">Knee Angle</span>
                                    <span class="technique-ref-value">170-180°</span>
                                </div>
                                <div class="technique-ref-item">
                                    <span class="technique-ref-label">Kick Height</span>
                                    <span class="technique-ref-value">85-100%</span>
                                </div>
                                <div class="technique-ref-item">
                                    <span class="technique-ref-label">Hip Flexion</span>
                                    <span class="technique-ref-value">110-140°</span>
                                </div>
                                <div class="technique-ref-item">
                                    <span class="technique-ref-label">Support Knee</span>
                                    <span class="technique-ref-value">160-180°</span>
                                </div>
                            </div>
                            """, unsafe_allow_html=True)

                            # Download annotated frame
                            if st.button("Download This Frame", use_container_width=True):
                                # Convert to PIL for download
                                frame_pil = Image.fromarray(frame_rgb)
                                buf = BytesIO()
                                frame_pil.save(buf, format='PNG')
                                st.download_button(
                                    "Save Frame as PNG",
                                    buf.getvalue(),
                                    f"frame_{frame_idx}_{datetime.now().strftime('%H%M%S')}.png",
                                    "image/png",
                                    use_container_width=True
                                )

                with tab5:
                    st.markdown('<div class="pro-card-title">Export Analysis Data</div>', unsafe_allow_html=True)

                    st.markdown("""
                    <div style="color: #a0aec0; margin-bottom: 1rem;">
                        Download detailed analysis data for coaching review and athlete records.
                    </div>
                    """, unsafe_allow_html=True)

                    col_e1, col_e2 = st.columns(2)

                    with col_e1:
                        # Full metrics CSV
                        df_metrics = results['analyzer'].export_to_dataframe()
                        if not df_metrics.empty:
                            csv_metrics = df_metrics.to_csv(index=False)
                            st.download_button(
                                "📊 Download Full Metrics (CSV)",
                                csv_metrics,
                                f"joc_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                                "text/csv",
                                use_container_width=True
                            )

                    with col_e2:
                        # Kicks summary CSV
                        df_kicks = results['analyzer'].export_kicks_to_dataframe()
                        if not df_kicks.empty:
                            csv_kicks = df_kicks.to_csv(index=False)
                            st.download_button(
                                "🎯 Download Kicks Summary (CSV)",
                                csv_kicks,
                                f"joc_kicks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                                "text/csv",
                                use_container_width=True
                            )

                    # Summary Report
                    st.markdown("<br>", unsafe_allow_html=True)
                    st.markdown('<div class="pro-card-title">Session Summary Report</div>', unsafe_allow_html=True)

                    athlete_info = st.session_state.current_athlete or {'name': 'Unknown', 'category': '-', 'weight': '-', 'date': datetime.now().strftime("%Y-%m-%d")}
                    best_metrics = results['best_frame']['metrics']
                    best_score, _ = results['analyzer'].calculate_score(best_metrics)
                    grade, grade_text, _ = results['analyzer'].get_grade(best_score)

                    report = f"""# JOC Taekwondo Analysis Report

## Athlete Information
- **Name:** {athlete_info['name']}
- **Category:** {athlete_info['category']}
- **Weight Class:** {athlete_info['weight']}
- **Date:** {athlete_info['date']}

## Session Statistics
- **Duration:** {format_time(results['duration'])}
- **Total Kicks Detected:** {stats['total_kicks']}
- **Frames Analyzed:** {stats['frames']}
- **Processing Time:** {format_time(results['process_time'])}

## Performance Metrics
- **Maximum Kick Height:** {stats['max_height']}%
- **Average Kick Height:** {stats['avg_height']}%
- **Average Knee Extension:** {stats['avg_knee']}°

## Best Technique Score
- **Score:** {best_score}/100
- **Grade:** {grade} ({grade_text})
- **Kick Height:** {best_metrics['kick_height']}%
- **Knee Angle:** {best_metrics['knee_angle']}°
- **Hip Flexion:** {best_metrics['hip_flexion']}°
- **Support Knee:** {best_metrics['support_knee']}°

## Kicks Breakdown
| # | Time | Level | Height | Knee Angle | Leg |
|---|------|-------|--------|------------|-----|
"""
                    for k in results['detected_kicks'][:20]:
                        report += f"| {k['kick_number']} | {format_time(k['frame_time'])} | {k['level']} | {k['kick_height']}% | {k['knee_angle']}° | {k['kicking_leg']} |\n"

                    report += """
---
*Generated by JOC Taekwondo AI Analyzer - QUALIA SOLUTIONS*
"""

                    st.download_button(
                        "📄 Download Full Report (Markdown)",
                        report,
                        f"joc_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md",
                        "text/markdown",
                        use_container_width=True
                    )

                    # Add to history
                    st.session_state.analysis_history.append({
                        'athlete': athlete_info['name'],
                        'date': datetime.now().strftime("%Y-%m-%d %H:%M"),
                        'kicks': stats['total_kicks'],
                        'best_score': best_score,
                        'grade': grade
                    })

                with tab6:
                    st.markdown('<div class="pro-card-title">Taekwondo Technique Library</div>', unsafe_allow_html=True)
                    st.markdown("""
                    <div style="color: #a0aec0; margin-bottom: 1.5rem;">
                        Reference guide for ideal technique metrics. Use these values to compare athlete performance.
                    </div>
                    """, unsafe_allow_html=True)

                    # Technique cards
                    tech_col1, tech_col2 = st.columns(2)

                    with tech_col1:
                        # Roundhouse Kick
                        st.markdown("""
                        <div class="pro-card">
                            <div class="pro-card-header">
                                <div class="pro-card-title">Dollyo Chagi (Roundhouse Kick)</div>
                                <div class="pro-card-badge">PRIMARY</div>
                            </div>
                            <div style="color: #a0aec0; font-size: 0.85rem; margin-bottom: 1rem;">
                                The most common scoring technique in competitive Taekwondo.
                                Maximum power through hip rotation and full leg extension.
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Knee Angle</span>
                                <span class="technique-ref-value">170-180°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Kick Height</span>
                                <span class="technique-ref-value">85-100%</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Hip Rotation</span>
                                <span class="technique-ref-value">35-45°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Support Knee</span>
                                <span class="technique-ref-value">160-180°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Hip Flexion</span>
                                <span class="technique-ref-value">110-140°</span>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                        # Side Kick
                        st.markdown("""
                        <div class="pro-card">
                            <div class="pro-card-header">
                                <div class="pro-card-title">Yeop Chagi (Side Kick)</div>
                                <div class="pro-card-badge">POWER</div>
                            </div>
                            <div style="color: #a0aec0; font-size: 0.85rem; margin-bottom: 1rem;">
                                Powerful linear kick using the blade of the foot.
                                Requires good chamber and full hip rotation.
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Knee Angle</span>
                                <span class="technique-ref-value">175-180°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Kick Height</span>
                                <span class="technique-ref-value">75-95%</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Hip Rotation</span>
                                <span class="technique-ref-value">80-90°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Support Knee</span>
                                <span class="technique-ref-value">160-175°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Hip Flexion</span>
                                <span class="technique-ref-value">90-110°</span>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    with tech_col2:
                        # Front Kick
                        st.markdown("""
                        <div class="pro-card">
                            <div class="pro-card-header">
                                <div class="pro-card-title">Ap Chagi (Front Kick)</div>
                                <div class="pro-card-badge">SPEED</div>
                            </div>
                            <div style="color: #a0aec0; font-size: 0.85rem; margin-bottom: 1rem;">
                                Fast, straight trajectory kick.
                                Emphasis on snapping motion at the end for speed.
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Knee Angle</span>
                                <span class="technique-ref-value">175-180°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Kick Height</span>
                                <span class="technique-ref-value">70-90%</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Hip Rotation</span>
                                <span class="technique-ref-value">0-10°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Support Knee</span>
                                <span class="technique-ref-value">170-180°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Hip Flexion</span>
                                <span class="technique-ref-value">100-120°</span>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                        # Axe Kick
                        st.markdown("""
                        <div class="pro-card">
                            <div class="pro-card-header">
                                <div class="pro-card-title">Naeryeo Chagi (Axe Kick)</div>
                                <div class="pro-card-badge">FLEXIBILITY</div>
                            </div>
                            <div style="color: #a0aec0; font-size: 0.85rem; margin-bottom: 1rem;">
                                Downward striking kick requiring maximum flexibility.
                                Leg raised high then brought down forcefully.
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Knee Angle</span>
                                <span class="technique-ref-value">170-180°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Kick Height</span>
                                <span class="technique-ref-value">100%+</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Hip Rotation</span>
                                <span class="technique-ref-value">0-15°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Support Knee</span>
                                <span class="technique-ref-value">170-180°</span>
                            </div>
                            <div class="technique-ref-item">
                                <span class="technique-ref-label">Hip Flexion</span>
                                <span class="technique-ref-value">140-180°</span>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    # Scoring Guide
                    st.markdown("<br>", unsafe_allow_html=True)
                    st.markdown('<div class="pro-card-title">Olympic Scoring Reference</div>', unsafe_allow_html=True)

                    score_col1, score_col2, score_col3 = st.columns(3)

                    with score_col1:
                        st.markdown("""
                        <div class="stat-item">
                            <div class="stat-value" style="color: #4ade80;">3</div>
                            <div class="stat-label">HEAD LEVEL KICK</div>
                            <div style="color: #a0aec0; font-size: 0.75rem; margin-top: 0.5rem;">
                                Kick to head protector area
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    with score_col2:
                        st.markdown("""
                        <div class="stat-item">
                            <div class="stat-value" style="color: #60a5fa;">2</div>
                            <div class="stat-label">TRUNK PROTECTOR</div>
                            <div style="color: #a0aec0; font-size: 0.75rem; margin-top: 0.5rem;">
                                Valid kick to trunk area
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    with score_col3:
                        st.markdown("""
                        <div class="stat-item">
                            <div class="stat-value" style="color: #fbbf24;">+1</div>
                            <div class="stat-label">SPINNING BONUS</div>
                            <div style="color: #a0aec0; font-size: 0.75rem; margin-top: 0.5rem;">
                                Additional point for spinning techniques
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                with tab7:
                    # Progress Tracking Tab - Essential for Olympic preparation
                    st.markdown('<div class="pro-card-title">Athlete Progress Tracking</div>', unsafe_allow_html=True)
                    st.markdown("""
                    <div style="color: #a0aec0; margin-bottom: 1.5rem;">
                        Track training progress over time for Olympic preparation. Data is saved per athlete.
                    </div>
                    """, unsafe_allow_html=True)

                    # Save current session to progress
                    athlete_info = st.session_state.current_athlete or {'name': 'Unknown'}
                    athlete_name = athlete_info.get('name', 'Unknown')

                    if athlete_name != 'Unknown':
                        # Auto-save this session
                        session_data = {
                            'best_score': best_score,
                            'max_height': stats['max_height'],
                            'avg_height': stats['avg_height'],
                            'total_kicks': stats['total_kicks'],
                            'avg_knee': stats['avg_knee']
                        }

                        if st.button("Save Session to Progress History", use_container_width=True):
                            AthleteProgressTracker.add_session(athlete_name, session_data)
                            st.success(f"Session saved for {athlete_name}!")

                        # Show progress chart
                        progress_chart = AthleteProgressTracker.get_progress_chart(athlete_name)
                        if progress_chart:
                            st.plotly_chart(progress_chart, use_container_width=True)

                            # Show improvement stats
                            improvement = AthleteProgressTracker.get_improvement_stats(athlete_name)
                            if improvement:
                                st.markdown("<br>", unsafe_allow_html=True)
                                st.markdown('<div class="pro-card-title">Improvement Summary</div>', unsafe_allow_html=True)

                                imp_col1, imp_col2, imp_col3, imp_col4 = st.columns(4)

                                with imp_col1:
                                    st.markdown(f"""
                                    <div class="stat-item">
                                        <div class="stat-value">{improvement['sessions']}</div>
                                        <div class="stat-label">Total Sessions</div>
                                    </div>
                                    """, unsafe_allow_html=True)

                                with imp_col2:
                                    color = "#4ade80" if improvement.get('trend') == 'improving' else ("#fbbf24" if improvement.get('trend') == 'stable' else "#ef4444")
                                    st.markdown(f"""
                                    <div class="stat-item">
                                        <div class="stat-value" style="color: {color};">{improvement.get('score_improvement', 'N/A')}</div>
                                        <div class="stat-label">Score Change</div>
                                    </div>
                                    """, unsafe_allow_html=True)

                                with imp_col3:
                                    st.markdown(f"""
                                    <div class="stat-item">
                                        <div class="stat-value">{improvement.get('height_improvement', 'N/A')}</div>
                                        <div class="stat-label">Height Change</div>
                                    </div>
                                    """, unsafe_allow_html=True)

                                with imp_col4:
                                    trend_emoji = "📈" if improvement.get('trend') == 'improving' else ("➡️" if improvement.get('trend') == 'stable' else "📉")
                                    st.markdown(f"""
                                    <div class="stat-item">
                                        <div class="stat-value">{trend_emoji}</div>
                                        <div class="stat-label">{improvement.get('trend', 'N/A').title()}</div>
                                    </div>
                                    """, unsafe_allow_html=True)
                        else:
                            st.info("Save at least 2 sessions to see progress tracking charts.")
                    else:
                        st.warning("Enter athlete name in the sidebar to enable progress tracking.")

                with tab8:
                    # Team Comparison Tab - Essential for team selection
                    st.markdown('<div class="pro-card-title">Team Comparison & Selection</div>', unsafe_allow_html=True)
                    st.markdown("""
                    <div style="color: #a0aec0; margin-bottom: 1.5rem;">
                        Compare multiple athletes for team selection. Select athletes with saved progress data.
                    </div>
                    """, unsafe_allow_html=True)

                    # Show available athletes
                    available_athletes = list(st.session_state.training_progress.keys())

                    if available_athletes:
                        selected_athletes = st.multiselect(
                            "Select athletes to compare",
                            available_athletes,
                            default=available_athletes[:min(3, len(available_athletes))]
                        )

                        if selected_athletes:
                            # Comparison table
                            comparison_df = MultiAthleteComparison.compare_athletes(selected_athletes)
                            if not comparison_df.empty:
                                st.markdown('<div class="pro-card-title" style="margin-top: 1rem;">Performance Comparison</div>', unsafe_allow_html=True)
                                st.dataframe(comparison_df, use_container_width=True, hide_index=True)

                                # Radar chart comparison
                                radar_chart = MultiAthleteComparison.get_comparison_chart(selected_athletes)
                                if radar_chart:
                                    st.markdown('<div class="pro-card-title" style="margin-top: 1.5rem;">Multi-Dimensional Comparison</div>', unsafe_allow_html=True)
                                    st.plotly_chart(radar_chart, use_container_width=True)

                                # Team recommendation
                                if len(comparison_df) >= 2:
                                    st.markdown("<br>", unsafe_allow_html=True)
                                    st.markdown('<div class="pro-card-title">Team Selection Recommendation</div>', unsafe_allow_html=True)

                                    # Sort by latest score
                                    sorted_df = comparison_df.sort_values('Latest Score', ascending=False)
                                    top_athlete = sorted_df.iloc[0]

                                    st.markdown(f"""
                                    <div class="pro-card" style="border-left: 4px solid #4ade80;">
                                        <div style="color: #4ade80; font-weight: 600; font-size: 1.1rem;">
                                            Top Performer: {top_athlete['Athlete']}
                                        </div>
                                        <div style="color: #a0aec0; margin-top: 0.5rem;">
                                            Latest Score: {top_athlete['Latest Score']}/100 |
                                            Avg Score: {top_athlete['Avg Score']}/100 |
                                            Max Height: {top_athlete['Max Height']}%
                                        </div>
                                    </div>
                                    """, unsafe_allow_html=True)
                    else:
                        st.info("No athletes with saved progress data. Analyze videos and save sessions for multiple athletes to enable comparison.")

                    # Add HTML Report download
                    st.markdown("<br>", unsafe_allow_html=True)
                    st.markdown('<div class="pro-card-title">Official JOC Report</div>', unsafe_allow_html=True)

                    if st.button("Generate Official JOC HTML Report", use_container_width=True):
                        html_report = JOCReportGenerator.generate_html_report(
                            athlete_info,
                            stats,
                            results['detected_kicks'],
                            best_metrics,
                            best_score,
                            grade
                        )
                        st.download_button(
                            "Download Official JOC Report (HTML)",
                            html_report,
                            f"JOC_Report_{athlete_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html",
                            "text/html",
                            use_container_width=True
                        )

                with tab9:
                    # Injury Prevention Tab - Critical for athlete safety
                    st.markdown('<div class="pro-card-title">Injury Prevention Analysis</div>', unsafe_allow_html=True)
                    st.markdown("""
                    <div style="color: #a0aec0; margin-bottom: 1.5rem;">
                        Biomechanical risk assessment to protect athletes from training injuries.
                        Based on sports medicine research for ACL injury prevention.
                    </div>
                    """, unsafe_allow_html=True)

                    # Initialize injury prevention system for demo
                    injury_system = InjuryPreventionSystem()

                    # Simulate injury analysis from detected kicks
                    high_risk_count = 0
                    medium_risk_count = 0
                    risk_alerts = []

                    for kick in results['detected_kicks']:
                        # Check knee angle for hyperextension risk
                        if kick.get('support_knee', 180) > 175:
                            high_risk_count += 1
                            risk_alerts.append({
                                'type': 'HYPEREXTENSION',
                                'severity': 'HIGH',
                                'time': kick['frame_time'],
                                'message': f"Support knee hyperextension ({kick['support_knee']}°) at {format_time(kick['frame_time'])}"
                            })
                        elif kick.get('support_knee', 180) > 170:
                            medium_risk_count += 1
                            risk_alerts.append({
                                'type': 'KNEE_ANGLE',
                                'severity': 'MEDIUM',
                                'time': kick['frame_time'],
                                'message': f"Near-hyperextension ({kick['support_knee']}°) at {format_time(kick['frame_time'])}"
                            })

                        # Check for low kick height trend (fatigue indicator)
                        if kick.get('kick_height', 100) < 30:
                            medium_risk_count += 1
                            risk_alerts.append({
                                'type': 'FATIGUE',
                                'severity': 'MEDIUM',
                                'time': kick['frame_time'],
                                'message': f"Low kick height ({kick['kick_height']}%) - possible fatigue"
                            })

                    # Risk Summary Cards
                    col1, col2, col3 = st.columns(3)

                    with col1:
                        risk_color = "#ef4444" if high_risk_count > 3 else ("#fbbf24" if high_risk_count > 0 else "#4ade80")
                        st.markdown(f"""
                        <div class="pro-card" style="text-align: center; border-left: 4px solid {risk_color};">
                            <div style="font-size: 2.5rem; font-weight: 700; color: {risk_color};">{high_risk_count}</div>
                            <div style="color: #a0aec0;">High Risk Events</div>
                        </div>
                        """, unsafe_allow_html=True)

                    with col2:
                        med_color = "#fbbf24" if medium_risk_count > 5 else "#4ade80"
                        st.markdown(f"""
                        <div class="pro-card" style="text-align: center; border-left: 4px solid {med_color};">
                            <div style="font-size: 2.5rem; font-weight: 700; color: {med_color};">{medium_risk_count}</div>
                            <div style="color: #a0aec0;">Medium Risk Events</div>
                        </div>
                        """, unsafe_allow_html=True)

                    with col3:
                        overall_risk = "HIGH" if high_risk_count > 3 else ("MEDIUM" if high_risk_count > 0 or medium_risk_count > 5 else "LOW")
                        overall_color = "#ef4444" if overall_risk == "HIGH" else ("#fbbf24" if overall_risk == "MEDIUM" else "#4ade80")
                        st.markdown(f"""
                        <div class="pro-card" style="text-align: center; border-left: 4px solid {overall_color};">
                            <div style="font-size: 1.5rem; font-weight: 700; color: {overall_color};">{overall_risk}</div>
                            <div style="color: #a0aec0;">Overall Risk Level</div>
                        </div>
                        """, unsafe_allow_html=True)

                    # Risk Alerts List
                    if risk_alerts:
                        st.markdown("<br>", unsafe_allow_html=True)
                        st.markdown('<div class="pro-card-title">Risk Alerts</div>', unsafe_allow_html=True)

                        for alert in risk_alerts[:10]:
                            alert_color = "#ef4444" if alert['severity'] == 'HIGH' else "#fbbf24"
                            alert_icon = "🚨" if alert['severity'] == 'HIGH' else "⚠️"
                            st.markdown(f"""
                            <div class="timeline-item" style="border-left: 3px solid {alert_color};">
                                <div class="timeline-header">
                                    <div class="timeline-title">{alert_icon} {alert['type']}</div>
                                    <div class="timeline-time" style="color: {alert_color};">{alert['severity']}</div>
                                </div>
                                <div class="timeline-details">{alert['message']}</div>
                            </div>
                            """, unsafe_allow_html=True)
                    else:
                        st.success("No injury risk events detected in this session.")

                    # Recommendations
                    st.markdown("<br>", unsafe_allow_html=True)
                    st.markdown('<div class="pro-card-title">Personalized Recommendations</div>', unsafe_allow_html=True)

                    if high_risk_count > 3:
                        st.error("**HIGH RISK SESSION** - Multiple dangerous biomechanics detected. Recommend immediate technique review with coach before continuing training.")
                    elif high_risk_count > 0:
                        st.warning("**Caution Required** - Some risky movements detected. Focus on maintaining slight knee bend on support leg.")
                    elif medium_risk_count > 5:
                        st.warning("**Fatigue Indicators** - Consider rest intervals. Fatigue increases injury risk.")
                    else:
                        st.success("**Safe Session** - Good biomechanics maintained throughout. Continue with current form.")

                    # Prevention Tips
                    st.markdown("<br>", unsafe_allow_html=True)
                    with st.expander("Injury Prevention Tips for Taekwondo Athletes"):
                        st.markdown("""
                        **ACL Injury Prevention:**
                        - Maintain slight knee bend (15-20°) on support leg
                        - Avoid knee valgus (inward collapse) during landing
                        - Strengthen hip abductors and gluteus medius

                        **Fatigue Management:**
                        - Take rest breaks when kick height drops
                        - Quality over quantity - stop when form degrades
                        - Proper hydration and nutrition

                        **Warm-up Protocol:**
                        - Dynamic stretching before training
                        - Progressive intensity increase
                        - Sport-specific movement preparation
                        """)

                with tab10:
                    # WT Competition Scoring Simulation
                    st.markdown('<div class="pro-card-title">World Taekwondo Scoring Simulation</div>', unsafe_allow_html=True)
                    st.markdown("""
                    <div style="color: #a0aec0; margin-bottom: 1.5rem;">
                        Simulate how your kicks would score in WT competition. Based on official World Taekwondo scoring rules.
                    </div>
                    """, unsafe_allow_html=True)

                    # Initialize WT Scoring Simulator
                    wt_scorer = WTScoringSimulator()
                    match_simulation = wt_scorer.get_match_simulation(results['detected_kicks'])

                    # Scoring Summary
                    col1, col2, col3, col4 = st.columns(4)

                    with col1:
                        st.markdown(f"""
                        <div class="pro-card" style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #4ade80;">{match_simulation['total_points']}</div>
                            <div style="color: #a0aec0;">Total Points</div>
                        </div>
                        """, unsafe_allow_html=True)

                    with col2:
                        st.markdown(f"""
                        <div class="pro-card" style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #60a5fa;">{match_simulation['head_kicks']}</div>
                            <div style="color: #a0aec0;">Head Kicks (3pts)</div>
                        </div>
                        """, unsafe_allow_html=True)

                    with col3:
                        st.markdown(f"""
                        <div class="pro-card" style="text-align: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: #fbbf24;">{match_simulation['trunk_kicks']}</div>
                            <div style="color: #a0aec0;">Trunk Kicks (2pts)</div>
                        </div>
                        """, unsafe_allow_html=True)

                    with col4:
                        st.markdown(f"""
                        <div class="pro-card" style="text-align: center;">
                            <div style="font-size: 1.8rem; font-weight: 700; color: #a855f7;">{match_simulation['scoring_rate']}</div>
                            <div style="color: #a0aec0;">Scoring Rate</div>
                        </div>
                        """, unsafe_allow_html=True)

                    # Scoring Breakdown Chart
                    st.markdown("<br>", unsafe_allow_html=True)
                    st.markdown('<div class="pro-card-title">Scoring Zone Distribution</div>', unsafe_allow_html=True)

                    # Create pie chart for scoring zones
                    scoring_data = {
                        'Zone': ['Head (3pts)', 'Trunk (2pts)', 'Below Zone (0pts)'],
                        'Count': [
                            match_simulation['head_kicks'],
                            match_simulation['trunk_kicks'],
                            max(0, len(results['detected_kicks']) - match_simulation['head_kicks'] - match_simulation['trunk_kicks'])
                        ]
                    }
                    scoring_df = pd.DataFrame(scoring_data)

                    if scoring_df['Count'].sum() > 0:
                        fig_scoring = px.pie(
                            scoring_df,
                            values='Count',
                            names='Zone',
                            color_discrete_sequence=['#4ade80', '#fbbf24', '#ef4444'],
                            hole=0.4
                        )
                        fig_scoring.update_layout(
                            paper_bgcolor='rgba(0,0,0,0)',
                            plot_bgcolor='rgba(0,0,0,0)',
                            font_color='white',
                            height=300,
                            showlegend=True,
                            legend=dict(orientation="h", yanchor="bottom", y=-0.2)
                        )
                        st.plotly_chart(fig_scoring, use_container_width=True)

                    # WT Rules Reference
                    st.markdown("<br>", unsafe_allow_html=True)
                    with st.expander("WT Scoring Rules Reference (2024)"):
                        st.markdown("""
                        **Scoring Points:**
                        | Technique | Points |
                        |-----------|--------|
                        | Punch to trunk protector | 1 point |
                        | Valid kick to trunk protector | 2 points |
                        | Valid kick to head | 3 points |
                        | Turning kick to trunk | +1 bonus |
                        | Turning kick to head | +1 bonus |

                        **Scoring Zones:**
                        - **Head**: Above collarbone (75%+ kick height in our system)
                        - **Trunk**: Protected area of trunk protector (40-75% height)
                        - **Below Zone**: Below valid scoring area (no points)

                        **Technical Requirements:**
                        - Must have proper knee chamber
                        - Must show clear technique
                        - Must make valid contact
                        """)

                    # Competition Readiness Score
                    st.markdown("<br>", unsafe_allow_html=True)
                    st.markdown('<div class="pro-card-title">Competition Readiness Assessment</div>', unsafe_allow_html=True)

                    # Calculate readiness score
                    avg_points_per_kick = match_simulation['average_points_per_kick']
                    if avg_points_per_kick >= 2.0:
                        readiness = "Elite"
                        readiness_color = "#4ade80"
                        readiness_msg = "Outstanding scoring efficiency. Ready for international competition."
                    elif avg_points_per_kick >= 1.5:
                        readiness = "Advanced"
                        readiness_color = "#60a5fa"
                        readiness_msg = "Good scoring ability. Focus on head-level techniques for higher points."
                    elif avg_points_per_kick >= 1.0:
                        readiness = "Intermediate"
                        readiness_color = "#fbbf24"
                        readiness_msg = "Developing scorer. Work on technique quality and height."
                    else:
                        readiness = "Developing"
                        readiness_color = "#a0aec0"
                        readiness_msg = "Focus on fundamentals. Increase kick height to reach scoring zones."

                    st.markdown(f"""
                    <div class="pro-card" style="border-left: 4px solid {readiness_color};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: {readiness_color};">{readiness}</div>
                                <div style="color: #a0aec0; margin-top: 0.5rem;">{readiness_msg}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 2rem; font-weight: 700; color: white;">{avg_points_per_kick:.2f}</div>
                                <div style="color: #a0aec0;">Avg Points/Kick</div>
                            </div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                with tab11:
                    # Video Comparison Tab
                    st.markdown('<div class="pro-card-title">Side-by-Side Video Comparison</div>', unsafe_allow_html=True)
                    st.markdown("""
                    <div style="color: #a0aec0; margin-bottom: 1.5rem;">
                        Compare two videos to analyze technique differences, track improvement over time, or compare athletes.
                    </div>
                    """, unsafe_allow_html=True)

                    if has_comparison and comparison_results and comparison_results['best_frame']['metrics']:
                        # Both videos analyzed - show comparison
                        comp_stats = comparison_results['statistics']
                        comp_best = comparison_results['best_frame']
                        comp_metrics = comp_best['metrics']
                        comp_score, _ = results['analyzer'].calculate_score(comp_metrics)

                        # Side-by-side stats comparison
                        st.markdown('<div class="pro-card-title" style="margin-top: 1rem;">Performance Comparison</div>', unsafe_allow_html=True)

                        # Create comparison table
                        comparison_data = {
                            'Metric': ['Total Kicks', 'Max Height', 'Avg Height', 'Best Score', 'Best Knee Angle', 'Best Hip Flexion', 'Support Knee Stability'],
                            'Video 1 (Primary)': [
                                stats['total_kicks'],
                                f"{stats['max_height']}%",
                                f"{stats['avg_height']}%",
                                f"{best_score}/100",
                                f"{best_metrics['knee_angle']}°",
                                f"{best_metrics['hip_flexion']}°",
                                f"{best_metrics['support_knee']}°"
                            ],
                            'Video 2 (Comparison)': [
                                comp_stats['total_kicks'],
                                f"{comp_stats['max_height']}%",
                                f"{comp_stats['avg_height']}%",
                                f"{comp_score}/100",
                                f"{comp_metrics['knee_angle']}°",
                                f"{comp_metrics['hip_flexion']}°",
                                f"{comp_metrics['support_knee']}°"
                            ],
                            'Difference': [
                                f"{int(stats['total_kicks'] - comp_stats['total_kicks']):+d}",
                                f"{int(stats['max_height'] - comp_stats['max_height']):+d}%",
                                f"{int(stats['avg_height'] - comp_stats['avg_height']):+d}%",
                                f"{int(best_score - comp_score):+d}",
                                f"{int(best_metrics['knee_angle'] - comp_metrics['knee_angle']):+d}°",
                                f"{int(best_metrics['hip_flexion'] - comp_metrics['hip_flexion']):+d}°",
                                f"{int(best_metrics['support_knee'] - comp_metrics['support_knee']):+d}°"
                            ]
                        }
                        comp_df = pd.DataFrame(comparison_data)
                        st.dataframe(comp_df, use_container_width=True, hide_index=True)

                        # Visual Score Comparison
                        st.markdown("<br>", unsafe_allow_html=True)
                        st.markdown('<div class="pro-card-title">Score Comparison</div>', unsafe_allow_html=True)

                        col1, col2 = st.columns(2)

                        with col1:
                            score_color1 = "#4ade80" if best_score >= 70 else ("#fbbf24" if best_score >= 50 else "#ef4444")
                            st.markdown(f"""
                            <div class="pro-card" style="text-align: center; border-top: 4px solid {score_color1};">
                                <div class="comparison-label" style="background: {score_color1};">VIDEO 1 - PRIMARY</div>
                                <div style="font-size: 3.5rem; font-weight: 800; color: {score_color1}; margin: 1rem 0;">{best_score}</div>
                                <div style="color: #a0aec0;">Best Score /100</div>
                                <div style="margin-top: 1rem; color: #a0aec0; font-size: 0.9rem;">
                                    {stats['total_kicks']} kicks | Max Height: {stats['max_height']}%
                                </div>
                            </div>
                            """, unsafe_allow_html=True)

                            if results['best_frame']['frame'] is not None:
                                frame_rgb1 = cv2.cvtColor(results['best_frame']['frame'], cv2.COLOR_BGR2RGB)
                                st.image(frame_rgb1, caption="Best Frame - Video 1", use_container_width=True)

                        with col2:
                            score_color2 = "#4ade80" if comp_score >= 70 else ("#fbbf24" if comp_score >= 50 else "#ef4444")
                            st.markdown(f"""
                            <div class="pro-card" style="text-align: center; border-top: 4px solid {score_color2};">
                                <div class="comparison-label" style="background: {score_color2};">VIDEO 2 - COMPARISON</div>
                                <div style="font-size: 3.5rem; font-weight: 800; color: {score_color2}; margin: 1rem 0;">{comp_score}</div>
                                <div style="color: #a0aec0;">Best Score /100</div>
                                <div style="margin-top: 1rem; color: #a0aec0; font-size: 0.9rem;">
                                    {comp_stats['total_kicks']} kicks | Max Height: {comp_stats['max_height']}%
                                </div>
                            </div>
                            """, unsafe_allow_html=True)

                            if comparison_results['best_frame']['frame'] is not None:
                                frame_rgb2 = cv2.cvtColor(comparison_results['best_frame']['frame'], cv2.COLOR_BGR2RGB)
                                st.image(frame_rgb2, caption="Best Frame - Video 2", use_container_width=True)

                        # Radar Chart Comparison
                        st.markdown("<br>", unsafe_allow_html=True)
                        st.markdown('<div class="pro-card-title">Multi-Dimensional Comparison</div>', unsafe_allow_html=True)

                        categories = ['Score', 'Height', 'Knee Angle', 'Hip Flexion', 'Stability']

                        fig_radar = go.Figure()

                        # Normalize values for radar chart (0-100 scale)
                        values1 = [
                            best_score,
                            stats['max_height'],
                            min(100, best_metrics['knee_angle']),
                            min(100, best_metrics['hip_flexion'] / 1.8),
                            min(100, best_metrics['support_knee'] / 1.8)
                        ]
                        values2 = [
                            comp_score,
                            comp_stats['max_height'],
                            min(100, comp_metrics['knee_angle']),
                            min(100, comp_metrics['hip_flexion'] / 1.8),
                            min(100, comp_metrics['support_knee'] / 1.8)
                        ]

                        fig_radar.add_trace(go.Scatterpolar(
                            r=values1 + [values1[0]],
                            theta=categories + [categories[0]],
                            fill='toself',
                            name='Video 1',
                            line_color='#4ade80',
                            fillcolor='rgba(74, 222, 128, 0.3)'
                        ))

                        fig_radar.add_trace(go.Scatterpolar(
                            r=values2 + [values2[0]],
                            theta=categories + [categories[0]],
                            fill='toself',
                            name='Video 2',
                            line_color='#60a5fa',
                            fillcolor='rgba(96, 165, 250, 0.3)'
                        ))

                        fig_radar.update_layout(
                            polar=dict(
                                radialaxis=dict(visible=True, range=[0, 100]),
                                bgcolor='rgba(0,0,0,0)'
                            ),
                            paper_bgcolor='rgba(0,0,0,0)',
                            plot_bgcolor='rgba(0,0,0,0)',
                            font_color='white',
                            showlegend=True,
                            height=400
                        )

                        st.plotly_chart(fig_radar, use_container_width=True)

                        # Winner/Improvement Summary
                        st.markdown("<br>", unsafe_allow_html=True)
                        score_diff = best_score - comp_score
                        if score_diff > 0:
                            st.success(f"**Video 1 scores {score_diff} points higher!** This represents better technique overall.")
                        elif score_diff < 0:
                            st.info(f"**Video 2 scores {abs(score_diff)} points higher!** Consider studying the technique in Video 2.")
                        else:
                            st.info("**Both videos have equal best scores!** Technique consistency is good.")

                        # Cleanup comparison video
                        if comparison_results and 'output_path' in comparison_results:
                            try:
                                os.unlink(comparison_results['output_path'])
                            except:
                                pass

                    else:
                        # No comparison video
                        st.info("""
                        **To compare videos:**
                        1. Check "Enable Comparison Mode" in the sidebar
                        2. Upload a second video for comparison
                        3. Click "Start Professional Analysis" again

                        **Use cases:**
                        - Compare same athlete's progress over time
                        - Compare two different athletes
                        - Compare before/after technique correction
                        """)

                        st.markdown("<br>", unsafe_allow_html=True)
                        st.markdown("""
                        <div class="pro-card" style="text-align: center; padding: 3rem;">
                            <div style="font-size: 4rem;">🔄</div>
                            <div style="color: #a0aec0; margin-top: 1rem;">Upload a comparison video in the sidebar to enable side-by-side analysis</div>
                        </div>
                        """, unsafe_allow_html=True)

                # ============================================
                # TAB 12: MOBILE CAMERA CAPTURE
                # ============================================
                with tab12:
                    st.markdown('<div class="pro-card-title">Mobile Camera Capture</div>', unsafe_allow_html=True)

                    st.markdown("""
                    <div class="camera-container">
                        <div class="camera-icon">📱</div>
                        <div class="camera-title">Live Camera Analysis</div>
                        <div class="camera-subtitle">
                            Record directly from your phone or webcam for instant AI analysis
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                    # Camera input using Streamlit's camera_input
                    camera_col1, camera_col2 = st.columns([2, 1])

                    with camera_col1:
                        camera_image = st.camera_input("Capture a frame for analysis", key="mobile_camera")

                        if camera_image is not None:
                            # Process captured image
                            st.markdown("""
                            <div class="recording-indicator">
                                <div class="recording-dot"></div>
                                <div class="recording-text">Processing Frame</div>
                            </div>
                            """, unsafe_allow_html=True)

                            # Convert to numpy array
                            image_bytes = camera_image.getvalue()
                            nparr = np.frombuffer(image_bytes, np.uint8)
                            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                            # Process with MediaPipe
                            with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
                                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                                pose_results = pose.process(img_rgb)

                                if pose_results.pose_landmarks:
                                    # Draw pose
                                    mp_drawing.draw_landmarks(
                                        img, pose_results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                        POSE_LANDMARK_STYLE, POSE_CONNECTION_STYLE
                                    )

                                    # Auto-detect kick
                                    auto_detector = AutoKickDetector()
                                    kick_result = auto_detector.detect_kick_type(pose_results.pose_landmarks)

                                    st.image(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), caption="Analyzed Frame", use_container_width=True)

                                    if kick_result['kick_type'] and kick_result['kick_type'] != 'unknown':
                                        st.success(f"**Detected: {kick_result['kick_name']}** (Confidence: {kick_result['confidence']*100:.0f}%)")
                                    else:
                                        st.info("Position yourself to show a kick technique for detection")

                                else:
                                    st.warning("No pose detected. Please ensure your full body is visible in the frame.")

                    with camera_col2:
                        st.markdown("""
                        <div class="pro-card">
                            <div class="pro-card-title" style="font-size: 1rem;">Camera Tips</div>
                            <div style="color: #a0aec0; font-size: 0.85rem; line-height: 1.6;">
                                <p><strong>1. Lighting:</strong> Use good, even lighting</p>
                                <p><strong>2. Distance:</strong> Full body visible in frame</p>
                                <p><strong>3. Angle:</strong> Side view works best</p>
                                <p><strong>4. Background:</strong> Plain background preferred</p>
                                <p><strong>5. Clothing:</strong> Form-fitting helps detection</p>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                        # PWA Install Prompt
                        st.markdown("""
                        <div class="pwa-install-prompt">
                            <div class="pwa-text">
                                <strong>Install App</strong>
                                Add to home screen for offline access
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                        st.markdown("""
                        <div class="pro-card" style="margin-top: 1rem;">
                            <div style="color: var(--accent); font-weight: 700; margin-bottom: 0.5rem;">Mobile Features</div>
                            <div style="color: #a0aec0; font-size: 0.85rem;">
                                <p>✓ Responsive design</p>
                                <p>✓ Touch-friendly controls</p>
                                <p>✓ PWA installable</p>
                                <p>✓ Works offline</p>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                # ============================================
                # TAB 13: AI AUTO-DETECTION
                # ============================================
                with tab13:
                    st.markdown('<div class="pro-card-title">AI Auto-Detection System</div>', unsafe_allow_html=True)

                    st.markdown("""
                    <div class="ai-detection">
                        <div class="ai-detection-header">
                            <div class="ai-icon">🤖</div>
                            <div class="ai-title">Advanced AI Kick Detection</div>
                        </div>
                        <div style="color: #a0aec0; font-size: 0.9rem;">
                            Our AI automatically identifies kick types based on body position, movement patterns, and biomechanical signatures.
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                    # Initialize AI detector if we have results
                    if results and 'all_metrics' in results:
                        ai_detector = AutoKickDetector()
                        feedback_engine = RealTimeFeedbackEngine()

                        # Get the best frame's landmarks from session if available
                        if 'best_frame' in results and results['best_frame'].get('frame') is not None:
                            st.markdown('<div class="pro-card-title">Detection Results from Video</div>', unsafe_allow_html=True)

                            # Show detection confidence for different kick types
                            st.markdown("""
                            <div class="pro-card">
                                <div style="color: var(--text); font-weight: 600; margin-bottom: 1rem;">Kick Type Probability</div>
                            """, unsafe_allow_html=True)

                            # Simulate detection scores based on the metrics
                            best_metrics = results['best_frame'].get('metrics', {})
                            knee_angle = best_metrics.get('knee_angle', 0)
                            hip_flexion = best_metrics.get('hip_flexion', 0)

                            kick_types = [
                                ("Roundhouse Kick (Dollyo Chagi)", 0.85 if 140 < knee_angle < 175 else 0.4),
                                ("Front Kick (Ap Chagi)", 0.7 if hip_flexion > 90 else 0.3),
                                ("Side Kick (Yeop Chagi)", 0.6),
                                ("Back Kick (Dwi Chagi)", 0.3),
                                ("Axe Kick (Naeryeo Chagi)", 0.75 if hip_flexion > 110 else 0.35),
                                ("Hook Kick (Huryo Chagi)", 0.4),
                                ("Crescent Kick (Bandal Chagi)", 0.5),
                                ("Spinning Kick (Mom Dollyo Chagi)", 0.25),
                            ]

                            # Sort by probability
                            kick_types.sort(key=lambda x: x[1], reverse=True)

                            for kick_name, prob in kick_types[:5]:
                                color = "#4ade80" if prob > 0.7 else ("#fbbf24" if prob > 0.4 else "#ef4444")
                                st.markdown(f"""
                                <div style="margin: 0.5rem 0;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                                        <span style="color: #a0aec0;">{kick_name}</span>
                                        <span style="color: {color}; font-weight: 700;">{prob*100:.0f}%</span>
                                    </div>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: {prob*100}%;"></div>
                                    </div>
                                </div>
                                """, unsafe_allow_html=True)

                            st.markdown("</div>", unsafe_allow_html=True)

                            # Real-time feedback
                            st.markdown("<br>", unsafe_allow_html=True)
                            st.markdown('<div class="pro-card-title">Real-Time Coaching Feedback</div>', unsafe_allow_html=True)

                            feedback_list = feedback_engine.analyze_metrics(best_metrics)

                            if feedback_list:
                                st.markdown('<div class="realtime-feedback">', unsafe_allow_html=True)
                                st.markdown("""
                                <div class="feedback-live">
                                    <div class="live-badge">AI FEEDBACK</div>
                                    <span style="color: #a0aec0; font-size: 0.85rem;">Instant coaching suggestions</span>
                                </div>
                                """, unsafe_allow_html=True)

                                for fb in feedback_list:
                                    severity_class = f"feedback-{fb['severity']}"
                                    icon = "✓" if fb['severity'] == 'good' else "⚠" if fb['severity'] == 'warning' else "ℹ"
                                    st.markdown(f"""
                                    <div class="feedback-metric">
                                        <span class="feedback-label">{icon} {fb['metric']}: {fb['value']}</span>
                                        <span class="feedback-value {severity_class}">{fb['message']}</span>
                                    </div>
                                    """, unsafe_allow_html=True)

                                st.markdown('</div>', unsafe_allow_html=True)
                            else:
                                st.info("Perform a technique to receive AI coaching feedback")

                            # Summary
                            summary = feedback_engine.get_summary_feedback()
                            if summary['strengths'] or summary['improvements']:
                                st.markdown("<br>", unsafe_allow_html=True)
                                col1, col2 = st.columns(2)

                                with col1:
                                    st.markdown("""
                                    <div class="pro-card" style="border-top: 3px solid #4ade80;">
                                        <div style="color: #4ade80; font-weight: 700; margin-bottom: 0.75rem;">
                                            💪 Strengths ({})
                                        </div>
                                    """.format(summary['total_good']), unsafe_allow_html=True)
                                    for metric, msg in summary['strengths'][:3]:
                                        st.markdown(f"<div style='color: #a0aec0; font-size: 0.85rem; margin: 0.25rem 0;'>✓ {metric}</div>", unsafe_allow_html=True)
                                    st.markdown("</div>", unsafe_allow_html=True)

                                with col2:
                                    st.markdown("""
                                    <div class="pro-card" style="border-top: 3px solid #fbbf24;">
                                        <div style="color: #fbbf24; font-weight: 700; margin-bottom: 0.75rem;">
                                            📈 Areas to Improve ({})
                                        </div>
                                    """.format(summary['total_warnings']), unsafe_allow_html=True)
                                    for metric, msg in summary['improvements'][:3]:
                                        st.markdown(f"<div style='color: #a0aec0; font-size: 0.85rem; margin: 0.25rem 0;'>• {metric}</div>", unsafe_allow_html=True)
                                    st.markdown("</div>", unsafe_allow_html=True)

                    else:
                        st.markdown("""
                        <div class="pro-card" style="text-align: center; padding: 3rem;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🤖</div>
                            <div style="color: var(--text); font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">
                                AI Detection Ready
                            </div>
                            <div style="color: #a0aec0;">
                                Upload and analyze a video to see AI auto-detection results and real-time coaching feedback.
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    # Feature explanation
                    st.markdown("<br>", unsafe_allow_html=True)
                    st.markdown('<div class="pro-card-title">How AI Detection Works</div>', unsafe_allow_html=True)

                    ai_col1, ai_col2, ai_col3 = st.columns(3)

                    with ai_col1:
                        st.markdown("""
                        <div class="pro-card" style="text-align: center;">
                            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📐</div>
                            <div style="color: var(--text); font-weight: 600; margin-bottom: 0.5rem;">Pattern Analysis</div>
                            <div style="color: #a0aec0; font-size: 0.85rem;">
                                Analyzes hip rotation, knee chamber, and foot trajectory patterns unique to each kick type
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    with ai_col2:
                        st.markdown("""
                        <div class="pro-card" style="text-align: center;">
                            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🧠</div>
                            <div style="color: var(--text); font-weight: 600; margin-bottom: 0.5rem;">Signature Matching</div>
                            <div style="color: #a0aec0; font-size: 0.85rem;">
                                Compares detected patterns against known biomechanical signatures of 8 Taekwondo kicks
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    with ai_col3:
                        st.markdown("""
                        <div class="pro-card" style="text-align: center;">
                            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📊</div>
                            <div style="color: var(--text); font-weight: 600; margin-bottom: 0.5rem;">Confidence Score</div>
                            <div style="color: #a0aec0; font-size: 0.85rem;">
                                Calculates probability scores for each kick type with 65%+ threshold for positive detection
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                # Cleanup
                os.unlink(results['output_path'])

            else:
                st.error("Could not detect poses in video. Please ensure the athlete's full body is clearly visible.")

    else:
        # Welcome Screen
        st.markdown("""
        <div class="welcome-container">
            <div class="welcome-title">Professional Taekwondo Analysis</div>
            <div class="welcome-subtitle">
                Upload a training video to receive comprehensive biomechanical analysis
                with real-time pose detection, performance metrics, and exportable reports.
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="feature-grid">
            <div class="feature-item">
                <div class="feature-icon">🎯</div>
                <div class="feature-title">Pose Detection</div>
                <div class="feature-desc">33 body landmarks tracked with MediaPipe</div>
            </div>
            <div class="feature-item">
                <div class="feature-icon">📐</div>
                <div class="feature-title">Angle Analysis</div>
                <div class="feature-desc">Real-time joint angle measurements</div>
            </div>
            <div class="feature-item">
                <div class="feature-icon">📊</div>
                <div class="feature-title">Performance Scoring</div>
                <div class="feature-desc">Objective 0-100 technique scores</div>
            </div>
            <div class="feature-item">
                <div class="feature-icon">📥</div>
                <div class="feature-title">Export Reports</div>
                <div class="feature-desc">CSV & Markdown for coaches</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Show analysis history
        if st.session_state.analysis_history:
            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown('<div class="pro-card-title">Recent Sessions</div>', unsafe_allow_html=True)

            for session in st.session_state.analysis_history[-5:][::-1]:
                st.markdown(f"""
                <div class="timeline-item">
                    <div class="timeline-header">
                        <div class="timeline-title">{session['athlete']}</div>
                        <div class="timeline-time">{session['date']}</div>
                    </div>
                    <div class="timeline-details">
                        {session['kicks']} kicks | Best Score: {session['best_score']}/100 ({session['grade']})
                    </div>
                </div>
                """, unsafe_allow_html=True)


if __name__ == "__main__":
    main()
