const puppeteer = require('puppeteer');

async function testTagsSystem() {
    let browser;
    try {
        console.log('🚀 Starting browser...');
        browser = await puppeteer.launch({ 
            headless: false, // Set to true to run in background
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Listen for console messages
        page.on('console', msg => {
            console.log('Browser Console:', msg.text());
        });
        
        // Listen for errors
        page.on('pageerror', error => {
            console.error('Page Error:', error.message);
        });
        
        console.log('📱 Navigating to application...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        // Wait for login or check if already logged in
        console.log('🔐 Checking authentication...');
        await page.waitForTimeout(3000);
        
        // Try to navigate to tags page
        console.log('🏷️ Navigating to tags page...');
        await page.goto('http://localhost:3000/contacts/tags', { waitUntil: 'networkidle0' });
        
        // Wait for page to load
        await page.waitForTimeout(2000);
        
        // Check if we can see the 4 sections
        console.log('🔍 Checking for the 4 sections...');
        const sections = await page.evaluate(() => {
            const menuItems = document.querySelectorAll('[class*="menuItem"]');
            return Array.from(menuItems).map(item => ({
                text: item.textContent.trim(),
                active: item.classList.toString().includes('Active')
            }));
        });
        
        console.log('Found sections:', sections);
        
        // Check if "Activités" section is visible and click it
        const activitesButton = await page.$('div[class*="menuItem"]:has-text("Activités")');
        if (activitesButton) {
            console.log('✅ Found "Activités" section, clicking...');
            await activitesButton.click();
            await page.waitForTimeout(1000);
        } else {
            // Try alternative selector
            await page.evaluate(() => {
                const menuItems = document.querySelectorAll('[class*="menuItem"]');
                for (let item of menuItems) {
                    if (item.textContent.includes('Activités')) {
                        item.click();
                        return;
                    }
                }
            });
            await page.waitForTimeout(1000);
        }
        
        // Check for hierarchical table
        console.log('📊 Checking for hierarchical table...');
        const tableInfo = await page.evaluate(() => {
            const table = document.querySelector('table');
            if (!table) return { found: false };
            
            const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
            const rows = table.querySelectorAll('tbody tr');
            const rowsData = Array.from(rows).slice(0, 10).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    title: cells[0]?.textContent.trim() || '',
                    count: cells[1]?.textContent.trim() || '',
                    type: cells[2]?.textContent.trim() || ''
                };
            });
            
            return {
                found: true,
                headers,
                rowCount: rows.length,
                sampleRows: rowsData
            };
        });
        
        console.log('Table info:', JSON.stringify(tableInfo, null, 2));
        
        // Check for tags with usage > 0
        console.log('🔢 Looking for tags with usage count > 0...');
        const tagsWithUsage = await page.evaluate(() => {
            const badges = document.querySelectorAll('td .badge');
            const usageTags = [];
            
            badges.forEach(badge => {
                const count = parseInt(badge.textContent.trim());
                if (count > 0) {
                    const row = badge.closest('tr');
                    const titleCell = row?.querySelector('td:first-child');
                    const title = titleCell?.textContent.trim() || '';
                    usageTags.push({
                        title: title,
                        count: count,
                        isClickable: badge.style.cursor === 'pointer' || window.getComputedStyle(badge).cursor === 'pointer'
                    });
                }
            });
            
            return usageTags;
        });
        
        console.log('Tags with usage > 0:', tagsWithUsage);
        
        // Test clicking on a tag with usage > 0
        if (tagsWithUsage.length > 0) {
            console.log('🖱️ Testing click on first tag with usage...');
            const firstTag = tagsWithUsage[0];
            
            await page.evaluate((tagTitle) => {
                const rows = document.querySelectorAll('tbody tr');
                for (let row of rows) {
                    if (row.textContent.includes(tagTitle)) {
                        const badge = row.querySelector('.badge');
                        if (badge && parseInt(badge.textContent) > 0) {
                            badge.click();
                            return true;
                        }
                    }
                }
                return false;
            }, firstTag.title);
            
            await page.waitForTimeout(2000);
            
            // Check if a new tab opened (this might be tricky with puppeteer)
            const pages = await browser.pages();
            console.log(`Number of pages after click: ${pages.length}`);
        }
        
        // Check visual styling
        console.log('🎨 Checking visual styling...');
        const stylingInfo = await page.evaluate(() => {
            const usedTags = [];
            const unusedTags = [];
            
            document.querySelectorAll('tbody tr').forEach(row => {
                const badge = row.querySelector('td .badge');
                const titleSpan = row.querySelector('td span');
                
                if (badge && titleSpan) {
                    const count = parseInt(badge.textContent.trim());
                    const style = window.getComputedStyle(titleSpan);
                    
                    const tagInfo = {
                        title: titleSpan.textContent.trim(),
                        count: count,
                        color: style.color,
                        textDecoration: style.textDecoration,
                        cursor: style.cursor
                    };
                    
                    if (count > 0) {
                        usedTags.push(tagInfo);
                    } else {
                        unusedTags.push(tagInfo);
                    }
                }
            });
            
            return { usedTags: usedTags.slice(0, 5), unusedTags: unusedTags.slice(0, 5) };
        });
        
        console.log('Styling info:', JSON.stringify(stylingInfo, null, 2));
        
        // Test other sections
        console.log('🔄 Testing other sections...');
        const sectionsToTest = ['Genres', 'Réseaux', 'Mots-clés'];
        
        for (const sectionName of sectionsToTest) {
            console.log(`Testing ${sectionName} section...`);
            
            await page.evaluate((section) => {
                const menuItems = document.querySelectorAll('[class*="menuItem"]');
                for (let item of menuItems) {
                    if (item.textContent.includes(section)) {
                        item.click();
                        return;
                    }
                }
            }, sectionName);
            
            await page.waitForTimeout(1000);
            
            const sectionData = await page.evaluate(() => {
                const table = document.querySelector('table');
                if (!table) return { found: false };
                
                const rows = table.querySelectorAll('tbody tr');
                return {
                    found: true,
                    rowCount: rows.length,
                    hasData: rows.length > 0
                };
            });
            
            console.log(`${sectionName} section:`, sectionData);
        }
        
        console.log('✅ Tags system testing completed!');
        
        // Keep browser open for manual inspection
        console.log('🔍 Browser will stay open for 30 seconds for manual inspection...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Check if puppeteer is available
try {
    require('puppeteer');
    console.log('📋 Testing Tags System');
    console.log('='.repeat(50));
    testTagsSystem();
} catch (error) {
    console.log('⚠️ Puppeteer not available. Installing...');
    console.log('Run: npm install puppeteer');
    console.log('');
    console.log('📋 Manual Testing Checklist:');
    console.log('='.repeat(50));
    console.log('1. Navigate to http://localhost:3000/contacts/tags');
    console.log('2. Check if you see 4 sections: Activités, Genres, Réseaux, Mots-clés');
    console.log('3. Click on "Activités" and verify hierarchical table with tags');
    console.log('4. Look for tags with usage count > 0 in the "Nbr" column');
    console.log('5. Try clicking on tag names or usage counts (should open new tab)');
    console.log('6. Check styling: used tags should be blue/underlined, unused gray');
    console.log('7. Test other sections (Genres, Réseaux, Mots-clés)');
    console.log('8. Look for any console errors (F12 > Console)');
}