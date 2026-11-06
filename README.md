# StudioSpace – Creative Studio Booking Platform

**StudioSpace** is a creative studio booking platform that connects photographers, filmmakers, podcasters, and other creators with studio owners. Users can explore available studios, view studio details, and book creative spaces. Studio owners can list and manage their studios and handle booking requests through a personalized dashboard.

## 🌐 Live Website

- **Frontend:** https://studiospace-client-t65c.vercel.app
- **Backend API:** https://studiospace-server-xxwa.onrender.com

## ✨ Key Features

- **User Authentication:** Register and log in using email and password, with Google social login support.
- **Explore Studios:** Browse available creative studios and filter them by category.
- **Search Functionality:** Search studios by title, location, and other relevant information.
- **Studio Details:** View detailed studio information, pricing, amenities, capacity, and location.
- **Studio Management:** Authenticated studio owners can add, edit, and delete their own studio listings.
- **Booking System:** Users can submit studio booking requests and manage their bookings.
- **Booking Management:** Studio owners can confirm or reject booking requests, while customers can cancel their own eligible bookings.
- **Booking Status:** Track booking statuses such as Pending, Confirmed, Completed, and Cancelled.
- **Dashboard:** Dedicated dashboard for managing studio listings and bookings.
- **Protected Routes:** Private pages and backend operations are protected through authentication.
- **Responsive Design:** Optimized for mobile, tablet, and desktop devices.
- **Notifications:** Interactive success and error notifications using Sonner.
- **Loading and Empty States:** User-friendly loading indicators and helpful empty-state messages.

## 🛠️ Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Better Auth
- Lucide React
- Sonner

### Backend
- Node.js
- Express.js
- MongoDB
- Better Auth

### Deployment & Services
- Vercel – Frontend Hosting
- Render – Backend Hosting
- MongoDB Atlas – Database Hosting

## 📁 Project Structure

The project is organized into two separate repositories:

**Client Repository**
```text
studiospace-client/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── package.json
└── README.md
```

**Server Repository**
```text
studiospace-server/
├── index.js
├── package.json
├── .env
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the Repositories

Clone the client and server repositories separately.

```bash
git clone YOUR_CLIENT_GITHUB_REPOSITORY_URL
git clone YOUR_SERVER_GITHUB_REPOSITORY_URL
```

### 2. Set Up the Backend

Navigate to the server directory:

```bash
cd studiospace-server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the server root directory.

Configure the required environment variables according to the backend configuration:

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
```

Also configure the Better Auth secret, trusted frontend origin, and Google OAuth credentials if required by your authentication setup.

Start the backend:

```bash
npm run dev
```

The backend should run locally at:

```text
http://localhost:5000
```

### 3. Set Up the Frontend

Navigate to the client directory:

```bash
cd studiospace-client
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

### 4. Production Environment

For deployment, configure the following frontend environment variable in Vercel:

```env
NEXT_PUBLIC_API_URL=https://studiospace-server-xxwa.onrender.com
```

Configure the required backend environment variables and production authentication settings in Render.

**Important:** Never commit `.env` or `.env.local` files containing secrets or credentials to GitHub.

## 🔐 Examiner Test Credentials

Use the following credentials to test the application:

| Field | Value |
|---|---|
| Website URL | https://studiospace-client-t65c.vercel.app |
| Test Email | arafat20@gmail.com|
| Test Password | @Arafat12 |

**Note:** Replace the placeholder credentials with a working test account before submission. Do not use your personal account password.

## 🔒 Security

- Authentication is handled using Better Auth.
- Protected backend operations require an authenticated session.
- Studio owners can manage only their own listings.
- Booking operations validate user permissions.
- Sensitive environment variables are stored outside the source code.
- Backend access is protected through authentication and authorization checks.

## 🚀 Deployment

- Frontend deployed on Vercel.
- Backend deployed on Render.
- Database hosted on MongoDB Atlas.


## 📸 Project Screenshots

### 1. Home Page
![StudioSpace Home Page](public/screenshots/home.png)

### 2. Explore Studios
![Explore Studios](public/screenshots/explore-studios.png)

### 3. Studio Details
![Studio Details](public/screenshots/studio-details.png)

### 4. Dashboard
![StudioSpace Dashboard](public/screenshots/dashboard.png)



## 👨‍💻 Developer

**Project Name:** StudioSpace  
**Project Type:** Creative Studio Booking Platform

---

*StudioSpace makes discovering, listing, and booking creative spaces easier for everyone.*
