// Set while a new user has verified their email code but not yet chosen a password,
// so the sign-in page doesn't redirect them home mid-setup.
const KEY = "dsp-pending-password";

export function isPasswordPending(): boolean {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setPasswordPending(pending: boolean) {
  try {
    if (pending) window.sessionStorage.setItem(KEY, "1");
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}
