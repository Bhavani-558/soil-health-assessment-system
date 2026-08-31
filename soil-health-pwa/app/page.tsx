"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import jsPDF from "jspdf";

type Language = "en" | "hi" | "kn";

type CropSuitability = {
  crop: string;
  suitability_score: number;
};

type FertilizerDosage = {
  fertilizer?: string;
  dosage_kg_per_acre?: number | string;
};

type DegradationRisk = {
  degradation_risk_score?: number | string;
  degradation_risk_level?: string;
};

type DegradationTrend = {
  forecast_years?: number[];
  forecast_values?: number[];
};

type SoilResult = {
  soil_type?: string;
  cnn_confidence?: number | string;
  soil_health_score?: number | string;
  soil_health_category?: string;
  nutrient_deficiency?: string;
  fertilizer_dosage?: FertilizerDosage;
  crop_suitability?: CropSuitability[];
  degradation_risk?: DegradationRisk;
  degradation_trend?: DegradationTrend;
};

type FormState = {
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
  fertilizer_used_last: string;
};

const translations = {
  en: {
    language: "Language",
    english: "English",
    hindi: "Hindi",
    kannada: "Kannada",

    title: "Soil Health",
    subtitle: "Farmer Soil Health Assistant",

    soilPhoto: "Soil Photo",
    takePhoto: "Capture Soil Photo",
    chooseImage: "Upload from Files",
    useCamera: "Use your phone camera or select an existing image",
    selectedImage: "Selected image",

    soilParameters: "Soil Parameters",

    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    soilPH: "Soil pH",
    moisture: "Soil Moisture",
    organicCarbon: "Organic Carbon",
    electricalConductivity: "Electrical Conductivity",
    temperature: "Temperature",
    humidity: "Humidity",
    rainfall: "Rainfall",
    soilType: "Soil Type",
    cropType: "Crop Type",
    cropGrowth: "Crop Growth",
    season: "Season",
    irrigation: "Irrigation",
    previousCrop: "Previous Crop",
    region: "Region",
    fertilizerUsedLast: "Fertilizer Used Last",

    analyze: "Analyze Soil",
    analyzing: "Analyzing Soil...",

    results: "Soil Health Results",
    cnnConfidence: "CNN Confidence",
    soilHealthScore: "Soil Health Score",
    nutrientDeficiency: "Nutrient Deficiency",
    recommendedFertilizer: "Recommended Fertilizer",
    dosage: "Dosage",
    recommendedCrops: "Recommended Crops",
    degradationRisk: "Degradation Risk",
    score: "Score",
    level: "Level",
    longTermDegradation: "Long-Term Degradation",

    generated: "Generated",
    soilInformation: "Soil Information",
    soilHealth: "Soil Health",
    category: "Category",
    fertilizer: "Fertilizer",

    downloadReport: "Download Soil Health Report",
    listenResult: "🔊 Listen to Soil Health Result",
    speaking: "Speaking...",

    selectImage: "Please capture or select a soil image.",
    predictionFailed: "Prediction failed.",
    unableToConnect: "Unable to connect to FastAPI.",
    noCropData: "No crop recommendations available.",
    noTrendData: "No long-term degradation forecast available.",
    unableToPlayVoice: "Unable to play voice.",
  },

  hi: {
    language: "भाषा",
    english: "अंग्रेज़ी",
    hindi: "हिन्दी",
    kannada: "कन्नड़",

    title: "मृदा स्वास्थ्य",
    subtitle: "किसान मृदा स्वास्थ्य सहायक",

    soilPhoto: "मिट्टी की फोटो",
    takePhoto: "मिट्टी की फोटो खींचें",
    chooseImage: "फाइल से फोटो चुनें",
    useCamera: "फोन कैमरे से फोटो लें या मौजूदा फोटो चुनें",
    selectedImage: "चयनित फोटो",

    soilParameters: "मृदा पैरामीटर",

    nitrogen: "नाइट्रोजन (N)",
    phosphorus: "फास्फोरस (P)",
    potassium: "पोटैशियम (K)",
    soilPH: "मृदा pH",
    moisture: "मृदा नमी",
    organicCarbon: "जैविक कार्बन",
    electricalConductivity: "विद्युत चालकता",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    rainfall: "वर्षा",
    soilType: "मिट्टी का प्रकार",
    cropType: "फसल का प्रकार",
    cropGrowth: "फसल वृद्धि",
    season: "मौसम",
    irrigation: "सिंचाई",
    previousCrop: "पिछली फसल",
    region: "क्षेत्र",
    fertilizerUsedLast: "पिछली बार उपयोग किया गया उर्वरक",

    analyze: "मिट्टी का विश्लेषण करें",
    analyzing: "मिट्टी का विश्लेषण हो रहा है...",

    results: "मृदा स्वास्थ्य परिणाम",
    cnnConfidence: "CNN विश्वसनीयता",
    soilHealthScore: "मृदा स्वास्थ्य स्कोर",
    nutrientDeficiency: "पोषक तत्वों की कमी",
    recommendedFertilizer: "अनुशंसित उर्वरक",
    dosage: "मात्रा",
    recommendedCrops: "अनुशंसित फसलें",
    degradationRisk: "मृदा क्षरण जोखिम",
    score: "स्कोर",
    level: "स्तर",
    longTermDegradation: "दीर्घकालिक मृदा क्षरण",

    generated: "बनाया गया",
    soilInformation: "मृदा जानकारी",
    soilHealth: "मृदा स्वास्थ्य",
    category: "श्रेणी",
    fertilizer: "उर्वरक",

    downloadReport: "मृदा स्वास्थ्य रिपोर्ट डाउनलोड करें",
    listenResult: "🔊 मृदा स्वास्थ्य परिणाम सुनें",
    speaking: "बोला जा रहा है...",

    selectImage: "कृपया मिट्टी की फोटो खींचें या चुनें।",
    predictionFailed: "विश्लेषण विफल रहा।",
    unableToConnect: "FastAPI से कनेक्ट नहीं हो सका।",
    noCropData: "फसल की सिफारिश उपलब्ध नहीं है।",
    noTrendData: "दीर्घकालिक मृदा क्षरण पूर्वानुमान उपलब्ध नहीं है।",
    unableToPlayVoice: "आवाज़ चलाने में असमर्थ।",
  },

  kn: {
    language: "ಭಾಷೆ",
    english: "ಇಂಗ್ಲಿಷ್",
    hindi: "ಹಿಂದಿ",
    kannada: "ಕನ್ನಡ",

    title: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
    subtitle: "ರೈತರ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸಹಾಯಕ",

    soilPhoto: "ಮಣ್ಣಿನ ಫೋಟೋ",
    takePhoto: "ಮಣ್ಣಿನ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",
    chooseImage: "ಫೈಲ್‌ನಿಂದ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ",
    useCamera: "ಫೋನ್ ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ ಅಥವಾ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ",
    selectedImage: "ಆಯ್ಕೆ ಮಾಡಿದ ಫೋಟೋ",

    soilParameters: "ಮಣ್ಣಿನ ನಿಯತಾಂಕಗಳು",

    nitrogen: "ನೈಟ್ರೋಜನ್ (N)",
    phosphorus: "ಫಾಸ್ಫರಸ್ (P)",
    potassium: "ಪೊಟ್ಯಾಸಿಯಮ್ (K)",
    soilPH: "ಮಣ್ಣಿನ pH",
    moisture: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    organicCarbon: "ಸಾವಯವ ಕಾರ್ಬನ್",
    electricalConductivity: "ವಿದ್ಯುತ್ ವಾಹಕತೆ",
    temperature: "ತಾಪಮಾನ",
    humidity: "ಆರ್ದ್ರತೆ",
    rainfall: "ಮಳೆ",
    soilType: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
    cropType: "ಬೆಳೆ ಪ್ರಕಾರ",
    cropGrowth: "ಬೆಳೆಯ ಬೆಳವಣಿಗೆ",
    season: "ಋತು",
    irrigation: "ನೀರಾವರಿ",
    previousCrop: "ಹಿಂದಿನ ಬೆಳೆ",
    region: "ಪ್ರದೇಶ",
    fertilizerUsedLast: "ಕೊನೆಯದಾಗಿ ಬಳಸಿದ ರಸಗೊಬ್ಬರ",

    analyze: "ಮಣ್ಣನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ಮಣ್ಣನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",

    results: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಫಲಿತಾಂಶಗಳು",
    cnnConfidence: "CNN ವಿಶ್ವಾಸ",
    soilHealthScore: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸ್ಕೋರ್",
    nutrientDeficiency: "ಪೋಷಕಾಂಶದ ಕೊರತೆ",
    recommendedFertilizer: "ಶಿಫಾರಸು ಮಾಡಿದ ರಸಗೊಬ್ಬರ",
    dosage: "ಪ್ರಮಾಣ",
    recommendedCrops: "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",
    degradationRisk: "ಮಣ್ಣಿನ ಕ್ಷೀಣತೆಯ ಅಪಾಯ",
    score: "ಸ್ಕೋರ್",
    level: "ಮಟ್ಟ",
    longTermDegradation: "ದೀರ್ಘಕಾಲೀನ ಮಣ್ಣಿನ ಕ್ಷೀಣತೆ",

    generated: "ರಚಿಸಲಾಗಿದೆ",
    soilInformation: "ಮಣ್ಣಿನ ಮಾಹಿತಿ",
    soilHealth: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
    category: "ವರ್ಗ",
    fertilizer: "ರಸಗೊಬ್ಬರ",

    downloadReport: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ವರದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    listenResult: "🔊 ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಫಲಿತಾಂಶವನ್ನು ಕೇಳಿ",
    speaking: "ಮಾತನಾಡಲಾಗುತ್ತಿದೆ...",

    selectImage: "ದಯವಿಟ್ಟು ಮಣ್ಣಿನ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ.",
    predictionFailed: "ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ.",
    unableToConnect: "FastAPI ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    noCropData: "ಬೆಳೆ ಶಿಫಾರಸುಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    noTrendData: "ದೀರ್ಘಕಾಲೀನ ಮಣ್ಣಿನ ಕ್ಷೀಣತೆಯ ಮುನ್ಸೂಚನೆ ಲಭ್ಯವಿಲ್ಲ.",
    unableToPlayVoice: "ಧ್ವನಿಯನ್ನು ಪ್ಲೇ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
  },
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilResult | null>(null);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    nitrogen: "40",
    phosphorus: "20",
    potassium: "30",
    ph: "6.5",
    moisture: "34",
    organic_c: "0.8",
    electrical_conductivity: "1.5",
    temperature: "25",
    humidity: "60",
    rainfall: "800",
    soil_type: "Black Soil",
    crop_type: "Rice",
    crop_growth: "Good",
    season: "Kharif",
    irrigation: "Irrigated",
    previous_crop: "Wheat",
    region: "Andhra Pradesh",
    fertilizer_used_last: "50",
  });

  const t = translations[language];

  const changeLanguage = (value: string) => {
    if (value === "en" || value === "hi" || value === "kn") {
      setLanguage(value);
      setError("");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError(t.selectImage);
      return;
    }

    setImage(selected);
    setError("");

    // Allows the user to select/capture the same file again later.
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setResult(null);

    if (!image) {
      setError(t.selectImage);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("image", image);

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
     });
      let data: {
        prediction?: SoilResult;
        detail?: string;
        } | null = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(t.unableToConnect);
      }

      if (!response.ok) {
        throw new Error(data?.detail || t.predictionFailed);
      }

      setResult(data?.prediction ?? null);
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(t.unableToConnect);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async() => {
    if (!result) return;

    const pdf = new jsPDF();

const loadFont = async (
  url: string,
  fileName: string,
  fontName: string
) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load font: ${fileName}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + chunkSize)
    );
  }

  pdf.addFileToVFS(fileName, binary);
  pdf.addFont(fileName, fontName, "normal");
};

