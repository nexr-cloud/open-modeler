import { PiCubeTransparentFill } from "react-icons/pi";
import Link from "next/link";

const Logo = ({
  className = "w-20",
}: {
  className?: string;
}) => {
  return (
    <Link className={`flex bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 aspect-square rounded-full ring-3 ring-primary/10  items-center gap-2 ${className}`} href={`/`}>
      <PiCubeTransparentFill className="size-20 p-3 text-primary" />
    </Link>
  );
};

export default Logo;
