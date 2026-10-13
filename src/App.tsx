import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  EMOJIS,
  ROLE_LABEL,
  canAssign,
  canBoost,
  canCreateMeeting,
  confidenceScore,
  currentPerson,
  personById,
  unreadCount,
  visiblePeople,
  visibleProjects,
  type Note,
  type PageId,
  type Person,
  type State,
  type Suggestion,
} from "./logic";
import { useStore } from "./store";

const NAV: { id: PageId; label: string }[] = [
  { id: "inicio", label: "Inicio" },
  { id: "proyectos", label: "Proyectos" },
  { id: "contabilidad", label: "Contabilidad" },
  { id: "notas", label: "Notas" },
  { id: "programas", label: "Programas" },
  { id: "reuniones", label: "Reuniones" },
  { id: "sugerencias", label: "Sugerencias" },
  { id: "equipo", label: "Equipo" },
];

function readHash(): PageId {
  const value = window.location.hash.replace("#", "");
  return NAV.some((item) => item.id === value) ? (value as PageId) : "inicio";
}

function usePage(): PageId {
  const [page, setPage] = useState<PageId>(readHash);
  useEffect(() => {
    const onHash = () => setPage(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return page;
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function nameOf(state: State, id: string): string {
  return personById(state, id)?.name ?? "Alguien del equipo";
}

export function App() {
  const { state, dispatch } = useStore();
  const page = usePage();
  const user = currentPerson(state);
  const unread = unreadCount(state);
  const [noticesOpen, setNoticesOpen] = useState(false);

  useEffect(() => {
    setNoticesOpen(false);
  }, [user.id]);

  function toggleNotices() {
    setNoticesOpen((open) => {
      if (!open) dispatch({ type: "mark-read" });
      return !open;
    });
  }

  return (
    <div className="app">
      <aside className="rail">
        <a className="brand" href="#inicio">
          <span>Empresa</span>
          <small>Portal interno</small>
        </a>
        <nav className="nav" aria-label="Secciones">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} aria-current={page === item.id ? "page" : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
        <button type="button" className="text-button" onClick={() => dispatch({ type: "reset" })}>
          Restablecer demostración
        </button>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{ROLE_LABEL[user.role]}</p>
            <h1>{NAV.find((item) => item.id === page)?.label}</h1>
          </div>
          <div className="top-actions">
            <label className="switcher">
              Entrar como
              <select
                data-testid="user-switch"
                value={user.id}
                onChange={(event) => dispatch({ type: "switch-user", userId: event.target.value })}
              >
                {state.people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} · {ROLE_LABEL[person.role]}
                  </option>
                ))}
              </select>
            </label>
            <div className="notice-wrap">
              <button
                type="button"
                className="bell"
                data-testid="notification-button"
                aria-expanded={noticesOpen}
                onClick={toggleNotices}
              >
                Avisos
                <span data-testid="notification-count">{unread}</span>
              </button>
              {noticesOpen ? (
                <div className="notice-panel" data-testid="notification-panel">
                  <strong>Notificaciones</strong>
                  {state.notices.length === 0 ? (
                    <p>Cuando alguien escriba una nota o un programa, el aviso aparecerá aquí.</p>
                  ) : (
                    <ul>
                      {state.notices.map((notice) => (
                        <li key={notice.id}>
                          <a href={`#${notice.page}`} onClick={() => setNoticesOpen(false)}>
                            <span>{notice.text}</span>
                            <small>{formatWhen(notice.createdAt)}</small>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </header>
        {state.banner ? (
          <p className={`banner banner-${state.banner.tone}`} data-testid="banner" role="status">
            {state.banner.text}
            <button type="button" onClick={() => dispatch({ type: "dismiss-banner" })} aria-label="Cerrar aviso">
              ×
            </button>
          </p>
        ) : null}
        <main className="main">
          {page === "inicio" ? <Inicio /> : null}
          {page === "proyectos" ? <Proyectos /> : null}
          {page === "contabilidad" ? <Contabilidad /> : null}
          {page === "notas" ? <Notas /> : null}
          {page === "programas" ? <Programas /> : null}
          {page === "reuniones" ? <Reuniones /> : null}
          {page === "sugerencias" ? <Sugerencias /> : null}
          {page === "equipo" ? <Equipo /> : null}
        </main>
      </div>
    </div>
  );
}

function Inicio() {
  const { state } = useStore();
  const user = currentPerson(state);
  const score = confidenceScore(state);
  const circle = visiblePeople(state);
  return (
    <section className="stack">
      <article className="hero">
        <div>
          <p className="eyebrow">Confianza del equipo</p>
          <p className="score" data-testid="confidence-score">
            {score}
          </p>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${score}%` }} />
          </div>
          <p>Los emojis que os enviáis suben esta confianza. El tope es 100.</p>
        </div>
        <div>
          <p className="eyebrow">{user.role === "contabilidad" ? "Tu círculo de proyectos" : "Equipo"}</p>
          <ul className="name-list" data-testid="home-circle">
            {circle.map((person) => (
              <li key={person.id} data-testid={`home-person-${person.id}`}>
                {person.name}
                <small>{person.id === user.id ? "Tú" : ROLE_LABEL[person.role]}</small>
              </li>
            ))}
          </ul>
        </div>
      </article>
      <article className="card">
        <h2>Avisos recientes</h2>
        <ul className="plain">
          {state.notices.slice(0, 4).map((notice) => (
            <li key={notice.id}>
              <a href={`#${notice.page}`}>{notice.text}</a>
              <small>{formatWhen(notice.createdAt)}</small>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function Proyectos() {
  const { state, dispatch } = useStore();
  const user = currentPerson(state);
  const projects = visibleProjects(state);
  const editor = canAssign(user.role);
  return (
    <section className="stack">
      <p className="lead">
        Cada proyecto guarda a sus personas. Contabilidad ve únicamente a quienes comparten proyecto con ella.
      </p>
      {projects.map((project) => (
        <article key={project.id} className="card" data-testid={`project-${project.id}`}>
          <h2>{project.name}</h2>
          <p>{project.summary}</p>
          {editor ? (
            <ul className="checks">
              {state.people.map((person) => {
                const checked = project.memberIds.includes(person.id);
                return (
                  <li key={person.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        data-testid={`assign-${project.id}-${person.id}`}
                        onChange={(event) =>
                          dispatch({
                            type: "assign",
                            projectId: project.id,
                            personId: person.id,
                            assigned: event.target.checked,
                          })
                        }
                      />
                      {person.name}
                      <small>{ROLE_LABEL[person.role]}</small>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="name-list">
              {project.memberIds.map((id) => (
                <li key={id}>
                  {nameOf(state, id)}
                  <small>{ROLE_LABEL[personById(state, id)?.role ?? "trabajador"]}</small>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}

function Contabilidad() {
  const { state } = useStore();
  const user = currentPerson(state);
  const projects = user.role === "contabilidad" ? visibleProjects(state) : state.projects;
  const allowed = new Set(visiblePeople(state, user.role === "contabilidad" ? user.id : user.id).map((person) => person.id));
  const people = user.role === "contabilidad" ? visiblePeople(state) : state.people;
  return (
    <section className="stack">
      <p className="lead" data-testid="accounting-rule">
        {user.role === "contabilidad"
          ? "Ves a las personas asignadas a tus proyectos. El resto del equipo no aparece en este listado."
          : "Este es el mapa que usa contabilidad: cada persona ve a quienes comparten sus proyectos."}
      </p>
      <ul className="people" data-testid="people-list">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} self={person.id === user.id} />
        ))}
      </ul>
      {user.role === "contabilidad" && people.length <= 1 ? (
        <p className="empty" data-testid="accounting-empty">
          Administración todavía no te ha asignado a un proyecto con más personas.
        </p>
      ) : null}
      <div className="project-pills">
        {projects.map((project) => (
          <article key={project.id} className="card slim">
            <h2>{project.name}</h2>
            <p>
              {project.memberIds
                .filter((id) => user.role !== "contabilidad" || allowed.has(id))
                .map((id) => nameOf(state, id))
                .join(" · ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PersonCard({ person, self }: { person: Person; self: boolean }) {
  return (
    <li className="person" data-testid={`person-${person.id}`}>
      <strong>{person.name}</strong>
      <span>{self ? "Tú" : ROLE_LABEL[person.role]}</span>
      <small>{person.title}</small>
    </li>
  );
}

function Notas() {
  const { state, dispatch } = useStore();
  const projects = visibleProjects(state);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [body, setBody] = useState("");
  const choices = useMemo(() => projects, [projects]);

  useEffect(() => {
    if (!choices.some((project) => project.id === projectId)) setProjectId(choices[0]?.id ?? "");
  }, [choices, projectId]);

  function publish(event: FormEvent) {
    event.preventDefault();
    dispatch({ type: "add-note", body, projectId });
    if (body.trim() && projectId) setBody("");
  }

  return (
    <section className="stack">
      <p className="lead">Una nota nueva avisa al equipo. Cualquier persona puede escribir debajo para seguir el hilo.</p>
      <form className="card form" data-testid="note-form" onSubmit={publish}>
        <label>
          Proyecto
          <select data-testid="note-project" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            {choices.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nota
          <textarea data-testid="note-body" rows={4} value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
        <button type="submit">Publicar nota</button>
      </form>
      {state.notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </section>
  );
}

function NoteCard({ note }: { note: Note }) {
  const { state, dispatch } = useStore();
  const [body, setBody] = useState("");
  const project = state.projects.find((item) => item.id === note.projectId);

  function comment(event: FormEvent) {
    event.preventDefault();
    dispatch({ type: "add-comment", noteId: note.id, body });
    if (body.trim()) setBody("");
  }

  return (
    <article className="card" data-testid={`note-${note.id}`}>
      <header className="split">
        <div>
          <strong>{nameOf(state, note.authorId)}</strong>
          <small>
            {project?.name} · {formatWhen(note.createdAt)}
          </small>
        </div>
      </header>
      <p>{note.body}</p>
      <Reactions
        reactions={note.reactions}
        onPick={(emoji) => dispatch({ type: "toggle-reaction", target: "note", targetId: note.id, emoji })}
      />
      <div className="thread">
        {note.comments.length === 0 ? <p className="empty">Esta nota todavía no tiene comentarios.</p> : null}
        <ul>
          {note.comments.map((commentItem) => (
            <li key={commentItem.id} data-testid={`comment-${commentItem.id}`}>
              <strong>{nameOf(state, commentItem.authorId)}</strong>
              <p>{commentItem.body}</p>
              <small>{formatWhen(commentItem.createdAt)}</small>
            </li>
          ))}
        </ul>
        <form className="form" data-testid={`comment-form-${note.id}`} onSubmit={comment}>
          <label>
            Escribir en la nota
            <textarea rows={2} value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
          <button type="submit">Publicar comentario</button>
        </form>
      </div>
    </article>
  );
}

function Reactions({
  reactions,
  onPick,
}: {
  reactions: { userId: string; emoji: string }[];
  onPick: (emoji: string) => void;
}) {
  const { state } = useStore();
  return (
    <div className="reactions">
      {EMOJIS.map((emoji) => {
        const count = reactions.filter((reaction) => reaction.emoji === emoji).length;
        const mine = reactions.some((reaction) => reaction.emoji === emoji && reaction.userId === state.currentUserId);
        return (
          <button key={emoji} type="button" aria-pressed={mine} onClick={() => onPick(emoji)}>
            {emoji} {count > 0 ? count : ""}
          </button>
        );
      })}
    </div>
  );
}

function Programas() {
  const { state, dispatch } = useStore();
  const projects = visibleProjects(state);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!projects.some((project) => project.id === projectId)) setProjectId(projects[0]?.id ?? "");
  }, [projects, projectId]);

  function publish(event: FormEvent) {
    event.preventDefault();
    dispatch({ type: "add-program", title, body, projectId });
    if (title.trim() && body.trim() && projectId) {
      setTitle("");
      setBody("");
    }
  }

  return (
    <section className="stack">
      <p className="lead">Publicar un programa avisa al equipo igual que una nota.</p>
      <form className="card form" data-testid="program-form" onSubmit={publish}>
        <label>
          Proyecto
          <select data-testid="program-project" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Título
          <input data-testid="program-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Detalle
          <textarea data-testid="program-body" rows={3} value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
        <button type="submit">Publicar programa</button>
      </form>
      {state.programs.map((program) => (
        <article key={program.id} className="card" data-testid={`program-${program.id}`}>
          <h2>{program.title}</h2>
          <p>{program.body}</p>
          <small>
            {nameOf(state, program.authorId)} · {state.projects.find((item) => item.id === program.projectId)?.name} ·{" "}
            {formatWhen(program.createdAt)}
          </small>
        </article>
      ))}
    </section>
  );
}

function Reuniones() {
  const { state, dispatch } = useStore();
  const user = currentPerson(state);
  const allowed = canCreateMeeting(user.role);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [place, setPlace] = useState("");
  const meetings = [...state.meetings].sort((a, b) => a.when.localeCompare(b.when));

  function publish(event: FormEvent) {
    event.preventDefault();
    dispatch({ type: "add-meeting", title, when, place });
    if (title.trim() && when && place.trim()) {
      setTitle("");
      setWhen("");
      setPlace("");
    }
  }

  return (
    <section className="stack">
      {allowed ? (
        <form className="card form" data-testid="meeting-form" onSubmit={publish}>
          <p className="lead">Administración convoca la reunión y el equipo recibe el aviso.</p>
          <label>
            Asunto
            <input data-testid="meeting-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Fecha y hora
            <input
              data-testid="meeting-when"
              type="datetime-local"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
            />
          </label>
          <label>
            Lugar
            <input data-testid="meeting-place" value={place} onChange={(event) => setPlace(event.target.value)} />
          </label>
          <button type="submit">Convocar reunión</button>
        </form>
      ) : (
        <p className="callout" data-testid="meeting-locked">
          Las reuniones las convoca administración. Aquí puedes consultar las que ya están en el calendario.
        </p>
      )}
      {meetings.map((meeting) => (
        <article key={meeting.id} className="card" data-testid={`meeting-${meeting.id}`}>
          <h2>{meeting.title}</h2>
          <p>
            {formatWhen(meeting.when)} · {meeting.place}
          </p>
          <small>Convoca {nameOf(state, meeting.authorId)}</small>
        </article>
      ))}
    </section>
  );
}

function Sugerencias() {
  const { state, dispatch } = useStore();
  const user = currentPerson(state);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const suggestions = [...state.suggestions].sort(
    (a, b) => b.boostedBy.length - a.boostedBy.length || b.createdAt.localeCompare(a.createdAt),
  );

  function publish(event: FormEvent) {
    event.preventDefault();
    dispatch({ type: "add-suggestion", title, body });
    if (title.trim() && body.trim()) {
      setTitle("");
      setBody("");
    }
  }

  return (
    <section className="stack">
      <p className="lead">Cualquier persona deja una sugerencia. Gerencia puede impulsarla para darle respaldo.</p>
      <form className="card form" data-testid="suggestion-form" onSubmit={publish}>
        <label>
          Título
          <input data-testid="suggestion-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Detalle
          <textarea data-testid="suggestion-body" rows={3} value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
        <button type="submit">Publicar sugerencia</button>
      </form>
      {suggestions.map((suggestion) => (
        <SuggestionCard key={suggestion.id} suggestion={suggestion} canImpulse={canBoost(user.role)} />
      ))}
    </section>
  );
}

function SuggestionCard({ suggestion, canImpulse }: { suggestion: Suggestion; canImpulse: boolean }) {
  const { state, dispatch } = useStore();
  const boosted = suggestion.boostedBy.length > 0;
  const mine = suggestion.boostedBy.includes(state.currentUserId);
  return (
    <article className={boosted ? "card boosted" : "card"} data-testid={`suggestion-${suggestion.id}`}>
      {boosted ? <p className="ribbon">Impulsada por gerencia</p> : <p className="ribbon quiet">En espera de gerencia</p>}
      <h2>{suggestion.title}</h2>
      <p>{suggestion.body}</p>
      <small>
        {nameOf(state, suggestion.authorId)} · {formatWhen(suggestion.createdAt)}
      </small>
      {suggestion.boostedBy.length > 0 ? (
        <p className="boosters">La impulsan {suggestion.boostedBy.map((id) => nameOf(state, id)).join(", ")}.</p>
      ) : null}
      <Reactions
        reactions={suggestion.reactions}
        onPick={(emoji) => dispatch({ type: "toggle-reaction", target: "suggestion", targetId: suggestion.id, emoji })}
      />
      {canImpulse ? (
        <button
          type="button"
          data-testid={`boost-${suggestion.id}`}
          disabled={mine}
          onClick={() => dispatch({ type: "boost", suggestionId: suggestion.id })}
        >
          {mine ? "Impulsada" : "Impulsar"}
        </button>
      ) : null}
    </article>
  );
}

function Equipo() {
  const { state, dispatch } = useStore();
  const user = currentPerson(state);
  const people = visiblePeople(state);
  const score = confidenceScore(state);
  const visibleIds = new Set(people.map((person) => person.id));
  const feed = state.encouragements.filter((item) => visibleIds.has(item.fromId) && visibleIds.has(item.toId));

  return (
    <section className="stack">
      <article className="hero compact">
        <div>
          <p className="eyebrow">Confianza del equipo</p>
          <p className="score" data-testid="confidence-score">
            {score}
          </p>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${score}%` }} />
          </div>
        </div>
        <p>
          {user.role === "contabilidad"
            ? "Puedes enviar un emoji a las personas de tus proyectos."
            : "Envía un emoji para reconocer el trabajo y subir la confianza del equipo."}
        </p>
      </article>
      <ul className="people">
        {people.map((person) => (
          <li key={person.id} className="person" data-testid={`team-${person.id}`}>
            <strong>{person.name}</strong>
            <span>{person.id === user.id ? "Tú" : ROLE_LABEL[person.role]}</span>
            {person.id === user.id ? null : (
              <div className="reactions">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    data-testid={`emoji-${person.id}-${emoji}`}
                    onClick={() => dispatch({ type: "send-emoji", toId: person.id, emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <article className="card">
        <h2>Ánimos enviados</h2>
        <ul className="plain" data-testid="emoji-feed">
          {feed.map((item) => (
            <li key={item.id}>
              {nameOf(state, item.fromId)} envió {item.emoji} a {nameOf(state, item.toId)}
              <small>{formatWhen(item.createdAt)}</small>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
