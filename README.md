# 💰 My Accounts Mobile 📱

A simple and intuitive mobile app to manage your personal accounts, built with React Native and Expo.

## 🤔 About This Project

This is a practice project for learning React Native, based on the book [React and React Native: Build cross-platform JavaScript and TypeScript apps for the web, desktop, and mobile 5th Edition](https://www.packtpub.com/en-us/product/react-and-react-native-9781805126874).

The styles are mostly vibe coded cause i am a backend dev lmao.

## ✨ Features

*   **Cross-platform:** Runs on both Android and iOS devices.
*   **Offline-first:** Uses Realm for local data storage.
*   **Track Expenses:** Easily add, edit, and delete expenses.
*   **API Integration:** Syncs with a backend server.

## 🚀 Tech Stack

*   **React Native:** A framework for building native apps using React.
*   **Expo:** A platform for making universal React applications.
*   **Realm:** A mobile database for reactive and offline-first apps.
*   **TypeScript:** A typed superset of JavaScript.

## 🏁 Getting Started

### Prerequisites

*   Node.js (v18 or newer)
*   Expo Go app on your mobile device (Android or iOS) or an emulator.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tomas-santucho/my-accounts-mobile.git
    cd my-accounts-mobile
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the App

1.  **Start the development server:**
    ```bash
    npx expo start
    ```

2.  **Scan the QR code:**
    *   Open the Expo Go app on your mobile device and scan the QR code shown in the terminal.
    *   Alternatively, you can run the app on an emulator by pressing `a` for Android or `i` for iOS in the terminal.

## 📂 Project Structure

```
my-accounts-mobile/
├── assets/              # Images and other assets
├── src/
│   ├── data/
│   │   ├── apiClient.ts   # API client for backend communication
│   │   └── realm/
│   │       ├── realm.ts   # Realm database configuration
│   │       └── schemas.ts # Realm database schemas
│   └── services/
│       └── expenseService.ts # Business logic for expenses
├── App.tsx                # Main application component
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```