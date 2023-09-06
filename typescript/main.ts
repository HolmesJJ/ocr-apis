import fs from "fs";
import path from "path";
import axios from "axios";
import * as vision from "@google-cloud/vision";

const AZURE_OCR_URL: string =
  "https://{endpoint}/computervision/imageanalysis:analyze?features=caption,read&model-version=latest&language=en&api-version=2023-02-01-preview";
const AZURE_OCR_KEY: string = "";

const IMAGES_DIR: string = "../images/";

export type API = "GOOGLE" | "AZURE";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function detectTexts(path: string, api: API): Promise<string[]> {
  const predictions: string[] = [];
  if (api == "GOOGLE") {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection(path);
    const texts = result.textAnnotations || [];
    for (const text of texts) {
      const description: string = text.description || "";
      predictions.push(description);
    }
  } else if (api == "AZURE") {
    const content: Buffer = fs.readFileSync(path);
    const headers = {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": AZURE_OCR_KEY,
    };
    const response = await axios.post(AZURE_OCR_URL, content, { headers });
    const texts = response.data.readResult.pages[0].lines; // words
    for (const text of texts) {
      const content: string = text.content;
      predictions.push(content);
    }
  }
  return predictions;
}

async function predict(
  apis: API[],
  interval: number = 5,
  debug: boolean = false
): Promise<void> {
  for (const api of apis) {
    if (debug) {
      console.log(`${"=".repeat(30)} ${api} ${"=".repeat(30)}`);
    }
    const files = fs.readdirSync(IMAGES_DIR);
    for (const file of files) {
      const filePath = path.join(IMAGES_DIR, file);
      const predictions = await detectTexts(filePath, api);
      if (debug) {
        console.log(`${path.basename(filePath)}: ${predictions.join(", ")}`);
      }
      await sleep(interval * 1000);
    }
    if (debug) {
      console.log(`${"=".repeat(30)} ${api} ${"=".repeat(30)}`);
    }
  }
}

predict(["GOOGLE"], 5, true);
