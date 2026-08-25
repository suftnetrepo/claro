#!/usr/bin/env node
/**
 * scripts/test-receipt.mjs
 * Claro — Receipt Scanning Feature — Level 1 isolation test
 *
 * Verifies the OpenAI key + prompt work BEFORE wiring anything into the app.
 * Mirrors src/services/receiptService.ts exactly: same system prompt, same
 * category list, same request body shape, same response parsing/validation
 * — and the same compression step (resize to COMPRESS_MAX_WIDTH_PX, re-encode
 * JPEG at COMPRESS_QUALITY, via sharp here vs. expo-image-manipulator in the
 * app) so this test sends OpenAI the same bytes the real capture flow would.
 * No app, no Expo, no React Native — just Node + fetch + sharp.
 *
 * Setup:
 *   1. npm install sharp --save-dev  (if not already installed)
 *   2. Drop a sample receipt photo at scripts/sample-receipt.{jpg,jpeg,png}
 *   3. Make sure EXPO_PUBLIC_OPENAI_KEY is set (either exported in your
 *      shell, or in a .env file at the project root)
 *
 * Run:
 *   node --env-file=.env scripts/test-receipt.mjs
 *
 *   (or, if the key is already exported in your shell:)
 *   node scripts/test-receipt.mjs
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Constants — copied verbatim from src/services/receiptService.ts ─────────

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 1024;

// Mirrors the app's compression pipeline (expo-image-manipulator) so this
// test sends OpenAI the same bytes the real capture flow would produce.
const COMPRESS_MAX_WIDTH_PX = 1600;
const COMPRESS_QUALITY = 55; // sharp's jpeg quality is 0–100, not 0–1

// Accept whichever extension the sample was dropped in as — the request's
// media type must match the actual file bytes, so this drives both.
const SAMPLE_IMAGE_CANDIDATES = ["jpg", "jpeg", "png"].map((ext) => ({
  path: path.join(__dirname, `sample-receipt.${ext}`),
  mediaType: ext === "png" ? "image/png" : "image/jpeg",
}));

/**
 * All 42 Claro category names so the model returns exact matches.
 * Keep this in sync with src/services/receiptService.ts / src/db/seed.ts.
 */
const CLARO_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Coffee & Cafes",
  "Restaurants",
  "Fast Food",
  "Alcohol & Bars",
  "Transport",
  "Fuel",
  "Parking",
  "Public Transport",
  "Taxi & Ride Share",
  "Flights",
  "Accommodation",
  "Shopping",
  "Clothing",
  "Electronics",
  "Home & Garden",
  "Sports & Fitness",
  "Entertainment",
  "Cinema & Theatre",
  "Games",
  "Books & Magazines",
  "Health & Medical",
  "Pharmacy",
  "Beauty & Personal Care",
  "Education",
  "Subscriptions",
  "Utilities",
  "Rent & Mortgage",
  "Insurance",
  "Banking & Finance",
  "Gifts & Donations",
  "Travel",
  "Pet Care",
  "Kids & Baby",
  "Work & Office",
  "Business",
  "Taxes",
  "Salary",
  "Freelance Income",
  "Investment",
  "Other",
];

// ─── System prompt — copied verbatim from src/services/receiptService.ts ────

const buildSystemPrompt = () => `
You are a receipt parser for a personal finance app called Claro.
Your job is to extract structured data from a photo of a receipt and return ONLY a JSON object.

Rules:
- Return ONLY valid JSON, no markdown, no preamble, no explanation.
- If a field cannot be determined, use the defaults shown below.
- Date: read the date from the SALE/PURCHASE section at the top of the receipt, not from refund dates, return deadlines, or timestamps printed lower down. The receipt may contain multiple dates — always use the earliest one, which is the transaction date. Format as YYYY-MM-DD. Only fall back to today if no date is visible at all.
- Amount: read the TOTAL line exactly as printed. Do not round or estimate. If you see £113.73 return 113.73, not 113.79.
- Currency must be an ISO 4217 code (GBP, USD, EUR, etc.). Infer from symbols or locale if possible; default to "GBP".
- suggestedCategory must be EXACTLY one of: ${CLARO_CATEGORIES.join(", ")}.
- type is almost always "expense" for a receipt. Use "income" only for cashback/refund receipts.
- notes: a short summary of 1–3 main items, max 80 characters. Empty string if nothing useful.

Return this exact shape:
{
  "merchant": "string",
  "amount": 0.00,
  "date": "YYYY-MM-DD",
  "currency": "GBP",
  "suggestedCategory": "string",
  "type": "expense",
  "notes": "string"
}
`.trim();

