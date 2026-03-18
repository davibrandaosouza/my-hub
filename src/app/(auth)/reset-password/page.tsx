import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-active text-white font-bold text-2xl mb-4 shadow-lg">
                    M
                </div>
                <h2 className="text-center text-3xl font-bold text-white">
                    MyHub
                </h2>
                <p className="mt-2 text-center text-sm tracking-wider text-muted mb-8">
                    Recuperação de senha
                </p>
                <div className="w-full rounded-2xl border border-border bg-card-background p-8 shadow-xl">
                    <ResetPasswordForm />
                </div>
            </div>
        </div>
    )
}