import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the GoogleGenAI client with the key from environment variables
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productName,
      productType,
      usp,
      targetAudience,
      painPoint,
      cta,
      customMood,
      selectedHookId,
      aspectRatio,
      sceneCount,
      productImage, // base64 string
      imageMimeType, // e.g. image/png
      isRegeneration, // boolean flag for editing/regenerating
      originalScript, // if regenerating, pass the original state
      regenerationInstructions, // instructions for modification
      targetSceneIndex, // if regenerating a single scene (-1 for entire script, or index)
      inputMode, // "product" or "reels_idea"
      reelsIdea, // Custom reels story idea to analyze and expand
    } = body;

    // Build the hook details mapping
    const hooksList = [
      { id: "problem_solution", name: "خطاف المشكلة والحل (Problem-Solution)", description: "يبدأ بذكر مشكلة شائعة تواجه المستهدف ثم يطرح المنتج كبطل منقذ" },
      { id: "curiosity_gap", name: "خطاف فجوة الفضول (Curiosity Gap)", description: "يخلق فضولًا وتساؤلاً عميقاً لا يمكن حله إلا بمتابعة الفيديو حتى النهاية" },
      { id: "bold_statement", name: "خطاف العبارة الصادمة/الجريئة (Bold Statement)", description: "يبدأ بقطع الأنماط بعبارة غير تقليدية تلفت الانتباه وتجذب الوعي فوراً" },
      { id: "day_in_life", name: "خطاف أسلوب الحياة والجماليات (Day in the Life/Aesthetic)", description: "يركز على الجمال البصري، التفاصيل الهادئة، والاندماج السلس للمنتج في نمط حياة مثالي ومريح" },
      { id: "inside_secrets", name: "خطاف كواليس التصنيع والمواد الخام (Macro Details/Raw)", description: "يركز على جودة التصنيع الفائقة بلقطات ماكرو سريعة للمواد الطائرة والمكونات الأساسية بدقة متناهية" },
      { id: "social_proof", name: "خطاف الإثبات الاجتماعي والمقارنة (Social Proof/Contrast)", description: "يوضح لماذا يفضل الناس هذا المنتج على غيره، ويقارن الأداء بذكاء وسرعة" }
    ];

    const selectedHook = hooksList.find(h => h.id === selectedHookId) || hooksList[0];

    // Determine default atmosphere depending on product type if customMood is empty
    let defaultVibe = "";
    if (productType?.toLowerCase().includes("شيبس") || productType?.toLowerCase().includes("أكل") || productType?.toLowerCase().includes("food") || productType?.toLowerCase().includes("chips")) {
      defaultVibe = "Dynamic atmosphere with raw materials flying, flavor dust, intense sound cues, close-up macro of texture and crunchiness, warm dramatic backlighting.";
    } else if (productType?.toLowerCase().includes("تجميل") || productType?.toLowerCase().includes("cosmetics") || productType?.toLowerCase().includes("بشرة") || productType?.toLowerCase().includes("skin")) {
      defaultVibe = "Elegant clean botanical atmosphere with soft dewy focus, water ripples, botanical ingredients floating slowly, studio lighting, smooth slow panning.";
    } else if (productType?.toLowerCase().includes("إلكترونيات") || productType?.toLowerCase().includes("tech") || productType?.toLowerCase().includes("أجهزة") || productType?.toLowerCase().includes("phone")) {
      defaultVibe = "Futuristic tech atmosphere, deep black background with glowing cyan and neon purple accents, sleek glass reflections, extreme close-up rotating shots, high contrast lighting.";
    } else {
      defaultVibe = "Cinematic studio look, high contrast, clean backdrop with dynamic particles relevant to the product, focused spotlight and elegant transitions.";
    }

    const visualAtmosphere = customMood ? customMood : defaultVibe;

    // Define parts for Gemini API
    const parts: any[] = [];

    // If an image is provided, construct the inlineData part
    let imageAnalysisInstruction = "";
    if (productImage && imageMimeType) {
      const base64Data = productImage.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: base64Data
        }
      });
      imageAnalysisInstruction = `
[Product Image Attached]
Analyse the uploaded product image. Identify and extract its features:
- Colors (exact hex vibe, brand colors)
- Container shape/materials (plastic, glass bottle, cardboard box, matte wrapper)
- Logo placement and specific design patterns (e.g. botanical illustration, bold typography, glossy finish)
- Ingredients visible (e.g. salt flakes, potato slices, avocado, coffee beans)
You MUST weave these exact visual identifiers into the generated scenes. For instance, if the image shows a blue packet of salt & vinegar chips with golden ripples, reference the blue packaging with gold accents and actual salt crystals in the storyboard and animation prompts!
`;
    }

    let systemPrompt = `You are a world-class, award-winning creative director, elite brand copywriter, and professional visual artist who creates viral, high-converting commercials for top-tier brands on TikTok, Reels, and YouTube Shorts. 

Your scripts are famous for being:
1. **Unbelievably simple, punchy, and emotional**: They completely avoid clichéd, generic "AI-sounding" phrases (like "مرحباً بكم", "هل تبحث عن الحل", "نقدم لكم", "مع منتجنا الجديد"). Instead, they dive straight into the heart of the experience using colloquial, lively, persuasive Arabic (لهجة تسويقية بيعية بليغة، بسيطة، سريعة الوقع، تلمس رغبات المستهلك فوراً).
2. **Pure, focused sales copy (سكربت بيعي جميل ومقنع وغير معقد)**: It must feel natural, conversational, and highly convincing, like a real, successful creator or professional voiceover artist is speaking. Keep sentences short and words impactful.
3. **Visual Masterpieces (Midjourney & Runway standard)**: Every storyboard prompt must describe a stunning, breath-taking commercial scene with high production value. Do not use generic terms; specify camera moves (probe lens, circular tracking, macro zoom), lighting (soft rim light, volumetric dust, atmospheric smoke, high-contrast chiaroscuro), particles (exploding flavor dust, water droplets, floating lavender petals), and textures.

=== CRITICAL STORYBOARDING RULES ===
- **ABSOLUTE LOCATION & ENVIRONMENTAL CONSISTENCY (توحيد بيئة وجو الإعلان بالكامل)**: 
  The entire advertisement MUST take place in the **exact same location, set, backdrop, and studio environment** (e.g., shot entirely on a single dark luxury studio stage, or entirely in a bright modern minimalist kitchen, or entirely in a cozy warm living room). 
  You are STRICTLY FORBIDDEN from hopping or jumping between different locations (e.g. do NOT put Scene 1 in a kitchen, Scene 2 on a beach, Scene 3 in a futuristic lab). The scenes must feel like they were captured sequentially during the **exact same video shoot** under the same lighting setup. Only change camera angles, focal lengths, close-ups/zooms, and the motion of product/ingredients.
- Aspect Ratio is ${aspectRatio}. Storefront prompts inside 'storyboardPrompt' MUST strictly end with "--ar ${aspectRatio === "9:16" ? "9:16" : aspectRatio === "16:9" ? "16:9" : "1:1"}".
- The storyboard prompts MUST be written in English.
- The voiceover (voiceover) and on-screen text (textOverlay) MUST be in professional, colloquial, or modern standard Arabic that is simple, persuasive, and matches high-performance ad copy.
- Hook Scene (Scene 1): MUST use an extreme "Pattern Interrupt" (مقاطعة الأنماط البصرية والسمعية) within the first 2 seconds to stop the scroll. The voiceover first sentence must be a captivating hook, accompanied by a shocking or high-contrast macro visual.
- SFX Cue (sfxCue): Write highly specific sound cues in Arabic (e.g., "صوت قرمشة مدوية بطيئة الصدى مع تردد عميق للهواء", "صوت انزلاق قطرات الندى على زجاج بارد ثم تنهيدة انتعاش").

=== UNIFIED STORYBOARD COLLAGE PROMPT GENERATION ===
You MUST generate a master Midjourney/Stable-Diffusion prompt in English under the key 'unifiedStoryboardCollagePrompt'. 
This prompt must request a stunning, high-end, clean cinematic storyboard collage (usually a 3x3 grid or equivalent based on ${sceneCount} frames) that captures the complete video visual arc.
Use the following premium layout structure for 'unifiedStoryboardCollagePrompt':
- **Overall Layout**: "Clean storyboard in a grid with ${sceneCount} equal frames, each frame having --ar ${aspectRatio === "9:16" ? "9:16" : aspectRatio === "16:9" ? "16:9" : "1:1"} aspect ratio, arranged in a unified layout with overall --ar 4:5 (or similar collage format)."
- **Consistency Anchor**: "Use the reference product/packaging image as the primary visual anchor. Maintain the exact same product packaging, colors, brand identity, typography, materials, and lighting across all frames. No modifications to logo or package style."
- **Frame-by-Frame Description**: Step through each of the ${sceneCount} scenes of this script. For each frame, provide a highly cinematic, brief English description of the scene's focus, lighting, and camera angle (e.g., Frame 1: Hero product portrait with warm dramatic rim lighting. Frame 2: Extreme macro of textures and flying particles. Frame 3: Product interaction in clean studio. Frame 4: Dramatic side-profile slow motion detail. Frame 5: High-angle premium CTA layout).
- **Style & Camera**: "Ultra-premium studio commercial photography, high contrast, cinematic chiaroscuro lighting, shallow depth of field, sharp textures, professional color grading, realistic rendering, octan render 3D detail, 8k."
- **Output Constraints**: "Clean editorial collage, no margins, no text, no captions, no numbers, no frames, no borders, no watermarks, perfectly aligned."

=== DETAILED PRODUCT IMAGE ANALYSIS ===
If a product image is uploaded, you MUST perform an expert design audit. Do not just name colors. Extract:
- Exact hex/pantone vibe (e.g., deep cobalt blue with premium matte gold lettering).
- Specific ingredients shown (e.g., fresh lemon wedges, organic sea salt flakes, coffee grounds, mint leaves).
- Lighting reflections (e.g., soft key light bouncing off a glossy glass pump bottle).
Woven these EXACT details into the 'storyboardPrompt' and 'animationPrompt' of EVERY scene where the product is visible to maintain absolute visual consistency.
`;

    let userPrompt = "";

    if (isRegeneration) {
      // Regeneration of specific parts or whole script
      userPrompt = `
We are editing an existing script. 
Here is the original generated script/data:
${JSON.stringify(originalScript, null, 2)}

Instructions for regeneration/editing:
"${regenerationInstructions}"

${targetSceneIndex !== undefined && targetSceneIndex !== -1 
  ? `CRITICAL: You are only regenerating Scene #${targetSceneIndex + 1} (index ${targetSceneIndex}). Keep all other scenes exactly the same as in the original script, but update Scene #${targetSceneIndex + 1} according to the instructions. Make sure the transition feels smooth.`
  : `CRITICAL: You are regenerating the entire script or updating the whole package based on the user instructions.`}

