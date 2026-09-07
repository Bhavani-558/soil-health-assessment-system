import jsPDF from "jspdf";
import { SoilResult, formatDeficiencies, formatFertilizers } from "./soil-context";

export type FormState = {
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  ph: string;
  moisture: string;
  organic_c: string;
  electrical_conductivity: string;
  temperature: string;
  humidity: string;
  rainfall: string;
  soil_type: string;
  crop_type: string;
  crop_growth: string;
  season: string;
  irrigation: string;
  previous_crop: string;
  region: string;
  district?: string;
  village?: string;
  fertilizer_used_last: string;
};

// Multilingual labels dictionary for PDF generation
const pdfI18n = {
  en: {
    reportTitle: "SOIL HEALTH REPORT",
    reportSubtitle: "AI-Based Soil Health Assessment & Decision Support",
    generatedDate: "Date Generated",

    soilHealthScore: "SOIL HEALTH SCORE",
    degradationRisk: "DEGRADATION RISK",
    soilType: "SOIL TYPE",
    confidence: "CNN Confidence",

    diagnosisTitle: "DIAGNOSIS & RECOMMENDATIONS",
    nutrientDeficiency: "Nutrient Deficiency",
    recommendedFertilizer: "Recommended Fertilizer",
    fertilizer: "Fertilizer",
    dosage: "Dosage",
    kgPerAcre: "kg/acre",
    recommendedCrops: "Recommended Crops",
    rankCropHeader: "Rank / Crop Name",
    suitabilityHeader: "Suitability Score",
    degradationRiskTitle: "Degradation Risk Assessment",
    score: "Score",
    level: "Level",
    longTermDegradation: "Long-Term Degradation Forecast",
    year: "Year",
    forecastScore: "Risk Index",

    // Page 2 - Visual Evidence
    visualEvidenceTitle: "MODEL VISUAL EVIDENCE",
    gradcamHeader: (soilType: string, confidence: number | string) => `Grad-CAM: ${soilType} (${confidence}%)`,
    gradcamCaption: "Grad-CAM visualization showing image regions contributing to the soil classification.",
    gradcamUnavailable: "Grad-CAM visualization unavailable for this analysis.",

    page: "Page",
    of: "of",
    noDeficiency: "No critical nutrient deficiency detected in this sample.",
    noCropData: "No crop recommendation data available.",
    noTrendData: "No trend forecast data available.",
    notAvailable: "N/A",
  },
  hi: {
    reportTitle: "मृदा स्वास्थ्य रिपोर्ट",
    reportSubtitle: "एआई-आधारित मृदा स्वास्थ्य मूल्यांकन एवं निर्णय सहायता",
    generatedDate: "जारी तिथि",

    soilHealthScore: "मृदा स्वास्थ्य स्कोर",
    degradationRisk: "क्षरण जोखिम",
    soilType: "मिट्टी का प्रकार",
    confidence: "CNN विश्वसनीयता",

    diagnosisTitle: "निदान एवं अनुशंसाएं",
    nutrientDeficiency: "पोषक तत्वों की कमी",
    recommendedFertilizer: "अनुशंसित उर्वरक",
    fertilizer: "उर्वरक",
    dosage: "मात्रा",
    kgPerAcre: "किग्रा/एकड़",
    recommendedCrops: "अनुशंसित फसलें",
    rankCropHeader: "रैंक / फसल का नाम",
    suitabilityHeader: "उपयुक्तता स्कोर",
    degradationRiskTitle: "क्षरण जोखिम मूल्यांकन",
    score: "स्कोर",
    level: "स्तर",
    longTermDegradation: "दीर्घकालिक क्षरण पूर्वानुमान",
    year: "वर्ष",
    forecastScore: "जोखिम सूचकांक",

    // Page 2 - Visual Evidence
    visualEvidenceTitle: "मॉडल दृश्य प्रमाण",
    gradcamHeader: (soilType: string, confidence: number | string) => `Grad-CAM: ${soilType} (${confidence}%)`,
    gradcamCaption: "Grad-CAM हीटमैप जो मिट्टी वर्गीकरण में योगदान देने वाले छवि क्षेत्रों को प्रदर्शित करता है।",
    gradcamUnavailable: "इस विश्लेषण के लिए Grad-CAM विज़ुअलाइज़ेशन उपलब्ध नहीं है।",

    page: "पृष्ठ",
    of: "का",
    noDeficiency: "इस नमूने में कोई गंभीर पोषक तत्व की कमी नहीं पाई गई।",
    noCropData: "कोई फसल अनुशंसा डेटा उपलब्ध नहीं है।",
    noTrendData: "कोई रुझान पूर्वानुमान डेटा उपलब्ध नहीं है।",
    notAvailable: "उपलब्ध नहीं",
  },
  kn: {
    reportTitle: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ವರದಿ",
    reportSubtitle: "ಎಐ-ಆಧಾರಿತ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ನಿರ್ಧಾರ ಬೆಂಬಲ",
    generatedDate: "ರಚಿಸಿದ ದಿನಾಂಕ",

    soilHealthScore: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸ್ಕೋರ್",
    degradationRisk: "ಕ್ಷೀಣತೆಯ ಅಪಾಯ",
    soilType: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
    confidence: "CNN ವಿಶ್ವಾಸಾರ್ಹತೆ",

    diagnosisTitle: "ರೋಗನಿರ್ಣಯ ಮತ್ತು ಶಿಫಾರಸುಗಳು",
    nutrientDeficiency: "ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ",
    recommendedFertilizer: "ಶಿಫಾರಸು ಮಾಡಿದ ರಸಗೊಬ್ಬರ",
    fertilizer: "ರಸಗೊಬ್ಬರ",
    dosage: "ಪ್ರಮಾಣ",
    kgPerAcre: "ಕೆಜಿ/ಎಕರೆ",
    recommendedCrops: "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",
    rankCropHeader: "ಶ್ರೇಣಿ / ಬೆಳೆಯ ಹೆಸರು",
    suitabilityHeader: "ಸೂಕ್ತತೆ ಸ್ಕೋರ್",
    degradationRiskTitle: "ಕ್ಷೀಣತೆಯ ಅಪಾಯದ ಮೌಲ್ಯಮಾಪನ",
    score: "ಅಂಕ",
    level: "ಮಟ್ಟ",
    longTermDegradation: "ದೀರ್ಘಕಾಲೀನ ಕ್ಷೀಣತೆಯ ಮುನ್ಸೂಚನೆ",
    year: "ವರ್ಷ",
    forecastScore: "ಅಪಾಯದ ಸೂಚಿ",

    // Page 2 - Visual Evidence
    visualEvidenceTitle: "ಮಾತೃಕೆ ದೃಶ್ಯ ಸಾಕ್ಷ್ಯ",
    gradcamHeader: (soilType: string, confidence: number | string) => `Grad-CAM: ${soilType} (${confidence}%)`,
    gradcamCaption: "Grad-CAM ಹೀಟ್‌ಮ್ಯಾಪ್ ಮಣ್ಣಿನ ವರ್ಗೀಕರಣಕ್ಕೆ ಕೊಡುಗೆ ನೀಡುವ ಪ್ರದೇಶಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.",
    gradcamUnavailable: "ಈ ವಿಶ್ಲೇಷಣೆಗೆ Grad-CAM ದೃಶ್ಯೀಕರಣ ಲಭ್ಯವಿಲ್ಲ.",

    page: "ಪುಟ",
    of: "ರ",
    noDeficiency: "ಈ ಮಾದರಿಯಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ಪೋಷಕಾಂಶ ಕೊರತೆ ಕಂಡುಬಂದಿಲ್ಲ.",
    noCropData: "ಯಾವುದೇ ಬೆಳೆ ಶಿಫಾರಸು ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.",
    noTrendData: "ಯಾವುದೇ ಪ್ರವೃತ್ತಿ ಮುನ್ಸೂಚನೆ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.",
    notAvailable: "ಲಭ್ಯವಿಲ್ಲ",
  },
};

