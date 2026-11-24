export const registrationOptions = [
  { name: 'AKH Fashions Ltd', country: 'Bangladesh' },
  { name: 'Alib Composite Limited', country: 'Bangladesh' },
  { name: 'Ananta Huaxiang Ltd', country: 'Bangladesh' },
  { name: 'Aykroyd & Sons Ltd', country: 'Bangladesh' },
  { name: 'Bioworld International Ltd ( BWI )', country: 'Bangladesh' },
  { name: 'Blues Group Ltd LANDED STERLING', country: 'Bangladesh' },
  { name: 'BWAN SG INDUSTRIAL PVT LTD', country: 'Bangladesh' },
  { name: 'BEST SHIRTS LTD', country: 'Bangladesh' },
  { name: 'Executive Greentex Limited', country: 'Bangladesh' },
  { name: 'Haddow Group Ltd', country: 'Bangladesh' },
  { name: 'Indochine International FZE', country: 'Bangladesh' },
  { name: 'Jeans Plus Ltd', country: 'Bangladesh' },
  { name: 'Lei Tak Fung Textile & Garment Limited ( Liz Fashions )', country: 'Bangladesh' },
  { name: 'MG Knit Flair Limited', country: 'Bangladesh' },
  { name: 'Motives International H K Ltd / Motives Far East Ltd / Motives China Ltd', country: 'Bangladesh' },
  { name: 'NJK Clothing Ltd FOB', country: 'Bangladesh' },
  { name: 'Padma Textiles Ltd', country: 'Bangladesh' },
  { name: 'Q Collection Pte Ltd', country: 'Bangladesh' },
  { name: 'SBS Tekstil Sanayi Ve Ticarat AS USD', country: 'Bangladesh' },
  { name: 'Blues Group Ltd FOB USD', country: 'Cambodia' },
  { name: 'BWAN SG INDUSTRIAL PVT LTD', country: 'Cambodia' },
  { name: 'Jiangsu Soho Innovation & Technology Group Kasin Industry & Trade Co Ltd', country: 'Myanmar' },
  { name: 'Sam Fashion HK Co Ltd', country: 'Myanmar' },
  { name: 'YST Holding Co Ltd', country: 'Myanmar' },
  { name: 'Aristocrate Distributors Ltd', country: 'China' },
  { name: 'B M Fashions (UK) Ltd', country: 'China' },
  { name: 'Bioworld International Ltd ( BWI )', country: 'China' },
  { name: 'Blues Group Ltd', country: 'China' },
  { name: 'Drew Pearson International (Europe) Ltd FOB USD', country: 'China' },
  { name: 'Gaiwach International Hong Kong Co Limited', country: 'China' },
  { name: 'Hangzhou Wuyang Import & Export Co Ltd', country: 'China' },
  { name: 'HiTex International Trade PTE Ltd', country: 'China' },
  { name: 'Kingtex Global Sourcing Co Limited', country: 'China' },
  { name: 'Sincerity Foundation MFG Co Ltd', country: 'China' },
  { name: 'Wenzhou Union Fashion Co Ltd', country: 'China' },
  { name: 'Yoho Arts & Crafts FOB', country: 'China' },
  { name: 'Northern Apparels Ltd', country: 'Bangladesh' },
];

export const registrationCountries = [...new Set(registrationOptions.map((option) => option.country))]
  .sort((a, b) => a.localeCompare(b));

export function getNamesForCountry(country) {
  const normalizedCountry = country.trim().toLocaleLowerCase();
  return registrationOptions
    .filter((option) => option.country.toLocaleLowerCase() === normalizedCountry)
    .map((option) => option.name)
    .filter((name, index, names) => names.indexOf(name) === index)
    .sort((a, b) => a.localeCompare(b));
}
