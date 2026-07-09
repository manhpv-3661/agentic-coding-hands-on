/**
 * Raw Postgres row shapes for the simplified SAA 2025 schema:
 * `profiles`, `kudos`, `kudos_likes`, `gift_logs`.
 *
 * The app still renders the richer `KudosPost` / `KudosPerson` view-models;
 * these DB rows are adapted at the repository boundary only.
 */

/** `public.profiles` */
export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
}

/** `public.kudos` */
export interface KudosRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  title: string | null;
  content: string;
  image_urls: string[];
  is_anonymous: boolean;
  anonymous_name: string | null;
  hashtags: string[];
  created_at: string;
}

export type KudosRelatedProfile = Pick<
  ProfileRow,
  "id" | "full_name" | "avatar_url" | "department"
>;

export interface KudosRowWithRelations extends KudosRow {
  sender: KudosRelatedProfile | null;
  receiver: KudosRelatedProfile | null;
}

export interface KudosQueryRow extends KudosRowWithRelations {
  kudos_likes: { count: number }[];
}