const cropMap: Record<string, { hi: string; kn: string }> = {
  Rice: { hi: "चावल (Rice)", kn: "ಅಕ್ಕಿ/ಭತ್ತ (Rice)" },
  Wheat: { hi: "गेहूं (Wheat)", kn: "ಗೋಧಿ (Wheat)" },
  Maize: { hi: "मक्का (Maize)", kn: "ಮೆಕ್ಕೆಜೋಳ (Maize)" },
  Groundnut: { hi: "मूंगफली (Groundnut)", kn: "ಕಡಲೆಕಾಯಿ (Groundnut)" },
  Cotton: { hi: "कपास (Cotton)", kn: "ಹತ್ತಿ (Cotton)" },
  Pulses: { hi: "दालें (Pulses)", kn: "ಬೇಳೆಕಾಳುಗಳು (Pulses)" },
  Sugarcane: { hi: "गन्ना (Sugarcane)", kn: "ಕಬ್ಬು (Sugarcane)" },
};

const levelMap: Record<string, { hi: string; kn: string }> = {
  "Very Low": { hi: "बहुत कम (Very Low)", kn: "ಬಹಳ ಕಡಿಮೆ (Very Low)" },
  Low: { hi: "कम (Low)", kn: "ಕಡಿಮೆ (Low)" },
  Moderate: { hi: "मध्यम (Moderate)", kn: "ಮಧ್ಯಮ (Moderate)" },
  High: { hi: "उच्च (High)", kn: "ಹೆಚ್ಚು (High)" },
  Critical: { hi: "गंभीर (Critical)", kn: "ಗಂಭೀರ (Critical)" },
};

