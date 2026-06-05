/**
 * Shared library of characters and styles for all books.
 *
 * To regenerate any asset, delete its folder under data/character-cache/
 * and run any book that uses it — the cache will regenerate it on demand.
 */

import { type CharacterSpec, type StyleSpec } from "./asset-cache";

// ============================================================================
// Styles
// ============================================================================

export const STYLE_PAW_PATROL: StyleSpec = {
  id: "paw-patrol-cartoon",
  description:
    "Bright, cheerful, clean cartoon children's picture-book illustration. " +
    "Simple rounded shapes, bold friendly outlines, sunny colourful palette " +
    "(bright blues, reds, yellows, greens), flat cel-shading with soft gentle " +
    "gradients, warm even lighting, a consistent animation-style line-weight. " +
    "Warm and inviting mood, cute toddler-friendly aesthetic.",
  referencePrompt:
    "A sample illustration in the target art style: bright cheerful cartoon " +
    "children's picture-book illustration. A small cartoon puppy in a " +
    "colourful rescue uniform sits on a green grassy hill under a sunny blue " +
    "sky with puffy white clouds. Simple rounded shapes, clean animation-style " +
    "line-work, bright primary colours, gentle flat shading with soft gradients. " +
    "Cheerful, inviting, toddler-friendly. No text, no words, no letters.",
  quality: "high",
  size: "1024x1024",
};

export const STYLE_COZY_WATERCOLOUR: StyleSpec = {
  id: "cozy-watercolour",
  description:
    "Classic children's picture-book illustration in a soft pastel-and-" +
    "airbrush style with a pronounced warm grainy pencil/pastel texture " +
    "(like colored-pencil and chalk-pastel layered together). Characters " +
    "have cute, gentle, slightly chubby proportions: oversized round heads, " +
    "small rounded bodies, soft rosy-pink cheeks, a big round pink-orange " +
    "button nose, very small simple closed or gently squinting peaceful eyes " +
    "(often just a short curved line or a simple round pupil), and little " +
    "tufts of hair or rounded ears. Outlines are minimal and soft — shapes " +
    "are defined by rounded silhouettes and gentle tonal shading rather " +
    "than hard black lines. Rich cinematic lighting with clear warm " +
    "light-sources (lanterns, windows, a moon) glowing amber/gold against " +
    "cooler environments. Moody limited palette — deep dusk blues, soft " +
    "purples and plums, warm browns, amber highlights, creamy flesh tones. " +
    "Daytime scenes use muted warm pastels instead of dusk blues. Tender, " +
    "reassuring, old-fashioned bedtime-storybook feeling. Absolutely no " +
    "hard cel-shading, no outlined cartoons, no modern vector look.",
  referencePrompt:
    "A single picture-book illustration demonstrating the target art " +
    "style. Scene: a cozy old cottage window at dusk, warm golden lantern-" +
    "light glowing through the window-panes, against a deep dusk-blue " +
    "starry sky with wisps of soft pastel cloud. A small cute round cartoon " +
    "fox cub with a big oversized head, rosy circular cheeks, a round " +
    "pink-orange button nose, small closed peaceful eyes (just short curved " +
    "lines), tiny rounded ears, and a small rounded body in soft russet-" +
    "orange fur is sitting peacefully on the front step beneath the window, " +
    "bathed in a warm amber glow. Render everything in a soft airbrushed " +
    "pastel-and-coloured-pencil style with a pronounced warm grainy texture " +
    "overlaying the whole image. No hard black outlines — shapes defined by " +
    "soft silhouettes and gentle tonal gradients. Palette: deep dusk blues, " +
    "soft purples, warm browns, amber glows, creamy highlights. Tender, " +
    "reassuring, cinematic storybook mood. No text, no words, no letters, " +
    "no labels.",
  quality: "high",
  size: "1024x1024",
};

