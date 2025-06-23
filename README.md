# 🧠 Daycare AI Activity Suggestions -- Version 1.4.6

A comprehensive MERN-stack web application designed for early childhood educators to generate **personalized, developmentally appropriate activities and stories** for toddlers — powered by **Google Gemini AI**.

---

## 🚀 Live Demo

👉 [Visit Live App](https://daycare-ai-activity-suggestions.vercel.app)

---

## ✨ Features

### 🎯 Personalized Activity Suggestions
- AI-generated activities tailored to each child's developmental stage and interests
- Save favorite activities for future reference
- Track activity history and preferences
- Filter and search through suggested activities

### 📖 AI-Powered Story Generation
- Create custom stories based on specific scenarios or contexts
- Save and manage generated stories
- Download stories as PDFs for offline use
- Regenerate stories with the same context

### 👥 Student Management
- Add and manage student profiles
- Track developmental milestones and preferences
- View activity and story history per student

### 🔒 Secure & User-Friendly
- PASETO-based authentication
- Responsive design for all devices
- Intuitive user interface

---

## 🛠️ Tech Stack

### Frontend  
- React 18+  
- Tailwind CSS  
- Vite  
- React Icons
- jsPDF (for PDF generation)

### Backend  
- Node.js  
- Express  
- MongoDB (Mongoose)  

### AI & Services  
- Google Vertex AI  
- PASETO + bcrypt (Authentication)  
- Nodemailer (Email services)
- jsPDF (Client-side PDF generation)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance
- Google Gemini API key

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


**Deployment**  
- Vercel (Frontend)  
- Render (Backend)

---

## 🔐 Features

- 👶 Add & manage toddler profiles  
- 🧠 AI-generated activity suggestions tailored to developmental stages  
- ✉️ Secure password reset via email  
- 🔒 PASETO-protected API endpoints  

---

## 📬 API Endpoints

### 🧾 Auth
- `POST /register` – Register a new user  
- `POST /login` – Login and receive JWT  
- `POST /forgot-password` – Request password reset email  
- `POST /reset-password/:token` – Reset password using token  

### 👶 Students
- `GET /students` – Fetch all student profiles  
- `POST /students` – Add a new student  
- `DELETE /students/:id` – Remove student by ID  

### 🤖 AI Suggestions
- `POST /generate` – Get AI-generated activity ideas based on student's age, developmental stage, interests, and other relevant information

---

## ✅ Future Enhancements

- 🧾 User dashboard for managing activity history  
- 📊 Progress tracking and analytics  
- 🌐 Cyprus End-to-End Testing

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and open a pull request with a clear description of your changes.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Acknowledgments

Special thanks to **Google Gemini** for enabling intelligent AI suggestions to support early childhood development.

---
