import React, { useState } from 'react'

interface Props {
  text: string
}

export default function Tooltip({ text }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <span style={styles.wrap}>
      <span
        style={styles.icon}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        title={text}
      >
        ?
      </span>
      {visible && (
        <span style={styles.bubble}>{text}</span>
      )}
    </span>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'relative',
    display: 'inline-block',
    marginRight: 4,
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#e2e8f0',
    color: '#475569',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',
  },
  bubble: {
    position: 'absolute',
    top: '120%',
    right: 0,
    background: '#1e293b',
    color: '#f8fafc',
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 1.6,
    width: 240,
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    whiteSpace: 'pre-wrap',
  },
}
