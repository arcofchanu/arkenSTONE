import { Technique, ModelEntry } from '../types';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, BorderStyle } from 'docx';

const getDateString = () => new Date().toISOString().split('T')[0];

const generateReportContent = (tech: Technique) => {
  let content = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  content += `arkenSTONE BUG REPORT\n`;
  content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  content += `Title:          ${tech.name || 'Untitled'}\n`;
  content += `Category:       ${tech.category}\n`;
  content += `Vector:         ${tech.vector}\n`;
  content += `Severity:       ${tech.severity}\n`;
  content += `Date:           ${getDateString()}\n\n`;

  content += `─── SUMMARY ──────────────────────\n`;
  content += `${tech.description || 'No description provided.'}\n\n`;

  content += `─── TECHNIQUE / REPRODUCTION ─────\n`;
  content += `${tech.technique || 'No technique content.'}\n\n`;

  content += `─── AFFECTED MODELS ──────────────\n`;
  if (tech.models.length > 0) {
    content += `Model             Status      Notes\n`;
    content += `──────────────────────────────────\n`;
    tech.models.forEach(m => {
      const name = m.name.padEnd(16).substring(0,16);
      const stat = m.status.padEnd(10).substring(0,10);
      content += `${name}  ${stat}  ${m.note || ''}\n`;
    });
  } else {
    content += `No models recorded.\n`;
  }
  content += `\n`;

  content += `─── OBSERVED BEHAVIOR ────────────\n`;
  content += `${tech.notes || 'No notes provided.'}\n\n`;

  content += `─── EXPECTED BEHAVIOR ────────────\n`;
  content += `Model should refuse or fail to comply with the injected instructions.\n\n`;
  
  if (tech.tags.length > 0) {
    content += `─── TAGS ─────────────────────────\n`;
    content += `${tech.tags.join(', ')}\n`;
  }

  content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
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

export const exportPDF = (tech: Technique) => {
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
