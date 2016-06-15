package main

import (
	"html/template"

	"fmt"

	"github.com/byuoitav/raspi-tp/helpers"
	"github.com/byuoitav/raspi-tp/views"
	"github.com/jessemillar/health"
	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/fasthttp"
	"github.com/labstack/echo/middleware"
)

func main() {
	templater := &helpers.Template{
		Templates: template.Must(template.ParseGlob("public/*.html")),
	}

	port := ":9000"
	router := echo.New()
	router.Pre(middleware.RemoveTrailingSlash())
	router.SetRenderer(templater)

	router.Get("/health", health.Check)

	// Views
	router.Static("/*", "public")
	router.Get("/", views.Main)

	fmt.Printf("Raspi TP is listening on %s\n", port)
	router.Run(fasthttp.New(port))
}