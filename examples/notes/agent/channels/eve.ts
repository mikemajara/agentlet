import { eveChannel } from "eve/channels/eve";
import { localDev, none, vercelOidc } from "eve/channels/auth";

export default eveChannel({
  auth: [
    vercelOidc(),
    localDev(),
    // Browser companion: Eve auth is `none()` so chat works without an app users table.
    // Production gate is Vercel Authentication on all deployments (see README) — not an open URL.
    none(),
  ],
});