export const STYLE_CLEAN_PRINT_CARTOON: StyleSpec = {
  id: "clean-print-cartoon",
  description:
    "Bright, clean cartoon children's picture-book illustration designed to " +
    "print clearly at small booklet size. Use simple rounded shapes, clear " +
    "friendly dark-orange/brown outlines, flat cheerful colours, very light " +
    "cel shading, and high separation between characters and background. " +
    "Minimal texture, no watercolor wash, no grainy pencil overlay, no soft " +
    "hazy edges. Backgrounds should be simple, uncluttered, and readable. " +
    "Warm toddler-friendly mood with expressive faces and bold silhouettes.",
  referencePrompt:
    "A sample illustration in the target art style: bright clean cartoon " +
    "children's picture-book illustration designed for small printed pages. " +
    "A cheerful little tiger cub stands beside a shiny red wagon on a simple " +
    "green lawn under a blue sky with two puffy clouds. Use bold friendly " +
    "dark-orange/brown outlines, flat cheerful colours, simple rounded " +
    "shapes, very light cel shading, crisp edges, high contrast, and an " +
    "uncluttered background. Minimal texture. No watercolor wash, no grainy " +
    "pencil overlay, no hazy airbrush, no text, no words, no letters.",
  quality: "high",
  size: "1024x1024",
};

// ============================================================================
// Characters — Paw Patrol series
// ============================================================================

export const CHAR_CHASE: CharacterSpec = {
  id: "chase",
  style: STYLE_PAW_PATROL.id,
  description:
    "A cheerful cartoon German Shepherd puppy named Chase with tan-and-black " +
    "fur, big warm brown eyes, a friendly confident smile, wearing a blue " +
    "police officer uniform, a blue peaked police cap, and a tiny silver badge " +
    "on his chest.",
};

export const CHAR_MARSHALL: CharacterSpec = {
  id: "marshall",
  style: STYLE_PAW_PATROL.id,
  description:
    "A cheerful cartoon Dalmatian puppy named Marshall with white fur covered " +
    "in black spots, big round amber eyes, a goofy friendly grin, wearing a " +
    "bright red firefighter jacket and a matching red firefighter helmet.",
};

export const CHAR_SKYE: CharacterSpec = {
  id: "skye",
  style: STYLE_PAW_PATROL.id,
  description:
    "A cute cartoon cream-coloured cockapoo puppy girl named Skye with a tuft " +
    "of pink hair between her ears, bright round blue eyes, a sweet cheerful " +
    "smile, wearing pink flight goggles pushed up on her forehead and a " +
    "purple flight-suit with tiny pink propeller wings on her back.",
};

export const CHAR_RUBBLE: CharacterSpec = {
  id: "rubble",
  style: STYLE_PAW_PATROL.id,
  description:
    "A happy cartoon tan English Bulldog puppy named Rubble with a chunky " +
    "build, big round eyes, a big dimpled smile with his tongue sticking out " +
    "slightly, wearing a bright yellow construction hardhat and a yellow " +
    "tool belt around his middle.",
};

export const CHAR_ROCKY: CharacterSpec = {
  id: "rocky",
  style: STYLE_PAW_PATROL.id,
  description:
    "A clever cartoon mixed-breed puppy named Rocky with soft grey-and-white " +
    "fur, floppy ears, warm brown eyes, a sideways cheerful smile, wearing a " +
    "bright green recycling vest with a circular recycling emblem and a " +
    "matching small green cap.",
};

export const CHAR_ZUMA: CharacterSpec = {
  id: "zuma",
  style: STYLE_PAW_PATROL.id,
  description:
    "A friendly cartoon chocolate Labrador puppy named Zuma with deep-brown " +
    "fur, big warm brown eyes, an easy relaxed smile, wearing bright orange " +
    "water-rescue gear including an orange life vest and an orange helmet.",
};

export const CHAR_RYDER: CharacterSpec = {
  id: "ryder",
  style: STYLE_PAW_PATROL.id,
  description:
    "A friendly cartoon boy named Ryder, about ten years old, with tan skin, " +
    "short neat brown hair, bright blue eyes, a warm smile, wearing a red " +
    "and blue zip-up vest over a dark blue long-sleeved shirt, dark blue " +
    "jeans, and white-and-red sneakers.",
};

export const CHAR_HATTIE_HEN: CharacterSpec = {
  id: "hattie-hen",
  style: STYLE_PAW_PATROL.id,
  description:
    "A plump motherly brown hen named Hattie with soft brown body feathers " +
    "tipped in white, a bright red comb on top of her head, a small yellow " +
    "beak, kind round dark eyes, and a caring expression.",
};

