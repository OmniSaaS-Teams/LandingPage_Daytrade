"use client";
export default function BlogError({ reset }: { reset: () => void }) { return <div style={{ padding: "60px 24px" }}><p>Os conteúdos estão temporariamente indisponíveis.</p><button onClick={reset}>Tentar novamente</button></div>; }
