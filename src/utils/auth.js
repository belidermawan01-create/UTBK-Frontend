export function getUserRole(user) {
  if (!user) return null;

  const candidates = [
    user.role,
    user?.user_metadata?.role,
    user?.app_metadata?.role,
  ];

  const role = candidates.find(
    (value) => typeof value === "string" && value.trim(),
  );
  return role ? role.toUpperCase() : null;
}

export function isAdminUser(user) {
  const role = getUserRole(user);
  if (role === "ADMIN") return true;

  const email = user?.email || "";
  return (
    email.toLowerCase().includes("admin") || email.toLowerCase().includes("abu")
  );
}

export function getErrorMessage(error, fallback = "Terjadi kesalahan") {
  return error?.response?.data?.message || error?.message || fallback;
}

export function getAuthToken() {
  return localStorage.getItem("access_token");
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
    return;
  }

  localStorage.removeItem("access_token");
}
