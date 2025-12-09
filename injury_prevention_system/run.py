"""
JOC Injury Prevention System - Quick Start Script
==================================================
Run this file to start the dashboard.

Usage:
    python run.py

Or run directly with Streamlit:
    streamlit run dashboard.py
"""

import subprocess
import sys
import os

def main():
    """Launch the Streamlit dashboard"""

    # Get the directory containing this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dashboard_path = os.path.join(script_dir, 'dashboard.py')

    print("=" * 60)
    print("  JOC Athlete Recovery Monitor")
    print("  Injury Prevention & Performance Optimization System")
    print("=" * 60)
    print()
    print("Starting dashboard...")
    print("The browser should open automatically.")
    print()
    print("If it doesn't, open: http://localhost:8501")
    print()
    print("Press Ctrl+C to stop the server.")
    print("=" * 60)

    # Run Streamlit
    subprocess.run([
        sys.executable, "-m", "streamlit", "run",
        dashboard_path,
        "--server.headless=false",
        "--browser.gatherUsageStats=false"
    ])


if __name__ == "__main__":
    main()
