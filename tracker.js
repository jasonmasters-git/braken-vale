const key='bracken-vale-tracker-v1';
const slots=['Head','Cloak','Main hand','Ranged','Body armor','Off hand','Accessory','Pack'];
const stats=['Agility','Speed','Combat Skill','Toughness','Savvy','Armor (melee)','Armor (ranged)','XP','Injury turns'];
const make=(name,role,equipment={},notes='')=>({name,role,equipment,notes,stats:{}});
const starter={characters:[make('New character','')],campaign:{turn:'1',location:'',ap:'',gold:'',objective:'',threats:'',stash:'',pack:'',quests:'',sites:''},journal:[]};
let state=structuredClone(starter);
try{const saved=localStorage.getItem(key);if(saved)state=JSON.parse(saved)}catch{}
let view='warband', selected=0, activeSlot='';
const app=document.querySelector('#app'), dialog=document.querySelector('#equip'), form=document.querySelector('#equipForm'), status=document.querySelector('#status');
const esc=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function save(){if(window.saveCampaignToCloud){window.saveCampaignToCloud();return}try{localStorage.setItem(key,JSON.stringify(state));status.textContent='Saved in this browser'}catch{status.textContent='Browser storage unavailable. Export a backup to keep changes.'}}
const field=(label,scope,key,value,multi=false)=>'<label>'+esc(label)+(multi?'<textarea':'<input')+' data-scope="'+scope+'" data-key="'+esc(key)+'"'+(multi?'>'+esc(value)+'</textarea>':' value="'+esc(value)+'">')+'</label>';
const figure='<svg viewBox="0 0 120 250" role="img" aria-label="Armored adventurer silhouette"><g fill="#343c2d" stroke="#b49b65" stroke-width="2" stroke-linejoin="round"><path d="M37 72 20 99 9 171 27 177 43 130 38 176 31 231 49 239 61 178 72 239 90 231 81 175 77 130 93 177 110 171 99 99 83 72Z"/><path d="m39 78 21 12 23-12-3 49-20 22-20-22z" fill="#555841"/><path d="M42 42q0-23 18-23t18 23v19L60 75 42 61Z" fill="#555841"/><path d="M43 46h34M60 22v23M43 56l17 7 17-7M42 153h36M38 172h44"/><path d="m51 105 9-9 9 9-9 13z" fill="#edca80"/></g></svg>';
function subtitle(){const c=state.campaign;document.querySelector('#subtitle').textContent='Campaign turn '+(c.turn||'—')+' · '+(c.location||'Unknown location')}
function render(){
 subtitle();
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view===view));
 if(view==='warband'){
 const c=state.characters[selected];
 const buttons=(from,to)=>slots.slice(from,to).map(s=>'<button class="slot" data-slot="'+s+'"><b>'+s+'</b><span>'+esc(c.equipment[s]||'+ Equip item')+'</span></button>').join('');
 app.innerHTML='<section class="row"><h2>Warband</h2><button id="add" class="primary">+ Character</button></section><div class="card tabs" aria-label="Characters">'+state.characters.map((m,i)=>'<button data-character="'+i+'" aria-current="'+(i===selected)+'">'+esc(m.name||'Unnamed')+'</button>').join('')+'</div><div class="layout"><section class="card"><div class="eyebrow">Equipment</div><h2 id="characterTitle">'+esc(c.name||'Unnamed')+'</h2><div class="doll"><div class="slots">'+buttons(0,4)+'</div>'+figure+'<div class="slots">'+buttons(4,8)+'</div></div><p class="subtle">Tap a slot to equip, replace, or remove an item.</p></section><section class="card stack"><h3>Character sheet</h3><div class="fields">'+field('Name','character','name',c.name)+field('Role / background','character','role',c.role)+'</div><div class="fields">'+stats.map(s=>field(s,'stats',s,c.stats[s])).join('')+'</div>'+field('Skills, spells, traits and injuries','character','notes',c.notes,true)+'<div><button id="remove">Remove character</button></div></section></div>';
 }
 if(view==='campaign'){
 const c=state.campaign;
 const f=(label,k,m=false)=>field(label,'campaign',k,c[k],m);
 app.innerHTML='<h2>Campaign</h2><section class="card stack"><div class="fields">'+f('Turn','turn')+f('Adventure Points','ap')+f('Gold Marks','gold')+'</div>'+f('Current location','location')+f('Current objective','objective')+'</section><div class="layout"><section class="card stack"><h3>The region</h3>'+f('Threats and levels','threats',true)+f('Settlements, camps and delves','sites',true)+f('Quest progress','quests',true)+'</section><section class="card stack"><h3>Supplies</h3>'+f('Equipment stash','stash',true)+f('Warband backpack','pack',true)+'</section></div>';
 }
 if(view==='journal'){
 app.innerHTML='<h2>Campaign journal</h2><form id="entry" class="card stack"><label>New entry<textarea name="note" required placeholder="Record a battle, travel event, or discovery"></textarea></label><div><button class="primary">Add to turn '+esc(state.campaign.turn||'—')+'</button></div></form>'+state.journal.map((j,i)=>'<article class="card"><div class="row"><h3>Turn '+esc(j.turn)+'</h3><button data-delete="'+i+'">Delete entry</button></div><p style="white-space:pre-wrap">'+esc(j.note)+'</p></article>').join('');
 }
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.view){view=b.dataset.view;render()}
 if(b.dataset.character!==undefined){selected=Number(b.dataset.character);render()}
 if(b.id==='add'){state.characters.push(make('New character',''));selected=state.characters.length-1;save();render();app.querySelector('[data-key=name]').focus()}
 if(b.id==='remove'&&confirm('Remove this character and their equipment?')){state.characters.splice(selected,1);if(!state.characters.length)state.characters.push(make('New character',''));selected=Math.max(0,selected-1);save();render()}
 if(b.dataset.slot){activeSlot=b.dataset.slot;document.querySelector('#slotTitle').textContent=activeSlot;form.elements.namedItem('item').value=state.characters[selected].equipment[activeSlot]||'';dialog.showModal()}
 if(b.dataset.delete!==undefined&&confirm('Delete this journal entry?')){state.journal.splice(Number(b.dataset.delete),1);save();render()}
});
app.addEventListener('input',e=>{const {scope,key:k}=e.target.dataset;if(!scope)return;const c=state.characters[selected];const target={character:c,stats:c.stats,campaign:state.campaign}[scope];target[k]=e.target.value;save();if(k==='name'){app.querySelector('#characterTitle').textContent=target[k]||'Unnamed';app.querySelector('[data-character="'+selected+'"]').textContent=target[k]||'Unnamed'}if(scope==='campaign')subtitle()});
app.addEventListener('submit',e=>{if(e.target.id!=='entry')return;e.preventDefault();const note=e.target.elements.note.value.trim();if(note){state.journal.unshift({turn:state.campaign.turn||'—',note});save();render()}});
document.querySelector('#cancelEquip').onclick=()=>dialog.close();
form.onsubmit=e=>{e.preventDefault();const equipment=state.characters[selected].equipment;const item=form.elements.namedItem('item').value.trim();if(item)equipment[activeSlot]=item;else delete equipment[activeSlot];save();dialog.close();render();app.querySelector('[data-slot="'+activeSlot+'"]').focus()};
document.querySelector('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,...state},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='bracken-vale-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const file=document.querySelector('#file');
document.querySelector('#import').onclick=()=>file.click();
const record=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&keys.every(k=>typeof x[k]==='string');
function validCampaign(data){return Boolean(data)&&!(!Array.isArray(data.characters)||!data.characters.length||!data.characters.every(c=>record(c,['name','role','notes'])&&record(c.stats,[])&&record(c.equipment,[])&&Object.values(c.stats).every(v=>typeof v==='string')&&Object.values(c.equipment).every(v=>typeof v==='string'))||!record(data.campaign,Object.keys(starter.campaign))||!Array.isArray(data.journal)||!data.journal.every(j=>record(j,['turn','note'])));}
file.onchange=async()=>{if(!file.files.length)return;try{const data=JSON.parse(await file.files[0].text());if(data.version!==1||!validCampaign(data))throw Error();if(confirm('Replace the current campaign with the imported backup?')){state={characters:data.characters,campaign:data.campaign,journal:data.journal};selected=0;save();render()}}catch{alert('This file is not a valid Bracken Vale backup.')}finally{file.value=''}};
render();
