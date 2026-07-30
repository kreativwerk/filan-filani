"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui";

export function ProfileForm({
  email,
  initialName,
  initialPhone,
}: {
  email: string;
  initialName: string;
  initialPhone: string;
}) {
  const t = useTranslations("profile");
  const ta = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ full_name: name.trim(), phone: phone.trim() || null })
        .eq("id", user.id);
      setSaved(true);
    }
    setSaving(false);
  }

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

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

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
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
          {saved && (
            <p className="rounded-[14px] bg-[#DCEDEA] p-3 text-sm font-semibold text-[#0B443E]">
              {t("saved")}
            </p>
          )}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? tc("loading") : tc("save")}
          </Button>
        </form>
      </Card>

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
