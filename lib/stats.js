export function buildPublicServerMeta(servers) {
  const totalBumps = servers.reduce((sum, s) => sum + Number(s.bumpCount || 0), 0);
  const totalFavorites = servers.reduce((sum, s) => sum + Number(s.favoriteCount || 0), 0);
  const totalReports = servers.reduce((sum, s) => sum + Number(s.reportCount || 0), 0);

  const categoriesMap = new Map();
  for (const server of servers) {
    for (const tag of server.tags || []) {
      const key = String(tag).trim().toLowerCase();
      if (!key) continue;
      categoriesMap.set(key, (categoriesMap.get(key) || 0) + 1);
    }
  }

  const categories = [...categoriesMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    totalServers: servers.length,
    totalBumps,
    totalFavorites,
    totalReports,
    categories
  };
}

export function filterAndSortServers(servers, query = "", category = "all", sort = "recent") {
  const q = String(query || "").trim().toLowerCase();

  let result = [...servers].filter((server) => {
    const matchesCategory =
      category === "all" || (server.tags || []).map((x) => x.toLowerCase()).includes(category.toLowerCase());

    const haystack = [server.name, server.description, ...(server.tags || [])].join(" ").toLowerCase();
    const matchesQuery = !q || haystack.includes(q);

    return matchesCategory && matchesQuery;
  });

  if (sort === "top") {
    result.sort((a, b) => Number(b.bumpCount || 0) - Number(a.bumpCount || 0));
  } else if (sort === "favorites") {
    result.sort((a, b) => Number(b.favoriteCount || 0) - Number(a.favoriteCount || 0));
  } else if (sort === "name") {
    result.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  } else {
    result.sort((a, b) => new Date(b.lastBumpAt || 0).getTime() - new Date(a.lastBumpAt || 0).getTime());
  }

  return result;
}
