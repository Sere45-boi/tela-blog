"use client";

import { useEffect } from "react";
import Intercom from "@intercom/messenger-js-sdk";

export function IntercomClient() {
  useEffect(() => {
    Intercom({
      app_id: "dgbmvjoz",
    });
  }, []);

  return null;
}
