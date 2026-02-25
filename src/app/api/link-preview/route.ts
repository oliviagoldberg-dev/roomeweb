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

    if (!imageUrl) {
      // Fallback: fetch via jina.ai (helps with some sites like Zillow)
      const jinaHtml = await fetchHtml(`https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`);
      if (jinaHtml) {
        imageUrl = extractFirstImage(jinaHtml, hostname);
      }
    }

    return NextResponse.json({ title, description, imageUrl, source });
  } catch {
    return NextResponse.json({ error: "Failed to fetch preview" }, { status: 500 });
  }
}
