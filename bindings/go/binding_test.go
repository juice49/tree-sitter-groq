package tree_sitter_groq_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-groq"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_groq.Language())
	if language == nil {
		t.Errorf("Error loading Groq grammar")
	}
}
