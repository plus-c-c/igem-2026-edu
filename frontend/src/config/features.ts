export const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true"

export type FeatureFlag = boolean | "dev"

const registry: Record<string, FeatureFlag> = {
  industrialization: "dev",
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return flag === true || (flag === "dev" && DEV_MODE)
}

export const features = {
  industrialization: isFeatureEnabled(registry.industrialization),
} as const