export const CHAR_CHICK: CharacterSpec = {
  id: "chick",
  style: STYLE_PAW_PATROL.id,
  description:
    "A tiny fluffy yellow baby chick with soft downy feathers, big round " +
    "dark eyes, a tiny orange beak and matching orange feet, an innocent " +
    "curious expression.",
};

export const CHAR_FARMER_GIRL: CharacterSpec = {
  id: "farmer-girl",
  style: STYLE_PAW_PATROL.id,
  description:
    "A kind farm girl about ten years old with fair freckled skin, long " +
    "red-brown braided pigtails, bright hazel eyes, wearing blue denim " +
    "overalls over a red-and-white checked shirt, simple brown boots, and a " +
    "wide straw sun-hat. She carries a small wooden basket.",
};

export const CHAR_PIGLET: CharacterSpec = {
  id: "piglet",
  style: STYLE_PAW_PATROL.id,
  description:
    "A small round baby piglet with pale pink skin, tiny floppy ears, a " +
    "curly little tail, soft dark eyes, a small snub snout, and a mischievous " +
    "but innocent expression. Often has faint strawberry-red stains around " +
    "its mouth.",
};

export const CHAR_RACCOON: CharacterSpec = {
  id: "raccoon",
  style: STYLE_PAW_PATROL.id,
  description:
    "A small cute cartoon raccoon with soft grey fur, a fluffy black-and-white " +
    "ringed tail, a black bandit-style mask around big dark eyes, tiny pink " +
    "paws, a little pink nose, and a shy-but-sweet expression.",
};

// ============================================================================
// Characters — Tiger family (Zephyr series)
// ============================================================================

export const CHAR_ZEPHYR_TIGER: CharacterSpec = {
  id: "zephyr-tiger",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A little boy tiger cub named Zephyr, about 3-and-a-half years old, " +
    "rendered in a soft pastel/airbrushed storybook style with a warm " +
    "grainy texture. Oversized round head, small rounded body, soft warm " +
    "orange-and-cream fur with gentle dark stripes, tiny rounded ears, big " +
    "rosy-pink circular cheeks, a round pink-orange button nose, small " +
    "peaceful eyes (short closed or gently squinting curved lines), a tiny " +
    "sweet smile. Gentle pastel tones, minimal outlines, tender old-fashioned " +
    "picture-book feeling. He is the older brother — a little taller than " +
    "his baby brother.",
  referenceHint:
    "Full-body character page on a plain warm cream background. Use the same exact tiger-family design language as Auggie, Mommy, and Daddy: same orange-and-cream fur palette, same stripe softness, same round button nose, same rosy cheeks, same plush proportions. Eyes open as simple dark friendly oval dots. Centered, front-facing, standing, arms relaxed, no pose cropping.",
};

export const CHAR_AUGGIE_TIGER: CharacterSpec = {
  id: "auggie-tiger",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A very small baby tiger toddler named Auggie, about 1-and-a-half " +
    "years old, rendered in a soft pastel/airbrushed storybook style with " +
    "a warm grainy texture. Extra-oversized round head, tiny stubby rounded " +
    "body, soft bright orange-cream fur with gentle dark stripes, tiny " +
    "rounded ears, very rosy circular cheeks, a small round pink-orange " +
    "button nose, tiny peaceful eyes (just short curved lines), an innocent " +
    "sleepy-sweet expression. Noticeably smaller than his big brother " +
    "Zephyr. Soft pastel colours, minimal outlines, tender storybook mood.",
  referenceHint:
    "Full-body character page on a plain warm cream background. Use the same exact tiger-family design language as Zephyr, Mommy, and Daddy: same orange-and-cream fur palette, same stripe softness, same round button nose, same rosy cheeks, same plush proportions. Eyes open as simple dark friendly oval dots. Centered, front-facing, sitting like a baby who cannot walk yet, no pose cropping.",
};

