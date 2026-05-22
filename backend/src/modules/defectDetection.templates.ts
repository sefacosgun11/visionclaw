export const defaultDefectDetectionTemplates = [
  {
    moduleId: 'defect-detection',
    name: 'Genel Yüzey Kontrolü - Temel',
    description: 'Yaygın yüzey kusurlarının tespiti (çatlak, çizik, pas)',
    category: 'quality-check',
    config: {
      defectTypes: [
        'Çatlak (crack)',
        'Çizik (scratch)',
        'Pas/Korozyon (rust/corrosion)',
        'Göçük/Ezik (dent)',
        'Boya dökülmesi (paint peeling)'
      ],
      sensitivity: 0.7
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'defect-detection',
    name: 'Kaynak Kalite Kontrolü',
    description: 'Kaynak dikişlerinde kusur tespiti',
    category: 'welding',
    config: {
      defectTypes: [
        'Kaynak çatlağı (weld crack)',
        'Gözenek (porosity)',
        'Kaynak sıçraması (spatter)',
        'Yetersiz nüfuziyet (lack of penetration)',
        'Altkesilme (undercut)'
      ],
      sensitivity: 0.8
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'defect-detection',
    name: 'Beton/Yapı Kontrolü',
    description: 'Beton ve yapısal elemanlarda kusur tespiti',
    category: 'structural',
    config: {
      defectTypes: [
        'Çatlak (crack)',
        'Petek (honeycomb)',
        'Dökülme/Ayrışma (spalling)',
        'Nem/Su sızıntısı (water damage)',
        'Donatı korozyonu (rebar corrosion)'
      ],
      sensitivity: 0.75
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'defect-detection',
    name: 'Gemi Gövde - Tersane Kontrolü',
    description: 'Gemi gövdesi ve deniz araçlarında kusur tespiti',
    category: 'shipyard',
    config: {
      defectTypes: [
        'Korozyon/Pas (corrosion/rust)',
        'Çatlak (crack)',
        'Deformasyon (deformation)',
        'Boya hasarı (paint damage)',
        'Kavitasyon hasarı (cavitation damage)'
      ],
      sensitivity: 0.8
    },
    isPublic: true,
    createdBy: 'system'
  }
];
