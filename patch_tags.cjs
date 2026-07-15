const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const hintDivRegex = /<div>\s*<label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Hint \(Optional\)<\/label>[\s\S]*?<\/div>/;
const hintDivMatch = content.match(hintDivRegex);
if (hintDivMatch && !content.includes('formData.tags')) {
  const tagsInput = `
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tags (comma separated)</label>
              <input 
                type="text"
                value={(formData.tags || []).join(', ')} 
                onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                placeholder="e.g. motion, scalar, basics"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
`;
  content = content.replace(hintDivMatch[0], hintDivMatch[0] + tagsInput);
}

fs.writeFileSync('src/components/AdminView.tsx', content);
