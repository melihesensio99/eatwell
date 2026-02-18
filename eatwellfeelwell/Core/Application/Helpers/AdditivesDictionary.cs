namespace Application.Helpers
{
    public static class AdditivesDictionary
    {
        private static readonly Dictionary<string, string> Additives = new()
        {
           
            { "e100",  "Kurkumin — Doğal sarı renklendirici" },
            { "e101",  "Riboflavin (B2 vitamini) — Doğal sarı renklendirici" },
            { "e102",  "Tartrazin — Yapay sarı renklendirici ⚠️" },
            { "e104",  "Kinolin sarısı — Yapay renklendirici ⚠️" },
            { "e110",  "Sunset Yellow — Yapay renklendirici ⚠️" },
            { "e120",  "Karmin — Doğal kırmızı renklendirici" },
            { "e122",  "Azorubin — Yapay kırmızı renklendirici ⚠️" },
            { "e129",  "Allura Red — Yapay kırmızı renklendirici ⚠️" },
            { "e131",  "Patent Blue — Yapay mavi renklendirici ⚠️" },
            { "e133",  "Brilliant Blue — Yapay mavi renklendirici ⚠️" },
            { "e140",  "Klorofil — Doğal yeşil renklendirici" },
            { "e141",  "Bakır klorofil — Yeşil renklendirici" },
            { "e150a", "Karamel I — Doğal renklendirici" },
            { "e150b", "Kostik sülfit karameli — Renklendirici" },
            { "e150c", "Amonyak karameli — Renklendirici" },
            { "e150d", "Sülfit amonyak karameli — Renklendirici" },
            { "e160a", "Beta-karoten — Doğal turuncu renklendirici (A vitamini)" },
            { "e160b", "Annatto — Doğal turuncu renklendirici" },
            { "e160c", "Paprika oleoresin — Doğal kırmızı renklendirici" },
            { "e171",  "Titanyum dioksit — Beyaz renklendirici ⚠️" },

            { "e200",  "Sorbik asit — Koruyucu" },
            { "e202",  "Potasyum sorbat — Koruyucu" },
            { "e210",  "Benzoik asit — Koruyucu ⚠️" },
            { "e211",  "Sodyum benzoat — Koruyucu ⚠️" },
            { "e220",  "Kükürt dioksit — Koruyucu/antioksidan ⚠️" },
            { "e221",  "Sodyum sülfit — Koruyucu ⚠️" },
            { "e223",  "Sodyum metabisülfit — Koruyucu ⚠️" },
            { "e224",  "Potasyum metabisülfit — Koruyucu ⚠️" },
            { "e228",  "Potasyum bisülfit — Koruyucu ⚠️" },
            { "e234",  "Nisin — Doğal koruyucu" },
            { "e242",  "Dimetil dikarbonat — Koruyucu (içeceklerde)" },
            { "e249",  "Potasyum nitrit — Koruyucu ⚠️" },
            { "e250",  "Sodyum nitrit — Koruyucu (işlenmiş etlerde) ⚠️" },
            { "e251",  "Sodyum nitrat — Koruyucu ⚠️" },
            { "e252",  "Potasyum nitrat — Koruyucu ⚠️" },
            { "e260",  "Asetik asit — Sirke, asitlik düzenleyici" },
            { "e270",  "Laktik asit — Asitlik düzenleyici" },

            { "e300",  "Askorbik asit (C vitamini) — Antioksidan" },
            { "e301",  "Sodyum askorbat — Antioksidan" },
            { "e304",  "Askorbil palmitat — Antioksidan" },
            { "e306",  "Tokoferol (E vitamini) — Doğal antioksidan" },
            { "e307",  "Alfa-tokoferol — E vitamini" },
            { "e310",  "Propil gallat — Yapay antioksidan ⚠️" },
            { "e319",  "TBHQ — Yapay antioksidan ⚠️" },
            { "e320",  "BHA — Yapay antioksidan ⚠️" },
            { "e321",  "BHT — Yapay antioksidan ⚠️" },

           
            { "e322",  "Lesitin — Emülgatör (doğal, genellikle soyadan)" },
            { "e330",  "Sitrik asit — Asitlik düzenleyici" },
            { "e331",  "Sodyum sitrat — Asitlik düzenleyici" },
            { "e332",  "Potasyum sitrat — Asitlik düzenleyici" },
            { "e333",  "Kalsiyum sitrat — Asitlik düzenleyici" },
            { "e334",  "Tartarik asit — Asitlik düzenleyici" },
            { "e338",  "Fosforik asit — Asitlik düzenleyici (kolalı içeceklerde) ⚠️" },
            { "e339",  "Sodyum fosfat — Emülgatör" },
            { "e340",  "Potasyum fosfat — Emülgatör" },
            { "e341",  "Kalsiyum fosfat — Emülgatör" },

            { "e400",  "Aljinik asit — Kıvam artırıcı" },
            { "e401",  "Sodyum aljinat — Kıvam artırıcı" },
            { "e406",  "Agar — Doğal jelatin alternatifi" },
            { "e407",  "Karragenan — Kıvam artırıcı ⚠️" },
            { "e410",  "Keçiboynuzu gamı — Doğal kıvam artırıcı" },
            { "e412",  "Guar gamı — Doğal kıvam artırıcı" },
            { "e414",  "Arap zamkı — Doğal kıvam artırıcı" },
            { "e415",  "Ksantan gamı — Kıvam artırıcı" },
            { "e440",  "Pektin — Doğal jelleştirici" },
            { "e460",  "Selüloz — Dolgu maddesi" },
            { "e461",  "Metil selüloz — Kıvam artırıcı" },
            { "e466",  "Karboksimetil selüloz — Kıvam artırıcı" },
            { "e471",  "Mono ve digliseritler — Emülgatör" },
            { "e472e", "DATEM — Emülgatör (fırın ürünlerinde)" },

           
            { "e420",  "Sorbitol — Tatlandırıcı (şeker alkol)" },
            { "e421",  "Mannitol — Tatlandırıcı (şeker alkol)" },
            { "e422",  "Gliserol — Nem tutucu" },
            { "e450",  "Difosfat — Kabartma ajanı" },
            { "e451",  "Trifosfat — Emülgatör" },
            { "e452",  "Polifosfat — Emülgatör" },
            { "e500",  "Sodyum karbonat — Kabartma tozu" },
            { "e501",  "Potasyum karbonat — Kabartma tozu" },
            { "e503",  "Amonyum karbonat — Kabartma tozu" },
            { "e504",  "Magnezyum karbonat — Kabartma tozu" },
            { "e507",  "Hidroklorik asit — Asitlik düzenleyici" },
            { "e508",  "Potasyum klorür — Tuz alternatifi" },
            { "e509",  "Kalsiyum klorür — Sertleştirici" },
            { "e516",  "Kalsiyum sülfat — Sertleştirici" },

            
            { "e620",  "Glutamik asit — Lezzet artırıcı" },
            { "e621",  "Monosodyum glutamat (MSG) — Lezzet artırıcı ⚠️" },
            { "e627",  "Disodyum guanilat — Lezzet artırıcı" },
            { "e631",  "Disodyum inosinat — Lezzet artırıcı" },
            { "e635",  "Disodyum 5'-ribonükleotid — Lezzet artırıcı" },

           
            { "e950",  "Asesülfam K — Yapay tatlandırıcı ⚠️" },
            { "e951",  "Aspartam — Yapay tatlandırıcı ⚠️" },
            { "e952",  "Siklamat — Yapay tatlandırıcı ⚠️" },
            { "e954",  "Sakarin — Yapay tatlandırıcı ⚠️" },
            { "e955",  "Sukraloz — Yapay tatlandırıcı" },
            { "e960",  "Steviol glikozitleri (Stevia) — Doğal tatlandırıcı" },
            { "e965",  "Maltitol — Tatlandırıcı (şeker alkol)" },
            { "e967",  "Ksilitol — Tatlandırıcı (şeker alkol)" },

        
            { "e900",  "Dimetil polisiloksan — Köpük önleyici" },
            { "e901",  "Balmumu — Kaplama maddesi" },
            { "e903",  "Karnauba mumu — Parlatıcı" },
            { "e904",  "Şellak — Kaplama maddesi" },
            { "e1400", "Dekstrin — Modifiye nişasta" },
            { "e1404", "Okside nişasta — Kıvam artırıcı" },
            { "e1414", "Asetile fosfat nişasta — Modifiye nişasta" },
            { "e1442", "Hidroksi propil nişasta fosfat — Modifiye nişasta" },
            { "e1450", "Nişasta sodyum oktenil süksinat — Emülgatör" }
        };

        public static string GetDescription(string tag)
        {
            var code = tag.Replace("en:", "").Replace("fr:", "").ToLower().Trim();
            return Additives.TryGetValue(code, out var desc)
                ? $"{code.ToUpper()}: {desc}"
                : $"{code.ToUpper()}: Bilgi bulunamadı";
        }

        public static List<string> GetDescriptions(string[]? tags)
        {
            if (tags == null || tags.Length == 0) return new();
            return tags.Select(GetDescription).ToList();
        }
    }
}
