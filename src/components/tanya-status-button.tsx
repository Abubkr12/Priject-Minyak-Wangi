"use client";

import { MessageSquare } from "lucide-react";

export function TanyaStatusButton() {
  return (
    <button 
      onClick={() => {
        document.getElementById('chatbot-toggle')?.click();
      }} 
      className="btn btn-ghost" 
      style={{ 
        padding: '0 12px', 
        height: '36px', 
        fontSize: '0.85rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--c-ink)'
      }}
    >
      <MessageSquare size={16} /> Tanya Status
    </button>
  );
}
