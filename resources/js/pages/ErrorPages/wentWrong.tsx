import { AlertCircle } from "lucide-react";

export default function WentWrong() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6">
            <div className="flex w-full max-w-sm flex-col items-center text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50">
                    <AlertCircle className="size-6 text-red-500" />
                </div>

                <h1 className="text-lg font-semibold tracking-tight">
                    Something went wrong
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    We couldn't show the login form. Please try again.
                </p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 h-9 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
