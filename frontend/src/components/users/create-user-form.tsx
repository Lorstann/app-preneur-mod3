"use client";

import {
  FieldLabel, LockLabel, LockedInput, TextInput, PasswordInput,
  SelectInput, RolePicker, Divider,
  MOCK_REGIONS, MOCK_COUNTRIES, MOCK_DEPARTMENTS, MOCK_TEAMS,
  type FormState,
} from "./_shared";
import type { LockedFields, ExtendedRoleDef } from "@/lib/rbac-creation";
import type { UserContext } from "@/types/scope";

type Props = {
  form: FormState;
  set: (key: keyof FormState, val: string) => void;
  locked: LockedFields;
  userContext: UserContext;
  assignableExtendedRoles: ExtendedRoleDef[];
  selectedExtendedRole: ExtendedRoleDef | null;
  onRoleSelect: (r: ExtendedRoleDef) => void;
  pwError: string | null;
};

export function CreateUserForm({
  form,
  set,
  locked,
  userContext,
  assignableExtendedRoles,
  selectedExtendedRole,
  onRoleSelect,
  pwError,
}: Props) {
  const scopeFields = selectedExtendedRole?.scopeFields ?? [];

  const countryOptions = locked.region
    ? (MOCK_COUNTRIES[locked.region] ?? [])
    : MOCK_COUNTRIES[form.region] ?? [];

  const teamOptions = locked.department
    ? (MOCK_TEAMS[locked.department] ?? [])
    : MOCK_TEAMS[form.department] ?? [];

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>First name *</FieldLabel>
          <TextInput
            placeholder="Jane"
            value={form.firstName}
            onChange={(v) => set("firstName", v)}
            required
          />
        </div>
        <div>
          <FieldLabel>Last name *</FieldLabel>
          <TextInput
            placeholder="Smith"
            value={form.lastName}
            onChange={(v) => set("lastName", v)}
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <FieldLabel>Work email *</FieldLabel>
        <TextInput
          placeholder="jane@corp.internal"
          value={form.email}
          onChange={(v) => set("email", v)}
          required
        />
      </div>

      {/* Password */}
      <div>
        <FieldLabel>Password *</FieldLabel>
        <PasswordInput
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={(v) => set("password", v)}
          required
          error={pwError ?? undefined}
        />
      </div>

      <div>
        <FieldLabel>Confirm password *</FieldLabel>
        <PasswordInput
          placeholder="Repeat password"
          value={form.confirmPassword}
          onChange={(v) => set("confirmPassword", v)}
          required
          error={
            form.confirmPassword && form.password !== form.confirmPassword
              ? "Passwords do not match."
              : undefined
          }
        />
      </div>

      {/* Role picker */}
      <Divider />
      <div>
        <FieldLabel>Role *</FieldLabel>
        {assignableExtendedRoles.length > 0 ? (
          <RolePicker
            options={assignableExtendedRoles}
            selected={selectedExtendedRole}
            onSelect={onRoleSelect}
          />
        ) : (
          <LockedInput value="No assignable roles within your scope" />
        )}
      </div>

      {/* Scope fields — driven by selected role */}
      {selectedExtendedRole && (
        <>
          <Divider />
          <p className="text-[11px] text-white/35">
            Scope assignment
            <span className="ml-1 text-white/20">
              ({selectedExtendedRole.label} requires:{" "}
              {selectedExtendedRole.scopeFields.join(" → ")})
            </span>
          </p>

          {/* Region */}
          {scopeFields.includes("region") && (
            <div>
              <LockLabel label="Region" locked={locked.region} />
              {locked.region ? (
                <LockedInput value={locked.region} />
              ) : (
                <SelectInput
                  options={MOCK_REGIONS}
                  value={form.region}
                  onChange={(v) => {
                    set("region", v);
                    set("country", "");
                    set("department", "");
                    set("team", "");
                  }}
                  placeholder="Select region"
                />
              )}
            </div>
          )}

          {/* Country */}
          {scopeFields.includes("country") && (
            <div>
              <LockLabel label="Country" locked={locked.country} />
              {locked.country ? (
                <LockedInput value={locked.country} />
              ) : (
                <SelectInput
                  options={countryOptions}
                  value={form.country}
                  onChange={(v) => {
                    set("country", v);
                    set("department", "");
                    set("team", "");
                  }}
                  placeholder={
                    form.region || locked.region ? "Select country" : "Select region first"
                  }
                />
              )}
            </div>
          )}

          {/* Department */}
          {scopeFields.includes("department") && (
            <div>
              <LockLabel label="Department" locked={locked.department} />
              {locked.department ? (
                <LockedInput value={locked.department} />
              ) : (
                <SelectInput
                  options={MOCK_DEPARTMENTS}
                  value={form.department}
                  onChange={(v) => { set("department", v); set("team", ""); }}
                  placeholder={
                    form.country || locked.country
                      ? "Select department"
                      : "Select country first"
                  }
                />
              )}
            </div>
          )}

          {/* Team */}
          {scopeFields.includes("team") && (
            <div>
              <LockLabel
                label="Team"
                locked={userContext.scope.type === "Team" ? userContext.scope.name : undefined}
              />
              {userContext.scope.type === "Team" ? (
                <LockedInput value={userContext.scope.name} />
              ) : (
                <SelectInput
                  options={teamOptions}
                  value={form.team}
                  onChange={(v) => set("team", v)}
                  placeholder={
                    form.department || locked.department
                      ? "Select team"
                      : "Select department first"
                  }
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
