import { html } from '../../lib/html.js';
import UserAvatar from './UserAvatar.js';

export default function AvatarGroup({ users, max = 4, size = 'sm' }) {
  const visible = users.slice(0, max);
  const extra = users.length - max;
  const px = { xs: 24, sm: 28, md: 36, lg: 44 }[size] || 28;
  return html`
    <div style=${{ display: 'flex', alignItems: 'center' }}>
      ${visible.map((user, i) => html`
        <div key=${user.id} style=${{ marginLeft: i === 0 ? 0 : -8, zIndex: visible.length - i, position: 'relative' }}>
          <div style=${{ borderRadius: '50%', border: '2px solid #fff' }}>
            <${UserAvatar} user=${user} size=${size} />
          </div>
        </div>
      `)}
      ${extra > 0 && html`
        <div style=${{ marginLeft: -8, zIndex: 0, width: px, height: px, borderRadius: '50%', background: '#E2E2EC', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#6B6B80' }}>
          +${extra}
        </div>
      `}
    </div>
  `;
}
