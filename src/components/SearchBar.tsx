
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, isHybridSearch: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHybridSearch, setIsHybridSearch] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, isHybridSearch);
  };

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search your documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-16 py-6 text-lg rounded-lg border-2 border-gray-200 focus:border-search-primary"
          />
          <Button 
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-search-primary hover:bg-blue-700"
          >
            Search
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="hybrid-mode"
            checked={isHybridSearch}
            onCheckedChange={setIsHybridSearch}
          />
          <Label htmlFor="hybrid-mode">
            Use hybrid search 
            <span className="text-sm text-gray-500 ml-2">
              (combines keyword and semantic search for better results)
            </span>
          </Label>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
