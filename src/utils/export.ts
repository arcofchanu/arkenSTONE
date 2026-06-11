import { Technique, ModelEntry } from '../types';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, BorderStyle } from 'docx';

const getDateString = () => new Date().toISOString().split('T')[0];

// Helper function to get image dimensions and calculate proper sizing
const getImageDimensions = (imgData: string): Promise<{ width: number; height: number; format: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Determine format
      let format = 'PNG';
      if (imgData.startsWith('data:image/jpeg')) {
        format = 'JPEG';
      } else if (imgData.startsWith('data:image/png')) {
        format = 'PNG';
      } else if (imgData.startsWith('data:image/webp')) {
        format = 'WEBP';
      }
      
      resolve({
        width: img.width,
        height: img.height,
        format
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imgData;
  });
};

// Helper function to calculate dimensions maintaining aspect ratio
const calculateScaledDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 170,
  maxHeight: number = 150
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxWidth;
  let height = width / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width, height };
};

const generateReportContent = (tech: Technique) => {
  let content = `===================================\n`;
  content += `arkenSTONE BUG REPORT\n`;
  content += `===================================\n`;
  content += `Title:          ${tech.name || 'Untitled'}\n`;
  content += `Category:       ${tech.category}\n`;
  content += `Vector:         ${tech.vector}\n`;
  content += `Severity:       ${tech.severity}\n`;
  content += `Date:           ${getDateString()}\n\n`;

  content += `--- SUMMARY -------------------\n`;
  content += `${tech.description || 'No description provided.'}\n\n`;

  content += `--- TECHNIQUE / REPRODUCTION --\n`;
  content += `${tech.technique || 'No technique content.'}\n\n`;

  content += `--- AFFECTED MODELS -----------\n`;
  if (tech.models.length > 0) {
    content += `Model             Status      Notes\n`;
    content += `----------------------------------\n`;
    tech.models.forEach(m => {
      const name = m.name.padEnd(16).substring(0,16);
      const stat = m.status.padEnd(10).substring(0,10);
      content += `${name}  ${stat}  ${m.note || ''}\n`;
    });
  } else {
    content += `No models recorded.\n`;
  }
  content += `\n`;

  content += `--- OBSERVED BEHAVIOR ---------\n`;
  content += `${tech.notes || 'No notes provided.'}\n\n`;

  content += `--- EXPECTED BEHAVIOR ---------\n`;
  content += `Model should refuse or fail to comply with the injected instructions.\n\n`;
  
  if (tech.tags.length > 0) {
    content += `--- TAGS ----------------------\n`;
    content += `${tech.tags.join(', ')}\n`;
  }

  content += `===================================`;
  return content;
};

export const exportMarkdown = (tech: Technique) => {
  const content = generateReportContent(tech);
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${tech.name?.replace(/\s+/g, '-').toLowerCase() || 'untitled'}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (tech: Technique) => {
  const content = generateReportContent(tech);
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Failed to copy', err);
    return false;
  }
};

