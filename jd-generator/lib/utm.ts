/**
 * Builds a tracked Juicebox signup URL with UTM parameters and role prefill
 *
 * @param role - The job role being sourced (e.g., "Marketing Manager")
 * @returns Full signup URL with tracking parameters
 */
export function buildJuiceboxCta(role: string): string {
  const base = "https://juicebox.ai/signup";
  const params = new URLSearchParams({
    utm_source: "jd-widget",
    utm_medium: "pseo",
    utm_campaign: "role-jd",
    role
  });
  return `${base}?${params.toString()}`;
}
