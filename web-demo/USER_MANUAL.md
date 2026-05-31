# VisionClaw User Manual

## Quick Start
1. Click Modules in navigation
2. Select module
3. Add items/config
4. Select evidence image
5. Click Run Inspection

---

## Presence Check Module
Check if required items present in image.

- Add items to check (e.g., "Hard hat", "Safety vest")
- Minimum 1 item required
- Results: Present ✅ / Missing ❌ / Uncertain ⚠️

Templates:
- Kaynak İstasyonu - Güvenlik
- Genel Güvenlik - PPE
- Elektrik Paneli
- Montaj Hattı
- Tersane - Gemi

---

## Defect Detection Module
Detect surface defects: cracks, rust, scratches, dents.

- Add defect types (e.g., "crack", "rust")
- Sensitivity slider: 0% = lenient, 100% = strict
- Results: PASSED / FAILED / NEEDS REVIEW

Templates:
- Genel Yüzey Kontrolü
- Kaynak Kalite Kontrolü
- Beton/Yapı Kontrolü
- Gemi Gövde - Tersane

---

## Results

Status card shows:
- Overall status (PASSED/FAILED/NEEDS REVIEW)
- Confidence percentage (0-100%)

Stats show:
- Total items checked
- Present/Missing/Critical count

Item details list:
- Each item
- Status badge
- Confidence %
- Description

Actions:
- 📋 Copy JSON - Copy results
- ⬇️ Download - Save as JSON file

---

## Error Messages

- "Please select module" → Choose from dropdown
- "Please select evidence" → Upload or select image
- "Add at least 1 item" → Add items to check
- "Module failed" → Retry with different image
- "Network error" → Check internet

---

## Tips

- Use clear, well-lit images for better results
- Higher sensitivity = stricter detection
- Download results for documentation
- Create custom templates for your workflow
