import { useUserListGet } from './useUserListGet';
import { useState, useEffect } from 'react';
import { MathDocument, MathDocumentPage } from 'types/mathDocuments';

interface UseListSearchOptions<T = any> {
    searchQuery: string;
    userIds: string[];
    searchKey: string; // Required: the key to search
    additionalKeys?: string[]; // Optional: additional keys to fetch (like pages)
    preserveResultsDuringLoading?: boolean; // New prop to enable caching behavior
}

interface UseListSearchResult<T = any> {
    items: T[] | undefined;
    additionalItems?: any[][] | undefined; // For additional keys like pages
    isLoading: boolean;
    hasResults: boolean;
    resultCount: number;
}

/**
 * Generic hook for searching any list with real-time search functionality.
 * Encapsulates all search logic and provides clean, reusable interface.
 * 
 * @param options - Search configuration options
 * @param options.searchQuery - The search query string
 * @param options.userIds - Array of user IDs to search within
 * @param options.searchKey - The key to search (required)
 * @param options.additionalKeys - Optional additional keys to fetch (e.g., related data)
 * @param options.preserveResultsDuringLoading - If true, maintains last successful results during loading (default: true)
 * @returns Object containing search results and metadata
 */
export function useListSearch<T = any>({ 
    searchQuery, 
    userIds, 
    searchKey,
    additionalKeys,
    preserveResultsDuringLoading = true,
}: UseListSearchOptions<T>): UseListSearchResult<T> {
    // Get primary items with search functionality
    const items = useUserListGet<T>({
        key: searchKey,
        userIds,
        searchFor: searchQuery.trim() || undefined,
    });

    // Get additional items if specified (like pages for documents)
    const additionalItems = additionalKeys?.map(key => 
        useUserListGet<any>({
            key,
            userIds,
        })
    );

    // Convert UserListRecord arrays to clean value arrays
    const itemValues = items?.map(item => item.value);
    const additionalItemValues = additionalItems?.map(results => 
        results?.map(item => item.value) ?? []
    );

    // Calculate derived state
    const isLoading = items === undefined || additionalItems?.some(result => result === undefined);
    const hasResults = Boolean(itemValues && itemValues.length > 0);
    const resultCount = itemValues?.length ?? 0;

    // Cache logic for preserving results during loading
    const [cachedItems, setCachedItems] = useState<T[] | undefined>();
    const [cachedAdditionalItems, setCachedAdditionalItems] = useState<any[][] | undefined>();

    useEffect(() => {
        // Only update cache when we have real data (not loading and has results)
        if (!isLoading && itemValues && itemValues.length > 0) {
            setCachedItems(itemValues);
            setCachedAdditionalItems(additionalItemValues);
        }
    }, [isLoading, itemValues, additionalItemValues]);

    // Return cached results during loading if preservation is enabled
    const displayItems = (preserveResultsDuringLoading && isLoading && cachedItems) ? cachedItems : itemValues;
    const displayAdditionalItems = (preserveResultsDuringLoading && isLoading && cachedAdditionalItems) ? cachedAdditionalItems : additionalItemValues;

    // Recalculate derived state based on display items
    const displayHasResults = Boolean(displayItems && displayItems.length > 0);
    const displayResultCount = displayItems?.length ?? 0;

    return {
        items: displayItems,
        additionalItems: displayAdditionalItems,
        isLoading: isLoading || false,
        hasResults: displayHasResults,
        resultCount: displayResultCount,
    };
}

/**
 * Convenience hook specifically for document search
 * @deprecated Use useListSearch instead for more flexibility
 */
export function useDocumentSearch({ 
    searchQuery, 
    userIds, 
}: { searchQuery: string; userIds: string[] }) {
    const result = useListSearch<MathDocument>({
        searchQuery,
        userIds,
        searchKey: 'mathDocuments',
        additionalKeys: ['mathDocumentPages'],
        preserveResultsDuringLoading: true, // Default to true for backward compatibility
    });

    // Transform the generic result back to the specific document interface
    return {
        documents: result.items,
        pages: result.additionalItems?.[0],
        isLoading: result.isLoading,
        hasResults: result.hasResults,
        resultCount: result.resultCount,
    };
}
