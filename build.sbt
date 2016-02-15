enablePlugins(ScalaJSPlugin)

name := "Augmented Reality with Scala.js"

version := "1.0"

scalaVersion := "2.11.7"

scalaJSUseRhino in Global := false

libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "0.9.0"