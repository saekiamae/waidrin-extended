// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

"use client";

import { Text } from "@radix-ui/themes";
import { current } from "immer";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import ErrorPopup from "@/components/ErrorPopup";
import MainMenu from "@/components/MainMenu";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import StateDebugger from "@/components/StateDebugger";
import { abort, back, isAbortError, next } from "@/lib/engine";
import { type Plugin, type PluginWrapper, useStateStore } from "@/lib/state";
import CharacterSelect from "@/views/CharacterSelect";
import Chat from "@/views/Chat";
import ConnectionSetup from "@/views/ConnectionSetup";
import GenreSelect from "@/views/GenreSelect";
import ScenarioSetup from "@/views/ScenarioSetup";
import Welcome from "@/views/Welcome";
import type { Manifest } from "./plugins/route";

export default function Home() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("");
  const [overlayMessage, setOverlayMessage] = useState("");
  const [overlayTokenCount, setOverlayTokenCount] = useState(0);
  const [onOverlayCancel, setOnOverlayCancel] = useState<(() => void) | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const [onErrorRetry, setOnErrorRetry] = useState<(() => void) | undefined>(undefined);
  const [onErrorCancel, setOnErrorCancel] = useState<(() => void) | undefined>(undefined);

  const { view, setStateAsync } = useStateStore(
    useShallow((state) => ({
      view: state.view,
      setStateAsync: state.setAsync,
    })),
  );

  const loadPlugins = async () => {
    setOverlayVisible(true);
    setOverlayTitle("Loading plugins");
    setOverlayMessage("Loading manifests...");
    setOverlayTokenCount(-1);
    setOnOverlayCancel(undefined);

    try {
      await setStateAsync(async (state) => {
        const response = await fetch("/plugins");
        const manifests: Manifest[] = await response.json();

        state.backends = {};

        outer: for (const manifest of manifests) {
          let pluginWrapper: PluginWrapper | null = null;

          for (const plugin of state.plugins) {
            if (plugin.name === manifest.name) {
              if (!plugin.enabled) {
                // Don't load disabled plugins at all.
                continue outer;
              }

              pluginWrapper = plugin;
              break;
            }
          }

          setOverlayMessage(`Loading plugin "${manifest.name}"...`);

          const module = await import(/* webpackIgnore: true */ `/plugins/${manifest.path}/${manifest.main}`);
          const pluginClass = module.default;
          const plugin: Plugin = new pluginClass();

          if (plugin.init) {
            await plugin.init(pluginWrapper ? current(pluginWrapper.settings) : manifest.settings, undefined);
          }

          if (plugin.getBackends) {
            Object.assign(state.backends, await plugin.getBackends());
          }

          if (pluginWrapper) {
            // Preserve settings for plugins loaded from state store;
            // only replace the plugin module itself.
            pluginWrapper.plugin = plugin;
          } else {
            // Plugin is new.
            state.plugins.push({
              name: manifest.name,
              enabled: true,
              settings: manifest.settings,
              plugin,
            });
          }
        }
      });
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      if (!message) {
        message = "Unknown error";
      }
      setErrorMessage(message);
      setOnErrorRetry(() => () => {
        setErrorMessage("");
        loadPlugins();
      });
      setOnErrorCancel(undefined);
    } finally {
      setOverlayVisible(false);
    }
  };

  const nextView = async () => {
    try {
      await next(undefined, (title, message, tokenCount) => {
        setOverlayVisible(true);
        setOverlayTitle(title);
        setOverlayMessage(message);
        setOverlayTokenCount(tokenCount);
        setOnOverlayCancel(() => abort);
      });
    } catch (error) {
      if (!isAbortError(error)) {
        let message = error instanceof Error ? error.message : String(error);
        if (!message) {
          message = "Unknown error";
        }
        setErrorMessage(message);
        setOnErrorRetry(() => () => {
          setErrorMessage("");
          nextView();
        });
        setOnErrorCancel(() => () => setErrorMessage(""));
      }
    } finally {
      setOverlayVisible(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: This should run only once.
  useEffect(() => {
    loadPlugins();
  }, []);

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
        <ProcessingOverlay title={overlayTitle} onCancel={onOverlayCancel}>
          <Text as="div" size="6">
            {overlayMessage}
          </Text>
          {overlayTokenCount >= 0 && (
            <Text className="tabular-nums" as="div" size="4" color="lime">
              {overlayTokenCount > 0 ? `Tokens generated: ${overlayTokenCount}` : "Waiting for response..."}
            </Text>
          )}
        </ProcessingOverlay>
      )}

      {errorMessage && <ErrorPopup errorMessage={errorMessage} onRetry={onErrorRetry} onCancel={onErrorCancel} />}
    </>
  );
}
