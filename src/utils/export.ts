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
        new TableCell({ children: [new Paragraph({ text: "Model", border: { bottom: { color: "00", space: 1, size: 6, style: BorderStyle.SINGLE } } })], borders: createBorders() }),
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

// ─── YAML export / import (zero external dependencies) ───────────────────────

const yamlEscape = (s: string): string => {
  if (s.includes('\n')) return ''; // handled via block-literal; caller must branch
  if (/[:#\[\]{},|>&!%@`'"]/.test(s) || s.trim() !== s || s === '' || /^(true|false|null|~|\d)/.test(s)) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
};

const yamlStr = (key: string, value: string, indent: string): string => {
  if (value.includes('\n')) {
    const lines = value.split('\n');
    return `${indent}${key}: |\n${lines.map(l => `${indent}  ${l}`).join('\n')}\n`;
  }
  return `${indent}${key}: ${yamlEscape(value)}\n`;
};

const techniqueToYaml = (t: Technique, index: number): string => {
  let out = index === 0 ? '' : '\n';
  out += `- id: ${t.id}\n`;
  out += yamlStr('name', t.name, '  ');
  out += `  category: ${yamlEscape(t.category)}\n`;
  out += `  vector: ${yamlEscape(t.vector)}\n`;
  out += `  severity: ${t.severity}\n`;
  out += yamlStr('description', t.description, '  ');
  out += yamlStr('technique', t.technique, '  ');
  out += yamlStr('notes', t.notes, '  ');
  out += `  tags:\n`;
  if (t.tags.length === 0) { out += `    []\n`; }
  else { t.tags.forEach(tag => { out += `    - ${yamlEscape(tag)}\n`; }); }
  out += `  createdAt: ${t.createdAt}\n`;
  out += `  updatedAt: ${t.updatedAt}\n`;
  out += `  models:\n`;
  if (t.models.length === 0) { out += `    []\n`; }
  else {
    t.models.forEach(m => {
      out += `    - id: ${m.id}\n`;
      out += `      name: ${yamlEscape(m.name)}\n`;
      out += `      status: ${yamlEscape(m.status)}\n`;
      if (m.note) out += yamlStr('note', m.note, '      ');
    });
  }
  if (t.bounty) {
    out += `  bounty:\n`;
    out += `    status: ${yamlEscape(t.bounty.status)}\n`;
    out += `    amount: ${t.bounty.amount}\n`;
    out += `    program: ${yamlEscape(t.bounty.program)}\n`;
  }
  // Photos are intentionally excluded from YAML export (base64 data URLs are too large)
  return out;
};

export const exportCardsYaml = (techniques: Technique[]): void => {
  const header =
    `# arkenSTONE Card Export\n` +
    `# Generated: ${new Date().toISOString()}\n` +
    `# Total: ${techniques.length} card(s)\n\n`;
  const body = techniques.map((t, i) => techniqueToYaml(t, i)).join('');
  const blob = new Blob([header + body], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arkenstone-backup-${new Date().toISOString().split('T')[0]}.yaml`;
  a.click();
  URL.revokeObjectURL(url);
};

export const parseCardsYaml = (yaml: string): { cards: Technique[]; errors: string[] } => {
  const errors: string[] = [];
  const cards: Technique[] = [];
  const lines = yaml.split('\n').filter(l => !l.trimStart().startsWith('#'));
  let i = 0;

  const unquote = (s: string): string => {
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
      return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    return s;
  };

  const blockLiteral = (baseIndent: number): string => {
    const acc: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === '') { acc.push(''); i++; continue; }
      if (l.search(/\S/) <= baseIndent) break;
      acc.push(l.slice(baseIndent + 2));
      i++;
    }
    while (acc.length && acc[acc.length - 1] === '') acc.pop();
    return acc.join('\n');
  };

  const strVal = (raw: string, cardIndent: number): string => {
    if (raw.trim() === '|') return blockLiteral(cardIndent + 2);
    return unquote(raw.trim());
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    if (!/^- /.test(line)) { i++; continue; }

    const card: Partial<Technique> & { models: ModelEntry[]; tags: string[]; photos: string[] } =
      { models: [], tags: [], photos: [] };

    const idM = line.match(/^- id:\s*(.+)/);
    if (idM) card.id = idM[1].trim();
    i++;

    while (i < lines.length) {
      const fl = lines[i];
      if (fl.trim() === '') { i++; continue; }
      if (fl.search(/\S/) === 0) break; // back to top level
      const fm = fl.match(/^  ([a-zA-Z]+):\s*(.*)/);
      if (!fm) { i++; continue; }
      const [, key, raw] = fm;
      i++;

      switch (key) {
        case 'name':        card.name = strVal(raw, 2); break;
        case 'category':    card.category = unquote(raw) as Technique['category']; break;
        case 'vector':      card.vector = unquote(raw) as Technique['vector']; break;
        case 'severity':    card.severity = raw.trim() as Technique['severity']; break;
        case 'description': card.description = strVal(raw, 2); break;
        case 'technique':   card.technique = strVal(raw, 2); break;
        case 'notes':       card.notes = strVal(raw, 2); break;
        case 'createdAt':   card.createdAt = raw.trim(); break;
        case 'updatedAt':   card.updatedAt = raw.trim(); break;
        case 'tags': {
          if (raw.trim() === '[]') break;
          while (i < lines.length && /^    - /.test(lines[i])) {
            card.tags.push(unquote(lines[i].replace(/^    - /, '').trim())); i++;
          }
          break;
        }
        case 'models': {
          if (raw.trim() === '[]') break;
          while (i < lines.length && /^    - /.test(lines[i])) {
            const m: Partial<ModelEntry> = {};
            const mId = lines[i].match(/^    - id:\s*(.+)/);
            if (mId) m.id = mId[1].trim();
            i++;
            while (i < lines.length && /^      [a-zA-Z]/.test(lines[i])) {
              const mf = lines[i].match(/^      ([a-zA-Z]+):\s*(.*)/);
              if (mf) {
                const [, mk, mv] = mf;
                if (mk === 'name') m.name = unquote(mv);
                else if (mk === 'status') m.status = unquote(mv) as ModelEntry['status'];
                else if (mk === 'note') {
                  if (mv.trim() === '|') { i++; m.note = blockLiteral(6); continue; }
                  m.note = unquote(mv);
                }
              }
              i++;
            }
            if (m.id && m.name && m.status) card.models.push(m as ModelEntry);
          }
          break;
        }
        case 'bounty': {
          const b: { status?: string; amount?: number; program?: string } = {};
          while (i < lines.length && /^    [a-zA-Z]/.test(lines[i])) {
            const bf = lines[i].match(/^    ([a-zA-Z]+):\s*(.*)/);
            if (bf) {
              if (bf[1] === 'status') b.status = unquote(bf[2]);
              else if (bf[1] === 'amount') b.amount = parseFloat(bf[2]) || 0;
              else if (bf[1] === 'program') b.program = unquote(bf[2]);
            }
            i++;
          }
          card.bounty = {
            status: (b.status || 'Not Submitted') as Technique['bounty']['status'],
            amount: b.amount || 0,
            program: b.program || ''
          };
          break;
        }
        case 'photos': {
          while (i < lines.length && /^    - \|/.test(lines[i])) {
            i++;
            const chunks: string[] = [];
            while (i < lines.length && /^      /.test(lines[i])) { chunks.push(lines[i].slice(6)); i++; }
            card.photos.push(chunks.join(''));
          }
          break;
        }
      }
    }

    if (!card.id) { errors.push(`Skipped a card: missing 'id'`); continue; }
    cards.push({
      id: card.id,
      name: card.name || 'Untitled',
      category: card.category || 'Other',
      vector: card.vector || 'Custom',
      severity: card.severity || 'Medium',
      description: card.description || '',
      technique: card.technique || '',
      notes: card.notes || '',
      tags: card.tags,
      models: card.models,
      photos: card.photos.length > 0 ? card.photos : undefined,
      bounty: card.bounty,
      createdAt: card.createdAt || new Date().toISOString(),
      updatedAt: card.updatedAt || new Date().toISOString(),
    });
  }
  return { cards, errors };
};
