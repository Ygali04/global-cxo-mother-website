const fs = require('fs');
const path = require('path');

const files = [
    'src/layouts/headers/menu/OffCanvas.tsx',
    'src/layouts/footers/FooterTwo.tsx',
    'src/layouts/footers/FooterOne.tsx',
    'src/layouts/footers/FooterFour.tsx',
    'src/layouts/footers/FooterFive.tsx',
    'src/components/contact/ContactArea.tsx',
    'src/app/contact/page.tsx',
    'src/app/about/page.tsx',
    'package.json',
    'package-lock.json',
    'src/assets/scss/components/_theme.scss',
    'src/assets/css/main.css',
    'src/assets/css/default-icons.css'
];

files.forEach(file => {
    const fullPath = path.join('c:\\Users\\himan\\Desktop\\10exNextgen', file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/beeko/g, '100exNextGen');
        content = content.replace(/Beeko/g, '100exNextGen');
        content = content.replace(/100exNextGenAgency/g, '100exNextGen Agency');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${file}`);
    }
});