if (language === "hi") {
  await loadFont(
    "/fonts/NotoSansDevanagari-Regular.ttf",
    "NotoSansDevanagari-Regular.ttf",
    "NotoDevanagari"
  );

  pdf.setFont("NotoDevanagari", "normal");
} else if (language === "kn") {
  await loadFont(
    "/fonts/NotoSansKannada-Regular.ttf",
    "NotoSansKannada-Regular.ttf",
    "NotoKannada"
  );

  pdf.setFont("NotoKannada", "normal");
} else {
  pdf.setFont("helvetica", "normal");
}

    let y = 20;

    const addPageIfNeeded = (height = 10) => {
      if (y + height > 275) {
        pdf.addPage();
        y = 20;
      }
    };

    const pdfFont =
  language === "hi"
    ? "NotoDevanagari"
    : language === "kn"
      ? "NotoKannada"
      : "helvetica";

const addHeading = (text: string) => {
  addPageIfNeeded(15);
  pdf.setFont(pdfFont, "normal");
  pdf.setFontSize(13);
  pdf.text(text, 20, y);
  y += 9;
};

const addText = (text: string) => {
  addPageIfNeeded(8);
  pdf.setFont(pdfFont, "normal");
  pdf.setFontSize(10);
  pdf.text(text, 20, y);
  y += 7;
};

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(20);
    pdf.text("SOIL HEALTH REPORT", 105, y, { align: "center" });

    y += 12;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
      `${t.generated}: ${new Date().toLocaleDateString()}`,
      20,
      y
    );

    y += 15;

    addHeading(`1. ${t.soilInformation}`);
    addText(`${t.soilType}: ${result.soil_type ?? "N/A"}`);
    addText(`${t.cnnConfidence}: ${result.cnn_confidence ?? "N/A"}%`);

    y += 5;

    addHeading(`2. ${t.soilHealth}`);
    addText(
      `${t.soilHealthScore}: ${result.soil_health_score ?? "N/A"}/100`
    );
    addText(`${t.category}: ${result.soil_health_category ?? "N/A"}`);

    y += 5;

    addHeading(`3. ${t.nutrientDeficiency}`);
    addText(result.nutrient_deficiency ?? "N/A");

    y += 5;

    addHeading(`4. ${t.recommendedFertilizer}`);
    addText(
      `${t.fertilizer}: ${
        result.fertilizer_dosage?.fertilizer ?? "N/A"
      }`
    );
    addText(
      `${t.dosage}: ${
        result.fertilizer_dosage?.dosage_kg_per_acre ?? "N/A"
      } kg/acre`
    );

    y += 5;

    addHeading(`5. ${t.recommendedCrops}`);

    if (
      result.crop_suitability &&
      result.crop_suitability.length > 0
    ) {
      result.crop_suitability.forEach((crop, index) => {
        addText(
          `${index + 1}. ${crop.crop} - ${crop.suitability_score}/100`
        );
      });
    } else {
      addText(t.noCropData);
    }

    y += 5;

    addHeading(`6. ${t.degradationRisk}`);
    addText(
      `${t.score}: ${
        result.degradation_risk?.degradation_risk_score ?? "N/A"
      }/100`
    );
    addText(
      `${t.level}: ${
        result.degradation_risk?.degradation_risk_level ?? "N/A"
      }`
    );

    y += 5;

    addHeading(`7. ${t.longTermDegradation}`);

    const years = result.degradation_trend?.forecast_years ?? [];
    const values = result.degradation_trend?.forecast_values ?? [];

    if (years.length > 0) {
      years.forEach((year, index) => {
        addText(`${year}: ${values[index] ?? "N/A"}/100`);
      });
    } else {
      addText(t.noTrendData);
    }

    pdf.save("soil-health-report.pdf");
  };

  const speakResult = async () => {
    if (!result) return;

    try {
      setSpeaking(true);

      const text = `
        ${t.soilHealthScore}: ${
          result.soil_health_score ?? "not available"
        } out of 100.

        ${t.category}: ${
          result.soil_health_category ?? "not available"
        }.

        ${t.nutrientDeficiency}: ${
          result.nutrient_deficiency ?? "not available"
        }.

        ${t.recommendedFertilizer}: ${
          result.fertilizer_dosage?.fertilizer ?? "not available"
        }.

        ${t.dosage}: ${
          result.fertilizer_dosage?.dosage_kg_per_acre ?? "not available"
        } kilograms per acre.
      `;

      const response = await fetch(
        "http://10.229.174.90:8000/api/voice",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            language:
              language === "hi"
                ? "hi-IN"
                : language === "kn"
                  ? "kn-IN"
                  : "en-IN",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Voice API failed");
      }

      const data = await response.json();

      if (!data.success || !data.audio) {
        throw new Error("No audio received");
      }

      const audioBytes = Uint8Array.from(
        atob(data.audio),
        (c) => c.charCodeAt(0)
      );

      const blob = new Blob([audioBytes], {
        type: "audio/wav",
      });

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Voice error:", error);
      setSpeaking(false);
      alert(t.unableToPlayVoice);
    }
  };

  return (
    <main className="min-h-screen bg-green-50 px-4 py-6">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* ======================================================
            LANGUAGE SELECTOR
        ====================================================== */}

        <div className="mb-6 flex items-center justify-end gap-3">
  <span className="text-base font-semibold text-gray-700">
    🌐 {t.language}:
  </span>

  <div className="relative">
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      aria-label={t.language}
      className="h-11 min-w-[145px] appearance-none rounded-xl border-2 border-green-700 bg-white px-4 pr-10 text-base font-semibold text-gray-800 shadow-sm outline-none transition focus:border-green-800 focus:ring-2 focus:ring-green-200"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="kn">ಕನ್ನಡ</option>
    </select>

    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-700">
      ▾
    </span>
  </div>
