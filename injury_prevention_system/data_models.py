"""
JOC Injury Prevention System - Data Models
===========================================
Data structures and sample data generation for the system.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from config import SPORTS, WELLNESS_METRICS

# ============================================
# ATHLETE DATA MODEL
# ============================================

def create_athlete_profile(
    athlete_id: str,
    name: str,
    name_ar: str,
    sport: str,
    age: int,
    weight: float,
    height: float,
    gender: str,
    injury_history: list = None
):
    """Create an athlete profile dictionary"""
    return {
        'athlete_id': athlete_id,
        'name': name,
        'name_ar': name_ar,
        'sport': sport,
        'age': age,
        'weight': weight,
        'height': height,
        'gender': gender,
        'injury_history': injury_history or [],
        'created_at': datetime.now().isoformat(),
        'active': True
    }


# ============================================
# SAMPLE JORDANIAN ATHLETES DATA
# ============================================

SAMPLE_ATHLETES = [
    # Taekwondo Athletes (Priority 1 - Olympic Medal Sport)
    create_athlete_profile(
        'TKD001', 'Ahmad Al-Masri', 'أحمد المصري', 'taekwondo',
        24, 68, 178, 'M',
        [{'injury': 'ankle_sprain', 'date': '2023-06-15', 'recovery_days': 21}]
    ),
    create_athlete_profile(
        'TKD002', 'Saleh Al-Rashid', 'صالح الراشد', 'taekwondo',
        22, 74, 182, 'M',
        [{'injury': 'knee_strain', 'date': '2024-01-10', 'recovery_days': 14}]
    ),
    create_athlete_profile(
        'TKD003', 'Lina Haddad', 'لينا حداد', 'taekwondo',
        20, 57, 168, 'F', []
    ),
    create_athlete_profile(
        'TKD004', 'Omar Khalil', 'عمر خليل', 'taekwondo',
        26, 80, 185, 'M',
        [{'injury': 'acl_tear', 'date': '2022-03-20', 'recovery_days': 180}]
    ),
    create_athlete_profile(
        'TKD005', 'Nour Al-Din', 'نور الدين', 'taekwondo',
        19, 63, 175, 'M', []
    ),

    # Karate Athletes (Priority 2)
    create_athlete_profile(
        'KRT001', 'Faisal Hamdan', 'فيصل حمدان', 'karate',
        25, 75, 180, 'M',
        [{'injury': 'wrist_fracture', 'date': '2023-09-05', 'recovery_days': 45}]
    ),
    create_athlete_profile(
        'KRT002', 'Rana Qasim', 'رنا قاسم', 'karate',
        23, 58, 165, 'F', []
    ),
    create_athlete_profile(
        'KRT003', 'Yousef Abbadi', 'يوسف العبادي', 'karate',
        27, 82, 183, 'M', []
    ),

    # Boxing Athletes (Priority 2)
    create_athlete_profile(
        'BOX001', 'Zaid Hassan', 'زيد حسن', 'boxing',
        24, 69, 175, 'M',
        [{'injury': 'hand_fracture', 'date': '2023-11-20', 'recovery_days': 35}]
    ),
    create_athlete_profile(
        'BOX002', 'Kareem Nasser', 'كريم ناصر', 'boxing',
        22, 75, 180, 'M', []
    ),
    create_athlete_profile(
        'BOX003', 'Hussein Darwish', 'حسين درويش', 'boxing',
        28, 91, 188, 'M', []
    ),

    # Swimming Athletes
    create_athlete_profile(
        'SWM001', 'Layla Mansour', 'ليلى منصور', 'swimming',
        21, 62, 172, 'F',
        [{'injury': 'shoulder_strain', 'date': '2024-02-15', 'recovery_days': 28}]
    ),
    create_athlete_profile(
        'SWM002', 'Tariq Najjar', 'طارق النجار', 'swimming',
        23, 78, 185, 'M', []
    ),

    # Athletics
    create_athlete_profile(
        'ATH001', 'Sami Khoury', 'سامي خوري', 'athletics',
        25, 72, 180, 'M',
        [{'injury': 'hamstring_strain', 'date': '2023-08-10', 'recovery_days': 21}]
    ),
    create_athlete_profile(
        'ATH002', 'Dana Awad', 'دانا عوض', 'athletics',
        22, 55, 165, 'F', []
    ),
]


# ============================================
# GENERATE SAMPLE TRAINING DATA
# ============================================

def generate_sample_training_data(athletes: list, days: int = 60):
    """
    Generate realistic sample training data for demo purposes.

    Creates daily entries with:
    - Training duration
    - RPE (Rate of Perceived Exertion)
    - Training load (duration × RPE)
    - Wellness metrics
    """

    data = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    for athlete in athletes:
        athlete_id = athlete['athlete_id']
        sport = athlete['sport']

        # Get sport-specific typical session duration
        typical_duration = SPORTS.get(sport, {}).get('typical_session_duration', 90)

        current_date = start_date

        # Simulate training patterns
        while current_date <= end_date:
            # Rest days (typically 1-2 per week)
            day_of_week = current_date.weekday()
            is_rest_day = day_of_week == 6 or (day_of_week == 3 and random.random() < 0.5)

            if is_rest_day:
                duration = 0
                rpe = 0
            else:
                # Vary training intensity throughout the week
                if day_of_week in [1, 4]:  # Hard days (Tuesday, Friday)
                    duration = int(typical_duration * random.uniform(1.0, 1.3))
                    rpe = random.randint(7, 9)
                elif day_of_week in [0, 2]:  # Medium days
                    duration = int(typical_duration * random.uniform(0.8, 1.1))
                    rpe = random.randint(5, 7)
                else:  # Light days
                    duration = int(typical_duration * random.uniform(0.5, 0.8))
                    rpe = random.randint(3, 5)

                # Add some randomness
                duration = max(30, min(180, duration + random.randint(-15, 15)))

            # Calculate training load
            training_load = duration * rpe

            # Generate wellness metrics with realistic patterns
            # Fatigue increases after hard training days
            base_fatigue = 3 if is_rest_day else min(9, 3 + (rpe - 5) * 0.8)
            fatigue = max(1, min(10, int(base_fatigue + random.uniform(-1, 1))))

            # Sleep quality (tends to be lower when fatigued)
            sleep_quality = max(1, min(10, int(8 - (fatigue - 3) * 0.3 + random.uniform(-1.5, 1.5))))

            # Muscle soreness (delayed effect from previous day's training)
            muscle_soreness = max(1, min(10, int(fatigue * 0.7 + random.uniform(0, 2))))

            # Stress (more variable, some correlation with training load)
            stress = max(1, min(10, int(4 + random.uniform(-2, 3))))

            # Mood (inverse correlation with fatigue and stress)
            mood = max(1, min(10, int(10 - (fatigue + stress) / 3 + random.uniform(-1, 1))))

            # Motivation (tends to follow mood)
            motivation = max(1, min(10, int(mood * 0.8 + random.uniform(0, 2))))

            # Create data entry
            entry = {
                'date': current_date.strftime('%Y-%m-%d'),
                'athlete_id': athlete_id,
                'athlete_name': athlete['name'],
                'athlete_name_ar': athlete['name_ar'],
                'sport': sport,
                'training_duration': duration,
                'rpe': rpe,
                'training_load': training_load,
                'sleep_quality': sleep_quality,
                'fatigue': fatigue,
                'muscle_soreness': muscle_soreness,
                'stress': stress,
                'mood': mood,
                'motivation': motivation,
                'notes': '',
                'injury_reported': False
            }

            data.append(entry)
            current_date += timedelta(days=1)

    return pd.DataFrame(data)


def generate_high_risk_scenario(athlete_id: str, athlete_name: str,
                                  athlete_name_ar: str, sport: str, days: int = 14):
    """
    Generate a scenario showing an athlete at high injury risk.
    Useful for demonstrating the system's alert capabilities.
    """

    data = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    current_date = start_date

    # Simulate overtraining scenario
    while current_date <= end_date:
        day_num = (current_date - start_date).days

        # Gradually increasing training load (overtraining pattern)
        if day_num < 7:
            # First week: moderate
            duration = random.randint(80, 100)
            rpe = random.randint(6, 7)
        else:
            # Second week: spike in training (preparing for competition)
            duration = random.randint(110, 140)
            rpe = random.randint(8, 10)

        training_load = duration * rpe

        # Wellness deteriorates as overtraining continues
        fatigue = min(10, 4 + day_num * 0.4 + random.uniform(-0.5, 0.5))
        sleep_quality = max(1, 8 - day_num * 0.3 + random.uniform(-0.5, 0.5))
        muscle_soreness = min(10, 3 + day_num * 0.35 + random.uniform(-0.5, 0.5))
        stress = min(10, 4 + day_num * 0.25 + random.uniform(-0.5, 0.5))
        mood = max(1, 8 - day_num * 0.25 + random.uniform(-0.5, 0.5))
        motivation = max(1, 7 - day_num * 0.2 + random.uniform(-0.5, 0.5))

        entry = {
            'date': current_date.strftime('%Y-%m-%d'),
            'athlete_id': athlete_id,
            'athlete_name': athlete_name,
            'athlete_name_ar': athlete_name_ar,
            'sport': sport,
            'training_duration': duration,
            'rpe': rpe,
            'training_load': training_load,
            'sleep_quality': int(sleep_quality),
            'fatigue': int(fatigue),
            'muscle_soreness': int(muscle_soreness),
            'stress': int(stress),
            'mood': int(mood),
            'motivation': int(motivation),
            'notes': 'Competition preparation' if day_num >= 7 else '',
            'injury_reported': False
        }

        data.append(entry)
        current_date += timedelta(days=1)

    return pd.DataFrame(data)


# ============================================
# DATA LOADING FUNCTIONS
# ============================================

def load_sample_data():
    """Load all sample data for demo purposes"""

    # Generate main training data
    main_data = generate_sample_training_data(SAMPLE_ATHLETES, days=60)

    # Add a high-risk scenario for one athlete (for demo)
    high_risk_data = generate_high_risk_scenario(
        'TKD_RISK', 'Mohammed Al-Ahmad', 'محمد الأحمد', 'taekwondo', days=21
    )

    # Add the high-risk athlete to the athletes list
    high_risk_athlete = create_athlete_profile(
        'TKD_RISK', 'Mohammed Al-Ahmad', 'محمد الأحمد', 'taekwondo',
        23, 72, 180, 'M',
        [{'injury': 'muscle_strain', 'date': '2023-05-10', 'recovery_days': 14}]
    )

    all_athletes = SAMPLE_ATHLETES + [high_risk_athlete]

    # Combine all training data
    all_data = pd.concat([main_data, high_risk_data], ignore_index=True)

    return all_athletes, all_data


def get_athlete_by_id(athletes: list, athlete_id: str):
    """Get athlete profile by ID"""
    for athlete in athletes:
        if athlete['athlete_id'] == athlete_id:
            return athlete
    return None


def get_athletes_by_sport(athletes: list, sport: str):
    """Get all athletes in a specific sport"""
    return [a for a in athletes if a['sport'] == sport]


def get_athlete_data(df: pd.DataFrame, athlete_id: str, days: int = None):
    """Get training data for a specific athlete"""
    athlete_data = df[df['athlete_id'] == athlete_id].copy()
    athlete_data['date'] = pd.to_datetime(athlete_data['date'])
    athlete_data = athlete_data.sort_values('date')

    if days:
        cutoff_date = datetime.now() - timedelta(days=days)
        athlete_data = athlete_data[athlete_data['date'] >= cutoff_date]

    return athlete_data


if __name__ == "__main__":
    # Test data generation
    print("Generating sample data...")
    athletes, data = load_sample_data()
    print(f"Created {len(athletes)} athletes")
    print(f"Generated {len(data)} training records")
    print("\nSample data preview:")
    print(data.head(10))
    print("\nAthletes:")
    for a in athletes[:5]:
        print(f"  - {a['name']} ({a['sport']})")
