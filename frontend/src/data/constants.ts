export const materialOptions = ["PPT", "测量表", "合作书", "海报", "阅读材料", "实践活动材料清单", "易拉宝", "传单", "其他"]

export const audienceOptions = ["小学", "初中", "高中", "大学", "社会公众", "iGEM团队"]

export const categoryThemeOptions: Record<string, string[]> = {
  applications: ["合成生物学科普", "iGEM科普", "其他"],
  activities: ["互动游戏", "现场体验", "其他"],
  cooperation: ["支教合作", "公益教育", "课程共建", "其他"],
}

export const deliveryOptions = ["线上", "线下", "都可"]

export const participationOptions = [
  { value: "yes", label: "是" },
  { value: "no", label: "否" },
]

export const timeLimitOptions = ["有时限", "无时限"]

// Controls how many category columns / campaign resources display on the homepage.
// Must equal categoryThemeOptions count (3) — "about" is excluded from the core UI.
export const CORE_COLUMNS_LIMIT = Object.keys(categoryThemeOptions).length

export const STORAGE_KEYS = {
  TOKEN: "authToken",
  USER: "hpEduUser",
  LANGUAGE: "synedu-language",
}

export const IGEM_ROLE_OPTIONS = ["Wet Lab", "Dry Lab", "HP", "美工", "Wiki"]

export const DEFAULT_AVATAR = "/images/logo.jpg"
