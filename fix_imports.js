const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');
content = content.replace("import { useOutletContext } from 'react-router-dom';\r\nimport { schemas } from '../../utils/schema';", "");
content = content.replace("import { useOutletContext } from 'react-router-dom';\nimport { schemas } from '../../utils/schema';", "");
content = "import { useOutletContext } from 'react-router-dom';\nimport { schemas } from '../utils/schema';\n" + content;
fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
