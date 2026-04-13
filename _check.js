const fs = require('fs');
const p = require('path');
const base = p.resolve(__dirname, 'src/pages');
const h = fs.readFileSync(p.join(base, 'Historia.jsx'), 'utf8');
const re = /from\s+['"](\.[^'"]+)['"]/g;
let m;
while ((m = re.exec(h)) !== null) {
  const rel = m[1];
  const full = p.resolve(base, rel);
  const ok = [full + '.jsx', full + '.js'].some(c => fs.existsSync(c));
  console.log(ok ? 'OK  ' : 'MISS', rel);
}
fs.unlinkSync(__filename);
