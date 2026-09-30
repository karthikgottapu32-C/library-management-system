
export const schemas = {
  books: {
    title: 'Books',
    endpoint: 'books',
    pk: 'BOOKID',
    columns: [
      { key: 'BOOKID', label: 'ID' },
      { key: 'TITLE', label: 'Title' },
      { key: 'ISBN', label: 'ISBN' },
      { key: 'CATEGORYID', label: 'Category ID' },
      { key: 'PUBLISHERID', label: 'Publisher ID' },
      { key: 'PRICE', label: 'Price' },
      { key: 'EDITION', label: 'Edition' },
      { key: 'PUBLISHYEAR', label: 'Year' }
    ],
    form: [
      { key: 'TITLE', label: 'Title', type: 'text', required: true },
      { key: 'ISBN', label: 'ISBN', type: 'text' },
      { key: 'CATEGORYID', label: 'Category ID', type: 'number', required: true },
      { key: 'PUBLISHERID', label: 'Publisher ID', type: 'number', required: true },
      { key: 'PRICE', label: 'Price', type: 'number' },
      { key: 'EDITION', label: 'Edition', type: 'select', options: ['1st','2nd','3rd','4th','5th'] },
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
      { key: 'BRANCHID', label: 'Branch ID' },
      { key: 'LOCATIONID', label: 'Location ID' },
      { key: 'ACCESSIONNO', label: 'Accession No' },
      { key: 'STATUS', label: 'Status' }
    ],
    form: [
      { key: 'BOOKID', label: 'Book ID', type: 'number', required: true },
      { key: 'BRANCHID', label: 'Branch ID', type: 'number', required: true },
      { key: 'LOCATIONID', label: 'Location ID', type: 'number' },
      { key: 'ACCESSIONNO', label: 'Accession No', type: 'text' },
      { key: 'STATUS', label: 'Status', type: 'select', required: true, options: ['Available','Issued','Lost','Damaged'] }
    ]
  },
  authors: {
    title: 'Authors',
    endpoint: 'authors',
    pk: 'AUTHORID',
    columns: [
      { key: 'AUTHORID', label: 'ID' },
      { key: 'AUTHORNAME', label: 'Name' },
      { key: 'NATIONALITY', label: 'Nationality' },
      { key: 'BIOGRAPHY', label: 'Biography' }
    ],
    form: [
      { key: 'AUTHORNAME', label: 'Name', type: 'text', required: true },
      { key: 'NATIONALITY', label: 'Nationality', type: 'text' },
      { key: 'BIOGRAPHY', label: 'Biography', type: 'text' }
    ]
  },
  categories: {
    title: 'Categories',
    endpoint: 'categories',
    pk: 'CATEGORYID',
    columns: [
      { key: 'CATEGORYID', label: 'ID' },
      { key: 'CATEGORYNAME', label: 'Name' },
      { key: 'DESCRIPTION', label: 'Description' }
    ],
    form: [
      { key: 'CATEGORYNAME', label: 'Name', type: 'text', required: true },
      { key: 'DESCRIPTION', label: 'Description', type: 'text' }
    ]
  },
  publishers: {
    title: 'Publishers',
    endpoint: 'publishers',
    pk: 'PUBLISHERID',
    columns: [
      { key: 'PUBLISHERID', label: 'ID' },
      { key: 'PUBLISHERNAME', label: 'Name' },
      { key: 'PHONE', label: 'Phone' },
      { key: 'EMAIL', label: 'Email' },
      { key: 'ADDRESS', label: 'Address' }
    ],
    form: [
      { key: 'PUBLISHERNAME', label: 'Publisher Name', type: 'text', required: true },
      { key: 'PHONE', label: 'Phone', type: 'text' },
      { key: 'EMAIL', label: 'Email', type: 'text' },
      { key: 'ADDRESS', label: 'Address', type: 'text' }
    ]
  },
  members: {
    title: 'Members',
    endpoint: 'members',
    pk: 'MEMBERID',
    columns: [
      { key: 'MEMBERID', label: 'ID' },
      { key: 'MEMBERNAME', label: 'Name' },
      { key: 'EMAIL', label: 'Email' },
      { key: 'PHONE', label: 'Phone' },
      { key: 'MEMBERTYPE', label: 'Type' },
      { key: 'DATEJOINED', label: 'Date Joined' }
    ],
    form: [
      { key: 'MEMBERNAME', label: 'Full Name', type: 'text', required: true },
      { key: 'ADDRESS', label: 'Address', type: 'text' },
      { key: 'PHONE', label: 'Phone', type: 'text' },
      { key: 'EMAIL', label: 'Email', type: 'text' },
      { key: 'MEMBERTYPE', label: 'Member Type', type: 'select', options: ['Regular','Premium','Student'] },
      { key: 'DATEJOINED', label: 'Date Joined (YYYY-MM-DD)', type: 'text' }
    ]
  },
  loans: {
    title: 'Loans',
    endpoint: 'loans',
    pk: 'LOANID',
    columns: [
      { key: 'LOANID', label: 'ID' },
      { key: 'COPYID', label: 'Copy ID' },
      { key: 'MEMBERID', label: 'Member ID' },
      { key: 'ISSUEDATE', label: 'Issue Date' },
      { key: 'DUEDATE', label: 'Due Date' },
      { key: 'RETURNDATE', label: 'Return Date' },
      { key: 'STATUS', label: 'Status' }
    ],
    form: [
      { key: 'COPYID', label: 'Copy ID', type: 'number', required: true },
      { key: 'MEMBERID', label: 'Member ID', type: 'number', required: true },
      { key: 'LIBRARIANID', label: 'Librarian ID', type: 'number' },
      { key: 'ISSUEDATE', label: 'Issue Date (YYYY-MM-DD)', type: 'text', required: true },
      { key: 'DUEDATE', label: 'Due Date (YYYY-MM-DD)', type: 'text', required: true },
      { key: 'RETURNDATE', label: 'Return Date (YYYY-MM-DD)', type: 'text' },
      { key: 'STATUS', label: 'Status', type: 'select', required: true, options: ['Active','Returned','Overdue'] }
    ]
  },
  reservations: {
    title: 'Reservations',
    endpoint: 'reservations',
    pk: 'RESERVATIONID',
    columns: [
      { key: 'RESERVATIONID', label: 'ID' },
      { key: 'MEMBERID', label: 'Member ID' },
      { key: 'BOOKID', label: 'Book ID' },
      { key: 'RESERVATIONDATE', label: 'Date' },
      { key: 'STATUS', label: 'Status' }
    ],
    form: [
      { key: 'MEMBERID', label: 'Member ID', type: 'number', required: true },
      { key: 'BOOKID', label: 'Book ID', type: 'number', required: true },
      { key: 'RESERVATIONDATE', label: 'Date (YYYY-MM-DD)', type: 'text' },
      { key: 'STATUS', label: 'Status', type: 'select', required: true, options: ['Pending','Fulfilled','Cancelled'] }
    ]
  },
  fines: {
    title: 'Fines',
    endpoint: 'fines',
    pk: 'FINEID',
    columns: [
      { key: 'FINEID', label: 'ID' },
      { key: 'LOANID', label: 'Loan ID' },
      { key: 'MEMBERID', label: 'Member ID' },
      { key: 'FINEAMOUNT', label: 'Amount' },
      { key: 'FINEDATE', label: 'Fine Date' },
      { key: 'FINESTATUS', label: 'Status' }
    ],
    form: [
      { key: 'LOANID', label: 'Loan ID', type: 'number', required: true },
      { key: 'MEMBERID', label: 'Member ID', type: 'number', required: true },
      { key: 'FINEAMOUNT', label: 'Amount', type: 'number', required: true },
      { key: 'FINEDATE', label: 'Fine Date (YYYY-MM-DD)', type: 'text' },
      { key: 'FINESTATUS', label: 'Status', type: 'select', required: true, options: ['Unpaid','Paid'] }
    ]
  },
  payments: {
    title: 'Payments',
    endpoint: 'payments',
    pk: 'PAYMENTID',
    columns: [
      { key: 'PAYMENTID', label: 'ID' },
      { key: 'FINEID', label: 'Fine ID' },
      { key: 'MEMBERID', label: 'Member ID' },
      { key: 'AMOUNT', label: 'Amount' },
      { key: 'PAYMENTDATE', label: 'Date' },
      { key: 'PAYMENTMODE', label: 'Mode' }
    ],
    form: [
      { key: 'FINEID', label: 'Fine ID', type: 'number', required: true },
      { key: 'MEMBERID', label: 'Member ID', type: 'number' },
      { key: 'AMOUNT', label: 'Amount', type: 'number', required: true },
      { key: 'PAYMENTDATE', label: 'Payment Date (YYYY-MM-DD)', type: 'text' },
      { key: 'PAYMENTMODE', label: 'Payment Mode', type: 'select', options: ['Cash','Credit Card','Debit Card','Online Transfer'] }
    ]
  },
  librarians: {
    title: 'Librarians',
    endpoint: 'librarians',
    pk: 'LIBRARIANID',
    columns: [
      { key: 'LIBRARIANID', label: 'ID' },
      { key: 'LIBRARIANNAME', label: 'Name' },
      { key: 'PHONE', label: 'Phone' },
      { key: 'EMAIL', label: 'Email' },
      { key: 'BRANCHID', label: 'Branch ID' }
    ],
    form: [
      { key: 'LIBRARIANNAME', label: 'Full Name', type: 'text', required: true },
      { key: 'PHONE', label: 'Phone', type: 'text' },
      { key: 'EMAIL', label: 'Email', type: 'text' },
      { key: 'BRANCHID', label: 'Branch ID', type: 'number' }
    ]
  },
  'library-branches': {
    title: 'Library Branches',
    endpoint: 'library-branches',
    pk: 'BRANCHID',
    columns: [
      { key: 'BRANCHID', label: 'ID' },
      { key: 'BRANCHNAME', label: 'Name' },
      { key: 'ADDRESS', label: 'Address' },
      { key: 'PHONE', label: 'Phone' }
    ],
    form: [
      { key: 'BRANCHNAME', label: 'Branch Name', type: 'text', required: true },
      { key: 'ADDRESS', label: 'Address', type: 'text' },
      { key: 'PHONE', label: 'Phone', type: 'text' }
    ]
  },
  'book-locations': {
    title: 'Book Locations',
    endpoint: 'book-locations',
    pk: 'LOCATIONID',
    columns: [
      { key: 'LOCATIONID', label: 'ID' },
      { key: 'LOCATIONNAME', label: 'Location Name' },
      { key: 'DESCRIPTION', label: 'Description' },
      { key: 'BRANCHID', label: 'Branch ID' }
    ],
    form: [
      { key: 'LOCATIONNAME', label: 'Location Name', type: 'text', required: true },
      { key: 'DESCRIPTION', label: 'Description', type: 'text' },
      { key: 'BRANCHID', label: 'Branch ID', type: 'number' }
    ]
  },
  suppliers: {
    title: 'Suppliers',
    endpoint: 'suppliers',
    pk: 'SUPPLIERID',
    columns: [
      { key: 'SUPPLIERID', label: 'ID' },
      { key: 'SUPPLIERNAME', label: 'Name' },
      { key: 'PHONE', label: 'Phone' },
      { key: 'EMAIL', label: 'Email' }
    ],
    form: [
      { key: 'SUPPLIERNAME', label: 'Supplier Name', type: 'text', required: true },
      { key: 'PHONE', label: 'Phone', type: 'text' },
      { key: 'EMAIL', label: 'Email', type: 'text' }
    ]
  },
  'written-by': {
    title: 'Written By',
    endpoint: 'written-by',
    pk: ['BOOKID', 'AUTHORID'],
    columns: [
      { key: 'BOOKID', label: 'Book ID' },
      { key: 'AUTHORID', label: 'Author ID' }
    ],
    form: [
      { key: 'BOOKID', label: 'Book ID', type: 'number', required: true },
      { key: 'AUTHORID', label: 'Author ID', type: 'number', required: true }
    ]
  }
};
