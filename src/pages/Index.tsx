import React, { useState, useEffect } from 'react';
import { Document } from '@/types/document';
import { mongoDBService } from '@/services/mongoDBService';
import { apiClient } from '@/services/apiClient';
import SearchBar from '@/components/SearchBar';
import DocumentCard from '@/components/DocumentCard';
import MongoDBConnector from '@/components/MongoDBConnector';
import AppInfo from '@/components/AppInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileSearch, Tag, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSearchState } from '@/hooks/useSearchState';

const Index = () => {
  const {
    searchResults,
    searchQuery,
    searchPerformed,
    isSearching,
    executeSearch,
    clearSearch
  } = useSearchState();

  const [activeTab, setActiveTab] = useState('all');
  const [isMongoConnected, setIsMongoConnected] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Check MongoDB connection status on mount via API
    const checkConnection = async () => {
      const connected = await mongoDBService.checkConnectionStatus();
      setIsMongoConnected(connected);
    };
    checkConnection();
  }, []);

  const handleSearch = async (query: string, isHybrid: boolean) => {
    if (query.trim() === '') {
      clearSearch();
      return;
    }

    try {
      await executeSearch({ query, isHybrid });

      // Extract unique categories
      const uniqueCategories = [...new Set(searchResults
        .map(doc => doc.category)
        .filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again or check your connection.');
    }
  };

  // Filter results by category when tab changes, handle null categories
  const filteredResults = activeTab === 'all'
    ? searchResults
    : searchResults.filter(doc =>
      doc.category?.toLowerCase() === activeTab.toLowerCase());

  // Helper function to highlight search terms in text
  const highlightSearchTerms = (text: string, query: string): string => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="bg-search-highlight">$1</span>');
  };

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

        <div className="flex justify-center items-center mb-10 flex-col gap-4">
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

            {searchResults.length > 0 && categories.length > 0 && (
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
                      disabled={!searchResults.some(doc =>
                        doc.category?.toLowerCase() === category.toLowerCase()
                      )}
                    >
                      <Tag size={16} />
                      <span>{category}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            {isSearching ? (
              <div className="text-center py-12">
                <Loader2 size={40} className="mx-auto text-search-primary animate-spin mb-4" />
                <p className="text-gray-600">Searching documents...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {filteredResults.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    searchQuery={searchQuery}
                    highlightText={highlightSearchTerms}
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

        {!searchPerformed && !isMongoConnected && (
          <div className="max-w-6xl mx-auto text-center py-12">
            <Database size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-6">
              Please connect to MongoDB to start searching your documents
            </p>
            <div className='flex justify-center items-center gap-4'>
              <MongoDBConnector onConnected={setIsMongoConnected} />
            </div>
          </div>
        )}

        {/* App Information */}
        <AppInfo />
      </div>
    </div>
  );
};

export default Index;
