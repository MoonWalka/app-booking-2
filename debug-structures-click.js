// Debug script to test structure click functionality
console.log('🔍 Debug script for structure click functionality');

// Test if structures list page exists and data is loaded
if (window.location.pathname.includes('/structures')) {
  console.log('✅ On structures page');
  
  // Check if structures data is loaded
  setTimeout(() => {
    const tableRows = document.querySelectorAll('tr[style*="cursor: pointer"], .clickableRow');
    console.log('📊 Found clickable rows:', tableRows.length);
    
    if (tableRows.length > 0) {
      console.log('✅ Clickable rows found:', tableRows);
      
      // Test clicking the first row
      const firstRow = tableRows[0];
      console.log('🎯 Testing click on first row:', firstRow);
      
      // Add a visual indicator
      firstRow.style.border = '2px solid red';
      firstRow.style.backgroundColor = 'yellow';
      
      // Test the click handler
      const originalHandler = firstRow.onclick;
      console.log('🔗 Original click handler:', originalHandler);
      
      // Override click handler to test
      firstRow.onclick = function(e) {
        console.log('🖱️ Click detected!', e);
        if (originalHandler) {
          console.log('🔄 Calling original handler');
          originalHandler.call(this, e);
        } else {
          console.log('❌ No original handler found');
        }
      };
      
    } else {
      console.log('❌ No clickable rows found');
      
      // Check for any table rows
      const allRows = document.querySelectorAll('tr');
      console.log('📋 All table rows found:', allRows.length);
      allRows.forEach((row, index) => {
        console.log(`Row ${index}:`, {
          innerHTML: row.innerHTML.substring(0, 100),
          style: row.style.cursor,
          onclick: row.onclick,
          classList: row.classList
        });
      });
    }
  }, 2000);
} else {
  console.log('❌ Not on structures page. Current path:', window.location.pathname);
}