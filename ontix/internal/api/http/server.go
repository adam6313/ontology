package http

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/ikala/ontix/internal/infra/redis"
)

// Server is the HTTP server
type Server struct {
	stream       *redis.StreamRepo
	db           *postgres.DB
	redisClient  *redis.Client
	embedSvc     service.EmbeddingService
	summarySvc   service.EntitySummaryService
	postRepo     repository.PostRepository
	tagRepo      repository.TagRepository
	topicRepo    repository.TopicRepository
	analysisRepo repository.PostAnalysisRepository
	factRepo     repository.DerivedFactRepository
	engine       *gin.Engine
}

// NewServer creates a new HTTP server
func NewServer(
	stream *redis.StreamRepo,
	db *postgres.DB,
	redisClient *redis.Client,
	embedSvc service.EmbeddingService,
	summarySvc service.EntitySummaryService,
	postRepo repository.PostRepository,
	tagRepo repository.TagRepository,
	topicRepo repository.TopicRepository,
	analysisRepo repository.PostAnalysisRepository,
	factRepo repository.DerivedFactRepository,
) *Server {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.New()
	engine.Use(gin.Recovery())

	// CORS 支援 frontend
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	engine.Use(cors.New(config))

	s := &Server{
		stream:       stream,
		db:           db,
		redisClient:  redisClient,
		embedSvc:     embedSvc,
		summarySvc:   summarySvc,
		postRepo:     postRepo,
		tagRepo:      tagRepo,
		topicRepo:    topicRepo,
		analysisRepo: analysisRepo,
		factRepo:     factRepo,
		engine:       engine,
	}
	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	api := s.engine.Group("/api")
	{
		// 現有路由
		api.POST("/posts", s.ingestPost)
		api.GET("/health", s.health)
		api.GET("/queue/len", s.queueLen)

		// 新增路由
		api.GET("/search", s.search)
		api.GET("/dashboard", s.dashboard)

		// Entity (Ontology) 路由
		api.GET("/entities", s.listEntities)
		api.GET("/entities/:id", s.getEntity)
		api.GET("/entities/:id/aspects", s.getEntityAspects)
		api.GET("/entities/:id/mentions", s.getEntityMentions)
		api.GET("/entities/:id/links", s.getEntityLinks)
		api.GET("/entities/:id/observations", s.getEntityObservations)
		api.GET("/entities/:id/summary", s.getEntitySummary)
		api.GET("/entity-types", s.getEntityTypes)
		api.GET("/graph", s.getGraph)

		// Inbox (Derived Facts) 路由
		api.GET("/inbox", s.listInboxFacts)
		api.GET("/inbox/count", s.getInboxCount)
		api.PATCH("/inbox/batch", s.batchInboxAction)
		api.PATCH("/inbox/:id/read", s.markFactRead)
		api.PATCH("/inbox/:id/dismiss", s.dismissFact)
		api.GET("/entities/:id/facts", s.getEntityFacts)
		api.GET("/entities/:id/kol-attribution", s.getKOLAttribution)
		api.POST("/entities/:id/chat", s.chatWithEntity)
	}
}

// Run starts the server
func (s *Server) Run(addr string) error {
	return s.engine.Run(addr)
}

// ingestPost POST /api/posts - Ingest a post
func (s *Server) ingestPost(c *gin.Context) {
	var req redis.PostMessage
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content is required"})
		return
	}

	if err := s.stream.Publish(c.Request.Context(), req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to queue"})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"status":  "queued",
		"post_id": req.ID,
	})
}

// health GET /api/health
func (s *Server) health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// queueLen GET /api/queue/len
func (s *Server) queueLen(c *gin.Context) {
	len, err := s.stream.Len(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"length": len})
}
