import { html } from '../../lib/html.js';
import { Search, X } from 'lucide-react';

const inputStyle = {
  height: 36, border: '1px solid #E5E7EB', borderRadius: 8,
  background: '#fff', color: '#111827', outline: 'none',
  fontFamily: 'Host Grotesk, sans-serif', fontSize: 13,
  transition: 'border-color 0.15s',
};

/**
 * FilterBar — horizontal search + filter strip for list pages.
 *
 * Props:
 *   search      string           current search text
 *   onSearch    fn(string)       called on input change
 *   filters     Array<{
 *                 label: string,
 *                 value: string,
 *                 onChange: fn(string),
 *                 options: Array<{label:string, value:string}>
 *               }>               optional select filters (rendered as <select>)
 *   placeholder string           search placeholder (default 'Buscar…')
 *   count       number|null      if provided, shows "N resultados" badge
 */
export default function FilterBar({ search = '', onSearch, filters = [], placeholder = 'Buscar…', count }) {
  const hasActive = search.length > 0 || filters.some(f => f.value !== '');

  function clearAll() {
    onSearch?.('');
    filters.forEach(f => f.onChange(''));
  }

  return html`
    <div style=${{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <!-- Search input -->
      <div style=${{ position: 'relative', flexShrink: 0 }}>
        <span style=${{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex', pointerEvents: 'none' }}>
          <${Search} size=${14} strokeWidth=${1.5} />
        </span>
        <input
          type="text"
          value=${search}
          placeholder=${placeholder}
          onInput=${e => onSearch?.(e.target.value)}
          style=${{ ...inputStyle, paddingLeft: 32, paddingRight: search ? 28 : 12, width: 220 }}
          onFocus=${e => { e.currentTarget.style.borderColor = '#0046F3'; }}
          onBlur=${e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
        />
        ${search && html`
          <button
            onClick=${() => onSearch?.('')}
            style=${{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', display: 'flex' }}>
            <${X} size=${12} strokeWidth=${2} />
          </button>
        `}
      </div>

      <!-- Select filters -->
      ${filters.map((f, i) => html`
        <select
          key=${i}
          value=${f.value}
          onChange=${e => f.onChange(e.target.value)}
          style=${{ ...inputStyle, padding: '0 10px', cursor: 'pointer', color: f.value ? '#111827' : '#6B7280', borderColor: f.value ? '#0046F3' : '#E5E7EB' }}
        >
          <option value="">${f.label}</option>
          ${f.options.map(o => html`<option key=${o.value} value=${o.value}>${o.label}</option>`)}
        </select>
      `)}

      <!-- Clear all -->
      ${hasActive && html`
        <button
          onClick=${clearAll}
          style=${{ height: 36, padding: '0 12px', border: 'none', borderRadius: 8, background: '#F3F4F6', color: '#6B7280', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'Host Grotesk, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
          <${X} size=${12} strokeWidth=${2} /> Limpiar
        </button>
      `}

      <!-- Result count -->
      ${count != null && html`
        <span style=${{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
          ${count} resultado${count !== 1 ? 's' : ''}
        </span>
      `}
    </div>
  `;
}
