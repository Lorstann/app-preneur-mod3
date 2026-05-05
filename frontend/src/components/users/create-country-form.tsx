"use client";

import {
  FieldLabel, LockLabel, LockedInput, TextInput, SelectInput,
  MOCK_REGIONS,
  type FormState,
} from "./_shared";
import type { LockedFields } from "@/lib/rbac-creation";

type Props = {
  form: FormState;
  set: (key: keyof FormState, val: string) => void;
  locked: LockedFields;
};

export function CreateCountryForm({ form, set, locked }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <LockLabel label="Region" locked={locked.region} />
        {locked.region ? (
          <LockedInput value={locked.region} />
        ) : (
          <SelectInput
            options={MOCK_REGIONS}
            value={form.region}
            onChange={(v) => set("region", v)}
            placeholder="Select region"
          />
        )}
      </div>

      <div>
        <FieldLabel>Country name *</FieldLabel>
        <TextInput
          placeholder="e.g. Germany, France"
          value={form.name}
          onChange={(v) => set("name", v)}
          required
        />
      </div>
    </div>
  );
}
