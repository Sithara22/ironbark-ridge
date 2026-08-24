import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  variant?:
    | "primary"
    | "energy"
    | "neutral";
}

function MetricCard({
  title,
  value,
  description,
  icon,
  variant = "neutral",
}: MetricCardProps) {
  return (
    <article
      className={`metric-card metric-card--${variant}`}
    >
      <div className="metric-card__top">
        <span className="metric-card__title">
          {title}
        </span>

        <span className="metric-card__icon">
          {icon}
        </span>
      </div>

      <strong className="metric-card__value">
        {value}
      </strong>

      <span className="metric-card__description">
        {description}
      </span>
    </article>
  );
}

export default MetricCard;