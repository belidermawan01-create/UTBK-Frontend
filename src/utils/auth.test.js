import test from "node:test";
import assert from "node:assert/strict";
import { getUserRole, isAdminUser, getErrorMessage } from "./auth.js";

test("getUserRole prioritizes explicit role from user payload", () => {
  const user = {
    role: "ADMIN",
    user_metadata: { role: "SISWA" },
    app_metadata: { role: "SISWA" },
  };

  assert.equal(getUserRole(user), "ADMIN");
});

test("isAdminUser detects admin from metadata and email fallback", () => {
  assert.equal(isAdminUser({ user_metadata: { role: "admin" } }), true);
  assert.equal(isAdminUser({ email: "admin@example.com" }), true);
  assert.equal(isAdminUser({ role: "SISWA" }), false);
});

test("getErrorMessage returns backend message when present", () => {
  const err = { response: { data: { message: "Token tidak valid" } } };
  assert.equal(getErrorMessage(err), "Token tidak valid");
});
