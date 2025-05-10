
import { Document } from "@/types/document";

// Mock data representing documents that would be stored in MongoDB
const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Introduction to MongoDB Atlas Search",
    content: "MongoDB Atlas Search combines the power of Apache Lucene with the developer experience of MongoDB Query Language. It provides advanced search capabilities like full-text search, fuzzy matching, and relevance-based ranking. Atlas Search enables you to build powerful search experiences without managing separate search infrastructure.",
    category: "Database",
    date: "2023-05-15",
    author: "MongoDB Team",
    tags: ["mongodb", "atlas", "search", "database"]
  },
  {
    id: "2",
    title: "Hybrid Search Explained",
    content: "Hybrid search combines keyword-based and semantic vector search techniques to deliver more relevant results. By balancing exact term matching with semantic understanding, hybrid search can capture both precision and contextual relevance. This approach is especially valuable when users might not know the exact terminology used in documents they're looking for.",
    category: "Search Technology",
    date: "2023-06-22",
    author: "Search Expert",
    tags: ["hybrid search", "semantic search", "vector search", "relevance"]
  },
  {
    id: "3",
    title: "Setting up Vector Search in MongoDB",
    content: "To implement vector search in MongoDB Atlas, you first need to create vector embeddings for your documents. These embeddings translate text into mathematical representations that capture semantic meaning. Once you have embeddings stored alongside your documents, you can perform similarity searches to find related content based on meaning rather than exact keyword matches.",
    category: "Tutorial",
    date: "2023-07-10",
    author: "Database Engineer",
    tags: ["vector search", "embeddings", "tutorial", "implementation"]
  },
  {
    id: "4",
    title: "Best Practices for Document Indexing",
    content: "Effective document indexing is crucial for search performance. When indexing documents, consider which fields need to be searchable and how to structure your indexes. For text-heavy fields, use text indexes with the appropriate language analyzer. For fields that require exact matching, standard indexes are more appropriate. Properly designed indexes can significantly improve search speed and accuracy.",
    category: "Best Practices",
    date: "2023-08-05",
    author: "Performance Expert",
    tags: ["indexing", "performance", "optimization", "best practices"]
  },
  {
    id: "5",
    title: "Relevance Tuning for Search Results",
    content: "Achieving high-quality search results often requires tuning relevance parameters. Consider using field weighting to prioritize matches in more important fields like titles. Boost recent documents if freshness matters for your use case. Incorporate user feedback signals like clicks and conversions to continuously improve your search algorithm's performance.",
    category: "Search Quality",
    date: "2023-09-18",
    author: "Search Engineer",
    tags: ["relevance", "tuning", "quality", "ranking"]
  },
  {
    id: "6",
    title: "Analyzing Search Performance Metrics",
    content: "Measuring search effectiveness requires tracking key metrics like click-through rate, abandonment rate, and average position of clicked results. Advanced techniques include using A/B tests to compare algorithm variations. Regularly analyze query logs to identify common search patterns and potential areas for improvement in your search implementation.",
    category: "Analytics",
    date: "2023-10-29",
    author: "Analytics Specialist",
    tags: ["metrics", "analytics", "performance", "measurement"]
  },
  {
    id: "7",
    title: "Natural Language Processing in Search",
    content: "Modern search systems leverage NLP techniques to better understand user queries. Techniques like lemmatization, entity recognition, and intent classification help bridge the gap between what users type and what they mean. By applying these techniques to both queries and documents, search systems can match concepts rather than just keywords.",
    category: "NLP",
    date: "2023-11-14",
    author: "NLP Researcher",
    tags: ["nlp", "natural language", "linguistics", "search"]
  },
];

// Simulate keyword search (basic contains match)
const keywordSearch = (query: string): Document[] => {
  if (!query) return mockDocuments;
  
  const lowercaseQuery = query.toLowerCase();
  return mockDocuments.filter(doc => 
    doc.title.toLowerCase().includes(lowercaseQuery) || 
    doc.content.toLowerCase().includes(lowercaseQuery) ||
    doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Simulate hybrid search (combining keyword and semantic relevance)
// For this mock, we'll add some relevance scoring to simulate hybrid search
const hybridSearch = (query: string): Document[] => {
  if (!query) return mockDocuments;
  
  const lowercaseQuery = query.toLowerCase();
  const queryTerms = lowercaseQuery.split(/\s+/);
  
  return mockDocuments
    .map(doc => {
      // Basic relevance score calculation (in a real app this would use vector similarity)
      let score = 0;
      
      // Title matches (highest weight)
      if (doc.title.toLowerCase().includes(lowercaseQuery)) {
        score += 10;
      }
      
      // Content matches
      if (doc.content.toLowerCase().includes(lowercaseQuery)) {
        score += 5;
      }
      
      // Tag matches
      if (doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))) {
        score += 7;
      }
      
      // Additional term matching (simulating semantic matching)
      queryTerms.forEach(term => {
        if (term.length > 3) { // Ignore short terms
          if (doc.title.toLowerCase().includes(term)) score += 2;
          if (doc.content.toLowerCase().includes(term)) score += 1;
          if (doc.tags.some(tag => tag.toLowerCase().includes(term))) score += 1.5;
        }
      });
      
      // Semantic relevance simulation - just some examples
      // In a real app, this would use actual vector similarity
      const semanticBoosts: Record<string, string[]> = {
        "search": ["query", "find", "retrieve", "lookup", "locate"],
        "database": ["storage", "repository", "collection", "data"],
        "mongodb": ["nosql", "document database", "atlas"],
        "vector": ["embedding", "semantic", "similarity"],
        "performance": ["speed", "efficiency", "optimization"]
      };
      
      Object.entries(semanticBoosts).forEach(([key, relatedTerms]) => {
        if (lowercaseQuery.includes(key) || relatedTerms.some(term => lowercaseQuery.includes(term))) {
          if (doc.content.toLowerCase().includes(key)) score += 3;
          if (doc.tags.some(tag => tag.includes(key))) score += 2;
        }
      });
      
      return { ...doc, score };
    })
    .filter(doc => doc.score > 0) // Only return documents with some relevance
    .sort((a, b) => b.score - a.score); // Sort by relevance score
};

// Get a document by ID
const getDocumentById = (id: string): Document | undefined => {
  return mockDocuments.find(doc => doc.id === id);
};

// Highlight search terms in text
const highlightSearchTerms = (text: string, query: string): string => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="bg-search-highlight">$1</span>');
};

export const documentService = {
  getAllDocuments: () => mockDocuments,
  keywordSearch,
  hybridSearch,
  getDocumentById,
  highlightSearchTerms,
};
