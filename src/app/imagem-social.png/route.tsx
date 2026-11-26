import { ImageResponse } from "next/og";
import { brand } from "../../data/brand";
import { socialImage } from "../../lib/seo";

export function GET() {
  return new ImageResponse(
    (
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%",
        padding: "76px", backgroundImage: "linear-gradient(120deg, #08083d, #11117d)", color: "white",
      }}>
        <div style={{ color: "#a8cf45", fontSize: 38, fontWeight: 700 }}>{brand.name}</div>
        <div style={{ marginTop: 32, fontSize: 84, fontWeight: 700, maxWidth: 900, lineHeight: 1.04 }}>
          Crédito para empresas
        </div>
        <div style={{ marginTop: 36, fontSize: 32, color: "#e0eaf0" }}>
          Antecipação de recebíveis e capital de giro
        </div>
      </div>
    ),
    { width: socialImage.width, height: socialImage.height },
  );
}
