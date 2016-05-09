package arjs

import org.scalajs.dom
import org.scalajs.dom.html

import scala.scalajs.js

@js.native
object DOMGlobalScope extends js.GlobalScope {
  def drawFireball(canvas: html.Canvas, mouseX: Int, mouseY: Int): Unit = js.native
}

class GreenScreen(video: html.Video, canvas: html.Canvas) {
  val deltaSingleColor = 35
  val deltaValueMin = 0.85
  val deltaValueMax = 1.15
  val downScaleFactor = 6

  val baseCanvas: html.Canvas = createDownscaledCanvas()
  val backCanvas: html.Canvas = createDownscaledCanvas()
  val greenScreen = new Array[Boolean](baseCanvas.width * baseCanvas.height)
  val greenscreenWidth = baseCanvas.width
  
  def createDownscaledCanvas() = {
    val downscaledCanvas = dom.document.createElement("canvas").asInstanceOf[html.Canvas]
    downscaledCanvas.width = canvas.width / downScaleFactor
    downscaledCanvas.height = canvas.height / downScaleFactor
    downscaledCanvas.drawImage(video, 0, 0, downscaledCanvas.width, downscaledCanvas.height)
    downscaledCanvas
  }

  def computeInitialValues(): Unit = {
    backCanvas.drawImage(video, 0, 0, backCanvas.width, backCanvas.height)

    val backData = backCanvas.getImageData(0, 0, backCanvas.width, backCanvas.height).data
    val baseData = baseCanvas.getImageData(0, 0, baseCanvas.width, baseCanvas.height).data

    for (i <- 0 until baseData.length by 4) {
      val (backR, backG, backB) = (backData(i).toFloat + 255, backData(i + 1).toFloat + 255, backData(i + 2).toFloat + 255)
      val (baseR, baseG, baseB) = (baseData(i).toFloat + 255, baseData(i + 1).toFloat + 255, baseData(i + 2).toFloat + 255)

      def ratioRtoG = (backR / backG) / (baseR / baseG)
      def ratioGtoB = (backG / backB) / (baseG / baseB)

      greenScreen(i / 4) =
        ratioRtoG > deltaValueMin && ratioRtoG < deltaValueMax &&
          ratioGtoB > deltaValueMin && ratioGtoB < deltaValueMax &&
          Math.abs(backData(i) - baseData(i)) < deltaSingleColor &&
          Math.abs(backData(i + 1) - baseData(i + 1)) < deltaSingleColor &&
          Math.abs(backData(i + 2) - baseData(i + 2)) < deltaSingleColor
    }
  }

  def optimizeInitialValues(): Unit = {
    val repetitions = 2
    for (i <- 1 to repetitions) {
      for (i <- greenscreenWidth until greenScreen.length - greenscreenWidth) {
        def isGs(x: Int, y: Int) = greenScreen(x + (y * greenscreenWidth))

        val x = i % greenscreenWidth
        val y = i / greenscreenWidth
        if ((isGs(x - 1, y) && isGs(x + 1, y)) || (isGs(x, y - 1) && isGs(x, y + 1))) greenScreen(i) = true
        if ((!isGs(x - 1, y) && !isGs(x + 1, y)) || (!isGs(x, y - 1) && !isGs(x, y + 1))) greenScreen(i) = false
      }
    }
  }

  def getColorCenterPoint(colourBitIndex: Int, threshold: Int) = {
    var (sumX, sumY) = (0.0, 0.0)
    var pixelsCount = 0

    forPixels(forGreenscreen = false) {
      (canvasData, x, y) =>
        val pos = (x + (y * canvas.width)) * 4
        val mainColor = canvasData(pos + (colourBitIndex % 3))
        val secondColor = canvasData(pos + ((colourBitIndex + 1) % 3))
        val thirdColor = canvasData(pos + ((colourBitIndex + 2) % 3))
        if (mainColor > threshold && (secondColor < mainColor * 0.7) && (thirdColor < mainColor * 0.7)) {
          sumX += x
          sumY += y
          pixelsCount += 1
        }
    }

    if (pixelsCount > 1) (sumX / pixelsCount, sumY / pixelsCount) else (-1000.0, -1000.0)
  }

  def forPixels(forGreenscreen : Boolean)(f: (js.Array[Int], Int, Int) => Unit) = {
    val canvasImageData = canvas.getImageData(0, 0, canvas.width, canvas.height)
    val canvasData = canvasImageData.data

    for (i <- greenScreen.indices) {
      val xbase = (i % greenscreenWidth) * downScaleFactor
      val ybase = (i / greenscreenWidth) * downScaleFactor

      if (greenScreen(i) == forGreenscreen) {
        for {
          x <- xbase until xbase + downScaleFactor
          y <- ybase until ybase + downScaleFactor
        } f(canvasData, x, y)
      }
    }

    canvasImageData
  }

  def drawGreenScreen(drawGreenBackground: Boolean, drawMarker: Boolean): Unit = {
    computeInitialValues()
    optimizeInitialValues()

    if (drawGreenBackground) {
      val canvasImageData =  forPixels(forGreenscreen = true) {
        (canvasData, x, y) =>
          val pos = (x + (y * canvas.width)) * 4
          canvasData(pos) = 0
          canvasData(pos + 1) = 200
          canvasData(pos + 2) = 0
      }
      canvas.putImageData(canvasImageData, 0, 0)
    }


    if (drawMarker) {
      val (redX, redY) = getColorCenterPoint(0, 130)
      DOMGlobalScope.drawFireball(canvas, redX.toInt, redY.toInt)
    }
  }
}