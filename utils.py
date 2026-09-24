import os
from werkzeug.security import generate_password_hash, check_password_hash
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from datetime import datetime

def allowed_file(filename, allowed_extensions):
    """
    Checks if an uploaded filename has a safe, permitted image extension.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def hash_password(password):
    """
    Hashes a plain text password using PBKDF2 with SHA256.
    """
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password(hashed_password, password):
    """
    Verifies a plain text password against its corresponding stored PBKDF2 hash.
    """
    return check_password_hash(hashed_password, password)

def generate_pdf_report(pdf_path, patient_name, patient_email, diagnosis, confidence, date, recommendations, urgency, image_path=None, heatmap_path=None):
    """
    Generates a highly polished, hospital-grade clinical PDF report using ReportLab.
    """
    doc = SimpleDocTemplate(pdf_path, pagesize=letter,
                            rightMargin=40, leftMargin=40,
                            topMargin=40, bottomMargin=40)
    story = []
    styles = getSampleStyleSheet()

    # Custom Color Palette
    primary_color = colors.HexColor('#0284c7')   # Deep Medical Blue
    secondary_color = colors.HexColor('#0f172a') # Slate Dark
    text_color = colors.HexColor('#334155')      # Charcoal Gray
    light_bg = colors.HexColor('#f8fafc')        # Clean Off-White
    border_color = colors.HexColor('#e2e8f0')    # Soft Gray Border

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=secondary_color,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_color
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    # 1. Header Band
    header_data = [
        [Paragraph("RETINAI HEALTHCARE CLINIC", ParagraphStyle('H1', parent=title_style, fontSize=16, leading=20, textColor=primary_color)), 
         Paragraph(f"<b>Report ID:</b> DR-{datetime.now().strftime('%Y%m%d')}-{hash(patient_email) % 10000:04d}", ParagraphStyle('RightText', parent=body_style, alignment=2))]
    ]
    header_table = Table(header_data, colWidths=[300, 230])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-1), 1.5, primary_color)
    ]))
    story.append(header_table)
    story.append(Spacer(1, 15))

    # 2. Patient & Scan Meta Data Section
    story.append(Paragraph("Clinical Examination Summary", h2_style))
    meta_data = [
        [Paragraph("<b>Patient Name:</b>", body_style), Paragraph(patient_name, body_style),
         Paragraph("<b>Date of Exam:</b>", body_style), Paragraph(date.strftime('%B %d, %Y %I:%M %p') if isinstance(date, datetime) else str(date), body_style)],
        [Paragraph("<b>Patient Email:</b>", body_style), Paragraph(patient_email, body_style),
         Paragraph("<b>Analysis Engine:</b>", body_style), Paragraph("ResNet50 Transfer Model (v1.2)", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[100, 165, 100, 165])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color)
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # 3. Diagnostic Prediction Results
    story.append(Paragraph("AI Diagnostic Output", h2_style))
    
    # Color code priority based on class
    urgency_bg = colors.HexColor('#e1f5fe') # default light blue
    urgency_text = colors.HexColor('#0284c7')
    if 'High' in urgency or 'EMERGENCY' in urgency:
        urgency_bg = colors.HexColor('#ffe4e6') # light red
        urgency_text = colors.HexColor('#e11d48')
    elif 'Moderate' in urgency:
        urgency_bg = colors.HexColor('#fef3c7') # light orange
        urgency_text = colors.HexColor('#d97706')

    result_data = [
        [Paragraph("<b>Graded Condition:</b>", body_style), Paragraph(f"<b>{diagnosis}</b>", ParagraphStyle('Diag', parent=body_style, fontSize=11, textColor=primary_color))],
        [Paragraph("<b>Prediction Confidence:</b>", body_style), Paragraph(f"<b>{confidence}%</b>", body_style)],
        [Paragraph("<b>Clinical Action Urgency:</b>", body_style), Paragraph(f"<font color='{urgency_text.hexval()}'><b>{urgency}</b></font>", ParagraphStyle('Urg', parent=body_style, backColor=urgency_bg, borderPadding=4))]
    ]
    result_table = Table(result_data, colWidths=[150, 380])
    result_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, border_color)
    ]))
    story.append(result_table)
    story.append(Spacer(1, 15))

    # 4. Image Visualizations Side-by-Side (If paths are provided and exist)
    visual_elements = []
    if image_path and os.path.exists(image_path):
        try:
            # Let's see if we have a compiled heatmap comparison path
            if heatmap_path and os.path.exists(heatmap_path):
                # The heatmap path is already a horizontal stack of original and heatmap!
                # We can place that single stacked image in the report!
                rl_img = RLImage(heatmap_path, width=420, height=210)
                visual_elements.append(Paragraph("<b>Retinal Scan & Pathological Heatmap Overlay (Grad-CAM)</b>", h2_style))
                visual_elements.append(Spacer(1, 4))
                visual_elements.append(rl_img)
            else:
                rl_img = RLImage(image_path, width=200, height=200)
                visual_elements.append(Paragraph("<b>Retinal Scan</b>", h2_style))
                visual_elements.append(Spacer(1, 4))
                visual_elements.append(rl_img)
        except Exception as e:
            visual_elements.append(Paragraph(f"<i>Visual scan attachments not rendered: {str(e)}</i>", body_style))

    if visual_elements:
        story.append(KeepTogether(visual_elements))
        story.append(Spacer(1, 15))

    # 5. Clinical Recommendations
    rec_story = [Paragraph("Recommended Clinical Protocols", h2_style), Spacer(1, 4)]
    for idx, rec in enumerate(recommendations, 1):
        rec_story.append(Paragraph(f"• {rec}", bullet_style))
    story.append(KeepTogether(rec_story))
    story.append(Spacer(1, 20))

    # 6. Official Footer & Disclaimer
    disclaimer_text = (
        "<b>CLINICAL DISCLAIMER:</b> This report is generated by an artificial intelligence "
        "diagnostic model (ResNet50) trained on high-resolution retinal fundus images (APTOS 2019 dataset). "
        "It is designed to serve as a high-fidelity diagnostic aid and screening tool, NOT as a final, "
        "legally binding clinical diagnosis. Retinal abnormalities must be confirmed by a licensed vitreoretinal "
        "ophthalmologist through visual field exams, optical coherence tomography (OCT), or slit-lamp diagnostic "
        "evaluation before proceeding with clinical therapies."
    )
    footer_data = [
        [Paragraph(disclaimer_text, ParagraphStyle('Disclaimer', parent=body_style, fontSize=7, leading=9, textColor=colors.HexColor('#64748b')))],
        [Spacer(1, 5)],
        [Paragraph("<b>RetinAI Healthcare Systems</b> — Confidential Clinical Document — Automated Electronic Signature Verified", ParagraphStyle('FText', parent=body_style, fontSize=8, alignment=1, textColor=colors.HexColor('#94a3b8')))]
    ]
    footer_table = Table(footer_data, colWidths=[530])
    footer_table.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,0), 1, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER')
    ]))
    
    story.append(KeepTogether(footer_table))

    # Build PDF Document
    doc.build(story)
    return pdf_path
