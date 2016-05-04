package arjs

import org.scalajs.dom
import org.scalajs.dom.html

import scala.scalajs.js.annotation.JSExport

@JSExport
class Camera(video: html.Video, canvas: html.Canvas) {

  val greenScreen = new GreenScreen(video, canvas)

  @JSExport
  def drawOnCanvas(): Unit = {
    val context = canvas.getContext("2d").asInstanceOf[dom.CanvasRenderingContext2D]
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    greenScreen.drawGreenScreen()
  }

}