import { AvatarProps } from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import defaultAvatar from "@/assets/avatars/defaultAvatar.png";
import Image from "next/image";
import { User } from "lucide-react";

interface UserAvatarProps extends AvatarProps {
  user: { image: string | null | undefined; name: string };
  defaultAvatarSize?: number;
}

export function UserAvatar({
  user,
  defaultAvatarSize,
  ...props
}: UserAvatarProps) {
  const avatarURL = user.image ?? defaultAvatar;
  const size = `size-${defaultAvatarSize}` ?? "4";

  return (
    <Avatar {...props}>
      {user.image ? (
        <div className="relative aspect-square size-full">
          <Image
            fill
            src={avatarURL}
            alt="profile picture"
            referrerPolicy="no-referrer"
            className="object-cover"
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
          <User className={size} />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
