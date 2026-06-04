import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ value, size = 180 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#05060a", light: "#5ef2b0" },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-xl bg-white/5"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt="Payment link QR code"
      className="rounded-xl"
    />
  );
}
