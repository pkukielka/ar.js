package arjs

import org.scalajs.dom.html

import scala.scalajs.js.annotation.JSExport

@JSExport
class Camera(video: html.Video, canvas: html.Canvas) {

  val greenScreen = new GreenScreen(video, canvas)

  @JSExport
  def drawOnCanvas(drawGreenScreen: Boolean = false, drawMarker: Boolean = false): Unit = {
    canvas.drawImage(video, 0, 0, canvas.width, canvas.height)
    greenScreen.drawGreenScreen(drawGreenScreen, drawMarker)
  }

}