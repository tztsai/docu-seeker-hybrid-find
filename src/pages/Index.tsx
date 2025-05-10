
import React, { useState } from 'react';
import { Document } from '@/types/document';
import { documentService } from '@/services/documentService';
import SearchBar from '@/components/SearchBar';
import DocumentCard from '@/components/DocumentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileSearch, Tag } from 'lucide-react';

const Index = () => {
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = (query: string, isHybrid: boolean) => {
    setSearchQuery(query);
    setSearchPerformed(true);
    
    if (query.trim() === '') {
      setSearchResults(documentService.getAllDocuments());
      return;
    }
    
    const results = isHybrid 
      ? documentService.hybridSearch(query) 
      : documentService.keywordSearch(query);
    
    setSearchResults(results);
  };

  // Filter results by category when tab changes
  const filteredResults = activeTab === 'all' 
    ? searchResults 
    : searchResults.filter(doc => 
        doc.category.toLowerCase() === activeTab.toLowerCase());

  // Group documents by category for initial display
  const allDocuments = documentService.getAllDocuments();
  const documentsByCategory: Record<string, Document[]> = {};
  
  allDocuments.forEach(doc => {
    if (!documentsByCategory[doc.category]) {
      documentsByCategory[doc.category] = [];
    }
    documentsByCategory[doc.category].push(doc);
  });

  const categories = Object.keys(documentsByCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Document Search Engine
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search your documents using MongoDB's hybrid search technology combining keywords and semantic understanding
          </p>
        </div>
        
        <div className="flex justify-center mb-10">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        {searchPerformed && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {searchQuery ? `Search results for "${searchQuery}"` : "All Documents"}
              </h2>
              <span className="text-gray-500">
                {filteredResults.length} {filteredResults.length === 1 ? "document" : "documents"} found
              </span>
            </div>

            {searchResults.length > 0 && (
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all" className="flex items-center gap-1">
                    <FileSearch size={16} />
                    <span>All</span>
                  </TabsTrigger>
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category.toLowerCase()} 
                      className="flex items-center gap-1"
                      disabled={!searchResults.some(doc => doc.category.toLowerCase() === category.toLowerCase())}
                    >
                      <Tag size={16} />
                      <span>{category}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {filteredResults.map((doc) => (
                  <DocumentCard 
                    key={doc.id} 
                    document={doc} 
                    searchQuery={searchQuery}
                    highlightText={documentService.highlightSearchTerms} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">No documents found</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or browse all documents
                </p>
              </div>
            )}
          </div>
        )}
        
        {!searchPerformed && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Browse by Category</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map(category => (
                <div key={category} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                    <Tag size={20} className="mr-2 text-search-primary" />
                    {category} 
                    <span className="text-gray-500 text-sm ml-2">
                      ({documentsByCategory[category].length})
                    </span>
                  </h3>
                  
                  <ul className="space-y-3">
                    {documentsByCategory[category].slice(0, 3).map(doc => (
                      <li key={doc.id} className="truncate">
                        <a 
                          href={`/document/${doc.id}`} 
                          className="text-search-primary hover:underline flex items-start"
                        >
                          <BookOpen size={16} className="mr-2 mt-1 flex-shrink-0" />
                          <span>{doc.title}</span>
                        </a>
                      </li>
                    ))}
                    
                    {documentsByCategory[category].length > 3 && (
                      <li className="text-sm text-gray-500 pl-6">
                        + {documentsByCategory[category].length - 3} more documents
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