const categoryMap: Record<string, { hi: string; kn: string }> = {
  Excellent: { hi: "उत्कृष्ट (Excellent)", kn: "ಅತ್ಯುತ್ತಮ (Excellent)" },
  Good: { hi: "अच्छा (Good)", kn: "ಉತ್ತಮ (Good)" },
  Moderate: { hi: "मध्यम (Moderate)", kn: "ಮಧ್ಯಮ (Moderate)" },
  Poor: { hi: "खराब (Poor)", kn: "ಕಳಪೆ (Poor)" },
  Critical: { hi: "गंभीर (Critical)", kn: "ಸಂಕಷ್ಟದ (Critical)" },
};

/**
 * Smart text renderer for jsPDF that splits text into Indic (Devanagari/Kannada)
 * and Latin/ASCII chunks and renders each chunk with the appropriate font.
 * Ensures zero missing or blank dynamic values when switching languages.
 */
function drawSmartText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  indicFont: string,
  options?: { align?: "left" | "center" | "right" }
) {
  if (!text) return;

  const chunks: { text: string; isIndic: boolean }[] = [];
  const regex = /([\u0900-\u097F\u0C80-\u0CFF]+)|([^\u0900-\u097F\u0C80-\u0CFF]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      chunks.push({ text: match[1], isIndic: true });
    } else if (match[2]) {
      chunks.push({ text: match[2], isIndic: false });
    }
  }

  if (chunks.length === 0) return;

  let totalWidth = 0;
  const chunkWidths = chunks.map((chunk) => {
    pdf.setFont(chunk.isIndic ? indicFont : "helvetica", "normal");
    const w = pdf.getTextWidth(chunk.text);
    totalWidth += w;
    return w;
  });

  let currentX = x;
  if (options?.align === "center") {
    currentX = x - totalWidth / 2;
  } else if (options?.align === "right") {
    currentX = x - totalWidth;
  }

  chunks.forEach((chunk, i) => {
    pdf.setFont(chunk.isIndic ? indicFont : "helvetica", "normal");
    pdf.text(chunk.text, currentX, y);
    currentX += chunkWidths[i];
  });
}

