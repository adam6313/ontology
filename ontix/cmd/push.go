package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/spf13/cobra"
)

var pushCmd = func() *cobra.Command {
	var filePath string
	var skip int
	var limit int
	var endpoint string
	var delay int

	cmd := &cobra.Command{
		Use:   "push",
		Short: "Push posts from JSON file to HTTP API",
		Run: func(cmd *cobra.Command, args []string) {
			runPush(filePath, skip, limit, endpoint, delay)
		},
	}

	cmd.Flags().StringVarP(&filePath, "file", "f", "", "JSON file path (required)")
	cmd.Flags().IntVarP(&skip, "skip", "s", 0, "Skip first N posts")
	cmd.Flags().IntVarP(&limit, "limit", "l", 0, "Limit number of posts (0=all)")
	cmd.Flags().StringVarP(&endpoint, "endpoint", "e", "http://localhost:8080/api/posts", "API endpoint")
	cmd.Flags().IntVarP(&delay, "delay", "d", 100, "Delay between requests in ms")
	cmd.MarkFlagRequired("file")

	return cmd
}

// RawData represents the JSON file structure
type RawData struct {
	ID             json.Number `json:"id"`
	PostID         string      `json:"post_id"`          // fallback
	PlatformPostID string      `json:"platform_post_id"` // fallback
	OwnerID        string      `json:"owner_id"`
	PlatformUserID string      `json:"platform_user_id"`
	OwnerUsername  string      `json:"owner_username"`
	PostTime       string      `json:"post_time"`
	Content        string      `json:"content"`
	Platform       string      `json:"platform"`
	LikeCount      int         `json:"like_count"`
	CommentCount   int         `json:"comment_count"`
	ShareCount     int         `json:"share_count"`
	ViewCount      int         `json:"view_count"`
}

// APIRequest represents the request to send to the API (matches redis.PostMessage)
type APIRequest struct {
	ID             int64  `json:"id"`
	Platform       string `json:"platform"`
	PlatformUserID string `json:"platform_user_id"`
	Content        string `json:"content"`
	LikeCount      int    `json:"like_count"`
	CommentCount   int    `json:"comment_count"`
	ShareCount     int    `json:"share_count"`
	ViewCount      int    `json:"view_count"`
	OwnerUsername  string `json:"owner_username"`
	PostTime       string `json:"post_time"`
}

func runPush(filePath string, skip int, limit int, endpoint string, delay int) {
	// Read JSON file
	data, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatalf("Failed to read file: %v", err)
	}

	// Parse JSON (handle the nested structure)
	var rawMap map[string][]RawData
	if err := json.Unmarshal(data, &rawMap); err != nil {
		log.Fatalf("Failed to parse JSON: %v", err)
	}

	// Extract posts from the first key
	var posts []RawData
	for _, v := range rawMap {
		posts = v
		break
	}

	// Filter valid posts
	var validPosts []RawData
	for _, p := range posts {
		if p.Content != "" && len(p.Content) > 10 {
			validPosts = append(validPosts, p)
		}
	}

	// Apply skip
	if skip > 0 && skip < len(validPosts) {
		validPosts = validPosts[skip:]
	} else if skip >= len(validPosts) {
		fmt.Printf("Skip (%d) >= total posts (%d), nothing to push\n", skip, len(validPosts))
		return
	}

	// Apply limit
	if limit > 0 && limit < len(validPosts) {
		validPosts = validPosts[:limit]
	}

	fmt.Println("=== Ontix Push ===")
	fmt.Printf("File: %s\n", filePath)
	fmt.Printf("Endpoint: %s\n", endpoint)
	fmt.Printf("Skip: %d, Limit: %d\n", skip, limit)
	fmt.Printf("Posts to push: %d\n\n", len(validPosts))

	client := &http.Client{Timeout: 10 * time.Second}
	successCount := 0
	failCount := 0

	for i, raw := range validPosts {
		// Convert post_id string to int64 (try multiple fields)
		var postID int64
		if raw.ID != "" {
			postID, _ = raw.ID.Int64()
		}
		if postID == 0 && raw.PlatformPostID != "" {
			fmt.Sscanf(raw.PlatformPostID, "%d", &postID)
		}
		if postID == 0 && raw.PostID != "" {
			fmt.Sscanf(raw.PostID, "%d", &postID)
		}

		// Get platform user ID
		platformUserID := raw.PlatformUserID
		if platformUserID == "" {
			platformUserID = raw.OwnerID
		}

		// Get owner username
		ownerUsername := raw.OwnerUsername
		if ownerUsername == "" {
			ownerUsername = raw.OwnerID
		}

		// Get platform
		platform := raw.Platform
		if platform == "" {
			platform = "ig"
		}

		req := APIRequest{
			ID:             postID,
			Platform:       platform,
			PlatformUserID: platformUserID,
			Content:        raw.Content,
			LikeCount:      raw.LikeCount,
			CommentCount:   raw.CommentCount,
			ShareCount:     raw.ShareCount,
			ViewCount:      raw.ViewCount,
			OwnerUsername:  ownerUsername,
			PostTime:       raw.PostTime,
		}

		body, _ := json.Marshal(req)
		resp, err := client.Post(endpoint, "application/json", bytes.NewReader(body))

		fmt.Printf("[%d/%d] %d ", i+1, len(validPosts), postID)

		if err != nil {
			fmt.Printf("X %v\n", err)
			failCount++
			continue
		}

		respBody, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		if resp.StatusCode == http.StatusAccepted {
			fmt.Println("OK")
			successCount++
		} else {
			fmt.Printf("X %s\n", string(respBody))
			failCount++
		}

		if delay > 0 {
			time.Sleep(time.Duration(delay) * time.Millisecond)
		}
	}

	fmt.Printf("\n=== Done ===\n")
	fmt.Printf("Success: %d / Failed: %d\n", successCount, failCount)
}

func init() {
	// Will be registered in root.go
}
