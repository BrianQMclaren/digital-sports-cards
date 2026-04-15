export const STAR_AVATAR_MAP: Record<number, string> = {
  175: "/avatars/shai-gilgeous.png",
  37098979: "/avatars/luka-doncic.png",
  246: "/avatars/nikola-jokic.png",
  140: "/avatars/kevin-durant.png",
  237: "/avatars/lebron-james.png",
  73: "avatars/jalen-brunson.png",
  56677822: "/avatars/victor-wembanyama.png",
  115: "/avatars/steph-curry.png",
  3547238: "/avatars/anthony-edwards.png",
  15: "/avatars/giannis-antetokounmpo.png",
};

export const GENERIC_AVATAR = "/avatars/generic.png";

export function getPlayerAvatar(ballDontLieId: number): string {
  return STAR_AVATAR_MAP[ballDontLieId] ?? GENERIC_AVATAR;
}
