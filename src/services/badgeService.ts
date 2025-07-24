import jsPDF from 'jspdf';
import { InstructorType } from '../types/instructor';
import badgeRecto from '../badge_recto.svg';

function svgUrlToPngDataUrl(svgUrl: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(svgUrl)
      .then(res => res.text())
      .then(svgText => {
        const img = new window.Image();
        const svg = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svg);
        img.onload = function () {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });
  });
}

export class BadgeService {
  static async generateBadgePDF(instructor: InstructorType): Promise<jsPDF> {
    const badgeWidth = 37.5;
    const badgeHeight = 63.8;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [badgeWidth, badgeHeight] });
    // Convertir le SVG en PNG base64 (haute résolution)
    const pngDataUrl = await svgUrlToPngDataUrl(badgeRecto, badgeWidth * 8, badgeHeight * 8);
    pdf.addImage(pngDataUrl, 'PNG', 0, 0, badgeWidth, badgeHeight);
    // Ajout du nom dynamique (centré, position d'origine du SVG)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 69, 127);
    const name = `${instructor.firstName} ${instructor.lastName}`;
    // Position d'origine du texte nom dans le SVG : x=23.252, y=182.4746 (SVG units)
    // Conversion px -> mm : 1 px ≈ 0.264583 mm
    const x = 23.252 * 0.264583 + 10; // ajustement pour centrage sur le badge
    const y = 182.4746 * 0.264583;
    pdf.text(name, badgeWidth / 2, y, { align: 'center' });
    return pdf;
  }

  static async downloadBadgePDF(instructor: InstructorType): Promise<void> {
    try {
      const pdf = await this.generateBadgePDF(instructor);
      const filename = `badge_${instructor.lastName}_${instructor.firstName}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  }
} 