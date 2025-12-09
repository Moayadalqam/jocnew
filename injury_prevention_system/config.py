"""
JOC Injury Prevention System - Configuration
=============================================
Central configuration file for all system settings.
"""

# ============================================
# JOC BRANDING COLORS
# ============================================
# Jordan Flag Colors: Black, White, Green, Red

JOC_COLORS = {
    'black': '#000000',
    'white': '#FFFFFF',
    'green': '#007A3D',
    'red': '#CE1126',
    'gold': '#FFD700',  # For accents
    'light_gray': '#F5F5F5',
    'dark_gray': '#333333',
}

# Risk Level Colors
RISK_COLORS = {
    'low': '#28A745',      # Green - Safe
    'moderate': '#FFC107', # Yellow - Caution
    'high': '#DC3545',     # Red - Danger
    'very_high': '#721C24' # Dark Red - Critical
}

# ============================================
# ACWR THRESHOLDS
# ============================================
# Based on sports science research (Gabbett et al.)

ACWR_THRESHOLDS = {
    'optimal_low': 0.8,    # Below this = undertrained
    'optimal_high': 1.3,   # Above this = increased risk
    'high_risk': 1.5,      # Above this = high injury risk
    'critical': 2.0,       # Above this = very high risk
}

# Risk zone definitions
RISK_ZONES = {
    'undertrained': {'min': 0, 'max': 0.8, 'color': RISK_COLORS['moderate'], 'label': 'Undertrained'},
    'optimal': {'min': 0.8, 'max': 1.3, 'color': RISK_COLORS['low'], 'label': 'Optimal Zone'},
    'high_risk': {'min': 1.3, 'max': 1.5, 'color': RISK_COLORS['moderate'], 'label': 'Elevated Risk'},
    'danger': {'min': 1.5, 'max': 2.0, 'color': RISK_COLORS['high'], 'label': 'High Risk'},
    'critical': {'min': 2.0, 'max': 999, 'color': RISK_COLORS['very_high'], 'label': 'Critical Risk'},
}

# ============================================
# TRAINING LOAD CALCULATION
# ============================================

# RPE (Rate of Perceived Exertion) Scale: 1-10
RPE_DESCRIPTIONS = {
    1: 'Very Light',
    2: 'Light',
    3: 'Light-Moderate',
    4: 'Moderate',
    5: 'Moderate-Hard',
    6: 'Hard',
    7: 'Very Hard',
    8: 'Very Very Hard',
    9: 'Near Maximal',
    10: 'Maximal'
}

# Session RPE calculation: Duration (minutes) × RPE = Training Load
# Example: 60 min × 7 RPE = 420 arbitrary units (AU)

# ============================================
# WELLNESS METRICS
# ============================================

WELLNESS_METRICS = {
    'sleep_quality': {'min': 1, 'max': 10, 'optimal': 7, 'label': 'Sleep Quality'},
    'fatigue': {'min': 1, 'max': 10, 'optimal': 3, 'label': 'Fatigue Level'},
    'muscle_soreness': {'min': 1, 'max': 10, 'optimal': 3, 'label': 'Muscle Soreness'},
    'stress': {'min': 1, 'max': 10, 'optimal': 3, 'label': 'Stress Level'},
    'mood': {'min': 1, 'max': 10, 'optimal': 7, 'label': 'Mood'},
    'motivation': {'min': 1, 'max': 10, 'optimal': 7, 'label': 'Motivation'},
}

# Wellness score weights (total = 100%)
WELLNESS_WEIGHTS = {
    'sleep_quality': 0.25,
    'fatigue': 0.20,
    'muscle_soreness': 0.20,
    'stress': 0.15,
    'mood': 0.10,
    'motivation': 0.10,
}

# ============================================
# SPORT-SPECIFIC SETTINGS
# ============================================

