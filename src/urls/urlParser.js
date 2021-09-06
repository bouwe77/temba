function parseUrl(url) {
  if (!url || (url && !url.trim())) return { resourceName: null, id: null };

  segments = url.split("/").filter((i) => i);

  const resourceName = segments.length > 0 ? segments[0] : null;
  const id = segments.length > 1 ? segments[1] : null;

  return { resourceName, id };
}

export { parseUrl };
