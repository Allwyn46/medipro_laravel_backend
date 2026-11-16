import { createInertiaApp } from "@inertiajs/react";

const appName = import.meta.env.VITE_APP_NAME || "Smart Tech Medical Clinic";

void createInertiaApp({
    title: (title) =>
        title
            ? title.includes(appName)
                ? title
                : `${title} - ${appName}`
            : appName,
    progress: {
        color: "#4B5563",
    },
});
