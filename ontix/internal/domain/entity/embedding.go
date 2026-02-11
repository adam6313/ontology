package entity

import "math"

// Vector 向量 (768 dim for Gemini)
type Vector []float32

// Dimension 向量維度
func (v Vector) Dimension() int {
	return len(v)
}

// CosineSimilarity 餘弦相似度
func (v Vector) CosineSimilarity(other Vector) float64 {
	if len(v) != len(other) {
		return 0
	}

	var dotProduct, normA, normB float64
	for i := range v {
		dotProduct += float64(v[i]) * float64(other[i])
		normA += float64(v[i]) * float64(v[i])
		normB += float64(other[i]) * float64(other[i])
	}

	if normA == 0 || normB == 0 {
		return 0
	}

	return dotProduct / (math.Sqrt(normA) * math.Sqrt(normB))
}

// EuclideanDistance 歐氏距離
func (v Vector) EuclideanDistance(other Vector) float64 {
	if len(v) != len(other) {
		return math.MaxFloat64
	}

	var sum float64
	for i := range v {
		diff := float64(v[i]) - float64(other[i])
		sum += diff * diff
	}

	return math.Sqrt(sum)
}
