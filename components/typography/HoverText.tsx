import Link from 'next/link';

interface HoverTextProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  as?: 'link' | 'button' | 'span';
  onClick?: () => void;
}

export default function HoverText({
  children,
  href,
  className = '',
  as = 'span',
  onClick,
}: HoverTextProps) {
  const base = `inline-block font-medium tracking-wide hover-slide transition-all duration-200 cursor-pointer hover:tracking-widest ${className}`;

  if (as === 'link' && href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  if (as === 'button') {
    return (
      <button onClick={onClick} className={base}>
        {children}
      </button>
    );
  }

  return (
    <span className={base} onClick={onClick}>
      {children}
    </span>
  );
}
