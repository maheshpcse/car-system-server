/**
 * Railway's MySQL plugin exposes MYSQLHOST / MYSQLUSER / MYSQLPASSWORD /
 * MYSQLDATABASE / MYSQLPORT. Local and AWS setups usually provide DATABASE_URL.
 * Prisma always reads DATABASE_URL, so we normalise here before the client loads.
 */
export function resolveDatabaseUrl(): string {
  const explicit = process.env.DATABASE_URL?.trim();
  if (explicit) return explicit;

  const host = process.env.MYSQLHOST ?? process.env.MYSQL_HOST;
  if (!host) return 'mysql://aurora:aurora@localhost:3306/aurora';

  const user = process.env.MYSQLUSER ?? process.env.MYSQL_USER ?? 'root';
  const password = process.env.MYSQLPASSWORD ?? process.env.MYSQL_PASSWORD ?? '';
  const port = process.env.MYSQLPORT ?? process.env.MYSQL_PORT ?? '3306';
  const database = process.env.MYSQLDATABASE ?? process.env.MYSQL_DATABASE ?? 'railway';

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}
