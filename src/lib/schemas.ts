import { z } from "zod";

/** Integer coordinate or delta. May be negative (deltas push corners outward). */
export const PointSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

/** A box size. Must be a positive integer on both axes (rejects 0/negative/NaN). */
export const SizeSchema = z.object({
  x: z.number().int().positive(),
  y: z.number().int().positive(),
});

export const DeltasSchema = z.tuple([
  PointSchema,
  PointSchema,
  PointSchema,
  PointSchema,
]);

export const TargetSchema = z.object({
  friendlyName: z.string(),
  topLeft: PointSchema,
  size: SizeSchema,
  deltas: DeltasSchema.optional(),
});

export const TemplateSchema = z.object({
  name: z.string(),
  size: SizeSchema,
  targets: z.array(TargetSchema).min(1),
  file: z.string(),
});

export const ImageInputSchema = z.object({
  kind: z.literal("image"),
  url: z.string(),
  stretch: z.boolean().default(false),
});

export const TextInputSchema = z.object({
  kind: z.literal("text"),
  text: z.string().min(1),
  color: z.string().default("orange"),
});

export const TargetInputSchema = z.discriminatedUnion("kind", [
  ImageInputSchema,
  TextInputSchema,
]);

export type Point = z.infer<typeof PointSchema>;
export type Size = z.infer<typeof SizeSchema>;
export type Deltas = z.infer<typeof DeltasSchema>;
export type Target = z.infer<typeof TargetSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type ImageInput = z.infer<typeof ImageInputSchema>;
export type TextInput = z.infer<typeof TextInputSchema>;
export type TargetInput = z.infer<typeof TargetInputSchema>;
