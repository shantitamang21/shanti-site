/*
  Guestbook API
  GET  /api/pins  -> the most recent pins (newest first)
  POST /api/pins  -> { lat, lng, name?, note? } adds a pin

  Needs one app setting in Azure (Static Web App -> Environment variables):
    TABLES_CONNECTION_STRING = <your storage account connection string>

  To delete a pin: Azure Portal -> your storage account -> Storage browser
  -> Tables -> guestbook -> select the row -> Delete.
*/
const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");
const crypto = require("crypto");

const TABLE = "guestbook";
const MAX_PINS_RETURNED = 500;
const MAX_PINS_PER_DAY_PER_VISITOR = 3;
const MAX_NAME = 30;
const MAX_NOTE = 80;
const BLOCKED = ["http", "www.", ".com", "fuck", "shit", "bitch", "cunt", "nigg", "fag", "slut", "whore"];

let client;
let tableReady;
function getTable() {
  if (!client) {
    const cs = process.env.TABLES_CONNECTION_STRING;
    if (!cs) throw Object.assign(new Error("Guestbook storage is not set up yet."), { status: 503 });
    client = TableClient.fromConnectionString(cs, TABLE, { allowInsecureConnection: cs.includes("127.0.0.1") });
    tableReady = client.createTable().catch(e => { if (e.statusCode !== 409) throw e; });
  }
  return tableReady.then(() => client);
}

function clean(s, max) {
  if (typeof s !== "string") return "";
  return s.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function isBlocked(s) {
  const low = s.toLowerCase();
  return BLOCKED.some(w => low.includes(w));
}

function visitorHash(request) {
  const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-client-ip") || "unknown").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  return { day: day.replace(/-/g, ""), hash: crypto.createHash("sha256").update(ip + "|" + day).digest("hex").slice(0, 32) };
}

const json = (status, body) => ({ status, jsonBody: body, headers: { "Cache-Control": "no-store" } });

app.http("pins", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "pins",
  handler: async (request, context) => {
    try {
      const table = await getTable();

      if (request.method === "GET") {
        const pins = [];
        const iter = table.listEntities({ queryOptions: { filter: "PartitionKey eq 'pin'" } });
        for await (const e of iter) {
          pins.push({ lat: e.lat, lng: e.lng, name: e.name || "", note: e.note || "", ts: e.ts });
          if (pins.length >= MAX_PINS_RETURNED) break;
        }
        return json(200, { pins });
      }

      // POST
      let body;
      try { body = await request.json(); } catch { return json(400, { error: "Send JSON." }); }
      const lat = Number(body.lat), lng = Number(body.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -85 || lat > 85 || lng < -180 || lng > 180) {
        return json(400, { error: "Pick a spot on the map." });
      }
      const name = clean(body.name, MAX_NAME);
      const note = clean(body.note, MAX_NOTE);
      if (isBlocked(name) || isBlocked(note)) {
        return json(400, { error: "Let's keep it friendly (and no links)." });
      }

      // Light rate limit: a few pins per visitor per day. IPs are hashed, never stored.
      const v = visitorHash(request);
      const rateKey = { partitionKey: "rate-" + v.day, rowKey: v.hash };
      let count = 0;
      try { count = (await table.getEntity(rateKey.partitionKey, rateKey.rowKey)).count || 0; } catch (e) { if (e.statusCode !== 404) throw e; }
      if (count >= MAX_PINS_PER_DAY_PER_VISITOR) {
        return json(429, { error: "You've dropped enough pins for today. Come back tomorrow!" });
      }
      await table.upsertEntity({ ...rateKey, count: count + 1 }, "Replace");

      // Round to 1 decimal (~10 km) so nobody's exact location is stored.
      const ts = new Date().toISOString();
      const pin = {
        partitionKey: "pin",
        // Inverted time so the newest pins come back first.
        rowKey: String(9999999999999 - Date.now()).padStart(13, "0") + "-" + crypto.randomBytes(3).toString("hex"),
        lat: Math.round(lat * 10) / 10,
        lng: Math.round(lng * 10) / 10,
        name, note, ts
      };
      await table.createEntity(pin);
      return json(201, { pin: { lat: pin.lat, lng: pin.lng, name, note, ts } });
    } catch (err) {
      context.error(err);
      return json(err.status || 500, { error: err.status ? err.message : "Something went wrong. Try again in a bit." });
    }
  }
});
