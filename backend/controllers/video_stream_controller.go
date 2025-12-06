package controllers

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

func StreamVideo(c *gin.Context) {

	fileName := c.Param("filename")
	fullPath := filepath.Join("uploads/sessions/videos/", fileName)

	file, err := os.Open(fullPath)
	if err != nil {
		c.JSON(404, gin.H{"error": "Video not found"})
		return
	}

	stat, _ := file.Stat()

	c.Header("Content-Type", "video/mp4")
	c.Header("Accept-Ranges", "bytes")
	c.Header("Content-Length", strconv.FormatInt(stat.Size(), 10))

	http.ServeContent(c.Writer, c.Request, fileName, stat.ModTime(), file)
	
}