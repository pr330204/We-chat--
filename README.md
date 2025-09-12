# Nexus Connect

This is a Next.js application built with Firebase Studio that allows users to connect with each other.

## Features

- **Google Authentication**: Sign in and out with your Google account.
- **User Discovery**: Browse and search for other registered users.
- **Follow System**: Follow your favorite users to keep them at the top of your list.
- **AI-Generated Profiles**: Each user gets a unique, AI-generated profile summary.
- **Demo Chat**: A static chat interface to simulate user interaction.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Firebase**:
    - Create a new Firebase project.
    - Enable Google Authentication in the Firebase console.
    - Enable Firestore.
    - Create a `.env.local` file by copying `.env.local.example`.
    - Fill in your Firebase project's configuration details in `.env.local`.

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
