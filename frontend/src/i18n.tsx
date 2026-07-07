import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

export type Language = "zh" | "en"

const STORAGE_KEY = "synedu-language"

export const translations = {
  zh: {
    nav: {
      home: "首页",
      applications: "讲座科普",
      activities: "实践活动",
      recruitment: "教育项目招募",
      about: "关于我们",
      login: "登录",
      logout: "退出登录",
      menu: "菜单",
      admin: "管理员",
    },
    home: {
      eyebrow: "ZJU-China、Westlake、XJTLU-China",
      titleLines: ["SynEdu Global:", "Synthetic Biology Education Global Alliance"],
      subtitle: "加入我们，一起点亮世界合成生物学科普的微光。",
      recruitButton: "教育项目招募",
      showcaseTitle: "可直接对外展示的教育活动样板",
      showcaseDesc: "用完整案例展示联盟不是单纯收集资料，而是能组织课程、展台、支教和公众活动的教育协作平台。",
      categoryTitle: "四个栏目",
      categoryDesc: "每个栏目都是一个可持续沉淀的教育专题。",
    },
    stats: {
      resources: "已收录资源",
      columns: "核心栏目",
      materials: "项目材料",
      teams: "高校团队",
    },
    filters: {
      aria: "项目检索",
      theme: "主题",
      material: "资源",
      audience: "面向人群",
      allThemes: "全部主题",
      allMaterials: "全部资源",
      allAudiences: "全部人群",
      themeOptions: ["合成生物学科普", "iGEM科普", "其他科普"],
      materialOptions: ["PPT", "docx", "实践经验", "海报"],
      audienceOptions: ["中小学", "高校", "公众", "iGEM团队"],
    },
    pages: {
      scienceProjects: "科普项目",
      activityTopics: "活动主题",
      educationProjects: "教育项目",
      addProject: "在这里添加你的项目",
      noRecruitmentMatch: "没有符合当前检索条件的教育项目。",
      noRecruitmentItems: "暂时还没有发布的教育项目。登录后可以添加第一个项目招募。",
      noProjectMatch: "没有符合当前检索条件的项目。",
      noProjectItems: "暂时还没有发布的项目。",
      itemCount: "个项目",
    },
    about: {
      subtitle: "加入我们，一起点亮世界合成生物学科普的微光。",
      paragraphs: [
        "SynEdu Global 是由 ZJU-China、Westlake、XJTLU-China 三支 iGEM 队伍联合发起的合成生物学教育网站，旨在共享教育资源，启发教育灵感，联合国内外的 iGEMer 共同推动合成生物学教育的发展。",
        "我们相信，iGEM 教育板块的核心，从来不是孤军奋战，而是平等、共享、交流与传递。SynEdu Global 从三支国内队伍的微小想法出发，希望可以联合各位优秀 iGEMer 的力量，共同搭建一个纯粹、开放、以启发为核心的科普交流平台。我们希望让每一支热爱科普的 iGEM 队伍都能在此获得支撑、迸发创意、传递科学的温度。",
        "在此，我们诚挚邀请 iGEMer、教育公益组织、爱心企业等优秀团队，加入 SynEdu Global。希望你的建议和支持，项目和灵感，可以让 SynEdu 更好成长。期待与你一同上传成果、交流思想、投身教育、联结全球，以协同教育之力，点亮世界各地合成生物学科普的微光。",
      ],
    },
    caseDetail: {
      missingTitle: "教育项目不存在",
      missingDesc: "该教育项目可能已被删除或链接无效。",
      backHome: "返回首页",
      intro: "项目简介",
      fallbackDesc: "这是为 SynEdu Global 网站生成的教育项目，用于说明一个教育活动如何从主题设计、材料准备、现场执行到反馈收集形成完整闭环。",
      content: "展示内容",
      emptyContent: "暂无展示内容",
      info: "活动信息",
      category: "所属栏目",
      format: "活动形式",
      impact: "展示价值",
      edit: "编辑",
      delete: "删除",
      confirmDelete: "确定删除此教育项目？此操作不可撤销。",
      detailLink: "查看项目详情",
    },
    loginRequired: {
      eyebrow: "Login Required",
      title: "登录后发布教育项目招募",
      desc: "请先登录团队账号，然后从顶部导航或栏目页进入教育项目发布流程。",
      action: "团队登录",
    },
    categories: {
      applications: {
        name: "讲座科普",
        short: "Lecture",
        intro: "开展各种主题的讲座，让大众走进合成生物学，了解 iGEM 和合成生物学的各种应用，降低学生和大众对新技术的误解。",
      },
      activities: {
        name: "实践活动",
        short: "Events",
        intro: "沉淀微生物作画、生物材料体验、开放工作坊等互动式教育活动方案。",
      },
      cooperation: {
        name: "教育项目招募",
        short: "Partners",
        intro: "记录支教队伍、合作学校、公益教育场景和课程包共建进度。",
      },
      about: {
        name: "关于我们",
        short: "Alliance",
        intro: "展示联盟构成、团队分工、运行模式、赞助入口与年度教育成果。",
      },
    },
  },
  en: {
    nav: {
      home: "Home",
      applications: "Lectures",
      activities: "Practice",
      recruitment: "Project Calls",
      about: "About",
      login: "Log In",
      logout: "Log out",
      menu: "Menu",
      admin: "Admin",
    },
    home: {
      eyebrow: "ZJU-China, Westlake, XJTLU-China",
      titleLines: ["SynEdu Global:", "Synthetic Biology Education Global Alliance"],
      subtitle: "Join us in lighting small sparks of synthetic biology education around the world.",
      recruitButton: "Project Calls",
      showcaseTitle: "Education projects ready to share with the public",
      showcaseDesc: "Complete cases show that the alliance is not just collecting materials, but organizing courses, booths, outreach, and public education programs.",
      categoryTitle: "Four Sections",
      categoryDesc: "Each section is a lasting topic space for educational resources.",
    },
    stats: {
      resources: "Resources",
      columns: "Core Sections",
      materials: "Materials",
      teams: "University Teams",
    },
    filters: {
      aria: "Project filters",
      theme: "Topic",
      material: "Resource",
      audience: "Audience",
      allThemes: "All topics",
      allMaterials: "All resources",
      allAudiences: "All audiences",
      themeOptions: ["Synthetic Biology", "iGEM Outreach", "Other Science"],
      materialOptions: ["PPT", "docx", "Practice Notes", "Poster"],
      audienceOptions: ["K-12", "Universities", "Public", "iGEM Teams"],
    },
    pages: {
      scienceProjects: "Lecture Projects",
      activityTopics: "Activity Topics",
      educationProjects: "Education Projects",
      addProject: "Add your project here",
      noRecruitmentMatch: "No education projects match the current filters.",
      noRecruitmentItems: "No education projects have been posted yet. Log in to add the first project call.",
      noProjectMatch: "No projects match the current filters.",
      noProjectItems: "No projects have been posted yet.",
      itemCount: "projects",
    },
    about: {
      subtitle: "Join us in lighting small sparks of synthetic biology education around the world.",
      paragraphs: [
        "SynEdu Global is a synthetic biology education website jointly launched by three iGEM teams: ZJU-China, Westlake, and XJTLU-China. It aims to share education resources, inspire new outreach ideas, and connect iGEMers at home and abroad to advance synthetic biology education together.",
        "We believe the heart of iGEM education is never solitary work, but equality, sharing, exchange, and transmission. Starting from a small idea shared by three Chinese teams, SynEdu Global hopes to gather the strengths of outstanding iGEMers and build a pure, open, inspiration-centered platform for science communication. We hope every iGEM team passionate about outreach can find support here, spark creativity, and pass on the warmth of science.",
        "Here, we sincerely invite iGEMers, education nonprofits, caring companies, and other excellent teams to join SynEdu Global. Your suggestions, support, projects, and ideas can help SynEdu grow. We look forward to uploading outcomes, exchanging thoughts, joining education work, and connecting globally with you, using collaborative education to light small sparks of synthetic biology outreach around the world.",
      ],
    },
    caseDetail: {
      missingTitle: "Project Not Found",
      missingDesc: "This education project may have been deleted or the link may be invalid.",
      backHome: "Back Home",
      intro: "Project Overview",
      fallbackDesc: "This demo education project shows how an educational activity can form a complete loop from topic design and material preparation to execution and feedback collection.",
      content: "Content",
      emptyContent: "No content yet",
      info: "Activity Info",
      category: "Section",
      format: "Format",
      impact: "Value",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Delete this education project? This action cannot be undone.",
      detailLink: "View Project",
    },
    loginRequired: {
      eyebrow: "Login Required",
      title: "Log in to publish a project call",
      desc: "Please log in with your team account before publishing an education project.",
      action: "Team Login",
    },
    categories: {
      applications: {
        name: "Lectures",
        short: "Lecture",
        intro: "Run lectures on diverse topics so the public can enter synthetic biology, understand iGEM and its applications, and reduce misunderstandings about new technologies.",
      },
      activities: {
        name: "Practice",
        short: "Events",
        intro: "Collect plans for microbial art, biomaterial experiences, open workshops, and other hands-on education activities.",
      },
      cooperation: {
        name: "Project Calls",
        short: "Partners",
        intro: "Record teaching teams, partner schools, public education settings, and co-built course packages.",
      },
      about: {
        name: "About",
        short: "Alliance",
        intro: "Learn about the alliance, team collaboration, operating model, sponsorship, and annual education outcomes.",
      },
    },
  },
} as const

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: typeof translations.zh | typeof translations.en
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "zh"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === "en" ? "en" : "zh"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en"
  }

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en"
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "zh" ? "en" : "zh"),
    t: translations[language],
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error("useI18n must be used inside LanguageProvider")
  return value
}

export function useCategoryText(categoryId: string) {
  const { t } = useI18n()
  return t.categories[categoryId as keyof typeof t.categories]
}
