export const defaultWeldQualityTemplates = [
  {
    moduleId: 'weld-quality-control',
    name: 'Manuel GMAW - Karbon Çelik',
    description: 'Manuel MIG kaynak - AWS D1.1 standardı',
    category: 'welding',
    config: {
      standard: 'AWS D1.1',
      weldType: 'GMAW',
      baseMaterial: 'Carbon Steel'
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'weld-quality-control',
    name: 'Robot GMAW - Oto Endüstri',
    description: 'Robot MIG kaynak - Otomotiv standardları',
    category: 'welding',
    config: {
      standard: 'AWS D1.1',
      weldType: 'Robot',
      baseMaterial: 'Carbon Steel'
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'weld-quality-control',
    name: 'TIG - Paslanmaz Çelik',
    description: 'TIG kaynak - ISO 5817 standardı',
    category: 'welding',
    config: {
      standard: 'ISO 5817',
      weldType: 'TIG',
      baseMaterial: 'Stainless Steel'
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'weld-quality-control',
    name: 'SMAW - Yapısal Çelik',
    description: 'El kaynağı - Yapısal uygulamalar',
    category: 'welding',
    config: {
      standard: 'AWS D1.1',
      weldType: 'SMAW',
      baseMaterial: 'Carbon Steel'
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'weld-quality-control',
    name: 'SAW - Gemi İnşa',
    description: 'Submerged arc - Tersane uygulamaları',
    category: 'welding',
    config: {
      standard: 'EN ISO 13919-1',
      weldType: 'SAW',
      baseMaterial: 'Carbon Steel'
    },
    isPublic: true,
    createdBy: 'system'
  }
];
