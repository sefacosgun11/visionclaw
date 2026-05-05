// VisionClaw Data Architecture
// Production-ready domain model for industrial field operations

// ============================================================================
// BASE TYPES & METADATA
// ============================================================================

export type ULID = string // 26-char identifier (e.g., "eq-01HGW4KP8XNKJVF3R2BTCM5K3Q")

export interface AuditMetadata {
  createdAt: string      // ISO 8601 UTC
  createdBy: string      // technician ID
  updatedAt: string      // ISO 8601 UTC
  updatedBy: string      // technician ID
  deletedAt?: string     // soft delete
  version: number        // optimistic locking
}

export interface SyncMetadata {
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error'
  lastSyncedAt: string | null
  localModifiedAt: string
  serverModifiedAt: string | null
  syncHash: string
  deviceId: string
  pendingChanges?: string[]
}

export interface FileReference {
  id: string
  storageKey: string
  storageBackend: 'local' | 's3' | 'azure-blob'
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed'
  uploadProgress?: number
  fileSize: number
  mimeType: string
  checksum: string
  thumbnailKey?: string
  dimensions?: { width: number; height: number }
}

export interface GPSCoordinate {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  timestamp: string
}

// ============================================================================
// ENUMS
// ============================================================================

export type EquipmentStatus = 'operational' | 'degraded' | 'offline' | 'maintenance' | 'decommissioned'
export type TaskStatus = 'draft' | 'assigned' | 'in-progress' | 'paused' | 'completed' | 'failed' | 'cancelled'
export type InspectionStatus = 'draft' | 'in-progress' | 'completed' | 'approved' | 'rejected'
export type IssueStatus = 'open' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed' | 'verified'
export type ProcedureStatus = 'draft' | 'review' | 'approved' | 'active' | 'deprecated' | 'archived'
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type Priority = 'urgent' | 'high' | 'normal' | 'low'
export type SafetyLevel = 'danger' | 'warning' | 'caution' | 'notice'

// ============================================================================
// SITE - Physical location where work happens
// ============================================================================

export interface Site {
  // Identity
  id: ULID                    // site-xxxxx
  name: string                // "Pacific Shipyard"
  code: string                // "PSY-DD3"
  
  // Location
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  gpsCenter?: GPSCoordinate
  timezone: string            // IANA timezone
  
  // Organization
  company: string
  parentSiteId?: ULID
  
  // Metadata
  audit: AuditMetadata
}

// ============================================================================
// TECHNICIAN - Field worker who executes procedures
// ============================================================================

export interface Technician {
  // Identity
  id: ULID                    // tech-xxxxx
  employeeId: string          // company employee ID
  email: string
  
  // Personal
  firstName: string
  lastName: string
  phone?: string
  
  // Professional
  role: 'technician' | 'inspector' | 'supervisor' | 'engineer'
  certifications: string[]    // e.g., ["AWS CWI", "ASME B31.1"]
  specializations: string[]   // e.g., ["diesel-engines", "hvac"]
  
  // Assignment
  siteId: ULID
  teamId?: string
  
  // Status
  status: 'active' | 'inactive' | 'on-leave'
  
  // Metadata
  audit: AuditMetadata
}

// ============================================================================
// EQUIPMENT - Physical asset in the field
// ============================================================================

export interface Equipment {
  // Identity
  id: ULID                    // eq-xxxxx
  assetTag: string            // unique per site
  name: string                // "Port Main Engine"
  
  // Classification
  category: string            // "diesel-engine", "pump", "compressor"
  subcategory?: string
  manufacturer: string
  model: string
  serialNumber: string
  
  // Specifications
  specifications: {
    power?: { value: number; unit: string }
    capacity?: { value: number; unit: string }
    dimensions?: { length: number; width: number; height: number; unit: string }
    weight?: { value: number; unit: string }
    [key: string]: any
  }
  
  // Location
  siteId: ULID
  location: {
    facility: string          // "Dry Dock 3"
    building?: string
    floor?: string
    room?: string
    zone?: string
    gps?: GPSCoordinate
  }
  
  // Status & Health
  status: EquipmentStatus
  criticality: 'critical' | 'high' | 'medium' | 'low'
  operatingHours?: number
  lastOperatedAt?: string
  
  // Maintenance
  maintenanceSchedule?: {
    interval: number          // hours or days
    intervalUnit: 'hours' | 'days' | 'cycles'
    lastServicedAt: string
    nextDue: string
  }
  
  // Documentation
  documentationUrls?: string[]
  qrCodeData?: string
  
  // Relationships
  parentEquipmentId?: ULID    // for sub-components
  linkedEquipmentIds?: ULID[]
  
  // Issues
  openIssueIds: ULID[]
  
  // Metadata
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// SAFETY WARNING - Critical safety information
// ============================================================================

export interface SafetyWarning {
  id: ULID                    // safe-xxxxx
  level: SafetyLevel
  title: string
  description: string
  requiresAcknowledgment: boolean
  ppe?: string[]              // ["hard-hat", "gloves", "respirator"]
  hazards?: string[]          // ["high-voltage", "confined-space"]
}

// ============================================================================
// PROCEDURE STEP - Individual instruction in a procedure
// ============================================================================

export interface ProcedureStep {
  stepNumber: number
  title: string
  instruction: string
  
  // Type & Action
  actionType: 'inspection' | 'measurement' | 'adjustment' | 'replacement' | 'testing' | 'documentation' | 'safety-check' | 'photo-required'
  
  // Duration
  estimatedDuration?: number  // minutes
  
  // Requirements
  requiredTools?: string[]
  requiredParts?: string[]
  requiredSkills?: string[]
  
  // Safety
  safetyWarnings?: SafetyWarning[]
  
  // Verification
  requiresVerification: boolean
  verificationCriteria?: string
  
  // Evidence
  requiresPhoto: boolean
  minPhotos?: number
  photoGuidance?: string
  
  // Measurement
  measurementRequired?: boolean
  measurementSpec?: {
    parameter: string
    unit: string
    minValue?: number
    maxValue?: number
    targetValue?: number
    tolerance?: number
  }
  
  // Conditional logic
  conditionalNextStep?: {
    condition: string         // "pressure > 100"
    trueNextStep: number
    falseNextStep: number
  }
}

// ============================================================================
// PROCEDURE - Step-by-step work instruction
// ============================================================================

export interface Procedure {
  // Identity
  id: ULID                    // proc-xxxxx
  version: string             // "2.1.0" (semantic versioning)
  title: string
  description: string
  
  // Classification
  type: 'preventive-maintenance' | 'inspection' | 'troubleshooting' | 'repair' | 'calibration' | 'emergency'
  category: string
  
  // Scope
  applicableEquipmentCategories: string[]
  applicableEquipmentIds?: ULID[]
  
  // Content
  steps: ProcedureStep[]
  
  // Requirements
  requiredCertifications?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  minimumTechnicianCount: number
  
  // Duration
  estimatedDuration: number   // minutes (sum of steps)
  
  // Safety
  safetyRequirements: SafetyWarning[]
  lockoutTagoutRequired: boolean
  confinedSpaceEntry: boolean
  
  // Approval & Lifecycle
  status: ProcedureStatus
  effectiveDate?: string
  expirationDate?: string
  supersededById?: ULID       // points to newer version
  
  // Metadata
  metadata: {
    author: string
    reviewer?: string
    approver?: string
    reviewedAt?: string
    approvedAt?: string
    tags?: string[]
  }
  
  // References
  relatedProcedureIds?: ULID[]
  documentationUrls?: string[]
  
  // Metadata
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// CHECKLIST TEMPLATE - Reusable inspection checklist
// ============================================================================

export interface ChecklistTemplate {
  id: ULID                    // chk-xxxxx
  name: string
  description: string
  
  // Scope
  applicableEquipmentCategories: string[]
  
  // Checkpoints
  checkpoints: {
    id: string
    label: string
    type: 'pass-fail' | 'measurement' | 'observation' | 'photo'
    required: boolean
    measurementSpec?: {
      parameter: string
      unit: string
      minValue?: number
      maxValue?: number
    }
    guidanceText?: string
  }[]
  
  // Metadata
  audit: AuditMetadata
}

// ============================================================================
// TASK SESSION - Instance of procedure execution
// ============================================================================

export interface TaskSession {
  // Identity
  id: ULID                    // task-xxxxx
  workOrderId?: string        // external system reference
  
  // Assignment
  equipmentId: ULID
  procedureId: ULID
  procedureVersion: string
  assignedToTechnicianId: ULID
  supervisorId?: ULID
  siteId: ULID
  
  // Status
  status: TaskStatus
  priority: Priority
  
  // Timing
  scheduledStart?: string
  scheduledEnd?: string
  actualStart?: string
  actualEnd?: string
  totalDuration?: number      // minutes
  
  // Progress
  currentStepNumber?: number
  completedSteps: number[]
  skippedSteps?: { stepNumber: number; reason: string }[]
  
  // Results
  overallResult?: 'pass' | 'fail' | 'conditional'
  summary?: string
  issuesFound: ULID[]         // IssueFinding IDs
  
  // Evidence
  evidenceIds: ULID[]
  
  // Conditions
  preTaskConditions?: string
  postTaskConditions?: string
  
