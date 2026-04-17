import { html } from '../../lib/html.js';
import { initials, avatarColorFromName } from '../../lib/utils.js';

const SIZES = { xs: { size: 24, font: 10 }, sm: { size: 28, font: 11 }, md: { size: 36, font: 14 }, lg: { size: 44, font: 16 }, xl: { size: 56, font: 20 } };

export default function UserAvatar({ user, size = 'md', title: titleProp }) {
  const { size: px, font } = SIZES[size] || SIZES.md;
  const color = user.avatar_color || avatarColorFromName(user.name);
  return html`
    <div title=${titleProp || user.name} style=${{ width: px, height: px, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: font, fontWeight: 600, flexShrink: 0, userSelect: 'none', cursor: 'default' }}>
      ${initials(user.name)}
    </div>
  `;
}