export const exportPDF = async (tech: Technique) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  doc.setFont('courier');
  doc.setFontSize(10);
  
  const content = generateReportContent(tech);
  const lines = doc.splitTextToSize(content, 180);
  
  let y = 15;
  lines.forEach((line: string) => {
    if (y > 280) {
      doc.addPage();
      y = 15;
    }
    doc.text(line, 15, y);
    y += 5;
  });
  
  // Add images if they exist
  if (tech.photos && tech.photos.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.text('ATTACHED IMAGES', 15, 15);
    doc.setFontSize(10);
    
    let imgY = 25;
    for (const photo of tech.photos) {
      try {
        // Determine image format from data URL
        let imageFormat = 'PNG';
        if (photo.startsWith('data:image/jpeg')) {
          imageFormat = 'JPEG';
        } else if (photo.startsWith('data:image/png')) {
          imageFormat = 'PNG';
        } else if (photo.startsWith('data:image/webp')) {
          imageFormat = 'WEBP';
        }
        
        try {
          const dimensions = await getImageDimensions(photo);
          const scaled = calculateScaledDimensions(dimensions.width, dimensions.height, 170, 150);
          
          if (imgY + scaled.height > 270) {
            doc.addPage();
            imgY = 15;
          }
          
          doc.addImage(photo, imageFormat, 15, imgY, scaled.width, scaled.height);
          imgY += scaled.height + 10;
        } catch (addErr) {
          console.error('Failed to add image:', addErr);
          doc.setFontSize(8);
          doc.text('[Image could not be embedded]', 15, imgY);
          imgY += 10;
          doc.setFontSize(10);
        }
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
  }
  
  doc.save(`report-${tech.name?.replace(/\s+/g, '-').toLowerCase() || 'untitled'}.pdf`);
};

export const exportPDFWithImages = async (tech: Technique) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  doc.setFont('courier');
  doc.setFontSize(10);
  
  const content = generateReportContent(tech);
  const lines = doc.splitTextToSize(content, 180);
  
  let y = 15;
  lines.forEach((line: string) => {
    if (y > 280) {
      doc.addPage();
      y = 15;
    }
    doc.text(line, 15, y);
    y += 5;
  });
  
  // Add images if they exist
  if (tech.photos && tech.photos.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.text('ATTACHED IMAGES', 15, 15);
    doc.setFontSize(10);
    
    let imgY = 25;
    for (const photo of tech.photos) {
      try {
        // Determine image format from data URL
        let imageFormat = 'PNG';
        if (photo.startsWith('data:image/jpeg')) {
          imageFormat = 'JPEG';
        } else if (photo.startsWith('data:image/png')) {
          imageFormat = 'PNG';
        } else if (photo.startsWith('data:image/webp')) {
          imageFormat = 'WEBP';
        }
        
        const imgWidth = 170;
        const imgHeight = 120;
        
        if (imgY + imgHeight > 270) {
          doc.addPage();
          imgY = 15;
        }
        
        try {
          doc.addImage(photo, imageFormat, 15, imgY, imgWidth, imgHeight);
          imgY += imgHeight + 10;
        } catch (addErr) {
          console.error('Failed to add image:', addErr);
          doc.setFontSize(8);
          doc.text('[Image could not be embedded]', 15, imgY);
          imgY += 10;
          doc.setFontSize(10);
        }
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
  }
  
  doc.save(`report-${tech.name?.replace(/\s+/g, '-').toLowerCase() || 'untitled'}.pdf`);
};

export const exportDocx = async (tech: Technique) => {
  const createBorders = () => ({
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  });

  const modelRows = tech.models.length > 0 ? [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: "Model", border: { bottom: { color: "00", space: 1, value: "single", size: 6 } } })], borders: createBorders() }),
        new TableCell({ children: [new Paragraph({ text: "Status" })], borders: createBorders() }),
        new TableCell({ children: [new Paragraph({ text: "Notes" })], borders: createBorders() }),
      ],
    }),
    ...tech.models.map(m => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: m.name })], borders: createBorders() }),
        new TableCell({ children: [new Paragraph({ text: m.status })], borders: createBorders() }),
        new TableCell({ children: [new Paragraph({ text: m.note || '' })], borders: createBorders() }),
      ]
    }))
  ] : [
    new TableRow({
      children: [new TableCell({ children: [new Paragraph({ text: "No models recorded." })], borders: createBorders() })]
    })
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "arkenSTONE BUG REPORT", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ children: [new TextRun({ text: `Title: `, bold: true }), new TextRun({ text: tech.name || 'Untitled' })] }),
          new Paragraph({ children: [new TextRun({ text: `Category: `, bold: true }), new TextRun({ text: tech.category })] }),
          new Paragraph({ children: [new TextRun({ text: `Vector: `, bold: true }), new TextRun({ text: tech.vector })] }),
          new Paragraph({ children: [new TextRun({ text: `Severity: `, bold: true }), new TextRun({ text: tech.severity })] }),
          new Paragraph({ children: [new TextRun({ text: `Date: `, bold: true }), new TextRun({ text: getDateString() })] }),
          new Paragraph({ text: "" }),
          
          new Paragraph({ text: "SUMMARY", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: tech.description || "No description provided." }),
          new Paragraph({ text: "" }),
          
          new Paragraph({ text: "TECHNIQUE / REPRODUCTION", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ 
            children: [new TextRun({ text: tech.technique || "No technique content.", font: "Courier New" })] 
          }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "AFFECTED MODELS", heading: HeadingLevel.HEADING_2 }),
          new Table({
            rows: modelRows,
            width: { size: 100, type: "pct" }
          }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "OBSERVED BEHAVIOR", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: tech.notes || "No notes provided." }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "EXPECTED BEHAVIOR", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "Model should refuse or fail to comply with the injected instructions." }),
          new Paragraph({ text: "" }),

          ...(tech.tags.length > 0 ? [
            new Paragraph({ text: "TAGS", heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ text: tech.tags.join(', ') })
          ] : [])
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${tech.name?.replace(/\s+/g, '-').toLowerCase() || 'untitled'}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};

export const getReportString = generateReportContent;
