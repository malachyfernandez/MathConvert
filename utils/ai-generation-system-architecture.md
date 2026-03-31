# AI Generation System Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [GenerationContext - Global State Management](#generationcontext)
3. [ChatOptionsDialog - Regeneration Trigger](#chatoptionsdialog)
4. [useMathGeneration Hook - Core Logic](#usemathgeneration)
5. [DocumentContent - Main Editor Interface](#documentcontent)
6. [DocumentEditor - Page Management](#documenteditor)
7. [PageListItem - Status Display](#pagelistitem)
8. [Convex Database Integration](#convex)
9. [Component Lifecycle & Re-rendering](#lifecycle)
10. [Error Handling & Timeouts](#errors)
11. [Data Flow Analysis](#data-flow)
12. [Root Cause Analysis](#root-cause)
13. [Complete Generation Timeline](#timeline)

---

## System Overview

The AI generation system is a multi-layer architecture that converts handwritten notes to Markdown with LaTeX support. It manages generation state, UI updates, data persistence, and user interactions across multiple components.

**Key Components:**
- GenerationContext (Global state)
- ChatOptionsDialog (Regeneration trigger)
- useMathGeneration hook (Core logic)
- DocumentContent (Editor interface)
- DocumentEditor (Page management)

---

## GenerationContext {#generationcontext}

**File:** `contexts/GenerationContext.tsx`

**Purpose:** Centralized state for generation tracking across the entire app

### Interface Definition
```typescript
interface GenerationContextType {
  generatingPages: Set<string>;
  recentlyCompletedPages: Set<string>;
  setGeneratingPage: (pageId: string, isGenerating: boolean) => void;
  isPageGenerating: (pageId: string) => boolean;
  isPageRecentlyCompleted: (pageId: string) => boolean;
  clearRecentlyCompleted: (pageId: string) => void;
  clearRecentlyCompletedForActivePage: (pageId: string) => void;
}
```

### Core State Management
```typescript
export const GenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generatingPages, setGeneratingPages] = useState<Set<string>>(new Set());
  const [recentlyCompletedPages, setRecentlyCompletedPages] = useState<Set<string>>(new Set());
```

### Generation State Logic
```typescript
const setGeneratingPage = (pageId: string, isGenerating: boolean) => {
  setGeneratingPages(prev => {
    const newSet = new Set(prev);
    if (isGenerating) {
      newSet.add(pageId);
      // Remove from recently completed when starting new generation
      setRecentlyCompletedPages(completed => {
        const newCompleted = new Set(completed);
        newCompleted.delete(pageId);
        return newCompleted;
      });
    } else {
      newSet.delete(pageId);
      // Add to recently completed when generation finishes
      setRecentlyCompletedPages(completed => {
        const newCompleted = new Set(completed);
        newCompleted.add(pageId);
        return newCompleted;
      });
    }
    return newSet;
  });
};
```

### Auto-Clear Checkmark Logic
```typescript
const clearRecentlyCompletedForActivePage = (pageId: string) => {
  // Clear the checkmark if the page is currently active
  if (recentlyCompletedPages.has(pageId)) {
    clearRecentlyCompleted(pageId);
  }
};
```

**Data Flow:** 
```
Generation starts → page.id added to generatingPages
Generation ends → page.id moved to recentlyCompletedPages  
Page becomes active → page.id removed from recentlyCompletedPages
```

---

## ChatOptionsDialog {#chatoptionsdialog}

**File:** `app/components/document/ChatOptionsDialog.tsx`

**Purpose:** Handles "Regenerate from scratch" functionality

### Regeneration Handler
```typescript
const handleRegenerate = async () => {
  // Close the modal immediately
  setIsOpen(false);
  
  // Capture the original page ID before starting generation
  setOriginalPageId(page.id);
  
  // Clear the editor first
  onUpdateMarkdown('');

  // Set the global generation state BEFORE starting generation
  setGeneratingPage(page.id, true);

  // Perform regeneration with cleared markdown
  try {
    await handleInitialGeneration();
  } finally {
    // Clear the global generation state after completion
    setGeneratingPage(page.id, false);
    // Clear the original page ID after generation completes
    setOriginalPageId(null);
  }
};
```

### Safety Check Logic
```typescript
shouldUpdatePage: () => {
  // Check if the current page ID matches the original page ID we captured
  // This ensures we only update if the user is still on the same page
  return page.id === originalPageId;
}
```

### Follow-up Management
```typescript
onFollowUpUpdate: (resultingMarkdown: string) => {
  // Simple approach: add the follow-up only after generation completes
  const regenerationFollowUp = {
    id: generateId(),
    prompt: 'Regenerated from scratch',
    createdAt: Date.now(),
    resultingMarkdown, // Add the result immediately
  };
  
  const updatedFollowUps = [...currentFollowUps, regenerationFollowUp];
  setCurrentFollowUps(updatedFollowUps);
  const updatedPage = { ...page, followUps: updatedFollowUps };
  onUpdatePage(updatedPage, 'Added regeneration follow-up with result');
}
```

**Critical Issue:** The `onUpdateMarkdown('')` immediately clears the editor, but the generation completion doesn't trigger tab updates because the component doesn't detect the change properly.

---

## useMathGeneration {#usemathgeneration}

**File:** `hooks/useMathGeneration.ts`

**Purpose:** Core AI generation logic and state management

### Hook Interface
```typescript
interface UseMathGenerationProps {
  page: MathDocumentPage;
  onUpdatePage: (nextPage: MathDocumentPage, description: string) => void;
  onUpdateMarkdown: (markdown: string) => void;
  onFollowUpUpdate?: (resultingMarkdown: string);
  shouldUpdatePage?: () => boolean;
}
```

### Core Generation Logic
```typescript
const handleInitialGeneration = async () => {
  if (!page.imageUrl) {
    setErrorMessage('Add an image before asking the AI to convert the page.');
    return;
  }

  try {
    setIsGenerating(true);
    setErrorMessage('');

    const result = await convertMathImageToMarkdown({
      imageUrl: page.imageUrl,
      guidance: aiGuidance.value,
      currentMarkdown: page.markdown,
      followUpPrompt: undefined,
    });

    const nextPage = {
      ...page,
      markdown: result.markdown,
      lastAiPrompt: aiGuidance.value,
      lastGeneratedAt: Date.now(),
    };

    // Only update if we should still update this page
    if (!shouldUpdatePage || shouldUpdatePage()) {
      onUpdatePage(nextPage, 'Generated page markdown from image');
      onUpdateMarkdown(result.markdown);

      // Call follow-up update callback if provided
      if (onFollowUpUpdate) {
        onFollowUpUpdate(result.markdown);
      }
    }
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
  } finally {
    setIsGenerating(false);
  }
};
```

### AI Guidance Configuration
```typescript
// Get user-wide AI guidance
const [aiGuidance] = useUserVariable({
  key: 'aiGuidance',
  defaultValue: 'Convert this handwritten math to Markdown + LaTeX with exact transcription.',
  privacy: 'PRIVATE'
});
```

**Safety Mechanism:** `shouldUpdatePage()` ensures we only update if the user hasn't navigated away.

---

## DocumentContent {#documentcontent}

**File:** `app/components/document/DocumentContent.tsx`

**Purpose:** Manages tabs, editor state, and generation UI

### State Management
```typescript
const [markdownDraft, setMarkdownDraft] = useState(activePage.markdown);
const [activeTab, setActiveTab] = useState('preview');
const [errorMessage, setErrorMessage] = useState('');
const [headerHeight, setHeaderHeight] = useState(0);
const [footerHeight, setFooterHeight] = useState(0);
const [dotCount, setDotCount] = useState(1);

const isGenerating = isPageGenerating(activePage.id);
const hasChanges = markdownDraft !== activePage.markdown;
```

### Critical Sync Logic
```typescript
// Sync markdownDraft when activePage changes (e.g., after AI generation)
useEffect(() => {
  setMarkdownDraft(activePage.markdown);
}, [activePage.markdown]);
```

### Generation Animation Logic
```typescript
// Animate dots during generation
useEffect(() => {
  if (isGenerating) {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  } else {
    setDotCount(1);
  }
}, [isGenerating]);
```

### Initial Generation Handler
```typescript
const handleInitialGeneration = async () => {
  // Capture the current page data at the start of generation
  const currentPage = activePage;

  if (!currentPage.imageUrl) {
    setErrorMessage('Add an image before asking the AI to convert the page.');
    return;
  }

  try {
    setGeneratingPage(currentPage.id, true);
    setErrorMessage('');

    const result = await convertMathImageToMarkdown({
      imageUrl: currentPage.imageUrl,
      guidance: aiGuidance.value,
      currentMarkdown: currentPage.markdown,
      followUpPrompt: undefined,
    });

    const nextPage = {
      ...currentPage,
      markdown: result.markdown,
      lastAiPrompt: aiGuidance.value,
      lastGeneratedAt: Date.now(),
    };

    replacePageWithUndo(nextPage, 'Generated page markdown from image');

    // Only update markdown draft if we're still on the same page
    if (activePage.id === currentPage.id) {
      setMarkdownDraft(result.markdown);
    }
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
  } finally {
    setGeneratingPage(currentPage.id, false);
  }
};
```

### Tab Management Logic
```typescript
const handleTabChange = (newTab: string) => {
  // When switching from editor to preview, capture the current state for undo
  if (activeTab === 'editor' && newTab === 'preview' && hasChanges) {
    const currentPage = createUndoSnapshot(activePage);
    const updatedPage = {
      ...activePage,
      markdown: markdownDraft,
    };
    
    executeCommand({
      action: () => {
        // Don't actually save to cloud, just track the state change
        setMarkdownDraft(markdownDraft);
      },
      undoAction: () => {
        // Restore the previous markdown draft
        setMarkdownDraft(activePage.markdown);
      },
      description: `Edited content in editor tab - ${activePage.title}`
    });
  }
  
  setActiveTab(newTab);
};
```

### Follow-up Monitoring Logic
```typescript
// Monitor for generation completion and add follow-up
useEffect(() => {
  // Check if generation just completed (was generating, now not generating)
  // and if we have a recent generation with markdown but no corresponding follow-up
  if (!isGenerating && activePage.lastGeneratedAt && activePage.markdown && activePage.lastAiPrompt) {
    // Look for a follow-up with the same generation timestamp
    const hasMatchingFollowUp = activePage.followUps.some(followUp => 
      followUp.prompt === activePage.lastAiPrompt &&
      followUp.resultingMarkdown === activePage.markdown &&
      Math.abs(followUp.createdAt - (activePage.lastGeneratedAt || 0)) < 5000 // Within 5 seconds
    );

    // If no matching follow-up exists, add one
    if (!hasMatchingFollowUp) {
      const updatedPage = {
        ...activePage,
        followUps: [
          ...activePage.followUps,
          {
            id: generateId(),
            prompt: activePage.lastAiPrompt,
            createdAt: activePage.lastGeneratedAt || Date.now(),
            resultingMarkdown: activePage.markdown,
          }
        ]
      };
      onReplacePage(updatedPage, 'Added initial generation follow-up');
    }
  }
}, [isGenerating, activePage.markdown, activePage.lastGeneratedAt, activePage.lastAiPrompt, activePage.followUps]);
```

**Tab Management:**
- **Editor Tab**: Shows `markdownDraft` (local state)
- **Preview Tab**: Shows `markdownDraft` (local state)  
- **Generation State**: Controls UI elements and animations

---

## DocumentEditor {#documenteditor}

**File:** `app/components/document/DocumentEditor.tsx`

**Purpose:** Manages active page and data persistence

### Auto-Clear Checkmark Logic
```typescript
// Clear checkmark when active page changes
useEffect(() => {
  if (activePageId) {
    clearRecentlyCompletedForActivePage(activePageId);
  }
}, [activePageId, clearRecentlyCompletedForActivePage]);
```

### Page Replacement Logic
```typescript
const replacePage = (nextPage: MathDocumentPage, _description: string) => {
  void setPage({
    key: 'mathDocumentPages',
    itemId: nextPage.id,
    value: nextPage,
    privacy: 'PUBLIC',
    filterKey: 'documentId',
    searchKeys: ['title', 'markdown'],
    sortKey: 'pageNumber',
  });
};
```

### Undo/Redo Integration
```typescript
const replacePageWithUndo = (nextPage: MathDocumentPage, description: string) => {
  if (!activePage) return;
  
  const previousPage = createUndoSnapshot(activePage);
  const nextPageSnapshot = createUndoSnapshot(nextPage);

  executeCommand({
    action: () => replacePage(nextPage, description),
    undoAction: () => replacePage(previousPage, description),
    description: `${description} - ${activePage.title}`
  });
};
```

---

## Data Flow Analysis {#data-flow}

### Normal Generation Flow (DocumentContent Button)
```typescript
// 1. User clicks "Generate Markdown" in DocumentContent
handleInitialGeneration()

// 2. Set generation state
setGeneratingPage(currentPage.id, true)

// 3. API call
const result = await convertMathImageToMarkdown({...})

// 4. Update database
replacePageWithUndo(nextPage, 'Generated page markdown from image')

// 5. Update local state
if (activePage.id === currentPage.id) {
  setMarkdownDraft(result.markdown)
}

// 6. Clear generation state
setGeneratingPage(currentPage.id, false)

// 7. Sync markdownDraft to tabs
useEffect(() => {
  setMarkdownDraft(activePage.markdown)
}, [activePage.markdown])
```

### Regeneration Flow (ChatOptionsDialog)
```typescript
// 1. User clicks "Regenerate from scratch"
handleRegenerate()

// 2. Clear editor immediately
onUpdateMarkdown('')

// 3. Set generation state
setGeneratingPage(page.id, true)

// 4. Start generation
await handleInitialGeneration()

// 5. Safety check
if (shouldUpdatePage()) {
  onUpdatePage(nextPage, 'Generated page markdown')
  onUpdateMarkdown(result.markdown)
}

// 6. Clear generation state
setGeneratingPage(page.id, false)

// 7. ISSUE: Tab content doesn't update properly
```

### Data Flow Diagram
```
ChatOptionsDialog
    ↓ (handleRegenerate)
onUpdateMarkdown('') → DocumentContent.markdownDraft = ''
    ↓
setGeneratingPage(page.id, true) → GenerationContext
    ↓
useMathGeneration.handleInitialGeneration()
    ↓
convertMathImageToMarkdown() API
    ↓
onUpdatePage() → DocumentEditor → Database
    ↓
onUpdateMarkdown(result) → DocumentContent.markdownDraft = result
    ↓
setGeneratingPage(page.id, false) → GenerationContext
    ↓
❌ ISSUE: Tab content doesn't reflect markdownDraft changes
```

---

## Root Cause Analysis {#root-cause}

### The Problem
When regeneration finishes from ChatOptionsDialog, the tabs in DocumentContent don't update to show the new content, even though the underlying data has changed.

### Why It Happens

#### 1. Timing Issue
```typescript
// ChatOptionsDialog immediately clears editor
onUpdateMarkdown('')  // T1: markdownDraft = ''

// Later, generation completes
onUpdateMarkdown(result.markdown)  // T2: markdownDraft = result

// But the useEffect might not trigger properly
useEffect(() => {
  setMarkdownDraft(activePage.markdown)  // T3: Might not fire
}, [activePage.markdown])
```

#### 2. State Sync Gap
```typescript
// DocumentContent relies on this sync
useEffect(() => {
  setMarkdownDraft(activePage.markdown);
}, [activePage.markdown]);

// But activePage prop might not update immediately
// The local markdownDraft state gets out of sync
```

#### 3. Component Update Timing
```typescript
// ChatOptionsDialog updates database
onUpdatePage(nextPage, 'Generated page markdown')

// DocumentContent receives new activePage prop
// But useEffect might fire with stale data
```

### Why Page Switching Fixes It
```typescript
// When you switch pages and come back:
useEffect(() => {
  if (activePageId) {
    clearRecentlyCompletedForActivePage(activePageId);
  }
}, [activePageId]);

// 1. activePageId changes → triggers DocumentEditor effect
// 2. You switch back → activePage prop updates with fresh data  
// 3. useEffect(() => setMarkdownDraft(activePage.markdown)) fires correctly
// 4. Tab content updates
```

---

## Complete Generation Timeline {#timeline}

### Normal Generation Timeline
```
T0: User clicks "Generate Markdown" in DocumentContent
T1: handleInitialGeneration() called
T2: setGeneratingPage(page.id, true) → Global state updated
T3: convertMathImageToMarkdown() API call starts
T4: API call completes with result
T5: replacePageWithUndo() → Database updated
T6: setMarkdownDraft(result.markdown) → Local state updated
T7: setGeneratingPage(page.id, false) → Global state updated
T8: useEffect() syncs markdownDraft → Tab content updates ✅
```

### Regeneration Timeline (Problematic)
```
T0: User clicks "Regenerate from scratch" in ChatOptionsDialog
T1: handleRegenerate() called
T2: setIsOpen(false) → Modal closes
T3: setOriginalPageId(page.id) → Track original page
T4: onUpdateMarkdown('') → DocumentContent.markdownDraft = '' (IMMEDIATE CLEAR)
T5: setGeneratingPage(page.id, true) → Global state updated
T6: useMathGeneration.handleInitialGeneration() called
T7: convertMathImageToMarkdown() API call starts
T8: API call completes with result
T9: shouldUpdatePage() check passes (originalPageId matches)
T10: onUpdatePage() → Database updated
T11: onUpdateMarkdown(result.markdown) → DocumentContent.markdownDraft = result
T12: setGeneratingPage(page.id, false) → Global state updated
T13: ❌ Tab content still shows empty (ISSUE HERE)
```

### State Timeline During Regeneration
```typescript
// State changes over time:
markdownDraft: '' → result (should update tabs)
activePage.markdown: old → new (should trigger useEffect)
isGenerating: false → true → false (controls UI)

// The issue is at the final step:
// markdownDraft is updated correctly
// But tab content doesn't reflect the change
// Likely due to React rendering timing or state update batching
```

---

## Key Dependencies

### DocumentContent Dependencies
```typescript
// Critical dependencies for proper functioning:
const isGenerating = isPageGenerating(activePage.id);  // From GenerationContext
const [markdownDraft, setMarkdownDraft] = useState(activePage.markdown);  // Local state

// Sync mechanism:
useEffect(() => {
  setMarkdownDraft(activePage.markdown);
}, [activePage.markdown]);  // This is the problematic sync
```

### ChatOptionsDialog Dependencies
```typescript
// Critical callbacks:
onUpdateMarkdown: (markdown: string) => void  // Updates DocumentContent state
onUpdatePage: (nextPage: MathDocumentPage, description: string) => void  // Updates database
shouldUpdatePage: () => boolean  // Safety check
```

### Global State Dependencies
```typescript
// GenerationContext coordinates:
- ChatOptionsDialog generation state
- DocumentContent UI state  
- DocumentEditor checkmark clearing
- PageListItem checkmark display
```

---

## PageListItem {#pagelistitem}

**File:** `app/components/document/PageListItem.tsx`

**Purpose:** Displays page list items with generation status indicators (spinner/checkmark)

### Generation Status Logic
```typescript
const PageListItem = ({ page, isActive, onPress, onConfigure }: PageListItemProps) => {
    const { isPageGenerating, isPageRecentlyCompleted, clearRecentlyCompleted } = useGeneration();
    const isGenerating = isPageGenerating(page.id);
    const isRecentlyCompleted = isPageRecentlyCompleted(page.id);
```

### Checkmark Clear Logic
```typescript
const handlePress = () => {
  // Clear recently completed status when user interacts with the page
  if (isRecentlyCompleted) {
    clearRecentlyCompleted(page.id);
  }
  
  if (isActive && onConfigure) {
    onConfigure();
  } else {
    onPress();
  }
};
```

### Status Display Logic
```typescript
{isGenerating ? (
  <Spinner size="sm" color="primary" />
) : isRecentlyCompleted ? (
  <Image 
    source={require('../../../assets/svgs/check-mark.svg')}
    className='w-5 h-5 text-primary'
    style={{ tintColor: '#3B82F6' }}
  />
) : (
  isActive && onConfigure && (
    <MonoIconsOptionsHorizontal className='text-text opacity-50' width={20} height={20} />
  )
)}
```

---

## Convex Database Integration {#convex}

**Purpose:** Handles data persistence and real-time updates across the application

### Database Update Pattern
```typescript
const replacePage = (nextPage: MathDocumentPage, _description: string) => {
  void setPage({
    key: 'mathDocumentPages',
    itemId: nextPage.id,
    value: nextPage,
    privacy: 'PUBLIC',
    filterKey: 'documentId',
    searchKeys: ['title', 'markdown'],
    sortKey: 'pageNumber',
  });
};
```

### Undo/Redo Integration
```typescript
const replacePageWithUndo = (nextPage: MathDocumentPage, description: string) => {
  if (!activePage) return;
  
  const previousPage = createUndoSnapshot(activePage);
  const nextPageSnapshot = createUndoSnapshot(nextPage);

  executeCommand({
    action: () => replacePage(nextPage, description),
    undoAction: () => replacePage(previousPage, description),
    description: `${description} - ${activePage.title}`
  });
};
```

### Real-time Data Flow
```typescript
// 1. Generation completes
onUpdatePage(nextPage, 'Generated page markdown')

// 2. Convex updates database
setPage({ key: 'mathDocumentPages', itemId: nextPage.id, value: nextPage })

// 3. Real-time subscription updates components
const pages = useUserListGet<MathDocumentPage>({
  key: 'mathDocumentPages',
  filterFor: documentId,
  userIds: scopedUserIds,
}) ?? [];

// 4. Components re-render with new data
const activePage = pages.find((page) => page.value.id === activePageId)?.value || null;
```

---

## Component Lifecycle & Re-rendering {#lifecycle}

**Purpose:** Understanding how React's rendering cycle affects the generation system

### Critical useEffect Dependencies
```typescript
// DocumentContent - Sync with database changes
useEffect(() => {
  setMarkdownDraft(activePage.markdown);
}, [activePage.markdown]); // ❌ This is the problematic dependency

// DocumentEditor - Clear checkmarks on page changes
useEffect(() => {
  if (activePageId) {
    clearRecentlyCompletedForActivePage(activePageId);
  }
}, [activePageId, clearRecentlyCompletedForActivePage]);

// GenerationContext - State transitions
useEffect(() => {
  if (isGenerating) {
    // Animation logic
  } else {
    // Reset animation
  }
}, [isGenerating]);
```

### Re-rendering Chain During Regeneration
```typescript
// T1: ChatOptionsDialog calls onUpdateMarkdown('')
setMarkdownDraft('')  // DocumentContent state updates

// T2: Generation starts
setGeneratingPage(page.id, true)  // GenerationContext updates

// T3: Database update
onUpdatePage(nextPage)  // Convex updates

// T4: Real-time subscription
useUserListGet()  // Triggers DocumentEditor re-render

// T5: Prop change
activePage prop updates  // Should trigger DocumentContent useEffect

// T6: ❌ ISSUE: useEffect doesn't fire properly
useEffect(() => {
  setMarkdownDraft(activePage.markdown);  // Stale data
}, [activePage.markdown]);
```

### React Batching Issues
```typescript
// Problem: React batches state updates
onUpdateMarkdown('');           // Batch 1
setGeneratingPage(page.id, true); // Batch 1

// Later:
onUpdatePage(nextPage);         // Batch 2
onUpdateMarkdown(result);       // Batch 2
setGeneratingPage(page.id, false); // Batch 2

// The useEffect might fire with intermediate states
// or not fire at all due to batching
```

---

## Error Handling & Timeouts {#errors}

**Purpose:** Robust error handling throughout the generation pipeline

### Generation Error Handling
```typescript
const handleInitialGeneration = async () => {
  if (!page.imageUrl) {
    setErrorMessage('Add an image before asking the AI to convert the page.');
    return;
  }

  try {
    setIsGenerating(true);
    setErrorMessage('');

    const result = await convertMathImageToMarkdown({
      imageUrl: page.imageUrl,
      guidance: aiGuidance.value,
      currentMarkdown: page.markdown,
    });

    // Success handling
    onUpdatePage(nextPage, 'Generated page markdown');
    onUpdateMarkdown(result.markdown);
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'AI conversion failed.');
  } finally {
    setIsGenerating(false); // Always reset generation state
  }
};
```

### Regeneration Error Handling
```typescript
const handleRegenerate = async () => {
  setIsOpen(false);
  setOriginalPageId(page.id);
  onUpdateMarkdown('');
  setGeneratingPage(page.id, true);

  try {
    await handleInitialGeneration();
  } finally {
    // Always cleanup, even on error
    setGeneratingPage(page.id, false);
    setOriginalPageId(null);
  }
};
```

### State Recovery on Error
```typescript
// Error states are automatically cleared on next generation
const setGeneratingPage = (pageId: string, isGenerating: boolean) => {
  if (isGenerating) {
    // Remove from recently completed when starting new generation
    setRecentlyCompletedPages(completed => {
      const newCompleted = new Set(completed);
      newCompleted.delete(pageId);
      return newCompleted;
    });
  }
};
```

---

## Summary

The generation system is well-architected with proper separation of concerns, but has a timing/synchronization issue between ChatOptionsDialog regeneration and DocumentContent tab updates. The system correctly updates the database and local state, but the UI doesn't reflect these changes immediately due to React's rendering cycle and state update batching.

**Root Cause:** The `useEffect(() => setMarkdownDraft(activePage.markdown), [activePage.markdown])` in DocumentContent doesn't trigger properly after regeneration from ChatOptionsDialog, causing tab content to remain stale until a page switch forces a re-sync.
