import { TemplateSchema, type Template } from "./schemas";

const raw: Record<string, Template> = {
  office1: {
    name: "office1",
    size: { x: 1363, y: 1524 },
    file: "/templates/office1.jpg",
    targets: [
      {
        friendlyName: "panel 1",
        topLeft: { x: 19, y: 42 },
        size: { x: 709, y: 505 },
        deltas: [
          { x: 195, y: 0 },
          { x: 0, y: -98 },
          { x: 0, y: 46 },
          { x: -173, y: 0 },
        ],
      },
      {
        friendlyName: "panel 2",
        topLeft: { x: 628, y: 112 },
        size: { x: 954, y: 553 },
        deltas: [
          { x: 233, y: 0 },
          { x: 0, y: -115 },
          { x: 0, y: 87 },
          { x: -274, y: 0 },
        ],
      },
    ],
  },
  drake1: {
    name: "drake1",
    size: { x: 425, y: 365 },
    file: "/templates/drake1.jpeg",
    targets: [
      {
        friendlyName: "panel 1",
        topLeft: { x: 217, y: 0 },
        size: { x: 210, y: 170 },
      },
      {
        friendlyName: "panel 2",
        topLeft: { x: 217, y: 174 },
        size: { x: 210, y: 170 },
      },
    ],
  },
  trade_deal: {
    name: "trade_deal",
    size: { x: 607, y: 794 },
    file: "/templates/trade_deal.jpg",
    targets: [
      {
        friendlyName: "panel 1",
        topLeft: { x: 14, y: 181 },
        size: { x: 250, y: 250 },
      },
      {
        friendlyName: "panel 2",
        topLeft: { x: 344, y: 181 },
        size: { x: 250, y: 250 },
      },
    ],
  },
  bernie: {
    name: "bernie",
    size: { x: 926, y: 688 },
    file: "/templates/bernie.png",
    targets: [
      {
        friendlyName: "bottom text",
        topLeft: { x: 73, y: 500 },
        size: { x: 800, y: 180 },
      },
    ],
  },
  jarvis: {
    // "Hi! My name is Jason" / Jenkins Comic brain-filing meme.
    // https://knowyourmeme.com/memes/hi-my-name-is-jason-remembering-peoples-names
    name: "jarvis",
    size: { x: 680, y: 705 },
    file: "/templates/jarvis.png",
    targets: [
      {
        // panel 3: the large tilted yellow "memory" block inside the brain.
        friendlyName: "memory block",
        topLeft: { x: 58, y: 428 },
        size: { x: 272, y: 104 },
        // Skew the filled content to match the block's clockwise tilt (the top
        // edge descends left-to-right). Order is DELTA_ORDER = [TL, BL, TR, BR];
        // values tuned in the editor's skew mode.
        deltas: [
          { x: 56, y: -4 }, // TL
          { x: 26, y: -30 }, // BL
          { x: -27, y: 38 }, // TR
          { x: -53, y: 15 }, // BR
        ],
      },
      {
        // panel 4: the punchline speech bubble (below the baked-in "Say Jarvis,").
        friendlyName: "punchline",
        topLeft: { x: 368, y: 415 },
        size: { x: 282, y: 55 },
      },
    ],
  },
};

// Validate all templates at import time
export const templates: Record<string, Template> = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => [k, TemplateSchema.parse(v)]),
);
