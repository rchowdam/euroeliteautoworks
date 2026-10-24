import { useEffect, useRef, useState } from "react";
import { CONFIG } from "../config.js";
import Logo from "../components/Logo.jsx";

// Office page at /admin: upload photos and videos for the gallery.
// Access is the shared office key (ADMIN_KEY on the server), kept for this browser tab only.
// Replace with real logins (as in Steam Car Wash Pro) when there is a team portal.

const KEY_STORE = "eeaw-admin-key";
const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";

function readKey() {
  try {
    return sessionStorage.getItem(KEY_STORE) || "";
  } catch {
    return "";
  }
}

function storeKey(key) {
  try {
    if (key) sessionStorage.setItem(KEY_STORE, key);
    else sessionStorage.removeItem(KEY_STORE);
  } catch {
    // Private mode etc.: the key just isn't remembered.
  }
}

async function api(key, path, { method = "GET", body } = {}) {
  const res = await fetch(`${CONFIG.apiBaseUrl}/api${path}`, {
    method,
    headers: { "X-Admin-Key": key, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(typeof data?.detail === "string" ? data.detail : `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Step 2 of an upload: a form POST to S3 (or to the API locally), with progress.
// fetch() can't report upload progress, so this uses XMLHttpRequest.
function sendFile(key, target, file, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    Object.entries(target.fields).forEach(([k, v]) => form.append(k, v));
    form.append("file", file); // S3 needs the file last
    const local = target.url.startsWith("/");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", local ? `${CONFIG.apiBaseUrl}${target.url}` : target.url);
    if (local) xhr.setRequestHeader("X-Admin-Key", key);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(xhr.status === 413 ? "File is too big." : `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload failed: check the connection (or the bucket's CORS settings)."));
    xhr.send(form);
  });
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;

export default function Admin() {
  const [key, setKey] = useState(readKey);

  useEffect(() => {
    document.title = "Office · Euro Elite Auto Works";
  }, []);

  function signOut() {
    storeKey("");
    setKey("");
  }

  return (
    <div className="admin">
      <header className="header">
        <div className="wrap header__inner">
          <a href="/" className="header__brand" aria-label="Euro Elite Auto Works, website">
            <Logo />
          </a>
          <div className="admin__bar">
            <span className="label">Office</span>
            {key && (
              <button className="btn btn--line btn--sm" onClick={signOut}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="wrap admin__main">
        {key ? <MediaManager adminKey={key} onBadKey={signOut} /> : <SignIn onSignIn={setKey} />}
      </main>
    </div>
  );
}

function SignIn({ onSignIn }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState({ busy: false, error: "" });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "" });
    try {
      await api(value.trim(), "/media");
      storeKey(value.trim());
      onSignIn(value.trim());
    } catch (err) {
      setState({ busy: false, error: err.status === 401 ? "Wrong office key." : err.message });
    }
  }

  return (
    <form className="form admin__signin" onSubmit={submit}>
      <h1>Office sign-in</h1>
      <label className="field">
        <span className="field__label">Office key</span>
        <input type="password" value={value} onChange={(e) => setValue(e.target.value)} required autoFocus autoComplete="current-password" />
      </label>
      <button className="btn btn--dark btn--block" disabled={state.busy}>
        {state.busy ? "Checking…" : "Sign in"}
      </button>
      {state.error && (
        <p className="form__msg form__msg--error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

function MediaManager({ adminKey, onBadKey }) {
  const [items, setItems] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const call = async (path, opts) => {
    try {
      return await api(adminKey, path, opts);
    } catch (err) {
      if (err.status === 401) onBadKey();
      throw err;
    }
  };

  useEffect(() => {
    call("/media")
      .then(setItems)
      .catch((err) => {
        setError(err.message);
      });
  }, [adminKey]);

  const patchUpload = (id, change) => {
    setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...change } : u)));
  };

  async function uploadOne(file, id) {
    try {
      const target = await call("/media/uploads", { method: "POST", body: { content_type: file.type, size: file.size } });
      await sendFile(adminKey, target, file, (p) => patchUpload(id, { progress: p }));
      const item = await call("/media", { method: "POST", body: { key: target.key } });
      setItems((list) => [item, ...(list || [])]);
      setUploads((list) => list.filter((u) => u.id !== id));
    } catch (err) {
      patchUpload(id, { error: err.message });
    }
  }

  function pick(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const added = files.map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name, size: f.size, progress: 0, error: "" }));
    setUploads((list) => [...list, ...added]);
    // One at a time, so a slow connection isn't split across several big videos.
    (async () => {
      for (let i = 0; i < files.length; i++) await uploadOne(files[i], added[i].id);
    })();
  }

  async function update(item, change) {
    try {
      const saved = await call(`/media/${item.id}`, { method: "PATCH", body: change });
      setItems((list) => list.map((m) => (m.id === saved.id ? saved : m)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete this ${item.kind}? It is removed from the website and from storage.`)) return;
    try {
      await call(`/media/${item.id}`, { method: "DELETE" });
      setItems((list) => list.filter((m) => m.id !== item.id));
    } catch (err) {
      setError(err.message);
    }
  }

  const published = items ? items.filter((m) => m.published).length : 0;

  return (
    <>
      <div className="admin__head">
        <div>
          <span className="eyebrow">Website</span>
          <h1>Photos &amp; videos</h1>
          <p className="admin__sub">
            Shown in the “Inside the workshop” section of the website, newest first.
            {items && ` ${published} of ${items.length} on the site.`}
          </p>
        </div>
        <button className="btn btn--dark" onClick={() => fileInput.current.click()}>
          Upload photos or videos
        </button>
        <input ref={fileInput} type="file" accept={ACCEPT} multiple hidden onChange={pick} />
      </div>
      <p className="admin__hint">JPG, PNG or WebP photos; MP4, WebM or MOV videos. MP4 plays in every browser.</p>

      {error && (
        <p className="form__msg form__msg--error" role="alert">
          {error}
        </p>
      )}

      {uploads.length > 0 && (
        <ul className="uploads">
          {uploads.map((u) => (
            <li key={u.id} className={u.error ? "is-error" : ""}>
              <span className="uploads__name">{u.name}</span>
              <span className="mono">{mb(u.size)}</span>
              {u.error ? (
                <>
                  <span className="uploads__error">{u.error}</span>
                  <button className="btn btn--line btn--sm" onClick={() => setUploads((l) => l.filter((x) => x.id !== u.id))}>
                    Dismiss
                  </button>
                </>
              ) : (
                <span className="uploads__bar" aria-label={`${Math.round(u.progress * 100)}%`}>
                  <span style={{ width: `${u.progress * 100}%` }} />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {items === null && !error && <p className="admin__sub">Loading…</p>}
      {items && items.length === 0 && uploads.length === 0 && (
        <p className="admin__empty">Nothing uploaded yet. The gallery section stays hidden on the website until something is published.</p>
      )}

      {items && items.length > 0 && (
        <ul className="media-list">
          {items.map((m) => (
            <MediaCard key={m.id} item={m} onUpdate={update} onRemove={remove} />
          ))}
        </ul>
      )}
    </>
  );
}

function MediaCard({ item, onUpdate, onRemove }) {
  const [caption, setCaption] = useState(item.caption || "");

  function saveCaption() {
    if (caption.trim() !== (item.caption || "")) onUpdate(item, { caption: caption.trim() });
  }

  return (
    <li className={`media-card${item.published ? "" : " is-hidden"}`}>
      <div className="media-card__thumb">
        {item.kind === "video" ? (
          <video src={`${item.url}#t=0.1`} controls playsInline preload="metadata" />
        ) : (
          <img src={item.url} alt="" loading="lazy" />
        )}
        <span className="media-card__kind mono">{item.kind}</span>
      </div>
      <div className="media-card__body">
        <label className="field">
          <span className="field__label">Caption</span>
          <input
            value={caption}
            maxLength={200}
            placeholder="e.g. DQ200 clutch replacement"
            onChange={(e) => setCaption(e.target.value)}
            onBlur={saveCaption}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.target.blur();
            }}
          />
        </label>
        <div className="media-card__row">
          <label className="check">
            <input type="checkbox" checked={item.published} onChange={(e) => onUpdate(item, { published: e.target.checked })} />
            On the website
          </label>
          <span className="mono media-card__meta">{mb(item.size)}</span>
          <button className="link-btn" onClick={() => onRemove(item)}>
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
