"""
JOC Injury Prevention System - ACWR Calculator
===============================================
Core algorithm for calculating injury risk based on training load.

The Acute:Chronic Workload Ratio (ACWR) is a key metric in sports science
for predicting injury risk. It compares recent training load (acute, 7 days)
to longer-term training load (chronic, 28 days).

Research shows:
- ACWR 0.8-1.3: Optimal zone (low injury risk)
- ACWR < 0.8: Undertrained (detraining, may increase injury risk when load increases)
- ACWR 1.3-1.5: Elevated risk
- ACWR > 1.5: High injury risk (training spike)
- ACWR > 2.0: Very high risk

Reference: Gabbett TJ. The training-injury prevention paradox: should athletes
be training smarter and harder? Br J Sports Med. 2016.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, Dict, List
from config import (
    ACWR_THRESHOLDS, RISK_ZONES, WELLNESS_WEIGHTS,
    ACUTE_PERIOD_DAYS, CHRONIC_PERIOD_DAYS, ALERT_THRESHOLDS
)


# ============================================
# ACWR CALCULATION
# ============================================

def calculate_acwr(training_data: pd.DataFrame, calculation_date: datetime = None) -> float:
    """
    Calculate the Acute:Chronic Workload Ratio.

    Args:
        training_data: DataFrame with 'date' and 'training_load' columns
        calculation_date: Date to calculate ACWR for (defaults to today)

    Returns:
        ACWR value (float)
    """
    if calculation_date is None:
        calculation_date = datetime.now()

    if isinstance(calculation_date, str):
        calculation_date = datetime.strptime(calculation_date, '%Y-%m-%d')

    # Ensure date column is datetime
    df = training_data.copy()
    df['date'] = pd.to_datetime(df['date'])

    # Calculate date ranges
    acute_start = calculation_date - timedelta(days=ACUTE_PERIOD_DAYS)
    chronic_start = calculation_date - timedelta(days=CHRONIC_PERIOD_DAYS)

    # Get acute load (last 7 days)
    acute_data = df[(df['date'] > acute_start) & (df['date'] <= calculation_date)]
    acute_load = acute_data['training_load'].sum()

    # Get chronic load (last 28 days, weekly average)
    chronic_data = df[(df['date'] > chronic_start) & (df['date'] <= calculation_date)]
    chronic_load = chronic_data['training_load'].sum()

    # Calculate averages
    acute_avg = acute_load / ACUTE_PERIOD_DAYS
    chronic_avg = chronic_load / CHRONIC_PERIOD_DAYS

    # Calculate ACWR (avoid division by zero)
    if chronic_avg == 0:
        if acute_avg == 0:
            return 1.0  # No training = neutral
        return 2.0  # Training after no chronic load = high risk

    acwr = acute_avg / chronic_avg

    return round(acwr, 2)


def calculate_rolling_acwr(training_data: pd.DataFrame, days: int = 30) -> pd.DataFrame:
    """
    Calculate rolling ACWR for visualization over time.

    Args:
        training_data: DataFrame with training data
        days: Number of days to calculate

    Returns:
        DataFrame with date and ACWR columns
    """
    df = training_data.copy()
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    results = []
    end_date = df['date'].max()
    start_date = end_date - timedelta(days=days)

    current_date = start_date
    while current_date <= end_date:
        acwr = calculate_acwr(df, current_date)
        results.append({
            'date': current_date,
            'acwr': acwr
        })
        current_date += timedelta(days=1)

    return pd.DataFrame(results)


# ============================================
# RISK ASSESSMENT
# ============================================

def get_risk_level(acwr: float) -> Dict:
    """
    Determine injury risk level based on ACWR value.

    Returns:
        Dictionary with risk level details
    """
    for zone_name, zone_info in RISK_ZONES.items():
        if zone_info['min'] <= acwr < zone_info['max']:
            return {
                'zone': zone_name,
                'label': zone_info['label'],
                'color': zone_info['color'],
                'acwr': acwr
            }

    # Default to critical if somehow outside all zones
    return {
        'zone': 'critical',
        'label': 'Critical Risk',
        'color': RISK_ZONES['critical']['color'],
        'acwr': acwr
    }


def calculate_wellness_score(
    sleep_quality: int,
    fatigue: int,
    muscle_soreness: int,
    stress: int,
    mood: int,
    motivation: int
) -> float:
    """
    Calculate overall wellness score from individual metrics.

    Args:
        All metrics are on a 1-10 scale
        For fatigue, soreness, stress: lower is better
        For sleep, mood, motivation: higher is better

    Returns:
        Wellness score (0-100)
    """
    # Normalize metrics (higher = better for all)
    normalized = {
        'sleep_quality': sleep_quality,  # Already higher = better
        'fatigue': 11 - fatigue,  # Invert: lower fatigue = better
        'muscle_soreness': 11 - muscle_soreness,  # Invert
        'stress': 11 - stress,  # Invert
        'mood': mood,  # Higher = better
        'motivation': motivation  # Higher = better
    }

    # Calculate weighted score
    score = 0
    for metric, weight in WELLNESS_WEIGHTS.items():
        score += normalized[metric] * weight

    # Convert to 0-100 scale
    return round(score * 10, 1)


def get_wellness_status(wellness_score: float) -> Dict:
    """Get status label for wellness score"""
    if wellness_score >= 75:
        return {'status': 'Excellent', 'color': '#28A745', 'emoji': '🟢'}
    elif wellness_score >= 60:
        return {'status': 'Good', 'color': '#17A2B8', 'emoji': '🔵'}
    elif wellness_score >= 45:
        return {'status': 'Fair', 'color': '#FFC107', 'emoji': '🟡'}
    elif wellness_score >= 30:
        return {'status': 'Poor', 'color': '#FD7E14', 'emoji': '🟠'}
    else:
        return {'status': 'Critical', 'color': '#DC3545', 'emoji': '🔴'}


# ============================================
# COMBINED RISK ASSESSMENT
# ============================================

def calculate_combined_risk(acwr: float, wellness_score: float) -> Dict:
    """
    Calculate combined injury risk from ACWR and wellness.

    This provides a more holistic view than ACWR alone.
    """
    # Get base ACWR risk (0-100)
    if acwr < 0.8:
        acwr_risk = 30  # Undertrained risk
    elif acwr <= 1.3:
        acwr_risk = 10  # Optimal
    elif acwr <= 1.5:
        acwr_risk = 50  # Elevated
    elif acwr <= 2.0:
        acwr_risk = 75  # High
    else:
        acwr_risk = 95  # Critical

    # Wellness risk (inverse of wellness score)
    wellness_risk = 100 - wellness_score

    # Combined risk (weighted: 60% ACWR, 40% wellness)
    combined_risk = (acwr_risk * 0.6) + (wellness_risk * 0.4)

    # Determine overall status
    if combined_risk < 25:
        status = 'Low Risk'
        color = '#28A745'
        recommendation = 'Athlete is in good condition. Continue current program.'
    elif combined_risk < 45:
        status = 'Moderate Risk'
        color = '#FFC107'
        recommendation = 'Monitor closely. Consider reducing intensity slightly.'
    elif combined_risk < 65:
        status = 'Elevated Risk'
        color = '#FD7E14'
        recommendation = 'Reduce training load by 20-30%. Focus on recovery.'
    elif combined_risk < 80:
        status = 'High Risk'
        color = '#DC3545'
        recommendation = 'Significantly reduce training. Prioritize rest and recovery.'
    else:
        status = 'Critical Risk'
        color = '#721C24'
        recommendation = 'URGENT: Rest required. Consult medical staff before training.'

    return {
        'combined_risk': round(combined_risk, 1),
        'acwr_risk': acwr_risk,
        'wellness_risk': round(wellness_risk, 1),
        'status': status,
        'color': color,
        'recommendation': recommendation
    }


# ============================================
# TRAINING LOAD ANALYSIS
# ============================================

def calculate_weekly_load(training_data: pd.DataFrame) -> pd.DataFrame:
    """Calculate weekly training load totals"""
    df = training_data.copy()
    df['date'] = pd.to_datetime(df['date'])
    df['week'] = df['date'].dt.isocalendar().week
    df['year'] = df['date'].dt.year

    weekly = df.groupby(['year', 'week']).agg({
        'training_load': 'sum',
        'training_duration': 'sum',
        'rpe': 'mean'
    }).reset_index()

    weekly.columns = ['year', 'week', 'total_load', 'total_duration', 'avg_rpe']
    return weekly


def detect_load_spikes(training_data: pd.DataFrame, threshold: float = 1.3) -> List[Dict]:
    """
    Detect sudden spikes in training load that may increase injury risk.

    Returns list of dates where load spiked significantly.
    """
    df = training_data.copy()
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    # Calculate 7-day rolling average
    df['rolling_avg'] = df['training_load'].rolling(window=7, min_periods=1).mean()

    # Calculate previous 7-day average (offset by 7 days)
    df['prev_rolling_avg'] = df['rolling_avg'].shift(7)

    # Calculate ratio
    df['load_ratio'] = df['rolling_avg'] / df['prev_rolling_avg'].replace(0, np.nan)

    # Find spikes
    spikes = df[df['load_ratio'] > threshold].copy()

    spike_list = []
    for _, row in spikes.iterrows():
        if pd.notna(row['load_ratio']):
            spike_list.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'ratio': round(row['load_ratio'], 2),
                'load': row['training_load']
            })

    return spike_list


# ============================================
# RECOMMENDATIONS ENGINE
# ============================================

def generate_recommendations(
    acwr: float,
    wellness_score: float,
    recent_data: pd.DataFrame
) -> List[str]:
    """
    Generate specific recommendations based on athlete's current state.
    """
    recommendations = []

    # ACWR-based recommendations
    if acwr > 1.5:
        recommendations.append("🔴 REDUCE training load by 30-40% this week")
        recommendations.append("📉 Avoid high-intensity sessions for 3-5 days")
    elif acwr > 1.3:
        recommendations.append("🟡 Consider reducing training intensity by 15-20%")
        recommendations.append("📊 Monitor closely for signs of fatigue")
    elif acwr < 0.8:
        recommendations.append("📈 Training load is below optimal - gradual increase recommended")
        recommendations.append("⚠️ Avoid sudden load spikes when returning to full training")

    # Wellness-based recommendations
    if wellness_score < 50:
        recommendations.append("😴 Prioritize sleep (aim for 8+ hours)")
        recommendations.append("🧘 Include active recovery sessions")

    # Check recent patterns
    if not recent_data.empty:
        recent_fatigue = recent_data['fatigue'].tail(3).mean()
        recent_soreness = recent_data['muscle_soreness'].tail(3).mean()
        recent_sleep = recent_data['sleep_quality'].tail(3).mean()

        if recent_fatigue > 7:
            recommendations.append("⚡ High fatigue detected - schedule a rest day")

        if recent_soreness > 7:
            recommendations.append("💪 Elevated soreness - include foam rolling/massage")

        if recent_sleep < 5:
            recommendations.append("🌙 Sleep quality declining - review sleep hygiene")

    # General recommendations
    if not recommendations:
        recommendations.append("✅ Current training load is appropriate")
        recommendations.append("📊 Continue monitoring daily wellness")

    return recommendations


# ============================================
# ALERT GENERATION
# ============================================

def check_alerts(
    athlete_id: str,
    athlete_name: str,
    acwr: float,
    wellness_score: float,
    combined_risk: Dict
) -> List[Dict]:
    """
    Check if athlete triggers any alerts.

    Returns list of alerts to display/send.
    """
    alerts = []

    # ACWR alerts
    if acwr >= 2.0:
        alerts.append({
            'type': 'critical',
            'athlete_id': athlete_id,
            'athlete_name': athlete_name,
            'message': f'CRITICAL: ACWR at {acwr} - Very high injury risk!',
            'action': 'Immediate rest required. Contact medical staff.',
            'timestamp': datetime.now().isoformat()
        })
    elif acwr >= ALERT_THRESHOLDS['acwr_danger']:
        alerts.append({
            'type': 'warning',
            'athlete_id': athlete_id,
            'athlete_name': athlete_name,
            'message': f'WARNING: ACWR at {acwr} - High injury risk',
            'action': 'Reduce training load significantly',
            'timestamp': datetime.now().isoformat()
        })
    elif acwr >= ALERT_THRESHOLDS['acwr_warning']:
        alerts.append({
            'type': 'caution',
            'athlete_id': athlete_id,
            'athlete_name': athlete_name,
            'message': f'CAUTION: ACWR at {acwr} - Elevated risk',
            'action': 'Monitor closely and consider reducing intensity',
            'timestamp': datetime.now().isoformat()
        })

    # Wellness alerts
    if wellness_score < ALERT_THRESHOLDS['wellness_warning']:
        alerts.append({
            'type': 'warning',
            'athlete_id': athlete_id,
            'athlete_name': athlete_name,
            'message': f'LOW WELLNESS: Score at {wellness_score}/100',
            'action': 'Check in with athlete. Consider recovery day.',
            'timestamp': datetime.now().isoformat()
        })

    return alerts


# ============================================
# BATCH ANALYSIS
# ============================================

def analyze_all_athletes(athletes: list, training_data: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze all athletes and return summary DataFrame.
    """
    results = []

    for athlete in athletes:
        athlete_id = athlete['athlete_id']

        # Get athlete's data
        athlete_data = training_data[training_data['athlete_id'] == athlete_id].copy()

        if athlete_data.empty:
            continue

        # Calculate ACWR
        acwr = calculate_acwr(athlete_data)
        risk = get_risk_level(acwr)

        # Get latest wellness data
        athlete_data['date'] = pd.to_datetime(athlete_data['date'])
        latest = athlete_data.sort_values('date').iloc[-1]

        wellness = calculate_wellness_score(
            latest['sleep_quality'],
            latest['fatigue'],
            latest['muscle_soreness'],
            latest['stress'],
            latest['mood'],
            latest['motivation']
        )

        wellness_status = get_wellness_status(wellness)
        combined = calculate_combined_risk(acwr, wellness)

        results.append({
            'athlete_id': athlete_id,
            'name': athlete['name'],
            'name_ar': athlete['name_ar'],
            'sport': athlete['sport'],
            'acwr': acwr,
            'risk_zone': risk['label'],
            'risk_color': risk['color'],
            'wellness_score': wellness,
            'wellness_status': wellness_status['status'],
            'combined_risk': combined['combined_risk'],
            'overall_status': combined['status'],
            'status_color': combined['color'],
            'recommendation': combined['recommendation']
        })

    return pd.DataFrame(results)


if __name__ == "__main__":
    # Test the calculator
    from data_models import load_sample_data

    print("Loading sample data...")
    athletes, data = load_sample_data()

    print("\nAnalyzing all athletes...")
    summary = analyze_all_athletes(athletes, data)

    print("\n" + "=" * 60)
    print("ATHLETE RISK SUMMARY")
    print("=" * 60)

    for _, row in summary.iterrows():
        print(f"\n{row['name']} ({row['sport']})")
        print(f"  ACWR: {row['acwr']} - {row['risk_zone']}")
        print(f"  Wellness: {row['wellness_score']}/100 - {row['wellness_status']}")
        print(f"  Overall: {row['overall_status']} ({row['combined_risk']}%)")
        print(f"  → {row['recommendation']}")
