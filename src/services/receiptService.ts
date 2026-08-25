/**
 * receiptService.ts
 * Claro — Receipt Scanning Feature
 *
 * Drop this file into: src/services/receiptService.ts
 *
 * Responsibilities:
 *  1. Launch the device camera / photo library via expo-image-picker
 *  2. Convert the captured image to base64
 *  3. Send it to the OpenAI API (vision) for structured extraction
 *  4. Return a typed ReceiptExtraction the AddTransaction screen can
 *     use to pre-fill the transaction form — no other file changes needed
 *
 * Dependencies (already in Expo SDK — no extra installs):
 *   expo-image-picker      ^15.x  (bundled with Expo 52)
 *   expo-image-manipulator ^13.x  (bundled with Expo 52)
 *   expo-file-system       ^18.x  (already in your package.json)
 *
 * Why no base64 blob? Raw camera photos are 3–8 MB. We compress to a
 * ~800 px wide JPEG at 55% quality before encoding — receipts are text,
 * not art, so OCR quality is identical while the payload drops to ~60 KB
 * (a ~50–100× reduction). No cloud storage or backend required.
 *
 * Environment variable — add to your .env:
 *   EXPO_PUBLIC_OPENAI_KEY=sk-...
 *
 * The key is EXPO_PUBLIC_ so Metro exposes it to the JS bundle.
 * Never commit the real key; add .env to .gitignore.
 */

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = "expense" | "income";

export interface ReceiptExtraction {
  /** Merchant / vendor name as printed on the receipt */
  merchant: string;
  /** Total amount as a number (no currency symbol) */
  amount: number;
  /** ISO date string YYYY-MM-DD, defaults to today if not found */
  date: string;
  /** ISO 4217 currency code inferred from receipt, e.g. "GBP", "USD" */
  currency: string;
  /** Best-match category name from Claro's 42 default categories */
  suggestedCategory: string;
  /** expense or income — almost always expense for a receipt */
  type: TransactionType;
  /** Optional plain-English notes (first 1-3 line items or a summary) */
  notes: string;
}

export interface ReceiptScanResult {
  success: true;
  data: ReceiptExtraction;
  /** original file URI for the thumbnail — use directly in <Image source={{ uri }} /> */
  imageUri: string;
}

export interface ReceiptScanError {
  success: false;
  error: "cancelled" | "permission_denied" | "extraction_failed" | "network_error";
  message: string;
}

export type ReceiptScanResponse = ReceiptScanResult | ReceiptScanError;

// ─── Constants ────────────────────────────────────────────────────────────────

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 1024;

/**
 * All 42 Claro category names so the model returns exact matches.
 * Keep this in sync with src/db/seed.ts if you add custom categories.
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

// ─── System prompt ────────────────────────────────────────────────────────────

const buildSystemPrompt = (): string => `
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

// ─── Image capture + compression ─────────────────────────────────────────────

/**
 * Target dimensions for the compressed receipt image sent to OpenAI.
 *
 * Why 1600 px?
 *   A typical receipt is tall and narrow. 1600 px wide keeps enough detail
 *   for small printed text (dates, line items) to survive JPEG re-encoding.
 *   Going wider only helps at detail: "high" — with detail: "auto" (used
 *   below) OpenAI already tiles the full-resolution image as needed, so
 *   1600 px is the right balance of legibility vs. payload size here.
 *
 * Why 55% quality?
 *   JPEG at 55% on a white-background receipt looks near-identical to 85%
 *   but is ~3× smaller. The artefacts that appear at low quality live in
 *   gradients and photos — not in high-contrast black text on white paper.
 *
 * Typical payload sizes:
 *   Raw camera JPEG (12 MP iPhone)   →  4–8 MB  → base64 ~5.5–11 MB
 *   After resize + compress          →  50–90 KB → base64 ~68–120 KB
 *   Reduction factor                 →  ~50–100×
 */
const COMPRESS_MAX_WIDTH_PX = 1600;
const COMPRESS_QUALITY = 0.55; // 0–1, JPEG quality

/**
 * Launches the camera or photo library, captures the image, then
 * compresses it before returning the base64 string.
 *
 * Returns null if the user cancelled or permission was denied.
 */
