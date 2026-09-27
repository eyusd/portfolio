// Just enough LaTeX for the Make 10 solutions: \cdot, \sqrt[n]{…}, \log_{b}, \mod, ^, _, !, ?, |…|.
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

export function latex(src: string): string {
  let i = 0;
  const group = (): string => {
    if (src[i] === '{') {
      let depth = 0, j = i;
      for (; j < src.length; j++) { if (src[j] === '{') depth++; else if (src[j] === '}' && --depth === 0) break; }
      const inner = src.slice(i + 1, j); i = j + 1;
      return latex(inner);
    }
    return esc(src[i++] ?? '');
  };
  let out = '';
  while (i < src.length) {
    const c = src[i]!;
    if (c === '\\') {
      const name = /^\\([a-zA-Z]+)/.exec(src.slice(i))?.[1] ?? '';
      i += name.length + 1;
      if (name === 'cdot') out += ' · ';
      else if (name === 'mod') out += ' mod ';
      else if (name === 'log') out += 'log';
      else if (name === 'sqrt') {
        let n = '';
        if (src[i] === '[') { const j = src.indexOf(']', i); n = src.slice(i + 1, j); i = j + 1; }
        out += `<span class="rt">${n ? `<sup>${esc(n)}</sup>` : ''}√<span class="ov">${group()}</span></span>`;
      } else out += esc(name);
    } else if (c === '^') { i++; out += `<sup>${group()}</sup>`; }
    else if (c === '_') { i++; out += `<sub>${group()}</sub>`; }
    else if (c === '{' ) out += group();
    else if (c === ' ') { out += ' '; i++; }
    else { out += esc(c); i++; }
  }
  return out.replace(/ {2,}/g, ' ');
}
