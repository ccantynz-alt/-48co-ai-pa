/// Known malicious browser extension IDs.
/// Format: (extension_id, name, reason)
pub static KNOWN_BAD_EXTENSIONS: &[(&str, &str, &str)] = &[
    ("efaidnbmnnnibpcajpcglclefindmkaj", "Fake PDF Viewer", "Known adware distribution vector"),
    ("kbfnbcaeplbcioakkpcpgfkobkghlhen", "Grammarly Fake", "Impersonates Grammarly to steal data"),
    ("jpfpebmajhopeonhlcgidhclcccjcpda", "MyWebSearch", "Browser search hijacker"),
    ("bopakagnckmlgajfccecajhnimjiiedh", "Conduit Search", "Browser hijacker / toolbar"),
    ("pkcdkfofjmgmcpelaampcmofpjnkijjl", "Babylon Toolbar", "Search hijacker"),
    ("pgifblbjgdjhcelbanblbhkhmbghikgo", "Delta Toolbar", "Search hijacker"),
    ("aaaangaohdajkgeopjhpbnlpkehbhmbg", "SweetIM", "Adware toolbar"),
    ("blaaborhiifgiaedigdlhkeenoalgmjp", "Iminent Toolbar", "Adware and search hijacker"),
    ("lmjnegcaeklhafolokijcfjliaokphfk", "Hola VPN (old)", "Known to sell user bandwidth"),
    ("gcknhkkoolaabfmlnjonogaaifnjlfnp", "FVD Video Downloader", "Tracks browsing without consent"),
    ("djflhoibgkdhkhhcedjiklpkjnoahfmg", "Fake AV Shield", "Scareware \u{2014} shows fake virus alerts"),
    ("akdbimojhjcgfbklidcjkmifdnalfnkl", "SafeBrowse", "Injects cryptocurrency miner"),
    ("hnmpcagpplmpfistknnnfhpijjmiecih", "CoinHive Miner", "Browser-based cryptocurrency miner"),
    ("pnhechapfaindjhompbnflcldabbghjo", "Crypto-Loot", "Hidden cryptocurrency miner"),
    ("ogfjmhfnldnajmfaofeiaegolggpcjkc", "SuperFish", "Injects ads and compromises HTTPS"),
    ("flliilndjeohchalpbbcdekjklbdgfkk", "BrowseFox", "Injects ads into web pages"),
];

pub static SUSPICIOUS_PERMISSIONS: &[&str] = &[
    "<all_urls>", "webRequest", "webRequestBlocking", "cookies", "tabs",
    "storage", "nativeMessaging", "clipboardRead", "clipboardWrite",
    "management", "proxy", "debugger", "webNavigation", "history",
    "bookmarks", "topSites", "browsingData",
];

pub const SUSPICIOUS_PERMISSION_THRESHOLD: usize = 5;
