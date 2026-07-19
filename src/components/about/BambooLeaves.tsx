/** Decorative bamboo-leaf count (0–3). Learning-progress cue only. */

type BambooLeavesProps = {
  count: 0 | 1 | 2 | 3;
  className?: string;
};

export function BambooLeaves({ count, className }: BambooLeavesProps) {
  if (count === 0) {
    return (
      <svg
        viewBox="0 0 48 48"
        className={className}
        aria-hidden="true"
        fill="none"
      >
        <circle cx="24" cy="28" r="3" className="fill-primary/35" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M24 40 V18"
        className="stroke-primary-depth"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {count >= 1 && (
        <path
          d="M24 20 C18 16 14 18 12 22 C16 24 20 24 24 22 Z"
          className="fill-primary"
        />
      )}
      {count >= 2 && (
        <path
          d="M24 24 C30 20 34 22 36 26 C32 28 28 28 24 26 Z"
          className="fill-primary"
        />
      )}
      {count >= 3 && (
        <path
          d="M24 16 C20 10 16 11 14 15 C18 17 22 18 24 16 Z"
          className="fill-primary-depth"
        />
      )}
    </svg>
  );
}
