import { describe, expect, it } from "vitest";
import {
  deriveStoreIdFromToken,
  findBlobReadWriteToken,
  findBlobStoreId,
  vercelBlobConfigured,
} from "./blob-env";

describe("blob-env", () => {
  it("derives store id from a read-write token", () => {
    expect(
      deriveStoreIdFromToken("vercel_blob_rw_AbCdEfGh1234_secretpart"),
    ).toBe("AbCdEfGh1234");
  });

  it("finds prefixed token env vars", () => {
    const env = {
      NOTES_BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_AbCdEfGh1234_x",
    };
    expect(findBlobReadWriteToken(env)).toBe(
      "vercel_blob_rw_AbCdEfGh1234_x",
    );
    expect(findBlobStoreId(env)).toBe("AbCdEfGh1234");
    expect(vercelBlobConfigured(env)).toBe(true);
  });

  it("uses BLOB_STORE_ID when no token is present", () => {
    expect(
      vercelBlobConfigured({ BLOB_STORE_ID: "store_abc12345xyz" }),
    ).toBe(true);
    expect(findBlobStoreId({ BLOB_STORE_ID: "abc12345xyz" })).toBe(
      "abc12345xyz",
    );
  });

  it("is not configured when only VERCEL_OIDC_TOKEN is set", () => {
    expect(
      vercelBlobConfigured({ VERCEL_OIDC_TOKEN: "oidc-token-value" }),
    ).toBe(false);
  });
});
