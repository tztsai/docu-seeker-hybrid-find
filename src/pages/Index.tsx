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
import { highlightTextWithScores } from '@/lib/utils';

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            J. Krishnamurti's Wisdom Search Engine
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore the profound teachings of philosopher Jiddu Krishnamurti through a comprehensive database of transcribed talks, writings, and dialogues spanning over 60 years
          </p>
        </div>

        <div className="flex justify-center items-center mb-8 flex-col gap-4">
          <p className="text-sm text-gray-500 italic mb-2">
            "The ability to observe without evaluating is the highest form of intelligence."
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchPerformed && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {searchQuery ? `Krishnamurti on "${searchQuery}"` : "All Teachings"}
              </h2>
              <span className="text-gray-500">
                {filteredResults.length} {filteredResults.length === 1 ? "teaching" : "teachings"} found
              </span>
            </div>

            {searchResults.length > 0 && categories.length > 0 && (
              <div className="mb-8">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-amber-50/50 border border-amber-100">
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center gap-1 data-[state=active]:bg-amber-100/70 data-[state=active]:text-amber-900"
                    >
                      <FileSearch size={16} />
                      <span>All</span>
                    </TabsTrigger>
                    {categories.map(category => (
                      <TabsTrigger
                        key={category}
                        value={category.toLowerCase()}
                        className="flex items-center gap-1 data-[state=active]:bg-amber-100/70 data-[state=active]:text-amber-900"
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
              </div>
            )}

            {isSearching ? (
              <div className="text-center py-12">
                <Loader2 size={40} className="mx-auto text-amber-600 animate-spin mb-4" />
                <p className="text-gray-600">Searching Krishnamurti's teachings...</p>
                <p className="text-xs text-gray-400 mt-2 italic max-w-md mx-auto">
                  "In the search for truth, beauty, and love, man comes naturally to himself."
                </p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {filteredResults.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border-l-4 border-l-amber-300 border-t border-r border-b border-gray-100">
                <BookOpen size={48} className="mx-auto text-amber-600/70 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">No teachings found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try different keywords or phrases from Krishnamurti's teachings
                </p>
                <div className="mt-6 px-4 py-3 bg-amber-50/50 inline-block rounded-lg">
                  <p className="text-sm text-amber-800 italic">
                    "Truth is a pathless land" — J. Krishnamurti
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {!searchPerformed && !isMongoConnected && (
          <div className="max-w-6xl mx-auto text-center py-12">
            <div className="bg-amber-50/70 inline-block rounded-full p-6 mb-8 shadow-inner">
              <Database size={64} className="mx-auto text-amber-700/70" />
            </div>
            <h3 className="text-2xl font-medium text-gray-800 mb-3">Connect to the Krishnamurti Archive</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect to the database to begin exploring Krishnamurti's teachings, spanning from 1933 to 1986
            </p>
            <div className='flex flex-col justify-center items-center gap-4'>
              <MongoDBConnector onConnected={setIsMongoConnected} />
              <div className="mt-6 px-6 py-3 bg-white border-l-4 border-l-amber-300 border-t border-r border-b border-gray-100 rounded-md shadow-sm inline-block">
                <p className="text-sm text-amber-800 italic">
                  "Freedom is found in the choiceless awareness of our daily existence and activity."
                </p>
                <p className="text-xs text-gray-500 mt-1">— J. Krishnamurti</p>
              </div>
            </div>
          </div>
        )}

        {/* <AppInfo /> */}
      </div>
    </div>
  );
};

export default Index;
