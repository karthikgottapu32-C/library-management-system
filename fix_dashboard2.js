const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

const oldCards = `
  const statCards = [
    { id: 'books', schemaKey: 'books', title: 'Total Books', value: stats?.totalBooks, icon: Library, gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', delay: 0 },
    { id: 'members', schemaKey: 'members', title: 'Total Members', value: stats?.totalMembers, icon: Users, gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', delay: 0.05 },
    { id: 'available_copies', schemaKey: 'book-copies', title: 'Available Copies', value: stats?.availableCopies, icon: Bookmark, gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', delay: 0.1 },
    { id: 'issued_copies', schemaKey: 'book-copies', title: 'Issued Copies', value: stats?.issuedCopies, icon: BookCopy, gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', delay: 0.15 },
    { id: 'active_loans', schemaKey: 'loans', title: 'Active Loans', value: stats?.activeLoans, icon: Calendar, gradient: 'linear-gradient(135deg,#10b981,#34d399)', delay: 0.2 },
    { id: 'overdue_loans', schemaKey: 'loans', title: 'Overdue Loans', value: stats?.overdueLoans, icon: AlertCircle, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', delay: 0.25 },
    { id: 'unpaid_fines', schemaKey: 'fines', title: 'Unpaid Fines', value: stats?.outstandingFines, icon: DollarSign, gradient: 'linear-gradient(135deg,#ec4899,#f472b6)', delay: 0.3 }
  ];
`;

const newCards = `
  const statCards = [
    { id: 'books', schemaKey: 'books', title: 'Total Books', value: stats?.totalBooks, icon: Library, gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', delay: 0 },
    { id: 'members', schemaKey: 'members', title: 'Total Members', value: stats?.totalMembers, icon: Users, gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', delay: 0.05 },
    { id: 'authors', schemaKey: 'authors', title: 'Authors', value: stats?.totalAuthors, icon: PenTool, gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', delay: 0.1 },
    { id: 'categories', schemaKey: 'categories', title: 'Categories', value: stats?.totalCategories, icon: Tags, gradient: 'linear-gradient(135deg,#10b981,#34d399)', delay: 0.15 },
    { id: 'available_copies', schemaKey: 'book-copies', title: 'Available Copies', value: stats?.availableCopies, icon: Bookmark, gradient: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', delay: 0.2 },
    { id: 'issued_copies', schemaKey: 'book-copies', title: 'Issued Copies', value: stats?.issuedCopies, icon: BookCopy, gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', delay: 0.25 },
    { id: 'active_loans', schemaKey: 'loans', title: 'Active Loans', value: stats?.activeLoans, icon: Calendar, gradient: 'linear-gradient(135deg,#14b8a6,#2dd4bf)', delay: 0.3 },
    { id: 'overdue_loans', schemaKey: 'loans', title: 'Overdue Loans', value: stats?.overdueLoans, icon: AlertCircle, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', delay: 0.35 },
    { id: 'unpaid_fines', schemaKey: 'fines', title: 'Unpaid Fines', value: stats?.outstandingFines, icon: DollarSign, gradient: 'linear-gradient(135deg,#ec4899,#f472b6)', delay: 0.4 }
  ];
`;

content = content.replace(oldCards.trim(), newCards.trim());
content = content.replace(/import\s*\{[^}]*\}\s*from\s*'lucide-react';/, "import { Book, Users, Calendar, DollarSign, AlertCircle, Building, Bookmark, BookCopy, TrendingUp, Library, RefreshCw, CheckCircle, BarChart3, ArrowLeft, PenTool, Tags } from 'lucide-react';");

content = content.replace('className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"', 'className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8"');

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
