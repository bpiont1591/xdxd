import { useEffect, useMemo, useState } from "react";

function isAbsoluteUrl(value = "") {
  return /^https?:\/\//i.test(String(value).trim());
}

export function getDiscordServerIconCandidates(server, size = 128) {
  const id = server?.id;
  const icon = String(server?.icon || "").trim();
  if (!icon) return [];

  if (isAbsoluteUrl(icon)) {
    try {
      const url = new URL(icon);
      if (!url.searchParams.has("size")) {
        url.searchParams.set("size", String(size));
      }
      return [url.toString()];
    } catch {
      return [icon];
    }
  }

  if (!id) return [];

  const base = `https://cdn.discordapp.com/icons/${id}/${icon}`;
  const candidates = [];

  if (icon.startsWith("a_")) {
    candidates.push(`${base}.gif?size=${size}`);
  }

  candidates.push(`${base}.png?size=${size}`);
  candidates.push(`${base}.webp?size=${size}`);
  candidates.push(`${base}.jpg?size=${size}`);

  return [...new Set(candidates)];
}

export default function DiscordServerIcon({
  server,
  size = 128,
  className = "",
  alt,
  fallbackClassName = "",
}) {
  const candidates = useMemo(() => getDiscordServerIconCandidates(server, size), [server, size]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [server?.id, server?.icon, size]);

  const label = String(server?.name || "?").trim().slice(0, 1).toUpperCase() || "?";
  const src = candidates[index] || null;

  if (!src) {
    return <span className={fallbackClassName}>{label}</span>;
  }

  return (
    <img
      key={`${server?.id || "server"}-${server?.icon || "no-icon"}-${index}`}
      className={className}
      src={src}
      alt={alt || server?.name || "Server icon"}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        setIndex((current) => {
          if (current >= candidates.length - 1) return current + 1;
          return current + 1;
        });
      }}
    />
  );
}
