import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const siteId = "d25fd88e-e330-43b0-b9cc-fc2512027d08";
const accountId = "69bfb0076f2ab0158dde4beb";

function loadEnvLocal() {
  const raw = fs.readFileSync(path.join(root, ".env.local"), "utf8");
  const map = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    map[line.slice(0, i).trim()] = line.slice(i + 1);
  }
  return map;
}

function loadNetlifyToken() {
  const configPath = path.join(
    os.homedir(),
    "AppData",
    "Roaming",
    "netlify",
    "Config",
    "config.json",
  );
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const userId = cfg.userId;
  const token = cfg.users?.[userId]?.auth?.token;
  if (!token) throw new Error("No Netlify auth token found");
  return token;
}

async function api(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${url} → ${res.status}: ${text}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function valuesFor(value, isSecret) {
  // Secret vars cannot use context "all" on Netlify — set production + previews.
  const contexts = isSecret
    ? ["production", "deploy-preview", "branch-deploy"]
    : ["all"];
  return contexts.map((context) => ({ value, context }));
}

async function upsertVar(token, key, value, isSecret) {
  const base = `https://api.netlify.com/api/v1/accounts/${accountId}/env`;
  const createBody = [
    {
      key,
      scopes: ["builds", "functions", "runtime", "post-processing"],
      values: valuesFor(value, isSecret),
      is_secret: isSecret,
    },
  ];

  try {
    await api(token, "POST", `${base}?site_id=${siteId}`, createBody);
    console.log(`CREATED ${key}`);
    return;
  } catch (e) {
    // Delete + recreate is most reliable for multi-context secrets
    try {
      await api(
        token,
        "DELETE",
        `${base}/${encodeURIComponent(key)}?site_id=${siteId}`,
      );
    } catch {
      /* may not exist */
    }
    try {
      await api(token, "POST", `${base}?site_id=${siteId}`, createBody);
      console.log(`REPLACED ${key}`);
      return;
    } catch (e3) {
      console.error(`FAIL ${key}:`, e3.message || e.message);
      throw e3;
    }
  }
}

const env = loadEnvLocal();
const token = loadNetlifyToken();

const vars = [
  {
    key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    value: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secret: false,
  },
  {
    key: "STRIPE_SECRET_KEY",
    value: env.STRIPE_SECRET_KEY,
    secret: true,
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    value: env.STRIPE_WEBHOOK_SECRET,
    secret: true,
  },
  {
    key: "STRIPE_PRICE_PRO",
    value: env.STRIPE_PRICE_PRO,
    secret: false,
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    value: env.NEXT_PUBLIC_APP_URL || "https://trip-planner.co",
    secret: false,
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    value: env.SUPABASE_SERVICE_ROLE_KEY,
    secret: true,
    optional: true,
  },
];

for (const v of vars) {
  if (!v.value) {
    if (v.optional) {
      console.log(`SKIP ${v.key} (not in .env.local)`);
      continue;
    }
    throw new Error(`Missing ${v.key} in .env.local`);
  }
  await upsertVar(token, v.key, v.value, v.secret);
}

const list = await api(
  token,
  "GET",
  `https://api.netlify.com/api/v1/accounts/${accountId}/env?site_id=${siteId}`,
);

const names = (Array.isArray(list) ? list : [])
  .map((x) => x.key)
  .filter((k) => /STRIPE|APP_URL/.test(k))
  .sort();
console.log("Present on Netlify:", names.join(", ") || "(none)");
