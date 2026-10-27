# ☁️ AZ-104 Microsoft Azure Administrator Exam Simulator

A modern, interactive, and AI-powered **AZ-104 Exam Simulator** built using React, TypeScript, Tailwind CSS, and Lucide Icons. 

This application offers real-time exam simulations with built-in scenario questions covering all five official Microsoft AZ-104 domains, as well as dynamic query integration powered by Google's **Gemini AI** for custom question generation and interactive tutoring.

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
  - Historical exam tracking using `localStorage`.
  - Pass/Fail indication calibrated to Microsoft's 70% threshold.
- **🎨 Dark Futuristic UI:** Built with Tailwind CSS, Lucide icons, and modern blur/glow effects.

---

## 🚀 Tech Stack

- **Framework:** React 18+ (TypeScript / TSX)
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
git clone https://github.com/YOUR_USERNAME/az104-exam-simulator.git

# Move into project directory
cd az104-exam-simulator

# Install dependencies
npm install
```

### 2. Required Dependencies

If you are incorporating this single TSX component into an existing React project, make sure you have installed `lucide-react`:

```bash
npm install lucide-react
```

### 3. Tailwind CSS Configuration

  # 1. Install Tailwind and its peer dependencies
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  ```
  # 2. Generate the tailwind configuration files
  ```bash
  npx tailwindcss init -p
  ```
Ensure Tailwind CSS is properly initialized in your project. Add the following line to your `tailwind.config.js` if it isn't already set up:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## 💻 Running the Application

To run the application locally using Vite, Create React App, or Next.js development server:

```bash
# Using standard npm start script
npm start

# Or if using Vite
npm run dev
```

---

## 🔑 AI Features & API Key Setup

1. Launch the simulator in your browser.
2. In the **Setup View**, you will see an optional **Gemini API Key** field.
3. **With API Key:** Enter your Gemini API key to enable AI-powered custom question generation and the live **Ask AI Azure Tutor** chat inside questions.
4. **Without API Key:** Leave the input blank. The simulator will default to the built-in AZ-104 question engine and fallback guidance.

---

## 📁 File Structure

```text
├── src/
│   ├── App.tsx           # Complete AZ-104 Exam Simulator Component
│   ├── index.css         # Tailwind Directive Imports (@tailwind base, etc.)
│   └── main.tsx          # Application Mounting Point
├── package.json          # Dependencies & Scripts
├── tailwind.config.js    # Tailwind Config
└── README.md             # Project Documentation
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