SPORTS = {
    'taekwondo': {
        'name': 'Taekwondo',
        'name_ar': 'التايكواندو',
        'injury_prone_areas': ['knee', 'ankle', 'hip', 'lower_back'],
        'typical_session_duration': 90,  # minutes
        'priority': 1,  # Highest priority (Olympic medals)
    },
    'karate': {
        'name': 'Karate',
        'name_ar': 'الكاراتيه',
        'injury_prone_areas': ['knee', 'wrist', 'shoulder'],
        'typical_session_duration': 90,
        'priority': 2,
    },
    'boxing': {
        'name': 'Boxing',
        'name_ar': 'الملاكمة',
        'injury_prone_areas': ['hand', 'wrist', 'shoulder', 'head'],
        'typical_session_duration': 75,
        'priority': 2,
    },
    'judo': {
        'name': 'Judo',
        'name_ar': 'الجودو',
        'injury_prone_areas': ['knee', 'shoulder', 'elbow', 'neck'],
        'typical_session_duration': 90,
        'priority': 3,
    },
    'wrestling': {
        'name': 'Wrestling',
        'name_ar': 'المصارعة',
        'injury_prone_areas': ['knee', 'shoulder', 'neck', 'lower_back'],
        'typical_session_duration': 90,
        'priority': 3,
    },
    'swimming': {
        'name': 'Swimming',
        'name_ar': 'السباحة',
        'injury_prone_areas': ['shoulder', 'knee', 'lower_back'],
        'typical_session_duration': 120,
        'priority': 4,
    },
    'athletics': {
        'name': 'Athletics',
        'name_ar': 'ألعاب القوى',
        'injury_prone_areas': ['hamstring', 'knee', 'ankle', 'hip'],
        'typical_session_duration': 90,
        'priority': 4,
    },
    'gymnastics': {
        'name': 'Gymnastics',
        'name_ar': 'الجمباز',
        'injury_prone_areas': ['wrist', 'ankle', 'lower_back', 'knee'],
        'typical_session_duration': 120,
        'priority': 4,
    },
}

# ============================================
# ALERT SETTINGS
# ============================================

ALERT_THRESHOLDS = {
    'acwr_warning': 1.3,
    'acwr_danger': 1.5,
    'wellness_warning': 5.0,  # Below this triggers warning
    'consecutive_high_load_days': 3,  # Consecutive days above threshold
}

# ============================================
# DATE/TIME SETTINGS
# ============================================

# ACWR calculation periods
ACUTE_PERIOD_DAYS = 7    # Rolling 7-day acute load
CHRONIC_PERIOD_DAYS = 28 # Rolling 28-day chronic load (4 weeks)

# ============================================
# DISPLAY SETTINGS
# ============================================

DASHBOARD_SETTINGS = {
    'default_date_range': 30,  # Days to show by default
    'max_athletes_per_page': 20,
    'chart_height': 400,
    'show_recommendations': True,
}

# ============================================
# ARABIC TRANSLATIONS
# ============================================

TRANSLATIONS = {
    'en': {
        'title': 'JOC Athlete Recovery Monitor',
        'subtitle': 'Injury Prevention & Performance Optimization',
        'dashboard': 'Dashboard',
        'athletes': 'Athletes',
        'reports': 'Reports',
        'settings': 'Settings',
        'acwr': 'Acute:Chronic Workload Ratio',
        'risk_level': 'Risk Level',
        'low_risk': 'Low Risk',
        'moderate_risk': 'Moderate Risk',
        'high_risk': 'High Risk',
        'critical_risk': 'Critical Risk',
        'sleep_quality': 'Sleep Quality',
        'fatigue': 'Fatigue',
        'soreness': 'Muscle Soreness',
        'stress': 'Stress',
        'mood': 'Mood',
        'training_load': 'Training Load',
        'recommendations': 'Recommendations',
        'generate_report': 'Generate Report',
    },
    'ar': {
        'title': 'مراقب تعافي الرياضيين - اللجنة الأولمبية الأردنية',
        'subtitle': 'الوقاية من الإصابات وتحسين الأداء',
        'dashboard': 'لوحة التحكم',
        'athletes': 'الرياضيون',
        'reports': 'التقارير',
        'settings': 'الإعدادات',
        'acwr': 'نسبة الحمل الحاد إلى المزمن',
        'risk_level': 'مستوى الخطر',
        'low_risk': 'خطر منخفض',
        'moderate_risk': 'خطر متوسط',
        'high_risk': 'خطر مرتفع',
        'critical_risk': 'خطر حرج',
        'sleep_quality': 'جودة النوم',
        'fatigue': 'الإرهاق',
        'soreness': 'آلام العضلات',
        'stress': 'التوتر',
        'mood': 'المزاج',
        'training_load': 'حمل التدريب',
        'recommendations': 'التوصيات',
        'generate_report': 'إنشاء تقرير',
    }
}
