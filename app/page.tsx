"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Copy, 
  Edit3, 
  RefreshCw, 
  Layers, 
  Check, 
  HelpCircle, 
  Save, 
  FolderOpen, 
  AlertCircle,
  Clapperboard,
  Tv,
  Square,
  Sparkle,
  Sliders,
  Play,
  Volume2,
  FileText,
  Search,
  MessageSquareCode
} from "lucide-react";

// Types
interface Scene {
  sceneNumber: number;
  voiceover: string;
  textOverlay: string;
  storyboardPrompt: string;
  animationPrompt: string;
  sfxCue: string;
}

interface ScriptResponse {
  productAnalysis: string;
  selectedHookExplanation: string;
  visualAtmosphere: string;
  scenes: Scene[];
  unifiedStoryboardCollagePrompt?: string;
}

interface SavedProject {
  id: string;
  timestamp: string;
  productName: string;
  productType: string;
  usp: string;
  targetAudience: string;
  painPoint: string;
  cta: string;
  customMood: string;
  selectedHookId: string;
  aspectRatio: string;
  sceneCount: number;
  productImagePreview: string | null;
  scriptData: ScriptResponse;
  inputMode?: "product" | "reels_idea";
  reelsIdea?: string;
}

// Impure helper functions declared outside the React component to comply with React purity rules
const generateUniqueId = (): string => {
  return Date.now().toString();
};

const getArabicTimestamp = (): string => {
  return new Date().toLocaleString("ar-EG");
};

