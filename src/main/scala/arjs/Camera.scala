package arjs

import org.scalajs.dom
import org.scalajs.dom.html

import scala.scalajs.js.annotation.JSExport

@JSExport
object Camera {

  @JSExport
  def drawOnCanvas(video: html.Video, canvas: html.Canvas): Unit = {
    val ctx = canvas.getContext("2d").asInstanceOf[dom.CanvasRenderingContext2D]
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  }
}