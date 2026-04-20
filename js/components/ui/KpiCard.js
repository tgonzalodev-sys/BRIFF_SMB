import { html } from '../../lib/html.js';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export default function KpiCard({ label, value, subtitle, delta, deltaType, accentColor, sparkline, children }) {
  const deltaColor = deltaType === 'up' ? '#009966' : deltaType === 'down' ? '#FF6467' : '#6B7280';
  const DeltaIcon  = deltaType === 'up' ? TrendingUp : deltaType === 'down' ? TrendingDown : null;
  const sparkColor = accentColor || '#0046F3';
  const sparkData  = sparkline ? sparkline.map(v => ({ v })) : null;

  return html`
    <div
      style=${{ background: '#fff', borderRadius: 12, padding: sparkData ? '20px 24px 12px' : '20px 24px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 6, transition: 'box-shadow 0.15s, transform 0.15s', cursor: 'default' }}
      onMouseEnter=${e => { e.currentTarget.style.boxShadow = '0 4px 8px -2px rgba(16,24,40,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave=${e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style=${{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>${label}</div>
      <div style=${{ fontSize: 26, fontWeight: 700, color: accentColor || '#111827', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>${value}</div>
      ${(subtitle || delta) && html`
        <div style=${{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B7280' }}>
          ${subtitle && html`<span>${subtitle}</span>`}
          ${delta && DeltaIcon && html`
            <span style=${{ color: deltaColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              <${DeltaIcon} size=${12} strokeWidth=${2} /> ${delta}
            </span>
          `}
          ${delta && !DeltaIcon && html`<span style=${{ color: deltaColor, fontWeight: 600 }}>${delta}</span>`}
        </div>
      `}
      ${sparkData && html`
        <div style=${{ marginTop: 6, marginLeft: -4, marginRight: -4 }}>
          <${ResponsiveContainer} width="100%" height=${44}>
            <${LineChart} data=${sparkData}>
              <${Line}
                type="monotone"
                dataKey="v"
                stroke=${sparkColor}
                strokeWidth=${1.5}
                dot=${false}
                strokeOpacity=${0.7}
              />
              <${Tooltip}
                contentStyle=${{ fontSize: 11, padding: '2px 8px', border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff' }}
                itemStyle=${{ color: sparkColor, fontWeight: 600 }}
                labelFormatter=${() => ''}
                formatter=${v => [v, '']}
              />
            </${LineChart}>
          </${ResponsiveContainer}>
        </div>
      `}
      ${children}
    </div>
  `;
}
