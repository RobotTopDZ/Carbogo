"""
CarbonScore PDF Service
Professional PDF report generation with charts and branding
"""

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
import io
import base64
from datetime import datetime
from pathlib import Path
import json
import logging

# ReportLab imports
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import Color, HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.platypus.frames import Frame
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

# Chart generation
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import seaborn as sns
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CarbonScore PDF Service",
    description="Professional PDF report generation for carbon footprint analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CompanyInfo(BaseModel):
    name: str
    sector: str
    employees: str
    revenue: Optional[float] = None
    location: str

class EmissionData(BaseModel):
    total_co2e: float
    scope_1: float
    scope_2: float
    scope_3: float
    breakdown: Dict[str, float]
    intensity_per_employee: float
    carbon_efficiency_score: float
    sustainability_grade: str

class ReportRequest(BaseModel):
    company_info: CompanyInfo
    emission_data: EmissionData
    recommendations: List[str]
    benchmark_position: str
    equivalent_metrics: Optional[Dict[str, float]] = None
    reduction_potential: Optional[Dict[str, float]] = None
    template: str = "standard"
    branding: Optional[Dict[str, str]] = None

class ChartRequest(BaseModel):
    chart_type: str
    data: Dict[str, Any]
    title: str
    width: int = 800
    height: int = 600

