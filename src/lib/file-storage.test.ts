import { mkdtemp, writeFile, mkdir } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { deletePrefix, getFile } from "./file-storage";

describe("deletePrefix", () => {
  const onceki = process.env.UPLOADS_DIR;
  afterEach(() => {
    if (onceki === undefined) delete process.env.UPLOADS_DIR;
    else process.env.UPLOADS_DIR = onceki;
  });

  it("bucket altındaki klasörü siler", async () => {
    const kok = await mkdtemp(path.join(tmpdir(), "acb-uploads-"));
    process.env.UPLOADS_DIR = kok;
    const dir = path.join(kok, "cekici-belgeler", "c-1");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "ruhsat.pdf"), "x");
    await deletePrefix("cekici-belgeler", "c-1");
    expect(await getFile("cekici-belgeler", "c-1/ruhsat.pdf")).toBeNull();
  });

  it(".. içeren öneki yok sayar", async () => {
    const kok = await mkdtemp(path.join(tmpdir(), "acb-uploads-"));
    process.env.UPLOADS_DIR = kok;
    await mkdir(path.join(kok, "cekici-belgeler"), { recursive: true });
    await writeFile(path.join(kok, "disarida.txt"), "sakla");
    await deletePrefix("cekici-belgeler", "../disarida.txt");
    const { readFile } = await import("fs/promises");
    expect(await readFile(path.join(kok, "disarida.txt"), "utf8")).toBe("sakla");
  });
});
