import { fetch } from "@tauri-apps/plugin-http";

async function fetchWebContent(url: string): Promise<string> {
  const response = await fetch(url, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const text = await response.text();
  return text;
}

function parseHTML(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

function extractContent(document: Document): string {
  // Example: Extract all paragraphs
  const paragraphs = document.querySelectorAll("p");
  return Array.from(paragraphs)
    .map((p) => p.textContent)
    .join("\n");
}

export async function grabContentFromUrl(url: string) {
  try {
    const html = await fetchWebContent(url);
    if (!html.startsWith("HTTP error")) {
      const document = parseHTML(html);
      const extractedContent = extractContent(document);
      return extractedContent;
    }
  } catch (error) {
    console.error("Error:", error);
  }
  return null;
}
