"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Landmark, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui";
import { formatIban, isValidIban, normalizeIban } from "@/lib/iban";

export function ProfileForm({
  email,
  initialName,
  initialPhone,
  initialIban,
  initialBankHolder,
  initialBillingEmail,
  initialBillingAddress,
  isScout,
}: {
  email: string;
  initialName: string;
  initialPhone: string;
  initialIban: string;
  initialBankHolder: string;
  initialBillingEmail: string;
  initialBillingAddress: string;
  /** Auszahlungsdaten nur für Runner und Admins zeigen */
  isScout: boolean;
}) {
  const t = useTranslations("profile");
  const ta = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [iban, setIban] = useState(
    initialIban ? formatIban(initialIban) : "",
  );
  const [bankHolder, setBankHolder] = useState(initialBankHolder);
  const [billingEmail, setBillingEmail] = useState(initialBillingEmail || email);
  const [billingAddress, setBillingAddress] = useState(initialBillingAddress);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ibanTouched = iban.trim().length > 0;
  const ibanValid = !ibanTouched || isValidIban(iban);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (ibanTouched && !ibanValid) {
      setError(t("ibanInvalid"));
      return;
    }
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error: saveError } = await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          phone: phone.trim() || null,
          ...(isScout
            ? {
                iban: ibanTouched ? normalizeIban(iban) : null,
                bank_holder: bankHolder.trim() || null,
                billing_email: billingEmail.trim() || null,
                billing_address: billingAddress.trim() || null,
              }
            : {}),
        })
        .eq("id", user.id);
      if (saveError) setError(tc("error"));
      else setSaved(true);
    }
    setSaving(false);
  }

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const billingIncomplete =
    isScout && (!initialIban || !(initialBillingEmail || email));

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-light text-primary-dark">
          <User className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
            {t("title")}
          </h1>
          <p className="text-sm text-muted">{email}</p>
        </div>
      </div>

      {billingIncomplete && (
        <p className="rounded-[14px] bg-[#FBF0D6] p-3.5 text-sm font-semibold text-[#6B4C07]">
          {t("billingMissing")}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <Card>
          <div className="space-y-4">
            <Field label={ta("fullName")}>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={ta("phone")}>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+383 4x xxx xxx"
              />
            </Field>
          </div>
        </Card>

        {isScout && (
          <Card>
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <Landmark className="mt-0.5 h-5 w-5 flex-none text-primary" />
                <div>
                  <h2 className="text-[15px] font-extrabold text-ink">
                    {t("billingTitle")}
                  </h2>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                    {t("billingHint")}
                  </p>
                </div>
              </div>
              <Field label={t("iban")}>
                <Input
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  onBlur={() => ibanValid && iban && setIban(formatIban(iban))}
                  placeholder="XK05 1212 0123 4567 8906"
                  autoComplete="off"
                  spellCheck={false}
                  className={ibanValid ? "" : "border-alert"}
                />
              </Field>
              <Field label={t("bankHolder")}>
                <Input
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder={t("bankHolderPh")}
                />
              </Field>
              <Field label={t("billingEmail")}>
                <Input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                />
              </Field>
              <Field label={t("billingAddress")}>
                <Input
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </Field>
            </div>
          </Card>
        )}

        {error && (
          <p className="rounded-[14px] bg-[#FFE4DC] p-3 text-sm font-semibold text-[#A3241A]">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-[14px] bg-[#DCEDEA] p-3 text-sm font-semibold text-[#0B443E]">
            {t("saved")}
          </p>
        )}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? tc("loading") : tc("save")}
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        onClick={handleLogout}
        className="w-full text-alert"
      >
        <LogOut className="h-[18px] w-[18px]" />
        {ta("logout")}
      </Button>
    </div>
  );
}
