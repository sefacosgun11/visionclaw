# VisionClaw AI Modules - API Documentation

## Overview
VisionClaw is a modular AI inspection platform with standardized API endpoints.

## Base URL
https://visionclaw-production-d39c.up.railway.app

---

## GET /api/modules
List all available modules.

Response: Array of modules with id, name, description, category, configSchema

---

## POST /api/modules/execute
Execute a module on evidence.

Request:
{
  "moduleId": "presence-check",
  "evidenceId": "evidence_id",
  "config": { "requiredItems": ["item1", "item2"] },
  "executedBy": "user_id"
}

Response:
{
  "execution": { "id", "status", "processingTimeMs" },
  "result": { "status", "confidence", "findings", "summary" }
}

---

## GET /api/module-templates
List all templates.

Query params: moduleId, category, isPublic

---

## POST /api/module-templates
Create new template.

Request:
{
  "moduleId": "presence-check",
  "name": "Template name",
  "config": { /* module config */ },
  "createdBy": "user_id"
}

---

## Status Codes
- 201: Success
- 400: Bad request
- 404: Not found
- 500: Server error
