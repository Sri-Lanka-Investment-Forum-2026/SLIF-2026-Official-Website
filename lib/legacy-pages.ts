import fs from "node:fs/promises";
import path from "node:path";

const filePath = (name: string) => path.join(process.cwd(), name);

const rewritePairs: Array<[RegExp, string]> = [
  [/(href|src)="\/?assets\//g, '$1="/assets/'],
  [/(href|src)="\/?partials\//g, '$1="/partials/'],
  [/href="\/?index\.html"/g, 'href="/"'],
  [/href="\/?contact\.html"/g, 'href="/contact"'],
  [/href="\/?offers\.html"/g, 'href="/offers"'],
  [/href="\/?venue\.html"/g, 'href="/venue"'],
  [/href="\/?privacy\.html"/g, 'href="/privacy"'],
  [/href="\/?terms\.html"/g, 'href="/terms"'],
  [/href="\/?project\.html\?id=([^"]+)"/g, 'href="/projects/$1"'],
  [/href="\/?sector\.html"/g, 'href="/sectors"'],
  [/href="\/?sectors\/index\.html"/g, 'href="/sectors"'],
  [/href="\/?sectors\/sector\.html\?sector=([^"]+)"/g, 'href="/sectors/$1"'],
];

const cleanupHtml = (html: string) => {
  let output = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  for (const [pattern, replacement] of rewritePairs) {
    output = output.replace(pattern, replacement);
  }

  return output;
};

export const loadLegacyMainHtml = async (name: string) => {
  const raw = await fs.readFile(filePath(name), "utf8");
  const match = raw.match(/<main[^>]*class="main"[^>]*>([\s\S]*?)<\/main>/i);

  if (!match) {
    throw new Error(`Unable to extract <main> from ${name}`);
  }

  return cleanupHtml(match[1]);
};
