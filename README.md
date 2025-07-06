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

- Home page
  ![image](https://github.com/user-attachments/assets/4f5dbc36-5e65-4b8a-a546-7e600c1a5514)

- Login page
  ![image](https://github.com/user-attachments/assets/d367f3b8-0dd1-48ef-9790-1a9966f1a1fc)

- Farmer register form
  ![image](https://github.com/user-attachments/assets/5f23bdd0-82d8-49a6-8268-ab8d109868b8)

- Excel upload interface
  ![image](https://github.com/user-attachments/assets/12f1bba4-2b81-4a07-8035-90450d2cdc99)

- Filter & download screen
  ![image](https://github.com/user-attachments/assets/6b65579b-b1c8-44b6-b0bb-edbb273eb761)

