// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

import type { Event } from "@/lib/state";
import ActionEventView from "./ActionEventView";
import CharacterIntroductionEventView from "./CharacterIntroductionEventView";
import LocationChangeEventView from "./LocationChangeEventView";
import NarrationEventView from "./NarrationEventView";

export default function EventView({ event }: { event: Event }) {
  return (
    <>
      {event.type === "action" && <ActionEventView event={event} />}
      {event.type === "narration" && <NarrationEventView event={event} />}
      {event.type === "character_introduction" && <CharacterIntroductionEventView event={event} />}
      {event.type === "location_change" && <LocationChangeEventView event={event} />}
    </>
  );
}
