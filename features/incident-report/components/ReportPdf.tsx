import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { PDF_FONT } from "@/lib/pdf";
import { PDF_COLOR } from "../pdfTheme";
import { approvalLabel, REPORT_STATE_LABEL } from "../status";
import type {
  IncidentReport,
  ReportEvent,
  ReportKpi,
  ReportOption,
} from "../types";
import { IndexChartPdf } from "./IndexChartPdf";

type Props = { report: IncidentReport; stationName: string };

// A4 в пунктах: ширина 595, поля по 40 — под содержимое остаётся 515.
const CONTENT_WIDTH = 515;

// Отчёт по инциденту для скачивания: те же разделы, что на странице,
// в одну колонку и с колонтитулом на каждой странице.
export function ReportPdf({ report, stationName }: Props) {
  return (
    <Document title={`Отчёт по инциденту ${report.code}`} language="ru">
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>
          Отчёт по инциденту {report.code} · {REPORT_STATE_LABEL[report.state]}
        </Text>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.summary}>{report.summary}</Text>
        <Kpis kpis={report.kpis} />
        <Section title="Индекс станции">
          <IndexChartPdf
            history={report.indexHistory}
            forecast={report.forecast}
            width={CONTENT_WIDTH}
          />
        </Section>
        <Section title="Хронология" wrap>
          <Timeline events={report.timeline} />
        </Section>
        <Section title="Рассмотренные варианты">
          <Options options={report.options} />
        </Section>
        <Section title="Решение и согласования">
          <List items={report.decisions} />
        </Section>
        <Section title="Выполненные работы">
          <List items={report.works} />
        </Section>
        <Text style={styles.footer} fixed>
          Цифровая станция · ст. {stationName} · отчёт {report.code}
        </Text>
      </Page>
    </Document>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
  // Длинный раздел можно рвать между страницами; короткий переносится целиком,
  // чтобы заголовок не оставался внизу страницы без содержимого.
  wrap?: boolean;
};

function Section({ title, children, wrap = false }: SectionProps) {
  return (
    <View style={styles.section} wrap={wrap}>
      <Text style={styles.heading} minPresenceAhead={60}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Kpis({ kpis }: { kpis: ReportKpi[] }) {
  return (
    <View style={styles.kpis}>
      {kpis.map((kpi) => (
        <View key={kpi.label} style={styles.kpi}>
          <Text style={styles.caption}>{kpi.label}</Text>
          <Text style={styles.kpiFact}>{kpi.fact}</Text>
          <Text style={styles.secondary}>{kpi.compare}</Text>
          <Text style={styles.kpiNote}>{kpi.note}</Text>
        </View>
      ))}
    </View>
  );
}

function Timeline({ events }: { events: ReportEvent[] }) {
  return events.map((event) => (
    <View key={`${event.time} ${event.text}`} style={styles.row} wrap={false}>
      <Text style={[styles.secondary, styles.timeCell]}>{event.time}</Text>
      <Text style={styles.cell}>{event.text}</Text>
    </View>
  ));
}

function Options({ options }: { options: ReportOption[] }) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.cell]}>Вариант</Text>
        <Text style={[styles.caption, styles.numberCell]}>Индекс</Text>
        <Text style={[styles.caption, styles.numberCell]}>Макс. задержка</Text>
        <Text style={[styles.caption, styles.numberCell]}>ДНЦ</Text>
      </View>
      {options.map((option) => (
        <View key={option.name} style={styles.row} wrap={false}>
          <Text style={styles.cell}>
            <Text style={option.chosen ? styles.strong : {}}>
              {option.name}
            </Text>
            {option.chosen && " · принят"}
          </Text>
          <Text style={styles.numberCell}>{option.index}</Text>
          <Text style={styles.numberCell}>{option.maxDelayMinutes} мин</Text>
          <Text style={styles.numberCell}>
            {approvalLabel(option.needsApproval)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function List({ items }: { items: string[] }) {
  return items.map((item) => (
    <Text key={item} style={styles.listItem}>
      — {item}
    </Text>
  ));
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 56,
    fontFamily: PDF_FONT,
    fontSize: 10,
    lineHeight: 1.4,
    color: PDF_COLOR.ink,
  },
  kicker: {
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: PDF_COLOR.accent,
  },
  title: { marginTop: 6, fontSize: 22, fontWeight: 600, lineHeight: 1.15 },
  summary: { marginTop: 8, fontSize: 11, color: PDF_COLOR.body },
  kpis: {
    flexDirection: "row",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: PDF_COLOR.ink,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLOR.line,
  },
  kpi: { flex: 1, gap: 2, paddingVertical: 10, paddingRight: 10 },
  kpiFact: { fontSize: 20, fontWeight: 600, lineHeight: 1.1 },
  kpiNote: { fontSize: 8.5, fontStyle: "italic", color: PDF_COLOR.accent },
  section: { marginTop: 18, gap: 4 },
  heading: { marginBottom: 2, fontSize: 13, fontWeight: 600 },
  caption: {
    fontSize: 7.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: PDF_COLOR.muted,
  },
  secondary: { fontSize: 9, color: PDF_COLOR.secondary },
  strong: { fontWeight: 600 },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLOR.line,
  },
  timeCell: { width: 32 },
  cell: { flex: 1 },
  numberCell: { width: 88 },
  listItem: { paddingVertical: 1 },
  // Колонтитул вне потока, на каждой странице. Без явной высоты не ниже
  // строки текста react-pdf его не выводит.
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    height: 16,
    fontSize: 8,
    color: PDF_COLOR.muted,
  },
});
