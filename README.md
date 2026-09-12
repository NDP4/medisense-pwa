# MediSense PWA — AI-Powered Triage & Early Disease Detection Platform

[![YESIST12 2026 Grand Final](https://img.shields.io/badge/YESIST12-2026%20Grand%20Final-blue.svg)](https://yesist12.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-orange?logo=tensorflow)](https://www.tensorflow.org/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Background & Problem Statement

Primary healthcare services in **3T regions (Terdepan, Terluar, Tertinggal — Frontier, Outermost, Disadvantaged)** in Indonesia face massive structural challenges:
1. **Severe Healthcare Disparity**: The doctor-to-patient ratio in 3T regions reaches **1:8,400**, which is 7 times worse than the national average. Daily operational burdens fall heavily on local village health cadres (*kader kesehatan*).
2. **Infrastructure Constraints**: Most 3T villages suffer from unstable electricity and extremely limited or zero internet connectivity. Conventional cloud-based telemedicine solutions completely fail in these environments.
3. **Delayed Detection & Referral**: The lack of early diagnostic tools often leads to critical medical conditions (such as pre-eclampsia in pregnant women, acute respiratory infections, and severe child malnutrition) being detected too late, resulting in preventable morbidity and mortality.

---

## 🎯 Why MediSense PWA Was Built

**MediSense AI** was developed as a precision healthcare technology solution specifically designed to empower frontline health cadres without relying on internet connectivity:
* **100% Offline-First (On-Device AI)**: Leverages **TensorFlow.js** to execute AI model inference directly on low-end mobile devices (entry-level smartphones with 2GB RAM, Android 7.0+) with zero server latency or data quota requirements.
* **Automated Color-Coded Triage**: Accepts multimodal symptom inputs (visual & clinical) and instantly provides prioritized triage recommendations:
  * 🟢 **Green**: Outpatient care / self-monitoring by cadres.
  * 🟡 **Yellow**: Referral within 24 hours to local community health centers (Puskesmas).
  * 🔴 **Red**: Critical medical emergency — immediate escalation to emergency response.
* **Inclusive Design**: A high-standard PWA interface tailored specifically for users with basic digital literacy.
* **Local-First Architecture**: Utilizes **Serwist** and **IndexedDB (Dexie)** for secure local storage, with asynchronous background synchronization to **Supabase** whenever an internet connection becomes available.

---

## 📈 Impact After Implementation

Once **MediSense PWA** is deployed across primary healthcare operations:
1. **Early Detection Accelerated by 72 Hours**: Health cadres can identify early signs of patient deterioration before clinical symptoms become severe, breaking the chain of delayed medical intervention.
2. **Optimized Medical Referral Efficiency**: Reduces false-positive referrals to district hospitals, saving patient operational costs and easing the burden on advanced referral facilities.
3. **Empowering 3T Communities**: Reaches over **63 million residents** in remote regions by upgrading the operational capacity of local health cadres with portable AI-driven clinical tools.
4. **Contribution to SDGs 3**: Directly supports United Nations Sustainable Development Goals (Good Health and Well-being), specifically reducing Maternal Mortality Rate (MMR) and Infant Mortality Rate (IMR) in disadvantaged areas.
5. **YESIST12 2026 Grand Final Innovation**: Demonstrates how low-cost Edge AI technology can inclusively and sustainably solve critical global humanitarian challenges.

---

## 🛠️ Tech Stack

* **Frontend & Framework**: Next.js 15 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS v4, Lucide React
* **PWA & Offline Capability**: Serwist (`@serwist/next`), IndexedDB (`Dexie`)
* **Machine Learning**: TensorFlow.js (On-device inference model <50MB)
* **Backend & State**: Supabase (`@supabase/supabase-js`), Zustand, Yjs (Real-time sync)

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/NDP4/medisense-pwa.git
cd medisense-pwa

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — developed for the **YESIST12 2026 Grand Final**.
