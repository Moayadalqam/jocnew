"""
JOC Injury Prevention System - Main Dashboard
==============================================
Streamlit-based dashboard for monitoring athlete injury risk.

Run with: streamlit run dashboard.py
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import (
    JOC_COLORS, RISK_COLORS, RISK_ZONES, SPORTS,
    TRANSLATIONS, ACWR_THRESHOLDS, DASHBOARD_SETTINGS
)
from data_models import load_sample_data, get_athlete_data, get_athlete_by_id
from acwr_calculator import (
    calculate_acwr, calculate_rolling_acwr, get_risk_level,
    calculate_wellness_score, get_wellness_status, calculate_combined_risk,
    generate_recommendations, check_alerts, analyze_all_athletes,
    detect_load_spikes
)

# ============================================
# PAGE CONFIGURATION
# ============================================

st.set_page_config(
    page_title="JOC Athlete Recovery Monitor",
    page_icon="🏅",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================
# CUSTOM CSS STYLING
# ============================================

st.markdown("""
<style>
    /* Main container */
    .main {
        padding: 1rem;
    }

    /* Header styling */
    .main-header {
        background: linear-gradient(90deg, #007A3D 0%, #000000 50%, #CE1126 100%);
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        text-align: center;
    }

    .main-header h1 {
        color: white !important;
        margin: 0;
        font-size: 2rem;
    }

    .main-header p {
        color: white !important;
        margin: 10px 0 0 0;
        font-size: 1.1rem;
    }

    /* Metric cards */
    .metric-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
        border-left: 4px solid;
    }

    .metric-card h3 {
        margin: 0;
        font-size: 2.5rem;
        font-weight: bold;
    }

    .metric-card p {
        margin: 5px 0 0 0;
        color: #666;
        font-size: 0.9rem;
    }

    /* Risk badge */
    .risk-badge {
        display: inline-block;
        padding: 5px 15px;
        border-radius: 20px;
        color: white;
        font-weight: bold;
        font-size: 0.9rem;
    }

    /* Alert box */
    .alert-box {
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        border-left: 4px solid;
    }

    .alert-critical {
        background: #F8D7DA;
        border-color: #721C24;
        color: #721C24;
    }

    .alert-warning {
        background: #FFF3CD;
        border-color: #856404;
        color: #856404;
    }

    .alert-info {
        background: #D1ECF1;
        border-color: #0C5460;
        color: #0C5460;
    }

    /* Athlete card */
    .athlete-card {
        background: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 10px 0;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .athlete-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    /* Sidebar styling */
    .css-1d391kg {
        background: #F5F5F5;
    }

    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* Table styling */
    .dataframe {
        font-size: 0.9rem;
    }
</style>
""", unsafe_allow_html=True)


# ============================================
# LOAD DATA
# ============================================

@st.cache_data
def load_data():
    """Load and cache sample data"""
    return load_sample_data()


# Load data
athletes, training_data = load_data()


# ============================================
# SIDEBAR
# ============================================

with st.sidebar:
    # Logo/Header
    st.markdown("""
    <div style="text-align: center; padding: 20px 0;">
        <h2 style="color: #007A3D; margin: 0;">🏅 JOC</h2>
        <p style="color: #666; font-size: 0.9rem;">Athlete Recovery Monitor</p>
        <p style="color: #666; font-size: 0.8rem; direction: rtl;">مراقب تعافي الرياضيين</p>
    </div>
    """, unsafe_allow_html=True)

    st.divider()

    # Language selector
    language = st.selectbox(
        "Language / اللغة",
        options=['English', 'العربية'],
        index=0
    )
    lang_code = 'en' if language == 'English' else 'ar'
    t = TRANSLATIONS[lang_code]

    st.divider()

    # Navigation
    page = st.radio(
        "Navigation",
        options=['📊 Dashboard', '👤 Individual Athlete', '⚠️ Alerts', '📈 Trends', '📋 Reports'],
        index=0
    )

    st.divider()

    # Sport filter
    sport_options = ['All Sports'] + list(SPORTS.keys())
    selected_sport = st.selectbox(
        "Filter by Sport",
        options=sport_options,
        format_func=lambda x: SPORTS[x]['name'] if x in SPORTS else x
    )

    st.divider()

    # Date range
    st.markdown("**Date Range**")
    date_range = st.slider(
        "Days to analyze",
        min_value=7,
        max_value=90,
        value=30
    )

    st.divider()

    # Quick stats
    st.markdown("**Quick Stats**")
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Athletes", len(athletes))
    with col2:
        st.metric("Sports", len(SPORTS))


# ============================================
# MAIN CONTENT
# ============================================

# Header
st.markdown("""
<div class="main-header">
    <h1>🏅 JOC Athlete Recovery Monitor</h1>
    <p>مراقب تعافي الرياضيين - اللجنة الأولمبية الأردنية</p>
</div>
""", unsafe_allow_html=True)


# ============================================
# DASHBOARD PAGE
# ============================================

if page == '📊 Dashboard':

    # Analyze all athletes
    summary = analyze_all_athletes(athletes, training_data)

    # Filter by sport if selected
    if selected_sport != 'All Sports':
        summary = summary[summary['sport'] == selected_sport]
        filtered_athletes = [a for a in athletes if a['sport'] == selected_sport]
    else:
        filtered_athletes = athletes

    # Top metrics row
    st.markdown("### Overview")

    col1, col2, col3, col4 = st.columns(4)

    # Count risk levels
    high_risk_count = len(summary[summary['combined_risk'] >= 65])
    moderate_risk_count = len(summary[(summary['combined_risk'] >= 35) & (summary['combined_risk'] < 65)])
    low_risk_count = len(summary[summary['combined_risk'] < 35])
    avg_wellness = summary['wellness_score'].mean() if not summary.empty else 0

    with col1:
        st.markdown(f"""
        <div class="metric-card" style="border-color: #DC3545;">
            <h3 style="color: #DC3545;">{high_risk_count}</h3>
            <p>High Risk Athletes</p>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="metric-card" style="border-color: #FFC107;">
            <h3 style="color: #FFC107;">{moderate_risk_count}</h3>
            <p>Moderate Risk</p>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="metric-card" style="border-color: #28A745;">
            <h3 style="color: #28A745;">{low_risk_count}</h3>
            <p>Low Risk</p>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        wellness_color = '#28A745' if avg_wellness >= 60 else '#FFC107' if avg_wellness >= 40 else '#DC3545'
        st.markdown(f"""
        <div class="metric-card" style="border-color: {wellness_color};">
            <h3 style="color: {wellness_color};">{avg_wellness:.0f}%</h3>
            <p>Avg Wellness Score</p>
        </div>
        """, unsafe_allow_html=True)

    st.divider()

    # Risk Distribution Chart
    col1, col2 = st.columns([2, 1])

    with col1:
        st.markdown("### Athlete Risk Distribution")

        if not summary.empty:
            # Create scatter plot with ACWR vs Wellness
            fig = px.scatter(
                summary,
                x='acwr',
                y='wellness_score',
                color='overall_status',
                size='combined_risk',
                hover_name='name',
                hover_data={
                    'sport': True,
                    'acwr': ':.2f',
                    'wellness_score': ':.1f',
                    'combined_risk': ':.1f'
                },
                color_discrete_map={
                    'Low Risk': '#28A745',
                    'Moderate Risk': '#FFC107',
                    'Elevated Risk': '#FD7E14',
                    'High Risk': '#DC3545',
                    'Critical Risk': '#721C24'
                },
                labels={
                    'acwr': 'ACWR (Acute:Chronic Workload Ratio)',
                    'wellness_score': 'Wellness Score',
                    'overall_status': 'Risk Status'
                }
            )

            # Add optimal zone shading
            fig.add_vrect(
                x0=0.8, x1=1.3,
                fillcolor="green", opacity=0.1,
                layer="below", line_width=0,
                annotation_text="Optimal Zone",
                annotation_position="top left"
            )

            # Add danger zone shading
            fig.add_vrect(
                x0=1.5, x1=2.5,
                fillcolor="red", opacity=0.1,
                layer="below", line_width=0,
                annotation_text="Danger Zone",
                annotation_position="top right"
            )

            fig.update_layout(
                height=400,
                showlegend=True,
                legend=dict(orientation="h", yanchor="bottom", y=1.02)
            )

            st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown("### Risk Breakdown")

        # Pie chart of risk levels
        risk_counts = summary['overall_status'].value_counts()

        fig_pie = px.pie(
            values=risk_counts.values,
            names=risk_counts.index,
            color=risk_counts.index,
            color_discrete_map={
                'Low Risk': '#28A745',
                'Moderate Risk': '#FFC107',
                'Elevated Risk': '#FD7E14',
                'High Risk': '#DC3545',
                'Critical Risk': '#721C24'
            }
        )
        fig_pie.update_layout(height=300, showlegend=True)
        st.plotly_chart(fig_pie, use_container_width=True)

    st.divider()

    # Athletes Table
    st.markdown("### All Athletes Status")

    if not summary.empty:
        # Format the display dataframe
        display_df = summary[['name', 'sport', 'acwr', 'risk_zone', 'wellness_score', 'overall_status', 'recommendation']].copy()
        display_df.columns = ['Athlete', 'Sport', 'ACWR', 'ACWR Risk', 'Wellness', 'Overall Status', 'Recommendation']

        # Sort by combined risk (highest first)
        display_df = display_df.sort_values('Wellness', ascending=True)

        # Apply styling
        def color_risk(val):
            if 'Critical' in str(val) or 'High' in str(val):
                return 'background-color: #F8D7DA; color: #721C24'
            elif 'Elevated' in str(val) or 'Moderate' in str(val):
                return 'background-color: #FFF3CD; color: #856404'
            elif 'Low' in str(val) or 'Optimal' in str(val):
                return 'background-color: #D4EDDA; color: #155724'
            return ''

        styled_df = display_df.style.applymap(
            color_risk,
            subset=['ACWR Risk', 'Overall Status']
        )

        st.dataframe(styled_df, use_container_width=True, height=400)
    else:
        st.info("No athletes found for the selected filter.")


# ============================================
# INDIVIDUAL ATHLETE PAGE
# ============================================

elif page == '👤 Individual Athlete':

    st.markdown("### Individual Athlete Analysis")

    # Athlete selector
    athlete_options = {a['athlete_id']: f"{a['name']} ({a['sport']})" for a in athletes}
    selected_athlete_id = st.selectbox(
        "Select Athlete",
        options=list(athlete_options.keys()),
        format_func=lambda x: athlete_options[x]
    )

    if selected_athlete_id:
        athlete = get_athlete_by_id(athletes, selected_athlete_id)
        athlete_data = get_athlete_data(training_data, selected_athlete_id, date_range)

        if not athlete_data.empty:
            # Calculate current metrics
            acwr = calculate_acwr(athlete_data)
            risk = get_risk_level(acwr)

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

            # Athlete header
            col1, col2 = st.columns([3, 1])

            with col1:
                st.markdown(f"""
                ## {athlete['name']}
                **{athlete['name_ar']}** | {SPORTS[athlete['sport']]['name']} |
                Age: {athlete['age']} | {athlete['gender']}
                """)

            with col2:
                st.markdown(f"""
                <div class="risk-badge" style="background: {combined['color']};">
                    {combined['status']}
                </div>
                """, unsafe_allow_html=True)

            st.divider()

            # Key metrics
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.metric(
                    "ACWR",
                    f"{acwr:.2f}",
                    delta=f"{risk['label']}",
                    delta_color="off"
                )

            with col2:
                st.metric(
                    "Wellness Score",
                    f"{wellness:.0f}/100",
                    delta=wellness_status['status'],
                    delta_color="off"
                )

            with col3:
                st.metric(
                    "Combined Risk",
                    f"{combined['combined_risk']:.0f}%",
                    delta=combined['status'],
                    delta_color="inverse"
                )

            with col4:
                total_load = athlete_data['training_load'].tail(7).sum()
                st.metric(
                    "7-Day Load",
                    f"{total_load:,} AU",
                    delta="Training Units",
                    delta_color="off"
                )

            st.divider()

            # Charts
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("#### ACWR Trend")

                rolling_acwr = calculate_rolling_acwr(athlete_data, date_range)

                fig_acwr = go.Figure()

                # Add ACWR line
                fig_acwr.add_trace(go.Scatter(
                    x=rolling_acwr['date'],
                    y=rolling_acwr['acwr'],
                    mode='lines+markers',
                    name='ACWR',
                    line=dict(color='#007A3D', width=2)
                ))

                # Add optimal zone
                fig_acwr.add_hrect(
                    y0=0.8, y1=1.3,
                    fillcolor="green", opacity=0.1,
                    layer="below", line_width=0
                )

                # Add danger line
                fig_acwr.add_hline(
                    y=1.5,
                    line_dash="dash",
                    line_color="red",
                    annotation_text="High Risk Threshold"
                )

                fig_acwr.update_layout(
                    height=300,
                    yaxis_title="ACWR",
                    xaxis_title="Date",
                    showlegend=False
                )

                st.plotly_chart(fig_acwr, use_container_width=True)

            with col2:
                st.markdown("#### Training Load")

                fig_load = px.bar(
                    athlete_data.tail(14),
                    x='date',
                    y='training_load',
                    color='rpe',
                    color_continuous_scale=['green', 'yellow', 'red'],
                    labels={'training_load': 'Load (AU)', 'rpe': 'RPE'}
                )
                fig_load.update_layout(height=300)
                st.plotly_chart(fig_load, use_container_width=True)

            # Wellness metrics
            st.markdown("#### Wellness Metrics (Last 14 Days)")

            wellness_cols = ['sleep_quality', 'fatigue', 'muscle_soreness', 'stress', 'mood', 'motivation']
            recent_wellness = athlete_data.tail(14)[['date'] + wellness_cols]

            fig_wellness = make_subplots(rows=2, cols=3, subplot_titles=[
                'Sleep Quality', 'Fatigue', 'Muscle Soreness',
                'Stress', 'Mood', 'Motivation'
            ])

            colors = ['#007A3D', '#DC3545', '#DC3545', '#DC3545', '#007A3D', '#007A3D']

            for i, (col, color) in enumerate(zip(wellness_cols, colors)):
                row = i // 3 + 1
                col_num = i % 3 + 1

                fig_wellness.add_trace(
                    go.Scatter(
                        x=recent_wellness['date'],
                        y=recent_wellness[col],
                        mode='lines+markers',
                        name=col.replace('_', ' ').title(),
                        line=dict(color=color)
                    ),
                    row=row, col=col_num
                )

            fig_wellness.update_layout(height=400, showlegend=False)
            fig_wellness.update_yaxes(range=[0, 11])
            st.plotly_chart(fig_wellness, use_container_width=True)

            # Recommendations
            st.markdown("#### Recommendations")

            recommendations = generate_recommendations(acwr, wellness, athlete_data)

            for rec in recommendations:
                if '🔴' in rec or 'REDUCE' in rec.upper():
                    st.error(rec)
                elif '🟡' in rec or '⚠️' in rec:
                    st.warning(rec)
                else:
                    st.success(rec)

            # Injury History
            if athlete.get('injury_history'):
                st.markdown("#### Injury History")
                for injury in athlete['injury_history']:
                    st.markdown(f"- **{injury['injury'].replace('_', ' ').title()}** - {injury['date']} ({injury['recovery_days']} days recovery)")

        else:
            st.warning("No training data available for this athlete.")


# ============================================
# ALERTS PAGE
# ============================================

elif page == '⚠️ Alerts':

    st.markdown("### Active Alerts")

    # Collect all alerts
    all_alerts = []
    summary = analyze_all_athletes(athletes, training_data)

    for _, row in summary.iterrows():
        alerts = check_alerts(
            row['athlete_id'],
            row['name'],
            row['acwr'],
            row['wellness_score'],
            {'combined_risk': row['combined_risk']}
        )
        all_alerts.extend(alerts)

    # Filter by type
    alert_filter = st.multiselect(
        "Filter by type",
        options=['critical', 'warning', 'caution'],
        default=['critical', 'warning', 'caution']
    )

    filtered_alerts = [a for a in all_alerts if a['type'] in alert_filter]

    if filtered_alerts:
        # Sort by severity
        severity_order = {'critical': 0, 'warning': 1, 'caution': 2}
        filtered_alerts.sort(key=lambda x: severity_order.get(x['type'], 3))

        for alert in filtered_alerts:
            if alert['type'] == 'critical':
                st.markdown(f"""
                <div class="alert-box alert-critical">
                    <strong>🚨 CRITICAL - {alert['athlete_name']}</strong><br>
                    {alert['message']}<br>
                    <em>Action: {alert['action']}</em>
                </div>
                """, unsafe_allow_html=True)
            elif alert['type'] == 'warning':
                st.markdown(f"""
                <div class="alert-box alert-warning">
                    <strong>⚠️ WARNING - {alert['athlete_name']}</strong><br>
                    {alert['message']}<br>
                    <em>Action: {alert['action']}</em>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="alert-box alert-info">
                    <strong>ℹ️ CAUTION - {alert['athlete_name']}</strong><br>
                    {alert['message']}<br>
                    <em>Action: {alert['action']}</em>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.success("✅ No active alerts! All athletes are within acceptable risk levels.")


# ============================================
# TRENDS PAGE
# ============================================

elif page == '📈 Trends':

    st.markdown("### Team Trends & Analytics")

    # Sport comparison
    st.markdown("#### Risk by Sport")

    summary = analyze_all_athletes(athletes, training_data)

    if not summary.empty:
        sport_avg = summary.groupby('sport').agg({
            'acwr': 'mean',
            'wellness_score': 'mean',
            'combined_risk': 'mean'
        }).reset_index()

        sport_avg['sport_name'] = sport_avg['sport'].map(lambda x: SPORTS.get(x, {}).get('name', x))

        fig_sport = px.bar(
            sport_avg,
            x='sport_name',
            y=['acwr', 'wellness_score', 'combined_risk'],
            barmode='group',
            labels={'value': 'Score', 'sport_name': 'Sport'},
            color_discrete_sequence=['#007A3D', '#17A2B8', '#DC3545']
        )
        fig_sport.update_layout(height=400)
        st.plotly_chart(fig_sport, use_container_width=True)

        # Training load trend
        st.markdown("#### Team Training Load Trend")

        daily_load = training_data.groupby('date').agg({
            'training_load': 'sum'
        }).reset_index()

        fig_trend = px.line(
            daily_load,
            x='date',
            y='training_load',
            labels={'training_load': 'Total Team Load (AU)', 'date': 'Date'}
        )
        fig_trend.update_traces(line_color='#007A3D')
        fig_trend.update_layout(height=300)
        st.plotly_chart(fig_trend, use_container_width=True)


# ============================================
# REPORTS PAGE
# ============================================

elif page == '📋 Reports':

    st.markdown("### Generate Reports")

    report_type = st.selectbox(
        "Report Type",
        options=['Team Summary', 'Individual Athlete', 'Weekly Overview']
    )

    if report_type == 'Team Summary':
        st.markdown("#### Team Summary Report")

        summary = analyze_all_athletes(athletes, training_data)

        # Display summary statistics
        col1, col2 = st.columns(2)

        with col1:
            st.markdown("**Risk Distribution**")
            st.dataframe(summary['overall_status'].value_counts())

        with col2:
            st.markdown("**Average Metrics**")
            st.metric("Avg ACWR", f"{summary['acwr'].mean():.2f}")
            st.metric("Avg Wellness", f"{summary['wellness_score'].mean():.1f}")

        # Download button
        csv = summary.to_csv(index=False)
        st.download_button(
            label="📥 Download Full Report (CSV)",
            data=csv,
            file_name=f"joc_team_report_{datetime.now().strftime('%Y%m%d')}.csv",
            mime="text/csv"
        )

    elif report_type == 'Individual Athlete':
        athlete_options = {a['athlete_id']: f"{a['name']} ({a['sport']})" for a in athletes}
        selected = st.selectbox(
            "Select Athlete",
            options=list(athlete_options.keys()),
            format_func=lambda x: athlete_options[x]
        )

        if selected:
            athlete_data = get_athlete_data(training_data, selected, 30)
            if not athlete_data.empty:
                csv = athlete_data.to_csv(index=False)
                st.download_button(
                    label="📥 Download Athlete Data (CSV)",
                    data=csv,
                    file_name=f"athlete_{selected}_{datetime.now().strftime('%Y%m%d')}.csv",
                    mime="text/csv"
                )


# ============================================
# FOOTER
# ============================================

st.divider()

st.markdown("""
<div style="text-align: center; padding: 20px; color: #666;">
    <p><strong>JOC Athlete Recovery Monitor</strong></p>
    <p>Developed by QUALIA SOLUTIONS for Jordan Olympic Committee</p>
    <p style="direction: rtl;">مطور من قبل حلول كواليا للجنة الأولمبية الأردنية</p>
    <p style="font-size: 0.8rem;">Powered by Streamlit | Data refreshed: {}</p>
</div>
""".format(datetime.now().strftime('%Y-%m-%d %H:%M')), unsafe_allow_html=True)
