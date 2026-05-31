<div align="center">

# 🛡️ arkenSTONE
### The Ultimate AI Security & Prompt Injection Vault

<p align="center">
  A privacy-first, offline-ready desktop application for cataloging, analyzing, and reporting Large Language Model (LLM) vulnerabilities.
</p>

<p align="center">
  <a href="#-the-arsenal-core-functionality">Features</a> •
  <a href="#-real-world-use-cases">Use Cases</a> •
  <a href="#-getting-started">Setup</a>
</p>

---

</div>

## 🧠 Why arkenSTONE?

As AI models evolve, so do the methods to break them. Keeping track of prompt injections, jailbreaks, and zero-day vulnerabilities in spreadsheets is chaotic. **arkenSTONE** brings order to the chaos. It provides a highly visual, secure, and structured environment to build your personal database of AI vulnerabilities.

Everything is stored locally on your machine. Your zero-days stay *yours*.

---

## ⚡ The Arsenal: Core Functionality

arkenSTONE isn't just a database; it's a complete workflow engine for AI security research.

| Feature | What it does | Why it matters |
| :--- | :--- | :--- |
| **🔐 Secure Local Vault** | Encrypts your workspace with a PIN lock. | Keeps sensitive exploit payloads away from prying eyes. |
| **📝 Technique Catalog** | Logs specific payloads with metadata (Severity, Vector, Category). | Easily search and filter your arsenal during a red team engagement. |
| **🤖 Model Matrix** | Maps the status of your payloads against specific LLMs (e.g., GPT-4, Claude). | Instantly know which models are vulnerable to which specific attacks. |
| **📊 Grafana-Style Dashboard** | Generates real-time heatmaps, treemaps, and trend charts of your data. | Identify patterns—like seeing that "Role Confusion" is highly effective against a specific model. |
| **💰 Bounty Tracker** | Links successful exploits to bug bounty submissions. | Calculate your total earnings and track pending rewards directly in-app. |
| **📄 1-Click Reports** | Compiles your findings into clean, professional vulnerability reports. | Simplifies the submission process for AI vendors and bug bounty programs. |

---

## 🎯 Real-World Use Cases

How are professionals using arkenSTONE?

> **🛑 AI Red Teamers**
> *"I'm hired to stress-test a new corporate chatbot."*
> **Use Case:** You open arkenSTONE, filter your vault for `Severity: Critical` and `Category: System Prompt Override`, and instantly have a curated list of payloads to test against the client's infrastructure.

> **🐛 Bug Bounty Hunters**
> *"I found a new token smuggling bypass for a major AI platform."*
> **Use Case:** You document the exact payload, mark the target model as `Confirmed` vulnerable, set the bounty status to `Pending`, and use the Report Generator to export a beautifully formatted proof-of-concept to submit to HackerOne.

> **🛡️ AI Defensive Engineers**
> *"I need to track regression testing for our internal models."*
> **Use Case:** You track known vulnerabilities. Whenever your team deploys a new guardrail, you run the payloads from your vault and update the model status from `Confirmed` to `Patched`.

---

## 🚀 A Day in the Life (Your Workflow)

1. **Discover:** You find a new way to trick an LLM using a nested instruction.
2. **Catalog:** Hit `Cmd/Ctrl + N`. You name it "Nested Persona Bypass", set the severity to 🔥 *High*, and paste your prompt.
3. **Test:** You test it against 5 different models. You mark 3 as `Confirmed` and 2 as `Patched` in the Model Matrix.
4. **Analyze:** You check your **Dashboard** and notice your "Nested Instruction" success rate has spiked this week.
5. **Profit:** You link the finding to an active bug bounty program, generate a PDF report, submit it, and mark the bounty as ⏳ *Pending*.

---

## 💻 Getting Started

Get up and running in less than 2 minutes.

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your local machine.

### Quick Start

1. **Open your terminal and navigate to the folder:**
   ```bash
   cd "e:\New folder (5)"
   ```

2. **Install the required packages:**
   ```bash
   npm install
   ```

3. **Ignite the server:**
   ```bash
   npm run dev
   ```

4. **Start Hacking:** Open your browser to `http://localhost:3000` (or `3001` if port 3000 is taken). Set your master PIN, and welcome to your new vault.

---

<div align="center">
  <p><i>"The smartest way to track the dumbest things AI models do."</i></p>
  <p><b>Built for the AI Security Community.</b></p>
</div>
