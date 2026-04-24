export interface RepoFile {
  path: string;
  type: 'file' | 'dir';
  size?: number;
}

export interface RepoContent {
  path: string;
  content: string;
}

function githubHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Cortex-AI',
  };
}

export async function listRepoTree(
  token: string,
  owner: string,
  repo: string,
  branch = 'main'
): Promise<RepoFile[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: githubHeaders(token) }
  );

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();

  return (data.tree || [])
    .filter((f: { type: string }) => f.type === 'blob' || f.type === 'tree')
    .map((f: { path: string; type: string; size?: number }) => ({
      path: f.path,
      type: f.type === 'tree' ? 'dir' : 'file',
      size: f.size,
    }))
    .filter((f: RepoFile) => {
      // Skip large/binary files and build artifacts
      if (f.size && f.size > 100_000) return false;
      const skip = ['.next/', 'node_modules/', '.git/', 'dist/', 'build/', '.png', '.jpg', '.ico', '.woff', '.ttf'];
      return !skip.some((s) => f.path.includes(s));
    });
}

export async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch = 'main'
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers: githubHeaders(token) }
  );

  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const data = await res.json();

  if (data.encoding === 'base64') {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  return data.content || '';
}

export async function searchRepoCode(
  token: string,
  owner: string,
  repo: string,
  query: string
): Promise<{ path: string; snippet: string }[]> {
  const res = await fetch(
    `https://api.github.com/search/code?q=${encodeURIComponent(query)}+repo:${owner}/${repo}&per_page=10`,
    { headers: githubHeaders(token) }
  );

  if (!res.ok) return [];
  const data = await res.json();

  return (data.items || []).map((item: { path: string; html_url: string }) => ({
    path: item.path,
    snippet: item.html_url,
  }));
}

export async function getUserRepos(token: string): Promise<{ full_name: string; name: string; owner: { login: string }; default_branch: string }[]> {
  const res = await fetch(
    'https://api.github.com/user/repos?sort=updated&per_page=50&type=all',
    { headers: githubHeaders(token) }
  );

  if (!res.ok) throw new Error('Failed to fetch repos');
  return res.json();
}
