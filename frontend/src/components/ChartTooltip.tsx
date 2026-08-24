interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  valueSuffix?: string;
}

function ChartTooltip({
  active,
  label,
  payload,
  valueSuffix = "",
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="chart-tooltip">
      {label && (
        <strong className="chart-tooltip__label">
          {label}
        </strong>
      )}

      <div className="chart-tooltip__values">
        {payload.map((item) => (
          <div
            key={`${item.name}-${item.value}`}
            className="chart-tooltip__row"
          >
            <span>
              <i
                style={{
                  background:
                    item.color ??
                    "#148D7E",
                }}
              />

              {item.name}
            </span>

            <strong>
              {Number(item.value).toLocaleString(
                "en-AU",
              )}
              {valueSuffix}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartTooltip;