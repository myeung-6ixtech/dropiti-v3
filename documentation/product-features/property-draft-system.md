# 🏠 Property Draft System - Save Draft Feature

## 📋 **Overview**

The Property Draft System allows landlords to save incomplete property listings as drafts, enabling them to work on listings over multiple sessions without losing progress. Drafts are stored privately and can be completed and published when ready.

## 🎯 **Feature Goals**

- **User Experience**: Allow landlords to save work-in-progress property listings
- **Data Persistence**: Prevent data loss during the property creation process
- **Flexible Workflow**: Support multi-session property listing creation
- **Privacy Control**: Keep drafts private until explicitly published

## 🏗️ **Technical Feasibility Analysis**

### ✅ **Current Codebase Support**

The existing codebase already supports this feature with minimal modifications:

1. **Database Schema**: The `real_estate_property_listing` table already has an `is_public` field that can be used to distinguish drafts from published listings
2. **API Infrastructure**: Existing create/update property APIs can be extended to handle draft operations
3. **Frontend Components**: The multi-step property creation flow already exists and can be enhanced
4. **Authentication**: User authentication and ownership verification are already implemented

### 🔧 **Required Changes**

1. **Database**: Add a `status` field to track listing lifecycle
2. **API**: Extend create/update endpoints to handle draft operations
3. **Frontend**: Add draft management UI components
4. **Validation**: Implement draft-specific validation rules

## 🗄️ **Database Schema Updates**

### **1. Add Status Field to Property Listings**

```sql
-- Add status field to track listing lifecycle
ALTER TABLE real_estate_property_listing 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Add constraint for valid status values
ALTER TABLE real_estate_property_listing 
ADD CONSTRAINT IF NOT EXISTS check_property_status 
CHECK (status IN ('draft', 'published', 'archived', 'expired'));

-- Create index for status-based queries
CREATE INDEX IF NOT EXISTS idx_property_status ON real_estate_property_listing(status);
CREATE INDEX IF NOT EXISTS idx_property_status_owner ON real_estate_property_listing(status, landlord_firebase_uid);

-- Update existing records to have published status
UPDATE real_estate_property_listing 
SET status = 'published' 
WHERE is_public = true AND status IS NULL;

-- Update existing records to have draft status
UPDATE real_estate_property_listing 
SET status = 'draft' 
WHERE is_public = false AND status IS NULL;
```

### **2. Enhanced Property Listing Table Structure**

```sql
-- Current structure with new status field
CREATE TABLE real_estate_property_listing (
  id SERIAL PRIMARY KEY,
  property_uuid UUID UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  landlord_firebase_uid VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'draft', -- NEW FIELD
  is_public BOOLEAN DEFAULT false,    -- Keep for backward compatibility
  -- ... existing fields ...
);
```

## 🚀 **API Implementation**

### **1. Enhanced Create Property Endpoint**

```typescript
// src/app/api/v1/properties/create-property/route.ts

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json();
    
    // Extract draft preference
    const isDraft = propertyData.isDraft || false;
    
    // Prepare property object
    const property = {
      // ... existing fields ...
      status: isDraft ? 'draft' : 'published',
      is_public: !isDraft, // Drafts are private by default
      // ... rest of existing fields ...
    };
    
    // For drafts, relax validation requirements
    if (isDraft) {
      // Only validate essential fields for drafts
      const draftRequiredFields = ['title']; // Minimal requirements for drafts
      // ... draft validation logic ...
    } else {
      // Full validation for published listings
      const requiredFields = ['title', 'description', 'location', 'price', 'bedrooms', 'bathrooms'];
      // ... full validation logic ...
    }
    
    // ... rest of implementation ...
  } catch (error) {
    // ... error handling ...
  }
}
```

### **2. New Draft Management Endpoints**

```typescript
// src/app/api/v1/properties/get-drafts/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get('landlord_id');
    
    const query = `
      query GetDrafts($landlord_id: String!) {
        real_estate_property_listing(
          where: { 
            landlord_firebase_uid: { _eq: $landlord_id },
            status: { _eq: "draft" }
          },
          order_by: { updated_at: desc }
        ) {
          id
          property_uuid
          title
          description
          created_at
          updated_at
          status
          is_public
          // ... other fields ...
        }
      }
    `;
    
    // ... implementation ...
  } catch (error) {
    // ... error handling ...
  }
}

// src/app/api/v1/properties/publish-draft/route.ts
export async function POST(request: NextRequest) {
  try {
    const { property_uuid } = await request.json();
    
    // Validate draft can be published
    const validationResult = await validateDraftForPublishing(property_uuid);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.errors.join(', ') },
        { status: 400 }
      );
    }
    
    // Update status to published
    const mutation = `
      mutation PublishDraft($property_uuid: uuid!) {
        update_real_estate_property_listing(
          where: { property_uuid: { _eq: $property_uuid } }
          _set: { 
            status: "published",
            is_public: true,
            updated_at: "now()"
          }
        ) {
          affected_rows
          returning {
            id
            property_uuid
            status
            is_public
            updated_at
          }
        }
      }
    `;
    
    // ... implementation ...
  } catch (error) {
    // ... error handling ...
  }
}
```

