/**
 * Minimal, safe Markdown → HTML for /learn guides (server-side only, so it adds
 * nothing to the browser bundle). Raw HTML is always escaped; links are limited
 * to http(s), site-relative and #anchor URLs.
 *
 * Supports: ## / ### headings (with ids), paragraphs, **bold**, *italic*,
 * `code`, [links](url), - and 1. lists, > callouts, | tables |, and ---.
 */

export type Heading = { id: string; text: string; level: 2 | 3 };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const slugifyHeading = (s: string) =>
  s
    .toLowerCase()
    .replace(/[*_`[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

function safeHref(url: string) {
  const u = url.trim();
  return /^(https?:\/\/|\/(?!\/)|#)/i.test(u) ? u : null;
}

function inline(text: string): string {
  // Pull code spans out first so their contents are not formatted.
  const codes: string[] = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(esc(c)) - 1}\u0000`);
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = safeHref(url.replace(/&amp;/g, "&"));
    if (!href) return label;
    const external = /^https?:\/\//i.test(href);
    return `<a href="${esc(href)}"${external ? ' rel="noopener" target="_blank"' : ""}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

export function renderMarkdown(md: string): { html: string; headings: Heading[] } {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  let para: string[] = [];

  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (!t) {
      flush();
      continue;
    }

    const h = /^(#{2,3})\s+(.+?)\s*#*$/.exec(t);
    if (h) {
      flush();
      const level = h[1].length as 2 | 3;
      const text = h[2];
      let id = slugifyHeading(text) || "section";
      const n = used.get(id) ?? 0;
      used.set(id, n + 1);
      if (n) id = `${id}-${n + 1}`;
      headings.push({ id, text: text.replace(/[*_`]/g, ""), level });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(t)) {
      flush();
      out.push("<hr />");
      continue;
    }

    // Table: header row, then a |---|---| separator.
    if (t.startsWith("|") && /^\|?\s*:?-{3,}/.test(lines[i + 1]?.trim() ?? "")) {
      flush();
      const head = cells(t);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      i--;
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th scope="col">${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c, j) => (j === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join("")}</tr>`)
          .join("")}</tbody></table></div>`
      );
      continue;
    }

    if (t.startsWith(">")) {
      flush();
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) quote.push(lines[i++].trim().replace(/^>\s?/, ""));
      i--;
      out.push(`<aside class="callout"><p>${inline(quote.join(" "))}</p></aside>`);
      continue;
    }

    const ul = /^[-*]\s+/.test(t);
    const ol = /^\d+[.)]\s+/.test(t);
    if (ul || ol) {
      flush();
      const items: string[] = [];
      const re = ul ? /^[-*]\s+/ : /^\d+[.)]\s+/;
      while (i < lines.length && re.test(lines[i].trim())) {
        let item = lines[i++].trim().replace(re, "");
        // Indented continuation lines belong to the item.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !re.test(lines[i].trim())) item += " " + lines[i++].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      i--;
      out.push(ul ? `<ul>${items.join("")}</ul>` : `<ol>${items.join("")}</ol>`);
      continue;
    }

    para.push(t);
  }
  flush();
  return { html: out.join("\n"), headings };
}

/** Plain-text excerpt (for word counts and fallbacks). */
export function markdownText(md: string) {
  return md
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
