import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, X, Clock, TrendingUp, Building, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchSuggestion {
  type: 'job' | 'company' | 'location' | 'skill' | 'recent' | 'trending';
  value: string;
  label: string;
  count?: number;
  company?: string;
}

interface SmartSearchProps {
  className?: string;
  onSearch?: (jobQuery: string, locationQuery: string) => void;
}

const SmartSearch = ({ className = "", onSearch }: SmartSearchProps) => {
  const [jobQuery, setJobQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [jobSuggestions, setJobSuggestions] = useState<SearchSuggestion[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<SearchSuggestion[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedJobIndex, setSelectedJobIndex] = useState(-1);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const jobInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const jobSuggestionsRef = useRef<HTMLDivElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  // Debounce function
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedJobQuery = useDebounce(jobQuery, 300);
  const debouncedLocationQuery = useDebounce(locationQuery, 300);

  // Load recent searches from localStorage
  const getRecentSearches = useCallback(() => {
    try {
      const recent = localStorage.getItem('recentSearches');
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  }, []);

  // Save search to localStorage
  const saveSearch = useCallback((jobTerm: string, locationTerm: string) => {
    try {
      const recent = getRecentSearches();
      const newSearch = { job: jobTerm, location: locationTerm, timestamp: Date.now() };
      const updated = [newSearch, ...recent.filter((s: any) => s.job !== jobTerm || s.location !== locationTerm)]
        .slice(0, 5); // Keep only 5 recent searches
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }, [getRecentSearches]);

  // Fetch job suggestions
  const fetchJobSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setJobSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('title, company, skills')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,company.ilike.%${query}%,skills.cs.{${query}}`)
        .limit(8);

      if (error) throw error;

      const suggestions: SearchSuggestion[] = [];
      const addedTitles = new Set<string>();
      const addedCompanies = new Set<string>();

      // Add job titles
      jobs?.forEach(job => {
        if (!addedTitles.has(job.title.toLowerCase()) && 
            job.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            type: 'job',
            value: job.title,
            label: job.title,
            company: job.company
          });
          addedTitles.add(job.title.toLowerCase());
        }
      });

      // Add companies
      jobs?.forEach(job => {
        if (!addedCompanies.has(job.company.toLowerCase()) && 
            job.company.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            type: 'company',
            value: job.company,
            label: job.company,
            count: jobs.filter(j => j.company === job.company).length
          });
          addedCompanies.add(job.company.toLowerCase());
        }
      });

      // Add skills
      const skillMatches = new Set<string>();
      jobs?.forEach(job => {
        job.skills.forEach(skill => {
          if (skill.toLowerCase().includes(query.toLowerCase()) && 
              !skillMatches.has(skill.toLowerCase())) {
            suggestions.push({
              type: 'skill',
              value: skill,
              label: skill
            });
            skillMatches.add(skill.toLowerCase());
          }
        });
      });

      // Add recent searches if no other matches
      if (suggestions.length < 3) {
        const recent = getRecentSearches();
        recent.forEach((search: any) => {
          if (search.job.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
              type: 'recent',
              value: search.job,
              label: search.job
            });
          }
        });
      }

      setJobSuggestions(suggestions.slice(0, 8));
    } catch (error) {
      console.error('Error fetching job suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getRecentSearches]);

  // Fetch location suggestions
  const fetchLocationSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('location')
        .eq('is_active', true)
        .ilike('location', `%${query}%`)
        .limit(8);

      if (error) throw error;

      const locationCounts = new Map<string, number>();
      jobs?.forEach(job => {
        const count = locationCounts.get(job.location) || 0;
        locationCounts.set(job.location, count + 1);
      });

      const suggestions: SearchSuggestion[] = [];
      locationCounts.forEach((count, location) => {
        suggestions.push({
          type: 'location',
          value: location,
          label: location,
          count
        });
      });

      // Add common location options
      const commonLocations = ['Remote', 'Hybrid', 'On-site'];
      commonLocations.forEach(loc => {
        if (loc.toLowerCase().includes(query.toLowerCase()) && 
            !suggestions.some(s => s.value === loc)) {
          suggestions.push({
            type: 'location',
            value: loc,
            label: loc
          });
        }
      });

      setLocationSuggestions(suggestions.slice(0, 8));
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  }, []);

  // Effects for debounced searches
  useEffect(() => {
    if (debouncedJobQuery && showJobSuggestions) {
      fetchJobSuggestions(debouncedJobQuery);
    }
  }, [debouncedJobQuery, showJobSuggestions, fetchJobSuggestions]);

  useEffect(() => {
    if (debouncedLocationQuery && showLocationSuggestions) {
      fetchLocationSuggestions(debouncedLocationQuery);
    }
  }, [debouncedLocationQuery, showLocationSuggestions, fetchLocationSuggestions]);

  // Keyboard navigation
  const handleJobKeyDown = (e: React.KeyboardEvent) => {
    if (!showJobSuggestions || jobSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedJobIndex(prev => 
          prev < jobSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedJobIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedJobIndex >= 0) {
          selectJobSuggestion(jobSuggestions[selectedJobIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowJobSuggestions(false);
        setSelectedJobIndex(-1);
        break;
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (!showLocationSuggestions || locationSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedLocationIndex(prev => 
          prev < locationSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedLocationIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedLocationIndex >= 0) {
          selectLocationSuggestion(locationSuggestions[selectedLocationIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowLocationSuggestions(false);
        setSelectedLocationIndex(-1);
        break;
    }
  };

  const selectJobSuggestion = (suggestion: SearchSuggestion) => {
    setJobQuery(suggestion.value);
    setShowJobSuggestions(false);
    setSelectedJobIndex(-1);
    locationInputRef.current?.focus();
  };

  const selectLocationSuggestion = (suggestion: SearchSuggestion) => {
    setLocationQuery(suggestion.value);
    setShowLocationSuggestions(false);
    setSelectedLocationIndex(-1);
  };

  const handleSearch = () => {
    if (jobQuery.trim() || locationQuery.trim()) {
      saveSearch(jobQuery, locationQuery);
      
      if (onSearch) {
        onSearch(jobQuery, locationQuery);
      } else {
        // Navigate to jobs page with search params
        const params = new URLSearchParams();
        if (jobQuery.trim()) params.set('q', jobQuery.trim());
        if (locationQuery.trim()) params.set('location', locationQuery.trim());
        navigate(`/jobs?${params.toString()}`);
      }
    }
  };

  const clearJobQuery = () => {
    setJobQuery("");
    setJobSuggestions([]);
    setShowJobSuggestions(false);
    jobInputRef.current?.focus();
  };

  const clearLocationQuery = () => {
    setLocationQuery("");
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    locationInputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Search className="w-4 h-4" />;
      case 'company':
        return <Building className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'recent':
        return <Clock className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0 text-inherit">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col md:flex-row gap-3 p-2 bg-white/95 backdrop-blur rounded-2xl shadow-large">
        {/* Job Search Input */}
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 px-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              ref={jobInputRef}
              placeholder="Job title, company, or keyword"
              value={jobQuery}
              onChange={(e) => setJobQuery(e.target.value)}
              onFocus={() => setShowJobSuggestions(true)}
              onBlur={() => {
                // Delay hiding to allow suggestion clicks
                setTimeout(() => setShowJobSuggestions(false), 200);
              }}
              onKeyDown={handleJobKeyDown}
              className="border-0 bg-transparent focus-visible:ring-0 text-lg"
            />
            {jobQuery && (
              <button
                onClick={clearJobQuery}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          
          {/* Job Suggestions Dropdown */}
          {showJobSuggestions && jobSuggestions.length > 0 && (
            <div
              ref={jobSuggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {jobSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  onClick={() => selectJobSuggestion(suggestion)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                    index === selectedJobIndex ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="text-muted-foreground">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {highlightMatch(suggestion.label, jobQuery)}
                    </div>
                    {suggestion.company && (
                      <div className="text-xs text-muted-foreground truncate">
                        at {suggestion.company}
                      </div>
                    )}
                    {suggestion.count && (
                      <div className="text-xs text-muted-foreground">
                        {suggestion.count} jobs
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {suggestion.type}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Search Input */}
        <div className="flex items-center gap-2 px-4 border-l border-border relative">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <Input
            ref={locationInputRef}
            placeholder="Location"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            onFocus={() => setShowLocationSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowLocationSuggestions(false), 200);
            }}
            onKeyDown={handleLocationKeyDown}
            className="border-0 bg-transparent focus-visible:ring-0 text-lg"
          />
          {locationQuery && (
            <button
              onClick={clearLocationQuery}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Location Suggestions Dropdown */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div
              ref={locationSuggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  onClick={() => selectLocationSuggestion(suggestion)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                    index === selectedLocationIndex ? 'bg-muted/50' : ''
                  }`}
                >
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {highlightMatch(suggestion.label, locationQuery)}
                    </div>
                    {suggestion.count && (
                      <div className="text-xs text-muted-foreground">
                        {suggestion.count} jobs
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button 
          size="lg" 
          onClick={handleSearch}
          className="bg-gradient-primary border-0 hover:opacity-90 transition-all px-8"
        >
          Search Jobs
        </Button>
      </div>
    </div>
  );
};

export default SmartSearch;