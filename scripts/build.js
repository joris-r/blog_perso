// Stub: the build is written in the Implementation phase.
import { mkdirSync } from "node:fs";

mkdirSync(process.env.OUTPUT_DIR ?? "_site", { recursive: true });
