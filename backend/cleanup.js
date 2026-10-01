const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.qpnsqwlxzwqtdxsrwjff:Kartheek%401606@aws-0-ap-south-1.pooler.supabase.com:6543/postgres' });

async function clean() {
  try {
    console.log('Starting cleanup...');
    // 1. Delete rows where critical fields are just spaces or empty
    await pool.query("DELETE FROM BOOK WHERE TRIM(Title) = '' OR Title IS NULL");
    await pool.query("DELETE FROM AUTHOR WHERE TRIM(AuthorName) = '' OR AuthorName IS NULL");
    await pool.query("DELETE FROM CATEGORY WHERE TRIM(CategoryName) = '' OR CategoryName IS NULL");
    await pool.query("DELETE FROM PUBLISHER WHERE TRIM(PublisherName) = '' OR PublisherName IS NULL");
    await pool.query("DELETE FROM MEMBER WHERE TRIM(MemberName) = '' OR MemberName IS NULL");

    // 2. Fill empty spaces with 'Unknown' or 'N/A' to make it look professional
    await pool.query("UPDATE BOOK SET ISBN = 'N/A-' || BookID WHERE TRIM(ISBN) = '' OR ISBN IS NULL");
    await pool.query("UPDATE BOOK SET Edition = '1st' WHERE TRIM(Edition) = '' OR Edition IS NULL");
    
    await pool.query("UPDATE AUTHOR SET Nationality = 'Unknown' WHERE TRIM(Nationality) = '' OR Nationality IS NULL");
    await pool.query("UPDATE AUTHOR SET Biography = 'Biography not available.' WHERE TRIM(Biography) = '' OR Biography IS NULL");
    
    await pool.query("UPDATE CATEGORY SET Description = 'Standard Category' WHERE TRIM(Description) = '' OR Description IS NULL");
    
    await pool.query("UPDATE PUBLISHER SET Phone = 'N/A' WHERE TRIM(Phone) = '' OR Phone IS NULL");
    await pool.query("UPDATE PUBLISHER SET Email = 'N/A' WHERE TRIM(Email) = '' OR Email IS NULL");
    await pool.query("UPDATE PUBLISHER SET Address = 'N/A' WHERE TRIM(Address) = '' OR Address IS NULL");
    
    await pool.query("UPDATE MEMBER SET Address = 'Not Provided' WHERE TRIM(Address) = '' OR Address IS NULL");
    await pool.query("UPDATE MEMBER SET Phone = 'Not Provided' WHERE TRIM(Phone) = '' OR Phone IS NULL");
    await pool.query("UPDATE MEMBER SET Email = 'Not Provided' WHERE TRIM(Email) = '' OR Email IS NULL");
    await pool.query("UPDATE MEMBER SET MemberType = 'Regular' WHERE TRIM(MemberType) = '' OR MemberType IS NULL");
    
    await pool.query("UPDATE BOOK_COPY SET AccessionNo = 'N/A-' || CopyID WHERE TRIM(AccessionNo) = '' OR AccessionNo IS NULL");
    await pool.query("UPDATE BOOK_COPY SET Status = 'Available' WHERE TRIM(Status) = '' OR Status IS NULL");

    console.log('Cleanup successful');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
clean();
