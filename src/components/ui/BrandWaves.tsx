type BrandWavesProps = {
  className?: string;
};

export function BrandWaves({ className }: BrandWavesProps) {
  return (
    <svg className={className} viewBox="0 0 1440 300" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M-80 120C200 340 390 30 610 133S980 370 1510 20" stroke="#eaf1f6" strokeWidth="45" />
      <path d="M-60 210C260 350 390 35 610 130S1040 330 1490 45" stroke="#a7ce45" strokeWidth="4" />
      <path d="M-60 145C270 340 490 225 760 108S1050 48 1180 213 1310 230 1500 60" stroke="#00008b" strokeWidth="20" />
    </svg>
  );
}
