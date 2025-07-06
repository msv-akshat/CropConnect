# Udhyan Setu – Farmer Data Management Platform 🌿

**Udhyan Setu** is a full-stack web application designed to streamline the collection, approval, and analysis of farmer data. It enables field employees to upload data via Excel, and allows admins to verify and manage records — all within a scalable and secure system.

## 🚀 Features

- 🔐 **Login System** with session-based authentication
- 🧑‍🌾 **Role-Based Access** for employees and admins
- 📥 **Excel Upload** by employees (stored in a pending table)
- 🗃️ **Data Validation**: Check and merge records based on phone numbers
- ✅ **Admin Approval Panel**: Accept or update entries into the main table
- 📊 **Data Filtering** by mandal, village, and crop
- 📈 **Total Area and Farmer Count** display
- 📤 **Download Verified Data** as Excel
- 🧪 **Upcoming Features**:
  - OTP-based farmer registration
  - Geo-tagging of farm plots
  - Crop analytics dashboard
  - Product selling module for farmers

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Bootstrap
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Sessions (JWT planned)
- **File Upload/Parsing**: Multer, XLSX


## 📦 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/msv-akshat/udhyan-setu
cd udhyan-setu
```

### 2. Install frontend dependencies
```bash
cd frontend
npm install
npm run dev
```

### 3. Install backend dependencies
```bash
cd ../server
npm install
node server.js
```

## 🧠 What I Learned

- Built a production-ready fullstack workflow
- Designed a role-based data approval system
- Worked with Supabase PostgreSQL, React state flow, and backend Excel processing
- Practiced clean database design and efficient bulk operations

## 📸 Screenshots

> Add some screenshots here like:
- Login page
- Excel upload interface
- Admin approval panel
- Filter & download screen
