package entity

import "time"

// Post 社群貼文
type Post struct {
	ID        int64  // 內部自增主鍵
	PostID    string // 原始平台貼文 ID
	Content   string
	Platform  Platform
	Author    Author
	Metrics   Metrics
	Embedding Vector
	CreatedAt time.Time
}

// Platform 貼文來源平台
type Platform string

const (
	PlatformInstagram Platform = "instagram"
	PlatformFacebook  Platform = "facebook"
	PlatformThreads   Platform = "threads"
	PlatformYouTube   Platform = "youtube"
	PlatformTikTok    Platform = "tiktok"
)

// Author 貼文作者
type Author struct {
	ID        string
	Username  string
	Followers int
}

// Metrics 貼文互動指標
type Metrics struct {
	Likes    int
	Comments int
	Shares   int
	Views    int
}

// RiskScore 計算貼文價值分數 (0-100)
func (p *Post) RiskScore() int {
	score := 0

	// 內容長度 (最高 30 分)
	contentLen := len([]rune(p.Content))
	if contentLen >= 100 {
		score += 30
	} else if contentLen >= 50 {
		score += 20
	} else if contentLen >= 20 {
		score += 10
	}

	// 互動指標 (最高 40 分)
	engagement := p.Metrics.Likes + p.Metrics.Comments*2 + p.Metrics.Shares*3
	if engagement >= 1000 {
		score += 40
	} else if engagement >= 100 {
		score += 30
	} else if engagement >= 10 {
		score += 20
	}

	// 作者影響力 (最高 30 分)
	if p.Author.Followers >= 100000 {
		score += 30
	} else if p.Author.Followers >= 10000 {
		score += 20
	} else if p.Author.Followers >= 1000 {
		score += 10
	}

	return score
}

// IsHighValue 判斷是否為高價值貼文 (RiskScore >= 70)
func (p *Post) IsHighValue() bool {
	return p.RiskScore() >= 70
}
