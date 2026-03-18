function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return null;
  return new Intl.NumberFormat('pl-PL').format(Number(value));
}

export default function ServerCommunityStats({
  online,
  total,
  status = 'missing',
  compact = false,
  className = '',
}) {
  const hasOnline = Number.isFinite(Number(online));
  const hasTotal = Number.isFinite(Number(total));
  const stateClass =
    status === 'available'
      ? 'is-online'
      : status === 'invalid' || status === 'error'
      ? 'is-error'
      : 'is-idle';

  let label = 'Brak danych społeczności';
  if (hasOnline || hasTotal) {
    const onlineLabel = hasOnline ? `${formatNumber(online)} online` : 'Brak online';
    const totalLabel = hasTotal ? `${formatNumber(total)} razem` : 'Brak liczby członków';
    label = compact ? `${onlineLabel} • ${totalLabel}` : `${onlineLabel} • ${totalLabel}`;
  } else if (status === 'invalid') {
    label = 'Invite nie działa';
  } else if (status === 'error') {
    label = 'Nie udało się pobrać statystyk';
  }

  return (
    <div className={`community-stats ${compact ? 'compact' : ''} ${stateClass} ${className}`.trim()}>
      <span className="community-dot" aria-hidden="true" />
      <span className="community-text">{label}</span>
    </div>
  );
}