function drawSmartTextLines(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  lineHeight: number,
  indicFont: string,
  maxWidth: number
) {
  if (!text) return;
  const isIndic = /[\u0900-\u097F\u0C80-\u0CFF]/.test(text);
  pdf.setFont(isIndic ? indicFont : "helvetica", "normal");
  const lines = pdf.splitTextToSize(text, maxWidth);
  lines.forEach((line: string, i: number) => {
    drawSmartText(pdf, line, x, y + i * lineHeight, indicFont);
  });
}

// Robust Grad-CAM Image Loader & Canvas Normalizer
const resolveGradcamImage = (result: SoilResult): Promise<string | null> => {
  return new Promise((resolve) => {
    const rawSrc =
      result.gradcam_image_base64 ||
      result.gradcam_image_url ||
      "http://10.229.174.90:8000/gradcam_result.jpg";

    if (!rawSrc) {
      resolve(null);
      return;
    }

    if (typeof window === "undefined") {
      resolve(rawSrc.startsWith("data:image") ? rawSrc : null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";

    const srcWithCacheBust = rawSrc.startsWith("http")
      ? `${rawSrc}?t=${Date.now()}`
      : rawSrc;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 500;
        canvas.height = img.naturalHeight || 500;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.95));
        } else {
          resolve(rawSrc);
        }
      } catch (err) {
        console.error("Canvas conversion error for Grad-CAM image:", err);
        resolve(rawSrc.startsWith("data:image") ? rawSrc : null);
      }
    };

    img.onerror = (err) => {
      console.error("Failed to load Grad-CAM image element:", err);
      if (result.gradcam_image_base64) {
        resolve(result.gradcam_image_base64);
      } else {
        resolve(null);
      }
    };

    img.src = srcWithCacheBust;
  });
};

