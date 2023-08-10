# BuzzHive

A Full Stack Chat Application using Next.js and Firebase

## App Preview
[Watch My Video](https://www.example.com/my_large_video.mp4)
## Features

- Group Chats
- Group Editing
  - Adding and removing people from the group
  - Change group image, bio, and name
- Google Sign In
- Sending Images, Videos, and Files
  - Automatic downloads setting toggle for files, pictures, and videos
  - Locally stored videos, files, and pictures
- Creating Polls
- Profile Editing
  - Change profile image, bio, and name
- View Other Users' Profile
- Show Unread Messages Count
- Delete Messages
- Light / Dark mode toggler
- Turning read receipts on/off
- Reacting, forwarding, and replying to a chat

## Getting Started

step 1: Create your firebase project

step 2: Clone Repository and Install Packages.
```
  git clone https://github.com/AdinlewaAbraham/BuzzHive && cd BuzzHive && npm install
```

Step 3: Open the firebase.js file located in the utils/firebaseUtils directory.

Step 4: Replace the existing configuration details with your own Firebase project's details.
```
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); 
```
Step 5: Start the development server.
```
 npm run dev
```

