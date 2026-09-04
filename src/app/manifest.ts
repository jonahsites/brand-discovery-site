import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kindred", short_name: "Kindred", description: "Find your next favorite clothing brand.",
    start_url: "/", display: "standalone", background_color: "#F6F4EF", theme_color: "#F6F4EF",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }, { src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}