  // Metadata
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// INSPECTION REPORT - Formal inspection record
// ============================================================================

export interface InspectionReport {
  // Identity
  id: ULID                    // insp-xxxxx
  reportNumber: string        // human-readable
  
  // Scope
  equipmentId: ULID
  checklistTemplateId?: ULID
  taskSessionId?: ULID
  siteId: ULID
  
  // Personnel
  inspectorId: ULID
  witnessIds?: ULID[]
  
  // Status
  status: InspectionStatus
  
  // Timing
  inspectionDate: string
  submittedAt?: string
  approvedAt?: string
  approvedBy?: ULID
  
  // Results
  overallResult: 'pass' | 'fail' | 'conditional'
  checkpointResults: {
    checkpointId: string
    result: 'pass' | 'fail' | 'n-a'
    measurement?: { value: number; unit: string }
    notes?: string
    evidenceIds?: ULID[]
  }[]
  
  // Findings
  findingIds: ULID[]
  
  // Recommendations
  recommendations?: string
  followUpRequired: boolean
  followUpTaskIds?: ULID[]
  
  // Evidence
  evidenceIds: ULID[]
  
  // Metadata
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// ISSUE FINDING - Problem discovered during work
// ============================================================================

export interface IssueFinding {
  // Identity
  id: ULID                    // issue-xxxxx
  issueNumber: string         // human-readable
  
  // Context
  equipmentId: ULID
  discoveredDuring?: ULID     // task or inspection ID
  siteId: ULID
  
  // Classification
  title: string
  description: string
  severity: Severity
  category: string            // "mechanical", "electrical", "safety", "operational"
  
  // Status
  status: IssueStatus
  priority: Priority
  
  // Root Cause
  rootCause?: string
  contributingFactors?: string[]
  
  // Resolution
  resolution?: string
  resolvedBy?: ULID
  resolvedAt?: string
  verifiedBy?: ULID
  verifiedAt?: string
  
  // Assignment
  assignedToTechnicianId?: ULID
  targetResolutionDate?: string
  
  // Evidence
  evidenceIds: ULID[]
  
  // Follow-up
  followUpTaskIds?: ULID[]
  relatedIssueIds?: ULID[]
  
  // Metadata
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// EVIDENCE ITEM - Photo, video, measurement, or document
// ============================================================================

export interface EvidenceItem {
  // Identity
  id: ULID                    // evd-xxxxx
  
  // Type
  type: 'photo' | 'video' | 'audio' | 'measurement' | 'document' | 'signature'
  
  // File
  file?: FileReference
  
  // Context
  capturedBy: ULID            // technician ID
  capturedAt: string
  equipmentId?: ULID
  taskSessionId?: ULID
  inspectionReportId?: ULID
  issueFindingId?: ULID
  procedureStepNumber?: number
  
  // Location
  gps?: GPSCoordinate
  siteId: ULID
  
  // Measurement data (if type = 'measurement')
  measurement?: {
    parameter: string
    value: number
    unit: string
    instrument?: string
    calibrationDueDate?: string
  }
  
  // Annotations
  caption?: string
  notes?: string
  tags?: string[]
  
  // Status
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed'
  
  // Metadata
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// KNOWLEDGE CARD - Troubleshooting guide or tip
// ============================================================================

export interface KnowledgeCard {
  // Identity
  id: ULID                    // know-xxxxx
  title: string
  
  // Content
  problem: string
  solution: string
  steps?: string[]
  
  // Context
  applicableEquipmentCategories: string[]
  applicableEquipmentIds?: ULID[]
  tags: string[]
  
  // Validation
  verifiedBy?: ULID[]
  effectiveness?: number      // 0-100 score
  usageCount: number
  
  // Metadata
  audit: AuditMetadata
}

// ============================================================================
// OFFLINE PACKAGE - Bundle for offline work
// ============================================================================

export interface OfflinePackage {
  // Identity
  id: ULID                    // pkg-xxxxx
  name: string
  
  // Scope
  siteId: ULID
  technicianId: ULID
  taskSessionIds?: ULID[]
  equipmentIds?: ULID[]
  
  // Content
  includedEntities: {
    equipment: ULID[]
    procedures: ULID[]
    tasks: ULID[]
    checklists: ULID[]
    knowledge: ULID[]
  }
  
  // Status
  status: 'building' | 'ready' | 'downloaded' | 'expired'
  
  // Timing
  validFrom: string
  validUntil: string
  downloadedAt?: string
  
  // Size
  totalSizeBytes: number
  
  // Sync
  lastSyncedAt?: string
  pendingUploads?: {
    entityType: string
    entityId: ULID
    changeType: 'create' | 'update' | 'delete'
  }[]
  
  // Metadata
  audit: AuditMetadata
}
