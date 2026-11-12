const config = window.brackenSupabase;
const ui = Object.fromEntries(['login', 'signin', 'account', 'status', 'upload', 'retry', 'load', 'out']
  .map(name => [name, document.querySelector('#cloud-' + name)]));
const importButton = document.querySelector('#import');
let client, owner, revision, draftKey, timer;
let dirty = false;
let conflict = false;
let busy = false;
let generation = 0;

function message(text) {
  ui.status.textContent = text;
}

function lock(locked) {
  app.inert = locked;
  importButton.disabled = locked;
}

function showCampaign(next) {
  if (dialog.open) dialog.close();
  state = next;
  selected = Math.min(selected, state.characters.length - 1);
  render();
}

function storeDraft() {
  try {
    if (dirty) localStorage.setItem(draftKey, JSON.stringify({state, revision}));
    else localStorage.removeItem(draftKey);
    return true;
  } catch {
    return false;
  }
}

function queueSave() {
  generation++;
  dirty = true;
  const retained = storeDraft();
  status.textContent = retained ? 'Draft saved in this browser' : 'Draft in memory. Export a backup to keep it.';
  if (conflict) return;
  ui.upload.hidden = true;
  message('Changes waiting to sync…');
  clearTimeout(timer);
  timer = setTimeout(push, 600);
}

function cloudQuery() {
  return client.from('campaign_saves_equipment');
}

async function fetchSave() {
  const {data, error} = await cloudQuery().select('state,revision').eq('user_id', owner).maybeSingle();
  if (error) throw error;
  if (data && (!validCampaign(data.state) || !Number.isInteger(data.revision) || data.revision < 1)) {
    throw new Error('The cloud save has an unsupported format.');
  }
  return data;
}

function synced() {
  ui.retry.hidden = true;
  status.textContent = 'Cloud save';
  message('Synced');
}

function showConflict() {
  conflict = true;
  ui.retry.hidden = true;
  ui.load.hidden = false;
  message('Another browser saved a newer campaign. Export your draft before loading the cloud copy.');
}

async function push() {
  if (!owner || !dirty || conflict || busy) return;
  busy = true;
  const sent = generation;
  const payload = structuredClone(state);
  try {
    const request = revision === null
      ? cloudQuery().insert({user_id: owner, state: payload, revision: 1})
      : cloudQuery().update({state: payload, revision: revision + 1}).eq('user_id', owner).eq('revision', revision);
    const {data, error} = await request.select('revision').maybeSingle();
    if (error && error.code !== '23505') throw error;
    if (error || !data) {
      showConflict();
      return;
    }
    revision = data.revision;
    dirty = sent !== generation;
    storeDraft();
    if (!dirty) synced();
  } catch {
    ui.retry.hidden = false;
    message('Could not sync. Your draft is still open. Retry or export a backup.');
    return;
  } finally {
    busy = false;
  }
  if (dirty) void push();
}

async function connect(user) {
  if (busy) return;
  busy = true;
  ui.retry.hidden = true;
  owner = user.id;
  draftKey = key + ':cloud:' + config.url + ':' + owner;
  ui.signin.open = false;
  ui.signin.hidden = true;
  ui.account.hidden = false;
  lock(true);
  message('Loading cloud save…');
  try {
    const remote = await fetchSave();
    let draft;
    try { draft = JSON.parse(localStorage.getItem(draftKey)); } catch {}
    revision = remote?.revision ?? null;
    if (draft && validCampaign(draft.state)) {
      showCampaign(draft.state);
      dirty = true;
      if (draft.revision !== revision) showConflict();
      else message('Syncing the saved browser draft…');
    } else if (remote) {
      showCampaign(remote.state);
      synced();
    } else {
      ui.upload.hidden = false;
      message('No cloud save yet. Import your backup or upload the campaign currently on screen.');
    }
    window.saveCampaignToCloud = queueSave;
    lock(false);
  } catch {
    ui.retry.hidden = false;
    message('Could not load the cloud save. Retry before editing.');
  } finally {
    busy = false;
  }
  if (window.saveCampaignToCloud && dirty && !conflict) void push();
}

ui.upload.onclick = () => {
  if (confirm('Create the cloud save from the campaign currently on screen?')) queueSave();
};
ui.retry.onclick = () => {
  if (!window.saveCampaignToCloud) void connect({id: owner});
  else if (dirty) void push();
  else void refresh();
};
ui.load.onclick = async () => {
  if (!conflict || busy || !confirm('Replace this draft with the latest cloud copy? Export a backup first if you want to keep the draft.')) return;
  busy = true;
  lock(true);
  try {
    const remote = await fetchSave();
    if (!remote) throw new Error();
    showCampaign(remote.state);
    revision = remote.revision;
    dirty = false;
    conflict = false;
    storeDraft();
    ui.load.hidden = true;
    synced();
  } catch {
    message('Could not load the cloud copy. Your draft is still open.');
  } finally {
    busy = false;
    lock(false);
  }
};
ui.out.onclick = async () => {
  if (busy) return;
  if (dirty && !confirm('Sign out with unsynced changes? Export a backup first if you want a separate copy.')) return;
  clearTimeout(timer);
  busy = true;
  lock(true);
  try {
    const {error} = await client.auth.signOut({scope: 'local'});
    if (error) throw error;
    location.reload();
  } catch {
    busy = false;
    lock(!window.saveCampaignToCloud);
    message('Could not sign out. Try again.');
  }
};

async function refresh() {
  if (!owner || !window.saveCampaignToCloud || busy || conflict) return;
  if (dirty) { void push(); return; }
  const seen = generation;
  try {
    const remote = await fetchSave();
    if (remote && !dirty && !busy && !conflict && generation === seen &&
        (revision === null || remote.revision > revision) && !dialog.open) {
      revision = remote.revision;
      showCampaign(remote.state);
      ui.upload.hidden = true;
      synced();
    }
  } catch {
    ui.retry.hidden = false;
    message('Could not check for newer cloud changes.');
  }
}

window.addEventListener('focus', refresh);
window.addEventListener('online', refresh);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void refresh();
});

if (!config?.url || !config.publishableKey) {
  message('Cloud sync is not configured. This browser uses a local save.');
} else {
  lock(true);
  message('Connecting to Supabase…');
  try {
    const {createClient} = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client = createClient(config.url, config.publishableKey);
    const {data, error} = await client.auth.getSession();
    if (error) throw error;
    if (data.session) await connect(data.session.user);
    else {
      ui.signin.hidden = false;
      lock(false);
      message('Sign in with the same account on both devices.');
    }
  } catch {
    message('Could not connect to Supabase. Check your configuration and reload.');
    lock(false);
  }
}

ui.login.onsubmit = async event => {
  event.preventDefault();
  const button = ui.login.querySelector('button');
  const fields = new FormData(ui.login);
  button.disabled = true;
  lock(true);
  message('Signing in…');
  try {
    const {data, error} = await client.auth.signInWithPassword({
      email: fields.get('email').trim(),
      password: fields.get('password'),
    });
    if (error) throw error;
    ui.login.reset();
    await connect(data.user);
  } catch {
    lock(false);
    message('Sign-in failed. Check your account and password, then try again.');
  } finally {
    button.disabled = false;
  }
};
