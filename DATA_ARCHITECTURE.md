# VisionClaw Data Architecture

Implementation guide for industrial field assistant platform.

## Core Principles

**ID Strategy:** ULID format prefix-ulid
- Sortable by creation time
- Globally unique without coordination
- Safe for offline generation
- 26 characters Crockford base32

**Prefixes:** eq Equipment, proc Procedure, task TaskSession, insp InspectionReport, evd EvidenceItem, chk ChecklistResponse, tech Technician, site Site

**Timestamps:** ISO 8601 UTC only

## Entity Relationships

Site has many Equipment
Equipment has many TaskSession
Equipment links to many Procedure via applicableEquipmentIds
TaskSession belongs to one Procedure
TaskSession has many EvidenceItem
TaskSession has many ChecklistResponse
TaskSession has optional InspectionReport
InspectionReport has many EvidenceItem

Key Points:
- Equipment is central anchor
- Procedure is template, TaskSession is execution
- EvidenceItem can belong to task OR inspection
- One InspectionReport per TaskSession optional

## Source of Truth vs Cached Data

Server-Side Source of Truth (admin-managed):
- Site, Procedure, Equipment, Technician

Offline-First Entities (created on device):
- TaskSession, EvidenceItem, ChecklistResponse, InspectionReport

Cached for Offline (downloaded before work):
- Equipment specs, Procedures, Site data

## Sync State Model

Every offline entity includes:
- syncStatus: synced, pending, conflict, error
- lastSyncedAt, localModifiedAt, serverModifiedAt
- syncHash for conflict detection
- deviceId tracking

Flow: Device creates pending, uploads, becomes synced or conflict

## Versioning Strategy

Procedures use semantic versioning: 2.1.0
- Major: Breaking changes
- Minor: Additive changes
- Patch: Corrections

Approved procedures are immutable - new version creates new record

## Audit Fields

All entities include:
- createdAt, createdBy, updatedAt, updatedBy
- deletedAt for soft delete
- version number for optimistic locking

## Status Enums

EquipmentStatus: operational, degraded, offline, maintenance, decommissioned
TaskStatus: draft, assigned, in-progress, paused, completed, failed, cancelled
InspectionStatus: draft, in-progress, completed, approved, rejected
Severity: critical, high, medium, low, info
SafetyLevel: danger, warning, caution, notice

## Validation Rules

IDs: prefix-26chars ULID
Timestamps: ISO 8601 UTC
Asset Tags: 3-50 chars alphanumeric plus hyphens, unique per site
GPS: Lat -90 to 90, Lon -180 to 180
Files: Max 100MB, SHA-256 checksum required

## MVP Entity Scope

Phase 1 MVP includes:
- Equipment
- Procedure and ProcedureStep
- TaskSession
- ChecklistResponse
- EvidenceItem
- InspectionReport

Out of MVP: IssueFinding, KnowledgeCard, OfflinePackage, full Technician profiles, multi-site

## MVP Data Flow

Pre-Work: Download tasks, equipment, procedures, cache locally
During Work: Execute steps offline, capture evidence, answer checkpoints
Post-Work: Upload pending entities, server validates, status becomes synced

## File Storage

Local: IndexedDB during offline work
Server: S3-compatible object storage
Key Format: siteId/equipmentId/taskSessionId/evidenceId.ext

## Conflict Resolution

Strategy: Last-Write-Wins with manual override
Automatic resolution if no syncHash mismatch
Manual UI if conflict detectedö


