package gemini

import (
	"encoding/json"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"github.com/ikala/ontix/internal/domain/service"
)

type tagJSON struct {
	Name       string  `json:"name"`
	Confidence float64 `json:"confidence"`
	IsHardTag  bool    `json:"is_hard_tag"`
	HardTagID  string  `json:"hard_tag_id,omitempty"`
}

func parseTagResponse(part genai.Part) ([]service.TagResult, error) {
	text, ok := part.(genai.Text)
	if !ok {
		return nil, fmt.Errorf("unexpected response type: %T", part)
	}

	var tags []tagJSON
	if err := json.Unmarshal([]byte(text), &tags); err != nil {
		return nil, fmt.Errorf("failed to parse tags JSON: %w", err)
	}

	results := make([]service.TagResult, len(tags))
	for i, t := range tags {
		results[i] = service.TagResult{
			Name:       t.Name,
			Confidence: t.Confidence,
			IsHardTag:  t.IsHardTag,
			HardTagID:  t.HardTagID,
		}
	}
	return results, nil
}
