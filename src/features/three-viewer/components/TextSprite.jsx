import { Html } from '@react-three/drei'

const TextSprite = ({ text, position, buttons = [] }) => {
  return (
    <Html
      position={[position.x, position.y, position.z]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          color: 'white',
          padding: '8px 12px',
          fontFamily: 'Arial',
          fontSize: '14px',
          whiteSpace: 'pre',
          borderRadius: '4px',
          pointerEvents: 'auto',
        }}
      >
        {text}
        {buttons.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontFamily: 'Arial',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = 'rgba(255, 255, 255, 0.3)')
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = 'rgba(255, 255, 255, 0.15)')
                }
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Html>
  )
}

export default TextSprite