### **3. Enhanced Update Property Endpoint**

```typescript
// src/app/api/v1/properties/update-property/route.ts

export async function PUT(request: NextRequest) {
  try {
    const { id, updates, isDraft } = await request.json();
    
    // Handle draft updates
    if (isDraft !== undefined) {
      updates.status = isDraft ? 'draft' : 'published';
      updates.is_public = !isDraft;
    }
    
    // ... rest of implementation ...
  } catch (error) {
    // ... error handling ...
  }
}
```

## 🎨 **Frontend Implementation**

### **1. Enhanced AddPropertyView Component**

```typescript
// src/components/dashboard/AddPropertyView.tsx

export default function AddPropertyView({ userType = 'landlord' }: AddPropertyViewProps) {
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  
  // Add draft management functions
  const saveDraft = async () => {
    try {
      setIsSubmitting(true);
      
      const draftData = {
        ...propertyData,
        isDraft: true,
        // Include minimal required data for drafts
        title: propertyData.rentalDetails?.listingName || 'Untitled Draft',
      };
      
      if (draftId) {
        // Update existing draft
        const response = await propertiesAPI.updateProperty(draftId, draftData, true);
        if (response.success) {
          showToast('success', 'Draft updated successfully!');
        }
      } else {
        // Create new draft
        const response = await propertiesAPI.createProperty(draftData, authUser.id);
        if (response.success) {
          setDraftId(response.data.property_uuid);
          showToast('success', 'Draft saved successfully!');
        }
      }
    } catch (error) {
      showToast('error', 'Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const publishDraft = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate all required fields
      if (!isFormComplete()) {
        setSubmitError('Please complete all required fields before publishing.');
        return;
      }
      
      if (draftId) {
        // Publish existing draft
        const response = await propertiesAPI.publishDraft(draftId);
        if (response.success) {
          showToast('success', 'Property published successfully!');
          // Redirect to property view or dashboard
          router.push('/dashboard/properties');
        }
      } else {
        // Create and publish new property
        await handleSubmit();
      }
    } catch (error) {
      showToast('error', 'Failed to publish property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add draft action buttons to the UI
  return (
    <div className="add-property-view">
      {/* ... existing form steps ... */}
      
      {/* Draft Management Actions */}
      <div className="draft-actions flex gap-4 mt-6">
        <Button
          variant="outline"
          onClick={saveDraft}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <SaveIcon className="w-4 h-4" />
          {draftId ? 'Update Draft' : 'Save Draft'}
        </Button>
        
        <Button
          onClick={publishDraft}
          disabled={isSubmitting || !isFormComplete()}
          className="flex items-center gap-2"
        >
          <PublishIcon className="w-4 h-4" />
          {draftId ? 'Publish Draft' : 'Publish Property'}
        </Button>
      </div>
      
      {/* Draft Status Indicator */}
      {draftId && (
        <div className="draft-status bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 text-blue-700">
            <ClockIcon className="w-4 h-4" />
            <span className="font-medium">Draft Saved</span>
            <span className="text-sm text-blue-600">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
```

### **2. New Draft Management Components**

