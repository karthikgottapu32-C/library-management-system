const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

content = content.replace('const [recentBooks, setRecentBooks] = useState([]);', '');
content = content.replace(/const resBooks = await api\.get\('\/dashboard\/recent-books'\);[\s\S]*?setRecentBooks\(resBooks\.data\.data \|\| \[\]\);/, '');

const statCardsRegex = /const statCards = \[[^]*?\];/;
const newStatCards = `const statCards = [
    { title: 'Total Books', value: stats?.totalBooks, icon: Library, gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', delay: 0 },
    { title: 'Total Members', value: stats?.totalMembers, icon: Users, gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)', delay: 0.05 },
    { title: 'Available Copies', value: stats?.availableCopies, icon: Bookmark, gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', delay: 0.1 },
    { title: 'Issued Copies', value: stats?.issuedCopies, icon: BookCopy, gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', delay: 0.15 },
    { title: 'Active Loans', value: stats?.activeLoans, icon: Calendar, gradient: 'linear-gradient(135deg,#10b981,#34d399)', delay: 0.2 },
    { title: 'Overdue Loans', value: stats?.overdueLoans, icon: AlertCircle, gradient: 'linear-gradient(135deg,#ef4444,#f87171)', delay: 0.25 },
    { title: 'Unpaid Fines', value: stats?.outstandingFines, icon: DollarSign, gradient: 'linear-gradient(135deg,#ec4899,#f472b6)', delay: 0.3 }
  ];`;
content = content.replace(statCardsRegex, newStatCards);

const recentBooksHtmlRegex = /\{\/\* Recently Added Books \*\/\}[\s\S]*?<\/motion\.div>/;
content = content.replace(recentBooksHtmlRegex, '');

content = content.replace('className="grid grid-cols-1 lg:grid-cols-2 gap-6"', 'className="grid grid-cols-1 gap-6"');

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
