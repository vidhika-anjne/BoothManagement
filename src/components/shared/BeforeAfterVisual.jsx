import { Lightbulb, AlertTriangle, CheckCircle2, Droplets, XCircle } from 'lucide-react'
import streetlightBefore from '../../assets/streetlight-before.webp'
import streetlightAfter from '../../assets/streetlight-after.jpg'
import roadBefore from '../../assets/road-before.jpg'
import roadAfter from '../../assets/road-after.webp'
import potholeBefore from '../../assets/pothole-before.jpg'
import potholeAfter from '../../assets/pothole-after.jpg'

const CFG = {
  streetlight: {
    before: { 
      image: streetlightBefore
    },
    after:  { 
      image: streetlightAfter
    },
  },
  road: {
    before: { 
      image: roadBefore
    },
    after:  { 
      image: roadAfter
    },
  },
  pothole: {
    before: { 
      image: potholeBefore
    },
    after:  { 
      image: potholeAfter
    },
  },
  other: {
    before: { 
      image: potholeBefore
    },
    after:  { 
      image: potholeAfter
    },
  },
}

/**
 * @param {{ notif: object, compact?: boolean }} props
 * compact=true → smaller padding/icons, used inside notification panel items
 */
export default function BeforeAfterVisual({ notif, compact = false }) {
  const cfg = CFG[notif.visualType] || CFG.other
  const cls = compact ? ' compact' : ''

  return (
    <div className={`ba-wrap${cls}`}>
      <div 
        className="ba-card" 
        style={{ 
          backgroundImage: `url('${cfg.before.image}')`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 100%)' }} />
        <span className="ba-chip before" style={{ position: 'relative', zIndex: 10 }}>BEFORE</span>
        <span className="ba-desc" style={{ position: 'relative', zIndex: 10 }}>{notif.beforeDesc}</span>
      </div>
      <span className="ba-arrow">→</span>
      <div 
        className="ba-card" 
        style={{ 
          backgroundImage: `url('${cfg.after.image}')`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 100%)' }} />
        <span className="ba-chip after" style={{ position: 'relative', zIndex: 10 }}>AFTER</span>
        <span className="ba-desc after" style={{ position: 'relative', zIndex: 10 }}>{notif.afterDesc}</span>
      </div>
    </div>
  )
}