export const CHAR_MOMMY_TIGER: CharacterSpec = {
  id: "mommy-tiger",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A pretty, gentle mother tigress named Mommy, rendered in a soft pastel/" +
    "airbrushed storybook style with a warm grainy texture. Graceful medium " +
    "adult storybook proportions: larger than the cubs, softly curved and " +
    "elegant, with a normal gentle build, not fat, not bulky, not skinny. " +
    "Warm orange-and-cream fur with soft dark stripes, a round pink-orange " +
    "button nose, bright kind eyes with small soft lashes, rosy cheeks, a " +
    "small white flower tucked behind one ear, a loving warm expression. " +
    "Tender, maternal, pretty, old-fashioned picture-book feeling.",
  referenceHint:
    "Full-body character page on a plain warm cream background. Use the same exact tiger-family design language as Zephyr, Auggie, and Daddy: same orange-and-cream fur palette, same stripe softness, same round button nose, same rosy cheeks. Mommy should be pretty and warm with open kind dark eyes, small soft lashes, and a white flower behind one ear. She has a graceful medium adult build with a defined neck and shoulders, softly curved but not fat, not bulky, not pear-shaped, not huge. Centered, front-facing, sitting gracefully, no pose cropping.",
};

export const CHAR_DADDY_TIGER: CharacterSpec = {
  id: "daddy-tiger",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A kind father tiger named Daddy, rendered in a soft pastel/airbrushed " +
    "storybook style with a warm grainy texture. Tall gentle dad storybook " +
    "proportions: the largest of the family, but soft and average-built, not " +
    "muscular, not bulky, not barrel-chested, not bodybuilder-like. Rich warm " +
    "orange fur with soft dark stripes, a round pink-orange button nose, small " +
    "peaceful eyes (short curved lines), rosy cheeks, a warm protective smile. " +
    "Soft pastel tones, minimal outlines, gentle storybook warmth.",
  referenceHint:
    "Full-body character page on a plain warm cream background. Use the same exact tiger-family design language as Zephyr, Auggie, and Mommy: same orange-and-cream fur palette, same stripe softness, same round button nose, same rosy cheeks. Eyes open as simple dark friendly oval dots. Daddy is the tallest tiger with a relaxed average dad build: not muscular, not bulky, not huge, not bodybuilder-like, no broad chest, no thick arms. Centered, front-facing, standing naturally, arms relaxed, no pose cropping.",
};

export const CHAR_ZEPHYR_TIGER_CARTOON: CharacterSpec = {
  id: "zephyr-tiger-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A little boy tiger cub named Zephyr, about 3-and-a-half years old, in a " +
    "clean print-friendly cartoon picture-book style. Rounded head, small " +
    "child body, warm orange-and-cream fur, clear dark stripes, big friendly " +
    "open dark oval eyes, rosy cheeks, a round pink-orange button nose, and a " +
    "sweet smile. He is taller than his baby brother Auggie. Bold readable " +
    "outline, flat cheerful colours, minimal texture.",
  referenceHint:
    "Full-body character page on a plain white background. Use clean bold outlines, flat cheerful colours, crisp edges, open friendly dark oval eyes, and the same tiger-family design language as Auggie, Mommy, and Daddy. Centered, front-facing, standing, arms relaxed, no pose cropping, no text.",
};

export const CHAR_AUGGIE_TIGER_CARTOON: CharacterSpec = {
  id: "auggie-tiger-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A very small baby tiger toddler named Auggie, about 1-and-a-half years " +
    "old, in a clean print-friendly cartoon picture-book style. Extra round " +
    "head, tiny seated baby body, warm orange-and-cream fur, clear dark " +
    "stripes, open friendly dark oval eyes, rosy cheeks, a round pink-orange " +
    "button nose, and a sleepy sweet smile. Much smaller than Zephyr. Bold " +
    "readable outline, flat cheerful colours, minimal texture.",
  referenceHint:
    "Full-body character page on a plain white background. Use clean bold outlines, flat cheerful colours, crisp edges, open friendly dark oval eyes, and the same tiger-family design language as Zephyr, Mommy, and Daddy. Centered, front-facing, sitting like a baby who cannot walk yet, no pose cropping, no text.",
};

