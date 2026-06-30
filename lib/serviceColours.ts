export const SERVICE_COLOURS = [
  { base: "#70E6D2", soft: "#98EDDF", faint: "#E0FAF6", label: "Mint" },
  { base: "#60A5FA", soft: "#93C5FD", faint: "#DBEAFE", label: "Blue" },
  { base: "#A78BFA", soft: "#C4B5FD", faint: "#EDE9FE", label: "Violet" },
  { base: "#F472B6", soft: "#F9A8D4", faint: "#FCE7F3", label: "Pink" },
  { base: "#FB7185", soft: "#FDA4AF", faint: "#FFE4E6", label: "Rose" },
  { base: "#F97316", soft: "#FDBA74", faint: "#FFEDD5", label: "Orange" },
  { base: "#FACC15", soft: "#FDE68A", faint: "#FEF9C3", label: "Yellow" },
  { base: "#4ADE80", soft: "#86EFAC", faint: "#DCFCE7", label: "Green" },
  { base: "#2DD4BF", soft: "#5EEAD4", faint: "#CCFBF1", label: "Teal" },
  { base: "#38BDF8", soft: "#7DD3FC", faint: "#E0F2FE", label: "Sky" },
  { base: "#818CF8", soft: "#A5B4FC", faint: "#E0E7FF", label: "Indigo" },
  { base: "#C084FC", soft: "#D8B4FE", faint: "#F3E8FF", label: "Purple" },
  { base: "#E879F9", soft: "#F0ABFC", faint: "#FAE8FF", label: "Fuchsia" },
  { base: "#F59E0B", soft: "#FCD34D", faint: "#FEF3C7", label: "Amber" },
  { base: "#94A3B8", soft: "#CBD5E1", faint: "#F1F5F9", label: "Slate" },
] as const;

export const DEFAULT_SERVICE_COLOUR = SERVICE_COLOURS[0].base;

export function getServiceColourTheme(colour: string | null | undefined) {
  return (
    SERVICE_COLOURS.find(
      (item) => item.base.toLowerCase() === colour?.toLowerCase(),
    ) ?? SERVICE_COLOURS[0]
  );
}

export function isServiceColour(value: string) {
  return SERVICE_COLOURS.some(
    (item) => item.base.toLowerCase() === value.toLowerCase(),
  );
}
