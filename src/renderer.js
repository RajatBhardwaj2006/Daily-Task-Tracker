const state = { data: null, filter: 'all', editingId: null, selectedDate: todayKey() };

const $ = (id) => document.getElementById(id);
function todayKey(){ const d=new Date(); return localKey(d); }
function localKey(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function dateObj(key){ const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function fmt(key){ return dateObj(key).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'}); }
function save(){ return window.trackerAPI.save(state.data); }
function activeTasks(key){ return state.data.tasks.filter(t => t.from <= key && t.to >= key); }
function statusForDay(key){
  const tasks=activeTasks(key), must=tasks.filter(t=>t.type==='must'), optional=tasks.filter(t=>t.type==='optional');
  const done=state.data.days[key]||{};
  const mustDone=must.filter(t=>!!done[t.id]).length, optionalDone=optional.filter(t=>!!done[t.id]).length;
  if(!tasks.length) return {status:'neutral',mustTotal:0,mustDone:0,optTotal:0,optDone:0};
  if(must.length && mustDone<must.length) return {status:'red',mustTotal:must.length,mustDone,optTotal:optional.length,optDone:optionalDone};
  if(optional.length && optionalDone===optional.length) return {status:'bright',mustTotal:must.length,mustDone,optTotal:optional.length,optDone:optionalDone};
  return {status:'green',mustTotal:must.length,mustDone,optTotal:optional.length,optDone:optionalDone};
}
function ensureDay(key){ if(!state.data.days[key]) state.data.days[key]={}; return state.data.days[key]; }
function daysInRange(start,end){ const out=[]; let d=dateObj(start), e=dateObj(end); while(d<=e){out.push(localKey(d));d=addDays(d,1)} return out; }
function render(){ renderHeader(); renderStats(); renderCalendar(); renderTasks(); }
function renderHeader(){
  const t=todayKey(), s=statusForDay(t); $('dateLabel').textContent=new Date().toLocaleDateString(undefined,{weekday:'long'}).toUpperCase();
  $('headline').textContent = s.status==='bright' ? 'Perfect day. Keep going.' : s.status==='green' ? 'Must-dos complete.' : 'Keep the streak alive.';
  $('subheadline').textContent = s.mustTotal ? `${s.mustDone}/${s.mustTotal} must tasks complete${s.optTotal?` • ${s.optDone}/${s.optTotal} optional`:''}.` : 'Add your tasks and make today count.';
  $('rangeLabel').textContent=`Tracker: ${fmt(state.data.settings.startDate)} → ${fmt(state.data.settings.endDate)}`;
}
function renderStats(){
  const s=statusForDay(todayKey());
  $('dailyProgress').textContent=`${s.mustDone} / ${s.mustTotal}`;
  $('dailyBar').style.width=s.mustTotal?`${Math.round(s.mustDone/s.mustTotal*100)}%`:'0%';
  $('dailyStatus').textContent=s.mustTotal?(s.status==='red'?'Must task pending': 'All must tasks done'):'No must tasks yet';
  $('optionalStatus').textContent=s.optTotal?`${s.optDone}/${s.optTotal} optional`:'';
  $('streak').textContent=calcStreak(); $('followed').textContent=calcFollowed();
  const card=$('statusCard'); card.classList.toggle('done',s.status==='green'); card.classList.toggle('perfect',s.status==='bright');
  $('todayDot').className=`status-dot ${s.status}`; $('todayStatus').textContent=s.status==='red'?'Pending':s.status==='neutral'?'No tasks':s.status==='bright'?'Perfect':'Completed';
  $('todayStatusCopy').textContent=s.status==='red'?'Finish your must tasks.':s.status==='bright'?'Must + optional complete.':s.status==='green'?'Optional tasks remain.':'Add a task to start.';
}
function calcFollowed(){
  const start=state.data.settings.startDate, end=state.data.settings.endDate, today=todayKey(); let last=today<end?today:end; if(last<start)return 0;
  return daysInRange(start,last).filter(k=>statusForDay(k).mustTotal>0 && statusForDay(k).status!=='red').length;
}
function calcStreak(){
  let d=dateObj(todayKey()), start=dateObj(state.data.settings.startDate), streak=0;
  while(d>=start){const s=statusForDay(localKey(d)); if(s.mustTotal===0 || s.status==='red') break; streak++; d=addDays(d,-1);} return streak;
}
function renderCalendar(){
  const start=dateObj(state.data.settings.startDate), end=dateObj(state.data.settings.endDate); const days=daysInRange(localKey(start),localKey(end));
  const first=addDays(start,-((start.getDay()+6)%7)); const last=addDays(end,(7-end.getDay())%7); const all=daysInRange(localKey(first),localKey(last));
  const months=[]; let cursor=new Date(start.getFullYear(),start.getMonth(),1), endMonth=new Date(end.getFullYear(),end.getMonth(),1);
  while(cursor<=endMonth){ months.push(new Date(cursor)); cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1); }
  let html='<div class="calendar"><div class="month-row" style="grid-template-columns:repeat('+months.length+',minmax(70px,1fr));">';
  months.forEach(m=>{ html+=`<span>${m.toLocaleDateString(undefined,{month:'short',year:'numeric'})}</span>`; });
  html+='</div><div class="grid-row"><div class="weekdays"><span>M</span><span></span><span>W</span><span></span><span>F</span><span></span><span></span></div><div class="weeks">';
  all.forEach(k=>{ const inRange=days.includes(k), future=k>todayKey(); let status=inRange?statusForDay(k).status:'outside'; if(future && inRange) status='neutral'; html+=`<div class="day ${inRange?status+' '+(future?'future':''):'outside'}" data-date="${k}" title="${inRange?fmt(k):''}"></div>`; });
  html+='</div></div></div>'; $('calendar').innerHTML=html;
  $('calendar').querySelectorAll('.day:not(.outside)').forEach(el=>{el.addEventListener('click',()=>{state.selectedDate=el.dataset.date; renderTasks(); window.scrollTo({top:document.querySelector('.tasks-panel').offsetTop-30,behavior:'smooth'});})});
}
function renderTasks(){
  const key=state.selectedDate || todayKey(); const tasks=activeTasks(key).filter(t=>state.filter==='all'||t.type===state.filter); const all=activeTasks(key); $('taskDateHint').textContent=`${fmt(key)} • ${all.length} active task${all.length===1?'':'s'}`;
  $('taskList').innerHTML=''; $('emptyState').classList.toggle('hidden',tasks.length>0);
  const done=state.data.days[key]||{};
  tasks.forEach(t=>{
    const row=document.createElement('div'); row.className='task-row';
    row.innerHTML=`<div><div class="task-name">${escapeHtml(t.name)}</div><div class="task-meta">${t.type==='must'?'Must-do':'Optional'}</div></div><div class="type-pill ${t.type}">${t.type}</div><div class="date-cell">${fmt(t.from)}</div><div class="date-cell to">${fmt(t.to)}</div><button class="check ${done[t.id]?'done':''} ${t.type==='optional'?'optional':''}" aria-label="Toggle task">${done[t.id]?'✓':''}</button><button class="delete-btn" title="Delete task">×</button>`;
    row.querySelector('.check').addEventListener('click',()=>toggleTask(t.id,key));
    row.querySelector('.delete-btn').addEventListener('click',()=>deleteTask(t.id));
    $('taskList').appendChild(row);
  });
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function toggleTask(id,key){ const d=ensureDay(key); d[id]=!d[id]; await save(); render(); }
async function deleteTask(id){ if(!confirm('Delete this task? Its existing completion history will also be removed.'))return; state.data.tasks=state.data.tasks.filter(t=>t.id!==id); Object.values(state.data.days).forEach(d=>delete d[id]); await save(); render(); }
function openTaskModal(){ state.editingId=null; $('modalTitle').textContent='Add task'; $('taskForm').reset(); $('taskFrom').value=state.data.settings.startDate; $('taskTo').value=state.data.settings.endDate; $('modal').classList.remove('hidden'); setTimeout(()=>$('taskName').focus(),50); }
function closeTaskModal(){ $('modal').classList.add('hidden'); }
function openSettings(){ $('globalFrom').value=state.data.settings.startDate; $('globalTo').value=state.data.settings.endDate; $('settingsModal').classList.remove('hidden'); }
function closeSettings(){ $('settingsModal').classList.add('hidden'); }
$('addTaskBtn').onclick=openTaskModal; $('emptyAddBtn').onclick=openTaskModal; $('closeModal').onclick=closeTaskModal; $('cancelTask').onclick=closeTaskModal;
$('closeSettings').onclick=closeSettings; $('settingsBtn').onclick=openSettings; $('todayBtn').onclick=()=>{state.selectedDate=todayKey();render();};
$('taskForm').addEventListener('submit',async e=>{e.preventDefault();const from=$('taskFrom').value,to=$('taskTo').value;if(from>to){alert('End date must be on or after start date.');return}state.data.tasks.push({id:crypto.randomUUID(),name:$('taskName').value.trim(),type:$('taskType').value,from,to});await save();closeTaskModal();render();});
$('settingsForm').addEventListener('submit',async e=>{e.preventDefault();const from=$('globalFrom').value,to=$('globalTo').value;if(from>to){alert('End date must be on or after start date.');return}state.data.settings={startDate:from,endDate:to};await save();closeSettings();state.selectedDate=todayKey();render();});
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.filter=b.dataset.filter;renderTasks();});
$('backupBtn').onclick=openSettings;
$('exportBtn').onclick=async()=>{const r=await window.trackerAPI.exportData(state.data);if(!r.canceled)alert('Backup exported successfully.');};
$('importBtn').onclick=async()=>{const r=await window.trackerAPI.importData();if(r.canceled)return;if(r.error){alert(r.error);return}state.data=r.data;state.selectedDate=todayKey();closeSettings();render();};
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeTaskModal();closeSettings();}});
(async()=>{state.data=await window.trackerAPI.load(); if(!state.data.tasks)state.data.tasks=[];if(!state.data.days)state.data.days={};if(!state.data.settings)state.data.settings={startDate:'2026-01-01',endDate:'2027-12-31'};render();})();
