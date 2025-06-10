# 🧠 Daycare AI Activity Suggestions -- Version 1.3.6

A MERN-stack web app designed to assist early childhood educators by generating **personalized, developmentally appropriate activity ideas for toddlers** — powered by **Google Gemini AI**.

---

## 🚀 Live Demo

👉 [Visit Live App](https://daycare-ai-activity-suggestions.vercel.app)

---

## 🛠️ Tech Stack

**Frontend**  
- React  
- Tailwind CSS  
- Vite  

**Backend**  
- Node.js  
- Express  
- MongoDB (Mongoose)  

**Authentication & Services**  
- JWT + bcrypt (Authentication)  
- Google Gemini (GenAI for activity suggestions)  
- Nodemailer (Email services)  

**Deployment**  
- Vercel (Frontend)  
- Render (Backend)

---

## 🔐 Features

- 👶 Add & manage toddler profiles  
- 🧠 AI-generated activity suggestions tailored to developmental stages  
- ✉️ Secure password reset via email  
- 🔒 JWT-protected API endpoints  

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