</div>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 text-center">
          <div className="text-5xl">🌱</div>

          <h1 className="mt-2 text-3xl font-bold text-green-800">
            {t.title}
          </h1>

          <p className="mt-1 text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* ======================================================
            FORM
        ====================================================== */}

        <form onSubmit={handleSubmit}>

          {/* ====================================================
              IMAGE UPLOAD / CAMERA
          ==================================================== */}

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              📷 {t.soilPhoto}
            </h2>

            <div className="rounded-xl border-2 border-dashed border-green-400 bg-green-50 p-6 text-center">

              

              <p className="mt-2 font-semibold text-green-700">
                {t.takePhoto}
              </p>

              <p className="mt-1 block text-sm text-gray-500">
                {t.useCamera}
              </p>

              {/* TWO SEPARATE OPTIONS */}

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                {/* CAMERA */}

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-4 font-bold text-white shadow-md transition hover:bg-green-800 active:scale-[0.98]"
                >
                  <span className="text-2xl">📷</span>
                  <span>{t.takePhoto}</span>
                </button>

                {/* FILE / GALLERY */}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-green-700 bg-white px-5 py-4 font-bold text-green-700 shadow-md transition hover:bg-green-50 active:scale-[0.98]"
                >
                  <span className="text-2xl">📁</span>
                  <span>{t.chooseImage}</span>
                </button>

              </div>

              {/* CAMERA INPUT
                  On supported mobile browsers this opens
                  the device camera. */}

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
              />

              {/* FILE INPUT
                  Opens Files / Gallery without forcing camera. */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                className="hidden"
                onChange={handleImageChange}
              />

            </div>

            {/* SELECTED IMAGE PREVIEW */}

            {image && (
              <div className="mt-4 overflow-hidden rounded-xl border border-green-200 bg-green-50">

                <div className="p-3 text-sm text-green-800">
                  <span className="font-semibold">
                    ✅ {t.selectedImage}:
                  </span>{" "}
                  {image.name}
                </div>

                <div className="bg-white p-3">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={t.selectedImage}
                    className="mx-auto max-h-64 w-auto max-w-full rounded-lg object-contain"
                  />
                </div>

              </div>
            )}
          </div>

          {/* ====================================================
              SOIL PARAMETERS
          ==================================================== */}

          <div className="mt-5 rounded-2xl bg-white p-5 shadow-md">

            <h2 className="mb-4 text-xl font-extrabold text-gray-900">

              🧪 {t.soilParameters}
            </h2>

            <div className="space-y-4">

              <Input
                label={t.nitrogen}
                name="nitrogen"
                value={form.nitrogen}
                onChange={handleChange}
              />

              <Input
                label={t.phosphorus}
                name="phosphorus"
                value={form.phosphorus}
                onChange={handleChange}
              />

              <Input
                label={t.potassium}
                name="potassium"
                value={form.potassium}
                onChange={handleChange}
              />

              <Input
                label={t.soilPH}
                name="ph"
                value={form.ph}
                onChange={handleChange}
              />

              <Input
                label={t.moisture}
                name="moisture"
                value={form.moisture}
                onChange={handleChange}
              />

              <Input
                label={t.organicCarbon}
                name="organic_c"
                value={form.organic_c}
                onChange={handleChange}
              />

              <Input
                label={t.electricalConductivity}
                name="electrical_conductivity"
                value={form.electrical_conductivity}
                onChange={handleChange}
              />

              <Input
                label={t.temperature}
                name="temperature"
                value={form.temperature}
                onChange={handleChange}
              />

              <Input
                label={t.humidity}
                name="humidity"
                value={form.humidity}
                onChange={handleChange}
              />

              <Input
                label={t.rainfall}
                name="rainfall"
                value={form.rainfall}
                onChange={handleChange}
              />

              <Input
                label={t.soilType}
                name="soil_type"
                value={form.soil_type}
                onChange={handleChange}
                type="text"
              />

              <Input
                label={t.cropType}
                name="crop_type"
                value={form.crop_type}
                onChange={handleChange}
                type="text"
              />

              <Input
                label={t.cropGrowth}
                name="crop_growth"
                value={form.crop_growth}
                onChange={handleChange}
                type="text"
              />

              <Input
                label={t.season}
                name="season"
                value={form.season}
                onChange={handleChange}
                type="text"
              />

              <Input
                label={t.irrigation}
                name="irrigation"
                value={form.irrigation}
                onChange={handleChange}
                type="text"
              />

              <Input
                label={t.previousCrop}
                name="previous_crop"
                value={form.previous_crop}
                onChange={handleChange}
                type="text"
              />

              <Input
                label={t.region}
                name="region"
                value={form.region}
                onChange={handleChange}
                type="text"
              />

              <Input
                label={t.fertilizerUsedLast}
                name="fertilizer_used_last"
                value={form.fertilizer_used_last}
                onChange={handleChange}
              />

            </div>
          </div>

          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (
            <div className="mt-4 rounded-xl bg-red-100 p-4 text-red-700">
              ❌ {error}
            </div>
          )}

          {/* ====================================================
              ANALYZE
          ==================================================== */}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-green-700 py-4 text-lg font-bold text-white shadow-md transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? `⏳ ${t.analyzing}`
              : `🔍 ${t.analyze}`}
          </button>

        </form>

        {/* ======================================================
            RESULTS
        ====================================================== */}

        {result && (
          <div className="mt-6 rounded-2xl bg-white p-5 text-gray-900 shadow-md">
            <h2 className="mb-5 text-2xl font-bold text-green-800">
              🌱 {t.results}
            </h2>

            {/* SOIL TYPE */}

            <div className="rounded-xl bg-green-100 p-4 text-gray-900">
              <p className="text-gray-700">
                {t.soilType}
              </p>

              <p className="text-xl font-bold text-green-800">
                {result.soil_type ?? "N/A"}
              </p>

              <p className="mt-1 text-sm">
                {t.cnnConfidence}:{" "}
                {result.cnn_confidence ?? "N/A"}%
              </p>
            </div>

            {/* SOIL HEALTH */}

            <div className="mt-4 rounded-xl bg-blue-100 p-4 text-gray-900">
              <p className="text-gray-700">
                {t.soilHealthScore}
              </p>

              <p className="text-3xl font-bold text-blue-800">
                {result.soil_health_score ?? "N/A"}/100
              </p>

              <p className="font-semibold">
                {result.soil_health_category ?? "N/A"}
              </p>
            </div>

            {/* NUTRIENT DEFICIENCY */}

            <div className="mt-4 rounded-xl bg-yellow-100 p-4 text-gray-900">
              <p className="font-bold">
                {t.nutrientDeficiency}
              </p>

              <p className="mt-2">
                {result.nutrient_deficiency ?? "N/A"}
              </p>
            </div>

            {/* FERTILIZER */}

            <div className="mt-4 rounded-xl bg-purple-100 p-4 text-gray-900">
              <p className="font-bold">
                {t.recommendedFertilizer}
              </p>

              <p className="mt-2 text-lg font-semibold">
                {result.fertilizer_dosage?.fertilizer ?? "N/A"}
              </p>

              <p>
                {t.dosage}:{" "}
                {result.fertilizer_dosage?.dosage_kg_per_acre ?? "N/A"}{" "}
                kg/acre
              </p>
            </div>

            {/* CROPS */}

            <div className="mt-4 rounded-xl bg-green-100 p-4">
              <p className="font-bold">
                🌾 {t.recommendedCrops}
              </p>

              <div className="mt-2 space-y-2">
                {result.crop_suitability &&
                result.crop_suitability.length > 0 ? (
                  result.crop_suitability.map((crop, index) => (
                    <div
                      key={`${crop.crop}-${index}`}
                      className="flex justify-between rounded-lg bg-white p-3"
                    >
                      <span>
                        {index + 1}. {crop.crop}
                      </span>

                      <span className="font-semibold">
                        {crop.suitability_score}/100
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-900">
                    {t.noCropData}
                  </p>
                )}
              </div>
            </div>

            {/* DEGRADATION RISK */}

            <div className="mt-4 rounded-xl bg-orange-100 p-4 text-gray-900">
              <p className="font-bold">
                ⚠️ {t.degradationRisk}
              </p>

              <p className="mt-2">
                {t.score}:{" "}
                {result.degradation_risk?.degradation_risk_score ?? "N/A"}
                /100
              </p>

              <p>
                {t.level}:{" "}
                {result.degradation_risk?.degradation_risk_level ?? "N/A"}
              </p>
            </div>

            {/* LONG TERM DEGRADATION */}

            <div className="mt-4 rounded-xl bg-gray-100 p-4">
              <p className="font-bold">
                📈 {t.longTermDegradation}
              </p>

              {result.degradation_trend?.forecast_years &&
              result.degradation_trend.forecast_years.length > 0 ? (
                result.degradation_trend.forecast_years.map(
                  (year, index) => (
                    <p key={year}>
                      {year}:{" "}
                      {result.degradation_trend?.forecast_values?.[index] ??
                        "N/A"}
                      /100
                    </p>
                  )
                )
              ) : (
                <p className="mt-2 text-sm text-gray-900">
                  {t.noTrendData}
                </p>
              )}
            </div>

            {/* VOICE */}

            <button
              type="button"
              onClick={speakResult}
              disabled={speaking}
              className="mt-6 w-full rounded-xl border-2 border-green-700 bg-white py-4 text-lg font-bold text-green-800 shadow-md hover:bg-green-50 disabled:bg-gray-200 disabled:text-gray-900"
            >
              {speaking
                ? `⏳ ${t.speaking}`
                : t.listenResult}
            </button>

            {/* DOWNLOAD */}

            <button
              type="button"
              onClick={downloadPDF}
              className="mt-4 w-full rounded-xl border-2 border-black bg-green-700 py-4 text-lg font-bold text-white shadow-md hover:bg-green-800"
            >
              📄 {t.downloadReport}
            </button>

          </div>
        )}

      </div>
    </main>
  );
}

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

function Input({
  label,
  name,
  value,
  onChange,
  type = "number",
}: InputProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-semibold text-gray-900"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-black outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
      />
    </div>
  );
}
