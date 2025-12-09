"""
JOC Injury Prevention System - PDF Report Generator
====================================================
Generates professional PDF reports for athletes and teams.
"""

from fpdf import FPDF
from datetime import datetime
import os


class JOCReport(FPDF):
    """Custom PDF class with JOC branding"""

    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)

    def header(self):
        """Add header to each page"""
        # JOC Colors gradient effect (simplified)
        self.set_fill_color(0, 122, 61)  # Green
        self.rect(0, 0, 70, 10, 'F')

        self.set_fill_color(0, 0, 0)  # Black
        self.rect(70, 0, 70, 10, 'F')

        self.set_fill_color(206, 17, 38)  # Red
        self.rect(140, 0, 70, 10, 'F')

        # Title
        self.set_y(15)
        self.set_font('Arial', 'B', 16)
        self.set_text_color(0, 122, 61)
        self.cell(0, 10, 'JOC Athlete Recovery Monitor', 0, 1, 'C')

        self.set_font('Arial', '', 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, 'Injury Prevention & Performance Optimization', 0, 1, 'C')

        self.ln(5)

    def footer(self):
        """Add footer to each page"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)

        # Page number
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

        # Footer text
        self.set_y(-20)
        self.cell(0, 10, f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")} | QUALIA SOLUTIONS for JOC', 0, 0, 'C')

    def add_section_title(self, title):
        """Add a section title"""
        self.set_font('Arial', 'B', 14)
        self.set_text_color(0, 122, 61)
        self.cell(0, 10, title, 0, 1, 'L')
        self.set_draw_color(0, 122, 61)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def add_metric_box(self, label, value, status_color=(0, 122, 61)):
        """Add a metric display box"""
        # Box background
        x = self.get_x()
        y = self.get_y()

        self.set_fill_color(245, 245, 245)
        self.rect(x, y, 40, 20, 'F')

        # Border color based on status
        self.set_draw_color(*status_color)
        self.set_line_width(0.5)
        self.rect(x, y, 40, 20, 'D')

        # Value
        self.set_xy(x, y + 2)
        self.set_font('Arial', 'B', 14)
        self.set_text_color(*status_color)
        self.cell(40, 8, str(value), 0, 1, 'C')

        # Label
        self.set_x(x)
        self.set_font('Arial', '', 8)
        self.set_text_color(100, 100, 100)
        self.cell(40, 6, label, 0, 1, 'C')

        self.set_xy(x + 45, y)

    def add_risk_indicator(self, risk_level, combined_risk):
        """Add visual risk indicator"""
        # Determine color
        if combined_risk >= 65:
            color = (220, 53, 69)  # Red
            status = "HIGH RISK"
        elif combined_risk >= 35:
            color = (255, 193, 7)  # Yellow
            status = "MODERATE"
        else:
            color = (40, 167, 69)  # Green
            status = "LOW RISK"

        self.set_fill_color(*color)
        self.set_draw_color(*color)

        # Risk badge
        x = self.get_x()
        y = self.get_y()

        self.set_font('Arial', 'B', 12)
        self.set_text_color(255, 255, 255)

        # Badge background
        self.rect(x, y, 50, 12, 'F')
        self.set_xy(x, y + 2)
        self.cell(50, 8, status, 0, 0, 'C')

        self.set_xy(x + 55, y)
        self.set_text_color(0, 0, 0)

    def add_table(self, headers, data, col_widths=None):
        """Add a data table"""
        if col_widths is None:
            col_widths = [190 // len(headers)] * len(headers)

        # Header row
        self.set_font('Arial', 'B', 10)
        self.set_fill_color(0, 122, 61)
        self.set_text_color(255, 255, 255)

        for i, header in enumerate(headers):
            self.cell(col_widths[i], 8, header, 1, 0, 'C', True)
        self.ln()

        # Data rows
        self.set_font('Arial', '', 9)
        self.set_text_color(0, 0, 0)

        fill = False
        for row in data:
            if fill:
                self.set_fill_color(245, 245, 245)
            else:
                self.set_fill_color(255, 255, 255)

            for i, cell in enumerate(row):
                self.cell(col_widths[i], 7, str(cell), 1, 0, 'C', True)
            self.ln()
            fill = not fill

    def add_recommendation(self, text, rec_type='info'):
        """Add a recommendation box"""
        if rec_type == 'critical':
            bg_color = (248, 215, 218)
            border_color = (114, 28, 36)
            icon = "!"
        elif rec_type == 'warning':
            bg_color = (255, 243, 205)
            border_color = (133, 100, 4)
            icon = "!"
        else:
            bg_color = (212, 237, 218)
            border_color = (21, 87, 36)
            icon = ">"

        x = self.get_x()
        y = self.get_y()

        # Background
        self.set_fill_color(*bg_color)
        self.rect(x, y, 190, 12, 'F')

        # Left border
        self.set_fill_color(*border_color)
        self.rect(x, y, 3, 12, 'F')

        # Text
        self.set_xy(x + 5, y + 3)
        self.set_font('Arial', '', 10)
        self.set_text_color(*border_color)
        self.cell(180, 6, f"{icon} {text}", 0, 1, 'L')

        self.ln(3)


def generate_athlete_report(athlete, metrics, recommendations, training_data):
    """
    Generate individual athlete report PDF.

    Args:
        athlete: Athlete profile dictionary
        metrics: Current metrics (ACWR, wellness, etc.)
        recommendations: List of recommendations
        training_data: Recent training data DataFrame

    Returns:
        Path to generated PDF file
    """
    pdf = JOCReport()
    pdf.add_page()

    # Athlete Info Section
    pdf.add_section_title(f"Athlete Report: {athlete['name']}")

    pdf.set_font('Arial', '', 11)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 6, f"Sport: {athlete['sport'].title()}", 0, 1)
    pdf.cell(0, 6, f"Report Date: {datetime.now().strftime('%Y-%m-%d')}", 0, 1)
    pdf.ln(5)

    # Key Metrics Section
    pdf.add_section_title("Current Status")

    # ACWR
    acwr_color = (40, 167, 69) if 0.8 <= metrics['acwr'] <= 1.3 else (220, 53, 69)
    pdf.add_metric_box("ACWR", f"{metrics['acwr']:.2f}", acwr_color)

    # Wellness
    wellness_color = (40, 167, 69) if metrics['wellness'] >= 60 else (220, 53, 69)
    pdf.add_metric_box("Wellness", f"{metrics['wellness']:.0f}%", wellness_color)

    # Combined Risk
    risk_color = (40, 167, 69) if metrics['combined_risk'] < 35 else (220, 53, 69)
    pdf.add_metric_box("Risk", f"{metrics['combined_risk']:.0f}%", risk_color)

    pdf.ln(25)

    # Risk Indicator
    pdf.add_section_title("Risk Assessment")
    pdf.add_risk_indicator(metrics.get('risk_level', 'Unknown'), metrics['combined_risk'])
    pdf.ln(15)

    # Recommendations Section
    pdf.add_section_title("Recommendations")

    for rec in recommendations:
        if 'REDUCE' in rec.upper() or 'CRITICAL' in rec.upper():
            pdf.add_recommendation(rec, 'critical')
        elif 'CAUTION' in rec.upper() or 'WARNING' in rec.upper() or 'monitor' in rec.lower():
            pdf.add_recommendation(rec, 'warning')
        else:
            pdf.add_recommendation(rec, 'info')

    # Training Load Table
    if training_data is not None and not training_data.empty:
        pdf.add_page()
        pdf.add_section_title("Recent Training Data (Last 7 Days)")

        recent = training_data.tail(7)
        headers = ['Date', 'Duration', 'RPE', 'Load', 'Sleep', 'Fatigue']
        data = []

        for _, row in recent.iterrows():
            data.append([
                str(row['date'])[:10] if hasattr(row['date'], 'strftime') else str(row['date'])[:10],
                f"{row['training_duration']} min",
                str(int(row['rpe'])),
                str(int(row['training_load'])),
                str(int(row['sleep_quality'])),
                str(int(row['fatigue']))
            ])

        pdf.add_table(headers, data, [35, 30, 25, 30, 30, 30])

    # Save PDF
    output_dir = os.path.join(os.path.dirname(__file__), 'reports')
    os.makedirs(output_dir, exist_ok=True)

    filename = f"athlete_report_{athlete['athlete_id']}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    filepath = os.path.join(output_dir, filename)

    pdf.output(filepath)

    return filepath


def generate_team_report(athletes_summary, alerts):
    """
    Generate team summary report PDF.

    Args:
        athletes_summary: DataFrame with all athletes' current status
        alerts: List of active alerts

    Returns:
        Path to generated PDF file
    """
    pdf = JOCReport()
    pdf.add_page()

    # Report Header
    pdf.add_section_title("Team Status Report")
    pdf.set_font('Arial', '', 11)
    pdf.cell(0, 6, f"Report Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}", 0, 1)
    pdf.cell(0, 6, f"Total Athletes: {len(athletes_summary)}", 0, 1)
    pdf.ln(5)

    # Risk Summary
    pdf.add_section_title("Risk Distribution")

    high_risk = len(athletes_summary[athletes_summary['combined_risk'] >= 65])
    moderate_risk = len(athletes_summary[(athletes_summary['combined_risk'] >= 35) & (athletes_summary['combined_risk'] < 65)])
    low_risk = len(athletes_summary[athletes_summary['combined_risk'] < 35])

    pdf.add_metric_box("High Risk", str(high_risk), (220, 53, 69))
    pdf.add_metric_box("Moderate", str(moderate_risk), (255, 193, 7))
    pdf.add_metric_box("Low Risk", str(low_risk), (40, 167, 69))

    pdf.ln(25)

    # Alerts Section
    if alerts:
        pdf.add_section_title(f"Active Alerts ({len(alerts)})")

        for alert in alerts[:10]:  # Limit to first 10
            rec_type = 'critical' if alert['type'] == 'critical' else 'warning'
            pdf.add_recommendation(f"{alert['athlete_name']}: {alert['message']}", rec_type)

    # Athletes Table
    pdf.add_page()
    pdf.add_section_title("All Athletes Status")

    headers = ['Athlete', 'Sport', 'ACWR', 'Wellness', 'Risk %', 'Status']
    data = []

    for _, row in athletes_summary.iterrows():
        data.append([
            row['name'][:15],  # Truncate long names
            row['sport'][:8],
            f"{row['acwr']:.2f}",
            f"{row['wellness_score']:.0f}",
            f"{row['combined_risk']:.0f}%",
            row['overall_status'][:10]
        ])

    pdf.add_table(headers, data, [40, 25, 25, 25, 25, 40])

    # Save PDF
    output_dir = os.path.join(os.path.dirname(__file__), 'reports')
    os.makedirs(output_dir, exist_ok=True)

    filename = f"team_report_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    filepath = os.path.join(output_dir, filename)

    pdf.output(filepath)

    return filepath


if __name__ == "__main__":
    # Test report generation
    from data_models import load_sample_data, get_athlete_data
    from acwr_calculator import (
        calculate_acwr, calculate_wellness_score, calculate_combined_risk,
        generate_recommendations, analyze_all_athletes, check_alerts
    )

    print("Loading sample data...")
    athletes, training_data = load_sample_data()

    # Generate individual report for first athlete
    athlete = athletes[0]
    athlete_data = get_athlete_data(training_data, athlete['athlete_id'], 30)

    if not athlete_data.empty:
        acwr = calculate_acwr(athlete_data)
        latest = athlete_data.sort_values('date').iloc[-1]

        wellness = calculate_wellness_score(
            latest['sleep_quality'],
            latest['fatigue'],
            latest['muscle_soreness'],
            latest['stress'],
            latest['mood'],
            latest['motivation']
        )

        combined = calculate_combined_risk(acwr, wellness)

        metrics = {
            'acwr': acwr,
            'wellness': wellness,
            'combined_risk': combined['combined_risk'],
            'risk_level': combined['status']
        }

        recommendations = generate_recommendations(acwr, wellness, athlete_data)

        print(f"\nGenerating report for {athlete['name']}...")
        filepath = generate_athlete_report(athlete, metrics, recommendations, athlete_data)
        print(f"Report saved to: {filepath}")

    # Generate team report
    print("\nGenerating team report...")
    summary = analyze_all_athletes(athletes, training_data)

    all_alerts = []
    for _, row in summary.iterrows():
        alerts = check_alerts(row['athlete_id'], row['name'], row['acwr'], row['wellness_score'], {'combined_risk': row['combined_risk']})
        all_alerts.extend(alerts)

    team_filepath = generate_team_report(summary, all_alerts)
    print(f"Team report saved to: {team_filepath}")
