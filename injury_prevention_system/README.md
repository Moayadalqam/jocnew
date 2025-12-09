# JOC Injury Prevention & Recovery System

## مراقب تعافي الرياضيين - اللجنة الأولمبية الأردنية

**AI-Powered Injury Risk Monitoring for Jordan Olympic Committee Athletes**

Developed by **QUALIA SOLUTIONS**

---

## Quick Start

### Step 1: Install Python Dependencies

```bash
cd injury_prevention_system
pip install -r requirements.txt
```

### Step 2: Run the Dashboard

```bash
python run.py
```

Or directly with Streamlit:

```bash
streamlit run dashboard.py
```

### Step 3: Open in Browser

The dashboard will automatically open at: **http://localhost:8501**

---

## Features

### Dashboard Overview
- Real-time risk monitoring for all athletes
- Visual ACWR vs Wellness scatter plot
- Risk distribution breakdown
- Color-coded athlete status table

### Individual Athlete Analysis
- Detailed ACWR trend charts
- Training load visualization
- Wellness metrics over time
- Personalized recommendations
- Injury history tracking

### Alert System
- Automatic detection of high-risk athletes
- Critical, warning, and caution alerts
- Action recommendations for each alert

### Reports
- Team summary reports (CSV export)
- Individual athlete reports (PDF)
- Downloadable data exports

---

## Key Metrics Explained

### ACWR (Acute:Chronic Workload Ratio)

The ACWR compares recent training load (7 days) to longer-term load (28 days).

| ACWR Value | Risk Level | Action |
|------------|------------|--------|
| < 0.8 | Undertrained | Gradually increase load |
| 0.8 - 1.3 | **Optimal Zone** | Maintain current program |
| 1.3 - 1.5 | Elevated Risk | Monitor closely |
| 1.5 - 2.0 | High Risk | Reduce training 30% |
| > 2.0 | Critical | Rest required |

### Wellness Score (0-100)

Calculated from daily athlete self-reports:
- Sleep Quality (1-10)
- Fatigue Level (1-10, inverted)
- Muscle Soreness (1-10, inverted)
- Stress Level (1-10, inverted)
- Mood (1-10)
- Motivation (1-10)

### Combined Risk Score

Weighted combination of ACWR risk (60%) and wellness risk (40%).

---

## File Structure

```
injury_prevention_system/
├── config.py           # Configuration and settings
├── data_models.py      # Data structures and sample data
├── acwr_calculator.py  # Core risk calculation algorithms
├── dashboard.py        # Main Streamlit dashboard
├── report_generator.py # PDF report generation
├── run.py              # Quick start script
├── requirements.txt    # Python dependencies
├── README.md           # This file
├── data/               # Data storage (future)
├── reports/            # Generated PDF reports
└── assets/             # Images and assets (future)
```

---

## Sample Data

The system includes realistic sample data for demonstration:

- **15+ Jordanian athletes** across multiple sports
- **60 days** of training history
- **One high-risk scenario** (Mohammed Al-Ahmad) to demonstrate alerts

Sports included:
- Taekwondo (Priority 1)
- Karate (Priority 2)
- Boxing (Priority 2)
- Swimming
- Athletics

---

## Customization

### Adding Real Athletes

Edit `data_models.py` to add real athlete profiles:

```python
create_athlete_profile(
    'TKD006',              # Unique ID
    'Athlete Name',        # English name
    'اسم الرياضي',          # Arabic name
    'taekwondo',           # Sport key
    24,                    # Age
    68,                    # Weight (kg)
    178,                   # Height (cm)
    'M',                   # Gender
    []                     # Injury history
)
```

### Connecting to Google Sheets

For real data collection, set up Google Sheets integration:

1. Create a Google Cloud project
2. Enable Sheets API
3. Create service account credentials
4. Share your sheet with the service account email
5. Add credentials JSON to the project

### Adjusting Risk Thresholds

Edit `config.py` to customize thresholds:

```python
ACWR_THRESHOLDS = {
    'optimal_low': 0.8,
    'optimal_high': 1.3,
    'high_risk': 1.5,
    'critical': 2.0,
}
```

---

## Deployment Options

### Option 1: Local Network (Recommended for Demo)

```bash
streamlit run dashboard.py --server.address 0.0.0.0 --server.port 8501
```

Access from any device on the same network.

### Option 2: Streamlit Cloud (Free)

1. Push code to GitHub
2. Go to share.streamlit.io
3. Connect your repository
4. Deploy!

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
EXPOSE 8501
CMD ["streamlit", "run", "dashboard.py"]
```

---

## Support

Developed by **QUALIA SOLUTIONS** for **Jordan Olympic Committee**

For technical support, contact: [Your Contact Info]

---

## License

Proprietary - Jordan Olympic Committee