class PDFService:
    """Main PDF generation service"""
    
    def __init__(self):
        self.reports_dir = Path("/data/artifacts/reports")
        self.charts_dir = Path("/data/artifacts/charts")
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.charts_dir.mkdir(parents=True, exist_ok=True)
        
        # Set up matplotlib style
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
    
    def generate_chart(self, chart_request: ChartRequest) -> str:
        """Generate chart and return base64 encoded image"""
        try:
            fig, ax = plt.subplots(figsize=(chart_request.width/100, chart_request.height/100))
            
            if chart_request.chart_type == "scope_breakdown":
                # Pie chart for scope breakdown
                data = chart_request.data
                labels = ['Scope 1', 'Scope 2', 'Scope 3']
                sizes = [data['scope_1'], data['scope_2'], data['scope_3']]
                colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']
                
                wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
                ax.set_title(chart_request.title, fontsize=16, fontweight='bold', pad=20)
                
            elif chart_request.chart_type == "category_breakdown":
                # Horizontal bar chart for category breakdown
                data = chart_request.data
                categories = list(data.keys())
                values = list(data.values())
                
                # Sort by value
                sorted_data = sorted(zip(categories, values), key=lambda x: x[1], reverse=True)
                categories, values = zip(*sorted_data)
                
                bars = ax.barh(categories, values, color='#45B7D1')
                ax.set_xlabel('Émissions (kgCO₂e)', fontsize=12)
                ax.set_title(chart_request.title, fontsize=16, fontweight='bold', pad=20)
                
                # Add value labels on bars
                for i, (bar, value) in enumerate(zip(bars, values)):
                    ax.text(bar.get_width() + max(values) * 0.01, bar.get_y() + bar.get_height()/2, 
                           f'{value:,.0f}', ha='left', va='center', fontsize=10)
                
            elif chart_request.chart_type == "benchmark_comparison":
                # Bar chart comparing company vs sector average
                data = chart_request.data
                categories = ['Votre entreprise', 'Moyenne sectorielle', 'Top 25%']
                values = [data['company'], data['sector_avg'], data['top_25']]
                colors = ['#FF6B6B', '#FFA07A', '#90EE90']
                
                bars = ax.bar(categories, values, color=colors)
                ax.set_ylabel('Émissions par employé (kgCO₂e)', fontsize=12)
                ax.set_title(chart_request.title, fontsize=16, fontweight='bold', pad=20)
                
                # Add value labels on bars
                for bar, value in zip(bars, values):
                    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(values) * 0.01,
                           f'{value:,.1f}', ha='center', va='bottom', fontsize=11, fontweight='bold')
                
            elif chart_request.chart_type == "reduction_potential":
                # Stacked bar chart showing current vs potential
                data = chart_request.data
                categories = list(data['current'].keys())
                current = list(data['current'].values())
                potential = [data['potential'].get(cat, 0) for cat in categories]
                
                x = np.arange(len(categories))
                width = 0.35
                
                bars1 = ax.bar(x - width/2, current, width, label='Actuel', color='#FF6B6B')
                bars2 = ax.bar(x + width/2, [c - p for c, p in zip(current, potential)], width, 
                              label='Après réduction', color='#90EE90')
                
                ax.set_ylabel('Émissions (kgCO₂e)', fontsize=12)
                ax.set_title(chart_request.title, fontsize=16, fontweight='bold', pad=20)
                ax.set_xticks(x)
                ax.set_xticklabels(categories, rotation=45, ha='right')
                ax.legend()
                
            plt.tight_layout()
            
            # Save to bytes
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
            img_buffer.seek(0)
            
            # Encode to base64
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
            
            plt.close(fig)
            
            return img_base64
            
        except Exception as e:
            logger.error(f"Chart generation error: {e}")
            raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")
    
    def generate_pdf_report(self, report_request: ReportRequest) -> bytes:
        """Generate comprehensive PDF report"""
        try:
            # Create PDF buffer
            buffer = io.BytesIO()
            
            # Create document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=2*cm,
                leftMargin=2*cm,
                topMargin=2*cm,
                bottomMargin=2*cm
            )
            
            # Get styles
            styles = getSampleStyleSheet()
            
            # Custom styles
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=HexColor('#2E86AB'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=16,
                textColor=HexColor('#2E86AB'),
                spaceAfter=12,
                spaceBefore=20
            )
            
            body_style = ParagraphStyle(
                'CustomBody',
                parent=styles['Normal'],
                fontSize=11,
                spaceAfter=12,
                alignment=TA_JUSTIFY
            )
            
            # Build story (content)
            story = []
            
            # Title page
            story.append(Paragraph("Rapport d'Empreinte Carbone", title_style))
            story.append(Spacer(1, 20))
            
            # Company info
            company_info = f"""
            <b>Entreprise:</b> {report_request.company_info.name}<br/>
            <b>Secteur:</b> {report_request.company_info.sector}<br/>
            <b>Effectif:</b> {report_request.company_info.employees}<br/>
            <b>Localisation:</b> {report_request.company_info.location}<br/>
            <b>Date du rapport:</b> {datetime.now().strftime('%d/%m/%Y')}
            """
            story.append(Paragraph(company_info, body_style))
            story.append(Spacer(1, 30))
            
            # Executive Summary
            story.append(Paragraph("Résumé Exécutif", heading_style))
            
            summary_text = f"""
            L'empreinte carbone de {report_request.company_info.name} s'élève à 
            <b>{report_request.emission_data.total_co2e:,.0f} kgCO₂e</b> par an, 
            soit <b>{report_request.emission_data.intensity_per_employee:.1f} kgCO₂e par employé</b>.
            
            Votre entreprise obtient un score d'efficacité carbone de 
            <b>{report_request.emission_data.carbon_efficiency_score:.0f}/100</b> 
            et un grade de durabilité <b>{report_request.emission_data.sustainability_grade}</b>.
            
            Position sectorielle: {report_request.benchmark_position}
            """
            story.append(Paragraph(summary_text, body_style))
            story.append(Spacer(1, 20))
            
            # Scope breakdown chart
            scope_chart_data = {
                'scope_1': report_request.emission_data.scope_1,
                'scope_2': report_request.emission_data.scope_2,
                'scope_3': report_request.emission_data.scope_3
            }
            
            scope_chart_request = ChartRequest(
                chart_type="scope_breakdown",
                data=scope_chart_data,
                title="Répartition par Scope GES",
                width=600,
                height=400
            )
            
            scope_chart_b64 = self.generate_chart(scope_chart_request)
            scope_chart_data_uri = f"data:image/png;base64,{scope_chart_b64}"
            
            # Add chart to PDF (simplified - in production, save to file and use Image)
            story.append(Paragraph("Répartition des Émissions par Scope", heading_style))
            story.append(Spacer(1, 10))
            
            # Scope breakdown table
            scope_data = [
                ['Scope', 'Émissions (kgCO₂e)', 'Pourcentage'],
                ['Scope 1 - Émissions directes', f"{report_request.emission_data.scope_1:,.0f}", 
                 f"{(report_request.emission_data.scope_1/report_request.emission_data.total_co2e)*100:.1f}%"],
                ['Scope 2 - Énergie indirecte', f"{report_request.emission_data.scope_2:,.0f}", 
                 f"{(report_request.emission_data.scope_2/report_request.emission_data.total_co2e)*100:.1f}%"],
                ['Scope 3 - Autres indirectes', f"{report_request.emission_data.scope_3:,.0f}", 
                 f"{(report_request.emission_data.scope_3/report_request.emission_data.total_co2e)*100:.1f}%"],
                ['Total', f"{report_request.emission_data.total_co2e:,.0f}", "100.0%"]
            ]
            
            scope_table = Table(scope_data, colWidths=[6*cm, 4*cm, 3*cm])
            scope_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2E86AB')),
                ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -2), HexColor('#F5F5F5')),
                ('BACKGROUND', (0, -1), (-1, -1), HexColor('#E8F4F8')),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#CCCCCC'))
            ]))
            
            story.append(scope_table)
            story.append(Spacer(1, 20))
            
            # Category breakdown
            story.append(Paragraph("Analyse Détaillée par Catégorie", heading_style))
            
            breakdown_data = []
            for category, emissions in report_request.emission_data.breakdown.items():
                percentage = (emissions / report_request.emission_data.total_co2e) * 100
                category_labels = {
                    'electricite': 'Électricité',
                    'gaz': 'Gaz naturel',
                    'carburants': 'Carburants',
                    'vehicules': 'Véhicules',
                    'vols_domestiques': 'Vols domestiques',
                    'vols_internationaux': 'Vols internationaux',
                    'achats': 'Achats'
                }
                breakdown_data.append([
                    category_labels.get(category, category),
                    f"{emissions:,.0f}",
                    f"{percentage:.1f}%"
                ])
            
            # Sort by emissions
            breakdown_data.sort(key=lambda x: float(x[1].replace(',', '')), reverse=True)
            
            breakdown_table_data = [['Catégorie', 'Émissions (kgCO₂e)', 'Pourcentage']] + breakdown_data
            
            breakdown_table = Table(breakdown_table_data, colWidths=[6*cm, 4*cm, 3*cm])
            breakdown_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2E86AB')),
                ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F5F5F5')),
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#CCCCCC')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#FFFFFF'), HexColor('#F5F5F5')])
            ]))
            
            story.append(breakdown_table)
            story.append(PageBreak())
            
            # Recommendations
            story.append(Paragraph("Recommandations d'Actions", heading_style))
            
            for i, recommendation in enumerate(report_request.recommendations, 1):
                story.append(Paragraph(f"{i}. {recommendation}", body_style))
            
            story.append(Spacer(1, 20))
            
            # Equivalent metrics (if provided)
            if report_request.equivalent_metrics:
                story.append(Paragraph("Équivalences Concrètes", heading_style))
                
                equiv_text = f"""
                Vos émissions de {report_request.emission_data.total_co2e:,.0f} kgCO₂e correspondent à:
                
                • <b>{report_request.equivalent_metrics.get('trees_to_plant', 0):,.0f} arbres</b> à planter pour compenser
                • <b>{report_request.equivalent_metrics.get('cars_off_road', 0):.0f} voitures</b> retirées de la circulation pendant un an
                • La consommation énergétique de <b>{report_request.equivalent_metrics.get('homes_energy_year', 0):.0f} foyers</b> pendant un an
                • <b>{report_request.equivalent_metrics.get('flights_paris_ny', 0):.0f} vols</b> Paris-New York
                """
                story.append(Paragraph(equiv_text, body_style))
            
            story.append(Spacer(1, 30))
            
            # Footer
            footer_text = f"""
            <i>Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} par CarbonScore</i><br/>
            <i>Données basées sur la Base Carbone ADEME v17</i>
            """
            story.append(Paragraph(footer_text, styles['Normal']))
            
            # Build PDF
            doc.build(story)
            
            # Get PDF bytes
            buffer.seek(0)
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"PDF generation error: {e}")
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

