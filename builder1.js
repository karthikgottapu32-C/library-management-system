const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

['components/layout', 'components/common', 'components/dashboard', 'components/tables', 'components/forms', 'pages', 'services', 'hooks', 'utils'].forEach(d => {
    fs.mkdirSync(path.join(srcDir, d), { recursive: true });
});

// tailwind.config.js
fs.writeFileSync(path.join(__dirname, 'frontend', 'tailwind.config.js'), `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F4F7FB',
        sidebar: '#111827', // dark navy / near black
        primary: '#2563EB',
        activeBlue: '#3B5BDB',
        purple: '#7C3AED',
        cyan: '#06B6D4',
        teal: '#14B8A6',
        green: '#10B981',
        warning: '#F59E0B',
        pink: '#EC4899',
        danger: '#EF4444',
        mainText: '#1F2937',
        secondaryText: '#6B7280',
        card: '#FFFFFF',
        border: '#E5E7EB'
      }
    },
  },
  plugins: [],
}
`);

// src/index.css
fs.writeFileSync(path.join(srcDir, 'index.css'), `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', 'Poppins', sans-serif;
  background-color: #F4F7FB;
  color: #1F2937;
}

/* Modal animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
`);

// .env
fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), `VITE_API_URL=http://localhost:5000/api\n`);

// src/services/api.js
fs.writeFileSync(path.join(srcDir, 'services', 'api.js'), `
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export default api;
`);

