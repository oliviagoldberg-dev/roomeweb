import { NextResponse } from "next/server";

function extractMeta(html: string, property: string): string {
  // Try og: property first, then name= fallback
  const ogMatch =
    html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"));
  if (ogMatch) return ogMatch[1].trim();

  const nameMatch =
    html.match(new RegExp(`<meta[^>]+name=["']${property.replace("og:", "")}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property.replace("og:", "")}["']`, "i"));
  if (nameMatch) return nameMatch[1].trim();

  return "";
}

function extractTitle(html: string): string {
  const og = extractMeta(html, "og:title");
  if (og) return og;
  const tag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return tag ? tag[1].trim() : "";
}

function extractPrice(html: string): number | null {
  if (!html) return null;
  const metaPrice =
    html.match(/property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/itemprop=["']price["'][^>]+content=["']([^"']+)["']/i);
  if (metaPrice && metaPrice[1]) {
    const cleaned = metaPrice[1].replace(/[^0-9.]/g, "");
    const num = Number(cleaned);
    if (!Number.isNaN(num) && num > 0) return Math.round(num);
  }

  const dollarMatch = html.match(/\$\s?([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,6})/);
  if (dollarMatch && dollarMatch[1]) {
    const num = Number(dollarMatch[1].replace(/,/g, ""));
    if (!Number.isNaN(num)) return num;
  }

  const jsonMatch = html.match(/"price"\s*:\s*"?([0-9]{3,6})"?/i);
  if (jsonMatch && jsonMatch[1]) {
    const num = Number(jsonMatch[1]);
    if (!Number.isNaN(num)) return num;
  }

  return null;
}

function extractBeds(html: string): string {
  const jsonLd = html.match(/"numberOfBedrooms"\s*:\s*"?(\d+)"?/i);
  if (jsonLd) {
    const n = parseInt(jsonLd[1]);
    if (n === 0) return "Studio";
    return n >= 4 ? "4+" : String(n);
  }
  if (/\bstudio\b/i.test(html)) return "Studio";
  const match = html.match(/\b(\d+)\s*(?:bed(?:room)?s?|br)\b/i);
  if (match) {
    const n = parseInt(match[1]);
    return n >= 4 ? "4+" : String(n);
  }
  return "";
}

function extractBaths(html: string): string {
  const jsonLd = html.match(/"numberOfBathroomsTotal"\s*:\s*"?(\d+(?:\.\d+)?)"?/i);
  if (jsonLd) {
    const n = parseFloat(jsonLd[1]);
    if (n >= 2) return "2+";
    if (n === 1.5) return "1.5";
    return "1";
  }
  const match = html.match(/\b(\d+(?:\.\d+)?)\s*(?:bath(?:room)?s?|ba)\b/i);
  if (match) {
    const n = parseFloat(match[1]);
    if (n >= 2) return "2+";
    if (n === 1.5) return "1.5";
    return "1";
  }
  return "";
}

function extractAddress(html: string): string {
  const street = html.match(/"streetAddress"\s*:\s*"([^"]+)"/i);
  const city = html.match(/"addressLocality"\s*:\s*"([^"]+)"/i);
  const state = html.match(/"addressRegion"\s*:\s*"([^"]+)"/i);
  if (street) {
    let addr = street[1];
    if (city) addr += `, ${city[1]}`;
    if (state) addr += `, ${state[1]}`;
    return addr;
  }
  const itemProp =
    html.match(/itemprop=["']streetAddress["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/itemprop=["']streetAddress["'][^>]*>([^<]+)</i);
  if (itemProp) return itemProp[1].trim();
  return "";
}

function normalizeImageUrl(raw: string, baseUrl: string): string {
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  try {
    return new URL(raw, baseUrl).toString();
  } catch {
    return "";
  }
}

function extractFirstImage(html: string, hostname: string): string {
  if (!html) return "";
  const zillowMatch = html.match(/https:\/\/photos\.zillowstatic\.com\/[^"'\s)]+/i);
  if (hostname.includes("zillow") && zillowMatch) return zillowMatch[0];

  const genericMatch = html.match(/https?:\/\/[^"'\s)]+\.(?:jpg|jpeg|png|webp)/i);
  return genericMatch ? genericMatch[0] : "";
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });
  if (!res.ok) return "";
  return await res.text();
}

function prettifySource(hostname: string): string {
  if (hostname.includes("zillow")) return "Zillow";
  if (hostname.includes("apartments.com")) return "Apartments.com";
  if (hostname.includes("trulia")) return "Trulia";
  if (hostname.includes("realtor")) return "Realtor.com";
  if (hostname.includes("craigslist")) return "Craigslist";
  if (hostname.includes("streeteasy")) return "StreetEasy";
  if (hostname.includes("hotpads")) return "HotPads";
  if (hostname.includes("zumper")) return "Zumper";
  // Strip www. and return capitalized domain
  return hostname.replace(/^www\./, "");
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    const hostname = new URL(url).hostname;
    const source = prettifySource(hostname);

    let html = await fetchHtml(url);
    if (!html) {
      return NextResponse.json({
        title: "Listing",
        description: "Click to view listing",
        imageUrl: "",
        source,
      });
    }

    const title = extractTitle(html) || "Listing";
    const description =
      extractMeta(html, "og:description") ||
      extractMeta(html, "description") ||
      "Click to view listing";
    const rawImage =
      extractMeta(html, "og:image:secure_url") ||
      extractMeta(html, "og:image") ||
      extractMeta(html, "twitter:image") ||
      "";
    let imageUrl = normalizeImageUrl(rawImage, url) || extractFirstImage(html, hostname);

    let rent = extractPrice(html) ?? undefined;
    let beds = extractBeds(html);
    let baths = extractBaths(html);
    let address = extractAddress(html);

    if (!imageUrl || !beds || !baths || !address) {
      // Fallback: fetch via jina.ai (helps with some sites like Zillow)
      const stripped = url.replace(/^https?:\/\//, "");
      const jinaHtml = await fetchHtml(`https://r.jina.ai/https://${stripped}`);
      if (jinaHtml) {
        if (!imageUrl) imageUrl = extractFirstImage(jinaHtml, hostname);
        if (rent == null) rent = extractPrice(jinaHtml) ?? undefined;
        if (!beds) beds = extractBeds(jinaHtml);
        if (!baths) baths = extractBaths(jinaHtml);
        if (!address) address = extractAddress(jinaHtml);
      }
    }

    return NextResponse.json({ title, description, imageUrl, source, rent, beds, baths, address });
  } catch {
    return NextResponse.json({ error: "Failed to fetch preview" }, { status: 500 });
  }
}
