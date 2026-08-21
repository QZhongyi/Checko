import Image from "next/image";
import coin from "@/assets/images/home-complete/coin.png";

/**
 * 金币图标（设计稿 coin.png，统一替换各处 🪙 emoji）
 * size 为显示高度（px），宽度按 29:30 等比。
 */
export function CoinIcon({
  size = 14,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={coin}
      alt=""
      width={Math.round(size * (29 / 30))}
      height={size}
      className={`inline-block align-[-0.15em] ${className ?? ""}`}
    />
  );
}
