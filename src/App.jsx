import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

// ─── Constants ──────────────────────────────────────────────────────────────
const CHILDREN = {
  liam:   { label: "ליאם",   emoji: "🦁", color: "#f97316", bg: "#fff7ed", accent: "#c2410c" },
  shaiya: { label: "שי-יה", emoji: "🌟", color: "#8b5cf6", bg: "#f5f3ff", accent: "#6d28d9" },
};
const SKIP_REASONS = ["לא בבית", "חולה", "אחר"];

// ─── Confetti ────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const aliveRef = useRef(false);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width, y: -20,
      r: Math.random() * 9 + 4,
      color: ["#f97316","#8b5cf6","#fbbf24","#34d399","#60a5fa","#f43f5e"][Math.floor(Math.random()*6)],
      vx: (Math.random()-0.5)*5, vy: Math.random()*4+2,
      angle: Math.random()*360, spin: (Math.random()-0.5)*10,
    }));
    aliveRef.current = true;
    let frame;
    function draw() {
      if (!aliveRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle*Math.PI/180);
        ctx.fillStyle = p.color; ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r); ctx.restore();
        p.x+=p.vx; p.y+=p.vy; p.angle+=p.spin; p.vy+=0.08;
      });
      frame = requestAnimationFrame(draw);
    }
    draw();
    const t = setTimeout(() => {
      aliveRef.current = false; cancelAnimationFrame(frame);
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }, 2200);
    return () => { aliveRef.current=false; cancelAnimationFrame(frame); clearTimeout(t); };
  }, [active]);
  return <canvas ref={canvasRef} style={{position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:9999,width:"100%",height:"100%"}}/>;
}

