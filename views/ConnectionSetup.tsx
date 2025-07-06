// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

import { Box, Flex, Link, Text, TextField } from "@radix-ui/themes";
import { Label } from "radix-ui";
import { GiOuroboros } from "react-icons/gi";
import { useShallow } from "zustand/shallow";
import WizardStep from "@/components/WizardStep";
import { useStateStore } from "@/lib/state";

export default function ConnectionSetup({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  const { apiUrl, setState } = useStateStore(
    useShallow((state) => ({
      apiUrl: state.apiUrl,
      setState: state.set,
    })),
  );

  return (
    <WizardStep title="Connection" onNext={onNext} onBack={onBack}>
      <Flex gap="6" mb="8">
        <Box flexGrow="1">
          <Box mb="5">
            <Label.Root>
              <Text size="6">
                Address (host+port) of running{" "}
                <Link href="https://github.com/ggml-org/llama.cpp/tree/master/tools/server">llama.cpp server</Link>
              </Text>
              <TextField.Root
                value={apiUrl}
                onChange={(event) =>
                  setState((state) => {
                    state.apiUrl = event.target.value;
                  })
                }
                className="mt-1 font-mono"
                size="3"
                placeholder="http://localhost:8080"
              />
            </Label.Root>
          </Box>

          <Box mb="5">
            <Text size="5" color="amber">
              <strong>Note:</strong> Waidrin uses advanced features such as constrained generation. It{" "}
              <strong>requires</strong> the llama.cpp server. Other backends are not supported. OpenAI API compatibility
              is not sufficient. Even backends that do offer JSON constraints often have subtle differences regarding
              which schema features are supported. If you decide to experiment with alternative backends, be prepared to
              debug such issues.
            </Text>
          </Box>

          <Box>
            <Text size="5" color="mint">
              The recommended model is <strong>Mistral Small 2501</strong>. GGUFs are available{" "}
              <Link href="https://huggingface.co/bartowski/Mistral-Small-24B-Instruct-2501-GGUF">here</Link>. Use
              whichever quant fits your VRAM. Make sure you load the model with a context size of at least{" "}
              <strong>16k</strong>.
            </Text>
          </Box>
        </Box>

        <Box className="w-[250px]">
          <GiOuroboros className="transform scale-x-[-1] -mr-5" size="250" color="var(--amber-8)" />
        </Box>
      </Flex>
    </WizardStep>
  );
}
