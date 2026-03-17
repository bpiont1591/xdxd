import { useMemo, useState } from "react";

export function getDiscordServerIconCandidates(server, size = 128) {
  const id = server?.id;
  const icon = server?.icon;
  if (!id || !icon) return [];

  const base = `https://cdn.discordapp.com/icons/${id}/${icon}`;
  const candidates = [];

  if (String(icon).startsWith("a_")) {
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

  const label = String(server?.name || "?").trim().slice(0, 1).toUpperCase() || "?";
  const src = candidates[index] || null;

  if (!src) {
    return <span className={fallbackClassName}>{label}</span>;
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt || server?.name || "Server icon"}
      onError={() => {
        setIndex((current) => {
          if (current >= candidates.length - 1) return current;
          return current + 1;
        });
      }}
    />
  );
}
