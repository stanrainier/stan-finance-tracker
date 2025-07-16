# 💸 Stan Finance App

**Stan Finance App** is a modern, secure, and visually polished personal finance tracker built using **Next.js**, **Firebase Authentication**, and **HeroUI**. The application is designed to help users manage and monitor their financial data in an intuitive and organized interface — including accounts, transactions, payables, and receivables.

---

## 🔐 Authentication

- Supports **Google Sign-In** using Firebase.
- Routes are protected — users are redirected to login if unauthenticated.
- Auth state is persistent across sessions.

---

## 🧩 Features

- 📊 **Dashboard Overview** – Quickly see financial health and summary.
- 🧾 **Transaction Logs** – Organized by date with clean presentation.
- 💳 **Account Management** – View banks like SeaBank, PayMaya, GoTyme in a bento grid layout.
- 💸 **Payables** – Track upcoming bills with amount, due date, and “Mark as Paid” actions.
- 💰 **Receivables** – Monitor incoming payments and expected dates.
- 🌗 **Dark Mode Support** – Toggle with a theme switch.
- 🧼 **Simple, Responsive UI** – Designed with HeroUI and Tailwind.

---

## 🛠 Tech Stack

- **Next.js** – App framework for React
- **React 18** – UI Library
- **Firebase** – Auth (Google Login)
- **HeroUI** – Component system for building clean interfaces
- **Tailwind CSS** – Utility-first CSS framework

---

## 🔒 Route Protection

All application routes are protected by authentication. Unauthorized users attempting to access the dashboard or any subpages are automatically redirected to the login page.

---

## 🗂 Pages

- `/login` – Sign in with Google
- `/dashboard` – Summary of balances and quick stats
- `/transactions` – Chronological list of financial activity
- `/accounts` – Account grid (e.g. PayMaya, SeaBank)
- `/payables` – Expenses with due dates and payment status
- `/receivables` – Income that is expected or pending

---

## 🧱 Architecture

The project follows a modular and component-based structure using modern React/Next.js patterns. All styles are utility-driven via Tailwind and HeroUI to maintain a consistent design system.

---

## ⚠️ Disclaimer

This is a **private, personal-use project** and not intended for public or production deployment. No code or sensitive configuration is shared in this repository or documentation.

---

## 🙌 Credits

- [HeroUI](https://heroui.com)
- [Firebase Authentication](https://firebase.google.com)
- [Next.js](https://nextjs.org)

> Built by Stan as a personal finance tracker project ❤️
