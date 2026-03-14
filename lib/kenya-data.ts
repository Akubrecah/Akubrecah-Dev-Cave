/**
 * Kenya Counties, Sub-Counties, and Postal Codes Data
 * All 47 Counties with their respective sub-counties and postal codes
 * Names are stored in UPPERCASE as per requirements
 */

export const KENYA_DATA: Record<string, { postalCode: string, subCounties: string[] }> = {
    "MOMBASA": {
        postalCode: "80100",
        subCounties: ["CHANGAMWE", "JOMVU", "KISAUNI", "LIKONI", "MVITA", "NYALI"]
    },
    "KWALE": {
        postalCode: "80403",
        subCounties: ["KINANGO", "LUNGALUNGA", "MATUGA", "MSAMBWENI"]
    },
    "KILIFI": {
        postalCode: "80108",
        subCounties: ["GANZE", "KALOLENI", "KILIFI NORTH", "KILIFI SOUTH", "MAGARINI", "MALINDI", "RABAI"]
    },
    "TANA RIVER": {
        postalCode: "70101",
        subCounties: ["BURA", "GALOLE", "GARSEN"]
    },
    "LAMU": {
        postalCode: "80500",
        subCounties: ["LAMU EAST", "LAMU WEST"]
    },
    "TAITA-TAVETA": {
        postalCode: "80300",
        subCounties: ["MWATATE", "TAVETA", "VOI", "WUNDANYI"]
    },
    "GARISSA": {
        postalCode: "70100",
        subCounties: ["DAADAB", "FAFI", "GARISSA TOWNSHIP", "HULUGHO", "IJARA", "LAGDERA", "BALAMBALA"]
    },
    "WAJIR": {
        postalCode: "70200",
        subCounties: ["BUNA", "ELDAS", "HABASWEIN", "TARBAJ", "WAJIR EAST", "WAJIR NORTH", "WAJIR SOUTH", "WAJIR WEST"]
    },
    "MANDERA": {
        postalCode: "70300",
        subCounties: ["BANISSA", "KUTULO", "LAFEY", "MANDERA EAST", "MANDERA NORTH", "MANDERA SOUTH", "MANDERA WEST"]
    },
    "MARSABIT": {
        postalCode: "60500",
        subCounties: ["LAISAMIS", "MOYALE", "NORTH HORR", "SAKU"]
    },
    "ISIOLO": {
        postalCode: "60300",
        subCounties: ["GARBATULLA", "ISIOLO NORTH", "ISIOLO SOUTH", "MERTI"]
    },
    "MERU": {
        postalCode: "60200",
        subCounties: ["BUURI", "CENTRAL IMENTI", "IGEMBE CENTRAL", "IGEMBE NORTH", "IGEMBE SOUTH", "NORTH IMENTI", "SOUTH IMENTI", "TIGANIA EAST", "TIGANIA WEST"]
    },
    "THARAKA-NITHI": {
        postalCode: "60400",
        subCounties: ["CHUKA/IGAMBANG'OMBE", "MAARA", "THARAKA NORTH", "THARAKA SOUTH"]
    },
    "EMBU": {
        postalCode: "60100",
        subCounties: ["MANYATTA", "MBEERE NORTH", "MBEERE SOUTH", "RUNYENJES"]
    },
    "KITUI": {
        postalCode: "90200",
        subCounties: ["IKUTHA", "KATULANI", "KISASI", "KITUI CENTRAL", "KITUI EAST", "KITUI RURAL", "KITUI SOUTH", "KITUI WEST", "LOWER YATTA", "MATINYANI", "MIGWANI", "MUMONI", "MUTITU", "MUTOMO", "MWINGI CENTRAL", "MWINGI NORTH", "MWINGI WEST", "NZAMBANI", "TSEIKURU"]
    },
    "MACHAKOS": {
        postalCode: "90100",
        subCounties: ["KANGUNDO", "KATHIANI", "MACHAKOS TOWN", "MASINGA", "MATUNGULU", "MAVOKO", "MWALA", "YATTA"]
    },
    "MAKUENI": {
        postalCode: "90300",
        subCounties: ["KAITI", "KIBWEZI EAST", "KIBWEZI WEST", "KILOME", "MAKUENI", "MBOONI"]
    },
    "NYANDARUA": {
        postalCode: "20303",
        subCounties: ["KINANGOP", "KIPIPIRI", "NDARAGWA", "OL KALOU", "OL JORO OROK"]
    },
    "NYERI": {
        postalCode: "10100",
        subCounties: ["KIENI EAST", "KIENI WEST", "MATHIRA EAST", "MATHIRA WEST", "MUKURWEINI", "NYERI TOWN", "OTHAYA", "TETU"]
    },
    "KIRINYAGA": {
        postalCode: "10304",
        subCounties: ["GICHUGU", "KIRINYAGA CENTRAL", "MWEA EAST", "MWEA WEST", "NDIA"]
    },
    "MURANG'A": {
        postalCode: "10200",
        subCounties: ["GATANGA", "KAHURO", "KANDARA", "KANGEMA", "KIGUMO", "KIHARU", "MATHIOYA", "MURANG'A SOUTH"]
    },
    "KIAMBU": {
        postalCode: "00900",
        subCounties: ["GATUNDU NORTH", "GATUNDU SOUTH", "GITHUNGURI", "JUJA", "KABETE", "KIAMBAA", "KIAMBU TOWN", "KIKUYU", "LARI", "LIMURU", "RUIRU", "THIKA TOWN"]
    },
    "TURKANA": {
        postalCode: "30500",
        subCounties: ["KIBISH", "LOIMA", "TURKANA CENTRAL", "TURKANA EAST", "TURKANA NORTH", "TURKANA SOUTH", "TURKANA WEST"]
    },
    "WEST POKOT": {
        postalCode: "30600",
        subCounties: ["KACHELIBA", "KAPENGURIA", "POKOT SOUTH", "SIGOR"]
    },
    "SAMBURU": {
        postalCode: "20600",
        subCounties: ["SAMBURU CENTRAL", "SAMBURU EAST", "SAMBURU NORTH"]
    },
    "TRANS-NZOIA": {
        postalCode: "30200",
        subCounties: ["CHERANGANY", "ENDEBESS", "KIMININI", "KWANZA", "SABOTI"]
    },
    "UASIN GISHU": {
        postalCode: "30100",
        subCounties: ["AINABKOI", "KAPSERET", "KESSES", "MOIBEN", "SOY", "TURBO"]
    },
    "ELGEYO-MARAKWET": {
        postalCode: "30700",
        subCounties: ["KEIYO NORTH", "KEIYO SOUTH", "MARAKWET EAST", "MARAKWET WEST"]
    },
    "NANDI": {
        postalCode: "30300",
        subCounties: ["ALDAI", "CHESUMEI", "EMGWEN", "MOSOP", "NANDI HILLS", "TINDIRET"]
    },
    "BARINGO": {
        postalCode: "30400",
        subCounties: ["BARINGO CENTRAL", "BARINGO NORTH", "BARINGO SOUTH", "ELDAMA RAVINE", "MOGOTIO", "TIATY"]
    },
    "LAIKIPIA": {
        postalCode: "10400",
        subCounties: ["LAIKIPIA CENTRAL", "LAIKIPIA EAST", "LAIKIPIA NORTH", "LAIKIPIA WEST", "NYAHURURU"]
    },
    "NAKURU": {
        postalCode: "20100",
        subCounties: ["BAHATI", "GILGIL", "KURESOI NORTH", "KURESOI SOUTH", "MOLO", "NAIVASHA", "NAKURU TOWN EAST", "NAKURU TOWN WEST", "NJORO", "RONGAI", "SUBUKIA"]
    },
    "NAROK": {
        postalCode: "20500",
        subCounties: ["EMURUA DIKIRR", "KILGORIS", "NAROK EAST", "NAROK NORTH", "NAROK SOUTH", "NAROK WEST"]
    },
    "KAJIADO": {
        postalCode: "01100",
        subCounties: ["ISINYA", "KAJIADO CENTRAL", "KAJIADO NORTH", "LOITOKITOK", "MASHUURU"]
    },
    "KERICHO": {
        postalCode: "20200",
        subCounties: ["AINAMOI", "BELGUT", "BURETI", "KIPKELION EAST", "KIPKELION WEST", "SIGOWET/SOIN"]
    },
    "BOMET": {
        postalCode: "20400",
        subCounties: ["BOMET CENTRAL", "BOMET EAST", "CHEPALUNGU", "KONOIN", "SOTIK"]
    },
    "KAKAMEGA": {
        postalCode: "50100",
        subCounties: ["BUTERE", "IKOLOMANI", "KHWISERO", "LIKUYANI", "LUGARI", "LURAMBI", "MALAVA", "MATETE", "MATUNGU", "MUMIAS EAST", "MUMIAS WEST", "NAVAKHOLO", "SHINYALU"]
    },
    "VIHIGA": {
        postalCode: "50300",
        subCounties: ["EMUHAYA", "HAMISI", "LUANDA", "SABATIA", "VIHIGA"]
    },
    "BUNGOMA": {
        postalCode: "50200",
        subCounties: ["BUMULA", "KABUCHAI", "KANDUYI", "KIMILILI", "MT ELGON", "SIRISIA", "TONGAREN", "WEBUYE EAST", "WEBUYE WEST"]
    },
    "BUSIA": {
        postalCode: "50400",
        subCounties: ["BUDALANGI", "BUTULA", "FUNYULA", "MATAYOS", "NAMBALE", "TESO NORTH", "TESO SOUTH"]
    },
    "SIAYA": {
        postalCode: "40600",
        subCounties: ["ALEGO USONGA", "BONDO", "GEM", "RARIEDA", "UGENYA", "UGUNJA"]
    },
    "KISUMU": {
        postalCode: "40100",
        subCounties: ["KISUMU CENTRAL", "KISUMU EAST", "KISUMU WEST", "MUHORONI", "NYAKACH", "NYANDO", "SEME"]
    },
    "HOMA BAY": {
        postalCode: "40300",
        subCounties: ["HOMABAY TOWN", "KABONDO KASIPUL", "KARACHUONYO", "KASIPUL", "MBITA", "NDHIWA", "RANGWE", "SUBA NORTH", "SUBA SOUTH"]
    },
    "MIGORI": {
        postalCode: "40400",
        subCounties: ["AWENDO", "KURIA EAST", "KURIA WEST", "MABERA", "NTIMARU", "RONGO", "SUNA EAST", "SUNA WEST", "URIRI"]
    },
    "KISII": {
        postalCode: "40200",
        subCounties: ["BOBASI", "BOMACHOGE BORABU", "BOMACHOGE CHACHE", "BONCHARI", "KITUTU CHACHE NORTH", "KITUTU CHACHE SOUTH", "NYARIBARI CHACHE", "NYARIBARI MASABA", "SOUTH MUGIRANGO"]
    },
    "NYAMIRA": {
        postalCode: "40500",
        subCounties: ["BORABU", "MANGA", "MASABA NORTH", "NYAMIRA NORTH", "NYAMIRA SOUTH"]
    },
    "NAIROBI": {
        postalCode: "00100",
        subCounties: ["DAGORETTI NORTH", "DAGORETTI SOUTH", "EMBAKASI CENTRAL", "EMBAKASI EAST", "EMBAKASI NORTH", "EMBAKASI SOUTH", "EMBAKASI WEST", "KAMUKUNJI", "KASARANI", "KIBRA", "LANG'ATA", "MAKADARA", "MATHARE", "ROYSAMBU", "RUARAKA", "STAREHE", "WESTLANDS"]
    }
};

