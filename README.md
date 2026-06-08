# ⚡ Performance Evaluation of Task Scheduling Algorithms

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Ready-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)

An AI-enhanced metaheuristic task scheduling simulator designed to map dynamic computational workloads onto heterogeneous virtual resources. Built using a modern **React-TypeScript-Tailwind** web stack, this platform evaluates, visualizes, and benchmarks advanced optimization heuristics under varying multi-objective performance constraints.

🔗 **Repository Link:** [https://github.com/Shivam-0804/Performance-Evaluation-Of-Task-Scheduling-Algorithms.git](https://github.com/Shivam-0804/Performance-Evaluation-Of-Task-Scheduling-Algorithms.git)

---
🌐 **Live Demo Link:** [https://performance-evaluation-of-task-sche.vercel.app/](https://performance-evaluation-of-task-sche.vercel.app/)
## 📸 System Previews

### 1. Operational Overview & Analytics Dashboard
Monitor node cluster telemetry, active queue allocations, and computational capacity metrics in real-time.
![System Deployment Dashboard](https://github.com/Shivam-0804/Performance-Evaluation-Of-Task-Scheduling-Algorithms/blob/df29a555f902d886406d6600f9cbce8d06cf585a/assets/image1.png)

### 2. Workload Schema & Queue Control
Import external configurations, handle high-burst traffic simulation, and manage task complexities dynamically.
![Workload Schema Control](https://github.com/Shivam-0804/Performance-Evaluation-Of-Task-Scheduling-Algorithms/blob/df29a555f902d886406d6600f9cbce8d06cf585a/assets/image2.png)

### 3. Comparative Gantt Allocation Timeline
Review and visualize concurrent schedule mapping across virtual machine nodes for different metaheuristic models.
![Comparative Gantt Charts](https://github.com/Shivam-0804/Performance-Evaluation-Of-Task-Scheduling-Algorithms/blob/df29a555f902d886406d6600f9cbce8d06cf585a/assets/image3.png)

### 4. AI Strategy Engine & Heuristic Intelligence
Utilize entropy mapping and heuristic forecasting to discover the perfect optimization approach for your workload structures.
![AI Recommendation Engine](https://github.com/Shivam-0804/Performance-Evaluation-Of-Task-Scheduling-Algorithms/blob/df29a555f902d886406d6600f9cbce8d06cf585a/assets/image4.png)

---

## 🚀 Key Features

* **Advanced Optimization Schedulers:** Implements full simulator models for Genetic Algorithm (GA), Particle Swarm Optimization (PSO), Ant Colony Optimization (ACO), and a fused Hybrid GA+PSO system.
* **Intelligent Heuristic Engine:** Features an AI Recommendation Engine that reviews incoming task characteristics to predict the absolute best scheduling protocol.
* **Flexible Data Exchange:** Includes CSV integration to import or export custom workloads seamlessly.
* **Deep Matrix Profiling:** Evaluates 10 separate parameters including makespan, resource utilization, execution cost, energy consumption, and SLA limits.

---

## 🛠️ Architecture & Core Modules

The engine operates on a clean modular architecture:
* **Task Management Module:** Builds user-defined tasks tracking priority parameters, execution limits, and dynamic traffic windows.
* **Resource Management Module:** Models heterogeneous node setups featuring distinct MIPS capacities, cost ratios, and energy ratings.
* **Scheduling Core Engine:** Powers computational exploration using evolutionary setups and swarm behaviors.
* **Telemetry & Report Module:** Translates active calculations directly into real-time Gantt timelines and telemetry matrix data.

---

## 📊 Evaluation Matrix & Algorithmic Insights

Derived from the comprehensive analytical data in the project evaluation reports, the scheduling engines balance multi-objective profiles across different metrics:

| Assessment Dimension | Genetic Algorithm (GA) | Particle Swarm Optimization (PSO) | Ant Colony Optimization (ACO) | Hybrid GA+PSO |
| :--- | :--- | :--- | :--- | :--- |
| **Strategy Class** | Evolutionary Search | Swarm Intelligence | Pheromone Path Search | Evolutionary + Swarm Hybrid |
| **Convergence Speed** | Moderate | Fast | Slow–Moderate | Fast–Moderate |
| **Solution Precision** | High | High | Moderate–High | Very High |
| **Compute Overhead** | Moderate | Low | High | High |
| **Local Optima Risk** | Moderate | Moderate–High | Low | Very Low |
| **Primary Strength** | Global Search Diversity | Rapid Convergence | Strong Exploration | Best Overall Optimization |

### Operational Conclusions:
1. **Hybrid GA+PSO** produces top-tier multi-objective balancing across mixed workloads by combining exploratory diversity with target exploitation.
2. **PSO** achieves optimal standalone operational cost-to-speed ratios for rapid or fast dynamic changes.
3. **ACO** functions well within complex path criteria but requires extra computational overhead during sudden scale spikes.

---

## 💻 Getting Started & Running Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation & Deployment Steps

1. **Clone the Project Repository:**
   ```bash
   git clone https://github.com/Shivam-0804/Performance-Evaluation-Of-Task-Scheduling-Algorithms.git
   cd Performance-Evaluation-Of-Task-Scheduling-Algorithms
   ```
  (Note: Replace your_gemini_api_key_here with your actual operational Gemini credential token).
  
2. **Install Project Dependencies:**
    ```bash
    npm install
    ```
3. **Launch the Local Development Server:**
   ```bash
   npm run dev
   ```
The application will boot locally, typically mapping to http://localhost:5173.
