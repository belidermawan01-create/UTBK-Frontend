import fs from 'fs';
import path from 'path';

const emojiToIconMap = {
  '✦': 'Sparkles',
  '📊': 'BarChart',
  '📝': 'FileText',
  '👥': 'Users',
  '🌍': 'Globe',
  '🚪': 'LogOut',
  '🔍': 'Search',
  '🔔': 'Bell',
  '🧠': 'Brain',
  '🔬': 'Microscope',
  '📖': 'BookOpen',
  '✅': 'CheckCircle',
  '❌': 'XCircle',
  '🚀': 'Rocket',
  '💡': 'Lightbulb',
  '✓': 'Check',
  '✕': 'X',
  '🎓': 'GraduationCap',
  '🎯': 'Target',
  '🏛️': 'Landmark',
  '🏅': 'Medal',
  '📋': 'ClipboardList',
  '▲': 'ChevronUp',
  '▼': 'ChevronDown',
  '📅': 'Calendar',
  '📧': 'Mail',
  '🏆': 'Trophy',
  '⚙️': 'Settings',
  '📚': 'Book',
  '🔢': 'Hash',
  '📈': 'TrendingUp',
  '✓': 'Check',
  '✕': 'X',
};

const iconElements = {
  '✦': '<Sparkles size={16} />',
  '📊': '<BarChart size={20} />',
  '📝': '<FileText size={20} />',
  '👥': '<Users size={20} />',
  '🌍': '<Globe size={20} />',
  '🚪': '<LogOut size={20} />',
  '🔍': '<Search size={20} />',
  '🔔': '<Bell size={20} />',
  '🧠': '<Brain size={20} />',
  '🔬': '<Microscope size={20} />',
  '📖': '<BookOpen size={20} />',
  '✅': '<CheckCircle size={20} />',
  '❌': '<XCircle size={20} />',
  '🚀': '<Rocket size={20} />',
  '💡': '<Lightbulb size={20} />',
  '✓': '<Check size={16} />',
  '✕': '<X size={16} />',
  '🎓': '<GraduationCap size={20} />',
  '🎯': '<Target size={20} />',
  '🏛️': '<Landmark size={20} />',
  '🏅': '<Medal size={20} />',
  '📋': '<ClipboardList size={20} />',
  '▲': '<ChevronUp size={16} />',
  '▼': '<ChevronDown size={16} />',
  '📅': '<Calendar size={20} />',
  '📧': '<Mail size={20} />',
  '🏆': '<Trophy size={20} />',
  '⚙️': '<Settings size={20} />',
  '📚': '<Book size={20} />',
  '🔢': '<Hash size={20} />',
  '📈': '<TrendingUp size={20} />',
};

// Also handle cases where emojis are in strings.
// If it's a JSX string like `emoji: '🧠'`, it should be `emoji: <Brain size={20} />`

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let importedIcons = new Set();
  
  // Extract all emojis in the file
  const foundEmojis = new Set();
  for (const [emoji, iconName] of Object.entries(emojiToIconMap)) {
    if (content.includes(emoji)) {
      foundEmojis.add(emoji);
      importedIcons.add(iconName);
    }
  }

  if (foundEmojis.size === 0) return;

  // Replace emojis
  for (const emoji of foundEmojis) {
    const iconName = emojiToIconMap[emoji];
    const iconElem = iconElements[emoji];
    
    // Replace in strings or JSX elements.
    // e.g. `'🧠'` -> `<Brain size={20} />`
    // e.g. `>✦<` -> `><Sparkles size={16} /><`
    
    // We can do global replace but we have to be careful with strings.
    // If it's inside quotes, e.g. `icon: '📊'`, we want to replace the whole string `'📊'` with `<BarChart size={20} />`.
    const regexQuotesSingle = new RegExp(`'${emoji}'`, 'g');
    content = content.replace(regexQuotesSingle, iconElem);
    
    const regexQuotesDouble = new RegExp(`"${emoji}"`, 'g');
    content = content.replace(regexQuotesDouble, iconElem);
    
    // Also `✓ Benar` -> `<Check size={16} className="inline mr-1" /> Benar`
    // Just simple replace `emoji` -> `iconElem`
    const regexFree = new RegExp(emoji, 'g');
    content = content.replace(regexFree, iconElem);
  }

  // Inject import statement
  if (importedIcons.size > 0 && !content.includes('lucide-react')) {
    const importStmt = `import { ${Array.from(importedIcons).join(', ')} } from 'lucide-react';\n`;
    // Find the last import statement or put at top
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + importStmt + content.slice(endOfLine + 1);
    } else {
      content = importStmt + content;
    }
  } else if (importedIcons.size > 0 && content.includes('lucide-react')) {
      // It already imports lucide react. Let's merge if possible, or just add another import.
      const importStmt = `import { ${Array.from(importedIcons).join(', ')} } from 'lucide-react';\n`;
      content = importStmt + content;
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

scanDir(path.join(process.cwd(), 'src'));