export const CHAR_MOMMY_TIGER_CARTOON: CharacterSpec = {
  id: "mommy-tiger-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A pretty gentle mother tigress named Mommy, in a clean print-friendly " +
    "cartoon picture-book style. Graceful medium adult build, warm " +
    "orange-and-cream fur, clear dark stripes, kind open dark eyes with small " +
    "soft lashes, rosy cheeks, a round pink-orange button nose, a small white " +
    "flower behind one ear, and a warm loving expression. Not fat, not bulky, " +
    "not skinny. Bold readable outline, flat cheerful colours, minimal texture.",
  referenceHint:
    "Full-body character page on a plain white background. Use clean bold outlines, flat cheerful colours, crisp edges, and the same tiger-family design language as Zephyr, Auggie, and Daddy. Mommy is pretty and warm, graceful medium adult build, white flower behind one ear. Centered, front-facing, sitting gracefully, no pose cropping, no text.",
};

export const CHAR_DADDY_TIGER_CARTOON: CharacterSpec = {
  id: "daddy-tiger-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A kind father tiger named Daddy, in a clean print-friendly cartoon " +
    "picture-book style. Tall gentle dad build, warm orange-and-cream fur, " +
    "clear dark stripes, open friendly dark oval eyes, rosy cheeks, a round " +
    "pink-orange button nose, and a warm protective smile. Average soft dad " +
    "build: not muscular, not bulky, not huge. Bold readable outline, flat " +
    "cheerful colours, minimal texture.",
  referenceHint:
    "Full-body character page on a plain white background. Use clean bold outlines, flat cheerful colours, crisp edges, and the same tiger-family design language as Zephyr, Auggie, and Mommy. Daddy is the tallest tiger with a relaxed average dad build, not muscular, no broad chest, no thick arms. Centered, front-facing, standing naturally, arms relaxed, no pose cropping, no text.",
};

export const ASSET_DIRTY_BLUE_FAMILY_CAR_CARTOON: CharacterSpec = {
  id: "dirty-blue-family-car-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable vehicle object reference: the exact same tiger-family bright " +
    "blue compact family car as the clean car reference, but before the car " +
    "wash. Same rounded friendly cartoon shape, same four doors, same tan " +
    "seats, same large clear windows, same black tires, same silver hubcaps. " +
    "The car is clearly dirty but still visibly blue: simple brown mud " +
    "splashes on the doors and lower panels, dusty windows, muddy wheels, and " +
    "a few leaf marks. No tigers, no people, no driver, no text.",
  referenceHint:
    "Object reference page on a plain white background. Draw only the single bright blue dirty compact family car, no tigers and no people. Show the entire car in a clean side/front three-quarter view with all four wheels visible and no cropping. Use bold readable outlines, flat cheerful colours, crisp edges, high contrast, and minimal texture. The car should look dirty with brown mud splashes, dusty windows, muddy wheels, and a few leaves. No text.",
};

export const ASSET_CLEAN_BLUE_FAMILY_CAR_CARTOON: CharacterSpec = {
  id: "clean-blue-family-car-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable vehicle object reference: the tiger family's bright blue " +
    "compact family car after the car wash, used as the base vehicle identity " +
    "for both clean and dirty versions. Rounded friendly cartoon shape, four " +
    "doors, four visible wheels when shown from the side, tan seats, large " +
    "clear windows, black tires, silver hubcaps. The car is clean and shiny " +
    "with crisp blue paint, clear windows, clean wheels, and a few simple " +
    "sparkle highlights. No mud, no dirt, no leaves, no tigers, no people, no " +
    "driver, no text.",
  referenceHint:
    "Object reference page on a plain white background. Draw only the single bright blue clean compact family car, no tigers and no people. Show the entire car in a clean side/front three-quarter view with all four wheels visible and no cropping. Use bold readable outlines, flat cheerful colours, crisp edges, high contrast, and minimal texture. The car should look freshly washed, clean, and shiny with a few simple sparkle highlights. No text.",
};

