package controllers

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

//
// ===============================================================
// GENERATE SIGNED URL — VIDEO
// ===============================================================
//

func GetSignedVideoURL(c *gin.Context) {

	filename := c.Param("filename")

	// generate token unik
	token := uuid.NewString()

	// expired 5 menit
	exp := time.Now().Add(5 * time.Minute).Unix()

	signedURL := "/api/user/sessions/video/" + filename +
		"?token=" + token +
		"&exp=" + fmt.Sprint(exp)

	c.JSON(200, gin.H{
		"url": signedURL,
	})
}

//
// ===============================================================
// GENERATE SIGNED URL — FILE
// ===============================================================
//

func GetSignedFileURL(c *gin.Context) {

	filename := c.Param("filename")

	token := uuid.NewString()
	exp := time.Now().Add(5 * time.Minute).Unix()

	signedURL := "/api/user/sessions/file/" + filename +
		"?token=" + token +
		"&exp=" + fmt.Sprint(exp)

	c.JSON(200, gin.H{
		"url": signedURL,
	})
}
