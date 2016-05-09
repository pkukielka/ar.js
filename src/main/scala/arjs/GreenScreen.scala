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
  val downScaleFactor = 5

  val baseCanvas: html.Canvas = createDownscaledCanvas()
  val backCanvas: html.Canvas = createDownscaledCanvas()
  val greenScreen = new Array[Boolean](baseCanvas.width * baseCanvas.height)
  val greenscreenWidth = baseCanvas.width

  val lightsaber =  dom.document.createElement("img").asInstanceOf[html.Image]
  lightsaber.src = "presentation/imgs/ls.png"

  val lightsaberBase =  dom.document.createElement("img").asInstanceOf[html.Image]
  lightsaberBase.src = "presentation/imgs/ls-base.png"

  val swBg = dom.document.createElement("img").asInstanceOf[html.Image]
  swBg.src = "presentation/imgs/sw-bg3.jpg"
  val swBgCanvas = dom.document.createElement("canvas").asInstanceOf[html.Canvas]
  swBgCanvas.width = canvas.width
  swBgCanvas.height = canvas.height
  swBgCanvas.drawImage(swBg, 0, 0, swBgCanvas.width, swBgCanvas.height)
  val swBgCanvasData = swBgCanvas.getImageData(0, 0, swBgCanvas.width, swBgCanvas.height).data


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

  def drawLightsaber(): Unit = {
    val thresholdR = 100
    val thresholdG = 100

    val (redX, redY) = getColorCenterPoint(0, thresholdR)
    val (greenX, greenY) = getColorCenterPoint(2, thresholdG)
    val width = redX - greenX
    val height = redY - greenY
    val length = 15 * Math.sqrt(width*width + height*height)
    val angle = Math.atan2(-height, -width) - (Math.PI / 2)
    canvas.fillRect(redX, redY, 10, 10)
    canvas.fillRect(greenX, greenY, 10, 10)

    if (length < 1500 && length > 100) {
      canvas.save()
      canvas.translate(redX, redY)
      canvas.rotate(angle)
      canvas.drawImage(lightsaber, -length / 8, -length, length / 4, length)
      canvas.drawImage(lightsaberBase, -length / 24, -length / 8, length / 12, length / 4)
      canvas.restore()
    }
  }

  def drawBackground(): Unit = {
    val canvasImageData =  forPixels(forGreenscreen = true) {
      (canvasData, x, y) =>
        val pos = (x + (y * canvas.width)) * 4
        canvasData(pos) = swBgCanvasData(pos)
        canvasData(pos + 1) = swBgCanvasData(pos + 1)
        canvasData(pos + 2) = swBgCanvasData(pos + 2)
    }
    canvas.putImageData(canvasImageData, 0, 0)
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

   drawLightsaber()

    if (drawMarker) {
      val (redX, redY) = getColorCenterPoint(0, 130)
      DOMGlobalScope.drawFireball(canvas, redX.toInt, redY.toInt)
    }
  }
}