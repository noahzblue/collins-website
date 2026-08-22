/**
 * Content collections.
 *
 * `equipment` — the twelve categories Collins sells and rents, with their
 * size/rating ranges nested inside. One JSON file rather than twelve: adding a
 * category is a single edit, and ranges are never queried independently (no
 * "everything between 200 and 400 kVA across all categories"), so a separate
 * collection would only buy us a join on every page render.
 *
 * The Zod schema is the guard rail — a typo in `availability`, a `related`
 * slug that doesn't exist, or a missing `seoTitle` fails the build instead of
 * shipping a broken page.
 */
import { defineCollection, reference } from "astro:content";
import { file } from "astro/loaders";
// Astro 7 deprecates re-exporting `z` from astro:content — import it direct.
import { z } from "astro/zod";

/** yard = on the ground in Sajjah · on_request = short lead · sourced = to order */
const availability = z.enum(["yard", "on_request", "sourced"]);

const range = z.object({
  /** Rating or size as it is quoted — "250 kVA", "5 ton", "12 m". */
  label: z.string(),
  /** Diesel / Electric / Tracked / Articulated … omitted where it doesn't apply. */
  powerType: z.string().optional(),
  /** One line on what this size is normally put to work doing. */
  typicalDuty: z.string().optional(),
  availability,
});

const dutyScenario = z.object({
  situation: z.string(),
  advice: z.string(),
});

const equipment = defineCollection({
  loader: file("src/content/equipment/categories.json"),
  schema: z.object({
    name: z.string(),
    family: z.enum([
      "Power & air",
      "Material handling",
      "Access",
      "Lifting",
      "Earthmoving",
    ]),
    /** Spec line under the name on cards and in the banner. */
    rangeLabel: z.string(),
    /** Extra sentence shown on the hub card, not on the homepage tile. */
    cardLine: z.string(),
    /** Two or three sentences — the paragraph in the category's hub row. */
    summary: z.string(),
    /** Scannable capability lines above the summary in the hub row. */
    highlights: z.array(z.string()).min(3).max(4),
    h1: z.string(),
    heroImage: z.string().optional(),
    availableHire: z.boolean().default(true),
    availableSale: z.boolean().default(true),
    /** Shown in the homepage teaser grid — six of the twelve. */
    featured: z.boolean().default(false),
    /** Takes work attachments — a breaker, an auger, forks, a sweeper. Four
     *  of the twelve do, and it is not derivable from `family`: telehandlers
     *  and forklifts are both material handling and only one of them takes
     *  them. The quote form asks for attachments only when this is true
     *  (docs/site-expansion/14 §7). */
    attachments: z.boolean().default(false),
    ranges: z.array(range).min(1),
    /** Sizing advice. Defaults to [] so the block simply doesn't render. */
    dutyGuide: z.array(dutyScenario).default([]),
    related: z.array(reference("equipment")).length(3),
    seoTitle: z.string(),
    seoDescription: z.string(),
    sortOrder: z.number().int(),
  }),
});

export const collections = { equipment };