// ─── Validation — copied verbatim from src/services/receiptService.ts ───────

function validateExtraction(parsed, today) {
  return {
    merchant: typeof parsed.merchant === "string" && parsed.merchant
      ? parsed.merchant
      : "Unknown Merchant",
    amount:
      typeof parsed.amount === "number" && parsed.amount > 0
        ? Math.round(parsed.amount * 100) / 100
        : 0,
    date:
      typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
        ? parsed.date
        : today,
    currency:
      typeof parsed.currency === "string" && parsed.currency.length === 3
        ? parsed.currency.toUpperCase()
        : "GBP",
    suggestedCategory:
      typeof parsed.suggestedCategory === "string" &&
      CLARO_CATEGORIES.includes(parsed.suggestedCategory)
        ? parsed.suggestedCategory
        : "Other",
    type:
      parsed.type === "income" || parsed.type === "expense"
        ? parsed.type
        : "expense",
    notes:
      typeof parsed.notes === "string"
        ? parsed.notes.slice(0, 80)
        : "",
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY;
  if (!apiKey) {
    console.error("✗ EXPO_PUBLIC_OPENAI_KEY is not set.");
    console.error("  Run with: node --env-file=.env scripts/test-receipt.mjs");
    process.exit(1);
  }

  let rawBuffer;
  for (const candidate of SAMPLE_IMAGE_CANDIDATES) {
    try {
      rawBuffer = await readFile(candidate.path);
      break;
    } catch {
      // try the next extension
    }
  }
  if (!rawBuffer) {
    console.error("✗ Could not find a sample image at scripts/sample-receipt.{jpg,jpeg,png}");
    console.error("  Drop a receipt photo there with one of those extensions.");
    process.exit(1);
  }

  // Compress exactly like captureReceiptImage() in receiptService.ts:
  // resize to COMPRESS_MAX_WIDTH_PX wide (preserving aspect ratio, never
  // upscaling smaller inputs) then re-encode as JPEG at COMPRESS_QUALITY.
  const compressedBuffer = await sharp(rawBuffer)
    .resize({ width: COMPRESS_MAX_WIDTH_PX, withoutEnlargement: true })
    .jpeg({ quality: COMPRESS_QUALITY })
    .toBuffer();

  const mediaType = "image/jpeg"; // sharp always re-encodes to JPEG above
  const imageBase64 = compressedBuffer.toString("base64");
  const today = new Date().toISOString().split("T")[0];

  console.log(`→ Raw input:        ${(rawBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`→ Compressed JPEG:  ${(compressedBuffer.length / 1024).toFixed(1)} KB (${COMPRESS_MAX_WIDTH_PX}px wide, q${COMPRESS_QUALITY})`);
  console.log(`→ Calling ${MODEL} with ${(imageBase64.length / 1024).toFixed(0)} KB of base64 image data…\n`);

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_completion_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${imageBase64}`,
                detail: "low",
              },
            },
            {
              type: "text",
              text: `Extract the receipt data. Today's date is ${today}. Return only JSON.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(`✗ OpenAI API error ${response.status}: ${body}`);
    process.exit(1);
  }

  const json = await response.json();
  console.log("── Raw JSON response ──────────────────────────────────────────\n");
  console.log(JSON.stringify(json, null, 2));

  const rawText = json.choices?.[0]?.message?.content ?? "";
  const cleaned = rawText.replace(/```json|```/gi, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error(`\n✗ Model returned non-JSON: ${rawText.slice(0, 200)}`);
    process.exit(1);
  }

  const extraction = validateExtraction(parsed, today);

  console.log("\n── Parsed + validated extraction ──────────────────────────────\n");
  console.log(JSON.stringify(extraction, null, 2));
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err);
  process.exit(1);
});
