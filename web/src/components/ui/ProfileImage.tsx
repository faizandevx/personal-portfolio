import Image from "next/image";
import type { ProfilePhoto } from "@/content/photos";

// A professional photo that fills its frame (the frame sets the size and shape, e.g.
// the V21 .avatar-circle). next/image serves a resized WebP for the given sizes.
// Above-the-fold photos pass eager so they load first (Next 16: instead of priority).
export default function ProfileImage({
  photo,
  sizes,
  eager = false,
}: {
  photo: ProfilePhoto;
  sizes: string;
  eager?: boolean;
}) {
  return (
    <Image
      className="profile-photo"
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}