Make sure to return the full populated JSON structure with ${sceneCount || 5} total scenes, matching the schema. Keep unchanged scenes exactly as they were in the original script.
`;
    } else if (inputMode === "reels_idea" && reelsIdea) {
      // Custom Reels Idea Generation and Analysis
      const brandContext = productName ? `The brand/product name is: "${productName}". You MUST use this exact brand/product name in the voiceover, text overlays, and scenes.` : '';
      const ctaContext = cta ? `The Call to Action (CTA) is: "${cta}". You MUST use this exact or a very similar highly persuasive CTA in the final scene.` : '';

      userPrompt = `
Generate a spectacular, brand-new promotional video script and storyboard package with exactly ${sceneCount} scenes, based on the custom REELS/VIDEO IDEA provided below.

=== CUSTOM REELS / VIDEO IDEA TO ANALYZE ===
"${reelsIdea}"

${brandContext ? `=== SPECIFIED BRAND / PRODUCT ===\n${brandContext}\n` : ''}
${ctaContext ? `=== SPECIFIED CALL TO ACTION (CTA) ===\n${ctaContext}\n` : ''}

=== YOUR CORE INSTRUCTIONS ===
1. Analyze the custom Reels/Video Idea. Expertly extract or deduce the product name (use "${productName || 'the product'}" if specified), its type, the unique selling point (USP), target audience, core pain point, and Call to Action (CTA) depicted in the idea (prioritizing the specified brand/product and CTA if provided).
2. Translate the narrative flow, character beats, and visual transitions described in the Reels Idea into exactly ${sceneCount} sequential, professional storyboard scenes.
3. For each scene, write:
   - Voiceover (voiceover) in incredibly punchy, persuasive, colloquial Arabic.
   - Text overlay (textOverlay) in simple, fast-pacing Arabic text.
   - A stunning visual prompt for Midjourney (storyboardPrompt) in English.
   - A motion prompt for Runway/Luma (animationPrompt) in English.
   - Professional sound cues (sfxCue) in Arabic.

