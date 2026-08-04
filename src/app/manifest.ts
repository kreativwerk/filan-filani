import type { MetadataRoute } from "next";

/** Web-App-Manifest: sorgt dafür, dass die vom Home-Bildschirm gestartete App
 *  ohne Browser-Leisten läuft und das FF-Signet als Symbol nutzt. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Filan Filani — Connect Kosovo",
    short_name: "Filan Filani",
    description:
      "Gjej biznese dhe shërbime në Kosovë — restorante, zejtarë, dyqane dhe më shumë.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F6F5",
    theme_color: "#12574F",
    icons: [
      { src: "/app/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/app/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
