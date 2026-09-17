import { useParams } from "react-router-dom"
import { useI18n } from "../i18n"

export function VideoDetailPage() {
  const { videoIndex } = useParams()
  const { t } = useI18n()
  const videos = t.industrialization?.videos || []
  const index = parseInt(videoIndex || "1", 10) - 1
  const video = videos[index]

  if (!video) {
    return (
      <section className="page-shell">
        <p>视频不存在</p>
      </section>
    )
  }

  return (
    <section className="page-shell">
      <h1>{video.title}</h1>
      <p>{video.team}</p>
      <p>{video.tag}</p>
    </section>
  )
}