import { ST } from '@/lib/types';
import type { Status } from '@/lib/types';

interface Props {
  status: Status;
  size?: 'sm' | 'md';
}

export default function StatusPill({ status, size = 'md' }: Props) {
  const st = ST[status];
  const padding = size === 'sm' ? '4px 11px' : '5px 11px';
  const fontSize = size === 'sm' ? 12 : 12;

  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding, borderRadius:999,
      background: st.bg, color: st.color,
      fontSize, fontWeight:800,
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:st.color, flexShrink:0 }} />
      {st.label}
    </span>
  );
}
