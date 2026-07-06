import type { ProjectMeta } from "../types"

export const projectMetaByCategory: Record<string, ProjectMeta> = {
  applications: { organization: "ZJU iGEM", kind: "时限项目", delivery: "线下", region: "杭州", duration: "半日", venue: "展台" },
  activities: { organization: "Westlake iGEM", kind: "短期项目", delivery: "线下", region: "杭州", duration: "2 小时", venue: "开放空间" },
  cooperation: { organization: "支教合作组", kind: "长期项目", delivery: "线上+线下", region: "浙江", duration: "4 课时", venue: "合作学校" },
  about: { organization: "联盟运营组", kind: "长期项目", delivery: "线上", region: "通用", duration: "全年", venue: "线上会议" },
}
