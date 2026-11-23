// Professional photos (approved 2026-11-23), stored unedited in web/public/images/.
// If an entry is set to null, the page shows the approved placeholder instead. Never
// use a stand-in or stock image.
export type ProfilePhoto = {
  src: string; // path under web/public/
  alt: string;
};

// Home hero (blue suit, 1070×1470). It fills the V21 hero photo frame.
export const heroPhoto: ProfilePhoto | null = {
  src: "/images/faizan-ali-hero.png",
  alt: "Faizan Ali in a navy three-piece suit",
};

// About page (grey suit, 1122×1402). It sits in the "At a glance" card.
export const aboutPhoto: ProfilePhoto | null = {
  src: "/images/faizan-ali-about.png",
  alt: "Faizan Ali in a grey three-piece suit",
};
