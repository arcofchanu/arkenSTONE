# arkenSTONE

**Red Team Vault & Bug Tracking Dashboard** - A comprehensive system for documenting, tracking, and managing AI model security vulnerabilities and attack techniques.

## Core Functionality

### 1. **Technique Vault**
- Store and manage security techniques and attack vectors
- Each technique records:
  - **Category**: Classification (Jailbreak, Prompt Leaking, Role Injection, etc.)
  - **Attack Vector**: Specific method (Instruction Override, Role Confusion, Authority Spoofing, etc.)
  - **Severity Level**: Critical, High, Medium, Low, Informational
  - **Description**: Summary of the attack
  - **Technique/Reproduction**: Step-by-step instructions
  - **Notes**: Observations and behavior
  - **Tags**: Custom labels for organization
  - **Timestamps**: Created and updated dates

### 2. **Model Testing & Tracking**
- Test techniques against multiple AI models (GPT-4o, Claude 3.5, Gemini 1.5, Llama 3, etc.)
- Record test status for each model:
  - **Confirmed**: Vulnerability verified
  - **Partial**: Partial vulnerability
  - **Patched**: Issue fixed
  - **Untested**: Awaiting testing
- Add model-specific notes

### 3. **Bounty Tracking**
- Track bug bounty program submissions
- Status management: Not Submitted → Pending → Awarded/Rejected
- Record bounty amount and program details
- View all bounty-related techniques in one place

### 4. **Dashboard & Analytics**
- Visual overview of all techniques
- Statistics and metrics
- Quick filtering and navigation

### 5. **Report Generation**
- Export technique details as:
  - **Markdown** (.md) - Plain text format
  - **PDF** (.pdf) - Formatted document
  - **Word** (.docx) - Microsoft Word format
- Copy report to clipboard

### 6. **Security Features**
- **Lock Screen**: PIN-based access control
- **Theme Support**: Dark/Light mode
- **LocalStorage Persistence**: All data saved locally

## Data Model

### Technique
```
{
  id: string (UUID)
  name: string
  category: Category
  vector: AttackVector
  description: string
  technique: string
  notes: string
  severity: Severity
  tags: string[]
  models: ModelEntry[]
  bounty: BountyInfo
  createdAt: ISO string
  updatedAt: ISO string
}
```

### ModelEntry
```
{
  id: string
  name: string
  status: ModelStatus (Confirmed|Partial|Patched|Untested)
  note?: string
}
```

## Core Functions

### Storage (`src/utils/storage.ts`)
- **getTechniques()**: Load all techniques from localStorage
- **saveTechniques()**: Save techniques to localStorage
- **getGlobalModels()**: Retrieve available AI models (with defaults)
- **saveGlobalModels()**: Save custom models list

### Export (`src/utils/export.ts`)
- **generateReportContent()**: Format technique as text report
- **exportMarkdown()**: Export as .md file
- **exportPDF()**: Export as .pdf file
- **exportDocx()**: Export as .docx file
- **copyToClipboard()**: Copy report text to clipboard

### App States & Views
- **Vault View**: Grid of all techniques with search/filter
- **Dashboard View**: Analytics and overview
- **Models View**: Manage global AI model list
- **Bounties View**: Track bug bounty submissions
- **Technique Editor**: Create/edit techniques
- **Report Generator**: Generate downloadable reports

## Keyboard Shortcuts
- **Ctrl/Cmd + N**: Create new technique
- **Escape**: Close current editor/modal
- **Theme Toggle**: Switch between dark/light mode

## Technology Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **UI Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Export**: jsPDF, docx, uuid
- **Build**: Vite
- **Storage**: Browser LocalStorage