export const ASSET_PARTLY_CLEAN_BLUE_FAMILY_CAR_CARTOON: CharacterSpec = {
  id: "partly-clean-blue-family-car-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable vehicle object reference: the exact same tiger-family bright " +
    "blue compact family car during the car wash, halfway cleaned. Same car " +
    "shape and details as the clean and dirty car references. The front and " +
    "upper panels are clean bright blue and shiny, while the rear/lower " +
    "panels and wheels still have brown mud. A clear boundary shows the car " +
    "being cleaned: soap foam and water streaks between the clean blue areas " +
    "and dirty muddy areas. No tigers, no people, no driver, no text.",
  referenceHint:
    "Object reference page on a plain white background. Draw only the single bright blue compact family car, no tigers and no people. Show the entire car in the same clean side/front three-quarter view as the clean and dirty car references, with all four wheels visible and no cropping. The car is halfway cleaned: front and upper panels clean and shiny, rear/lower panels and wheels still muddy, with a clear band of soap foam and water streaks showing the cleaning transition. No text.",
};

export const ASSET_RED_GROCERY_CART_CARTOON: CharacterSpec = {
  id: "red-grocery-cart-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable object reference: the exact same small red grocery cart " +
    "used by the tiger family at the grocery store. Child-sized friendly " +
    "cart proportions, bright red rounded handle, red lower frame, simple " +
    "silver wire basket, four small grey wheels, and a built-in child seat " +
    "at the handle end where baby Auggie can sit. Clean print-friendly " +
    "cartoon style with bold readable outlines, flat cheerful colours, " +
    "crisp edges, and minimal texture. No tigers, no people, no food, no " +
    "text.",
  referenceHint:
    "Object reference page on a plain white background. Draw only the " +
    "single red grocery cart, no tigers and no people. Show the entire cart " +
    "in a clean side/front three-quarter view with all four wheels visible, " +
    "the red handle, silver basket, red lower frame, and child seat clearly " +
    "visible. No cropping, no food, no text.",
};

export const CHAR_LITTLE_DUCK: CharacterSpec = {
  id: "little-duck",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A small yellow duckling, rendered in a soft pastel/airbrushed " +
    "storybook style with a warm grainy texture. Oversized round head, " +
    "small rounded body, soft fluffy yellow down, a tiny round pink-orange " +
    "button beak (small and rounded, not pointy), tiny rounded orange feet, " +
    "small peaceful eyes (just short curved lines), a sweet helpful " +
    "expression. Gentle pastel tones, minimal outlines.",
};

// ============================================================================
// Characters — Milo book
// ============================================================================

export const CHAR_MILO_TIGER: CharacterSpec = {
  id: "milo-tiger",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A baby tiger cub named Milo, rendered in a soft pastel/airbrushed " +
    "storybook style with a warm grainy texture. Oversized round head, " +
    "tiny rounded body, soft orange-and-cream fur with gentle dark stripes, " +
    "tiny rounded ears, big rosy-pink circular cheeks, a round pink-orange " +
    "button nose, small peaceful eyes (short gently curved closed lines), " +
    "a sweet shy smile. Soft pastel tones, minimal outlines.",
};