# Initialize PDF service
pdf_service = PDFService()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CarbonScore PDF Service",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/pdf/generate")
async def generate_pdf(report_request: ReportRequest):
    """Generate PDF report"""
    try:
        logger.info(f"Generating PDF report for {report_request.company_info.name}")
        
        # Generate PDF
        pdf_bytes = pdf_service.generate_pdf_report(report_request)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"rapport_carbone_{report_request.company_info.name}_{timestamp}.pdf"
        
        # Save to file
        pdf_path = pdf_service.reports_dir / filename
        with open(pdf_path, 'wb') as f:
            f.write(pdf_bytes)
        
        logger.info(f"PDF report generated: {filename}")
        
        return {
            "status": "success",
            "filename": filename,
            "file_path": str(pdf_path),
            "size_bytes": len(pdf_bytes),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/pdf/{filename}")
async def download_pdf(filename: str):
    """Download PDF report"""
    try:
        pdf_path = pdf_service.reports_dir / filename
        
        if not pdf_path.exists():
            raise HTTPException(status_code=404, detail="PDF not found")
        
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"PDF download error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/charts")
async def generate_chart(chart_request: ChartRequest):
    """Generate chart image"""
    try:
        logger.info(f"Generating chart: {chart_request.chart_type}")
        
        # Generate chart
        chart_b64 = pdf_service.generate_chart(chart_request)
        
        return {
            "status": "success",
            "chart_base64": chart_b64,
            "chart_type": chart_request.chart_type,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Chart generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8020,
        reload=True,
        log_level="info"
    )
