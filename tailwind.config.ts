import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Tailwind's defaults stop at 1536. Large monitors and ultrawides are
        // a real design environment here, not an edge case.
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [
    // Height and input-type conditions used to live in `screens` as raw media
    // objects. Tailwind 3 cannot generate arbitrary min-*/max-* variants when
    // any screen is an object, which silently broke classes such as
    // min-[400px]:. As plain variants they work alongside arbitrary values.
    plugin(({ addVariant }) => {
      addVariant("short", "@media (max-height: 800px)");
      addVariant("squat", "@media (max-height: 520px)");
      addVariant("tall", "@media (min-height: 900px)");
      addVariant("touch", "@media (hover: none)");
      addVariant("stylus", "@media (hover: hover) and (pointer: fine)");
    }),
  ],
} satisfies Config;
