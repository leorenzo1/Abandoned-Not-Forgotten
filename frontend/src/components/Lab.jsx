/* eslint-disable */
// Ported from the story team's "From Moon to Mars" project.
import { useEffect, useRef, useState } from 'react'
import * as T from 'three'
import { D } from '../data/labModels'

// 3D Machines Lab. three.js lives in refs/effects; React owns the tabs and the info panel.
export default function Lab({ say }) {
  const cv = useRef(), vw = useRef(), A = useRef({}), first = useRef(true)
  const [idx, setIdx] = useState(0)
  const [sel, setSel] = useState(-1)
  const [ok, setOk] = useState(true)

  // 1) Set up renderer, scene, drag-to-spin and click-to-pick (once).
  useEffect(() => {
    const a = A.current, c = cv.current
    const RM = matchMedia('(prefers-reduced-motion:reduce)').matches
    let R
    try { R = new T.WebGLRenderer({ canvas: c, antialias: true, alpha: true }) } catch { setOk(false); return }
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, 0.1, 100), pv = new T.Group()
    sc.add(new T.HemisphereLight(0xffffff, 0x6655aa, 1))
    const dl = new T.DirectionalLight(0xffffff, 0.8); dl.position.set(4, 6, 5); sc.add(dl)
    cam.position.set(0, 2.5, 6.4); cam.lookAt(0, 1.1, 0)
    const gr = new T.Mesh(new T.CylinderGeometry(3, 3, 0.2, 48), new T.MeshToonMaterial({ color: 0xbbb5c9 }))
    gr.position.y = -0.1; pv.add(gr); sc.add(pv)
    Object.assign(a, { pv, gr, cur: null, sel: -1, idx: 0, dn: false })
    a.pick = (p) => { setSel(p); say(`${D[a.idx].i[p][0]}: ${D[a.idx].i[p][1]}`) }

    let mv = 0, lx = 0, ly = 0, raf
    c.style.touchAction = 'pan-y'
    const down = (e) => { a.dn = true; mv = 0; lx = e.clientX; ly = e.clientY; c.setPointerCapture(e.pointerId) }
    const move = (e) => {
      if (!a.dn) return
      const dx = e.clientX - lx, dy = e.clientY - ly
      lx = e.clientX; ly = e.clientY; mv += Math.abs(dx) + Math.abs(dy)
      pv.rotation.y += dx * 0.012
      pv.rotation.x = Math.max(-0.2, Math.min(0.6, pv.rotation.x + dy * 0.006))
    }
    const up = (e) => {
      a.dn = false
      if (mv >= 8 || !a.cur) return
      const r = c.getBoundingClientRect(), rc = new T.Raycaster()
      rc.setFromCamera(new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), cam)
      const hit = rc.intersectObject(a.cur, true)
      if (!hit.length) return
      let o = hit[0].object
      while (o && o.userData.p === undefined) o = o.parent
      if (o) a.pick(o.userData.p)
    }
    const cancel = () => { a.dn = false }
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move)
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', cancel)

    const rs = () => {
      const w = vw.current.clientWidth
      if (!w) return
      const h = Math.round(Math.min(480, Math.max(320, w * 0.72)))
      R.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(rs); ro.observe(vw.current); rs()

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!RM) {
        if (!a.dn && a.sel < 0) pv.rotation.y += 0.005
        const s = D[a.idx].spin
        if (s !== undefined && a.cur) a.cur.children[s].rotation.y += 0.35   // Ingenuity rotors
      }
      R.render(sc, cam)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf); ro.disconnect()
      c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move)
      c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', cancel)
      R.dispose()
    }
  }, [say])

  // 2) Swap the model when a tab is chosen.
  useEffect(() => {
    const a = A.current
    if (!a.pv) return
    a.idx = idx; a.sel = -1; setSel(-1)
    if (a.cur) a.pv.remove(a.cur)
    const g = new T.Group()
    D[idx].b().forEach((p, k) => { p.userData.p = k; g.add(p) })   // userData.p = part number
    a.pv.add(g); a.cur = g
    a.gr.material.color.set(D[idx].w === 'moon' ? 0xbdb7d0 : 0xd9743a)
    a.pv.rotation.set(0, 0, 0)
    if (first.current) first.current = false
    else say(`Meet the ${D[idx].n}! ${D[idx].s} Spin it, then tap a part.`)
  }, [idx, say])

  // 3) Glow the selected part.
  useEffect(() => {
    const a = A.current
    a.sel = sel
    a.cur?.children.forEach((g) => g.traverse((m) => {
      if (m.material) m.material.emissive.setHex(g.userData.p === sel ? 0x886600 : 0)
    }))
  }, [sel, idx])

  const d = D[idx]
  return (
    <section id="lab">
      <p className="lab-p">These robots and rovers were left behind on the Moon and Mars. Drag to spin a model, then tap a part to learn what it does!</p>
      <div className="lab-tabs">
        {D.map((m, i) => <button key={m.n} className={'lab-tab' + (i === idx ? ' on' : '')} onClick={() => setIdx(i)}>{m.e} {m.n}</button>)}
      </div>
      <div ref={vw} className={'lab-vw ' + d.w}>
        {ok ? <canvas ref={cv} aria-label="3D model of a space machine" />
            : <p style={{ padding: 24, color: '#fff' }}>The 3D viewer needs WebGL. Try another browser.</p>}
        <span className="lab-loc">{d.w === 'moon' ? '🌕 Left on the Moon' : '🔴 On Mars'}</span>
      </div>
      <div className="lab-info">
        {sel < 0 ? (
          <><h3>{d.e} {d.n}</h3><p>{d.s}</p><p className="lab-hint">👆 Tap a part of the model, or pick one here:</p></>
        ) : (
          <><h3>🔎 {d.i[sel][0]}</h3><p>{d.i[sel][1]}</p></>
        )}
        <div className="lab-chips">
          {d.i.map((p, k) => (
            <button key={p[0]} className={'lab-chip' + (k === sel ? ' on' : '')} onClick={() => A.current.pick(k)}>{p[0]}</button>
          ))}
        </div>
      </div>
    </section>
  )
}
