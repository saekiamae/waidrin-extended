// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

import { Box, RadioCards, Text } from "@radix-ui/themes";
import ImageOption from "@/components/ImageOption";
import WizardStep from "@/components/WizardStep";

export default function GenreSelect({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  return (
    <WizardStep title="Genre" onNext={onNext} onBack={onBack}>
      <RadioCards.Root defaultValue="fantasy" columns="3">
        <ImageOption title="Fantasy" description="Elves, dwarves, and wizards" image="fantasy" value="fantasy" />
        <ImageOption title="Sci-Fi" description="Spaceships and aliens" image="scifi" value="scifi" disabled />
        <ImageOption title="Reality" description="Dust and grime" image="reality" value="reality" disabled />
      </RadioCards.Root>

      <Box mt="5">
        <Text as="div" align="center" size="4" color="gray">
          <strong>Note:</strong> Only the fantasy genre is currently implemented.
        </Text>
      </Box>
    </WizardStep>
  );
}
