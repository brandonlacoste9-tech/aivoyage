import pg from "pg";

const password = process.env.SUPABASE_DB_PASSWORD;
const ref = process.env.SUPABASE_PROJECT_REF || "svmjejrwsjdasxiclwiz";
const regions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
  "ca-central-1",
];

if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD");
  process.exit(1);
}

for (const region of regions) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  // Session pooler (port 5432) and transaction (6543)
  for (const port of [6543, 5432]) {
    const user = `postgres.${ref}`;
    const url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
    const client = new pg.Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 6000,
    });
    try {
      await client.connect();
      const r = await client.query("select 1 as ok");
      console.log("SUCCESS", { region, port, host, ok: r.rows[0].ok });
      await client.end();
      process.exit(0);
    } catch (e) {
      console.log("FAIL", region, port, e.message.split("\n")[0]);
      await client.end().catch(() => {});
    }
  }
}

// Direct host variants
for (const host of [
  `db.${ref}.supabase.co`,
  `${ref}.supabase.co`,
]) {
  const url = `postgresql://postgres:${encodeURIComponent(password)}@${host}:5432/postgres`;
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 6000,
  });
  try {
    await client.connect();
    console.log("SUCCESS direct", host);
    await client.end();
    process.exit(0);
  } catch (e) {
    console.log("FAIL direct", host, e.message.split("\n")[0]);
    await client.end().catch(() => {});
  }
}

process.exit(1);