export const CHAR_MILO_MOTHER: CharacterSpec = {
  id: "milo-mother",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A kind mother tigress (Milo's mother) in a soft pastel/airbrushed " +
    "storybook style with a warm grainy texture. Gentle rounded storybook " +
    "proportions, warm orange-and-white fur, soft dark stripes, a round " +
    "pink-orange button nose, softly closed eyes with long quiet lashes, " +
    "rosy cheeks, a loving caring expression. Tender and maternal.",
};

export const CHAR_MILO_BROTHER: CharacterSpec = {
  id: "milo-brother",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A slightly larger tiger cub (Milo's older brother) in the same soft " +
    "pastel/airbrushed storybook style with warm grainy texture. Oversized " +
    "round head, rounded body a bit bigger than Milo, orange-and-cream fur " +
    "with gentle dark stripes, rosy cheeks, round pink-orange button nose, " +
    "small peaceful eyes, a playful gentle smile.",
};

export const CHAR_MILO_DEER: CharacterSpec = {
  id: "milo-deer",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A tall friendly deer in a soft pastel/airbrushed storybook style with " +
    "a warm grainy texture. Cute rounded storybook proportions, soft tan " +
    "fur with faint white belly, small rounded antlers, a round pink-orange " +
    "button nose, rosy cheeks, gentle softly-closed or squinting peaceful " +
    "eyes, a kind caring expression.",
};

export const CHAR_MILO_EAGLE: CharacterSpec = {
  id: "milo-eagle",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A friendly bald eagle in a soft pastel/airbrushed storybook style " +
    "with a warm grainy texture. Round cute storybook proportions, a soft " +
    "white rounded head, a small rounded golden-orange beak, warm brown " +
    "body feathers with a hint of russet, rosy cheeks, small peaceful " +
    "eyes, a kind gentle expression. Wings can be shown outstretched but " +
    "still cute and rounded rather than sharp or realistic.",
};

// ============================================================================
// Characters — Rocco book
// ============================================================================

export const CHAR_ROCCO_PUP: CharacterSpec = {
  id: "rocco-pup",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A small puppy named Rocco in a soft pastel/airbrushed storybook style " +
    "with a warm grainy texture. Oversized round head, rounded chubby " +
    "body, soft tan-and-cream fur, floppy rounded ears, a round pink-orange " +
    "button nose, small peaceful eyes (short gently closed curves), rosy " +
    "cheeks, a little red collar, a sweet shy smile.",
};

export const CHAR_ROCCO_MOM: CharacterSpec = {
  id: "rocco-mom",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "Rocco's mother, a gentle golden retriever, in a soft pastel/" +
    "airbrushed storybook style with a warm grainy texture. Rounded " +
    "storybook proportions (larger than Rocco but still cute and rounded), " +
    "soft warm-golden fur, long floppy ears, a round pink-orange button " +
    "nose, softly closed or squinting peaceful eyes, rosy cheeks, a warm " +
    "loving expression.",
};

export const CHAR_MEG_SHEPHERD: CharacterSpec = {
  id: "meg-shepherd-girl",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A kind young shepherd girl named Meg, about 10 years old, in a soft " +
    "pastel/airbrushed storybook style with a warm grainy texture. " +
    "Storybook proportions with a rounded friendly face, soft fair skin " +
    "with rosy round cheeks, a round pink-orange button nose, small " +
    "peaceful eyes (short curved lines), long brown braided pigtails tied " +
    "with small ribbons, wearing a bright red hooded raincoat and brown " +
    "rubber boots, often carrying a small warm-glowing lantern. Gentle " +
    "caring expression.",
};

export const CHAR_ROCCO_DEER: CharacterSpec = {
  id: "rocco-deer",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A tall friendly deer in a soft pastel/airbrushed storybook style " +
    "with a warm grainy texture. Cute rounded storybook proportions, warm " +
    "tan fur with faint white markings, small rounded antlers, a round " +
    "pink-orange button nose, rosy cheeks, softly-closed gentle eyes, a " +
    "kind caring expression.",
};

export const CHAR_ROCCO_DUCK: CharacterSpec = {
  id: "rocco-duck",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A plump forest duck in a soft pastel/airbrushed storybook style with " +
    "a warm grainy texture. Oversized round head, rounded fluffy body, " +
    "soft white feathers, a small rounded pink-orange button beak (not " +
    "pointy), tiny rounded orange feet, rosy cheeks, small peaceful eyes " +
    "(just short curved lines), a friendly expression.",
};

// ============================================================================
// Characters — Harry book
// ============================================================================

export const CHAR_BABY_HARRY: CharacterSpec = {
  id: "baby-harry",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A small baby boy named Harry in a soft pastel/airbrushed storybook " +
    "style with a warm grainy texture. Oversized round head, chubby soft " +
    "cheeks with a rosy blush, a tiny spike-tuft of soft brown hair on top, " +
    "a small round pink-orange button nose, softly closed peaceful eyelids " +
    "(short gently curved lines), a tender sleeping expression. Snugly " +
    "wrapped in a soft pale-blue blanket. Tender, cinematic storybook mood.",
};

export const CHAR_YOUNG_HARRY: CharacterSpec = {
  id: "young-harry",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A small young boy named Harry, about 5 years old, in a soft pastel/" +
    "airbrushed storybook style with a warm grainy texture. Cute rounded " +
    "storybook proportions: oversized round head, small rounded body, very " +
    "rosy circular cheeks, a small round pink-orange button nose, gentle " +
    "softly-closed or quietly-blinking peaceful eyes (short curved lines), " +
    "a soft tousled mop of dark-brown hair, wearing a slightly-too-big " +
    "pale-grey jumper and dark trousers and small soft brown shoes. A " +
    "gentle thoughtful expression — a quiet kind little boy.",
};

export const CHAR_COUSIN_DUDLEY: CharacterSpec = {
  id: "cousin-dudley",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A round chubby young boy named Dudley, about 5 years old (Harry's " +
    "cousin), in a soft pastel/airbrushed storybook style with a warm " +
    "grainy texture. Cute rounded storybook proportions: very oversized " +
    "round head, plump round body (notably chubbier than Harry), very " +
    "rosy round cheeks, a small round pink-orange button nose, small " +
    "peaceful eyes, a small fluff of soft pale-blonde hair, wearing a " +
    "bright striped red-and-white jumper and dark blue shorts. A spoiled-" +
    "but-still-cute pouty expression.",
};

export const CHAR_MAGICIAN: CharacterSpec = {
  id: "magician",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A kind elderly wise man in a soft pastel/airbrushed storybook style " +
    "with a warm grainy texture. Cute rounded storybook proportions: " +
    "oversized round head, small rounded body, rosy round cheeks, a round " +
    "pink-orange button nose, small gently squinting peaceful eyes behind " +
    "tiny round silver spectacles perched on the tip of his nose, a long " +
    "flowing soft-white beard reaching to his chest, long soft-white hair " +
    "past his shoulders, a deep-purple robe and matching tall gently-" +
    "drooping pointed hat, a warm grandfatherly expression. Tender " +
    "storybook feeling, cinematic pastel lighting.",
};

export const CHAR_BIG_MAN: CharacterSpec = {
  id: "big-man",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A very tall, very broad gentle man in a soft pastel/airbrushed " +
    "storybook style with a warm grainy texture. Cute rounded storybook " +
    "proportions but clearly much larger than an ordinary adult — roughly " +
    "twice as tall and broad. Oversized round head, rosy round cheeks, a " +
    "big round pink-orange button nose, small gently-squinting peaceful " +
    "eyes, a huge bushy soft dark-brown beard surrounding most of his face " +
    "and flowing onto his chest, tangled shoulder-length dark-brown hair, " +
    "a heavy long warm-brown travelling coat with many pockets, sturdy " +
    "boots, a wide soft gentle smile. Towering but friendly and warm.",
};

export const CHAR_SNOWY_OWL: CharacterSpec = {
  id: "snowy-owl",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A plump snowy owl in a soft pastel/airbrushed storybook style with a " +
    "warm grainy texture. Oversized round head, small rounded body, soft " +
    "white feathers with gentle pale-grey speckling on wings, a tiny " +
    "rounded pink-orange button beak (not pointy), rosy cheeks, small " +
    "peaceful amber-golden eyes (just short softly-closed curves), a calm " +
    "wise expression.",
};

export const CHAR_MOTHER_DURSLEY: CharacterSpec = {
  id: "mother-dursley",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A thin neat middle-aged woman in a soft pastel/airbrushed storybook " +
    "style with a warm grainy texture. Cute rounded storybook proportions " +
    "with a friendly softened face, fair skin with rosy round cheeks, a " +
    "small round pink-orange button nose, small peaceful eyes (short " +
    "gently curved lines), long straight soft-blonde hair pulled back, " +
    "wearing a trim pastel-pink morning robe over a nightdress, a gentle " +
    "surprised-but-tender expression.",
};

export const CHAR_FATHER_DURSLEY: CharacterSpec = {
  id: "father-dursley",
  style: STYLE_COZY_WATERCOLOUR.id,
  description:
    "A large round-bellied middle-aged man in a soft pastel/airbrushed " +
    "storybook style with a warm grainy texture. Cute rounded storybook " +
    "proportions, fair skin with ruddy round rosy cheeks, a big round " +
    "pink-orange button nose, small gently-closed peaceful eyes, a thick " +
    "soft walrus-style dark-brown moustache, very little hair on top of " +
    "his head with a fringe of dark-brown hair around the sides, wearing " +
    "rumpled pale-blue striped pajamas and a plain warm-brown dressing-" +
    "gown, a friendly-if-bewildered gentle expression.",
};
