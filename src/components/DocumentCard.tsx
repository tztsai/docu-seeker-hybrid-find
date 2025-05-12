import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Tag } from 'lucide-react';
import { Document } from '@/types/document';
import { Link } from 'react-router-dom';
import { highlightTextWithScores } from '@/lib/utils';

interface DocumentCardProps {
  document: Document;
  searchQuery?: string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  searchQuery = ''
}) => {
  // Truncate content for preview
  const contentPreview = document.content.length > 200
    ? document.content.substring(0, 200) + '...'
    : document.content;

  // Use highlights array if available, otherwise fall back to search query
  let highlightedTitle;
  let highlightedContent;

  if (document.highlights && document.highlights.length > 0) {
    // Use score-based highlighting when we have highlight objects
    highlightedTitle = <div dangerouslySetInnerHTML={{
      __html: highlightTextWithScores(document.title, document.highlights)
    }} />;

    highlightedContent = <div dangerouslySetInnerHTML={{
      __html: highlightTextWithScores(contentPreview, document.highlights)
    }} />;
  } else if (searchQuery) {
    highlightedTitle = <div dangerouslySetInnerHTML={{
      __html: highlightText(document.title, searchQuery)
    }} />;

    highlightedContent = <div dangerouslySetInnerHTML={{
      __html: highlightText(contentPreview, searchQuery)
    }} />;
  } else {
    highlightedTitle = document.title;
    highlightedContent = contentPreview;
  }

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
          {document.tags && document.tags.length > 0 && (
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
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

const highlightText = (text: string, query: string): string => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="bg-search-highlight">$1</span>');
};

export default DocumentCard;
