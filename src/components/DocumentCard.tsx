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
  // Find the position of the first highlight in content if available
  let startPosition = 0;
  const maxPreviewLength = 360;

  if (document.highlights && document.highlights.length > 0) {
    // Sort by score to get the most relevant highlight first
    const topHighlight = [...document.highlights].sort((a, b) => b.score - a.score)[0];
    // Find position of this highlight in the content
    startPosition = Math.max(0, document.content.indexOf(topHighlight.content) - 60); // Start 60 chars before highlight
  } else if (searchQuery) {
    // If no highlights but a search query exists, try to find the query in content
    const queryPos = document.content.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (queryPos >= 0) {
      startPosition = Math.max(0, queryPos - 60); // Start 60 chars before the search query match
    }
  }

  // Create content preview starting from the highlight position
  let contentPreview;
  if (startPosition > 0) {
    contentPreview = '...' + document.content.substring(
      startPosition,
      startPosition + maxPreviewLength
    ) + (document.content.length > startPosition + maxPreviewLength ? '...' : '');
  } else {
    contentPreview = document.content.length > maxPreviewLength
      ? document.content.substring(0, maxPreviewLength) + '...'
      : document.content;
  }

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
    <Link to={`/document/${document.id}`} className="block hover:no-underline h-full">
      <Card className="h-full hover:shadow-md transition-all duration-300 border-l-4 border-l-amber-600/40 hover:border-l-amber-600 group bg-gradient-to-b from-white to-amber-50/30 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold text-left text-gray-800 group-hover:text-amber-900 transition-colors">
              {highlightedTitle}
            </CardTitle>
            <Badge variant="outline" className="bg-amber-50/60 text-amber-800 border-amber-200">
              {document.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-left flex-grow">
          <p className="text-gray-700 mb-1 text-sm leading-relaxed">
            {highlightedContent}
          </p>
        </CardContent>
        <CardFooter className="pt-0 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-amber-700/60" />
            <span>{document.date}</span>
          </div>
          {/* <div className="flex items-center gap-1">
            <User size={12} className="text-amber-700/60" />
            <span>{document.author || "J. Krishnamurti"}</span>
          </div> */}
          {/* Show source and location as badges if present */}
          {document.date && (
            <div className="flex items-center gap-1">
              <Calendar size={12} className="text-amber-700/60" />
              <Badge variant="secondary" className="font-normal text-xs bg-amber-50 text-amber-800 hover:bg-amber-100">
                {document.date}
              </Badge>
            </div>
          )}
          {document.source && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="font-normal text-xs bg-amber-50 text-amber-800 hover:bg-amber-100">
                {document.source}
              </Badge>
            </div>
          )}
          {document.location && (
            <div className="flex items-center gap-1">
              <Tag size={12} className="text-amber-700/60" />
              <Badge variant="secondary" className="font-normal text-xs bg-amber-50 text-amber-800 hover:bg-amber-100">
                {document.location}
              </Badge>
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
