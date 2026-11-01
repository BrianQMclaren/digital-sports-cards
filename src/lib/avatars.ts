// Only list players whose image exists in public/avatars/; everyone else
// gets GENERIC_AVATAR. Missing files render as broken images.
export const STAR_AVATAR_MAP: Record<number, string> = {
  175: "/avatars/shai-gilgeous.png",
  246: "/avatars/nikola-jokic.png",
  237: "/avatars/lebron-james.png",
  3547238: "/avatars/anthony-edwards.png",
};

export const GENERIC_AVATAR = "/avatars/generic.png";

export function getPlayerAvatar(ballDontLieId: number): string {
  return STAR_AVATAR_MAP[ballDontLieId] ?? GENERIC_AVATAR;
}
