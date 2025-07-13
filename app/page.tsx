// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

"use client";

import { Text } from "@radix-ui/themes";
import { useState } from "react";
import { useShallow } from "zustand/shallow";
import ErrorPopup from "@/components/ErrorPopup";
import MainMenu from "@/components/MainMenu";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import StateDebugger from "@/components/StateDebugger";
import { abort, back, isAbortError, next } from "@/lib/engine";
import { useStateStore } from "@/lib/state";
import CharacterSelect from "@/views/CharacterSelect";
import Chat from "@/views/Chat";
import ConnectionSetup from "@/views/ConnectionSetup";
import GenreSelect from "@/views/GenreSelect";
import ScenarioSetup from "@/views/ScenarioSetup";
import Welcome from "@/views/Welcome";

export default function Home() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("");
  const [overlayMessage, setOverlayMessage] = useState("");
  const [overlayTokenCount, setOverlayTokenCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const nextView = async () => {
    try {
      await next(undefined, (title, message, tokenCount) => {
        setOverlayVisible(true);
        setOverlayTitle(title);
        setOverlayMessage(message);
        setOverlayTokenCount(tokenCount);
      });
    } catch (error) {
      if (!isAbortError(error)) {
        let message = error instanceof Error ? error.message : String(error);
        if (!message) {
          message = "Unknown error";
        }
        setErrorMessage(message);
      }
    } finally {
      setOverlayVisible(false);
    }
  };

  const view = useStateStore(useShallow((state) => state.view));

  return (
    <>
      {view === "welcome" && <Welcome onNext={nextView} />}
      {view === "connection" && <ConnectionSetup onNext={nextView} onBack={back} />}
      {view === "genre" && <GenreSelect onNext={nextView} onBack={back} />}
      {view === "character" && <CharacterSelect onNext={nextView} onBack={back} />}
      {view === "scenario" && <ScenarioSetup onNext={nextView} onBack={back} />}
      {view === "chat" && <Chat />}

      <MainMenu />
      <StateDebugger />

      {overlayVisible && (
        <ProcessingOverlay title={overlayTitle} onCancel={abort}>
          <Text as="div" size="6">
            {overlayMessage}
          </Text>
          <Text className="tabular-nums" as="div" size="4" color="lime">
            {overlayTokenCount ? `Tokens generated: ${overlayTokenCount}` : "Waiting for response..."}
          </Text>
        </ProcessingOverlay>
      )}

      {errorMessage && (
        <ErrorPopup
          errorMessage={errorMessage}
          onRetry={() => {
            setErrorMessage("");
            nextView();
          }}
          onCancel={() => setErrorMessage("")}
        />
      )}
    </>
  );
}
