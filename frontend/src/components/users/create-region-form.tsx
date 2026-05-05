"use client";

import { FieldLabel, TextInput, type FormState } from "./_shared";

type Props = {
  form: FormState;
  set: (key: keyof FormState, val: string) => void;
};

export function CreateRegionForm({ form, set }: Props) {
  return (
    <div>
      <FieldLabel>Region name *</FieldLabel>
      <TextInput
        placeholder="e.g. EMEA, APAC"
        value={form.name}
        onChange={(v) => set("name", v)}
        required
      />
    </div>
  );
}
