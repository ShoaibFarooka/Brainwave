# ENGINEK

## Overview
ENGINEK is a comprehensive online education platform designed to facilitate learning, assessment, and community engagement for students and educators. The system provides features for managing study materials, conducting exams, handling payments and subscriptions, and fostering interactive forums and chats.

## Features
- **User Authentication & Profiles:** Secure registration, login, and profile management for students and administrators.
- **Study Materials:** Access to books, notes, past papers, and educational videos, organized by subject.
- **Exams & Quizzes:** Create, edit, and take exams and quizzes with automated grading and reporting.
- **Announcements:** Admins can post announcements to keep users informed of updates and events.
- **Forum & Chat:** Interactive forums and real-time chat for collaborative learning and Q&A.
- **Payment & Subscription:** Integrated payment gateway for purchasing plans and managing subscriptions.
- **Reports & Analytics:** Detailed reports for users and admins on exam performance, payments, and activity.

## Technology Stack
- **Frontend:** React.js (located in the `client/` folder)
- **Backend:** Node.js with Express.js (located in the `server/` folder)
- **Database:** MongoDB (configuration in `server/config/dbConfig.js`)
- **State Management:** Redux (client-side)
- **File Storage:** AWS S3 (for uploads)

## Folder Structure
```
ENGINEK-main/
├── client/         # React frontend
│   ├── src/
│   ├── public/
│   └── ...
├── server/         # Node.js backend
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── ...
```

## Getting Started
### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn
- MongoDB instance

### Installation
1. **Clone the repository:**
   ```powershell
   git clone https://github.com/ShoaibFarooka/Engine.git
   cd Engine/ENGINEK-main
   ```
2. **Install dependencies:**
   ```powershell
   cd client; npm install; cd ../server; npm install
   ```
3. **Configure environment variables:**
   - Create `.env` files in both `client/` and `server/` as needed (see sample `.env.example` if provided).
4. **Start the development servers:**
   ```powershell
   cd server; npm start
   # In a new terminal
   cd client; npm start
   ```

## Usage
- Access the frontend at `http://localhost:3000`.
- The backend API runs at `http://localhost:5000` (default).
- Register as a user or admin, explore study materials, take exams, join forums, and manage subscriptions.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a Pull Request

## License
This project is licensed under the MIT License.

## Contact
For questions or support, contact [Shoaib Farooka](mailto:shoaibfarooka@gmail.com) or open an issue on GitHub.

---
ENGINEK aims to empower learners and educators with a modern, scalable, and interactive platform for education management and delivery.
