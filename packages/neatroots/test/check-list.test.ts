import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("offline checks list", () => {
  it("lists effective checks without a running server", () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), "neatroots-check-list-test-"));
    const extra = path.join(home, "project-checks");
    fs.mkdirSync(extra);
    fs.writeFileSync(path.join(extra, "custom.yaml"), "id: custom-offline-check\nkind: rule\ntitle: Custom offline check\nrule: {type: match, field: name, pattern: never}\n");
    try {
      const result = spawnSync(process.execPath, ["--import", "tsx", "src/cli.ts", "checks", "list", "--offline", "--checks", extra], {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        env: { ...process.env, NEATROOTS_HOME: home },
        encoding: "utf8",
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("custom-offline-check");
      expect(result.stdout).toContain("library");
    } finally {
      fs.rmSync(home, { recursive: true, force: true });
    }
  });
});