${imageAnalysisInstruction}

=== STRICT LOCATION & ENVIRONMENTAL CONSISTENCY (توحيد بيئة وجو الإعلان) ===
- Every single storyboard prompt MUST place the product, characters, and scene in the EXACT same physical location, set, backdrop, or studio environment (e.g., shot entirely in a single high-end modern kitchen setup, or shot entirely in a cozy warm living room, or shot entirely in a professional luxury dark studio stage, matching the context of the Reels Idea).
- You are STRICTLY FORBIDDEN from jumping between different locations (e.g. do NOT put Scene 1 in a kitchen, Scene 2 on a beach, Scene 3 in a laboratory). Keep the setting completely unified as if it was shot sequentially during the exact same video shoot.
- Only change camera angles, zoom depths (macro, extreme close-up, panning, tracking), and the motion of the products, characters, or ingredients within that same unified space.

=== STRUCTURE ===
- Return EXACTLY ${sceneCount} scenes.
- Scene 1: The Hook. Bring the dramatic hook or starting conflict of the Reels Idea (e.g. the shock of opening the bill, or the pile of dirty dishes) to life instantly with intense facial expression description and camera angles.
- Scenes 2-${sceneCount - 1}: The Experience / Solution. Smoothly transition to showing the product (e.g. Evvoli AC, Evvoli Dishwasher, etc.) resolving the pain point with satisfying visual feedback.
- Scene ${sceneCount}: Climax & CTA. Strong closing shot highlighting the brand name, product, and call to action on screen.

