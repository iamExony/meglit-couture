"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState } from "react";

export default function ConvexClientProvider({ children }) {
  const [client] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL));
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
