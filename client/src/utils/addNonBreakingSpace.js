export function addNonBreakingSpace(text) {
  // 1. Remove extra spaces
  text = text.replace(/\s+/g, " "); // Replace multiple spaces with a single space

  // 2. Add a non-breaking space before punctuation marks and others
  text = text.replace(/([a-zA-Z0-9])\s*([!?;:»%])/g, "$1\u00A0$2");

  // 3. Add a non-breaking space after opening French quotation marks («)
  text = text.replace(/(«)\s*/g, "$1\u00A0");

  return text;
}

//* In JS a non-breaking space is 'U+00A0', whereas in HTML, '&nbsp;'