Ensure your entire output strictly conforms to the JSON schema. All Arabic text must be simple, beautifully selling, and extremely persuasive!
`;
    } else {
      // Fresh Generation from product details
      userPrompt = `
Generate a spectacular, brand-new promotional video script and storyboard package with exactly ${sceneCount} scenes.

PRODUCT METADATA:
- Product Name: "${productName || "المنتج الجديد"}"
- Product Type/Category: "${productType || "عام"}"
- Unique Selling Point: "${usp || "مستخلص من مواصفات طبيعية بجودة متفوقة"}"
- Target Audience: "${targetAudience || "الجميع"}"
- Pain Point: "${painPoint || "البحث عن الجودة والتميز بسعر عادل"}"
- CTA: "${cta || "اطلب الآن عبر موقعنا الإلكتروني"}"

${imageAnalysisInstruction}

=== GENERATION & STRUCTURE REQUIREMENTS ===
- Return EXACTLY ${sceneCount} scenes.
- Visual Atmosphere: "${visualAtmosphere}". This exact location background, lighting setup, and atmospheric mood MUST be identical across all ${sceneCount} scenes. Every storyboard prompt must place the product or characters on the exact same physical stage or in the exact same room setup. Do NOT change the location from scene to scene. Only vary camera angles, zoom depths, and dynamic fluid/ingredient motions within this same space.
- Tone of Voice: Deeply persuasive, natural, simple, and exciting. Speak to the target audience on an emotional level.
- Scene 1: **The Hook**. Use a powerful hook type: "${selectedHook.name}". Introduce a captivating hook and eye-popping visual immediately.
- Scenes 2-${sceneCount - 1}: **The Experience/Solution**. Focus on sensory details, product quality, macro textures (e.g., flavor particles flying, smooth texture blending on skin, premium glass bottle rotating in slow motion), and resolving the target audience's pain point.
- Scene ${sceneCount}: **The Climax & CTA**. Strong final shot of the product with the exact Call to Action: "${cta}" displayed cleanly on the screen.

