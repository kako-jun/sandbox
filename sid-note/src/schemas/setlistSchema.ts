import { z } from "zod";

export const SetlistTrackSchema = z.object({
  id: z.number(),
  title: z.string(),
  artist: z.string(),
});
export type SetlistTrackType = z.infer<typeof SetlistTrackSchema>;

export const SetlistSchema = z.object({
  setlistName: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  tracks: z.array(SetlistTrackSchema),
});
export type SetlistType = z.infer<typeof SetlistSchema>;
