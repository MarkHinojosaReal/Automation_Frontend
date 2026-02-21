const fs = require('fs');
const path = require('path');

/**
 * Detects the framework and tech stack of a project.
 */
function analyzeFramework() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('No package.json found. Unable to detect framework.');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const report = {
    framework: 'Unknown',
    styling: 'Unknown',
    language: 'JavaScript',
    isStatic: false
  };

  if (dependencies.react) report.framework = 'React';
  if (dependencies.vue) report.framework = 'Vue';
  if (dependencies.svelte) report.framework = 'Svelte';
  if (dependencies.next) { report.framework = 'Next.js'; report.isStatic = true; }
  if (dependencies.gatsby) { report.framework = 'Gatsby'; report.isStatic = true; }
  
  if (dependencies.tailwindcss) report.styling = 'Tailwind CSS';
  if (dependencies.sass || dependencies['node-sass']) report.styling = 'SASS/SCSS';
  if (dependencies['styled-components']) report.styling = 'Styled Components';
  if (dependencies.emotion) report.styling = 'Emotion';

  if (dependencies.typescript) report.language = 'TypeScript';

  console.log('--- Framework Analysis ---');
  console.log(`Framework: ${report.framework}`);
  console.log(`Styling:   ${report.styling}`);
  console.log(`Language:  ${report.language}`);
  console.log(`Static:    ${report.isStatic}`);
}

analyzeFramework();
