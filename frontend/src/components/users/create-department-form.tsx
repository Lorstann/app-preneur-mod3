"use client";

import {
  FieldLabel, LockLabel, LockedInput, TextInput, SelectInput,
  MOCK_REGIONS, MOCK_COUNTRIES,
  type FormState,
} from "./_shared";
import type { LockedFields } from "@/lib/rbac-creation";

type Props = {
  form: FormState;
  set: (key: keyof FormState, val: string) => void;
  locked: LockedFields;
};

export function CreateDepartmentForm({ form, set, locked }: Props) {
  const countryOptions = locked.region
    ? (MOCK_COUNTRIES[locked.region] ?? [])
    : MOCK_COUNTRIES[form.region] ?? [];

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
            onChange={(v) => { set("region", v); set("country", ""); }}
            placeholder="Select region"
          />
        )}
      </div>

      <div>
        <LockLabel label="Country" locked={locked.country} />
        {locked.country ? (
          <LockedInput value={locked.country} />
        ) : (
          <SelectInput
            options={countryOptions}
            value={form.country}
            onChange={(v) => set("country", v)}
            placeholder={form.region || locked.region ? "Select country" : "Select region first"}
          />
        )}
      </div>

      <div>
        <FieldLabel>Department name *</FieldLabel>
        <TextInput
          placeholder="e.g. Finance, Legal, HR"
          value={form.name}
          onChange={(v) => set("name", v)}
          required
        />
      </div>
    </div>
  );
}