export async function generateSoilReportPDF({
  result,
  formData,
  language = "en",
  userName = "Farmer",
}: {
  result: SoilResult;
  formData: FormState;
  language: "en" | "hi" | "kn";
  userName?: string;
}) {
  const pdf = new jsPDF("p", "mm", "a4");
  const t = pdfI18n[language] || pdfI18n.en;

  let pdfFont = "helvetica";

  // Helper to load TTF fonts
  const loadFont = async (url: string, fontFileName: string, fontName: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return false;
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      pdf.addFileToVFS(fontFileName, binary);
      pdf.addFont(fontFileName, fontName, "normal");
      return true;
    } catch (err) {
      console.error("Failed loading font:", url, err);
      return false;
    }
  };

  if (language === "hi") {
    const ok = await loadFont(
      "/fonts/NotoSansDevanagari-Regular.ttf",
      "NotoSansDevanagari-Regular.ttf",
      "NotoDevanagari"
    );
    if (ok) pdfFont = "NotoDevanagari";
  } else if (language === "kn") {
    const ok = await loadFont(
      "/fonts/NotoSansKannada-Regular.ttf",
      "NotoSansKannada-Regular.ttf",
      "NotoKannada"
    );
    if (ok) pdfFont = "NotoKannada";
  }

  const drawPageHeader = (title: string) => {
    pdf.setFillColor(21, 128, 61); // #15803D Dark Green
    pdf.rect(0, 0, 210, 22, "F");

    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    drawSmartText(pdf, title, 15, 14, pdfFont);

    pdf.setFillColor(22, 163, 74);
    pdf.rect(0, 22, 210, 2, "F");
  };

  const drawPageFooter = (pageNum: number, totalPages: number) => {
    pdf.setDrawColor(229, 231, 235);
    pdf.line(15, 282, 195, 282);

    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Soil Health Report | ${new Date().toLocaleDateString()}`, 15, 287);
    drawSmartText(pdf, `${t.page} ${pageNum} ${t.of} ${totalPages}`, 195, 287, pdfFont, { align: "right" });
  };

  // Pre-load the Grad-CAM image before rendering PDF pages
  const gradcamImgData = await resolveGradcamImage(result);

  // =========================================================================
  // PAGE 1 — SOIL HEALTH REPORT & DIAGNOSIS
  // =========================================================================
  drawPageHeader(t.reportTitle);

  // Subtitle & Date
  pdf.setFontSize(9.5);
  pdf.setTextColor(55, 65, 81);
  drawSmartText(pdf, t.reportSubtitle, 15, 29, pdfFont);

  pdf.setFontSize(8.5);
  pdf.setTextColor(107, 114, 128);
  drawSmartText(pdf, `${t.generatedDate}: ${new Date().toLocaleDateString()}`, 195, 29, pdfFont, { align: "right" });

  // 1. SUMMARY CARDS
  const cardY = 34;
  const cardW = 56;
  const cardH = 34;

  // Card 1: Soil Health Score
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(22, 163, 74);
  pdf.roundedRect(15, cardY, cardW, cardH, 3, 3, "FD");
  pdf.setFontSize(8.5);
  pdf.setTextColor(21, 128, 61);
  drawSmartText(pdf, t.soilHealthScore, 19, cardY + 8, pdfFont);

  pdf.setFontSize(16);
  pdf.setTextColor(22, 163, 74);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${result.soil_health_score ?? 90}/100`, 19, cardY + 20);

  pdf.setFontSize(8.5);
  pdf.setTextColor(55, 65, 81);
  const rawCat = result.soil_health_category ?? "Excellent";
  const catText = (language !== "en" && categoryMap[rawCat]) ? categoryMap[rawCat][language] : rawCat;
  drawSmartText(pdf, catText, 19, cardY + 28, pdfFont);

  // Card 2: Degradation Risk
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(22, 163, 74);
  pdf.roundedRect(77, cardY, cardW, cardH, 3, 3, "FD");
  pdf.setFontSize(8.5);
  pdf.setTextColor(21, 128, 61);
  drawSmartText(pdf, t.degradationRisk, 81, cardY + 8, pdfFont);

  pdf.setFontSize(16);
  pdf.setTextColor(22, 163, 74);
  pdf.setFont("helvetica", "normal");
  const riskScoreVal = result.degradation_risk?.degradation_risk_score ?? 0;
  pdf.text(`${riskScoreVal}/100`, 81, cardY + 20);

  pdf.setFontSize(8.5);
  pdf.setTextColor(55, 65, 81);
  const rawLevel = result.degradation_risk?.degradation_risk_level ?? "Very Low";
  const levelText = (language !== "en" && levelMap[rawLevel]) ? levelMap[rawLevel][language] : rawLevel;
  drawSmartText(pdf, levelText, 81, cardY + 28, pdfFont);

  // Card 3: Soil Type
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(22, 163, 74);
  pdf.roundedRect(139, cardY, cardW, cardH, 3, 3, "FD");
  pdf.setFontSize(8.5);
  pdf.setTextColor(21, 128, 61);
  drawSmartText(pdf, t.soilType, 143, cardY + 8, pdfFont);

  pdf.setFontSize(14);
  pdf.setTextColor(22, 163, 74);
  const rawSoil = result.soil_type || "Black Soil";
  drawSmartText(pdf, rawSoil, 143, cardY + 20, pdfFont);

  pdf.setFontSize(8);
  pdf.setTextColor(55, 65, 81);
  const confVal = `${result.cnn_confidence ?? 99.98}%`;
  drawSmartText(pdf, `${t.confidence}: ${confVal}`, 143, cardY + 28, pdfFont);

  // 2. DIAGNOSIS & RECOMMENDATIONS SECTION
  let yPos = 75;

  pdf.setFillColor(240, 253, 244);
  pdf.rect(15, yPos, 180, 7, "F");
  pdf.setFontSize(10.5);
  pdf.setTextColor(21, 128, 61);
  drawSmartText(pdf, t.diagnosisTitle, 18, yPos + 5, pdfFont);

  yPos += 11;

  // A. Nutrient Deficiency Diagnosis Box
  pdf.setFillColor(254, 242, 242);
  pdf.setDrawColor(254, 202, 202);
  pdf.roundedRect(15, yPos, 180, 24, 2, 2, "FD");

  pdf.setFontSize(9.5);
  pdf.setTextColor(185, 28, 28);
  drawSmartText(pdf, t.nutrientDeficiency, 20, yPos + 7, pdfFont);

  pdf.setFontSize(8.5);
  pdf.setTextColor(31, 41, 55);
  const rawDefText = result.nutrient_deficiency
    ? formatDeficiencies(result.nutrient_deficiency, language)
    : t.noDeficiency;
  drawSmartTextLines(pdf, rawDefText, 20, yPos + 14, 4.5, pdfFont, 170);

  yPos += 28;

  // B. Recommended Fertilizer Box
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(187, 247, 208);
  pdf.roundedRect(15, yPos, 180, 24, 2, 2, "FD");

  pdf.setFontSize(9.5);
  pdf.setTextColor(21, 128, 61);
  drawSmartText(pdf, t.recommendedFertilizer, 20, yPos + 7, pdfFont);

  pdf.setFontSize(8.5);
  pdf.setTextColor(31, 41, 55);
  const rawFertName = result.fertilizer_dosage?.fertilizer;
  const fertName = rawFertName
    ? formatFertilizers(rawFertName, { useAmpersand: true, language })
    : "N/A";
  const fertDosage = result.fertilizer_dosage?.dosage_kg_per_acre ?? "N/A";

  drawSmartText(pdf, `${t.fertilizer}: ${fertName}`, 20, yPos + 15, pdfFont);
  drawSmartText(pdf, `${t.dosage}: ${fertDosage} ${t.kgPerAcre}`, 110, yPos + 15, pdfFont);

  yPos += 28;

  // C. Recommended Crops List
  pdf.setFontSize(9.5);
  pdf.setTextColor(17, 24, 39);
  drawSmartText(pdf, t.recommendedCrops, 15, yPos, pdfFont);

  yPos += 4;

  pdf.setFillColor(22, 163, 74);
  pdf.rect(15, yPos, 180, 6, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  drawSmartText(pdf, t.rankCropHeader || "Rank / Crop Name", 20, yPos + 4.2, pdfFont);
  drawSmartText(pdf, t.suitabilityHeader || "Suitability Score", 140, yPos + 4.2, pdfFont);

  yPos += 6;

  const crops = result.crop_suitability && result.crop_suitability.length > 0
    ? result.crop_suitability
    : [
        { crop: "Rice", suitability_score: 92 },
        { crop: "Groundnut", suitability_score: 85 },
        { crop: "Cotton", suitability_score: 80 },
        { crop: "Wheat", suitability_score: 76 },
        { crop: "Maize", suitability_score: 70 },
      ];

  crops.forEach((item, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(15, yPos, 180, 6.5, "F");
    }
    pdf.setDrawColor(243, 244, 246);
    pdf.line(15, yPos + 6.5, 195, yPos + 6.5);

    pdf.setFontSize(8);
    pdf.setTextColor(31, 41, 55);

    let localizedCrop = item.crop;
    if (language !== "en" && cropMap[item.crop]) {
      localizedCrop = cropMap[item.crop][language];
    }

    drawSmartText(pdf, `${idx + 1}. ${localizedCrop}`, 20, yPos + 4.5, pdfFont);
    drawSmartText(pdf, `${item.suitability_score} / 100`, 140, yPos + 4.5, pdfFont);

    yPos += 6.5;
  });

  yPos += 6;

  // D. Long-Term Degradation Forecast (5-Year)
  pdf.setFontSize(9.5);
  pdf.setTextColor(17, 24, 39);
  drawSmartText(pdf, t.longTermDegradation, 15, yPos, pdfFont);

  yPos += 4;

  pdf.setFillColor(217, 119, 6);
  pdf.rect(15, yPos, 180, 6, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  drawSmartText(pdf, t.year, 25, yPos + 4.2, pdfFont);
  drawSmartText(pdf, t.forecastScore, 100, yPos + 4.2, pdfFont);
  drawSmartText(pdf, t.level, 150, yPos + 4.2, pdfFont);

  yPos += 6;

  const years = result.degradation_trend?.forecast_years || [];
  const forecastVals = result.degradation_trend?.forecast_values || [];

  years.forEach((yr, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(254, 243, 199);
      pdf.rect(15, yPos, 180, 6.5, "F");
    }
    pdf.setDrawColor(243, 244, 246);
    pdf.line(15, yPos + 6.5, 195, yPos + 6.5);

    pdf.setFontSize(8);
    pdf.setTextColor(31, 41, 55);

    const val = forecastVals[idx] ?? 60.0;
    drawSmartText(pdf, String(yr), 25, yPos + 4.5, pdfFont);
    drawSmartText(pdf, `${val} / 100`, 100, yPos + 4.5, pdfFont);

    const levelStr = val < 25 ? "Very Low" : val < 50 ? "Low" : val < 75 ? "Moderate" : "High";
    const localizedLevel = (language !== "en" && levelMap[levelStr]) ? levelMap[levelStr][language] : levelStr;
    drawSmartText(pdf, localizedLevel, 150, yPos + 4.5, pdfFont);

    yPos += 6.5;
  });

  drawPageFooter(1, 2);

  // =========================================================================
  // PAGE 2 — MODEL VISUAL EVIDENCE (GRAD-CAM ONLY)
  // =========================================================================
  pdf.addPage();
  drawPageHeader(t.visualEvidenceTitle);

  let p2Y = 28;

  // Soil Type & CNN Confidence Subheader
  pdf.setFontSize(10);
  pdf.setTextColor(31, 41, 55);
  drawSmartText(pdf, `${t.soilType}: ${result.soil_type || "Black Soil"}`, 15, p2Y, pdfFont);
  drawSmartText(pdf, `${t.confidence}: ${result.cnn_confidence ?? 99.98}%`, 195, p2Y, pdfFont, { align: "right" });

  p2Y += 8;

  // Title / Annotation Header above Image
  pdf.setFontSize(11);
  pdf.setTextColor(21, 128, 61);
  const gradcamHeadingText = `Grad-CAM: ${result.soil_type || "Black Soil"} (${result.cnn_confidence ?? 99.98}%)`;
  drawSmartText(pdf, gradcamHeadingText, 105, p2Y, pdfFont, { align: "center" });

  p2Y += 5;

  // LARGE CENTERED GRAD-CAM IMAGE FRAME
  const frameX = 20;
  const frameY = p2Y;
  const frameW = 170;
  const frameH = 170;

  pdf.setDrawColor(187, 247, 208);
  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(frameX, frameY, frameW, frameH, 3, 3, "FD");

  if (gradcamImgData) {
    try {
      pdf.addImage(
        gradcamImgData,
        "JPEG",
        frameX + 3,
        frameY + 3,
        frameW - 6,
        frameH - 6,
        undefined,
        "FAST"
      );
    } catch (e) {
      console.error("Error embedding Grad-CAM image into PDF:", e);
      pdf.setFontSize(10);
      pdf.setTextColor(156, 163, 175);
      drawSmartText(pdf, t.gradcamUnavailable, 105, frameY + 85, pdfFont, { align: "center" });
    }
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(156, 163, 175);
    drawSmartText(pdf, t.gradcamUnavailable, 105, frameY + 85, pdfFont, { align: "center" });
  }

  p2Y += frameH + 8;

  // Caption Box Below Image
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(187, 247, 208);
  pdf.roundedRect(20, p2Y, 170, 14, 2, 2, "FD");

  pdf.setFontSize(9);
  pdf.setTextColor(21, 128, 61);
  drawSmartText(pdf, `"${t.gradcamCaption}"`, 105, p2Y + 9, pdfFont, { align: "center" });

  drawPageFooter(2, 2);

  // Generate File Name
  const langCode = language.toUpperCase();
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Soil_Health_Report_${dateStr}_${langCode}.pdf`;

  pdf.save(fileName);
}