// src/utils/schema.js
fs.writeFileSync(path.join(srcDir, 'utils', 'schema.js'), `
export const schemas = {
  books: {
    title: 'Books',
    endpoint: 'books',
    pk: 'BOOKID',
    columns: [
      { key: 'BOOKID', label: 'ID' },
      { key: 'TITLE', label: 'Title' },
      { key: 'ISBN', label: 'ISBN' },
      { key: 'CATEGORYID', label: 'Cat ID' },
      { key: 'PUBLISHERID', label: 'Pub ID' },
      { key: 'PRICE', label: 'Price' },
      { key: 'EDITION', label: 'Edition' },
      { key: 'PUBLISHYEAR', label: 'Year' }
    ],
    form: [
      { key: 'TITLE', label: 'Title', type: 'text', required: true },
      { key: 'ISBN', label: 'ISBN', type: 'text', required: true },
      { key: 'CATEGORYID', label: 'Category ID', type: 'number', required: true },
      { key: 'PUBLISHERID', label: 'Publisher ID', type: 'number', required: true },
      { key: 'PRICE', label: 'Price', type: 'number' },
      { key: 'EDITION', label: 'Edition', type: 'text' },
      { key: 'PUBLISHYEAR', label: 'Publish Year', type: 'number' }
    ]
  },
  'book-copies': {
    title: 'Book Copies',
    endpoint: 'book-copies',
    pk: 'COPYID',
    columns: [
      { key: 'COPYID', label: 'Copy ID' },
      { key: 'BOOKID', label: 'Book ID' },
      { key: 'LOCATIONID', label: 'Location ID' },
      { key: 'STATUS', label: 'Status' }
    ],
    form: [
      { key: 'BOOKID', label: 'Book ID', type: 'number', required: true },
      { key: 'LOCATIONID', label: 'Location ID', type: 'number', required: true },
      { key: 'STATUS', label: 'Status', type: 'text', required: true }
    ]
  },
  authors: {
    title: 'Authors', endpoint: 'authors', pk: 'AUTHORID',
    columns: [{key:'AUTHORID',label:'ID'}, {key:'FIRSTNAME',label:'First Name'}, {key:'LASTNAME',label:'Last Name'}, {key:'BIRTHYEAR',label:'Birth Year'}],
    form: [{key:'FIRSTNAME',label:'First Name',type:'text',required:true}, {key:'LASTNAME',label:'Last Name',type:'text',required:true}, {key:'BIRTHYEAR',label:'Birth Year',type:'number'}]
  },
  categories: {
    title: 'Categories', endpoint: 'categories', pk: 'CATEGORYID',
    columns: [{key:'CATEGORYID',label:'ID'}, {key:'CATEGORYNAME',label:'Name'}, {key:'DESCRIPTION',label:'Description'}],
    form: [{key:'CATEGORYNAME',label:'Name',type:'text',required:true}, {key:'DESCRIPTION',label:'Description',type:'text'}]
  },
  publishers: {
    title: 'Publishers', endpoint: 'publishers', pk: 'PUBLISHERID',
    columns: [{key:'PUBLISHERID',label:'ID'}, {key:'PUBLISHERNAME',label:'Name'}, {key:'CONTACTNUMBER',label:'Contact'}, {key:'ADDRESS',label:'Address'}],
    form: [{key:'PUBLISHERNAME',label:'Name',type:'text',required:true}, {key:'CONTACTNUMBER',label:'Contact',type:'text'}, {key:'ADDRESS',label:'Address',type:'text'}]
  },
  members: {
    title: 'Members', endpoint: 'members', pk: 'MEMBERID',
    columns: [{key:'MEMBERID',label:'ID'}, {key:'FIRSTNAME',label:'First Name'}, {key:'LASTNAME',label:'Last Name'}, {key:'EMAIL',label:'Email'}, {key:'PHONE',label:'Phone'}, {key:'MEMBERSHIPDATE',label:'Member Since'}],
    form: [{key:'FIRSTNAME',label:'First Name',type:'text',required:true}, {key:'LASTNAME',label:'Last Name',type:'text',required:true}, {key:'EMAIL',label:'Email',type:'text',required:true}, {key:'PHONE',label:'Phone',type:'text'}, {key:'MEMBERSHIPDATE',label:'Date (YYYY-MM-DD)',type:'text'}]
  },
  loans: {
    title: 'Loans', endpoint: 'loans', pk: 'LOANID',
    columns: [{key:'LOANID',label:'ID'}, {key:'COPYID',label:'Copy ID'}, {key:'MEMBERID',label:'Member ID'}, {key:'LOANDATE',label:'Issue Date'}, {key:'DUEDATE',label:'Due Date'}, {key:'RETURNDATE',label:'Return Date'}, {key:'STATUS',label:'Status'}],
    form: [{key:'COPYID',label:'Copy ID',type:'number',required:true}, {key:'MEMBERID',label:'Member ID',type:'number',required:true}, {key:'LOANDATE',label:'Issue Date',type:'text',required:true}, {key:'DUEDATE',label:'Due Date',type:'text',required:true}, {key:'RETURNDATE',label:'Return Date',type:'text'}, {key:'STATUS',label:'Status',type:'text',required:true}]
  },
  reservations: {
    title: 'Reservations', endpoint: 'reservations', pk: 'RESERVATIONID',
    columns: [{key:'RESERVATIONID',label:'ID'}, {key:'MEMBERID',label:'Member ID'}, {key:'BOOKID',label:'Book ID'}, {key:'RESERVATIONDATE',label:'Date'}, {key:'STATUS',label:'Status'}],
    form: [{key:'MEMBERID',label:'Member ID',type:'number',required:true}, {key:'BOOKID',label:'Book ID',type:'number',required:true}, {key:'RESERVATIONDATE',label:'Date',type:'text',required:true}, {key:'STATUS',label:'Status',type:'text',required:true}]
  },
  fines: {
    title: 'Fines', endpoint: 'fines', pk: 'FINEID',
    columns: [{key:'FINEID',label:'ID'}, {key:'LOANID',label:'Loan ID'}, {key:'FINEAMOUNT',label:'Amount'}, {key:'FINESTATUS',label:'Status'}],
    form: [{key:'LOANID',label:'Loan ID',type:'number',required:true}, {key:'FINEAMOUNT',label:'Amount',type:'number',required:true}, {key:'FINESTATUS',label:'Status',type:'text',required:true}]
  },
  payments: {
    title: 'Payments', endpoint: 'payments', pk: 'PAYMENTID',
    columns: [{key:'PAYMENTID',label:'ID'}, {key:'FINEID',label:'Fine ID'}, {key:'PAYMENTDATE',label:'Date'}, {key:'PAYMENTAMOUNT',label:'Amount'}],
    form: [{key:'FINEID',label:'Fine ID',type:'number',required:true}, {key:'PAYMENTDATE',label:'Date',type:'text',required:true}, {key:'PAYMENTAMOUNT',label:'Amount',type:'number',required:true}]
  },
  librarians: {
    title: 'Librarians', endpoint: 'librarians', pk: 'LIBRARIANID',
    columns: [{key:'LIBRARIANID',label:'ID'}, {key:'FIRSTNAME',label:'First Name'}, {key:'LASTNAME',label:'Last Name'}, {key:'EMAIL',label:'Email'}, {key:'HIREDATE',label:'Hire Date'}],
    form: [{key:'FIRSTNAME',label:'First',type:'text',required:true}, {key:'LASTNAME',label:'Last',type:'text',required:true}, {key:'EMAIL',label:'Email',type:'text',required:true}, {key:'HIREDATE',label:'Hire Date',type:'text'}]
  },
  'library-branches': {
    title: 'Library Branches', endpoint: 'library-branches', pk: 'BRANCHID',
    columns: [{key:'BRANCHID',label:'ID'}, {key:'BRANCHNAME',label:'Name'}, {key:'LOCATION',label:'Location'}],
    form: [{key:'BRANCHNAME',label:'Name',type:'text',required:true}, {key:'LOCATION',label:'Location',type:'text',required:true}]
  },
  'book-locations': {
    title: 'Book Locations', endpoint: 'book-locations', pk: 'LOCATIONID',
    columns: [{key:'LOCATIONID',label:'ID'}, {key:'BRANCHID',label:'Branch ID'}, {key:'SECTION',label:'Section'}, {key:'SHELF',label:'Shelf'}],
    form: [{key:'BRANCHID',label:'Branch ID',type:'number',required:true}, {key:'SECTION',label:'Section',type:'text',required:true}, {key:'SHELF',label:'Shelf',type:'text',required:true}]
  },
  suppliers: {
    title: 'Suppliers', endpoint: 'suppliers', pk: 'SUPPLIERID',
    columns: [{key:'SUPPLIERID',label:'ID'}, {key:'SUPPLIERNAME',label:'Name'}, {key:'CONTACTPERSON',label:'Contact'}, {key:'PHONE',label:'Phone'}, {key:'EMAIL',label:'Email'}],
    form: [{key:'SUPPLIERNAME',label:'Name',type:'text',required:true}, {key:'CONTACTPERSON',label:'Contact',type:'text'}, {key:'PHONE',label:'Phone',type:'text'}, {key:'EMAIL',label:'Email',type:'text'}]
  },
  'written-by': {
    title: 'Written By', endpoint: 'written-by', pk: ['BOOKID', 'AUTHORID'],
    columns: [{key:'BOOKID',label:'Book ID'}, {key:'AUTHORID',label:'Author ID'}],
    form: [{key:'BOOKID',label:'Book ID',type:'number',required:true}, {key:'AUTHORID',label:'Author ID',type:'number',required:true}]
  }
};
`);

