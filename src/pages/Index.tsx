import React, { useState, useEffect } from "react";
import { Document } from "@/types/document";
import { mongoDBService } from "@/services/mongoDBService";
import { apiClient } from "@/services/apiClient";
import SearchBar from "@/components/SearchBar";
import DocumentCard from "@/components/DocumentCard";
import MongoDBConnector from "@/components/MongoDBConnector";
import AppInfo from "@/components/AppInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileSearch, Tag, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSearchState } from "@/hooks/useSearchState";
import { highlightTextWithScores } from "@/lib/utils";

const Index = () => {
  const {
    searchResults,
    searchQuery,
    searchPerformed,
    isSearching,
    executeSearch,
    clearSearch,
  } = useSearchState();

  const [activeTab, setActiveTab] = useState("all");
  const [isMongoConnected, setIsMongoConnected] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Time and location filter state
  const [timeMode, setTimeMode] = useState<"IN" | "BEFORE" | "AFTER">("IN");
  const [selectedYear, setSelectedYear] = useState<string>("any");
  const [selectedMonth, setSelectedMonth] = useState<string>("any");
  const [selectedLocation, setSelectedLocation] = useState<string>("any");

  // Extract unique years and months from searchResults
  const allDates = searchResults.map((doc) => doc.date).filter(Boolean);
  const allYears = Array.from(
    new Set(allDates.map((date) => date?.slice(0, 4)))
  )
    .filter(Boolean)
    .sort();
  const monthsForYear =
    selectedYear !== "any"
      ? Array.from(
          new Set(
            searchResults
              .filter((doc) => doc.date?.slice(0, 4) === selectedYear)
              .map((doc) => doc.date?.slice(5, 7))
          )
        )
          .filter(Boolean)
          .sort()
      : [];

  // Extract unique locations
  const allLocations = Array.from(
    new Set(searchResults.map((doc) => doc.location).filter(Boolean))
  );

  useEffect(() => {
    // Check MongoDB connection status on mount via API
    const checkConnection = async () => {
      const connected = await mongoDBService.checkConnectionStatus();
      setIsMongoConnected(connected);
    };
    checkConnection();
  }, []);

  const handleSearch = async (query: string, isHybrid: boolean) => {
    if (query.trim() === "") {
      clearSearch();
      return;
    }

    try {
      await executeSearch({ query, isHybrid });

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(searchResults.map((doc) => doc.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again or check your connection.");
    }
  };

  // Filter results by category, time, and location
  const filteredResults = searchResults.filter((doc) => {
    // Category
    const categoryMatch =
      activeTab === "all" ||
      doc.category?.toLowerCase() === activeTab.toLowerCase();
    // Location
    const locationMatch =
      selectedLocation === "any" || doc.location === selectedLocation;
    // Time
    let timeMatch = true;
    if (selectedYear !== "any") {
      const docYear = doc.date?.slice(0, 4);
      if (!docYear) return false;
      if (timeMode === "IN") {
        timeMatch = docYear === selectedYear;
      } else if (timeMode === "BEFORE") {
        timeMatch = docYear < selectedYear;
      } else if (timeMode === "AFTER") {
        timeMatch = docYear > selectedYear;
      }
      if (timeMatch && selectedMonth !== "any" && docYear === selectedYear) {
        const docMonth = doc.date?.slice(5, 7);
        timeMatch = docMonth === selectedMonth;
      }
    }
    return categoryMatch && locationMatch && timeMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            J. Krishnamurti's Wisdom Search Engine
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore the profound teachings of philosopher Jiddu Krishnamurti
            through a comprehensive database of transcribed talks, writings, and
            dialogues spanning over 60 years
          </p>
        </div>

        <div className="flex justify-center items-center mb-8 flex-col gap-4">
          <p className="text-sm text-gray-500 italic mb-2">
            "The ability to observe without evaluating is the highest form of
            intelligence."
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchPerformed && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {searchQuery
                  ? `Krishnamurti on "${searchQuery}"`
                  : "All Teachings"}
              </h2>
              <span className="text-gray-500">
                {filteredResults.length}{" "}
                {filteredResults.length === 1 ? "teaching" : "teachings"} found
              </span>
            </div>

            <div className="mb-8">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="bg-amber-50/50 border border-amber-100">
                  <TabsTrigger
                    value="all"
                    className="flex items-center gap-1 data-[state=active]:bg-amber-100/70 data-[state=active]:text-amber-900"
                  >
                    <FileSearch size={16} />
                    <span>All</span>
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category.toLowerCase()}
                      className="flex items-center gap-1 data-[state=active]:bg-amber-100/70 data-[state=active]:text-amber-900"
                      disabled={
                        !searchResults.some(
                          (doc) =>
                            doc.category?.toLowerCase() ===
                            category.toLowerCase()
                        )
                      }
                    >
                      <Tag size={16} />
                      <span>{category}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              {/* Filters for time and location */}
              <div className="flex flex-wrap gap-4 mt-4 items-center">
                {/* Time mode selector */}
                <label className="text-sm font-medium text-gray-700">
                  Time:
                </label>
                <select
                  className="border rounded px-2 py-1"
                  value={timeMode}
                  onChange={(e) =>
                    setTimeMode(e.target.value as "IN" | "BEFORE" | "AFTER")
                  }
                >
                  <option value="IN">IN</option>
                  <option value="BEFORE">BEFORE</option>
                  <option value="AFTER">AFTER</option>
                </select>
                <select
                  className="border rounded px-2 py-1"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedMonth("any");
                  }}
                >
                  <option value="any">Any Year</option>
                  {allYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {selectedYear !== "any" && (
                  <select
                    className="border rounded px-2 py-1"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="any">Any Month</option>
                    {monthsForYear.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                )}
                {/* Location selector */}
                <label className="text-sm font-medium text-gray-700 ml-4">
                  Location:
                </label>
                <select
                  className="border rounded px-2 py-1"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="any">Any Location</option>
                  {allLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isSearching ? (
              <div className="text-center py-12">
                <Loader2
                  size={40}
                  className="mx-auto text-amber-600 animate-spin mb-4"
                />
                <p className="text-gray-600">
                  Searching Krishnamurti's teachings...
                </p>
                <p className="text-xs text-gray-400 mt-2 italic max-w-md mx-auto">
                  "In the search for truth, beauty, and love, man comes
                  naturally to himself."
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
                <BookOpen
                  size={48}
                  className="mx-auto text-amber-600/70 mb-4"
                />
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  No teachings found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try different keywords or phrases from Krishnamurti's
                  teachings
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
            <h3 className="text-2xl font-medium text-gray-800 mb-3">
              Connect to the Krishnamurti Archive
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect to the database to begin exploring Krishnamurti's
              teachings, spanning from 1933 to 1986
            </p>
            <div className="flex flex-col justify-center items-center gap-4">
              <MongoDBConnector onConnected={setIsMongoConnected} />
              <div className="mt-6 px-6 py-3 bg-white border-l-4 border-l-amber-300 border-t border-r border-b border-gray-100 rounded-md shadow-sm inline-block">
                <p className="text-sm text-amber-800 italic">
                  "Freedom is found in the choiceless awareness of our daily
                  existence and activity."
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
