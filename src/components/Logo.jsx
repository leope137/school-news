export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#dc2626"/>
      <rect x="7" y="9" width="26" height="3" rx="1.5" fill="white"/>
      <rect x="7" y="15" width="18" height="2" rx="1" fill="white" opacity="0.8"/>
      <rect x="7" y="20" width="26" height="2" rx="1" fill="white" opacity="0.6"/>
      <rect x="7" y="25" width="22" height="2" rx="1" fill="white" opacity="0.6"/>
      <rect x="7" y="30" width="16" height="2" rx="1" fill="white" opacity="0.4"/>
    </svg>
  );
}
