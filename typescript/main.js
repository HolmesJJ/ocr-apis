"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTexts = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const vision = __importStar(require("@google-cloud/vision"));
const AZURE_OCR_URL = "";
const AZURE_OCR_KEY = "";
const IMAGES_DIR = "../images/";
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function detectTexts(path, api) {
    return __awaiter(this, void 0, void 0, function* () {
        const predictions = [];
        if (api == "GOOGLE") {
            const client = new vision.ImageAnnotatorClient();
            const [result] = yield client.textDetection(path);
            const texts = result.textAnnotations || [];
            for (const text of texts) {
                const description = text.description || "";
                predictions.push(description);
            }
        }
        else if (api == "AZURE") {
            const content = fs_1.default.readFileSync(path);
            const headers = {
                "Content-Type": "application/octet-stream",
                "Ocp-Apim-Subscription-Key": AZURE_OCR_KEY,
            };
            const response = yield axios_1.default.post(AZURE_OCR_URL, content, { headers });
            const texts = response.data.readResult.pages[0].lines; // words
            for (const text of texts) {
                const content = text.content;
                predictions.push(content);
            }
        }
        return predictions;
    });
}
exports.detectTexts = detectTexts;
function predict(apis, interval = 5, debug = false) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const api of apis) {
            if (debug) {
                console.log(`${"=".repeat(30)} ${api} ${"=".repeat(30)}`);
            }
            const files = fs_1.default.readdirSync(IMAGES_DIR);
            for (const file of files) {
                const filePath = path_1.default.join(IMAGES_DIR, file);
                // const predictions = await detectTexts(filePath, api);
                const predictions = ["aa"];
                if (debug) {
                    console.log(`${path_1.default.basename(filePath)}: ${predictions.join(", ")}`);
                }
                yield sleep(interval);
            }
            if (debug) {
                console.log(`${"=".repeat(30)} ${api} ${"=".repeat(30)}`);
            }
        }
    });
}
predict(["GOOGLE"], 5, true);
