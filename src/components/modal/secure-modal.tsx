"use client";

import { fetchChangePassword } from "@/lib/auth-actions";
import { apiFetch } from "@/lib/api-client";
import { State } from "@/lib/definitions";
import { getErrorMessage } from "@/lib/error";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import ModalLayout from "./modal-layout";
import { useTranslations } from "next-intl";
import { PasswordField } from "../password-field";
import SubmitButton from "@/ui/submit-btn";


interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialState: State = {
    message: "",
    success: false,
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [state, setState] = useState<State>(initialState);
    const LN = useTranslations("Profile.settings.change");

    if (!isOpen) return null;

    async function handleChangePassword(formData: FormData) {
        setState(prev => ({ ...prev, message: "" }));

        const resValidedData = await fetchChangePassword(formData);
        if (!resValidedData.success) {
            setState(prev => ({ ...prev, message: resValidedData.message }));
            return;
        }

        const oldPass = formData.get("oldPassword");
        const newPass = formData.get("newPassword");
        try {
            await apiFetch("auth/change-password", {
                method: "POST",
                body: JSON.stringify({ old: oldPass, new: newPass }),
            });

            toast.success(LN("success"));
            onClose();
        } catch (error) {
            setState(prev => ({ ...prev, message: getErrorMessage(error, LN("wakeP")) }));
            return;
        }
    }


    return (
        <ModalLayout>
            <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="!text-lg font-medium text-text-primary">{LN("changeP")}</h3>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={LN("close")}
                    className="-mr-1 cursor-pointer rounded-md p-1.5 text-text-tertiary transition-colors duration-150 hover:bg-bg-muted hover:text-text-primary"                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <form action={handleChangePassword} className="space-y-4">
                <PasswordField
                    id="oldPassword"
                    name="oldPassword"
                    label={LN("OldP")}
                />

                <PasswordField
                    id="newPassword"
                    name="newPassword"
                    label={LN("NewP")}
                />

                <PasswordField
                    id="confirmPassword"
                    name="confirmPassword"
                    label={LN("re-enter")}
                />

                <div className="h-4">
                    {state.message && (
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-danger)" }}>
                            {state.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
                    <SubmitButton label={LN("save")} loadingLabel="Saving..." />
                    <button
                        type="button"
                        onClick={onClose}
                        className="mx-auto cursor-pointer text-sm text-text-tertiary transition-colors duration-200 hover:text-accent hover:underline"
                    >
                        {LN("cancel")}
                    </button>
                </div>
            </form>
        </ModalLayout>
    )
}
