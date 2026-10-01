import { Circle, G, Polyline, Rect, Svg, Text } from "@react-pdf/renderer";
import { PDF_FONT } from "@/lib/pdf";
import { CHART, statusBands, toPair, toScale } from "../indexChart";
import { PDF_COLOR } from "../pdfTheme";
import { STATUS_LABEL } from "../status";
import type { IndexPoint } from "../types";

type Props = {
  history: IndexPoint[];
  forecast: [IndexPoint, IndexPoint];
  width: number;
};

// Шрифт подписей задаём каждой: со <Svg> react-pdf его не наследует, а без
// него кириллица уходит во встроенную Helvetica.
const LABEL = { fontFamily: PDF_FONT, fontSize: 11 };
const FORECAST_LABEL = { ...LABEL, fontStyle: "italic" };

// Тот же график индекса, что на странице отчёта, — примитивами react-pdf.
export function IndexChartPdf({ history, forecast, width }: Props) {
  const scale = toScale([...history, ...forecast]);
  const [forecastStart, forecastEnd] = forecast.map(scale.point);
  const dots = history.map(scale.point);

  return (
    <Svg
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      width={width}
      height={(width * CHART.height) / CHART.width}
    >
      <StatusBands y={scale.y} />
      <Polyline
        fill="none"
        points={`${toPair(forecastStart)} ${toPair(forecastEnd)}`}
        stroke={PDF_COLOR.critical}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
      <Text
        {...FORECAST_LABEL}
        x={(forecastStart.x + forecastEnd.x) / 2}
        y={(forecastStart.y + forecastEnd.y) / 2 - 10}
        textAnchor="middle"
        fill={PDF_COLOR.critical}
      >
        прогноз без вмешательства
      </Text>
      <Polyline
        fill="none"
        points={dots.map(toPair).join(" ")}
        stroke={PDF_COLOR.ink}
        strokeWidth={2}
      />
      {dots.map((dot) => (
        <Circle
          key={toPair(dot)}
          cx={dot.x}
          cy={dot.y}
          r={3.5}
          fill={PDF_COLOR.paper}
          stroke={PDF_COLOR.ink}
          strokeWidth={1.5}
        />
      ))}
      {scale.ticks.map((tick) => (
        <Text
          {...LABEL}
          key={tick.label}
          x={tick.x}
          y={CHART.axisY}
          textAnchor="middle"
          fill={PDF_COLOR.secondary}
        >
          {tick.label}
        </Text>
      ))}
    </Svg>
  );
}

function StatusBands({ y }: { y: (value: number) => number }) {
  const { plot } = CHART;

  return statusBands().map((band) => (
    <G key={band.tone}>
      <Rect
        x={plot.left}
        y={y(band.from)}
        width={plot.right - plot.left}
        height={y(band.to) - y(band.from)}
        fill={PDF_COLOR[band.tone]}
        fillOpacity={0.08}
      />
      <Text
        {...LABEL}
        x={plot.right - 6}
        y={y(band.from) + 16}
        textAnchor="end"
        fill={PDF_COLOR.muted}
      >
        {STATUS_LABEL[band.tone]}
      </Text>
      <Text
        {...LABEL}
        x={plot.left - 6}
        y={y(band.from) + 4}
        textAnchor="end"
        fill={PDF_COLOR.secondary}
      >
        {band.from}
      </Text>
    </G>
  ));
}