```typescript
// src/components/dashboard/DraftList.tsx
export default function DraftList() {
  const [drafts, setDrafts] = useState<PropertyDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchDrafts();
  }, []);
  
  const fetchDrafts = async () => {
    try {
      const response = await propertiesAPI.getDrafts();
      if (response.success) {
        setDrafts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const continueDraft = (draftId: string) => {
    router.push(`/dashboard/add-property?draft=${draftId}`);
  };
  
  const deleteDraft = async (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      try {
        const response = await propertiesAPI.deleteDraft(draftId);
        if (response.success) {
          showToast('success', 'Draft deleted successfully');
          fetchDrafts(); // Refresh list
        }
      } catch (error) {
        showToast('error', 'Failed to delete draft');
      }
    }
  };
  
  return (
    <div className="draft-list">
      <h2 className="text-2xl font-bold mb-6">Property Drafts</h2>
      
      {isLoading ? (
        <div className="loading-spinner">Loading drafts...</div>
      ) : drafts.length === 0 ? (
        <div className="empty-state text-center py-12">
          <DocumentIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
          <p className="text-gray-500 mb-6">
            Start creating a property listing to save your first draft.
          </p>
          <Button onClick={() => router.push('/dashboard/add-property')}>
            Create New Listing
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.property_uuid}
              draft={draft}
              onContinue={continueDraft}
              onDelete={deleteDraft}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// src/components/dashboard/DraftCard.tsx
interface DraftCardProps {
  draft: PropertyDraft;
  onContinue: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}

export default function DraftCard({ draft, onContinue, onDelete }: DraftCardProps) {
  const getCompletionPercentage = (draft: PropertyDraft) => {
    // Calculate completion based on filled fields
    const requiredFields = ['title', 'description', 'address', 'rental_price'];
    const filledFields = requiredFields.filter(field => 
      draft[field] && draft[field] !== '' && draft[field] !== null
    );
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };
  
  return (
    <div className="draft-card border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {draft.title || 'Untitled Draft'}
          </h3>
          <p className="text-sm text-gray-500">
            Created: {new Date(draft.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onContinue(draft.property_uuid)}
          >
            Continue
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(draft.property_uuid)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Completion</span>
          <span className="text-sm text-gray-500">
            {getCompletionPercentage(draft)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage(draft)}%` }}
          />
        </div>
      </div>
      
      {draft.description && (
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {draft.description}
        </p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {draft.property_type && (
          <Badge variant="secondary">{draft.property_type}</Badge>
        )}
        {draft.num_bedroom && (
          <Badge variant="outline">{draft.num_bedroom} bed</Badge>
        )}
        {draft.num_bathroom && (
          <Badge variant="outline">{draft.num_bathroom} bath</Badge>
        )}
        {draft.rental_price && (
          <Badge variant="outline">${draft.rental_price}/month</Badge>
        )}
      </div>
    </div>
  );
}
```

## 🔧 **API Client Updates**

### **1. Enhanced Properties API**

```typescript
// src/lib/api-client.ts

export const propertiesAPI = {
  // ... existing methods ...
  
  // Get user's drafts
  getDrafts: async () => {
    const response = await apiClient.get('/properties/get-drafts', {
      params: { landlord_id: getCurrentUserId() }
    });
    return response.data;
  },
  
  // Create property (supports drafts)
  createProperty: async (propertyData: PropertyDataForAPI, ownerId: string, isDraft: boolean = false) => {
    const transformedData = await transformPropertyData(propertyData, ownerId);
    transformedData.isDraft = isDraft;
    
    const response = await apiClient.post('/properties/create-property', transformedData);
    return response.data;
  },
  
  // Update property (supports draft mode)
  updateProperty: async (propertyId: string, updates: Partial<PropertyDataForAPI>, isDraft: boolean = false) => {
    const response = await apiClient.put('/properties/update-property', {
      id: propertyId,
      updates,
      isDraft
    });
    return response.data;
  },
  
  // Publish draft
  publishDraft: async (propertyUuid: string) => {
    const response = await apiClient.post('/properties/publish-draft', {
      property_uuid: propertyUuid
    });
    return response.data;
  },
  
  // Delete draft
  deleteDraft: async (propertyUuid: string) => {
    const response = await apiClient.delete('/properties/delete-draft', {
      params: { property_uuid: propertyUuid }
    });
    return response.data;
  }
};
```

## 📱 **User Interface Updates**

### **1. Dashboard Navigation**

```typescript
// src/components/dashboard/layout.tsx

const dashboardNavigation = [
  // ... existing items ...
  {
    name: 'Drafts',
    href: '/dashboard/drafts',
    icon: DocumentIcon,
    count: draftCount, // Add draft count badge
    badge: draftCount > 0 ? draftCount.toString() : undefined
  }
];
```

### **2. Draft Management Page**

```typescript
// src/app/dashboard/drafts/page.tsx

