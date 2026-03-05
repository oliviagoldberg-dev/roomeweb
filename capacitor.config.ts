import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.yourname.roome",
  appName: "ROOMe",
  // Loads your live Vercel deployment instead of a local bundle
  server: {
    url: "https://roomeofficial.com",
    cleartext: false,
  },
};

export default config;
