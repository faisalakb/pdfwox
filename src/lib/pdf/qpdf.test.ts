import { describe, expect, it } from "vitest";
import { buildProtectArgs, buildUnlockArgs, looksEncrypted } from "./qpdf";

describe("qpdf arg builders (pure)", () => {
  it("buildProtectArgs lays out an --encrypt sequence", () => {
    const args = buildProtectArgs({ userPassword: "abc" });
    expect(args).toContain("--encrypt");
    expect(args).toContain("abc");
    expect(args).toContain("256");
    expect(args[args.length - 1]).toBe("/out.pdf");
  });

  it("buildProtectArgs uses ownerPassword when given", () => {
    const args = buildProtectArgs({
      userPassword: "u",
      ownerPassword: "o",
    });
    // After --encrypt come user, owner, key-length
    const i = args.indexOf("--encrypt");
    expect(args[i + 1]).toBe("u");
    expect(args[i + 2]).toBe("o");
    expect(args[i + 3]).toBe("256");
  });

  it("buildProtectArgs emits perm flags only when explicitly false", () => {
    const args = buildProtectArgs({
      userPassword: "x",
      permissions: { print: false, modify: true, extract: false },
    });
    expect(args).toContain("--print=none");
    expect(args).not.toContain("--modify=none");
    expect(args).toContain("--extract=n");
  });

  it("buildUnlockArgs passes the password as a flag", () => {
    const args = buildUnlockArgs("secret");
    expect(args[0]).toBe("--password=secret");
    expect(args).toContain("--decrypt");
  });
});

describe("looksEncrypted", () => {
  it("returns true when /Encrypt appears", () => {
    const buf = new TextEncoder().encode("%PDF-1.7\nfoo /Encrypt 5 0 R\n");
    expect(looksEncrypted(buf)).toBe(true);
  });

  it("returns false for a plain PDF header", () => {
    const buf = new TextEncoder().encode("%PDF-1.7\n%¥±ë\n1 0 obj\n");
    expect(looksEncrypted(buf)).toBe(false);
  });

  it("scans the tail too (qpdf trailer location)", () => {
    const filler = new Uint8Array(70_000);
    const tail = new TextEncoder().encode("/Encrypt 9 0 R\n%%EOF\n");
    const buf = new Uint8Array(filler.length + tail.length);
    buf.set(filler, 0);
    buf.set(tail, filler.length);
    expect(looksEncrypted(buf)).toBe(true);
  });
});