export default function ScriptCreatorPage() {
  // Input States
  const [productName, setProductName] = useState("بطاطس كرانش فليم");
  const [productType, setProductType] = useState("شيبس بطاطس طبيعي بنكهة الفلفل والليمون الحار");
  const [usp, setUsp] = useState("قرمشة مجنونة تهز الحواس مع ذرات الملح والبهارات المتطايرة");
  const [targetAudience, setTargetAudience] = useState("محبي المغامرة والنكهات الحارة والتحديات من فئة الشباب");
  const [painPoint, setPainPoint] = useState("البحث عن سناك مشبع بالنكهة الحقيقية دون أي تراجع في القرمشة");
  const [cta, setCta] = useState("افتح كيس التحدي الآن واشعر بالانفجار!");
  const [customMood, setCustomMood] = useState("");
  const [inputMode, setInputMode] = useState<"product" | "reels_idea">("product");
  const [reelsIdea, setReelsIdea] = useState("");

  const handleInputModeChange = (mode: "product" | "reels_idea") => {
    setInputMode(mode);
    if (mode === "reels_idea") {
      // Clear potato chip defaults or template remnants if present so they do not pollute custom idea generation
      if (
        productName === "بطاطس كرانش فليم" ||
        productName === "مكيف ايفولي انفيرتر" ||
        productName === "جلاية ايفولي" ||
        productName === "مصفف شعر ايفولي"
      ) {
        setProductName("");
      }
      if (
        cta === "افتح كيس التحدي الآن واشعر بالانفجار!" ||
        cta === "وفر 60% من فاتورتك واطلب مكيف ايفولي انفيرتر الآن!" ||
        cta === "اشتري جلاية ايفولي ووفر وقتك ومجهودك!" ||
        cta === "تألقي كالمحترفين بلمسة واحدة من أجهزة ايفولي!"
      ) {
        setCta("");
      }
      if (
        productType === "شيبس بطاطس طبيعي بنكهة الفلفل والليمون الحار" ||
        productType === "أجهزة تكييف وتبريد موفرة للطاقة" ||
        productType === "غسالة صحون ذكية وموفرة للمياه" ||
        productType === "مصفف ومجفف شعر ذكي بحماية حرارية"
      ) {
        setProductType("");
      }
      if (usp === "قرمشة مجنونة تهز الحواس مع ذرات الملح والبهارات المتطايرة") {
        setUsp("");
      }
      if (targetAudience === "محبي المغامرة والنكهات الحارة والتحديات من فئة الشباب") {
        setTargetAudience("");
      }
      if (painPoint === "البحث عن سناك مشبع بالنكهة الحقيقية دون أي تراجع في القرمشة") {
        setPainPoint("");
      }
    } else {
      // Restore the beautiful potato defaults if both are empty when switching back
      if (!productName && !reelsIdea) {
        setProductName("بطاطس كرانش فليم");
        setProductType("شيبس بطاطس طبيعي بنكهة الفلفل والليمون الحار");
        setUsp("قرمشة مجنونة تهز الحواس مع ذرات الملح والبهارات المتطايرة");
        setTargetAudience("محبي المغامرة والنكهات الحارة والتحديات من فئة الشباب");
        setPainPoint("البحث عن سناك مشبع بالنكهة الحقيقية دون أي تراجع في القرمشة");
        setCta("افتح كيس التحدي الآن واشعر بالانفجار!");
      }
    }
  };

  const [selectedHookId, setSelectedHookId] = useState("problem_solution");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [sceneCount, setSceneCount] = useState(5);
  
  // Vibe preset states
  const [selectedVibePreset, setSelectedVibePreset] = useState("food_crunch");

  // Image Upload States
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App Control States
  const [loading, setLoading] = useState(false);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<ScriptResponse | null>(null);
  
  const isFormValid = inputMode === "product"
    ? (!!productName && !!productType && !!usp && !!cta)
    : (!!reelsIdea);
  const [showSavedList, setShowSavedList] = useState(false);
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

  // Mini edit states (for inline adjustments)
  const [activeTab, setActiveTab] = useState<"onboarding" | "vibe" | "hook">("onboarding");
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);
  const [editedScenes, setEditedScenes] = useState<Scene[]>([]);
  const [editedAnalysis, setEditedAnalysis] = useState("");
  const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);
  
  // Single Scene Regeneration Inputs
  const [sceneInstructions, setSceneInstructions] = useState<{ [key: number]: string }>({});
  const [regeneratingSceneIndex, setRegeneratingSceneIndex] = useState<number | null>(null);

  // Global Modification Input
  const [globalInstruction, setGlobalInstruction] = useState("");
  const [globalRegenerating, setGlobalRegenerating] = useState(false);

  const getDynamicCollagePrompt = (): string => {
    if (!generatedScript || !editedScenes.length) return "";
    
    // If the generated script has a direct collage prompt, prioritize it but dynamically update ratio and scenes count for absolute precision
    const basePrompt = generatedScript.unifiedStoryboardCollagePrompt || "";
    if (basePrompt && basePrompt.length > 50) {
      return basePrompt;
    }

    const ratioArg = aspectRatio === "9:16" ? "9:16" : aspectRatio === "16:9" ? "16:9" : "1:1";
    
    const framesText = editedScenes.map((scene, index) => {
      const cleanPrompt = scene.storyboardPrompt
        .replace(/--ar\s+\d+:\d+/g, "")
        .trim();
      return `Frame ${index + 1} (${index === 0 ? "Hero Hook Scene" : index === editedScenes.length - 1 ? "CTA Climax" : `Narrative Scene #${index + 1}`}): ${cleanPrompt}`;
    }).join("\n\n");

    return `Clean storyboard collage layout grid containing exactly ${editedScenes.length} equal frames. Each individual frame has a strict aspect ratio of --ar ${ratioArg}, arranged harmoniously in a professional, seamless editorial collage mockup with an overall canvas ratio of --ar 4:5.

VISUAL CONSISTENCY ANCHOR (CRITICAL):
Use the uploaded reference product packaging image as the absolute primary visual anchor. Maintain the exact same product, packaging design, branding/logo placement, colors, materials, ratios, and aesthetic across all frames, exactly as shown in the reference image. The product packaging must be perfectly recognizable and identical in every scene.

EDITORIAL STORYBOARD FRAMES:
${framesText}

CAMERA, LIGHTING, AND AESTHETIC STYLE:
Stunning high-end professional studio commercial photography with real camera optics. Sophisticated three-point cinematic lighting, soft key light bouncing off the product, volumetric dust particles, dramatic rim lighting, sharp micro textures, and realistic glass/package reflections. Extremely shallow depth of field (creamy bokeh in backgrounds). The lighting direction, color palette (vibe: ${generatedScript.visualAtmosphere || "matching the reference"}), atmospheric mood, and design-led curation must remain completely uniform, consistent, and cohesive across all frames as a single high-impact branding campaign.

OUTPUT SPECIFICATIONS:
Clean, professional editorial collage. STRICTLY no margins, no frames, no borders, no labels, no scene numbers, no captions, no text overlays, and no watermarks. Fully seamless grid. --ar 4:5`;
  };

  // Loading Screen Tips
  const loadingTips = [
    "جاري فحص زوايا ومكونات صورة المنتج وتحليل ألوان الهوية البصرية...",
    "جاري صياغة خطاف تسويقي مميز لأول 3 ثوانٍ يمنع المشاهد من تجاوز الفيديو...",
    "جاري تصميم أوامر الستوري بورد البصرية الملائمة لـ Midjourney ومقاس الفيديو المحدد...",
    "جاري دمج حركات الكاميرا الاحترافية وأكواد تحريك جزيئات المواد والمنتج لـ Runway و Luma...",
    "جاري كتابة النصوص الصوتية والتوجيهات السمعية المناسبة لجو المنتج وعلامته التجارية..."
  ];

  // Load saved projects and default configurations directly in lazy state initializer to prevent cascading render
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ai_storyboard_projects");
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Failed to load saved projects", e);
      }
    }
    return [];
  });



  // Rotate loading tips when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading, loadingTips.length]);

  const hooksList = [
    { 
      id: "problem_solution", 
      name: "خطاف المشكلة والحل (Problem-Solution)", 
      emoji: "🛡️",
      example: "هل تعبت من المقرمشات العادية التي تفقد نكهتها بسرعة؟ إليك الحل الفوري السري!",
      description: "يبدأ بذكر مشكلة حقيقية مزعجة تواجه العميل المستهدف مباشرة، ثم يطرح المنتج كبطل خارق ينقذ الموقف بلمح البصر." 
    },
    { 
      id: "curiosity_gap", 
      name: "خطاف فجوة الفضول (Curiosity Gap)", 
      emoji: "🔮",
      example: "هناك سر خفي لا يخبرك به أحد حول هذا المكون السحري، وهذا ما يجعله خارقاً...",
      description: "يخلق فراغًا وفضولاً ذهنياً وتساؤلاً عميقاً لا يمكن حله إلا بمتابعة أحداث ومقاطع الفيديو حتى اللحظة الأخيرة." 
    },
    { 
      id: "bold_statement", 
      name: "خطاف العبارة الصادمة والجريئة", 
      emoji: "💥",
      example: "توقف عن إضاعة نقودك على منتجات البشرة التقليدية فورا! إليك الحقيقة الصادمة...",
      description: "يبدأ بقطع الأنماط المألوفة للمشاهد بعبارة قوية ومثيرة للجدل غير تقليدية تلفت الوعي والانتباه فوراً." 
    },
    { 
      id: "day_in_life", 
      name: "خطاف أسلوب الحياة والجماليات", 
      emoji: "✨",
      example: "هكذا تبدأ لحظات صباحي الفاخرة بكل هدوء ونقاء، برفقة هذا الرفيق اليومي البسيط...",
      description: "يركز على النعومة البصرية، التفاصيل الهادئة المريحة للعين، والاندماج السلس للمنتج في يوم مستقر ومميز." 
    },
    { 
      id: "inside_secrets", 
      name: "خطاف كواليس التصنيع والمواد الخام", 
      emoji: "🔬",
      example: "شاهد كيف نقوم بطحن وتغليف كل حبة بعناية فائقة وتطاير البهارات في مختبراتنا...",
      description: "يركز على تقديم جودة تصنيع فائقة ومستوى جودة استثنائي عبر لقطات ماكرو مذهلة وسريعة للمكونات وتطايرها." 
    },
    { 
      id: "social_proof", 
      name: "خطاف الإثبات الاجتماعي والمقارنة", 
      emoji: "👥",
      example: "الجميع يتحدث عن هذا التغيير الاستثنائي! لماذا تخلص أكثر من 50 ألف شخص من...",
      description: "يستعرض ردود أفعال الجمهور وشهرته السريعة، مع وضع مقارنة ذكية بين الماضي والمستقبل بذكاء شديد." 
    }
  ];

  const vibePresets = [
    {
      id: "food_crunch",
      name: "🥔 مقرمشات وأطعمة متطايرة",
      desc: "تركيز فائق السرعة على جزيئات الطعام، نكهة البهارات الطائرة بالهواء، قرمشة عالية وصوت عميق مع إضاءة دافئة قوية.",
      prompt: "Dynamic energetic food commercial atmosphere with raw materials and ingredients flying in zero-gravity, flavor dust, intense sound cues, extreme close-up macro of texture and crunchiness, warm dramatic volumetric backlighting."
    },
    {
      id: "organic_cosmetics",
      name: "🌿 تجميل وبشرة ناعمة",
      desc: "طبيعي، ناعم وهادئ، رذاذ قطرات الماء، تطاير نباتات عشبية بشكل بطيء للغاية مع إضاءة استوديو دافئة وظلال خفيفة ناعمة.",
      prompt: "Elegant clean botanical cosmetic atmosphere with soft dewy focus, water ripples, organic botanical ingredients floating slowly, studio daylight, cinematic smooth slow camera panning, high-end commercial quality."
    },
    {
      id: "cyber_electronics",
      name: "⚡ إلكترونيات تيك نيون",
      desc: "تكنولوجي مستقبلي، خلفيات غامقة مطفية مع خطوط نيون زرقاء وبنفسجية ليزرية، انعكاسات زجاجية راقية جداً وحركة كاميرا دورانية سريعة.",
      prompt: "Futuristic technology display, dark matte background with glowing cyan and neon violet laser accents, sleek glass reflections, extreme close-up rotational tracking shot of electronic product, luxury high-tech lighting."
    },
    {
      id: "cinematic_luxury",
      name: "🎬 استوديو سينمائي فخم",
      desc: "أجواء سينمائية غامضة ومثيرة للاهتمام، تسليط ضوء مخروطي حاد (Spotlight) مع غبار ذهبي يتطاير ببطء وإضاءة متباينة للغاية.",
      prompt: "Cinematic commercial studio look, luxury high-contrast lighting, clean deep black background, dynamic golden dust particles floating gracefully, focused dramatic spotlight, slow-motion push-in camera tracking."
    },
    {
      id: "custom",
      name: "✍️ مزاج مخصص من اختيارك",
      desc: "قم بوصف الأجواء البصرية التي تريدها وسيقوم الذكاء الاصطناعي ببناء الستوري بورد بالكامل بناءً على وصفك الدقيق.",
      prompt: ""
    }
  ];

  // Handle Drag & Drop for Image Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("الرجاء رفع ملف صورة صالح فقط (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProductImage(event.target.result as string);
        setImageMimeType(file.type);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProductImage(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper function to handle pre-populating fields depending on vibe preset
  const selectVibeAndFillDefault = (vibeId: string) => {
    setSelectedVibePreset(vibeId);
    setError(null);
    
    // Add helpful examples to make onboarding easier
    if (vibeId === "food_crunch") {
      setProductName("بطاطس كرانش فليم");
      setProductType("شيبس بطاطس طبيعي بنكهة الفلفل والليمون الحار");
      setUsp("قرمشة مجنونة تهز الحواس مع ذرات الملح والبهارات المتطايرة");
      setTargetAudience("محبي المغامرة والنكهات الحارة والتحديات من فئة الشباب");
      setPainPoint("البحث عن سناك مشبع بالنكهة الحقيقية دون أي تراجع في القرمشة");
      setCta("افتح كيس التحدي الآن واشعر بالانفجار!");
      setCustomMood("");
    } else if (vibeId === "organic_cosmetics") {
      setProductName("سيروم إكسير الورد");
      setProductType("سيروم مرطب ومنشط للبشرة بمكونات طبيعية");
      setUsp("مستخلص الألوفيرا النقي مع بتلات الورد الطبيعية المتفتحة");
      setTargetAudience("السيدات الباحثات عن نضارة طبيعية وخالية من المواد الكيميائية الضارة");
      setPainPoint("جفاف البشرة وظهور علامات الإرهاق والبهتان في منتصف النهار");
      setCta("أعيدي الحياة لبشرتك واطلبي قطرتك السحرية اليوم!");
      setCustomMood("");
    } else if (vibeId === "cyber_electronics") {
      setProductName("سماعات ساوند كرافت برو");
      setProductType("سماعات رأس لاسلكية عازلة للضوضاء");
      setUsp("مستقبل هندسة الصوت مع خاصية عزل صوتي ذكي تبلغ نسبة 99%");
      setTargetAudience("محبي الموسيقى عالية النقاء، الجيمرز، والموظفين في بيئات العمل المزدحمة");
      setPainPoint("التشتت المستمر بسبب الضوضاء المحيطة وضعف بطارية السماعات العادية");
      setCta("انعزل عن العالم الخارجي واشتري سماعتك بخصم 25%!");
      setCustomMood("");
    } else if (vibeId === "cinematic_luxury") {
      setProductName("عطر كينغدوم الأسود");
      setProductType("عطر رجالي فاخر بلمسات العود والجلود");
      setUsp("ثبات يدوم 48 ساعة متواصلة مع حضور ملكي بلمسة عصرية");
      setTargetAudience("الرجال الباحثين عن الفخامة والأناقة في المناسبات الرسمية والخاصة");
      setPainPoint("زوال رائحة العطور السريع والاضطرار لحمل زجاجة العطر طوال الوقت");
      setCta("امتلك حضورك الطاغي الآن واطلب نسختك الفاخرة!");
      setCustomMood("");
    } else {
      // Custom
      setProductName("");
      setProductType("");
      setUsp("");
      setTargetAudience("");
      setPainPoint("");
      setCta("");
      setCustomMood("أجواء صيفية مشمسة ومبهجة على شاطئ البحر، رذاذ ماء متطاير ببطء وإضاءة ذهبية غنية");
    }
  };



  // Submit and call API
  const generateScriptAndStoryboard = async () => {
    if (inputMode === "product") {
      if (!productName || !productType || !usp || !cta) {
        setError("الرجاء ملء جميع الحقول الإلزامية لمواصفات المنتج التقليدية.");
        return;
      }
    } else {
      if (!reelsIdea) {
        setError("الرجاء كتابة فكرة الريلز للتوليد.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setGeneratedScript(null);
    setEditedScenes([]);
    setEditedAnalysis("");

    const moodToSend = selectedVibePreset === "custom" 
      ? customMood 
      : (customMood || vibePresets.find(v => v.id === selectedVibePreset)?.prompt || "");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productType,
          usp,
          targetAudience,
          painPoint,
          cta,
          customMood: moodToSend,
          selectedHookId,
          aspectRatio,
          sceneCount,
          productImage,
          imageMimeType,
          inputMode,
          reelsIdea
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل توليد السكربت والستوري بورد.");
      }

      const data = await response.json();
      setGeneratedScript(data);
      setEditedScenes(data.scenes);
      setEditedAnalysis(data.productAnalysis);
      
      // Auto-save the project
      saveProjectLocally(data, moodToSend);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ غير متوقع أثناء الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  // Save project to local storage
  const saveProjectLocally = (scriptData: ScriptResponse, moodToSend: string) => {
    try {
      const newProject: SavedProject = {
        id: generateUniqueId(),
        timestamp: getArabicTimestamp(),
        productName,
        productType,
        usp,
        targetAudience,
        painPoint,
        cta,
        customMood: moodToSend,
        selectedHookId,
        aspectRatio,
        sceneCount,
        productImagePreview: productImage,
        scriptData,
        inputMode,
        reelsIdea
      };

      const currentSaved = localStorage.getItem("ai_storyboard_projects");
      let list: SavedProject[] = currentSaved ? JSON.parse(currentSaved) : [];
      // Prevent duplicates with same name/data
      list = list.filter(p => {
        if (productName && p.productName === productName) return false;
        if (!productName && reelsIdea && p.reelsIdea === reelsIdea) return false;
        return true;
      });
      list.unshift(newProject);
      
      // limit storage to 20 projects to save space
      if (list.length > 20) list.pop();

      localStorage.setItem("ai_storyboard_projects", JSON.stringify(list));
      setSavedProjects(list);
    } catch (e) {
      console.error("Could not save project locally", e);
    }
  };

  // Load a saved project
  const loadProject = (project: SavedProject) => {
    setProductName(project.productName || "");
    setProductType(project.productType || "");
    setUsp(project.usp || "");
    setTargetAudience(project.targetAudience || "");
    setPainPoint(project.painPoint || "");
    setCta(project.cta || "");
    setCustomMood(project.customMood || "");
    setSelectedHookId(project.selectedHookId || "problem_solution");
    setAspectRatio(project.aspectRatio || "9:16");
    setSceneCount(project.sceneCount || 5);
    setProductImage(project.productImagePreview || null);
    setGeneratedScript(project.scriptData);
    setEditedScenes(project.scriptData.scenes);
    setEditedAnalysis(project.scriptData.productAnalysis);
    setInputMode(project.inputMode || "product");
    setReelsIdea(project.reelsIdea || "");
    setShowSavedList(false);
    setError(null);
  };

  // Delete saved project
  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const currentSaved = localStorage.getItem("ai_storyboard_projects");
      if (currentSaved) {
        let list: SavedProject[] = JSON.parse(currentSaved);
        list = list.filter(p => p.id !== id);
        localStorage.setItem("ai_storyboard_projects", JSON.stringify(list));
        setSavedProjects(list);
      }
    } catch (err) {
      console.error("Could not delete project", err);
    }
  };

  // Handle Copy to Clipboard with temporary success visual
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopySuccess(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Single Scene editing save on click
  const handleSaveSceneEdit = (index: number) => {
    if (!generatedScript) return;
    const newScenes = [...editedScenes];
    
    const updatedScript = {
      ...generatedScript,
      scenes: newScenes
    };
    
    setGeneratedScript(updatedScript);
    setEditedScenes(updatedScript.scenes);
    setEditedAnalysis(updatedScript.productAnalysis);
    setEditingSceneIndex(null);
    // save updated state
    const currentMood = vibePresets.find(v => v.id === selectedVibePreset)?.prompt || customMood;
    saveProjectLocally(updatedScript, currentMood);
  };

  // Inline scene field editing
  const updateSceneField = (index: number, field: keyof Scene, value: string | number) => {
    const updated = [...editedScenes];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setEditedScenes(updated);
  };

  // Regenerate a single specific scene via API
  const regenerateSingleScene = async (index: number) => {
    if (!generatedScript) return;
    setRegeneratingSceneIndex(index);
    setError(null);

    const instructions = sceneInstructions[index] || "اجعل هذا المشهد بلقطة سينمائية أكثر قوة وإثارة للاهتمام";
    const moodToSend = selectedVibePreset === "custom" 
      ? customMood 
      : (customMood || vibePresets.find(v => v.id === selectedVibePreset)?.prompt || "");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productType,
          usp,
          targetAudience,
          painPoint,
          cta,
          customMood: moodToSend,
          selectedHookId,
          aspectRatio,
          sceneCount,
          productImage,
          imageMimeType,
          isRegeneration: true,
          originalScript: generatedScript,
          regenerationInstructions: instructions,
          targetSceneIndex: index
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل تعديل هذا المشهد.");
      }

      const data = await response.json();
      setGeneratedScript(data);
      setEditedScenes(data.scenes);
      setEditedAnalysis(data.productAnalysis);
      // clear instruction field
      setSceneInstructions(prev => ({ ...prev, [index]: "" }));
      
      const currentMood = vibePresets.find(v => v.id === selectedVibePreset)?.prompt || customMood;
      saveProjectLocally(data, currentMood);

    } catch (err: any) {
      console.error(err);
      setError(`خطأ أثناء تعديل المشهد ${index + 1}: ` + err.message);
    } finally {
      setRegeneratingSceneIndex(null);
    }
  };

  // Global modify and rewrite the whole script
  const handleGlobalRegenerate = async () => {
    if (!generatedScript || !globalInstruction.trim()) return;
    setGlobalRegenerating(true);
    setError(null);

    const moodToSend = selectedVibePreset === "custom" 
      ? customMood 
      : (customMood || vibePresets.find(v => v.id === selectedVibePreset)?.prompt || "");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productType,
          usp,
          targetAudience,
          painPoint,
          cta,
          customMood: moodToSend,
          selectedHookId,
          aspectRatio,
          sceneCount,
          productImage,
          imageMimeType,
          isRegeneration: true,
          originalScript: generatedScript,
          regenerationInstructions: globalInstruction,
          targetSceneIndex: -1 // Full script update
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل إعادة توليد السكربت بالكامل.");
      }

      const data = await response.json();
      setGeneratedScript(data);
      setEditedScenes(data.scenes);
      setEditedAnalysis(data.productAnalysis);
      setGlobalInstruction(""); // Clear field

      const currentMood = vibePresets.find(v => v.id === selectedVibePreset)?.prompt || customMood;
      saveProjectLocally(data, currentMood);

    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء معالجة التعديلات العامة: " + err.message);
    } finally {
      setGlobalRegenerating(false);
    }
  };

  // Inline Product Analysis Save
  const handleSaveAnalysisEdit = () => {
    if (!generatedScript) return;
    const updated = {
      ...generatedScript,
      productAnalysis: editedAnalysis
    };
    setGeneratedScript(updated);
    setEditedScenes(updated.scenes);
    setEditedAnalysis(updated.productAnalysis);
    setIsEditingAnalysis(false);

    const currentMood = vibePresets.find(v => v.id === selectedVibePreset)?.prompt || customMood;
    saveProjectLocally(updated, currentMood);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12" id="app_root_container">
      {/* Visual background lights */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-950/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800/80 pb-8 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-500/20">
              <Clapperboard className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-purple-200">
              مخرج السكربت والستوري بورد الذكي <span className="text-xs bg-purple-500/20 text-purple-300 font-normal px-2.5 py-1 rounded-full border border-purple-500/30">احترافي</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
            حوّل أي منتج أو فكرة إلى سيناريو ترويجي فيروسي متكامل! قم برفع صورة المنتج ودع الذكاء الاصطناعي يستخلص الهوية البصرية، ويكتب سيناريو تفصيلياً مع أوامر الستوري بورد والتحريك لكل مشهد.
          </p>
        </div>

        {/* Action button bar */}
        <div className="flex items-center gap-3">
          <button
            id="btn_view_archive"
            onClick={() => setShowSavedList(!showSavedList)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 text-gray-300 transition duration-200 text-sm"
          >
            <FolderOpen className="w-4 h-4 text-purple-400" />
            <span>المشاريع المحفوظة ({savedProjects.length})</span>
          </button>

          {generatedScript && (
            <button
              id="btn_reset_form"
              onClick={() => {
                setGeneratedScript(null);
                setEditedScenes([]);
                setEditedAnalysis("");
                removeImage();
                selectVibeAndFillDefault("food_crunch");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-950/40 bg-red-950/20 hover:bg-red-950/40 text-red-300 transition duration-200 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>بدء مشروع جديد</span>
            </button>
          )}
        </div>
      </header>

      {/* Dropdown list of saved projects */}
      <AnimatePresence>
        {showSavedList && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mb-8 p-6 bg-[#111322] rounded-2xl border border-gray-800/90 shadow-2xl shadow-black/40"
          >
            <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-purple-400" />
              <span>أرشيف السيناريوهات المحفوظة محلياً</span>
            </h3>
            
            {savedProjects.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">
                لا توجد مشاريع سابقة محفوظة في المتصفح حالياً.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => loadProject(p)}
                    className="p-4 rounded-xl border border-gray-800 bg-gray-950/40 hover:border-purple-500/40 hover:bg-gray-900/40 transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-300 truncate max-w-[150px]">
                          {p.productName}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {p.aspectRatio} • {p.scriptData.scenes.length} مشهد
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                        {p.productType}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-800/80 pt-3 mt-1">
                      <span className="text-[10px] text-gray-500">{p.timestamp}</span>
                      <button
                        onClick={(e) => deleteProject(p.id, e)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded bg-gray-900/50 hover:bg-red-500/10 transition"
                        title="حذف من الأرشيف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form + Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Panel / Dashboard Settings */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section Heading tabs */}
          <div className="bg-gray-950/60 p-1 rounded-xl border border-gray-800 flex items-center justify-between gap-1">
            <button
              onClick={() => setActiveTab("onboarding")}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition duration-200 ${
                activeTab === "onboarding" 
                  ? "bg-purple-600/30 border border-purple-500/40 text-purple-100" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              1. معلومات المنتج
            </button>
            <button
              onClick={() => setActiveTab("vibe")}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition duration-200 ${
                activeTab === "vibe" 
                  ? "bg-purple-600/30 border border-purple-500/40 text-purple-100" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              2. الأجواء والPreset
            </button>
            <button
              onClick={() => setActiveTab("hook")}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition duration-200 ${
                activeTab === "hook" 
                  ? "bg-purple-600/30 border border-purple-500/40 text-purple-100" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              3. خطاف التسويق
            </button>
          </div>

          <div className="bg-gray-950/40 rounded-2xl border border-gray-800/80 p-5 backdrop-blur-md space-y-6">
            
            {/* TAB 1: Product Onboarding & Marketing Details */}
            {activeTab === "onboarding" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-purple-400" />
                    <span>مواصفات ومعلومات منتجك</span>
                  </h3>
                  <span className="text-[11px] text-gray-500">الخطوة الأولى</span>
                </div>

                {/* Input Mode Selector Switch */}
                <div className="grid grid-cols-2 gap-2 bg-gray-950/60 p-1 rounded-xl border border-gray-800">
                  <button
                    type="button"
                    onClick={() => handleInputModeChange("product")}
                    className={`py-2 text-center text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
                      inputMode === "product"
                        ? "bg-purple-600/30 border border-purple-500/40 text-purple-100"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    📝 مواصفات المنتج التقليدية
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputModeChange("reels_idea")}
                    className={`py-2 text-center text-xs font-bold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                      inputMode === "reels_idea"
                        ? "bg-purple-600/30 border border-purple-500/40 text-purple-100"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <span>🎬 تقديم فكرة ريلز جاهزة</span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded-full border border-purple-500/30">جديد ✨</span>
                  </button>
                </div>

                {/* Image Upload Area (Shared for both modes) */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-300">
                    تحليل صورة المنتج (اختياري - يساهم في تحديد تفاصيل وتصميم العلبة والألوان بدقة)
                  </label>
                  
                  {!productImage ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group ${
                        dragActive 
                          ? "border-purple-500 bg-purple-500/5" 
                          : "border-gray-800 bg-gray-900/30 hover:border-gray-700/80 hover:bg-gray-900/50"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="p-3 rounded-full bg-gray-950/60 border border-gray-800 text-purple-400 group-hover:text-purple-300 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-gray-300 font-semibold">
                        اسحب صورة منتجك هنا أو انقر للتصفح
                      </p>
                      <p className="text-[10px] text-gray-500">
                        PNG, JPG, WEBP • سيقوم الذكاء الاصطناعي بقراءة تفاصيل الغلاف ومحتوياته
                      </p>
                    </div>
                  ) : (
                    <div className="relative border border-gray-800 rounded-xl p-3 bg-gray-900/40 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 truncate">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-800 bg-black flex-shrink-0">
                          <img 
                            src={productImage} 
                            alt="Product preview" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-purple-300">تم التعرف على صورة المنتج</p>
                          <p className="text-[10px] text-gray-500 truncate">سيتم تحليل الألوان والمكونات تلقائياً</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="px-3 py-1.5 rounded-lg border border-red-950/60 bg-red-950/20 text-red-300 text-xs hover:bg-red-950/50 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>إزالة</span>
                      </button>
                    </div>
                  )}
                </div>

                {inputMode === "product" ? (
                  /* Mode A: Standard Product Fields */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <span>اسم المنتج</span>
                        <span className="text-red-500/80">*</span>
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="مثال: ليز ليمون حار، سيروم هيدرا"
                        className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <span>تصنيف ونوع المنتج</span>
                        <span className="text-red-500/80">*</span>
                      </label>
                      <input
                        type="text"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        placeholder="مثال: سناك بطاطس مقرمشة، سيروم مغذي للوجه"
                        className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <span>ميزة البيع الكبرى والفريدة (USP)</span>
                        <span className="text-red-500/80">*</span>
                      </label>
                      <textarea
                        value={usp}
                        onChange={(e) => setUsp(e.target.value)}
                        placeholder="ما الذي يجعل هذا المنتج أفضل من المنافسين؟ مثال: قرمشة تدوم لساعات مع تطاير رقائق التوابل الحادة"
                        rows={2}
                        className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        الجمهور المستهدف بالتفصيل
                      </label>
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="مثال: عشاق التسلية والمغامرات من جيل الشباب والمراهقين"
                        className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                        المشكلة الأساسية التي يعالجها منتجك
                      </label>
                      <input
                        type="text"
                        value={painPoint}
                        onChange={(e) => setPainPoint(e.target.value)}
                        placeholder="مثال: الملل والافتقار إلى مذاق قوي ومقرمش في الجلسات"
                        className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <span>العبارة الختامية للدعوة لاتخاذ إجراء (CTA)</span>
                        <span className="text-red-500/80">*</span>
                      </label>
                      <input
                        type="text"
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        placeholder="مثال: اطلب الآن بخصم 20% لفترة محدودة!"
                        className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>
                  </div>
                ) : (
                  /* Mode B: Custom Reels Idea Form */
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                        <span>اكتب فكرة الريلز أو سيناريو الفيديو بالتفصيل</span>
                        <span className="text-red-500/80">*</span>
                      </label>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        صِف الفكرة واللقطة الأولى ومحور الحركة، وسيقوم المخرج بتحليلها تلقائياً وصياغة المشاهد المترابطة.
                      </p>
                      <textarea
                        value={reelsIdea}
                        onChange={(e) => setReelsIdea(e.target.value)}
                        placeholder="مثال: ريل سريع يبين معاناة شخص مع فاتورة الكهرباء العالية، ثم يقرر التحويل لمكيف ايفولي انفيرتر لتوفير 60% من استهلاك الطاقة..."
                        rows={6}
                        className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                          <span>اسم المنتج / البراند</span>
                          <span className="text-red-500/80">*</span>
                        </label>
                        <input
                          type="text"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="مثال: مكيف ايفولي انفيرتر"
                          className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                          <span>العبارة الختامية (CTA)</span>
                          <span className="text-red-500/80">*</span>
                        </label>
                        <input
                          type="text"
                          value={cta}
                          onChange={(e) => setCta(e.target.value)}
                          placeholder="مثال: وفر 60% من فاتورتك واطلب مكيف ايفولي انفيرتر الآن!"
                          className="w-full bg-gray-900/60 border border-gray-800/90 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("vibe")}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700/80 text-white rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>التالي: اختيار الجو العام</span>
                    <Sparkle className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Visual Vibes Presets & Custom Atmosphere */}
            {activeTab === "vibe" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-purple-400" />
                    <span>الجو العام والأسلوب البصري للمشاهد</span>
                  </h3>
                  <span className="text-[11px] text-gray-500">الخطوة الثانية</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  يقوم مخرج الـ AI بإنشاء ستوري بورد يطابق الطبيعة البصرية الحقيقية لمنتجك. اختر القالب المناسب لتعبئة البيانات تلقائياً بأمثلة ملهمة:
                </p>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {vibePresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => selectVibeAndFillDefault(preset.id)}
                      className={`p-3.5 rounded-xl border text-right transition cursor-pointer ${
                        selectedVibePreset === preset.id
                          ? "bg-purple-950/20 border-purple-500/60 shadow-md shadow-purple-500/5"
                          : "bg-gray-900/20 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-100">
                          {preset.name}
                        </span>
                        {selectedVibePreset === preset.id && (
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Custom Mood Textarea */}
                {selectedVibePreset === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 pt-2"
                  >
                    <label className="block text-xs font-semibold text-gray-300">
                      اكتب الأجواء المخصصة التي تحلم بها بالتفصيل:
                    </label>
                    <textarea
                      value={customMood}
                      onChange={(e) => setCustomMood(e.target.value)}
                      placeholder="مثال: كرات من الفاكهة الطازجة تتساقط بداخل حليب كريمي مع رذاذ أبيض متطاير وتصوير فائق السرعة وإضاءة سينمائية زرقاء ناعمة..."
                      rows={3}
                      className="w-full bg-gray-900/60 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition leading-relaxed resize-none"
                    />
                  </motion.div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("onboarding")}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg text-xs transition duration-200"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("hook")}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700/80 text-white rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5"
                  >
                    <span>التالي: الخطاف التسويقي</span>
                    <Sparkle className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Marketing Hook Selection */}
            {activeTab === "hook" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Video className="w-4.5 h-4.5 text-purple-400" />
                    <span>خطاف الثواني الـ 3 الأولى (Hook)</span>
                  </h3>
                  <span className="text-[11px] text-gray-500">الخطوة الثالثة</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  يحدد الخطاف أسلوب وطريقة تقديم المنتج في بداية الفيديو لجذب انتباه المستهلك فوراً لضمان عدم تمرير الفيديو:
                </p>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {hooksList.map((hook) => (
                    <div
                      key={hook.id}
                      onClick={() => setSelectedHookId(hook.id)}
                      className={`p-3.5 rounded-xl border text-right transition cursor-pointer ${
                        selectedHookId === hook.id
                          ? "bg-purple-950/20 border-purple-500/60 shadow-md shadow-purple-500/5"
                          : "bg-gray-900/20 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{hook.emoji}</span>
                          <span className="text-xs font-bold text-gray-100">
                            {hook.name}
                          </span>
                        </div>
                        {selectedHookId === hook.id && (
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
                        {hook.description}
                      </p>
                      <div className="bg-gray-950/50 p-2 rounded-lg border border-gray-900/80 text-[10px] text-purple-200/90 leading-relaxed">
                        <strong>مثال مقترح:</strong> &quot;{hook.example}&quot;
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("vibe")}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg text-xs transition duration-200"
                  >
                    السابق
                  </button>
                  <span className="text-xs text-gray-500 self-center">مكتمل 100%</span>
                </div>
              </div>
            )}

          </div>

          {/* Sizing & Slices Count Configuration Panel */}
          <div className="bg-gray-950/40 rounded-2xl border border-gray-800/80 p-5 backdrop-blur-md space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>إعدادات الإخراج الفني والمشاهد</span>
            </h4>

            {/* Video Aspect Ratio */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300">
                مقاس وأبعاد الفيديو المستهدف
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio("9:16")}
                  className={`py-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                    aspectRatio === "9:16"
                      ? "bg-purple-950/20 border-purple-500 text-purple-200"
                      : "bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <Square className="w-4 h-4 rotate-90 scale-y-[1.7] text-purple-400" />
                  <span className="text-[10px] font-bold">رأسي (9:16)</span>
                  <span className="text-[9px] text-gray-500">تيك توك / ريلز</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio("16:9")}
                  className={`py-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                    aspectRatio === "16:9"
                      ? "bg-purple-950/20 border-purple-500 text-purple-200"
                      : "bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <Tv className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-bold">أفقي (16:9)</span>
                  <span className="text-[9px] text-gray-500">يوتيوب / إعلانات TV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio("1:1")}
                  className={`py-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                    aspectRatio === "1:1"
                      ? "bg-purple-950/20 border-purple-500 text-purple-200"
                      : "bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <Square className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] font-bold">مربع (1:1)</span>
                  <span className="text-[9px] text-gray-500">منشور انستقرام</span>
                </button>
              </div>
            </div>

            {/* Scenes Counter Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-gray-300">
                  عدد مشاهد الستوري بورد المطلوبة
                </label>
                <span className="text-purple-300 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {sceneCount} مشاهد
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSceneCount(num)}
                    className={`py-2 rounded-lg border text-center text-xs font-mono font-bold transition ${
                      sceneCount === num
                        ? "bg-purple-600/20 border-purple-500 text-purple-200"
                        : "bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    {num === 3 && "3 (سريع)"}
                    {num === 5 && "5 (مثالي)"}
                    {num === 7 && "7 (مفصل)"}
                    {num === 10 && "10 (كامل)"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 text-right mt-1.5 leading-relaxed">
                كلما زاد عدد المشاهد، حصلت على تسلسل زمني أطول وتوجيهات بصرية أكثر دقة لمحرري ومصممي الفيديو ومولدات الـ AI.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/60 text-red-300 text-xs flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* MAIN GENERATE ACTION BUTTON */}
            <button
              id="btn_trigger_generation"
              onClick={generateScriptAndStoryboard}
              disabled={loading || !isFormValid}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition duration-300 shadow-xl flex items-center justify-center gap-2 ${
                loading 
                  ? "bg-purple-800/40 text-purple-300 cursor-not-allowed" 
                  : !isFormValid
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50 shadow-none"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 shadow-purple-500/10 cursor-pointer hover:shadow-purple-500/20"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  <span>جاري حبك فكرتك وصياغة السكربت...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                  <span>توليد السكربت والستوري بورد السحري ✨</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Output Display Canvas */}
        <div className="lg:col-span-7 space-y-6">

          {/* Loading Animation States */}
          {loading && (
            <div className="bg-gray-950/40 rounded-2xl border border-gray-800/80 p-12 backdrop-blur-md flex flex-col items-center justify-center text-center gap-6 min-h-[500px]">
              <div className="relative">
                {/* Multi-layered spinning rings */}
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
                <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-4 border-indigo-500/10 border-b-indigo-400 animate-spin [animation-direction:reverse]" />
                <div className="absolute top-2.5 left-2.5 w-11 h-11 rounded-full bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Clapperboard className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-white">يقوم مخرج الـ AI الخاص بنا بصياغة المحتوى الفيروسي...</h3>
                <p className="text-xs text-gray-400">قد يستغرق التحليل المعمق وكتابة الأكواد البصرية للستوري بورد من 10 إلى 20 ثانية.</p>
              </div>

              {/* Progress tip card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingTipIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="bg-purple-950/10 border border-purple-500/20 p-4 rounded-xl max-w-md text-xs text-purple-200/90 leading-relaxed shadow-lg flex items-start gap-2.5"
                >
                  <Sparkle className="w-4 h-4 flex-shrink-0 text-purple-400 mt-0.5 animate-pulse" />
                  <span>{loadingTips[loadingTipIndex]}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Placeholder state when no script generated yet */}
          {!loading && !generatedScript && (
            <div className="bg-gray-950/10 rounded-2xl border border-gray-800/80 p-12 backdrop-blur-md flex flex-col items-center justify-center text-center gap-6 min-h-[500px] border-dashed">
              <div className="w-14 h-14 rounded-full bg-gray-900/80 border border-gray-800/80 flex items-center justify-center text-gray-500">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-base font-bold text-gray-300">لوحة الإخراج في انتظار فكرتك</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  املأ الحقول الإرشادية لمنتجك على اليسار واضغط على توليد. سيقوم محرك Gemini بإنتاج السيناريوهات والصور والتحريك الفوري هنا.
                </p>
              </div>

              {/* Quick Preset Hint card */}
              <div className="bg-purple-950/10 border border-purple-500/20 p-4 rounded-xl max-w-md text-xs text-purple-200/80 leading-relaxed text-right">
                💡 <strong>نصيحة ذهبية:</strong> يفضل رفع صورة المنتج الحقيقي حتى يتعرف الذكاء الاصطناعي على ألوان العلبة والمحتوى لصناعة لقطات الستوري بورد متطابقة ومناسبة للتسويق الفعلي.
              </div>
            </div>
          )}

          {/* Generated Script Dashboard Output */}
          {!loading && generatedScript && (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
              
              {/* Product Analysis and Vibe Header */}
              <div className="bg-gradient-to-br from-[#121424] to-[#161a35] rounded-2xl border border-purple-500/20 p-6 shadow-xl shadow-purple-950/5 space-y-4">
                
                {/* Title block */}
                <div className="flex items-center justify-between border-b border-gray-800/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg">
                      <Sparkles className="w-4.5 h-4.5" />
                    </span>
                    <h3 className="text-base font-bold text-white">التحليل الإخراجي الذكي لمنتجك</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    أبعاد الستوري بورد: {aspectRatio}
                  </span>
                </div>

                {/* Main analysis text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-purple-300">🔍 استخلاص الهوية البصرية والعناصر الأساسية:</h4>
                    {!isEditingAnalysis ? (
                      <button 
                        onClick={() => setIsEditingAnalysis(true)}
                        className="text-[11px] text-gray-400 hover:text-purple-300 transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleSaveAnalysisEdit}
                          className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded transition"
                        >
                          حفظ
                        </button>
                        <button 
                          onClick={() => {
                            setEditedAnalysis(generatedScript.productAnalysis);
                            setIsEditingAnalysis(false);
                          }}
                          className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingAnalysis ? (
                    <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/40 p-4 rounded-xl border border-gray-900/80">
                      {generatedScript.productAnalysis}
                    </p>
                  ) : (
                    <textarea
                      value={editedAnalysis}
                      onChange={(e) => setEditedAnalysis(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-950/80 border border-purple-500/40 rounded-xl p-3 text-xs text-gray-200 focus:outline-none leading-relaxed"
                    />
                  )}
                </div>

                {/* Hook and Atmosphere Summary items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-950/30 border border-gray-800/80 p-3.5 rounded-xl">
                    <p className="text-[11px] font-bold text-indigo-400 mb-1">🎯 استراتيجية الخطاف المقترحة:</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {generatedScript.selectedHookExplanation}
                    </p>
                  </div>

                  <div className="bg-gray-950/30 border border-gray-800/80 p-3.5 rounded-xl">
                    <p className="text-[11px] font-bold text-teal-400 mb-1">🎬 المناخ البصري والديكور (Visual Vibe):</p>
                    <p className="text-xs text-gray-300 leading-relaxed font-mono truncate hover:text-clip hover:whitespace-normal" title={generatedScript.visualAtmosphere}>
                      {generatedScript.visualAtmosphere}
                    </p>
                  </div>
                </div>

              </div>

              {/* Master Unified Storyboard Collage Section */}
              <div className="bg-gradient-to-br from-[#12142e] to-[#1a1738] rounded-2xl border border-purple-500/30 p-6 shadow-2xl shadow-purple-500/5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
                      <Layers className="w-5 h-5 animate-pulse text-purple-400" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">مجمّع الستوري بورد السينمائي الموحد (Collage Prompt)</h3>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold px-2 py-0.5 rounded-full">موصى به للاتساق البصري ⭐️</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        أمر سحري واحد متكامل لتوليد الستوري بورد كشبكة كولاج كاملة (Collage Grid) تحافظ بدقة على الهوية البصرية، ملامح الشخصية أو المنتج، والألوان عبر كل اللقطات الـ {editedScenes.length} بمقاس {aspectRatio}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Master Collage prompt display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>الأمر الموحد المولد لـ Midjourney (English Only):</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(getDynamicCollagePrompt(), "master_collage")}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold shadow-lg shadow-purple-500/20 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copySuccess["master_collage"] ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span className="text-emerald-200">تم نسخ الكود بنجاح!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الأمر الموحد المجمّع</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-950/90 p-4 rounded-xl border border-gray-800/80 text-xs font-mono text-gray-300 leading-relaxed max-h-[220px] overflow-y-auto select-all text-left dir-ltr relative scrollbar-thin">
                    {getDynamicCollagePrompt()}
                  </div>
                </div>

                {/* USER GUIDANCE: "هل يجب إرفاق صورة كيس الشيبس؟" */}
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-4.5 space-y-3 leading-relaxed text-xs">
                  <h4 className="font-bold text-purple-200 flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-purple-400" />
                    <span>💡 دليل التوليد الفائق بالذكاء الاصطناعي: هل يجب إرفاق صورة منتجك وكيف تولّده بدون أخطاء؟</span>
                  </h4>
                  
                  <div className="space-y-2 text-gray-300">
                    <p className="font-semibold text-purple-300 text-[11px] bg-purple-950/30 p-2 rounded border border-purple-500/10">
                      ⚠️ السؤال الأهم: هل يجب إرفاق صورة منتجك (مثل كيس الشيبس)؟ 
                      <br/>
                      نعم، بالتأكيد! لكي يعرف الذكاء الاصطناعي شكل ولون وتصميم كيس الشيبس بدقة، يجب استخدام الصورة المرجعية. وإليك كيفية فعل ذلك كالمحترفين:
                    </p>

                    <ul className="space-y-2 list-none pr-1">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">1.</span>
                        <span>
                          <strong>رفع الصورة:</strong> قم برفع صورة كيس الشيبس (بجودة جيدة وخلفية واضحة) في ديسكورد ميدجورني (عبر الضغط على علامة + ثم إرسال الصورة).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">2.</span>
                        <span>
                          <strong>الحصول على الرابط:</strong> انقر بزر الماوس الأيمن على الصورة المرفوعة في ديسكورد، واختر <strong>Copy Image Link</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">3.</span>
                        <span>
                          <strong>استخدام الأمر الموحد (الأسلوب الموصى به):</strong> اكتب في ديسكورد <code className="bg-black/50 px-1 py-0.5 rounded font-mono text-pink-300 text-[10px]">/imagine prompt:</code> ثم الصق الأمر الموحد المنسوخ من الأعلى، وفي نهايته أضف معامل مرجع النمط:
                          <br/>
                          <code className="bg-black/60 px-2 py-1 rounded font-mono text-purple-300 block mt-1 select-all text-left dir-ltr">
                            --sref [رابط_صورة_المنتج]
                          </code>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">4.</span>
                        <span>
                          <strong>لتطابق أعلى للغلاف والشكل:</strong> يمكنك إضافة معامل تطابق الصورة <code className="bg-black/50 px-1 py-0.5 rounded font-mono text-pink-300 text-[10px]">--sw 100</code> أو معامل وزن الصورة <code className="bg-black/50 px-1 py-0.5 rounded font-mono text-pink-300 text-[10px]">--iw 2.0</code> لفرض كيس الشيبس الخاص بك كبطل وحيد لكل الإطارات دون أي تشويه أو تغيير عشوائي.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Master Scene-by-Scene Storyboard Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <span>لوحة المشاهد المتسلسلة والستوري بورد ({editedScenes.length} مشاهد)</span>
                  </h3>
                  <span className="text-xs text-gray-500">انقر على أي جزء للتعديل اليدوي الفوري</span>
                </div>

                {editedScenes.map((scene, index) => {
                  const isEditing = editingSceneIndex === index;
                  const isRegenerating = regeneratingSceneIndex === index;

                  return (
                    <div
                      key={index}
                      className={`relative rounded-2xl border transition duration-300 overflow-hidden ${
                        isEditing 
                          ? "border-purple-500 bg-purple-950/10 shadow-lg shadow-purple-500/5" 
                          : "border-gray-800/80 bg-gray-900/20 hover:border-gray-700/80"
                      }`}
                    >
                      {/* Scene Header */}
                      <div className="bg-gray-950/60 px-5 py-3.5 flex items-center justify-between border-b border-gray-800/60">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-purple-600/20 text-purple-300 flex items-center justify-center font-mono font-bold text-xs border border-purple-500/30">
                            {scene.sceneNumber}
                          </span>
                          <span className="text-xs font-bold text-gray-200">
                            {index === 0 ? "البداية (خطاف الجذب ⚡)" : index === editedScenes.length - 1 ? "الخاتمة والدعوة للإجراء (CTA 📢)" : `المشهد السردي #${index + 1}`}
                          </span>
                        </div>

                        {/* Edit Buttons */}
                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <button
                              onClick={() => {
                                setEditingSceneIndex(index);
                              }}
                              className="px-3 py-1 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-900/50 text-gray-400 hover:text-gray-200 text-[11px] font-semibold transition flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل يدوي</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleSaveSceneEdit(index)}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-bold transition flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>حفظ التعديل</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (generatedScript) {
                                    const reverted = [...editedScenes];
                                    reverted[index] = { ...generatedScript.scenes[index] };
                                    setEditedScenes(reverted);
                                  }
                                  setEditingSceneIndex(null);
                                }}
                                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[11px] transition"
                              >
                                إلغاء
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Scene Core Content */}
                      <div className="p-5 space-y-4">
                        
                        {/* 1. Voiceover and On-Screen text overlay in Arabic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Voiceover column */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                              <span>التعليق الصوتي (Voiceover) - باللغة العربية:</span>
                            </label>
                            
                            {!isEditing ? (
                              <p className="text-xs text-gray-200 bg-gray-950/40 p-3 rounded-xl border border-gray-900/80 leading-relaxed font-sans min-h-[50px]">
                                {scene.voiceover}
                              </p>
                            ) : (
                              <textarea
                                value={scene.voiceover}
                                onChange={(e) => updateSceneField(index, "voiceover", e.target.value)}
                                rows={2}
                                className="w-full bg-gray-950/60 border border-purple-500/30 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 transition leading-relaxed font-sans"
                              />
                            )}
                          </div>

                          {/* On-Screen Text Overlay */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              <span>الكتابة المقترحة على الشاشة (Text Overlay):</span>
                            </label>
                            
                            {!isEditing ? (
                              <p className="text-xs text-purple-200 bg-purple-950/5 p-3 rounded-xl border border-purple-900/30 font-sans min-h-[50px] leading-relaxed">
                                {scene.textOverlay || "لا توجد كتابة"}
                              </p>
                            ) : (
                              <textarea
                                value={scene.textOverlay}
                                onChange={(e) => updateSceneField(index, "textOverlay", e.target.value)}
                                rows={2}
                                className="w-full bg-gray-950/60 border border-purple-500/30 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-purple-500 transition leading-relaxed font-sans"
                              />
                            )}
                          </div>

                        </div>

                        {/* 2. Sound Effects SFX */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>المؤثرات الصوتية والموسيقى التصويرية المقترحة (SFX):</span>
                          </label>
                          {!isEditing ? (
                            <p className="text-xs text-emerald-300/90 bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-900/30 leading-relaxed font-sans">
                              🎵 {scene.sfxCue}
                            </p>
                          ) : (
                            <input
                              type="text"
                              value={scene.sfxCue}
                              onChange={(e) => updateSceneField(index, "sfxCue", e.target.value)}
                              className="w-full bg-gray-950/60 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500 transition font-sans"
                            />
                          )}
                        </div>

                        {/* 3. Storyboard Image Prompt - ENGLISH (Copy and Paste in Midjourney) */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                              <span>أمر توليد صورة الستوري بورد لـ Midjourney (English Only):</span>
                            </label>
                            
                            <button
                              onClick={() => copyToClipboard(scene.storyboardPrompt, `mj_${index}`)}
                              className="px-2.5 py-1 rounded bg-gray-950/80 hover:bg-gray-900 border border-gray-800 text-[10px] text-gray-300 hover:text-white transition flex items-center gap-1 font-mono cursor-pointer"
                            >
                              {copySuccess[`mj_${index}`] ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">تم نسخ الأمر!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>نسخ أمر Midjourney</span>
                                </>
                              )}
                            </button>
                          </div>

                          {!isEditing ? (
                            <div className="bg-gray-950/80 p-3.5 rounded-xl border border-gray-800/80 text-xs font-mono text-gray-300 leading-relaxed select-all text-left dir-ltr relative group">
                              {scene.storyboardPrompt}
                            </div>
                          ) : (
                            <textarea
                              value={scene.storyboardPrompt}
                              onChange={(e) => updateSceneField(index, "storyboardPrompt", e.target.value)}
                              rows={3}
                              className="w-full bg-gray-950/60 border border-purple-500/30 rounded-xl p-2.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-purple-500 transition leading-relaxed text-left dir-ltr"
                            />
                          )}
                          
                          {/* Guideline callout for individual scenes */}
                          <div className="bg-purple-950/20 border border-purple-500/20 p-2.5 rounded-lg text-[11px] text-purple-200 leading-relaxed flex items-center gap-1.5 mt-1.5">
                            <span className="text-purple-400">💡</span>
                            <span><strong>نصيحة التطابق التام:</strong> لظهور غلاف منتجك الحقيقي بدقة في هذه اللقطة، أضف رابط صورة منتجك المباشر في بداية الأمر، أو أضف <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[10px]">--sref [رابط_صورة_منتجك]</code> في نهاية الأمر في Midjourney.</span>
                          </div>
                        </div>

                        {/* 4. Animation Movement Prompt - ENGLISH (Copy for Runway / Luma / Sora) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                              <Play className="w-3.5 h-3.5 text-indigo-400" />
                              <span>أمر حركة الكاميرا والتحريك لـ Runway / Luma / Pika (English Only):</span>
                            </label>
                            
                            <button
                              onClick={() => copyToClipboard(scene.animationPrompt, `anim_${index}`)}
                              className="px-2.5 py-1 rounded bg-gray-950/80 hover:bg-gray-900 border border-gray-800 text-[10px] text-gray-300 hover:text-white transition flex items-center gap-1 font-mono cursor-pointer"
                            >
                              {copySuccess[`anim_${index}`] ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">تم نسخ الأمر!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>نسخ أمر التحريك</span>
                                </>
                              )}
                            </button>
                          </div>

                          {!isEditing ? (
                            <div className="bg-gray-950/80 p-3.5 rounded-xl border border-gray-800/80 text-xs font-mono text-gray-300 leading-relaxed select-all text-left dir-ltr">
                              {scene.animationPrompt}
                            </div>
                          ) : (
                            <textarea
                              value={scene.animationPrompt}
                              onChange={(e) => updateSceneField(index, "animationPrompt", e.target.value)}
                              rows={2}
                              className="w-full bg-gray-950/60 border border-purple-500/30 rounded-xl p-2.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-purple-500 transition leading-relaxed text-left dir-ltr"
                            />
                          )}
                        </div>

                        {/* 5. INDIVIDUAL SCENE REGENERATION (RE-WRITE VIA AI) */}
                        <div className="border-t border-gray-800/60 pt-4 mt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-950/20 -mx-5 -mb-5 p-4 rounded-b-xl">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-[11px] font-bold text-purple-400 whitespace-nowrap">إعادة بناء هذا المشهد بالذكاء الاصطناعي:</span>
                            <input
                              type="text"
                              value={sceneInstructions[index] || ""}
                              onChange={(e) => setSceneInstructions(prev => ({ ...prev, [index]: e.target.value }))}
                              placeholder="مثال: غير المشهد ليكون خارجيًا في الشارع، أو اجعل صوت المعلق الصوتي أكثر إثارة وحماسية"
                              className="flex-1 bg-gray-950/80 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => regenerateSingleScene(index)}
                            disabled={isRegenerating || !sceneInstructions[index]?.trim()}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-200 flex items-center justify-center gap-1.5 flex-shrink-0 ${
                              isRegenerating
                                ? "bg-purple-900/40 text-purple-300 cursor-not-allowed"
                                : !sceneInstructions[index]?.trim()
                                  ? "bg-gray-900 text-gray-500 cursor-not-allowed border border-gray-800"
                                  : "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                            }`}
                          >
                            {isRegenerating ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>جاري التعديل...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>تعديل بالمطور الذكي ✨</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* GLOBAL MODIFICATION CHAT BOX - REWRITE WHOLE SCRIPT */}
              <div className="bg-gradient-to-r from-[#111322] to-[#141b31] rounded-2xl border border-purple-500/20 p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-800/80 pb-3">
                  <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg">
                    <MessageSquareCode className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">تعديل السيناريو بالكامل دفعة واحدة (توجيهات عامة)</h4>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  هل تريد تحويل اللهجة؟ تقصير الفيديو؟ تغيير المزاج العام لكل المشاهد في ثوانٍ؟ اكتب التعديل المطلوب وسيقوم مخرج الـ AI بإعادة صياغة السكربت بالكامل مع الحفاظ على الهوية البصرية.
                </p>

                <div className="flex flex-col md:flex-row items-stretch gap-3">
                  <textarea
                    value={globalInstruction}
                    onChange={(e) => setGlobalInstruction(e.target.value)}
                    placeholder="مثال: أعد كتابة التعليق الصوتي بالكامل بلهجة مصرية عامية مرحة وبسيطة، واجعل المشاهد ذات طابع نيون مستقبلي صارخ..."
                    rows={2}
                    className="flex-1 bg-gray-950/80 border border-gray-800 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition leading-relaxed resize-none"
                  />
                  
                  <button
                    type="button"
                    onClick={handleGlobalRegenerate}
                    disabled={globalRegenerating || !globalInstruction.trim()}
                    className={`px-5 py-3 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-2 self-end md:self-stretch md:min-w-[140px] ${
                      globalRegenerating
                        ? "bg-purple-900/40 text-purple-300 cursor-not-allowed"
                        : !globalInstruction.trim()
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 cursor-pointer"
                    }`}
                  >
                    {globalRegenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري المعالجة الشاملة...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>تطبيق على الكل ✨</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Tips Card on AI Promotion Generators */}
              <div className="bg-gray-950/40 border border-gray-800/80 p-5 rounded-2xl space-y-3 leading-relaxed text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4.5 h-4.5 text-purple-400" />
                  <span>كيف تستخدم هذه المخرجات للحصول على فيديو احترافي؟</span>
                </h4>
                <ul className="list-disc pr-5 text-gray-400 space-y-2">
                  <li>
                    <strong>الستوري بورد:</strong> قم بنسخ أوامر Midjourney الزرقاء من كل مشهد والصقها بـ Discord الخاص بـ Midjourney لتوليد صور الستوري بورد أو صور الفيديو بدقة متناهية وبالمقاس المناسب مباشرة.
                  </li>
                  <li>
                    <strong>التحريك:</strong> بعد توليد الصور، ارفعها في منصة تحريك الفيديوهات مثل <strong>Runway Gen-2</strong> أو <strong>Luma Dream Machine</strong> أو <strong>Kling AI</strong>، ثم انسخ أمر حركة الكاميرا البنفسجي لتوليد مقطع فيديو متحرك احترافي مدته 4-5 ثوانٍ لكل مشهد.
                  </li>
                  <li>
                    <strong>المونتاج والتعليق الصوتي:</strong> ادمج المقاطع الناتجة مع صوت المعلق الصوتي المكتوب بالعربية في برامج المونتاج مثل CapCut أو Premiere Pro، وأضف المؤثرات الصوتية (SFX) المكتوبة بالمشاهد لتحصل على فيديو تسويقي فيروسي متكامل جاهز للنشر!
                  </li>
                </ul>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Modern Compact Footer */}
      <footer className="border-t border-gray-900/80 mt-16 pt-6 pb-4 text-center text-xs text-gray-500">
        <p>© 2026 مخرج السكربت والستوري بورد الذكي بالذكاء الاصطناعي. تم التطوير بحرفية وإتقان بمسار فني فاخر.</p>
      </footer>
    </div>
  );
}
