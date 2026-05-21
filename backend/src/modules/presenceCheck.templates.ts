// Default templates for Presence Check module
export const defaultPresenceCheckTemplates = [
  {
    moduleId: 'presence-check',
    name: 'Kaynak İstasyonu - Güvenlik Ekipmanı',
    description: 'Kaynak işlemi öncesi zorunlu güvenlik ekipmanı kontrolü',
    category: 'safety',
    config: {
      requiredItems: [
        'Kaynak maskesi (kapalı lens)',
        'Deri kaynak eldiveni',
        'Deri kaynak önlüğü',
        'Yangın söndürücü (2m mesafede)',
        'Havalandırma sistemi (açık)'
      ]
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'presence-check',
    name: 'Genel Güvenlik Ekipmanı - PPE',
    description: 'Standart kişisel koruyucu ekipman kontrolü',
    category: 'safety',
    config: {
      requiredItems: [
        'Baret (hard hat)',
        'Güvenlik yeleği (high visibility)',
        'Çelik burunlu bot',
        'Güvenlik gözlüğü',
        'İşitme koruyucu'
      ]
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'presence-check',
    name: 'Montaj Hattı - Parça Tamamlık Kontrolü',
    description: 'Montaj tamamlama öncesi parça kontrolü',
    category: 'assembly',
    config: {
      requiredItems: [
        'Ana montaj plakası',
        'M8 cıvata (4 adet)',
        'M8 somun (4 adet)',
        'Düz rondela (4 adet)',
        'Ürün seri etiketi'
      ]
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'presence-check',
    name: 'Elektrik Paneli - Bileşen Kontrolü',
    description: 'Elektrik panosu montaj sonrası kontrol',
    category: 'quality-check',
    config: {
      requiredItems: [
        'Ana şalter',
        'Sigorta grubu',
        'Topraklama kablosu (yeşil-sarı)',
        'Uyarı etiketi (voltaj)',
        'Kabin kapısı (kapalı ve kilitli)'
      ]
    },
    isPublic: true,
    createdBy: 'system'
  },
  {
    moduleId: 'presence-check',
    name: 'Tersane - Gemi Ekipman Kontrolü',
    description: 'Tersane güvenlik ve ekipman varlık kontrolü',
    category: 'shipyard',
    config: {
      requiredItems: [
        'Vinç kancası emniyet mandalı',
        'Yük tablosu levhası',
        'Yangın söndürme sistemi',
        'Acil stop düğmesi',
        'Uyarı ışıkları (çalışır durumda)'
      ]
    },
    isPublic: true,
    createdBy: 'system'
  }
];
