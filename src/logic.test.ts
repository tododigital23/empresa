import { describe, expect, it } from "vitest";
import {
  confidenceScore,
  reducer,
  seedState,
  unreadCount,
  visiblePeople,
  visibleProjects,
} from "./logic";

describe("contabilidad", () => {
  it("solo ve a las personas asignadas a sus proyectos", () => {
    const state = seedState();
    expect(visiblePeople(state, "carmen").map((person) => person.id).sort()).toEqual([
      "andres",
      "carmen",
      "pedro",
    ]);
    expect(visibleProjects(state, "carmen").map((project) => project.id)).toEqual(["norte"]);
  });

  it("incluye a una persona cuando administración la asigna a su proyecto", () => {
    let state = reducer(seedState(), { type: "switch-user", userId: "elena" });
    state = reducer(state, { type: "assign", projectId: "norte", personId: "lucia", assigned: true });
    expect(visiblePeople(state, "carmen").map((person) => person.id)).toContain("lucia");
  });

  it("deja de ver a quien sale del proyecto", () => {
    let state = reducer(seedState(), { type: "switch-user", userId: "elena" });
    state = reducer(state, { type: "assign", projectId: "norte", personId: "pedro", assigned: false });
    expect(visiblePeople(state, "carmen").map((person) => person.id)).not.toContain("pedro");
  });
});

describe("notificaciones", () => {
  it("avisa al resto del equipo cuando alguien escribe una nota", () => {
    let state = reducer(seedState(), { type: "switch-user", userId: "pedro" });
    state = reducer(state, {
      type: "add-note",
      projectId: "norte",
      body: "Falta el albarán del muelle",
      at: "2026-10-13T12:00:00.000Z",
    });
    expect(state.notes[0].body).toBe("Falta el albarán del muelle");
    expect(unreadCount(state, "carmen")).toBe(1);
    expect(unreadCount(state, "pedro")).toBe(0);
    expect(state.notices[0]).toMatchObject({ kind: "nota", actorId: "pedro", page: "notas" });
  });

  it("avisa cuando alguien publica un programa", () => {
    let state = reducer(seedState(), { type: "switch-user", userId: "lucia" });
    state = reducer(state, {
      type: "add-program",
      projectId: "sur",
      title: "Programa del jueves",
      body: "Reparto de la ruta corta.",
      at: "2026-10-13T13:00:00.000Z",
    });
    expect(unreadCount(state, "elena")).toBe(1);
    expect(state.notices[0].kind).toBe("programa");
  });

  it("avisa cuando un trabajador escribe en una nota", () => {
    let state = reducer(seedState(), { type: "switch-user", userId: "andres" });
    state = reducer(state, {
      type: "add-comment",
      noteId: "nota-norte",
      body: "Las cajas del viernes ya están en el muelle.",
      at: "2026-10-13T14:00:00.000Z",
    });
    expect(state.notes.find((note) => note.id === "nota-norte")?.comments).toHaveLength(1);
    expect(state.notices[0]).toMatchObject({ kind: "comentario", actorId: "andres" });
    expect(unreadCount(state, "pedro")).toBe(1);
  });

  it("al entrar muestra cuántas notificaciones hay sin leer", () => {
    let state = reducer(seedState(), { type: "switch-user", userId: "pedro" });
    state = reducer(state, { type: "add-note", projectId: "norte", body: "Aviso de muelle" });
    state = reducer(state, { type: "switch-user", userId: "carmen" });
    expect(state.banner?.text).toBe("Tienes 1 notificación sin leer.");
  });
});

describe("reuniones", () => {
  it("solo administración convoca", () => {
    const worker = reducer(seedState(), { type: "switch-user", userId: "pedro" });
    const blocked = reducer(worker, {
      type: "add-meeting",
      title: "Extra",
      when: "2026-10-21T09:00",
      place: "Sala 2",
    });
    expect(blocked.meetings).toHaveLength(worker.meetings.length);
    expect(blocked.banner?.text).toBe("Las reuniones las convoca administración.");

    const admin = reducer(seedState(), { type: "switch-user", userId: "elena" });
    const created = reducer(admin, {
      type: "add-meeting",
      title: "Seguimiento Norte",
      when: "2026-10-21T09:00",
      place: "Sala 2",
    });
    expect(created.meetings[0].title).toBe("Seguimiento Norte");
    expect(unreadCount(created, "carmen")).toBe(1);
  });
});

describe("sugerencias y confianza", () => {
  it("gerencia impulsa una sugerencia y el resto no", () => {
    const worker = reducer(seedState(), { type: "switch-user", userId: "pedro" });
    const denied = reducer(worker, { type: "boost", suggestionId: "sug-incidencias" });
    expect(denied.suggestions[0].boostedBy).toEqual([]);
    expect(denied.banner?.text).toBe("Gerencia impulsa las sugerencias.");

    const lead = reducer(seedState(), { type: "switch-user", userId: "marcos" });
    const boosted = reducer(lead, { type: "boost", suggestionId: "sug-incidencias" });
    expect(boosted.suggestions[0].boostedBy).toEqual(["marcos"]);
    expect(boosted.notices[0].kind).toBe("impulso");
  });

  it("un emoji sube la confianza y avisa", () => {
    const before = confidenceScore(seedState());
    let state = reducer(seedState(), { type: "switch-user", userId: "marcos" });
    state = reducer(state, { type: "send-emoji", toId: "pedro", emoji: "👏" });
    expect(confidenceScore(state)).toBe(before + 4);
    expect(state.notices[0].kind).toBe("emoji");
    expect(unreadCount(state, "pedro")).toBe(1);
  });

  it("contabilidad no envía emoji fuera de sus proyectos", () => {
    let state = reducer(seedState(), { type: "switch-user", userId: "carmen" });
    const before = state.encouragements.length;
    state = reducer(state, { type: "send-emoji", toId: "lucia", emoji: "🤝" });
    expect(state.encouragements).toHaveLength(before);
    expect(state.banner?.tone).toBe("warn");
  });
});