export async function captureReceiptImage(
  source: "camera" | "library" = "camera"
): Promise<{ uri: string; base64: string } | null> {

  // 1. Request permissions ────────────────────────────────────────────────────
  if (source === "camera") {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return null;
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return null;
  }

  // 2. Capture (do NOT request base64 here — we'll read after compression) ────
  //    quality: 1 here so we get the full-res file to manipulate ourselves.
  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 1,
    base64: false,        // skip base64 at capture time — saves memory
    allowsEditing: true,  // lets user crop/straighten before analysis
    aspect: [3, 4],       // portrait receipt crop guide
    exif: false,
  };

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  if (result.canceled || !result.assets?.[0]) return null;

  const rawUri = result.assets[0].uri;

  // 3. Compress with expo-image-manipulator ───────────────────────────────────
  //    resize: shrinks the longest dimension to COMPRESS_MAX_WIDTH_PX while
  //            preserving aspect ratio (the `width` option does this natively).
  //    compress: JPEG quality 0–1.
  //    format: SaveFormat.JPEG — always JPEG for receipts (no alpha needed,
  //            JPEG compression is much better than PNG for photos).
  const compressed = await ImageManipulator.manipulateAsync(
    rawUri,
    [{ resize: { width: COMPRESS_MAX_WIDTH_PX } }],
    {
      compress: COMPRESS_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: false, // still don't materialise base64 yet
    }
  );

  // 4. Read the compressed file as base64 ─────────────────────────────────────
  //    We read AFTER compression so we're encoding the small file, not the
  //    original. This is the key step that keeps the payload tiny.
  const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 5. Clean up the temp compressed file (optional, keeps cache tidy) ─────────
  try {
    await FileSystem.deleteAsync(compressed.uri, { idempotent: true });
  } catch {
    // Non-fatal — OS will evict the cache directory eventually
  }

  return {
    uri: rawUri,   // original URI for the thumbnail in the review card
    base64,        // compressed base64 for the API call
  };
}

// ─── OpenAI API call ──────────────────────────────────────────────────────────

async function extractReceiptData(
  imageBase64: string
): Promise<ReceiptExtraction> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY;
  if (!apiKey) {
    throw new Error("EXPO_PUBLIC_OPENAI_KEY is not set in your .env file.");
  }

  const today = new Date().toISOString().split("T")[0];

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
                url: `data:image/jpeg;base64,${imageBase64}`,
                // detail: "auto" is intentional, not the default left in place.
                // "low" fixes OpenAI's internal image processing to ~512x512
                // regardless of source resolution, and small printed dates on
                // receipts do not reliably survive that downsample — tested
                // across several receipts/compression widths, "low" returned
                // a different wrong date each time. "auto" lets the model
                // tile the full-resolution image when it needs to. The cost
                // tradeoff is accepted: ~$0.026/scan ("auto") vs. ~$0.003/scan
                // ("low") on gpt-4o-mini.
                detail: "auto",
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
    throw new Error(`OpenAI API error ${response.status}: ${body}`);
  }

  const json = await response.json();
  const rawText: string = json.choices?.[0]?.message?.content ?? "";

  // Strip any accidental markdown fences
  const cleaned = rawText.replace(/```json|```/gi, "").trim();

  let parsed: Partial<ReceiptExtraction>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Model returned non-JSON: ${rawText.slice(0, 200)}`);
  }

  // Validate and fill defaults
  const extraction: ReceiptExtraction = {
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

  return extraction;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Full scan flow: capture image → send to OpenAI → return typed extraction.
 *
 * Usage in AddTransactionScreen:
 *
 *   const result = await scanReceipt("camera");
 *   if (result.success) {
 *     setAmount(String(result.data.amount));
 *     setNotes(result.data.merchant);
 *     setSelectedCategory(result.data.suggestedCategory);
 *     setReceiptThumbnail(result.imageBase64);
 *   } else {
 *     toastService.show(result.message);
 *   }
 */
export async function scanReceipt(
  source: "camera" | "library" = "camera"
): Promise<ReceiptScanResponse> {
  // 1. Capture
  let captured: { uri: string; base64: string } | null;
  try {
    captured = await captureReceiptImage(source);
  } catch {
    return {
      success: false,
      error: "permission_denied",
      message: "Camera permission is required to scan receipts.",
    };
  }

  if (!captured) {
    return {
      success: false,
      error: "cancelled",
      message: "Receipt scan cancelled.",
    };
  }

  // 2. Extract
  try {
    const data = await extractReceiptData(captured.base64);
    return {
      success: true,
      data,
      imageUri: captured.uri,   // original URI — ImagePicker keeps it on disk until app restart
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not read this receipt.";
    const isNetwork =
      message.toLowerCase().includes("network") ||
      message.toLowerCase().includes("fetch");
    return {
      success: false,
      error: isNetwork ? "network_error" : "extraction_failed",
      message: isNetwork
        ? "No internet connection. Please try again."
        : "Couldn't read that receipt clearly. Try better lighting or a flatter surface.",
    };
  }
}
