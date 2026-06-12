export default function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="8" height="8" rx="2" fill="#6366f1" />
      <rect x="10" y="0" width="8" height="8" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="0" y="10" width="8" height="8" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="10" y="10" width="8" height="8" rx="2" fill="#6366f1" opacity="0.4" />
    </svg>
  );
}
