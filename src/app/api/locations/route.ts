import { NextRequest, NextResponse } from 'next/server'

// Türkiye illeri ve ilçeleri
const CITIES_DATA: { [key: string]: string[] } = {
    'Adana': ['Merkez', 'Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'Kozan', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Pozantı', 'Aladağ', 'Feke', 'Saimbeyli', 'Tufanbeyli'],
    'Adıyaman': ['Merkez', 'Besni', 'Kahta', 'Gölbaşı', 'Gerger', 'Çelikhan', 'Samsat', 'Sincik', 'Tut'],
    'Afyonkarahisar': ['Merkez', 'Sandıklı', 'Dinar', 'Bolvadin', 'Emirdağ', 'Çay', 'Sultandağı', 'Sinanpaşa', 'İhsaniye', 'Şuhut', 'Başmakçı', 'Bayat', 'İscehisar', 'Çobanlar', 'Evciler', 'Hocalar', 'Kızılören', 'Dazkırı'],
    'Ağrı': ['Merkez', 'Patnos', 'Doğubayazıt', 'Diyadin', 'Eleşkirt', 'Tutak', 'Taşlıçay', 'Hamur'],
    'Aksaray': ['Merkez', 'Ortaköy', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Ağaçören', 'Sarıyahşi'],
    'Amasya': ['Merkez', 'Merzifon', 'Suluova', 'Taşova', 'Gümüşhacıköy', 'Göynücek', 'Hamamözü'],
    'Ankara': ['Çankaya', 'Keçiören', 'Mamak', 'Altındağ', 'Yenimahalle', 'Sincan', 'Etimesgut', 'Pursaklar', 'Gölbaşı', 'Polatlı', 'Çubuk', 'Beypazarı', 'Elmadağ', 'Şereflikoçhisar', 'Kahramankazan', 'Kalecik', 'Kızılcahamam', 'Akyurt', 'Ayaş', 'Bala', 'Evren', 'Güdül', 'Haymana', 'Nallıhan'],
    'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Döşemealtı', 'Aksu', 'Alanya', 'Manavgat', 'Serik', 'Kumluca', 'Kaş', 'Kemer', 'Finike', 'Gazipaşa', 'Demre', 'Elmalı', 'Korkuteli', 'Akseki', 'İbradı', 'Gündoğmuş'],
    'Ardahan': ['Merkez', 'Göle', 'Çıldır', 'Hanak', 'Posof', 'Damal'],
    'Artvin': ['Merkez', 'Hopa', 'Borçka', 'Arhavi', 'Yusufeli', 'Şavşat', 'Ardanuç', 'Murgul'],
    'Aydın': ['Efeler', 'Nazilli', 'Söke', 'Kuşadası', 'Didim', 'İncirliova', 'Germencik', 'Çine', 'Köşk', 'Sultanhisar', 'Buharkent', 'Yenipazar', 'Bozdoğan', 'Karacasu', 'Koçarlı', 'Karpuzlu', 'Kuyucak'],
    'Balıkesir': ['Altıeylül', 'Karesi', 'Bandırma', 'Edremit', 'Gönen', 'Susurluk', 'Bigadiç', 'Burhaniye', 'Erdek', 'Dursunbey', 'Manyas', 'Savaştepe', 'Sındırgı', 'Ayvalık', 'Havran', 'İvrindi', 'Balya', 'Kepsut', 'Marmara'],
    'Bartın': ['Merkez', 'Ulus', 'Kurucaşile', 'Amasra'],
    'Batman': ['Merkez', 'Kozluk', 'Sason', 'Beşiri', 'Hasankeyf', 'Gercüş'],
    'Bayburt': ['Merkez', 'Demirözü', 'Aydıntepe'],
    'Bilecik': ['Merkez', 'Bozüyük', 'Söğüt', 'Osmaneli', 'Pazaryeri', 'Gölpazarı', 'İnhisar', 'Yenipazar'],
    'Bingöl': ['Merkez', 'Genç', 'Solhan', 'Karlıova', 'Adaklı', 'Kiğı', 'Yayladere', 'Yedisu'],
    'Bitlis': ['Merkez', 'Tatvan', 'Ahlat', 'Adilcevaz', 'Güroymak', 'Hizan', 'Mutki'],
    'Bolu': ['Merkez', 'Gerede', 'Mudurnu', 'Göynük', 'Mengen', 'Seben', 'Yeniçağa', 'Dörtdivan', 'Kıbrıscık'],
    'Burdur': ['Merkez', 'Bucak', 'Yeşilova', 'Gölhisar', 'Tefenni', 'Ağlasun', 'Çavdır', 'Karamanlı', 'Altınyayla', 'Çeltikçi', 'Kemer'],
    'Bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'İnegöl', 'Gemlik', 'Mudanya', 'Gürsu', 'Kestel', 'Mustafakemalpaşa', 'Karacabey', 'Orhangazi', 'İznik', 'Yenişehir', 'Orhaneli', 'Harmancık', 'Büyükorhan', 'Keles'],
    'Çanakkale': ['Merkez', 'Biga', 'Çan', 'Gelibolu', 'Ezine', 'Ayvacık', 'Yenice', 'Lapseki', 'Bayramiç', 'Bozcaada', 'Gökçeada'],
    'Çankırı': ['Merkez', 'Çerkeş', 'Kurşunlu', 'Ilgaz', 'Orta', 'Şabanözü', 'Eldivan', 'Yapraklı', 'Atkaracalar', 'Kızılırmak', 'Bayramören', 'Korgun'],
    'Çorum': ['Merkez', 'Sungurlu', 'Osmancık', 'Alaca', 'İskilip', 'Kargı', 'Mecitözü', 'Ortaköy', 'Boğazkale', 'Uğurludağ', 'Dodurga', 'Bayat', 'Laçin', 'Oğuzlar'],
    'Denizli': ['Merkezefendi', 'Pamukkale', 'Çivril', 'Acıpayam', 'Tavas', 'Honaz', 'Çal', 'Buldan', 'Sarayköy', 'Kale', 'Serinhisar', 'Güney', 'Bozkurt', 'Çardak', 'Baklan', 'Çameli', 'Babadağ', 'Beyağaç', 'Bekilli'],
    'Diyarbakır': ['Kayapınar', 'Bağlar', 'Yenişehir', 'Sur', 'Ergani', 'Bismil', 'Silvan', 'Çermik', 'Dicle', 'Çınar', 'Kulp', 'Lice', 'Hani', 'Hazro', 'Eğil', 'Çüngüş', 'Kocaköy'],
    'Düzce': ['Merkez', 'Akçakoca', 'Kaynaşlı', 'Cumayeri', 'Gölyaka', 'Yığılca', 'Çilimli', 'Gümüşova'],
    'Edirne': ['Merkez', 'Keşan', 'Uzunköprü', 'İpsala', 'Havsa', 'Enez', 'Meriç', 'Süloğlu', 'Lalapaşa'],
    'Elazığ': ['Merkez', 'Kovancılar', 'Karakoçan', 'Palu', 'Maden', 'Sivrice', 'Baskil', 'Arıcak', 'Keban', 'Alacakaya', 'Ağın'],
    'Erzincan': ['Merkez', 'Tercan', 'Üzümlü', 'Refahiye', 'Çayırlı', 'Kemaliye', 'İliç', 'Kemah', 'Otlukbeli'],
    'Erzurum': ['Yakutiye', 'Palandöken', 'Aziziye', 'Horasan', 'Pasinler', 'Oltu', 'Karayazı', 'Hınıs', 'Şenkaya', 'Tekman', 'Tortum', 'İspir', 'Aşkale', 'Köprüköy', 'Narman', 'Çat', 'Karaçoban', 'Olur', 'Uzundere', 'Pazaryolu'],
    'Eskişehir': ['Odunpazarı', 'Tepebaşı', 'Sivrihisar', 'Çifteler', 'Mahmudiye', 'Alpu', 'Seyitgazi', 'Mihalıççık', 'Beylikova', 'İnönü', 'Günyüzü', 'Han', 'Sarıcakaya', 'Mihalgazi'],
    'Gaziantep': ['Şahinbey', 'Şehitkamil', 'Nizip', 'İslahiye', 'Nurdağı', 'Oğuzeli', 'Araban', 'Yavuzeli', 'Karkamış'],
    'Giresun': ['Merkez', 'Bulancak', 'Espiye', 'Görele', 'Tirebolu', 'Keşap', 'Piraziz', 'Dereli', 'Şebinkarahisar', 'Yağlıdere', 'Alucra', 'Güce', 'Eynesil', 'Çamoluk', 'Doğankent', 'Çanakçı'],
    'Gümüşhane': ['Merkez', 'Kelkit', 'Şiran', 'Torul', 'Köse', 'Kürtün'],
    'Hakkari': ['Merkez', 'Yüksekova', 'Şemdinli', 'Çukurca'],
    'Hatay': ['Antakya', 'İskenderun', 'Defne', 'Samandağ', 'Kırıkhan', 'Dörtyol', 'Reyhanlı', 'Altınözü', 'Arsuz', 'Erzin', 'Payas', 'Hassa', 'Belen', 'Kumlu', 'Yayladağı'],
    'Iğdır': ['Merkez', 'Tuzluca', 'Aralık', 'Karakoyunlu'],
    'Isparta': ['Merkez', 'Yalvaç', 'Eğirdir', 'Şarkikaraağaç', 'Gelendost', 'Keçiborlu', 'Senirkent', 'Uluborlu', 'Atabey', 'Gönen', 'Aksu', 'Sütçüler', 'Yenişarbademli'],
    'İstanbul': ['Kadıköy', 'Üsküdar', 'Maltepe', 'Ataşehir', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Fatih', 'Bakırköy', 'Bahçelievler', 'Bağcılar', 'Küçükçekmece', 'Avcılar', 'Esenyurt', 'Beylikdüzü', 'Büyükçekmece', 'Başakşehir', 'Esenler', 'Güngören', 'Kartal', 'Pendik', 'Tuzla', 'Sultanbeyli', 'Ümraniye', 'Sancaktepe', 'Çekmeköy', 'Beykoz', 'Sarıyer', 'Eyüpsultan', 'Gaziosmanpaşa', 'Bayrampaşa', 'Zeytinburnu', 'Kağıthane', 'Sultangazi', 'Arnavutköy', 'Silivri', 'Çatalca', 'Şile', 'Adalar'],
    'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Gaziemir', 'Balçova', 'Narlıdere', 'Güzelbahçe', 'Karabağlar', 'Torbalı', 'Menemen', 'Aliağa', 'Bergama', 'Ödemiş', 'Tire', 'Urla', 'Kemalpaşa', 'Dikili', 'Seferihisar', 'Çeşme', 'Foça', 'Bayındır', 'Selçuk', 'Kiraz', 'Kınık', 'Menderes', 'Beydağ', 'Karaburun'],
    'Kahramanmaraş': ['Onikişubat', 'Dulkadiroğlu', 'Elbistan', 'Afşin', 'Göksun', 'Pazarcık', 'Türkoğlu', 'Andırın', 'Çağlayancerit', 'Nurhak', 'Ekinözü'],
    'Karabük': ['Merkez', 'Safranbolu', 'Yenice', 'Eflani', 'Eskipazar', 'Ovacık'],
    'Karaman': ['Merkez', 'Ermenek', 'Ayrancı', 'Sarıveliler', 'Kazımkarabekir', 'Başyayla'],
    'Kars': ['Merkez', 'Sarıkamış', 'Kağızman', 'Selim', 'Digor', 'Akyaka', 'Arpaçay', 'Susuz'],
    'Kastamonu': ['Merkez', 'Tosya', 'Taşköprü', 'İnebolu', 'Araç', 'Cide', 'Daday', 'Çatalzeytin', 'Küre', 'Abana', 'Devrekani', 'Şenpazar', 'Seydiler', 'Doğanyurt', 'Pınarbaşı', 'Ağlı', 'İhsangazi', 'Bozkurt', 'Hanönü', 'Azdavay'],
    'Kayseri': ['Melikgazi', 'Kocasinan', 'Talas', 'Hacılar', 'İncesu', 'Develi', 'Yahyalı', 'Felahiye', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Tomarza', 'Yeşilhisar', 'Akkışla', 'Bünyan', 'Özvatan'],
    'Kilis': ['Merkez', 'Elbeyli', 'Musabeyli', 'Polateli'],
    'Kırıkkale': ['Merkez', 'Keskin', 'Delice', 'Sulakyurt', 'Balışeyh', 'Yahşihan', 'Bahşili', 'Çelebi', 'Karakeçili'],
    'Kırklareli': ['Merkez', 'Lüleburgaz', 'Babaeski', 'Vize', 'Pınarhisar', 'Demirköy', 'Kofçaz', 'Pehlivanköy'],
    'Kırşehir': ['Merkez', 'Kaman', 'Mucur', 'Çiçekdağı', 'Akpınar', 'Boztepe', 'Akçakent'],
    'Kocaeli': ['İzmit', 'Gebze', 'Darıca', 'Çayırova', 'Dilovası', 'Körfez', 'Derince', 'Gölcük', 'Kartepe', 'Başiskele', 'Kandıra', 'Karamürsel'],
    'Konya': ['Selçuklu', 'Meram', 'Karatay', 'Ereğli', 'Akşehir', 'Ilgın', 'Seydişehir', 'Beyşehir', 'Çumra', 'Kulu', 'Karapınar', 'Cihanbeyli', 'Doğanhisar', 'Bozkır', 'Hadim', 'Sarayönü', 'Kadınhanı', 'Hüyük', 'Altınekin', 'Tuzlukçu', 'Güneysınır', 'Ahırlı', 'Yalıhüyük', 'Yunak', 'Emirgazi', 'Halkapınar', 'Taşkent', 'Derbent', 'Derebucak', 'Çeltik', 'Akören'],
    'Kütahya': ['Merkez', 'Tavşanlı', 'Gediz', 'Simav', 'Emet', 'Altıntaş', 'Domaniç', 'Aslanapa', 'Çavdarhisar', 'Dumlupınar', 'Hisarcık', 'Pazarlar', 'Şaphane'],
    'Malatya': ['Battalgazi', 'Yeşilyurt', 'Akçadağ', 'Darende', 'Hekimhan', 'Arapgir', 'Doğanşehir', 'Pütürge', 'Yazıhan', 'Arguvan', 'Kale', 'Doğanyol', 'Kuluncak'],
    'Manisa': ['Şehzadeler', 'Yunusemre', 'Turgutlu', 'Akhisar', 'Salihli', 'Soma', 'Alaşehir', 'Kula', 'Demirci', 'Sarıgöl', 'Gördes', 'Kırkağaç', 'Saruhanlı', 'Selendi', 'Gölmarmara', 'Köprübaşı', 'Ahmetli'],
    'Mardin': ['Artuklu', 'Kızıltepe', 'Nusaybin', 'Midyat', 'Derik', 'Ömerli', 'Mazıdağı', 'Dargeçit', 'Savur', 'Yeşilli'],
    'Mersin': ['Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir', 'Tarsus', 'Erdemli', 'Silifke', 'Anamur', 'Mut', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Gülnar'],
    'Muğla': ['Menteşe', 'Bodrum', 'Fethiye', 'Marmaris', 'Milas', 'Ortaca', 'Datça', 'Dalaman', 'Köyceğiz', 'Yatağan', 'Ula', 'Kavaklıdere', 'Seydikemer'],
    'Muş': ['Merkez', 'Bulanık', 'Malazgirt', 'Varto', 'Hasköy', 'Korkut'],
    'Nevşehir': ['Merkez', 'Ürgüp', 'Avanos', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Derinkuyu', 'Acıgöl'],
    'Niğde': ['Merkez', 'Bor', 'Altunhisar', 'Çiftlik', 'Çamardı', 'Ulukışla'],
    'Ordu': ['Altınordu', 'Ünye', 'Fatsa', 'Perşembe', 'Korgan', 'Kumru', 'Ulubey', 'Gölköy', 'Mesudiye', 'Akkuş', 'Aybastı', 'Gülyalı', 'İkizce', 'Kabadüz', 'Kabataş', 'Çamaş', 'Çatalpınar', 'Çaybaşı'],
    'Osmaniye': ['Merkez', 'Kadirli', 'Düziçi', 'Bahçe', 'Toprakkale', 'Hasanbeyli', 'Sumbas'],
    'Rize': ['Merkez', 'Ardeşen', 'Pazar', 'Çayeli', 'Fındıklı', 'Güneysu', 'İkizdere', 'Kalkandere', 'Derepazarı', 'Hemşin', 'İyidere', 'Çamlıhemşin'],
    'Sakarya': ['Adapazarı', 'Serdivan', 'Erenler', 'Arifiye', 'Hendek', 'Karasu', 'Akyazı', 'Ferizli', 'Geyve', 'Sapanca', 'Kaynarca', 'Pamukova', 'Karapürçek', 'Söğütlü', 'Kocaali', 'Taraklı'],
    'Samsun': ['İlkadım', 'Atakum', 'Canik', 'Tekkeköy', 'Bafra', 'Çarşamba', 'Terme', 'Havza', 'Vezirköprü', 'Kavak', 'Alaçam', 'Salıpazarı', '19 Mayıs', 'Ladik', 'Ayvacık', 'Asarcık', 'Yakakent'],
    'Siirt': ['Merkez', 'Kurtalan', 'Pervari', 'Baykan', 'Eruh', 'Şirvan', 'Tillo'],
    'Sinop': ['Merkez', 'Boyabat', 'Gerze', 'Ayancık', 'Durağan', 'Türkeli', 'Erfelek', 'Saraydüzü', 'Dikmen'],
    'Sivas': ['Merkez', 'Şarkışla', 'Gemerek', 'Suşehri', 'Zara', 'Kangal', 'Yıldızeli', 'Akıncılar', 'Divriği', 'Gürün', 'Hafik', 'İmranlı', 'Koyulhisar', 'Ulaş', 'Altınyayla', 'Doğanşar', 'Gölova'],
    'Şanlıurfa': ['Haliliye', 'Eyyübiye', 'Karaköprü', 'Viranşehir', 'Siverek', 'Suruç', 'Akçakale', 'Birecik', 'Ceylanpınar', 'Bozova', 'Harran', 'Hilvan'],
    'Şırnak': ['Merkez', 'Cizre', 'Silopi', 'İdil', 'Uludere', 'Güçlükonak', 'Beytüşşebap'],
    'Tekirdağ': ['Süleymanpaşa', 'Çorlu', 'Çerkezköy', 'Kapaklı', 'Ergene', 'Hayrabolu', 'Malkara', 'Muratlı', 'Saray', 'Şarköy', 'Marmaraereğlisi'],
    'Tokat': ['Merkez', 'Erbaa', 'Turhal', 'Zile', 'Niksar', 'Reşadiye', 'Almus', 'Artova', 'Başçiftlik', 'Pazar', 'Sulusaray', 'Yeşilyurt'],
    'Trabzon': ['Ortahisar', 'Akçaabat', 'Yomra', 'Arsin', 'Sürmene', 'Of', 'Araklı', 'Çarşıbaşı', 'Maçka', 'Beşikdüzü', 'Vakfıkebir', 'Düzköy', 'Tonya', 'Şalpazarı', 'Köprübaşı', 'Hayrat', 'Dernekpazarı', 'Çaykara'],
    'Tunceli': ['Merkez', 'Pertek', 'Çemişgezek', 'Hozat', 'Mazgirt', 'Nazımiye', 'Ovacık', 'Pülümür'],
    'Uşak': ['Merkez', 'Eşme', 'Banaz', 'Sivaslı', 'Ulubey', 'Karahallı'],
    'Van': ['İpekyolu', 'Tuşba', 'Edremit', 'Erciş', 'Özalp', 'Çaldıran', 'Başkale', 'Gevaş', 'Gürpınar', 'Muradiye', 'Saray', 'Bahçesaray', 'Çatak'],
    'Yalova': ['Merkez', 'Çınarcık', 'Çiftlikköy', 'Termal', 'Altınova', 'Armutlu'],
    'Yozgat': ['Merkez', 'Sorgun', 'Akdağmadeni', 'Yerköy', 'Çekerek', 'Boğazlıyan', 'Sarıkaya', 'Şefaatli', 'Çayıralan', 'Aydıncık', 'Kadışehri', 'Saraykent', 'Yenifakılı'],
    'Zonguldak': ['Merkez', 'Ereğli', 'Devrek', 'Çaycuma', 'Alaplı', 'Gökçebey', 'Kilimli', 'Kozlu']
}

// Tüm şehirleri alfabetik sıralı al
const CITIES = Object.keys(CITIES_DATA).sort((a, b) => a.localeCompare(b, 'tr'))

// GET - Şehirler ve ilçeler
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (city) {
        // Belirli şehrin ilçelerini döndür
        const districts = CITIES_DATA[city] || []
        return NextResponse.json({ districts })
    }

    // Tüm şehirleri döndür
    return NextResponse.json({ cities: CITIES })
}
