# HD Bank 🏦

A professional, modern banking management system featuring separate interfaces for Clients, Employees, and Managers.

**Live Website:** [https://hd-bank-in.vercel.app/](https://hd-bank-in.vercel.app/)

**Tech Stack:** React (Vite), Django (REST Framework), MongoDB (Djongo)

---

## 🚀 Workflows

### 🔐 Authentication & Role Management
- **Multi-Role System**: Distinct workflows for **Clients**, **Employees**, and **Managers**.
- **Secure Registration**: OTP-based verification for enhanced security.
- **Account Activation**: Client registration follows an activation model for verified access.
- **Employee Onboarding**: Managed flow for employee registration and verification.

### 💼 Banking Operations
- **Account Management**: Creation and management of multiple account types.
- **Real-time Balancing**: Instant balance updates and transaction tracking.
- **Secure Transactions**: Reference ID generation for all banking activities.
- **Manager Oversight**: High-level dashboard for managing users and system health.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [React Context API / Hooks](https://react.dev/reference/react/hooks)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [Django 4](https://www.djangoproject.com/)
- **API Architecture**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (integrated via [Djongo](https://www.djongomapper.com/))
- **Deployment Utilities**: WhiteNoise, Gunicorn, python-dotenv

---

## 💻 Local Setup

### Backend
1. Navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv venv`.
3. Activate the environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux).
4. Install dependencies: `pip install -r requirements.txt`.
5. Configure your `.env` file with MongoDB connection details.
6. Run migrations: `python manage.py migrate`.
7. Start the server: `python manage.py runserver`.

### Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Start the development server: `npm run dev`.

---

## 🏗 Deployment
- **Frontend**: Deployed on [Vercel](https://vercel.com/)
- **Backend**: Deployed on [Render](https://render.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)
