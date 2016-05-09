import org.scalajs.dom
import org.scalajs.dom.html

package object arjs {
  implicit def canvasToContext(canvas: html.Canvas): dom.CanvasRenderingContext2D =
    canvas.getContext("2d").asInstanceOf[dom.CanvasRenderingContext2D]
}
