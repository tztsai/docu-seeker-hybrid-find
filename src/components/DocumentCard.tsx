
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Tag } from 'lucide-react';
import { Document } from '@/types/document';
import { Link } from 'react-router-dom';

interface DocumentCardProps {
  document: Document;
  searchQuery?: string;
  highlightText?: (text: string, query: string) => string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  searchQuery = '',
  highlightText = (text) => text, 
}) => {
  // Truncate content for preview
  const contentPreview = document.content.length > 200 
    ? document.content.substring(0, 200) + '...' 
    : document.content;
  
  // If we have a search query and highlight function, use it
  const highlightedTitle = searchQuery 
    ? <div dangerouslySetInnerHTML={{ __html: highlightText(document.title, searchQuery) }} /> 
    : document.title;
  
  const highlightedContent = searchQuery 
    ? <div dangerouslySetInnerHTML={{ __html: highlightText(contentPreview, searchQuery) }} />
    : contentPreview;

  return (
    <Link to={`/document/${document.id}`} className="block hover:no-underline">
      <Card className="h-full hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold text-left">
              {highlightedTitle}
            </CardTitle>
            <Badge variant="outline" className="bg-gray-100">
              {document.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-left">
          <p className="text-gray-700 mb-4">
            {highlightedContent}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{document.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{document.author}</span>
          </div>
          <div className="flex flex-wrap gap-1 items-center">
            <Tag size={14} />
            {document.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="font-normal text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="secondary" className="font-normal text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DocumentCard;
