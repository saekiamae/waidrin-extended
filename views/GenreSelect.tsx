// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025  Philipp Emanuel Weidmann <pew@worldwidemann.com>

import { RadioCards } from "@radix-ui/themes";
import ImageOption from "@/components/ImageOption";
import WizardStep from "@/components/WizardStep";

export default function GenreSelect({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  return (
    <WizardStep title="Genre" onNext={onNext} onBack={onBack}>
      <RadioCards.Root defaultValue="fantasy" columns="3">
        <ImageOption title="Fantasy" description="Elves, dwarves, and wizards" image="fantasy" value="fantasy" />
        <ImageOption title="Sci-Fi" description="Spaceships and aliens" image="scifi" value="scifi" />
        <ImageOption title="Reality" description="Dust and grime" image="reality" value="reality" />
      </RadioCards.Root>
    </WizardStep>
  );
}
