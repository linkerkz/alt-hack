import type { ComponentProps } from "react";
import { FIREFOX_NO_RESTORE } from "./noRestore";

type Props = ComponentProps<"button"> & {
  // alert — главное действие на экране, обводка цветом тревоги.
  tone?: "default" | "alert";
};

// Кнопка экрана полевого устройства: крупная, капителью, обводкой — на
// тёмном экране прошивки (токены device-*).
export function DeviceButton({
  tone = "default",
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      {...FIREFOX_NO_RESTORE}
      className={`min-h-12 cursor-pointer border px-3 py-2 font-bold font-mono text-[13px] uppercase tracking-[0.08em] transition-colors active:bg-device-ink/15 disabled:cursor-not-allowed disabled:opacity-40 ${TONE_CLASS[tone]} ${className}`}
      {...props}
    />
  );
}

const TONE_CLASS = {
  default: "border-device-line text-device-ink",
  alert: "border-device-warn text-device-warn",
};
