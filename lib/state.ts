// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

import { createDraft, finishDraft, type WritableDraft } from "immer";
import type * as z from "zod/v4";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import * as schemas from "./schemas";

export type View = z.infer<typeof schemas.View>;
export type World = z.infer<typeof schemas.World>;
export type Gender = z.infer<typeof schemas.Gender>;
export type Race = z.infer<typeof schemas.Race>;
export type Character = z.infer<typeof schemas.Character>;
export type LocationType = z.infer<typeof schemas.LocationType>;
export type Location = z.infer<typeof schemas.Location>;
export type SexualContentLevel = z.infer<typeof schemas.SexualContentLevel>;
export type ViolentContentLevel = z.infer<typeof schemas.ViolentContentLevel>;
export type ActionEvent = z.infer<typeof schemas.ActionEvent>;
export type NarrationEvent = z.infer<typeof schemas.NarrationEvent>;
export type CharacterIntroductionEvent = z.infer<typeof schemas.CharacterIntroductionEvent>;
export type LocationChangeEvent = z.infer<typeof schemas.LocationChangeEvent>;
export type Event = z.infer<typeof schemas.Event>;
export type State = z.infer<typeof schemas.State>;

export interface Actions {
  set: (
    nextStateOrUpdater: State | Partial<State> | ((state: WritableDraft<State>) => void),
    shouldReplace?: false,
  ) => void;
  setAsync: (updater: (state: WritableDraft<State>) => Promise<void>) => Promise<void>;
}

export const useStateStore = create<State & Actions>()(
  persist(
    immer((set, get) => ({
      ...schemas.State.parse({
        apiUrl: "http://localhost:8080",
        view: "connection",
        world: {
          name: "[name]",
          description: "[description]",
        },
        locations: [],
        characters: [],
        protagonist: {
          name: "[name]",
          gender: "male",
          race: "human",
          biography: "[biography]",
          locationIndex: 0,
        },
        hiddenDestiny: false,
        betrayal: false,
        oppositeSexMagnet: false,
        sameSexMagnet: false,
        sexualContentLevel: "regular",
        violentContentLevel: "regular",
        events: [],
        actions: [],
      }),

      set: set,
      setAsync: async (updater) => {
        // According to https://immerjs.github.io/immer/async/, this is an "anti-pattern", because
        // "updates [...] that happen during the async process, would be "missed" by the draft".
        // However, for our use case, this is actually exactly what we want, because it prevents
        // manual updates during state machine operations from producing inconsistent states.
        const state = get();
        const draft = createDraft(state);
        await updater(draft);
        const newState = finishDraft(draft);
        set(newState);
      },
    })),
    {
      name: "state",
    },
  ),
);
