export type Role = "administrador" | "gerencia" | "contabilidad" | "trabajador";

export type PageId =
  | "inicio"
  | "proyectos"
  | "contabilidad"
  | "notas"
  | "programas"
  | "reuniones"
  | "sugerencias"
  | "equipo";

export type NoticeKind =
  | "nota"
  | "programa"
  | "comentario"
  | "reunion"
  | "sugerencia"
  | "impulso"
  | "emoji";

export interface Person {
  id: string;
  name: string;
  role: Role;
  title: string;
}

export interface Project {
  id: string;
  name: string;
  summary: string;
  memberIds: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Note {
  id: string;
  authorId: string;
  projectId: string;
  body: string;
  createdAt: string;
  comments: Comment[];
  reactions: Reaction[];
}

export interface Program {
  id: string;
  authorId: string;
  projectId: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  authorId: string;
  title: string;
  when: string;
  place: string;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  boostedBy: string[];
  reactions: Reaction[];
}

export interface Encouragement {
  id: string;
  fromId: string;
  toId: string;
  emoji: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  kind: NoticeKind;
  actorId: string;
  text: string;
  page: PageId;
  createdAt: string;
  readBy: string[];
}

export interface Banner {
  tone: "ok" | "warn";
  text: string;
}

export interface State {
  people: Person[];
  projects: Project[];
  notes: Note[];
  programs: Program[];
  meetings: Meeting[];
  suggestions: Suggestion[];
  encouragements: Encouragement[];
  notices: Notice[];
  currentUserId: string;
  seq: number;
  banner: Banner | null;
}

export const EMOJIS = ["👏", "💪", "🤝", "⭐", "🌟"] as const;

export const ROLE_LABEL: Record<Role, string> = {
  administrador: "Administración",
  gerencia: "Gerencia",
  contabilidad: "Contabilidad",
  trabajador: "Trabajador",
};

const PEOPLE: Person[] = [
  { id: "elena", name: "Elena Varga", role: "administrador", title: "Administración" },
  { id: "marcos", name: "Marcos Vidal", role: "gerencia", title: "Gerencia" },
  { id: "carmen", name: "Carmen Ruiz", role: "contabilidad", title: "Contabilidad" },
  { id: "pedro", name: "Pedro Salas", role: "trabajador", title: "Operaciones" },
  { id: "lucia", name: "Lucía Ferrer", role: "trabajador", title: "Operaciones" },
  { id: "andres", name: "Andrés Molina", role: "trabajador", title: "Operaciones" },
];

const ALL_IDS = PEOPLE.map((person) => person.id);

export function seedState(): State {
  return {
    people: PEOPLE.map((person) => ({ ...person })),
    projects: [
      {
        id: "norte",
        name: "Proyecto Norte",
        summary: "Almacén y entregas de la zona norte.",
        memberIds: ["carmen", "pedro", "andres"],
      },
      {
        id: "sur",
        name: "Proyecto Sur",
        summary: "Rutas e incidencias de la zona sur.",
        memberIds: ["lucia", "andres"],
      },
    ],
    notes: [
      {
        id: "nota-norte",
        authorId: "pedro",
        projectId: "norte",
        body: "En Norte cerramos el inventario del almacén 2. Falta cuadrar las cajas del viernes.",
        createdAt: "2026-10-12T09:30:00.000Z",
        comments: [],
        reactions: [],
      },
    ],
    programs: [
      {
        id: "prog-norte",
        authorId: "andres",
        projectId: "norte",
        title: "Programa semanal de Norte",
        body: "Lunes recuento, miércoles entregas y viernes cierre con contabilidad.",
        createdAt: "2026-10-12T11:00:00.000Z",
      },
    ],
    meetings: [
      {
        id: "reu-octubre",
        authorId: "elena",
        title: "Cierre de octubre",
        when: "2026-10-20T10:00",
        place: "Sala 1",
        createdAt: "2026-10-11T08:00:00.000Z",
      },
    ],
    suggestions: [
      {
        id: "sug-incidencias",
        authorId: "lucia",
        title: "Canal corto de incidencias",
        body: "Abrir un aviso breve antes del viernes para no esperar a la reunión.",
        createdAt: "2026-10-12T16:10:00.000Z",
        boostedBy: [],
        reactions: [],
      },
    ],
    encouragements: [
      { id: "enc-1", fromId: "marcos", toId: "pedro", emoji: "👏", createdAt: "2026-10-12T12:00:00.000Z" },
      { id: "enc-2", fromId: "elena", toId: "lucia", emoji: "🤝", createdAt: "2026-10-12T12:05:00.000Z" },
      { id: "enc-3", fromId: "pedro", toId: "andres", emoji: "💪", createdAt: "2026-10-12T12:20:00.000Z" },
      { id: "enc-4", fromId: "marcos", toId: "carmen", emoji: "⭐", createdAt: "2026-10-12T12:40:00.000Z" },
    ],
    notices: [
      {
        id: "av-1",
        kind: "nota",
        actorId: "pedro",
        text: "Pedro Salas escribió una nota",
        page: "notas",
        createdAt: "2026-10-12T09:30:00.000Z",
        readBy: [...ALL_IDS],
      },
      {
        id: "av-2",
        kind: "programa",
        actorId: "andres",
        text: "Andrés Molina publicó un programa",
        page: "programas",
        createdAt: "2026-10-12T11:00:00.000Z",
        readBy: [...ALL_IDS],
      },
    ],
    currentUserId: "carmen",
    seq: 20,
    banner: null,
  };
}

export type Action =
  | { type: "switch-user"; userId: string }
  | { type: "dismiss-banner" }
  | { type: "mark-read" }
  | { type: "reset" }
  | { type: "add-note"; body: string; projectId: string; at?: string }
  | { type: "add-comment"; noteId: string; body: string; at?: string }
  | { type: "toggle-reaction"; target: "note" | "suggestion"; targetId: string; emoji: string }
  | { type: "add-program"; title: string; body: string; projectId: string; at?: string }
  | { type: "add-meeting"; title: string; when: string; place: string; at?: string }
  | { type: "add-suggestion"; title: string; body: string; at?: string }
  | { type: "boost"; suggestionId: string }
  | { type: "send-emoji"; toId: string; emoji: string; at?: string }
  | { type: "assign"; projectId: string; personId: string; assigned: boolean };

export function personById(state: State, id: string): Person | undefined {
  return state.people.find((person) => person.id === id);
}

export function currentPerson(state: State): Person {
  return personById(state, state.currentUserId) ?? state.people[0];
}

export function canCreateMeeting(role: Role): boolean {
  return role === "administrador";
}

export function canBoost(role: Role): boolean {
  return role === "gerencia" || role === "administrador";
}

export function canAssign(role: Role): boolean {
  return role === "administrador";
}

export function visiblePeople(state: State, userId = state.currentUserId): Person[] {
  const user = personById(state, userId);
  if (!user) return [];
  if (user.role !== "contabilidad") return state.people;
  const ids = new Set<string>();
  for (const project of state.projects) {
    if (!project.memberIds.includes(userId)) continue;
    for (const memberId of project.memberIds) ids.add(memberId);
  }
  return state.people.filter((person) => ids.has(person.id));
}

export function visibleProjects(state: State, userId = state.currentUserId): Project[] {
  const user = personById(state, userId);
  if (!user) return [];
  if (user.role === "administrador" || user.role === "gerencia") return state.projects;
  return state.projects.filter((project) => project.memberIds.includes(userId));
}

export function confidenceScore(state: State): number {
  const reactions =
    state.notes.reduce((total, note) => total + note.reactions.length, 0) +
    state.suggestions.reduce((total, suggestion) => total + suggestion.reactions.length, 0);
  return Math.min(100, 42 + (state.encouragements.length + reactions) * 4);
}

export function unreadCount(state: State, userId = state.currentUserId): number {
  return state.notices.filter((notice) => !notice.readBy.includes(userId)).length;
}

function nextId(state: State, prefix: string): { id: string; seq: number } {
  const seq = state.seq + 1;
  return { id: `${prefix}-${seq}`, seq };
}

function stamp(at?: string): string {
  return at ?? new Date().toISOString();
}

function notify(
  state: State,
  seq: number,
  kind: NoticeKind,
  actor: Person,
  text: string,
  page: PageId,
  at: string,
): { notices: Notice[]; seq: number } {
  const issued = nextId({ ...state, seq }, "av");
  return {
    seq: issued.seq,
    notices: [
      {
        id: issued.id,
        kind,
        actorId: actor.id,
        text: `${actor.name} ${text}`,
        page,
        createdAt: at,
        readBy: [actor.id],
      },
      ...state.notices,
    ],
  };
}

function warn(state: State, text: string): State {
  return { ...state, banner: { tone: "warn", text } };
}

function ok(state: State, text: string, patch: Partial<State>): State {
  return { ...state, ...patch, banner: { tone: "ok", text } };
}

function toggleReaction(reactions: Reaction[], userId: string, emoji: string): Reaction[] {
  const exists = reactions.some((reaction) => reaction.userId === userId && reaction.emoji === emoji);
  if (exists) return reactions.filter((reaction) => !(reaction.userId === userId && reaction.emoji === emoji));
  return [...reactions, { userId, emoji }];
}

export function reducer(state: State, action: Action): State {
  const actor = currentPerson(state);

  switch (action.type) {
    case "reset":
      return seedState();
    case "dismiss-banner":
      return { ...state, banner: null };
    case "switch-user": {
      if (!personById(state, action.userId)) return state;
      const unread = unreadCount(state, action.userId);
      return {
        ...state,
        currentUserId: action.userId,
        banner:
          unread > 0
            ? {
                tone: "ok",
                text: `Tienes ${unread} ${unread === 1 ? "notificación sin leer" : "notificaciones sin leer"}.`,
              }
            : null,
      };
    }
    case "mark-read":
      return {
        ...state,
        notices: state.notices.map((notice) =>
          notice.readBy.includes(actor.id) ? notice : { ...notice, readBy: [...notice.readBy, actor.id] },
        ),
      };
    case "add-note": {
      const body = action.body.trim();
      if (!body) return warn(state, "Escribe la nota antes de publicarla.");
      const project = state.projects.find((item) => item.id === action.projectId);
      if (!project) return warn(state, "Elige un proyecto para la nota.");
      const at = stamp(action.at);
      const issued = nextId(state, "nota");
      const noted = notify(state, issued.seq, "nota", actor, "escribió una nota", "notas", at);
      return ok(state, "Nota publicada. El equipo ha recibido la notificación.", {
        seq: noted.seq,
        notes: [
          {
            id: issued.id,
            authorId: actor.id,
            projectId: project.id,
            body,
            createdAt: at,
            comments: [],
            reactions: [],
          },
          ...state.notes,
        ],
        notices: noted.notices,
      });
    }
    case "add-comment": {
      const body = action.body.trim();
      if (!body) return warn(state, "Escribe tu comentario en la nota.");
      const note = state.notes.find((item) => item.id === action.noteId);
      if (!note) return warn(state, "Esa nota ya no está en el tablón.");
      const at = stamp(action.at);
      const issued = nextId(state, "com");
      const noted = notify(state, issued.seq, "comentario", actor, "escribió en una nota", "notas", at);
      return ok(state, "Comentario publicado en la nota. El equipo ha recibido la notificación.", {
        seq: noted.seq,
        notes: state.notes.map((item) =>
          item.id === note.id
            ? {
                ...item,
                comments: [...item.comments, { id: issued.id, authorId: actor.id, body, createdAt: at }],
              }
            : item,
        ),
        notices: noted.notices,
      });
    }
    case "toggle-reaction": {
      if (action.target === "note") {
        return {
          ...state,
          banner: null,
          notes: state.notes.map((note) =>
            note.id === action.targetId
              ? { ...note, reactions: toggleReaction(note.reactions, actor.id, action.emoji) }
              : note,
          ),
        };
      }
      return {
        ...state,
        banner: null,
        suggestions: state.suggestions.map((suggestion) =>
          suggestion.id === action.targetId
            ? { ...suggestion, reactions: toggleReaction(suggestion.reactions, actor.id, action.emoji) }
            : suggestion,
        ),
      };
    }
    case "add-program": {
      const title = action.title.trim();
      const body = action.body.trim();
      if (!title || !body) return warn(state, "El programa necesita título y detalle.");
      const project = state.projects.find((item) => item.id === action.projectId);
      if (!project) return warn(state, "Elige un proyecto para el programa.");
      const at = stamp(action.at);
      const issued = nextId(state, "prog");
      const noted = notify(state, issued.seq, "programa", actor, "publicó un programa", "programas", at);
      return ok(state, "Programa publicado. El equipo ha recibido la notificación.", {
        seq: noted.seq,
        programs: [
          { id: issued.id, authorId: actor.id, projectId: project.id, title, body, createdAt: at },
          ...state.programs,
        ],
        notices: noted.notices,
      });
    }
    case "add-meeting": {
      if (!canCreateMeeting(actor.role)) return warn(state, "Las reuniones las convoca administración.");
      const title = action.title.trim();
      const place = action.place.trim();
      if (!title || !action.when || !place) return warn(state, "Indica asunto, fecha y lugar de la reunión.");
      const at = stamp(action.at);
      const issued = nextId(state, "reu");
      const noted = notify(state, issued.seq, "reunion", actor, "convocó una reunión", "reuniones", at);
      return ok(state, "Reunión convocada. El equipo ha recibido la notificación.", {
        seq: noted.seq,
        meetings: [
          { id: issued.id, authorId: actor.id, title, when: action.when, place, createdAt: at },
          ...state.meetings,
        ],
        notices: noted.notices,
      });
    }
    case "add-suggestion": {
      const title = action.title.trim();
      const body = action.body.trim();
      if (!title || !body) return warn(state, "La sugerencia necesita título y detalle.");
      const at = stamp(action.at);
      const issued = nextId(state, "sug");
      const noted = notify(state, issued.seq, "sugerencia", actor, "envió una sugerencia", "sugerencias", at);
      return ok(state, "Sugerencia publicada. Gerencia puede impulsarla.", {
        seq: noted.seq,
        suggestions: [
          { id: issued.id, authorId: actor.id, title, body, createdAt: at, boostedBy: [], reactions: [] },
          ...state.suggestions,
        ],
        notices: noted.notices,
      });
    }
    case "boost": {
      if (!canBoost(actor.role)) return warn(state, "Gerencia impulsa las sugerencias.");
      const suggestion = state.suggestions.find((item) => item.id === action.suggestionId);
      if (!suggestion) return state;
      if (suggestion.boostedBy.includes(actor.id)) return warn(state, "Ya impulsaste esta sugerencia.");
      const at = stamp();
      const noted = notify(state, state.seq, "impulso", actor, "impulsó una sugerencia", "sugerencias", at);
      return ok(state, "Sugerencia impulsada. El equipo ve ese respaldo.", {
        seq: noted.seq,
        suggestions: state.suggestions.map((item) =>
          item.id === suggestion.id ? { ...item, boostedBy: [...item.boostedBy, actor.id] } : item,
        ),
        notices: noted.notices,
      });
    }
    case "send-emoji": {
      if (!EMOJIS.includes(action.emoji as (typeof EMOJIS)[number])) return state;
      const recipient = personById(state, action.toId);
      if (!recipient) return state;
      if (recipient.id === actor.id) return warn(state, "El emoji se envía a otra persona del equipo.");
      const circle = visiblePeople(state);
      if (!circle.some((person) => person.id === recipient.id)) {
        return warn(state, "Puedes animar a las personas asignadas en tus proyectos.");
      }
      const at = stamp(action.at);
      const issued = nextId(state, "enc");
      const noted = notify(
        state,
        issued.seq,
        "emoji",
        actor,
        `envió ${action.emoji} a ${recipient.name}`,
        "equipo",
        at,
      );
      return ok(state, `${action.emoji} enviado. La confianza del equipo sube.`, {
        seq: noted.seq,
        encouragements: [
          { id: issued.id, fromId: actor.id, toId: recipient.id, emoji: action.emoji, createdAt: at },
          ...state.encouragements,
        ],
        notices: noted.notices,
      });
    }
    case "assign": {
      if (!canAssign(actor.role)) return warn(state, "Las asignaciones de proyecto las guarda administración.");
      const project = state.projects.find((item) => item.id === action.projectId);
      const person = personById(state, action.personId);
      if (!project || !person) return state;
      const has = project.memberIds.includes(person.id);
      if (action.assigned === has) return state;
      const memberIds = action.assigned
        ? [...project.memberIds, person.id]
        : project.memberIds.filter((id) => id !== person.id);
      return ok(
        state,
        action.assigned
          ? `${person.name} entra en ${project.name}. Contabilidad de ese proyecto ya puede ver a esa persona.`
          : `${person.name} sale de ${project.name}.`,
        {
          projects: state.projects.map((item) => (item.id === project.id ? { ...item, memberIds } : item)),
        },
      );
    }
    default:
      return state;
  }
}

export const STORAGE_KEY = "empresa-portal-v1";

export function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as State;
    if (!parsed || !Array.isArray(parsed.people) || !parsed.currentUserId) return seedState();
    return { ...seedState(), ...parsed, banner: null };
  } catch {
    return seedState();
  }
}

export function saveState(state: State): void {
  const { banner: _banner, ...rest } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}
