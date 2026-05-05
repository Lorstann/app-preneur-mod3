"use client";

import {
  FieldLabel, LockLabel, LockedInput, TextInput, SelectInput,
  MOCK_REGIONS, MOCK_COUNTRIES, MOCK_DEPARTMENTS,
  type FormState,
} from "./_shared";
import type { LockedFields } from "@/lib/rbac-creation";

type Props = {
  form: FormState;
  set: (key: keyof FormState, val: string) => void;
  locked: LockedFields;
};

export function CreateTeamForm({ form, set, locked }: Props) {
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
            onChange={(v) => { set("region", v); set("country", ""); set("department", ""); }}
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
            onChange={(v) => { set("country", v); set("department", ""); }}
            placeholder={form.region || locked.region ? "Select country" : "Select region first"}
          />
        )}
      </div>

      <div>
        <LockLabel label="Department" locked={locked.department} />
        {locked.department ? (
          <LockedInput value={locked.department} />
        ) : (
          <SelectInput
            options={MOCK_DEPARTMENTS}
            value={form.department}
            onChange={(v) => set("department", v)}
            placeholder={form.country || locked.country ? "Select department" : "Select country first"}
          />
        )}
      </div>

      <div>
        <FieldLabel>Team name *</FieldLabel>
        <TextInput
          placeholder="e.g. AP Team, Compliance"
          value={form.name}
          onChange={(v) => set("name", v)}
          required
        />
      </div>
    </div>
  );
}