Ensure your entire output strictly conforms to the JSON schema. All Arabic text must be simple, stunningly creative, and incredibly persuasive!
`;
    }

    parts.push({ text: userPrompt });

    // Call the Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parts,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["productAnalysis", "selectedHookExplanation", "visualAtmosphere", "scenes", "unifiedStoryboardCollagePrompt"],
          properties: {
            productAnalysis: {
              type: Type.STRING,
              description: "Detailed analysis of the product's visual style, colors, container elements, and aesthetic identifiers in Arabic."
            },
            selectedHookExplanation: {
              type: Type.STRING,
              description: "Explanation of how the chosen hook is woven into the intro scene in Arabic."
            },
            visualAtmosphere: {
              type: Type.STRING,
              description: "The stylistic mood used for the scenes, including details about materials, lighting, and speed."
            },
            unifiedStoryboardCollagePrompt: {
              type: Type.STRING,
              description: "A highly detailed, professional master English Midjourney prompt requesting a unified storyboard collage grid (e.g., 3x3) representing all scenes with consistent characters/products, same packaging, colors, lighting, clean style."
            },
            scenes: {
              type: Type.ARRAY,
              description: "List of scenes forming the storyboard and video script.",
              items: {
                type: Type.OBJECT,
                required: ["sceneNumber", "voiceover", "textOverlay", "storyboardPrompt", "animationPrompt", "sfxCue"],
                properties: {
                  sceneNumber: {
                    type: Type.INTEGER,
                    description: "Sequential scene index starting from 1."
                  },
                  voiceover: {
                    type: Type.STRING,
                    description: "Voiceover script in punchy, highly professional Arabic. Must match the visual pacing."
                  },
                  textOverlay: {
                    type: Type.STRING,
                    description: "Text shown on-screen in Arabic. Short, punchy, visually striking."
                  },
                  storyboardPrompt: {
                    type: Type.STRING,
                    description: "Highly detailed English prompt for image generation models (like Midjourney). Must describe the scene visually, colors, lighting, camera angle, and end with --ar aspect ratio."
                  },
                  animationPrompt: {
                    type: Type.STRING,
                    description: "Runway/Luma camera movement and particle animation instructions in English. E.g., 'Slow zoom, rotating product, flying salt crystals, volumetric lighting, photorealistic, 4k'."
                  },
                  sfxCue: {
                    type: Type.STRING,
                    description: "Audio sound effects (SFX) cue or music style transition in Arabic (e.g. صوت فتح عبوة غازية منعشة، موسيقى سريعة حماسية)."
                  }
                }
              }
            }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini API");
    }

    const parsedData = JSON.parse(responseText.trim());
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Gemini Promo Script Generation Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب وتوليد السكربت. الرجاء المحاولة مرة أخرى.", details: error.message },
      { status: 500 }
    );
  }
}
