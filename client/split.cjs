const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/ASUS/OneDrive/Desktop/MINI_PRJ/YASH-GROUP-ERP-MODULAR/client/src';
const appPath = path.join(srcDir, 'App.jsx');
const lines = fs.readFileSync(appPath, 'utf8').split('\n');

function getRange(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

// Ensure directories
['components/common', 'components/layout', 'components/modals', 'views'].forEach(d => {
  fs.mkdirSync(path.join(srcDir, d), { recursive: true });
});

// 1. Common
fs.writeFileSync(path.join(srcDir, 'components/common/Input.jsx'), 'export default ' + getRange(164, 219));
fs.writeFileSync(path.join(srcDir, 'components/common/PageHeading.jsx'), 'import Icon from "./Icon";\nexport default ' + getRange(220, 242));
fs.writeFileSync(path.join(srcDir, 'components/common/Section.jsx'), 'export default ' + getRange(243, 267));
fs.writeFileSync(path.join(srcDir, 'components/common/Progress.jsx'), 'export default ' + getRange(1684, 1694));
fs.writeFileSync(path.join(srcDir, 'components/common/Detail.jsx'), 'export default ' + getRange(2015, 2022));
fs.writeFileSync(path.join(srcDir, 'components/common/Modal.jsx'), 'export default ' + getRange(3297, 3322));

// Common headers for views
const commonViewImports = `import { useState, useMemo } from "react";
import Icon from "../components/common/Icon";
import Metric from "../components/common/Metric";
import Status from "../components/common/Status";
import Table from "../components/common/Table";
import Empty from "../components/common/Empty";
import PageHeading from "../components/common/PageHeading";
import Section from "../components/common/Section";
import Progress from "../components/common/Progress";
import Detail from "../components/common/Detail";
import { fmtDate, fmtDateTime, dateInputValue } from "../utils/formatters";
`;

// Views
fs.writeFileSync(path.join(srcDir, 'views/Dashboard.jsx'), commonViewImports + '\nexport default ' + getRange(1479, 1683));
fs.writeFileSync(path.join(srcDir, 'views/OrderList.jsx'), commonViewImports + '\nexport default ' + getRange(1695, 1877));
fs.writeFileSync(path.join(srcDir, 'views/OrderDetails.jsx'), commonViewImports + '\nexport default ' + getRange(1878, 2014));
fs.writeFileSync(path.join(srcDir, 'views/Planning.jsx'), commonViewImports + '\n' + getRange(2023, 2027) + '\nexport default ' + getRange(2028, 2352));
fs.writeFileSync(path.join(srcDir, 'views/Tracking.jsx'), commonViewImports + '\nexport default ' + getRange(2353, 2509));
fs.writeFileSync(path.join(srcDir, 'views/Workers.jsx'), commonViewImports + '\nexport default ' + getRange(2510, 2587));
fs.writeFileSync(path.join(srcDir, 'views/Machines.jsx'), commonViewImports + '\nexport default ' + getRange(2588, 2661));
fs.writeFileSync(path.join(srcDir, 'views/Materials.jsx'), commonViewImports + '\nexport default ' + getRange(2662, 2737));
fs.writeFileSync(path.join(srcDir, 'views/Completion.jsx'), commonViewImports + '\nexport default ' + getRange(2738, 2803));
fs.writeFileSync(path.join(srcDir, 'views/Inspections.jsx'), commonViewImports + '\nexport default ' + getRange(2804, 2892));
fs.writeFileSync(path.join(srcDir, 'views/Defects.jsx'), commonViewImports + '\nexport default ' + getRange(2893, 2991));
fs.writeFileSync(path.join(srcDir, 'views/Rework.jsx'), commonViewImports + '\nexport default ' + getRange(2992, 3084));
fs.writeFileSync(path.join(srcDir, 'views/QualityReports.jsx'), commonViewImports + '\nexport default ' + getRange(3085, 3219));
fs.writeFileSync(path.join(srcDir, 'views/BomList.jsx'), commonViewImports + '\nexport default ' + getRange(3220, 3296));

console.log('All views and common components generated successfully!');
