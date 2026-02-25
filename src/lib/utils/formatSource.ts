"use client";

export function formatSourceLabel(source: string) {
  if (!source) return "";
  const raw = source.trim();
  const s = raw.toLowerCase();

  if (s === "manual") return "Manual";

  const known: Array<[string, string]> = [
    ["zillow", "Zillow"],
    ["apartments", "Apartments.com"],
    ["realtor", "Realtor.com"],
    ["redfin", "Redfin"],
    ["trulia", "Trulia"],
    ["streeteasy", "StreetEasy"],
    ["craigslist", "Craigslist"],
    ["hotpads", "HotPads"],
    ["rent.com", "Rent.com"],
    ["facebook", "Facebook"],
  ];

  for (const [key, label] of known) {
    if (s.includes(key)) return label;
  }

  const withoutProtocol = raw.replace(/^https?:\/\//i, "");
  const hostname = withoutProtocol.split("/")[0].replace(/^www\./i, "");
  if (!hostname) return raw;

  const primary = hostname.split(".")[0];
  if (!primary) return raw;
  return primary.charAt(0).toUpperCase() + primary.slice(1);
}
