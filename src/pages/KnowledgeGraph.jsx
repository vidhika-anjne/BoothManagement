import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useApp } from '../context/AppContext.jsx'
import { GRAPH_DATA, NODE_COLORS } from '../data/mockData.js'
import { Network, Info, Filter } from 'lucide-react'

const TYPE_LABELS = {
  voter: 'Voters', booth: 'Booths', ward: 'Wards',
  scheme: 'Schemes', issue: 'Issues', worker: 'Workers'
}

export default function KnowledgeGraph() {
  const svgRef = useRef(null)
  const tooltipRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [visibleTypes, setVisibleTypes] = useState(Object.keys(TYPE_LABELS))
  const { darkMode, showToast } = useApp()

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const W = el.clientWidth || 700, H = 520
    d3.select(el).selectAll('*').remove()

    const svg = d3.select(el).attr('viewBox', `0 0 ${W} ${H}`)
    const g = svg.append('g')

    svg.call(d3.zoom().scaleExtent([.3, 4]).on('zoom', e => g.attr('transform', e.transform)))

    const nodes = GRAPH_DATA.nodes.filter(n => visibleTypes.includes(n.type))
    const nodeIds = new Set(nodes.map(n => n.id))
    const links = GRAPH_DATA.links.filter(l => nodeIds.has(l.source.id ?? l.source) && nodeIds.has(l.target.id ?? l.target))

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(W/2, H/2))
      .force('collision', d3.forceCollide(30))

    g.append('defs').append('marker').attr('id','arrow').attr('viewBox','0 -5 10 10')
      .attr('refX',20).attr('refY',0).attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto')
      .append('path').attr('d','M0,-5L10,0L0,5').attr('fill', darkMode ? '#4a5568' : '#c4ccd8')

    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('class','d3-link').attr('stroke-width', 1.5).attr('marker-end','url(#arrow)')

    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('class','d3-node')
      .call(d3.drag()
        .on('start', (e,d) => { if(!e.active) sim.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y })
        .on('drag',  (e,d) => { d.fx=e.x; d.fy=e.y })
        .on('end',   (e,d) => { if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null })
      )

    node.append('circle')
      .attr('r', d => d.type === 'booth' ? 18 : d.type === 'ward' ? 16 : 12)
      .attr('fill', d => NODE_COLORS[d.type])
      .on('click', (e,d) => { setSelected(d) })
      .on('mouseover', (e,d) => {
        const t = tooltipRef.current; if(!t) return
        t.style.opacity = '1'
        t.style.left = (e.offsetX + 14) + 'px'
        t.style.top  = (e.offsetY - 12) + 'px'
        t.textContent = `${d.label} (${d.type})`
      })
      .on('mouseout', () => { const t = tooltipRef.current; if(t) t.style.opacity = '0' })

    node.append('text').text(d => d.label).attr('dy', '2.4em').attr('text-anchor','middle').style('font-size','10px')

    sim.on('tick', () => {
      link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [visibleTypes, darkMode])

  function toggleType(t) {
    setVisibleTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev,t])
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Knowledge Graph</div>
          <div className="page-subtitle">Voter–Booth–Issue relationship network</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => showToast('Graph exported as PNG')}><Network size={14}/>Export Graph</button>
        </div>
      </div>

      <div className="graph-layout">
        <div className="card graph-card" style={{ padding: 0 }}>
          <div ref={tooltipRef} className="graph-tooltip" />
          <svg ref={svgRef} className="graph-svg" />
        </div>

        <div className="graph-sidebar">
          <div className="card">
            <div className="card-header"><span className="card-title"><Filter size={14}/> Node Types</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
              {Object.entries(TYPE_LABELS).map(([t, label]) => (
                <div className="node-legend-item" key={t} style={{ cursor: 'pointer' }} onClick={() => toggleType(t)}>
                  <div className="node-dot" style={{ background: NODE_COLORS[t], opacity: visibleTypes.includes(t) ? 1 : 0.3 }} />
                  <span style={{ opacity: visibleTypes.includes(t) ? 1 : 0.4 }}>{label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                    {GRAPH_DATA.nodes.filter(n=>n.type===t).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title"><Info size={14}/> {selected ? selected.label : 'Node Info'}</span></div>
            {selected ? (
              <div>
                <div className="stat-row"><span>ID</span><strong>{selected.id}</strong></div>
                <div className="stat-row"><span>Type</span><strong style={{ textTransform: 'capitalize' }}>{selected.type}</strong></div>
                <div className="stat-row"><span>Label</span><strong>{selected.label}</strong></div>
                {selected.data && Object.entries(selected.data).map(([k,v]) => (
                  <div className="stat-row" key={k}><span style={{textTransform:'capitalize'}}>{k}</span><strong>{String(v)}</strong></div>
                ))}
              </div>
            ) : (
              <div className="graph-info-placeholder">
                <Network size={28} style={{ opacity: .3 }} />
                <span>Click a node to see details</span>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Graph Stats</span></div>
            <div className="stat-row"><span>Total Nodes</span><strong>{GRAPH_DATA.nodes.length}</strong></div>
            <div className="stat-row"><span>Total Links</span><strong>{GRAPH_DATA.links.length}</strong></div>
            <div className="stat-row"><span>Visible Nodes</span><strong>{GRAPH_DATA.nodes.filter(n=>visibleTypes.includes(n.type)).length}</strong></div>
            <div className="stat-row"><span>Components</span><strong>3</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}