export default function DraftsPage() {
  return (
    <div className="drafts-page">
      <div className="page-header mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Property Drafts</h1>
        <p className="text-gray-600 mt-2">
          Manage your incomplete property listings and continue working on them when ready.
        </p>
      </div>
      
      <DraftList />
    </div>
  );
}
```

## ✅ **Validation Rules**

### **1. Draft Validation (Minimal)**

- **Required**: Title (for identification)
- **Optional**: All other fields
- **Status**: Automatically set to 'draft'
- **Visibility**: Private (not searchable)

### **2. Publication Validation (Full)**

- **Required**: Title, description, address, price, bedrooms, bathrooms
- **Optional**: Amenities, photos, availability date
- **Status**: Changed to 'published'
- **Visibility**: Public (searchable)

## 🔄 **User Workflow**

### **1. Creating a Draft**

1. User starts property creation process
2. Fills in minimal information (at least title)
3. Clicks "Save Draft" button
4. System saves incomplete listing as draft
5. User can continue later or save multiple drafts

### **2. Managing Drafts**

1. User views draft list in dashboard
2. Sees completion percentage for each draft
3. Can continue editing any draft
4. Can delete unwanted drafts
5. Can publish completed drafts

### **3. Publishing a Draft**

1. User opens draft for editing
2. Completes all required fields
3. Clicks "Publish Draft" button
4. System validates completeness
5. Draft becomes published property listing

## 🧪 **Testing Strategy**

### **1. Unit Tests**

- Draft creation and validation
- Draft to published conversion
- Draft deletion
- Field validation rules

### **2. Integration Tests**

- API endpoint functionality
- Database operations
- User authentication and authorization

### **3. User Acceptance Tests**

- Draft creation workflow
- Draft management interface
- Publication process
- Error handling

## 🚀 **Implementation Phases**

### **Phase 1: Core Infrastructure**
- Database schema updates
- Basic draft API endpoints
- Draft creation functionality

### **Phase 2: User Interface**
- Draft management components
- Enhanced property creation flow
- Draft list and management pages

### **Phase 3: Advanced Features**
- Draft completion tracking
- Draft templates
- Bulk draft operations

### **Phase 4: Polish & Optimization**
- Performance optimization
- User experience improvements
- Analytics and insights

## 📊 **Success Metrics**

- **User Engagement**: Increased property creation completion rates
- **Data Quality**: Better property listings due to iterative editing
- **User Satisfaction**: Reduced frustration from lost work
- **Platform Usage**: Higher user retention and engagement

## 🔮 **Future Enhancements**

1. **Draft Templates**: Pre-filled templates for common property types
2. **Collaborative Drafts**: Multiple users can work on the same draft
3. **Draft Analytics**: Insights into user behavior and completion patterns
4. **Auto-save**: Automatic draft saving during editing
5. **Draft Sharing**: Share drafts with team members or agents

## 📝 **Conclusion**

The Property Draft System is highly feasible with the current codebase architecture. The existing infrastructure provides a solid foundation, requiring only targeted enhancements to implement this valuable user experience feature. The implementation will significantly improve user satisfaction and increase property listing completion rates.

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: Ready for Implementation

## 🔒 **Security & Privacy Considerations**

### **1. Data Access Control**
- Drafts are only accessible to the property owner (landlord)
- No public search indexing for draft properties
- API endpoints require authentication and ownership verification
- Draft data is excluded from public property listings

### **2. Data Validation & Sanitization**
```typescript
// Enhanced validation for draft operations
const validateDraftData = (data: Partial<PropertyDataForAPI>) => {
  const errors: string[] = [];
  
  // Basic validation for drafts
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  
  // Sanitize user input
  if (data.description) {
    data.description = sanitizeHtml(data.description);
  }
  
  // Validate image URLs (if provided)
  if (data.uploaded_images) {
    data.uploaded_images = data.uploaded_images.filter(url => 
      isValidImageUrl(url) && isAllowedDomain(url)
    );
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### **3. Rate Limiting**
```typescript
// Implement rate limiting for draft operations
const DRAFT_RATE_LIMITS = {
  create: { max: 10, window: '1h' },    // Max 10 drafts per hour
  update: { max: 50, window: '1h' },    // Max 50 updates per hour
  delete: { max: 20, window: '1h' }     // Max 20 deletions per hour
};
```

## 🚨 **Error Handling & Edge Cases**

### **1. Draft Validation Errors**
```typescript
// Comprehensive error handling for draft operations
export class DraftValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'DraftValidationError';
  }
}

const handleDraftError = (error: unknown) => {
  if (error instanceof DraftValidationError) {
    return {
      success: false,
      error: error.message,
      field: error.field,
      code: error.code,
      suggestions: error.suggestions
    };
  }
  
  // Handle other errors
  console.error('Unexpected draft error:', error);
  return {
    success: false,
    error: 'An unexpected error occurred while processing your draft'
  };
};
```

### **2. Draft State Management**
```typescript
// Handle draft state transitions
const DRAFT_STATES = {
  CREATING: 'creating',
  SAVING: 'saving',
  SAVED: 'saved',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  ERROR: 'error'
} as const;

type DraftState = typeof DRAFT_STATES[keyof typeof DRAFT_STATES];

const useDraftState = () => {
  const [state, setState] = useState<DraftState>(DRAFT_STATES.CREATING);
  const [error, setError] = useState<string | null>(null);
  
  const updateState = (newState: DraftState, errorMessage?: string) => {
    setState(newState);
    setError(errorMessage || null);
  };
  
  return { state, error, updateState };
};
```

### **3. Conflict Resolution**
```typescript
// Handle concurrent draft updates
const handleDraftConflict = async (draftId: string, localVersion: number) => {
  try {
    const serverVersion = await getDraftVersion(draftId);
    
    if (serverVersion > localVersion) {
      // Server has newer version, prompt user to resolve conflict
      const userChoice = await showConflictResolutionDialog({
        localVersion,
        serverVersion,
        draftId
      });
      
      switch (userChoice) {
        case 'overwrite':
          return await forceUpdateDraft(draftId, localData);
        case 'merge':
          return await mergeDraftVersions(draftId, localData, serverData);
        case 'cancel':
          return { success: false, error: 'Update cancelled due to conflict' };
      }
    }
    
    return await updateDraft(draftId, localData);
  } catch (error) {
    throw new Error('Failed to resolve draft conflict');
  }
};
```

## 📱 **Mobile & Responsive Design**

### **1. Mobile-First Draft Interface**
```typescript
// Responsive draft management for mobile devices
const MobileDraftCard = ({ draft, onContinue, onDelete }: DraftCardProps) => {
  return (
    <div className="mobile-draft-card bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {draft.title || 'Untitled Draft'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(draft.updated_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-col gap-2 ml-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContinue(draft.property_uuid)}
            className="w-full"
          >
            Continue
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(draft.property_uuid)}
            className="w-full text-red-600"
          >
            Delete
          </Button>
        </div>
      </div>
      
      {/* Mobile-optimized completion indicator */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Progress</span>
          <span className="text-xs font-medium text-gray-900">
            {getCompletionPercentage(draft)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage(draft)}%` }}
          />
        </div>
      </div>
      
      {/* Compact property details */}
      <div className="flex flex-wrap gap-1">
        {draft.property_type && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {draft.property_type}
          </span>
        )}
        {draft.num_bedroom && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {draft.num_bedroom} bed
          </span>
        )}
      </div>
    </div>
  );
};
```

### **2. Touch-Friendly Draft Actions**
```typescript
// Mobile-optimized draft actions
const MobileDraftActions = ({ draft, onSave, onPublish }: DraftActionsProps) => {
  return (
    <div className="mobile-draft-actions fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onSave}
          className="flex-1 h-12 text-base font-medium"
        >
          Save Draft
        </Button>
        
        <Button
          onClick={onPublish}
          disabled={!isDraftComplete(draft)}
          className="flex-1 h-12 text-base font-medium"
        >
          Publish
        </Button>
      </div>
      
      {/* Draft status indicator */}
      <div className="mt-3 text-center">
        <span className="text-sm text-gray-600">
          {draft.last_saved ? 
            `Last saved: ${formatRelativeTime(draft.last_saved)}` : 
            'Not saved yet'
          }
        </span>
      </div>
    </div>
  );
};
```

## 🔄 **Auto-Save & Recovery Features**

### **1. Automatic Draft Saving**
```typescript
// Auto-save functionality for drafts
const useAutoSave = (draftId: string | null, propertyData: PropertyData) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // Auto-save every 30 seconds after user stops typing
  useEffect(() => {
    if (!draftId) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        await propertiesAPI.updateProperty(draftId, propertyData, true);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 30000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [draftId, propertyData]);
  
  return { lastSaved, isAutoSaving };
};
```

### **2. Draft Recovery System**
```typescript
// Recover unsaved changes on page reload
const useDraftRecovery = (draftId: string | null) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Save draft state to localStorage
  const saveDraftState = useCallback((data: PropertyData) => {
    if (draftId) {
      localStorage.setItem(`draft_${draftId}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      setHasUnsavedChanges(true);
    }
  }, [draftId]);
  
  // Recover draft state from localStorage
  const recoverDraftState = useCallback(() => {
    if (draftId) {
      const saved = localStorage.getItem(`draft_${draftId}`);
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000; // 24 hours
        
        if (isRecent) {
          return data;
        } else {
          // Clear old draft state
          localStorage.removeItem(`draft_${draftId}`);
        }
      }
    }
    return null;
  }, [draftId]);
  
  // Clear draft state when published
  const clearDraftState = useCallback(() => {
    if (draftId) {
      localStorage.removeItem(`draft_${draftId}`);
      setHasUnsavedChanges(false);
    }
  }, [draftId]);
  
  return {
    hasUnsavedChanges,
    saveDraftState,
    recoverDraftState,
    clearDraftState
  };
};
```

## 📊 **Analytics & Insights**

### **1. Draft Performance Metrics**
```typescript
// Track draft creation and completion metrics
const trackDraftMetrics = {
  draftCreated: (userId: string, propertyType: string) => {
    analytics.track('draft_created', {
      user_id: userId,
      property_type: propertyType,
      timestamp: new Date().toISOString()
    });
  },
  
  draftUpdated: (draftId: string, completionPercentage: number) => {
    analytics.track('draft_updated', {
      draft_id: draftId,
      completion_percentage: completionPercentage,
      timestamp: new Date().toISOString()
    });
  },
  
  draftPublished: (draftId: string, timeToComplete: number) => {
    analytics.track('draft_published', {
      draft_id: draftId,
      time_to_complete: timeToComplete,
      timestamp: new Date().toISOString()
    });
  },
  
  draftAbandoned: (draftId: string, completionPercentage: number) => {
    analytics.track('draft_abandoned', {
      draft_id: draftId,
      completion_percentage: completionPercentage,
      timestamp: new Date().toISOString()
    });
  }
};
```

### **2. Draft Analytics Dashboard**
```typescript
// Admin dashboard for draft analytics
const DraftAnalytics = () => {
  const [metrics, setMetrics] = useState<DraftMetrics | null>(null);
  
  useEffect(() => {
    fetchDraftMetrics();
  }, []);
  
  const fetchDraftMetrics = async () => {
    try {
      const response = await adminAPI.getDraftMetrics();
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch draft metrics:', error);
    }
  };
  
  return (
    <div className="draft-analytics">
      <h2 className="text-2xl font-bold mb-6">Draft Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Drafts"
          value={metrics?.totalDrafts || 0}
          change={metrics?.draftGrowth || 0}
          changeType="percentage"
        />
        
        <MetricCard
          title="Completion Rate"
          value={`${metrics?.completionRate || 0}%`}
          change={metrics?.completionRateChange || 0}
          changeType="percentage"
        />
        
        <MetricCard
          title="Avg. Time to Complete"
          value={`${metrics?.avgTimeToComplete || 0} days`}
          change={metrics?.timeToCompleteChange || 0}
          changeType="percentage"
        />
      </div>
      
      {/* Draft completion funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Draft Completion Funnel</h3>
        <DraftFunnelChart data={metrics?.funnelData || []} />
      </div>
    </div>
  );
};
```

## 🚀 **Deployment & Migration**

### **1. Database Migration Script**
```sql
-- Complete migration script for draft system
BEGIN;

-- Add status field to property listings
ALTER TABLE real_estate_property_listing 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Add draft-specific fields
ALTER TABLE real_estate_property_listing 
ADD COLUMN IF NOT EXISTS draft_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE real_estate_property_listing 
ADD CONSTRAINT IF NOT EXISTS check_property_status 
CHECK (status IN ('draft', 'published', 'archived', 'expired'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_status ON real_estate_property_listing(status);
CREATE INDEX IF NOT EXISTS idx_property_status_owner ON real_estate_property_listing(status, landlord_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_property_last_saved ON real_estate_property_listing(last_saved_at);

-- Update existing records
UPDATE real_estate_property_listing 
SET 
  status = CASE 
    WHEN is_public = true THEN 'published'
    ELSE 'draft'
  END,
  completion_percentage = CASE 
    WHEN is_public = true THEN 100
    ELSE 0
  END;

-- Create draft management functions
CREATE OR REPLACE FUNCTION update_draft_completion_percentage()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate completion percentage based on filled fields
  NEW.completion_percentage = (
    CASE WHEN NEW.title IS NOT NULL AND NEW.title != '' THEN 20 ELSE 0 END +
    CASE WHEN NEW.description IS NOT NULL AND NEW.description != '' THEN 20 ELSE 0 END +
    CASE WHEN NEW.address IS NOT NULL AND NEW.address != '' THEN 20 ELSE 0 END +
    CASE WHEN NEW.rental_price IS NOT NULL AND NEW.rental_price > 0 THEN 20 ELSE 0 END +
    CASE WHEN NEW.num_bedroom IS NOT NULL AND NEW.num_bedroom > 0 THEN 20 ELSE 0 END
  );
  
  -- Update last_saved_at timestamp
  NEW.last_saved_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic completion percentage updates
CREATE TRIGGER trigger_update_draft_completion
  BEFORE UPDATE ON real_estate_property_listing
  FOR EACH ROW
  EXECUTE FUNCTION update_draft_completion_percentage();

COMMIT;
```

### **2. Environment Configuration**
```typescript
// Environment variables for draft system
const DRAFT_CONFIG = {
  // Auto-save interval (milliseconds)
  AUTO_SAVE_INTERVAL: parseInt(process.env.DRAFT_AUTO_SAVE_INTERVAL || '30000'),
  
  // Maximum drafts per user
  MAX_DRAFTS_PER_USER: parseInt(process.env.DRAFT_MAX_PER_USER || '50'),
  
  // Draft retention period (days)
  DRAFT_RETENTION_DAYS: parseInt(process.env.DRAFT_RETENTION_DAYS || '90'),
  
  // Enable auto-save
  ENABLE_AUTO_SAVE: process.env.DRAFT_ENABLE_AUTO_SAVE === 'true',
  
  // Enable draft analytics
  ENABLE_ANALYTICS: process.env.DRAFT_ENABLE_ANALYTICS === 'true'
};
```

### **3. Feature Flag Configuration**
```typescript
// Feature flags for gradual rollout
const DRAFT_FEATURE_FLAGS = {
  // Enable draft system for all users
  DRAFT_SYSTEM_ENABLED: process.env.FEATURE_DRAFT_SYSTEM === 'true',
  
  // Enable auto-save for beta users
  DRAFT_AUTO_SAVE_BETA: process.env.FEATURE_DRAFT_AUTO_SAVE_BETA === 'true',
  
  // Enable draft analytics for admin users
  DRAFT_ANALYTICS_ADMIN: process.env.FEATURE_DRAFT_ANALYTICS_ADMIN === 'true',
  
  // Enable draft templates for premium users
  DRAFT_TEMPLATES_PREMIUM: process.env.FEATURE_DRAFT_TEMPLATES_PREMIUM === 'true'
};

// Check if user has access to draft features
const hasDraftAccess = (user: User): boolean => {
  if (!DRAFT_FEATURE_FLAGS.DRAFT_SYSTEM_ENABLED) return false;
  
  // Check user permissions
  if (user.role === 'admin') return true;
  if (user.role === 'landlord') return true;
  
  return false;
};
```

## 🧪 **Testing & Quality Assurance**

### **1. Unit Test Examples**
```typescript
// Test draft creation and validation
describe('Draft System', () => {
  describe('Draft Creation', () => {
    it('should create draft with minimal required fields', async () => {
      const draftData = {
        title: 'Test Property',
        landlord_firebase_uid: 'test-user-id'
      };
      
      const result = await createDraft(draftData);
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('draft');
      expect(result.data.is_public).toBe(false);
    });
    
    it('should reject draft without title', async () => {
      const draftData = {
        description: 'Test description',
        landlord_firebase_uid: 'test-user-id'
      };
      
      const result = await createDraft(draftData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Title is required');
    });
  });
  
  describe('Draft Publication', () => {
    it('should publish complete draft', async () => {
      const draftId = 'test-draft-id';
      
      // Mock complete draft data
      mockDraftData(draftId, completeDraftData);
      
      const result = await publishDraft(draftId);
      
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('published');
      expect(result.data.is_public).toBe(true);
    });
    
    it('should reject incomplete draft publication', async () => {
      const draftId = 'test-draft-id';
      
      // Mock incomplete draft data
      mockDraftData(draftId, incompleteDraftData);
      
      const result = await publishDraft(draftId);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('incomplete');
    });
  });
});
```

### **2. Integration Test Examples**
```typescript
// Test draft API endpoints
describe('Draft API Endpoints', () => {
  describe('POST /api/v1/properties/create-property (Draft)', () => {
    it('should create draft property', async () => {
      const response = await request(app)
        .post('/api/v1/properties/create-property')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'Test Draft',
          isDraft: true,
          landlord_firebase_uid: 'test-user'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('draft');
    });
  });
  
  describe('GET /api/v1/properties/get-drafts', () => {
    it('should return user drafts', async () => {
      const response = await request(app)
        .get('/api/v1/properties/get-drafts?landlord_id=test-user')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

## 📈 **Performance Optimization**

### **1. Database Query Optimization**
```sql
-- Optimized queries for draft management
-- Get user drafts with pagination
SELECT 
  id, property_uuid, title, description, created_at, updated_at,
  status, completion_percentage, last_saved_at
FROM real_estate_property_listing
WHERE landlord_firebase_uid = $1 
  AND status = 'draft'
ORDER BY last_saved_at DESC
LIMIT $2 OFFSET $3;

-- Get draft statistics for dashboard
SELECT 
  COUNT(*) as total_drafts,
  AVG(completion_percentage) as avg_completion,
  COUNT(CASE WHEN completion_percentage = 100 THEN 1 END) as completed_drafts
FROM real_estate_property_listing
WHERE landlord_firebase_uid = $1 AND status = 'draft';

-- Clean up old abandoned drafts
DELETE FROM real_estate_property_listing
WHERE status = 'draft' 
  AND last_saved_at < NOW() - INTERVAL '90 days'
  AND completion_percentage < 50;
```

### **2. Caching Strategy**
```typescript
// Redis caching for draft data
const DRAFT_CACHE_CONFIG = {
  TTL: 300, // 5 minutes
  KEY_PREFIX: 'draft:',
  BATCH_SIZE: 100
};

const draftCache = {
  // Cache draft data
  set: async (draftId: string, data: PropertyData) => {
    const key = `${DRAFT_CACHE_CONFIG.KEY_PREFIX}${draftId}`;
    await redis.setex(key, DRAFT_CACHE_CONFIG.TTL, JSON.stringify(data));
  },
  
  // Get cached draft data
  get: async (draftId: string): Promise<PropertyData | null> => {
    const key = `${DRAFT_CACHE_CONFIG.KEY_PREFIX}${draftId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  },
  
  // Invalidate draft cache
  invalidate: async (draftId: string) => {
    const key = `${DRAFT_CACHE_CONFIG.KEY_PREFIX}${draftId}`;
    await redis.del(key);
  }
};
```

## 🔮 **Advanced Features & Future Roadmap**

### **1. Draft Templates System**
```typescript
// Pre-configured draft templates
const DRAFT_TEMPLATES = {
  'apartment-2br': {
    title: '2-Bedroom Apartment',
    property_type: 'residential',
    residential_type: 'apartment',
    rental_space: 'entire-apartment',
    num_bedroom: 2,
    num_bathroom: 1,
    amenities: ['air-conditioning', 'elevator', 'security'],
    description: 'Modern 2-bedroom apartment with...'
  },
  
  'commercial-office': {
    title: 'Office Space',
    property_type: 'commercial',
    rental_space: 'entire-space',
    amenities: ['air-conditioning', 'elevator', 'parking', 'security'],
    description: 'Professional office space suitable for...'
  }
};

const createDraftFromTemplate = async (templateId: string, userId: string) => {
  const template = DRAFT_TEMPLATES[templateId];
  if (!template) {
    throw new Error('Template not found');
  }
  
  const draftData = {
    ...template,
    landlord_firebase_uid: userId,
    status: 'draft',
    is_public: false,
    created_at: new Date().toISOString()
  };
  
  return await createDraft(draftData);
};
```

### **2. Collaborative Draft Editing**
```typescript
// Multi-user draft collaboration
interface DraftCollaborator {
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  added_at: Date;
}

const addDraftCollaborator = async (
  draftId: string, 
  collaboratorId: string, 
  role: 'editor' | 'viewer'
) => {
  const permissions = role === 'editor' 
    ? ['read', 'edit', 'comment'] 
    : ['read', 'comment'];
  
  const collaborator: DraftCollaborator = {
    user_id: collaboratorId,
    role,
    permissions,
    added_at: new Date()
  };
  
  // Add to draft metadata
  await updateDraftMetadata(draftId, {
    collaborators: [...existingCollaborators, collaborator]
  });
  
  // Notify collaborator
  await notifyUser(collaboratorId, {
    type: 'draft_invitation',
    draft_id: draftId,
    role,
    inviter: currentUserId
  });
};
```

### **3. AI-Powered Draft Completion**
```typescript
// AI suggestions for draft completion
const getDraftSuggestions = async (draftData: Partial<PropertyData>) => {
  const suggestions = [];
  
  // Analyze completion and suggest next steps
  if (!draftData.description && draftData.title) {
    const aiDescription = await generatePropertyDescription(draftData.title, draftData.property_type);
    suggestions.push({
      type: 'description',
      field: 'description',
      suggestion: aiDescription,
      confidence: 0.85
    });
  }
  
  // Suggest amenities based on property type
  if (draftData.property_type && !draftData.amenities?.length) {
    const suggestedAmenities = await suggestAmenities(draftData.property_type, draftData.rental_space);
    suggestions.push({
      type: 'amenities',
      field: 'amenities',
      suggestion: suggestedAmenities,
      confidence: 0.90
    });
  }
  
  // Suggest pricing based on market data
  if (draftData.address && !draftData.rental_price) {
    const marketPrice = await getMarketPrice(draftData.address, draftData.num_bedroom);
    suggestions.push({
      type: 'pricing',
      field: 'rental_price',
      suggestion: marketPrice,
      confidence: 0.75
    });
  }
  
  return suggestions;
};
```

---

**Last Updated**: December 2024  
**Version**: 1.1  
**Status**: Enhanced with Advanced Features & Implementation Details
