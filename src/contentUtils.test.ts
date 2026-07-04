import test from "node:test";
import assert from "node:assert/strict";
import { canSubmitContent } from "./contentUtils";

test("allows sending when text is empty but an image is attached", () => {
  assert.equal(canSubmitContent("", "data:image/png;base64,abc"), true);
});

test("blocks submission when both text and image are empty", () => {
  assert.equal(canSubmitContent("   ", null), false);
});