// src/components/layout/Sidebar.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Sidebar.jsx'), `
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Book, BookCopy, Users, Tags, Building2, MapPin, 
  Truck, PenTool, LayoutDashboard, Calendar, FileText, 
  DollarSign, Briefcase, LibraryBig, CreditCard
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/books', label: 'Books', icon: Book },
  { path: '/book-copies', label: 'Book Copies', icon: BookCopy },
  { path: '/authors', label: 'Authors', icon: Users },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/publishers', label: 'Publishers', icon: Building2 },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/loans', label: 'Loans', icon: Calendar },
  { path: '/reservations', label: 'Reservations', icon: FileText },
  { path: '/fines', label: 'Fines', icon: DollarSign },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/librarians', label: 'Librarians', icon: Briefcase },
  { path: '/library-branches', label: 'Library Branches', icon: LibraryBig },
  { path: '/book-locations', label: 'Book Locations', icon: MapPin },
  { path: '/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/written-by', label: 'Written By', icon: PenTool },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-sidebar min-h-screen flex flex-col text-white flex-shrink-0">
      <div className="p-4 flex items-center gap-3 font-bold text-lg border-b border-gray-800">
        <Book className="w-6 h-6 text-primary" />
        <span>Library MS</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => 
              \`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 \${isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}\`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
`);

// src/components/layout/Topbar.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Topbar.jsx'), `
import React from 'react';
import { Bell, UserCircle } from 'lucide-react';

export default function Topbar() {
  return (
    <div className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="font-semibold text-lg text-mainText">Library Administration</div>
      <div className="flex items-center gap-4 text-secondaryText">
        <button className="hover:text-primary transition-colors"><Bell className="w-5 h-5" /></button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <UserCircle className="w-6 h-6" />
          <span className="text-sm font-medium">Admin</span>
        </button>
      </div>
    </div>
  );
}
`);

// src/components/layout/Layout.jsx
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Layout.jsx'), `
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`);
