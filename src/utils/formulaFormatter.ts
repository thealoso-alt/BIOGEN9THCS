/**
 * Utility to format biology, genetics, and chemistry formulas cleanly
 * with proper unicode superscripts and subscripts.
 * Examples:
 *   10^-4 -> 10⁻⁴
 *   10^-6 -> 10⁻⁶
 *   H3PO4 -> H₃PO₄
 *   PO4³⁻ / PO4^3- -> PO₄³⁻ (fixing un-subscripted 4)
 *   C5H10O4 -> C₅H₁₀O₄
 *   C5H10O5 -> C₅H₁₀O₅
 *   C6H12O6 -> C₆H₁₂O₆
 *   2^k -> 2ᵏ
 *   2^n -> 2ⁿ
 *   4^n -> 4ⁿ
 *   4^3 -> 4³
 *   2^(k-1) -> 2ᵏ⁻¹
 *   2^k - 1 -> 2ᵏ - 1
 *   -NH2 -> -NH₂
 */

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', 'k': 'ᵏ', 'n': 'ⁿ', 'm': 'ᵐ',
  'x': 'ˣ', 'y': 'ʸ', '(': '⁽', ')': '⁾',
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋',
};

export function formatBioFormula(text: string): string {
  if (!text) return '';

  let res = text;

  // 1. Common chemical compounds & phosphate ions in genetics
  // Fix un-subscripted 4 in PO4³⁻ or PO4^3- or PO4^3+
  res = res.replace(/PO4³⁻/g, 'PO₄³⁻');
  res = res.replace(/PO4\^3\-/g, 'PO₄³⁻');
  res = res.replace(/PO4\^3\+/g, 'PO₄³⁺');
  res = res.replace(/PO4³\+/g, 'PO₄³⁺');
  res = res.replace(/PO4/g, 'PO₄');

  // Phosphoric acid and derivatives
  res = res.replace(/H3PO4/g, 'H₃PO₄');
  res = res.replace(/H2PO4\-/g, 'H₂PO₄⁻');
  res = res.replace(/HPO4\^2\-/g, 'HPO₄²⁻');
  res = res.replace(/HPO4²⁻/g, 'HPO₄²⁻');

  // Sugars and organic compounds
  res = res.replace(/C5H10O4/g, 'C₅H₁₀O₄');
  res = res.replace(/C5H10O5/g, 'C₅H₁₀O₅');
  res = res.replace(/C6H12O6/g, 'C₆H₁₂O₆');
  res = res.replace(/C12H22O11/g, 'C₁₂H₂₂O₁₁');

  // Small inorganic molecules
  res = res.replace(/\bH2O\b/g, 'H₂O');
  res = res.replace(/\bCO2\b/g, 'CO₂');
  res = res.replace(/\bO2\b/g, 'O₂');
  res = res.replace(/\bN2\b/g, 'N₂');
  res = res.replace(/-NH2/g, '-NH₂');
  res = res.replace(/\bNH3\b/g, 'NH₃');
  res = res.replace(/\bNH4\+/g, 'NH₄⁺');

  // 2. Scientific notations like 10^-4, 10^-6, 10^-7, 10^3, 10^4
  res = res.replace(/10\^-(\d+)/g, (_, exp) => {
    const sup = exp.split('').map((d: string) => SUPERSCRIPT_MAP[d] || d).join('');
    return `10⁻${sup}`;
  });

  res = res.replace(/10\^(\d+)/g, (_, exp) => {
    const sup = exp.split('').map((d: string) => SUPERSCRIPT_MAP[d] || d).join('');
    return `10${sup}`;
  });

  // 3. Genetics math exponents: 2^k, 2^n, 2^(k-1), 4^n, 4^3, 2^3, 2^4, etc.
  res = res.replace(/2\^\((k\s*-\s*1)\)/g, '2ᵏ⁻¹');
  res = res.replace(/2\^k/g, '2ᵏ');
  res = res.replace(/2\^n/g, '2ⁿ');
  res = res.replace(/2\^x/g, '2ˣ');
  res = res.replace(/4\^n/g, '4ⁿ');
  res = res.replace(/4\^3/g, '4³');
  res = res.replace(/3\^n/g, '3ⁿ');
  res = res.replace(/3\^k/g, '3ᵏ');

  // 2 raised to any number: 2^1, 2^2, 2^3 ... 2^10
  res = res.replace(/2\^(\d+)/g, (_, d) => {
    const sup = d.split('').map((c: string) => SUPERSCRIPT_MAP[c] || c).join('');
    return `2${sup}`;
  });

  // 4 raised to any number: 4^2, 4^4
  res = res.replace(/4\^(\d+)/g, (_, d) => {
    const sup = d.split('').map((c: string) => SUPERSCRIPT_MAP[c] || c).join('');
    return `4${sup}`;
  });

  return res;
}
