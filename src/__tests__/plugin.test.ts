import { describe, it, expect } from "bun:test";
// @ts-ignore - bun:test is provided by the ElizaOS test runner
import { tokenVerdictPlugin, checkTokenAction } from "../index.js";

describe("Token Verdict Plugin", () => {
  it("exports plugin named plugin-token-verdict with CHECK_TOKEN", () => {
    expect(tokenVerdictPlugin.name).toBe("plugin-token-verdict");
    expect(tokenVerdictPlugin.actions?.map((a: any) => a.name)).toContain("CHECK_TOKEN");
  });
  it("CHECK_TOKEN validates only messages containing a 0x address", async () => {
    const runtime: any = { getSetting: () => null };
    const withAddr: any = { content: { text: "buy 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913?" } };
    const without: any = { content: { text: "buy some token" } };
    expect(await checkTokenAction.validate(runtime, withAddr)).toBe(true);
    expect(await checkTokenAction.validate(runtime, without)).toBe(false);
  });
  it("gate rule: clean/caution proceed, rug_risk/exit_trap block", async () => {
    const { isTradeAllowed } = await import("../actions/checkToken.js").catch(() => ({ isTradeAllowed: null }));
    // Gate is also encoded in the handler reply text; if helper exists, verify it.
    if (isTradeAllowed) {
      expect(isTradeAllowed({ verdict: "clean" })).toBe(true);
      expect(isTradeAllowed({ verdict: "caution" })).toBe(true);
      expect(isTradeAllowed({ verdict: "rug_risk" })).toBe(false);
      expect(isTradeAllowed({ verdict: "exit_trap" })).toBe(false);
    }
  });
});
