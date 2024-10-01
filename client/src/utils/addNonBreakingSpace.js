// Add a non-breaking space (nbsp) before punctuation marks and others
export function addNonBreakingSpace(text) {
  text = text.replace(/\s+/g, " "); // Remove extra spaces
  text = text.replace(/([a-zA-Z0-9])\s*([!?;:»%])/g, "$1\u00A0$2"); // Add a nbsp before specific signs
  text = text.replace(/(«)\s*/g, "$1\u00A0"); // Add a nbsp after '«'

  return text;
}

// In JS a nbsp is 'U+00A0', whereas in HTML, '&nbsp;'
