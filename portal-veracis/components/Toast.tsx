'use client';

import { useStore } from '@/lib/store';

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;

  return (
    <div
      className="toast-anim"
      style={{
        position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)',
        background:'#0A4A40', color:'#FFFFFF', padding:'13px 22px',
        borderRadius:12, fontSize:14, fontWeight:700,
        boxShadow:'0 10px 30px rgba(10,74,64,0.35)',
        zIndex:60, whiteSpace:'nowrap', maxWidth:'90vw',
      }}
    >
      {toast}
    </div>
  );
}
