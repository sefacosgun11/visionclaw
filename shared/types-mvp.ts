// VisionClaw MVP Data Model
// Production-ready types for Phase 1

// ============================================================================
// BASE TYPES
// ============================================================================

export type ULID = string

export interface AuditMetadata {
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  deletedAt?: string
  version: number
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
  storageBackend: 'local' | 's3'
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
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type SafetyLevel = 'danger' | 'warning' | 'caution' | 'notice'

// ============================================================================
// EQUIPMENT
// ============================================================================

export interface Equipment {
  id: ULID
  assetTag: string
  name: string
  category: string
  manufacturer: string
  model: string
  serialNumber: string
  specifications: Record<string, any>
  siteId: ULID
  location: {
    facility: string
    building?: string
    floor?: string
    room?: string
    zone?: string
    gps?: GPSCoordinate
  }
  status: EquipmentStatus
  criticality: 'critical' | 'high' | 'medium' | 'low'
  operatingHours?: number
  maintenanceSchedule?: {
    interval: number
    intervalUnit: 'hours' | 'days'
    lastServicedAt: string
    nextDue: string
  }
  qrCodeData?: string
  audit: AuditMetadata
}

// ============================================================================
// PROCEDURE
// ============================================================================

export interface SafetyWarning {
  id: ULID
  level: SafetyLevel
  title: string
  description: string
  requiresAcknowledgment: boolean
  ppe?: string[]
  hazards?: string[]
}

export interface ProcedureStep {
  stepNumber: number
  title: string
  instruction: string
  actionType: 'inspection' | 'measurement' | 'adjustment' | 'testing' | 'documentation' | 'safety-check' | 'photo-required' | 'sign-off'
  estimatedDuration?: number
  requiredTools?: string[]
  requiredParts?: string[]
  safetyWarnings?: SafetyWarning[]
  requiresVerification: boolean
  requiresPhoto: boolean
  minPhotos?: number
  photoGuidance?: string
  measurementRequired?: boolean
  measurementSpec?: {
    parameter: string
    unit: string
    minValue?: number
    maxValue?: number
    targetValue?: number
    tolerance?: number
  }
}

export interface Procedure {
  id: ULID
  version: string
  title: string
  description: string
  type: 'preventive-maintenance' | 'inspection' | 'troubleshooting' | 'repair' | 'calibration' | 'emergency'
  category: string
  applicableEquipmentCategories: string[]
  applicableEquipmentIds?: ULID[]
  steps: ProcedureStep[]
  requiredCertifications?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  minimumTechnicianCount: number
  estimatedDuration: number
  safetyRequirements: SafetyWarning[]
  lockoutTagoutRequired: boolean
  status: 'draft' | 'review' | 'approved' | 'active' | 'deprecated' | 'archived'
  effectiveDate?: string
  supersededById?: ULID
  metadata: {
    author: string
    reviewer?: string
    approver?: string
    reviewedAt?: string
    approvedAt?: string
    tags?: string[]
  }
  audit: AuditMetadata
}

// ============================================================================
// TASK SESSION
// ============================================================================

export interface TaskSession {
  id: ULID
  workOrderId?: string
  equipmentId: ULID
  procedureId: ULID
  procedureVersion: string
  assignedToTechnicianId: ULID
  supervisorId?: ULID
  siteId: ULID
  status: TaskStatus
  priority: 'urgent' | 'high' | 'normal' | 'low'
  scheduledStart?: string
  scheduledEnd?: string
  actualStart?: string
  actualEnd?: string
  totalDuration?: number
  currentStepNumber?: number
  completedSteps: number[]
  skippedSteps?: { stepNumber: number; reason: string }[]
  overallResult?: 'pass' | 'fail' | 'conditional'
  summary?: string
  evidenceIds: ULID[]
  checklistResponseIds: ULID[]
  inspectionReportId?: ULID
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// CHECKLIST RESPONSE
// ============================================================================

export interface ChecklistResponse {
  id: ULID
  taskSessionId: ULID
  procedureStepNumber: number
  checkpointId: string
  checkpointLabel: string
  responseType: 'pass-fail' | 'measurement' | 'observation' | 'photo'
  result?: 'pass' | 'fail' | 'n-a'
  measurement?: {
    value: number
    unit: string
    withinSpec: boolean
  }
  observation?: string
  evidenceIds?: ULID[]
  notes?: string
  respondedBy: ULID
  respondedAt: string
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// EVIDENCE ITEM
// ============================================================================

export interface EvidenceItem {
  id: ULID
  type: 'photo' | 'video' | 'audio' | 'measurement' | 'document' | 'signature'
  file?: FileReference
  capturedBy: ULID
  capturedAt: string
  equipmentId?: ULID
  taskSessionId?: ULID
  inspectionReportId?: ULID
  procedureStepNumber?: number
  gps?: GPSCoordinate
  siteId: ULID
  measurement?: {
    parameter: string
    value: number
    unit: string
    instrument?: string
  }
  caption?: string
  notes?: string
  tags?: string[]
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed'
  audit: AuditMetadata
  sync?: SyncMetadata
}

// ============================================================================
// INSPECTION REPORT
// ============================================================================

export interface InspectionReport {
  id: ULID
  reportNumber: string
  equipmentId: ULID
  taskSessionId: ULID
  siteId: ULID
  inspectorId: ULID
  witnessIds?: ULID[]
  status: InspectionStatus
  inspectionDate: string
  submittedAt?: string
  approvedAt?: string
  approvedBy?: ULID
  overallResult: 'pass' | 'fail' | 'conditional'
  checkpointResults: {
    checkpointId: string
    result: 'pass' | 'fail' | 'n-a'
    measurement?: { value: number; unit: string }
    notes?: string
    evidenceIds?: ULID[]
  }[]
  recommendations?: string
  followUpRequired: boolean
  evidenceIds: ULID[]
  audit: AuditMetadata
  sync?: SyncMetadata
}
