# ☁️ AZ-104 Microsoft Azure Administrator Exam Simulator

A modern, interactive, and AI-powered **AZ-104 Exam Simulator** built using React, TypeScript, Tailwind CSS, Vite, and Lucide Icons.

This application offers real-time exam simulations with built-in scenario questions covering all five official Microsoft AZ-104 domains, as well as dynamic query integration powered by Google's **Gemini AI** for custom question generation and interactive tutoring.



[![Live Demo](https://img.shields.io/badge/Live_Demo-Launch_Simulator-cyan?style=for-the-badge&logo=githubpages&logoColor=white)](https://mast3r0mid.github.io/AI-Powered-AZ-104-Exam-Simulator/)

> **Try it live:** [https://mast3r0mid.github.io/AI-Powered-AZ-104-Exam-Simulator/](https://mast3r0mid.github.io/AI-Powered-AZ-104-Exam-Simulator/)

---

<p align="center">
  <img src="AI%20AZ-104.png" alt="AZ-104 Exam Simulator Screenshot" width="800"/>
</p>

---

## 🌟 Key Features

- **🎯 Official Domain Coverage:** Scenario-based questions aligned with all 5 AZ-104 objective domains:
  - *Manage Azure identities and governance (15-20%)*
  - *Implement and manage storage (15-20%)*
  - *Deploy and manage Azure compute resources (20-25%)*
  - *Configure and manage virtual networking (25-30%)*
  - *Monitor and maintain Azure resources (10-15%)*
- **🤖 Dual-Engine Question Generation:**
  - **Built-in Offline Engine:** Pre-loaded with scenario-based questions for quick local practice.
  - **AI Dynamic Engine:** Integration with Gemini API to dynamically generate unlimited, custom-tailored scenario questions.
- **💬 Interactive AI Azure Tutor:** Ask context-aware follow-up questions for any exam question to receive instant, architectural explanations.
- **📊 Real-time Analytics & Dashboard:**
  - Domain-by-domain performance breakdown.
  - Historical exam tracking using browser `localStorage`.
  - Pass/Fail indication calibrated to Microsoft's 70% threshold.
- **🎨 Dark Futuristic UI:** Built with Tailwind CSS, Lucide icons, and modern blur/glow effects.

---
## 🔒 Security & Privacy First

> **Your API Key is Completely Private:** This application runs 100% on the client side in your browser. Your API key is stored only in your local browser storage (`localStorage`) and is never sent to any external server or repository. All requests are sent directly from your browser to Google's official Gemini API servers.

---

## 🤖 AI Features & API Key Setup

1. **Launch the simulator** in your browser.
2. In the **Setup View**, you will see an optional **Gemini API Key** field.
3. **With API Key:** Enter your Gemini key to enable AI-powered custom question generation and the live *Ask AI Azure Tutor* chat inside questions.
4. **Without API Key:** Leave the input blank to use the robust built-in AZ-104 offline question bank.

### How to Get a Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API Key** in the menu, then click **Create API key**.
4. Copy your key and paste it into the **Gemini API Key** field on the app's setup screen.

---


## 🚀 Tech Stack

- **Framework:** React 18+ (TypeScript / TSX)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** `lucide-react`
- **AI Integration:** Google Gemini API (`gemini-3-flash-preview` / `v1beta`)
- **Persistence:** Browser `localStorage`

---

## ⚙️ Setup & Installation

### Prerequisites

Ensure you have the following installed on your development environment:
- **Node.js:** `v16.0.0` or higher
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Clone your repository
git clone https://github.com/Mast3r0mid/AI-Powered-AZ-104-Exam-Simulator.git

# Move into project directory
cd AI-Powered-AZ-104-Exam-Simulator

# Install dependencies
npm install
```

### 2. Required Dependencies

Make sure you have installed `lucide-react`:

```bash
npm install lucide-react
```

### 3. Tailwind CSS & Vite Configuration

1. **Install Tailwind and its peer dependencies:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Configure `tailwind.config.js`:**
   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

3. **Configure `vite.config.ts`:**
   Ensure your Vite configuration correctly loads the React plugin:
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
   })
   ```

4. **Add Tailwind Directives to your CSS (`src/index.css`):**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

## 💻 Running the Application

To run the application locally using Vite's development server:

```bash
npm run dev
```

---


## 📁 File Structure

```text
├── src/
│   ├── App.tsx             # Complete AZ-104 Exam Simulator Component
│   ├── index.css           # Tailwind Directive Imports (@tailwind base, etc.)
│   └── main.tsx            # Application Mounting Point
├── package.json            # Dependencies & Scripts
├── tailwind.config.js      # Tailwind Config
├── vite.config.ts          # Vite Configuration
└── README.md               # Project Documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
