package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

var ConfigPath = ""

// Build info (set via ldflags)
var (
	VERSION string
	COMMIT  string
)

// Config 應用程式設定
type Config struct {
	// API Keys (頂層)
	GeminiAPIKey string `yaml:"gemini_api_key"`
	OpenAIAPIKey string `yaml:"openai_api_key"`

	// PostgreSQL
	Postgres PostgresConfig `yaml:"postgres"`

	// Redis
	Redis RedisConfig `yaml:"redis"`

	// Qdrant
	Qdrant QdrantConfig `yaml:"qdrant"`

	// ML Service
	MLService MLServiceConfig `yaml:"ml_service"`
}

type PostgresConfig struct {
	Host     string `yaml:"host"`
	Port     string `yaml:"port"`
	DB       string `yaml:"db"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
}

type RedisConfig struct {
	Host string `yaml:"host"`
	Port string `yaml:"port"`
}

type QdrantConfig struct {
	Host string `yaml:"host"`
	Port string `yaml:"port"`
}

type MLServiceConfig struct {
	Host string `yaml:"host"`
	Port string `yaml:"port"`
}

// New 載入設定檔並存入全域變數
func New(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}

// DSN 返回 PostgreSQL 連線字串
func (c *Config) PostgresDSN() string {
	return "postgres://" + c.Postgres.User + ":" + c.Postgres.Password +
		"@" + c.Postgres.Host + ":" + c.Postgres.Port + "/" + c.Postgres.DB + "?sslmode=disable"
}

// RedisAddr 返回 Redis 位址
func (c *Config) RedisAddr() string {
	return c.Redis.Host + ":" + c.Redis.Port
}

// QdrantAddr 返回 Qdrant 位址
func (c *Config) QdrantAddr() string {
	return c.Qdrant.Host + ":" + c.Qdrant.Port
}

// MLServiceAddr 返回 ML Service 位址
func (c *Config) MLServiceAddr() string {
	return c.MLService.Host + ":" + c.MLService.Port
}
