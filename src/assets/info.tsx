import type { SVGProps } from 'react';

type InfoIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

const InfoIcon = ({ size = 24, className, width, height, ...props }: InfoIconProps) => {
  const finalWidth = width ?? size;
  const finalHeight = height ?? size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={finalWidth}
      height={finalHeight}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={['lucide lucide-info-icon lucide-info', className].filter(Boolean).join(' ')}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
};

export default InfoIcon;
