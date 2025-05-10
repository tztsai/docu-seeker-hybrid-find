import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Tag, Bookmark, Share2, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mongoDBService } from '@/services/mongoDBService';
import { apiClient } from '@/services/apiClient';
import { Document } from '@/types/document';

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Check if MongoDB is connected
        const isConnected = mongoDBService.isConnected();

        if (isConnected) {
          // Use API to fetch document
          const doc = await apiClient.getDocument(id);
          setDocument(doc);
        } else {
          setError('Please connect to MongoDB to view documents');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document. Please check your MongoDB connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="flex items-center text-search-primary hover:underline mb-6">
            <ArrowLeft size={18} className="mr-1" /> Back to search
          </Link>
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Document Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "The document you're looking for doesn't exist or has been removed."}
            </p>
            <Button asChild>
              <Link to="/">Return to Search</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="flex items-center text-search-primary hover:underline mb-6">
          <ArrowLeft size={18} className="mr-1" /> Back to search
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <Badge variant="outline" className="text-sm font-medium">
              {document.category}
            </Badge>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-gray-600">
                <Bookmark size={16} className="mr-1" /> Save
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600">
                <Share2 size={16} className="mr-1" /> Share
              </Button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{document.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>{document.date}</span>
            </div>
            <div className="flex items-center">
              <User size={16} className="mr-1" />
              <span>{document.author}</span>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">
              {document.content}
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-gray-600" />
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
