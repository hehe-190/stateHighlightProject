package main

import (
	"context"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
	"time"
)

// state type
var stateType = graphql.NewObject(graphql.ObjectConfig{
	Name: "State",
	Fields: graphql.Fields{
		"name": &graphql.Field{Type: graphql.String},
	},
})

// query type
var queryType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Query",
	Fields: graphql.Fields{
		"states": &graphql.Field{
			Type: graphql.NewList(stateType),
			Args: graphql.FieldConfigArgument{
				"search": &graphql.ArgumentConfig{Type: graphql.String},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				search, _ := p.Args["search"].(string)

				// if search is null, return null
				if search == "" {
					return []map[string]interface{}{}, nil
				}

				// MongoDB query
				var states []map[string]interface{}
				//var states []string

				// initiate MongoDB client
				clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
				client, err := mongo.Connect(context.TODO(), clientOptions)
				if err != nil {
					log.Fatal(err)
				}

				// check connection
				err = client.Ping(context.TODO(), nil)
				if err != nil {
					log.Fatal(err)
				}

				// select collection
				collection := client.Database("stateDB").Collection("states")

				// select MongoDB by Regular expression

				filter := bson.M{"name": bson.M{"$regex": "^" + search, "$options": "i"}}
				//// search condition
				//var filter bson.M
				//if search != "" {
				//	filter = bson.M{"name": bson.M{"$regex": "^" + search, "$options": "i"}}
				//} else {
				//	filter = bson.M{}
				//}

				cursor, err := collection.Find(context.TODO(), filter)
				if err != nil {
					log.Fatal(err)
				}

				// parse solution
				for cursor.Next(context.TODO()) {
					var result bson.M
					if err := cursor.Decode(&result); err != nil {
						log.Fatal(err)
					}

					if name, ok := result["name"].(string); ok {
						log.Println("Decoded name:", name)
						//states = append(states, name)
						states = append(states, map[string]interface{}{"name": name})
					} else {
						log.Println("Invalid or missing 'name' field:", result)
					}
					//log.Println("Decoded result:", result)
					//states = append(states, result["name"].(string))
				}

				// close cursor
				cursor.Close(context.TODO())
				return states, nil
			},
		},
	},
})

func main() {
	// initial GraphQL Schema
	schema, err := graphql.NewSchema(graphql.SchemaConfig{
		Query: queryType,
	})
	if err != nil {
		log.Fatal(err)
	}

	// initial GraphQL handler
	h := handler.New(&handler.Config{
		Schema: &schema,
		Pretty: true,
	})

	// Gin route
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4200"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// GraphQL API
	r.POST("/graphql", func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	})

	// port 8080
	log.Println("Server running on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