// ─── SwipeButton ─────────────────────────────────────────────────────────────
function SwipeButton({ onConfirm, color, disabled }) {
  const [progress, setProgress] = useState(0);
  const startX = useRef(null);
  const TRACK=300, THUMB=68;
  function start(e) { startX.current = e.touches ? e.touches[0].clientX : e.clientX; }
  function move(e) {
    if (startX.current===null) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = startX.current - x; // RTL: swipe left
    setProgress(Math.min(Math.max(delta/(TRACK-THUMB-8),0),1));
  }
  function end() {
    if (progress>0.82) { onConfirm(); setProgress(0); } else setProgress(0);
    startX.current=null;
  }
  return (
    <div style={{position:"relative",width:TRACK,height:68,borderRadius:34,
      background:disabled?"#f1f5f9":`${color}20`,
      border:`2.5px solid ${disabled?"#e2e8f0":color+"55"}`,
      overflow:"hidden",userSelect:"none",margin:"0 auto",opacity:disabled?0.5:1}}>
      <div style={{position:"absolute",right:0,top:0,height:"100%",
        width:`${4+progress*(TRACK-THUMB-4)}px`,background:`${color}25`,
        transition:progress===0?"width 0.3s":"none"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
        justifyContent:"center",fontSize:15,fontWeight:700,color,letterSpacing:0.5,
        opacity:1-progress*1.5,pointerEvents:"none",direction:"rtl"}}>
        החלק ← לאישור
      </div>
      <div onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        style={{position:"absolute",top:4,right:`${4+progress*(TRACK-THUMB-8)}px`,
          width:THUMB-8,height:THUMB-8,borderRadius:30,
          background:disabled?"#cbd5e1":color,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:26,cursor:disabled?"default":"grab",
          boxShadow:"0 4px 14px rgba(0,0,0,0.18)",
          transition:progress===0?"right 0.3s":"none"}}>✅</div>
    </div>
  );
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────
// subtitle: extra hint line shown under the title
function PinScreen({ title, subtitle, onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  // onSuccess receives the entered pin so caller can validate
  function press(d) {
    if (pin.length>=4) return;
    const next = pin+d;
    setPin(next);
    if (next.length===4) onSuccess(next, () => {
      setShake(true);
      setTimeout(()=>{ setPin(""); setShake(false); }, 600);
    });
  }
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 24px",gap:20}}>
      <div style={{fontSize:48}}>🔐</div>
      <div style={{textAlign:"center"}}>
        <h2 style={{fontSize:22,fontWeight:900,color:"#1e293b",margin:0}}>{title}</h2>
        {subtitle && <div style={{fontSize:13,color:"#94a3b8",marginTop:4}}>{subtitle}</div>}
      </div>
      <div style={{display:"flex",gap:14,transform:shake?"translateX(-6px)":"none",transition:"transform 0.05s"}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:18,height:18,borderRadius:"50%",
            background:pin.length>i?(shake?"#ef4444":"#1e293b"):"#e2e8f0",transition:"background 0.15s"}}/>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,76px)",gap:12}}>
        {[1,2,3,4,5,6,7,8,9].map(n=>(
          <button key={n} onClick={()=>press(String(n))} style={{
            height:76,fontSize:26,fontWeight:800,borderRadius:18,
            border:"2px solid #e2e8f0",background:"#fff",cursor:"pointer",
            fontFamily:"'Heebo',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
            WebkitTapHighlightColor:"transparent"}}>{n}</button>
        ))}
        <div/>
        <button onClick={()=>press("0")} style={{height:76,fontSize:26,fontWeight:800,borderRadius:18,border:"2px solid #e2e8f0",background:"#fff",cursor:"pointer",fontFamily:"'Heebo',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>0</button>
        <button onClick={()=>setPin(p=>p.slice(0,-1))} style={{height:76,fontSize:22,borderRadius:18,border:"2px solid #e2e8f0",background:"#fff",cursor:"pointer"}}>⌫</button>
      </div>
      <button onClick={onCancel} style={{color:"#94a3b8",background:"none",border:"none",cursor:"pointer",fontSize:15,fontFamily:"'Heebo',sans-serif"}}>ביטול</button>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,2600); return()=>clearTimeout(t); },[]);
  return (
    <div style={{position:"fixed",bottom:36,left:"50%",transform:"translateX(-50%)",
      background:"#1e293b",color:"#fff",padding:"14px 28px",borderRadius:18,
      fontSize:16,fontWeight:700,zIndex:1000,boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
      direction:"rtl",whiteSpace:"nowrap",animation:"slideUp 0.3s ease"}}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {message}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,background:"linear-gradient(135deg,#fef9f0,#f0ebff)"}}>
      <div style={{fontSize:64,animation:"spin 1s linear infinite"}}>🍽️</div>
      <div style={{fontSize:18,fontWeight:700,color:"#64748b"}}>טוען...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32,textAlign:"center",background:"#fef2f2"}}>
      <div style={{fontSize:56}}>⚠️</div>
      <h2 style={{color:"#dc2626",fontSize:20,fontWeight:900}}>שגיאת חיבור</h2>
      <p style={{color:"#64748b",fontSize:14,lineHeight:1.6,maxWidth:320}}>{message}</p>
      <button onClick={()=>window.location.reload()} style={{padding:"12px 28px",borderRadius:14,background:"#dc2626",color:"#fff",border:"none",fontWeight:700,fontSize:16,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>נסה שוב</button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [appState, setAppState]   = useState(null);
  const [logs, setLogs]           = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [screen, setScreen]       = useState("home");
  const [currentUser, setCurrentUser] = useState(null); // null | liam | shaiya | admin
  const [pinFlow, setPinFlow]     = useState(null); // { target: 'liam'|'shaiya'|'admin' }
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast]         = useState(null);
  const [undoAction, setUndoAction] = useState(null);
  const [skipReason, setSkipReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [filterChild, setFilterChild] = useState("all");
  const [saving, setSaving]       = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from("app_state").select("*").eq("id","main").single();
        if (error) throw error;
        const { data: logData, error: logErr } = await supabase.from("actions_log").select("*").order("timestamp",{ascending:false}).limit(50);
        if (logErr) throw logErr;
        setAppState(dbToState(data));
        setLogs(logData||[]);
      } catch(e) {
        console.error(e);
        setLoadError("לא ניתן להתחבר ל-Supabase. בדוק שה-URL וה-Key נכונים בקובץ .env");
      }
    }
    load();
  }, []);

  // ── Realtime ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel("rt")
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"app_state"}, p => setAppState(dbToState(p.new)))
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"actions_log"}, p => setLogs(prev=>[p.new,...prev].slice(0,50)))
      .on("postgres_changes",{event:"DELETE",schema:"public",table:"actions_log"}, () =>
        supabase.from("actions_log").select("*").order("timestamp",{ascending:false}).limit(50).then(({data})=>{ if(data) setLogs(data); }))
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  function dbToState(d) {
    return {
      currentTurn:    d.current_turn,
      updatedAt:      d.updated_at,
      scoringEnabled: d.scoring_enabled,
      liamPoints:     d.liam_points,
      shaiyaPoints:   d.shaiya_points,
      weekStart:      d.week_start,
      adminPin:       d.admin_pin,
      liamPin:        d.liam_pin   || "2107",
      shaiyaPin:      d.shaiya_pin || "0303",
    };
  }

  function showToast(msg) { setToast(msg); }

  // ── DB helpers ────────────────────────────────────────────────────────────
  async function updateState(patch) {
    setSaving(true);
    const dbPatch = {};
    if (patch.currentTurn    !== undefined) dbPatch.current_turn    = patch.currentTurn;
    if (patch.updatedAt      !== undefined) dbPatch.updated_at      = patch.updatedAt;
    if (patch.scoringEnabled !== undefined) dbPatch.scoring_enabled = patch.scoringEnabled;
    if (patch.liamPoints     !== undefined) dbPatch.liam_points     = patch.liamPoints;
    if (patch.shaiyaPoints   !== undefined) dbPatch.shaiya_points   = patch.shaiyaPoints;
    if (patch.weekStart      !== undefined) dbPatch.week_start      = patch.weekStart;
    if (patch.adminPin       !== undefined) dbPatch.admin_pin       = patch.adminPin;
    if (patch.liamPin        !== undefined) dbPatch.liam_pin        = patch.liamPin;
    if (patch.shaiyaPin      !== undefined) dbPatch.shaiya_pin      = patch.shaiyaPin;
    const { error } = await supabase.from("app_state").update(dbPatch).eq("id","main");
    setSaving(false);
    if (error) { showToast("❌ שגיאה בשמירה"); console.error(error); return false; }
    return true;
  }

  async function insertLog(entry) {
    await supabase.from("actions_log").insert({ id:entry.id, type:entry.type, actor:entry.actor, timestamp:entry.timestamp, note:entry.note||"" });
  }
  async function deleteLog(id) { await supabase.from("actions_log").delete().eq("id",id); }
  async function clearAllLogs() { await supabase.from("actions_log").delete().neq("id","__never__"); }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function doCompleted(actor) {
    if (!appState) return;
    const prev = appState.currentTurn;
    const nextKid = prev==="liam"?"shaiya":"liam";
    const now = new Date().toISOString();
    const logId = Date.now().toString();
    const pointsPatch = appState.scoringEnabled ? {
      liamPoints:   actor==="liam"   ? appState.liamPoints+1   : appState.liamPoints,
      shaiyaPoints: actor==="shaiya" ? appState.shaiyaPoints+1 : appState.shaiyaPoints,
    } : {};
    const ok = await updateState({ currentTurn:nextKid, updatedAt:now, ...pointsPatch });
    if (!ok) return;
    await insertLog({ id:logId, type:"completed", actor, timestamp:now, note:"" });
    setShowConfetti(true); setTimeout(()=>setShowConfetti(false),100);
    showToast(`✅ ${CHILDREN[actor].label} סידר! עכשיו תור ${CHILDREN[nextKid].label}`);
    setUndoAction({ logId, previousTurn:prev, prevPoints:{l:appState.liamPoints,s:appState.shaiyaPoints}, at:Date.now() });
    setTimeout(()=>setUndoAction(null),120000);
  }

  async function doUndo() {
    if (!undoAction||!appState) return;
    const now = new Date().toISOString();
    await updateState({ currentTurn:undoAction.previousTurn, updatedAt:now, liamPoints:undoAction.prevPoints.l, shaiyaPoints:undoAction.prevPoints.s });
    await deleteLog(undoAction.logId);
    setUndoAction(null); showToast("↩️ הפעולה בוטלה");
  }

  async function doSkip(reason) {
    if (!appState) return;
    const nextKid = appState.currentTurn==="liam"?"shaiya":"liam";
    const now = new Date().toISOString();
    await updateState({ currentTurn:nextKid, updatedAt:now });
    await insertLog({ id:Date.now().toString(), type:"skip", actor:"admin", timestamp:now, note:reason });
    showToast(`⏭️ תור עבר ל${CHILDREN[nextKid].label}`);
  }

  async function doSetTurn(who) {
    const now = new Date().toISOString();
    await updateState({ currentTurn:who, updatedAt:now });
    await insertLog({ id:Date.now().toString(), type:"override", actor:"admin", timestamp:now, note:`הגדרה ידנית ל${CHILDREN[who].label}` });
    showToast(`🔄 תור הוגדר ל${CHILDREN[who].label}`);
  }

  async function doResetTurn() {
    const now = new Date().toISOString();
    await updateState({ currentTurn:"liam", updatedAt:now });
    await insertLog({ id:Date.now().toString(), type:"reset", actor:"admin", timestamp:now, note:"איפוס תור" });
    showToast("🔄 התור אופס");
  }

  async function doFullReset() {
    const now = new Date().toISOString();
    await updateState({ currentTurn:"liam", updatedAt:now, liamPoints:0, shaiyaPoints:0, weekStart:now });
    await clearAllLogs();
    await insertLog({ id:Date.now().toString(), type:"reset", actor:"admin", timestamp:now, note:"איפוס מלא" });
    showToast("🗑️ איפוס מלא בוצע");
  }

  // ── PIN validation ────────────────────────────────────────────────────────
  // Returns which user the pin belongs to, or null
  function resolvePin(enteredPin) {
    if (!appState) return null;
    if (enteredPin === appState.adminPin)  return "admin";
    if (enteredPin === appState.liamPin)   return "liam";
    if (enteredPin === appState.shaiyaPin) return "shaiya";
    return null;
  }

  // ── Format helpers ────────────────────────────────────────────────────────
  function formatTime(iso) { return new Date(iso).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"}); }
  function formatDate(iso) {
    const d=new Date(iso);
    return d.toLocaleDateString("he-IL",{day:"2-digit",month:"2-digit",year:"2-digit"})+" "+formatTime(iso);
  }
  const typeLabels = { completed:"✅ סידר", skip:"⏭️ דילוג", reset:"🔄 איפוס", override:"✏️ שינוי ידני" };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loadError) return <ErrorScreen message={loadError}/>;
  if (!appState) return <LoadingScreen/>;

  const isAdmin = currentUser==="admin";

  // ══════════════════════════════════════════════════════════════════════════
  // SELECT USER SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (!currentUser) {
    return (
      <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(145deg,#fef9f0 0%,#f0ebff 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Heebo',sans-serif"}}>
        <div style={{fontSize:68,marginBottom:4,filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.1))"}}>🍽️</div>
        <h1 style={{fontSize:34,fontWeight:900,color:"#1e293b",margin:"8px 0 4px"}}>תור מדיח</h1>
        <p style={{color:"#94a3b8",marginBottom:44,fontSize:15}}>מי אתה?</p>
        <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:320}}>
          {Object.entries(CHILDREN).map(([id,c])=>(
            <button key={id} onClick={()=>setPinFlow({target:id})} style={{
              padding:"22px 24px",borderRadius:22,border:`3px solid ${c.color}`,
              background:c.bg,cursor:"pointer",fontSize:22,fontWeight:900,color:c.accent,
              display:"flex",alignItems:"center",gap:14,
              boxShadow:`0 6px 24px ${c.color}30`,fontFamily:"'Heebo',sans-serif",
              WebkitTapHighlightColor:"transparent"}}>
              <span style={{fontSize:40}}>{c.emoji}</span> {c.label}
            </button>
          ))}
          <button onClick={()=>setPinFlow({target:"admin"})} style={{
            padding:"18px 24px",borderRadius:22,border:"3px solid #cbd5e1",
            background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:700,
            color:"#475569",fontFamily:"'Heebo',sans-serif",
            WebkitTapHighlightColor:"transparent"}}>🔐 הורה</button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PIN FLOW — shown as overlay / full screen
  // ══════════════════════════════════════════════════════════════════════════
  if (pinFlow) {
    const target = pinFlow.target;
    const child  = CHILDREN[target];
    const isAdminTarget = target==="admin";

    return (
      <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(145deg,#fef9f0,#f0ebff)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Heebo',sans-serif"}}>
        <div style={{background:"#fff",borderRadius:28,boxShadow:"0 12px 48px rgba(0,0,0,0.12)",width:"100%",maxWidth:380,margin:16}}>
          <PinScreen
            title={isAdminTarget ? "כניסת הורה" : `שלום ${child.label} ${child.emoji}`}
            subtitle={isAdminTarget ? "הזן קוד הורה" : "הזן את הקוד שלך"}
            onSuccess={(enteredPin, onError) => {
              const resolved = resolvePin(enteredPin);
              // Admin PIN opens any target; child PIN must match
              if (resolved==="admin" || resolved===target) {
                setPinFlow(null);
                setCurrentUser(resolved==="admin" && target!=="admin" ? target : resolved);
                if (resolved==="admin" && target==="admin") setScreen("admin");
              } else {
                onError(); // shake & clear
              }
            }}
            onCancel={()=>{ setPinFlow(null); if (!currentUser) {} }}
          />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN APP
  // ══════════════════════════════════════════════════════════════════════════
  const current = CHILDREN[appState.currentTurn];
  const nextKidId = appState.currentTurn==="liam"?"shaiya":"liam";
  const next = CHILDREN[nextKidId];
  const isMyTurn = appState.currentTurn===currentUser;

  return (
    <div dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(160deg,#fef9f0 0%,#f0ebff 100%)",fontFamily:"'Heebo',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:40}}>
      <Confetti active={showConfetti}/>
      {toast && <Toast message={toast} onDone={()=>setToast(null)}/>}
      {saving && (
        <div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",background:"#1e293b88",backdropFilter:"blur(8px)",color:"#fff",padding:"6px 16px",borderRadius:20,fontSize:13,zIndex:500}}>שומר...</div>
      )}

      {/* Header */}
      <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{margin:0,fontSize:22,fontWeight:900,color:"#1e293b"}}>תור מדיח 🍽️</h1>
          <div style={{fontSize:13,color:"#94a3b8",marginTop:2}}>
            {isAdmin ? "🔐 הורה" : `${CHILDREN[currentUser]?.emoji} ${CHILDREN[currentUser]?.label}`}
          </div>
        </div>
        <button onClick={()=>{ setCurrentUser(null); setScreen("home"); }} style={{
          background:"#f1f5f9",border:"none",borderRadius:12,padding:"8px 14px",
          cursor:"pointer",color:"#64748b",fontSize:13,fontWeight:700,fontFamily:"'Heebo',sans-serif"}}>
          החלף
        </button>
      </div>

      {/* Nav */}
      <div style={{display:"flex",gap:8,padding:"14px 20px 0"}}>
        {[
          {id:"home",label:"🏠 בית"},
          {id:"history",label:"📜 היסטוריה"},
          ...(isAdmin?[{id:"admin",label:"⚙️ ניהול"}]:[]),
        ].map(tab=>(
          <button key={tab.id} onClick={()=>setScreen(tab.id)} style={{
            flex:1,padding:"10px 0",borderRadius:14,border:"none",
            background:screen===tab.id?(isAdmin?"#1e293b":CHILDREN[currentUser]?.color||"#1e293b"):"#e2e8f0",
            color:screen===tab.id?"#fff":"#64748b",
            fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.2s",
            fontFamily:"'Heebo',sans-serif",WebkitTapHighlightColor:"transparent"}}>
            {tab.label}
          </button>
        ))}
        {!isAdmin && (
          <button onClick={()=>setPinFlow({target:"admin"})} style={{
            padding:"10px 14px",borderRadius:14,border:"none",background:"#e2e8f0",
            color:"#64748b",fontWeight:700,fontSize:14,cursor:"pointer"}}>🔐</button>
        )}
      </div>

      {/* ══ HOME ══════════════════════════════════════════════════════════ */}
      {screen==="home" && (
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:18}}>
          {/* Hero */}
          <div style={{background:current.bg,border:`3px solid ${current.color}50`,borderRadius:28,padding:"32px 24px",textAlign:"center",boxShadow:`0 10px 40px ${current.color}20`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,left:-20,width:120,height:120,borderRadius:"50%",background:`${current.color}10`}}/>
            <div style={{fontSize:72,lineHeight:1}}>{current.emoji}</div>
            <div style={{fontSize:13,color:"#94a3b8",marginTop:8,fontWeight:700,letterSpacing:1}}>עכשיו בתור</div>
            <div style={{fontSize:46,fontWeight:900,color:current.accent,marginTop:2}}>{current.label}</div>
            <div style={{marginTop:10,fontSize:13,color:"#94a3b8"}}>עודכן: {formatTime(appState.updatedAt)}</div>
          </div>

          {/* Next */}
          <div style={{background:"#fff",borderRadius:20,padding:"16px 20px",display:"flex",alignItems:"center",gap:14,border:"2px solid #f1f5f9",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <span style={{fontSize:36}}>{next.emoji}</span>
            <div>
              <div style={{fontSize:12,color:"#94a3b8",fontWeight:700}}>הבא בתור</div>
              <div style={{fontSize:22,fontWeight:900,color:next.accent}}>{next.label}</div>
            </div>
          </div>

          {/* Scoring */}
          {appState.scoringEnabled && (
            <div style={{background:"#fff",borderRadius:20,padding:"16px 20px",border:"2px solid #f1f5f9",display:"flex",justifyContent:"space-around"}}>
              {Object.entries(CHILDREN).map(([id,c])=>{
                const pts = id==="liam"?appState.liamPoints:appState.shaiyaPoints;
                return (
                  <div key={id} style={{textAlign:"center"}}>
                    <div style={{fontSize:28}}>{c.emoji}</div>
                    <div style={{fontSize:32,fontWeight:900,color:c.accent}}>{pts}</div>
                    <div style={{fontSize:12,color:"#94a3b8",fontWeight:700}}>נקודות השבוע</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action */}
          {(isAdmin||isMyTurn) ? (
            <div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:"8px 0"}}>
              <div style={{fontSize:14,color:"#94a3b8",fontWeight:700}}>
                {isAdmin?`סמן עבור ${current.label}`:"החלק לאישור שסידרת"}
              </div>
              <SwipeButton
                color={CHILDREN[isAdmin?appState.currentTurn:currentUser]?.color||"#1e293b"}
                onConfirm={()=>doCompleted(isAdmin?appState.currentTurn:currentUser)}
                disabled={saving}
              />
              {undoAction && Date.now()-undoAction.at<120000 && (
                <button onClick={doUndo} style={{background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:14,padding:"10px 24px",color:"#dc2626",fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'Heebo',sans-serif"}}>↩️ ביטול פעולה אחרונה</button>
              )}
            </div>
          ) : (
            <div style={{textAlign:"center",padding:"28px 20px",background:"#fff",borderRadius:20,border:"2px solid #f1f5f9"}}>
              <div style={{fontSize:40,marginBottom:8}}>⏳</div>
              <div style={{fontSize:17,fontWeight:800,color:"#64748b"}}>לא התורך עכשיו</div>
              <div style={{fontSize:14,color:"#94a3b8",marginTop:4}}>ממתינים ל{current.label} שיסדר</div>
            </div>
          )}
        </div>
      )}

      {/* ══ HISTORY ═══════════════════════════════════════════════════════ */}
      {screen==="history" && (
        <div style={{padding:20}}>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {["all","liam","shaiya"].map(f=>(
              <button key={f} onClick={()=>setFilterChild(f)} style={{
                flex:1,padding:"9px 0",borderRadius:12,border:"none",
                background:filterChild===f?"#1e293b":"#e2e8f0",
                color:filterChild===f?"#fff":"#64748b",
                fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>
                {f==="all"?"הכל":CHILDREN[f].label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {logs.filter(l=>filterChild==="all"||l.actor===filterChild).slice(0,30).map(log=>{
              const c=CHILDREN[log.actor]||{emoji:"👤",color:"#94a3b8",label:log.actor};
              return (
                <div key={log.id} style={{background:"#fff",borderRadius:16,padding:"14px 16px",border:`2px solid ${c.color||"#e2e8f0"}15`,boxShadow:"0 2px 10px rgba(0,0,0,0.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:24}}>{c.emoji}</span>
                      <div>
                        <div style={{fontWeight:800,fontSize:15,color:"#1e293b"}}>{c.label}</div>
                        <div style={{fontSize:12,color:"#94a3b8"}}>{formatDate(log.timestamp)}</div>
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:"#64748b",background:"#f8fafc",padding:"4px 10px",borderRadius:8}}>{typeLabels[log.type]||log.type}</div>
                  </div>
                  {log.note && <div style={{marginTop:8,fontSize:13,color:"#64748b",paddingRight:34}}>💬 {log.note}</div>}
                </div>
              );
            })}
            {logs.length===0 && <div style={{textAlign:"center",color:"#94a3b8",padding:48,fontSize:16}}>אין היסטוריה עדיין 🍽️</div>}
          </div>
        </div>
      )}

      {/* ══ ADMIN ═════════════════════════════════════════════════════════ */}
      {screen==="admin" && isAdmin && (
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
          <h2 style={{margin:0,fontWeight:900,fontSize:20,color:"#1e293b"}}>⚙️ ניהול</h2>

          {/* Set turn */}
          <div style={{background:"#fff",borderRadius:22,padding:20,border:"2px solid #f1f5f9",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <div style={{fontWeight:800,marginBottom:14,fontSize:15,color:"#1e293b"}}>🎯 בחר מי בתור עכשיו</div>
            <div style={{display:"flex",gap:10}}>
              {Object.entries(CHILDREN).map(([id,c])=>(
                <button key={id} onClick={()=>doSetTurn(id)} style={{
                  flex:1,padding:"16px 0",borderRadius:16,border:`2.5px solid ${c.color}`,
                  background:appState.currentTurn===id?c.color:c.bg,
                  color:appState.currentTurn===id?"#fff":c.accent,
                  fontWeight:900,fontSize:17,cursor:"pointer",fontFamily:"'Heebo',sans-serif",transition:"all 0.2s"}}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skip */}
          <div style={{background:"#fff",borderRadius:22,padding:20,border:"2px solid #f1f5f9",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <div style={{fontWeight:800,marginBottom:14,fontSize:15,color:"#1e293b"}}>⏭️ דלג/החלף תור</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              {SKIP_REASONS.map(r=>(
                <button key={r} onClick={()=>setSkipReason(r)} style={{
                  padding:"9px 16px",borderRadius:12,
                  border:`2px solid ${skipReason===r?"#f97316":"#e2e8f0"}`,
                  background:skipReason===r?"#fff7ed":"#f8fafc",
                  color:skipReason===r?"#ea580c":"#64748b",
                  fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Heebo',sans-serif",transition:"all 0.15s"}}>
                  {r}
                </button>
              ))}
            </div>
            {skipReason==="אחר" && (
              <input value={customReason} onChange={e=>setCustomReason(e.target.value)}
                placeholder="סיבה..." dir="rtl"
                style={{width:"100%",padding:"10px 14px",borderRadius:12,border:"2px solid #e2e8f0",fontSize:14,marginBottom:12,fontFamily:"'Heebo',sans-serif",boxSizing:"border-box"}}/>
            )}
            <button onClick={()=>{
              if (!skipReason){showToast("בחר סיבה קודם");return;}
              doSkip(skipReason==="אחר"?customReason||"אחר":skipReason);
              setSkipReason(""); setCustomReason("");
            }} style={{
              width:"100%",padding:"14px 0",borderRadius:16,border:"none",
              background:skipReason?"#f97316":"#e2e8f0",
              color:skipReason?"#fff":"#94a3b8",
              fontWeight:900,fontSize:16,cursor:skipReason?"pointer":"default",
              fontFamily:"'Heebo',sans-serif",transition:"all 0.2s"}}>
              דלג עכשיו ⏭️
            </button>
          </div>

          {/* Scoring toggle */}
          <div style={{background:"#fff",borderRadius:22,padding:"18px 20px",border:"2px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:"#1e293b"}}>🏆 ניקוד שבועי</div>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>מעקב נקודות לכל ילד</div>
            </div>
            <button onClick={()=>updateState({scoringEnabled:!appState.scoringEnabled})} style={{
              width:56,height:30,borderRadius:15,border:"none",cursor:"pointer",
              background:appState.scoringEnabled?"#22c55e":"#e2e8f0",position:"relative",transition:"background 0.2s"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:appState.scoringEnabled?29:3,transition:"left 0.2s",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}/>
            </button>
          </div>

          {/* Reset */}
          <div style={{display:"flex",gap:12}}>
            <button onClick={doResetTurn} style={{flex:1,padding:"16px 0",borderRadius:16,border:"2.5px solid #fca5a5",background:"#fef2f2",color:"#dc2626",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>🔄 איפוס תור</button>
            <button onClick={()=>{if(window.confirm("איפוס מלא? כל ההיסטוריה והנקודות יימחקו!")) doFullReset();}} style={{flex:1,padding:"16px 0",borderRadius:16,border:"2.5px solid #fca5a5",background:"#fef2f2",color:"#dc2626",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>🗑️ איפוס מלא</button>
          </div>

          {/* ── PIN Management ───────────────────────────────────────────── */}
          <div style={{background:"#fff",borderRadius:22,padding:20,border:"2px solid #f1f5f9",boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
            <div style={{fontWeight:800,marginBottom:16,fontSize:15,color:"#1e293b"}}>🔐 ניהול קודי כניסה</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Admin PIN */}
              <PinRow
                label="קוד הורה 👨‍👩‍👧"
                currentPin={appState.adminPin}
                color="#1e293b"
                onSave={async (v)=>{ await updateState({adminPin:v}); showToast("✅ קוד הורה עודכן"); }}
              />
              {/* Liam PIN */}
              <PinRow
                label={`קוד ${CHILDREN.liam.label} ${CHILDREN.liam.emoji}`}
                currentPin={appState.liamPin}
                color={CHILDREN.liam.color}
                onSave={async (v)=>{ await updateState({liamPin:v}); showToast(`✅ קוד ${CHILDREN.liam.label} עודכן`); }}
              />
              {/* Shaiya PIN */}
              <PinRow
                label={`קוד ${CHILDREN.shaiya.label} ${CHILDREN.shaiya.emoji}`}
                currentPin={appState.shaiyaPin}
                color={CHILDREN.shaiya.color}
                onSave={async (v)=>{ await updateState({shaiyaPin:v}); showToast(`✅ קוד ${CHILDREN.shaiya.label} עודכן`); }}
              />
            </div>
            <div style={{marginTop:14,padding:"10px 14px",background:"#f0fdf4",borderRadius:12,fontSize:13,color:"#166534",fontWeight:600,lineHeight:1.5}}>
              💡 קוד ההורה פותח גם את כניסת הילדים במקרה הצורך
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PinRow – inline PIN editor for admin panel ───────────────────────────
function PinRow({ label, currentPin, color, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  function save() {
    if (!/^\d{4}$/.test(val)) { setErr("חייב להיות בדיוק 4 ספרות"); return; }
    onSave(val);
    setEditing(false); setVal(""); setErr("");
  }

  return (
    <div style={{border:`2px solid ${color}25`,borderRadius:14,padding:"12px 14px",background:"#fafafa"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontWeight:800,fontSize:14,color:"#1e293b"}}>{label}</div>
          <div style={{fontSize:12,color:"#94a3b8",marginTop:2,letterSpacing:4}}>{"●".repeat(currentPin.length)}</div>
        </div>
        <button onClick={()=>{ setEditing(!editing); setVal(""); setErr(""); }} style={{
          padding:"7px 14px",borderRadius:10,border:`2px solid ${color}`,
          background:editing?"#f1f5f9":"#fff",color,fontWeight:700,fontSize:13,
          cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>
          {editing?"ביטול":"שנה"}
        </button>
      </div>
      {editing && (
        <div style={{marginTop:12,display:"flex",gap:8,flexDirection:"column"}}>
          <input
            type="number" maxLength={4} placeholder="קוד חדש (4 ספרות)"
            value={val} onChange={e=>{ setVal(e.target.value.slice(0,4)); setErr(""); }}
            dir="ltr"
            style={{flex:1,padding:"10px 14px",borderRadius:10,border:`2px solid ${err?"#ef4444":color+"55"}`,
              fontSize:20,letterSpacing:10,textAlign:"center",fontFamily:"monospace",
              boxSizing:"border-box",width:"100%"}}
          />
          {err && <div style={{fontSize:12,color:"#ef4444"}}>{err}</div>}
          <button onClick={save} style={{
            padding:"11px 0",borderRadius:12,border:"none",
            background:color,color:"#fff",fontWeight:900,fontSize:14,
            cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>
            שמור קוד
          </button>
        </div>
      )}
    </div>
  );
}
