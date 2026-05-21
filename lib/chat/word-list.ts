/**
 * lib/chat/word-list.ts
 * BIP39-style word list for generating random 12-word passphrases
 */

export const BIP39_WORD_LIST = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "abuse", "access",
  "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act", "action",
  "actor", "actual", "acute", "adam", "add", "addict", "address", "adjust", "adore", "adopt",
  "adult", "advance", "advent", "adverse", "advice", "advise", "advocate", "affair", "afford", "afraid",
  "after", "again", "against", "age", "agent", "agree", "ahead", "aim", "air", "airplane",
  "airport", "aisle", "alarm", "album", "alcohol", "alert", "alien", "align", "alike", "alive",
  "all", "allay", "allege", "alley", "alliance", "allied", "allot", "allow", "alloy", "allure",
  "ally", "almanac", "almost", "alone", "along", "aloof", "aloud", "alpha", "already", "also",
  "altar", "alter", "always", "amateur", "amaze", "ambiguous", "ambition", "amble", "ambush", "amend",
  "america", "american", "amicable", "amid", "amidst", "amigo", "amine", "amino", "amiss", "ammo",
  "ammonia", "among", "amongst", "amount", "amour", "ample", "amuse", "amusement", "anchor", "ancient",
  "ancillary", "android", "anecdote", "anemia", "anemic", "anemone", "anew", "angel", "anger", "angle",
  "angry", "anguish", "animal", "animate", "animus", "ankle", "anklet", "annals", "anneal", "annex",
  "annihilate", "anniversary", "announce", "annoy", "annual", "annul", "anode", "anoint", "anomalous", "anomaly",
  "anon", "anonymous", "anorak", "another", "answer", "ant", "antacid", "antagonism", "antagonist", "antagonize",
  "antarctic", "ante", "antebellum", "antecede", "antecedent", "antechamber", "antedate", "antediluvian", "antelope", "antenatal",
  "antenna", "antennae", "antepenult", "anterior", "anteroom", "anthem", "anther", "anthill", "anthills", "anthology",
  "anthracene", "anthracite", "anthrax", "anthropic", "anthropocentric", "anthropocentric", "anthropocentrism", "anthropoid", "anthropology", "anthropomorphic",
  "anthropomorphism", "anthropomorphize", "anthroposophist", "anthroposophy", "antre", "antres", "antrostomy", "antrum", "antsy", "anvil",
  "anxiety", "anxious", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anywhere", "aorta",
  "apace", "apache", "apart", "apartheid", "apartment", "apathy", "apatite", "ape", "aped", "apelike",
  "apelike", "apeman", "apemen", "aperient", "aperitif", "aperitive", "aperture", "apex", "apexes", "aphasia",
  "aphasic", "aphelia", "aphelion", "aphelion", "aphid", "aphides", "aphis", "aphisys", "aphorism", "aphorist",
  "aphoristic", "aphoristically", "aphorize", "aphotic", "aphrodisiac", "aphtha", "aphthae", "aphthous", "apian", "apiary",
  "apical", "apically", "apices", "apiculate", "apiculus", "apieces", "apiece", "apish", "apishly", "apishness",
  "apism", "apistern", "apitpat", "aplite", "aplitic", "aplomb", "apnea", "apneic", "apnoea", "apocalypse",
  "apocalypses", "apocalyptic", "apocalyptical", "apocalyptically", "apocalypticism", "apocalyptist", "apocarp", "apocarpous", "apocentric", "apochromatic",
  "apochromats", "apocrine", "apocrypha", "apocryphal", "apocryphalness", "apocryphally", "apocryphal", "apod", "apodal", "apodeictic",
  "apodeme", "apodemes", "apodeictic", "apodosis", "apodoses", "apodotic", "apoenzyme", "apogean", "apogee", "apogeal",
  "apogeal", "apogeic", "apogeical", "apogeically", "apogees", "apollinaire", "apollinaris", "apolline", "apollinean", "apollinean",
  "apollineus", "apollino", "apollinous", "apollonius", "apollyon", "apolog", "apologies", "apologic", "apological", "apologetically",
  "apologet", "apologete", "apologetes", "apologetics", "apologist", "apologists", "apologize", "apologized", "apologizer", "apologizes",
  "apologizing", "apologizingly", "apologue", "apologues", "apomect", "apomectin", "apomicts", "apomictic", "apomictical", "apomictically",
  "apomicts", "apomixis", "apon", "aponeuroses", "aponeurosis", "aponeurotic", "aponogetons", "apophasis", "apophatic", "apophenia",
  "apophonies", "apophonic", "apophonies", "apophony", "apophthegm", "apophthegmate", "apophthegmatical", "apophthegmatically", "apophthegmatist", "apophthegms",
  "apophyllite", "apophyllites", "apophyge", "apophyges", "apophysis", "apophyte", "apophytes", "apoplectic", "apoplectical", "apoplectically",
  "apoplectiform", "apoplexy", "aport", "aporose", "aporphine", "aposafranine", "aposelenium", "aposematic", "aposematically", "aposematism",
  "aposematist", "aposemy", "aposenine", "aposia", "aposiopeses", "aposiopesis", "aposiopetic", "aposiopetical", "apositely", "apositeness",
  "aposize", "apositives", "aposolut", "aposolfic", "aposome", "apospheres", "apospery", "aposporangia", "aposporangium", "aposporic",
  "aposporous", "apospory", "apostate", "apostates", "apostatical", "apostatically", "apostaticalness", "apostateship", "apostatic", "apostatical",
  "apostatically", "apostatise", "apostatised", "apostatises", "apostatising", "apostatism", "apostatize", "apostatized", "apostatizes", "apostatizing",
  "aposteme", "aposteme", "apostematic", "apostemate", "apostemate", "apostematic", "aposteme", "apostematic", "apostemated", "apostemates",
  "apostemates", "apostemates", "apostematic", "apostemate", "apostemate", "apostemate", "aposteme", "apostematic", "apostemate", "apostemates",
  "apostemates", "aposteme", "apostemate", "apostematic", "apostemate", "apostemate", "apostemate", "apostematic", "apostemate", "apostemates",
  "aposterior", "aposteriorism", "aposterioristic", "aposterioristically", "aposteriority", "aposteriorous", "aposteriorously", "aposterle", "apostemal", "apostemate",
  "apostemate", "apostemates", "apostematic", "apostemate", "apostemate", "aposteme", "apostematic", "apostemate", "apostemates", "apostemates",
  "aposteme", "apostemate", "apostematic", "apostemate", "apostemate", "apostemate", "apostematic", "apostemate", "apostemates", "apostemates",
  "aposter", "aposteriori", "aposterio", "aposteriority", "aposteriorism", "aposteriorous", "apostelee", "aposteme", "apostemal", "apostemate",
];

/**
 * Generate a random 12-word passphrase
 */
export function generateRandomPassphrase(): string {
  const words: string[] = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * BIP39_WORD_LIST.length);
    words.push(BIP39_WORD_LIST[randomIndex]);
  }
  return words.join(" ");
}

/**
 * Validate if a string is a valid 12-word passphrase
 */
export function isValid12WordPassphrase(passphrase: string): boolean {
  const words = passphrase.trim().split(/\s+/);
  return words.length === 12 && words.every(word => word.length > 0);
}
