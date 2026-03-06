// Trade Profile model for the subcontractor system
export type TradeName = "Framing" | "Electrical" | "Plumbing" | "HVAC" | "Drywall" | "Painting" | "Flooring" | "Concrete" | "Roofing";

export interface ScopeToggle {
  label: string;
  defaultIncluded: boolean;
}

export interface TradeProfile {
  trade: TradeName;
  quoteIncludes: { labor: boolean; material: boolean; equipment: boolean; permits: boolean; cleanup: boolean };
  pricingStyleOptions: string[];
  recommendedPricingStyle: string;
  laborDefaults: { crewSize: number; loadedRate: number; burdenIncluded: boolean };
  materialDefaults: { wasteLabel: string; wastePercent: number; taxToggle: boolean; allowanceDefault: string };
  tradeCategories: string[];
  scopeResponsibility: ScopeToggle[];
  baselineAssumptions: { label: string; value: string }[];
  defaultExclusions: string[];
  defaultClarifications: string[];
  takeoffUnits: string[];
  takeoffFocus: string;
}

export const tradeProfiles: Record<TradeName, TradeProfile> = {
  Framing: {
    trade: "Framing",
    quoteIncludes: { labor: true, material: true, equipment: false, permits: false, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M", "Cost-Plus"],
    recommendedPricingStyle: "Unit Rates",
    laborDefaults: { crewSize: 4, loadedRate: 62, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Lumber Waste", wastePercent: 8, taxToggle: true, allowanceDefault: "LS" },
    tradeCategories: ["Wall Framing", "Floor Framing", "Roof Framing", "Structural", "Sheathing", "Blocking", "Hardware", "General Conditions"],
    scopeResponsibility: [
      { label: "Demolition of existing framing", defaultIncluded: false },
      { label: "Temporary shoring during demo", defaultIncluded: false },
      { label: "Subfloor installation", defaultIncluded: false },
      { label: "Blocking for cabinets / TV / handrails", defaultIncluded: true },
      { label: "Hardware installation (hangers, straps)", defaultIncluded: true },
      { label: "Stair framing", defaultIncluded: true },
      { label: "Temporary bracing", defaultIncluded: true },
      { label: "Cleanup & debris removal", defaultIncluded: true },
    ],
    baselineAssumptions: [
      { label: "Default wall height", value: "10 ft" },
      { label: "Stud spacing", value: '16" OC' },
      { label: "Truss spacing", value: '24" OC' },
      { label: "Sheathing thickness", value: '7/16" OSB' },
      { label: "Lumber grade", value: "SPF #2 or better" },
    ],
    defaultExclusions: ["Finish carpentry / trim", "Insulation", "Drywall", "Roofing material", "Foundation work"],
    defaultClarifications: ["All lumber SPF #2 or better", "Assumes open access — no confined space premiums", "Material priced at time of bid"],
    takeoffUnits: ["LF", "SF", "EA", "LS", "BF"],
    takeoffFocus: "Linear footage, sheet counts, and piece counts from plans",
  },
  Electrical: {
    trade: "Electrical",
    quoteIncludes: { labor: true, material: true, equipment: false, permits: true, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M", "NTE"],
    recommendedPricingStyle: "Fixed Price",
    laborDefaults: { crewSize: 2, loadedRate: 78, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Wire / Conduit Waste", wastePercent: 10, taxToggle: true, allowanceDefault: "%" },
    tradeCategories: ["Rough-In", "Service & Panel", "Branch Circuits", "Lighting", "Devices & Switches", "Low Voltage", "Fire Alarm", "General Conditions"],
    scopeResponsibility: [
      { label: "Electrical permit", defaultIncluded: true },
      { label: "Panel upgrade / new panel", defaultIncluded: false },
      { label: "Fixtures supplied by owner", defaultIncluded: false },
      { label: "Low voltage / data wiring", defaultIncluded: false },
      { label: "Trenching / underground conduit", defaultIncluded: false },
      { label: "Generator hookup", defaultIncluded: false },
      { label: "Final connections (HVAC, plumbing equip)", defaultIncluded: true },
      { label: "Inspection coordination", defaultIncluded: true },
    ],
    baselineAssumptions: [
      { label: "Service size", value: "200A" },
      { label: "Wire type", value: "THHN/THWN copper" },
      { label: "Conduit type", value: "EMT / MC cable" },
      { label: "Receptacle height", value: '18" AFF' },
      { label: "Switch height", value: '48" AFF' },
    ],
    defaultExclusions: ["Solar / PV system", "Standby generator", "Security system wiring", "Audio/video wiring", "Landscape lighting"],
    defaultClarifications: ["All work per NEC 2023", "Assumes standard residential distances", "Owner-supplied fixtures installed at allowance rate"],
    takeoffUnits: ["EA", "LF", "LS", "CKT"],
    takeoffFocus: "Device counts, circuit counts, and wire runs from electrical plans",
  },
  Plumbing: {
    trade: "Plumbing",
    quoteIncludes: { labor: true, material: true, equipment: false, permits: true, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M", "NTE"],
    recommendedPricingStyle: "Fixed Price",
    laborDefaults: { crewSize: 2, loadedRate: 82, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Pipe Waste / Fittings", wastePercent: 12, taxToggle: true, allowanceDefault: "LS" },
    tradeCategories: ["Rough-In", "Underground", "DWV System", "Water Supply", "Fixtures", "Gas Piping", "Water Heater", "General Conditions"],
    scopeResponsibility: [
      { label: "Fixtures supplied by owner", defaultIncluded: false },
      { label: "Demolition of existing plumbing", defaultIncluded: false },
      { label: "Tie-ins to existing mains", defaultIncluded: true },
      { label: "Trenching by others", defaultIncluded: false },
      { label: "Inspection fees", defaultIncluded: true },
      { label: "Water heater installation", defaultIncluded: true },
      { label: "Gas line extension", defaultIncluded: false },
      { label: "Hose bibbs / exterior", defaultIncluded: true },
    ],
    baselineAssumptions: [
      { label: "Supply pipe", value: "PEX" },
      { label: "DWV pipe", value: "ABS / PVC" },
      { label: "Water heater type", value: "Tank — 50 gal" },
      { label: "Fixture quality", value: "Mid-tier" },
    ],
    defaultExclusions: ["Septic system", "Well pump", "Sprinkler / fire suppression", "Radiant floor heating", "Pool / spa plumbing"],
    defaultClarifications: ["All work per UPC / IPC", "Assumes accessible crawlspace or slab", "Owner-supplied fixtures installed at allowance rate"],
    takeoffUnits: ["EA", "LF", "LS"],
    takeoffFocus: "Fixture counts, pipe runs, and connection points from plumbing plans",
  },
  HVAC: {
    trade: "HVAC",
    quoteIncludes: { labor: true, material: true, equipment: true, permits: true, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M", "NTE"],
    recommendedPricingStyle: "Fixed Price",
    laborDefaults: { crewSize: 3, loadedRate: 75, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Duct / Fitting Waste", wastePercent: 10, taxToggle: true, allowanceDefault: "LS" },
    tradeCategories: ["Equipment", "Ductwork", "Piping", "Controls", "Insulation", "Exhaust / Ventilation", "Commissioning", "General Conditions"],
    scopeResponsibility: [
      { label: "Ductwork fabrication & install", defaultIncluded: true },
      { label: "Equipment supplied by owner", defaultIncluded: false },
      { label: "Thermostat / controls", defaultIncluded: true },
      { label: "Balancing / commissioning", defaultIncluded: true },
      { label: "Duct insulation", defaultIncluded: true },
      { label: "Exhaust fans", defaultIncluded: false },
      { label: "Gas line to equipment", defaultIncluded: false },
      { label: "Electrical hookup (by electrician)", defaultIncluded: false },
    ],
    baselineAssumptions: [
      { label: "System type", value: "Split system — forced air" },
      { label: "Duct material", value: "Galvanized sheet metal" },
      { label: "Insulation", value: 'R-8 flex / R-6 duct wrap' },
      { label: "Tonnage", value: "3.5 ton" },
    ],
    defaultExclusions: ["Electrical hookup", "Gas piping (by plumber)", "Structural modifications for equipment", "Mini-split systems", "Geothermal"],
    defaultClarifications: ["Equipment sized per Manual J load calc", "Assumes attic / crawlspace accessible", "All work per IMC"],
    takeoffUnits: ["EA", "LF", "SF", "TON", "CFM", "LS"],
    takeoffFocus: "Equipment tonnage, duct linear footage, and diffuser/register counts",
  },
  Drywall: {
    trade: "Drywall",
    quoteIncludes: { labor: true, material: true, equipment: false, permits: false, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M"],
    recommendedPricingStyle: "Unit Rates",
    laborDefaults: { crewSize: 3, loadedRate: 55, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Board Waste", wastePercent: 10, taxToggle: true, allowanceDefault: "%" },
    tradeCategories: ["Hanging", "Taping & Mudding", "Specialty Board", "Ceiling", "Soffits & Bulkheads", "Patches / Repairs", "General Conditions"],
    scopeResponsibility: [
      { label: "Hanging only (no finish)", defaultIncluded: false },
      { label: "Level 4 finish (standard)", defaultIncluded: true },
      { label: "Level 5 finish (premium)", defaultIncluded: false },
      { label: "Insulation behind board", defaultIncluded: false },
      { label: "Corner bead — metal", defaultIncluded: true },
      { label: "Moisture-resistant board (wet areas)", defaultIncluded: true },
      { label: "Fire-rated assemblies", defaultIncluded: false },
      { label: "Texture application", defaultIncluded: false },
    ],
    baselineAssumptions: [
      { label: "Board type", value: '1/2" regular gypsum' },
      { label: "Finish level", value: "Level 4" },
      { label: "Ceiling height", value: "9 ft standard" },
      { label: "Corner bead", value: "Metal — bullnose" },
    ],
    defaultExclusions: ["Painting / priming", "Insulation", "Framing corrections", "Acoustic ceilings", "Plaster / veneer plaster"],
    defaultClarifications: ["All board 1/2\" unless noted", "Assumes straight walls — bowed framing surcharged", "Wet area board per plan callouts"],
    takeoffUnits: ["SF", "LF", "EA", "LS"],
    takeoffFocus: "Wall and ceiling square footage, linear feet of corners and joints",
  },
  Painting: {
    trade: "Painting",
    quoteIncludes: { labor: true, material: true, equipment: false, permits: false, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M"],
    recommendedPricingStyle: "Fixed Price",
    laborDefaults: { crewSize: 3, loadedRate: 48, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Paint / Primer Waste", wastePercent: 5, taxToggle: true, allowanceDefault: "%" },
    tradeCategories: ["Interior Walls", "Interior Ceilings", "Trim / Millwork", "Exterior", "Stain / Clear Coat", "Specialty Finishes", "General Conditions"],
    scopeResponsibility: [
      { label: "Prime + 2 coats (standard)", defaultIncluded: true },
      { label: "Ceiling painting", defaultIncluded: true },
      { label: "Trim / baseboard painting", defaultIncluded: true },
      { label: "Door painting (both sides)", defaultIncluded: true },
      { label: "Cabinet painting / refinishing", defaultIncluded: false },
      { label: "Exterior painting", defaultIncluded: false },
      { label: "Wallpaper removal", defaultIncluded: false },
      { label: "Drywall touch-up / patching", defaultIncluded: false },
    ],
    baselineAssumptions: [
      { label: "Interior coats", value: "1 prime + 2 finish" },
      { label: "Paint grade", value: "Premium latex (Sherwin-Williams or equiv)" },
      { label: "Sheen — walls", value: "Eggshell" },
      { label: "Sheen — trim", value: "Semi-gloss" },
    ],
    defaultExclusions: ["Wallpaper installation", "Faux finishes", "Exterior stucco / masonry coating", "Epoxy flooring", "Power washing"],
    defaultClarifications: ["Colors TBD by owner — assumes max 5 colors", "Assumes walls in paint-ready condition", "Ceilings flat white unless noted"],
    takeoffUnits: ["SF", "LF", "EA", "LS"],
    takeoffFocus: "Wall and ceiling square footage, door/window counts, trim linear footage",
  },
  Flooring: {
    trade: "Flooring",
    quoteIncludes: { labor: true, material: true, equipment: false, permits: false, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M"],
    recommendedPricingStyle: "Unit Rates",
    laborDefaults: { crewSize: 2, loadedRate: 52, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Flooring Waste", wastePercent: 10, taxToggle: true, allowanceDefault: "%" },
    tradeCategories: ["Hardwood", "LVP / LVT", "Tile", "Carpet", "Subfloor Prep", "Transitions", "Baseboards", "General Conditions"],
    scopeResponsibility: [
      { label: "Demolition of existing flooring", defaultIncluded: false },
      { label: "Subfloor preparation / leveling", defaultIncluded: true },
      { label: "Transitions between materials", defaultIncluded: true },
      { label: "Baseboards / shoe molding", defaultIncluded: false },
      { label: "Underlayment", defaultIncluded: true },
      { label: "Floor protection during other trades", defaultIncluded: false },
      { label: "Stair treads / nosings", defaultIncluded: false },
      { label: "Moisture testing", defaultIncluded: true },
    ],
    baselineAssumptions: [
      { label: "Material type", value: "LVP — click-lock" },
      { label: "Underlayment", value: "Included — standard foam" },
      { label: "Subfloor condition", value: "Assumes level within 3/16\" per 10 ft" },
      { label: "Pattern", value: "Standard stagger" },
    ],
    defaultExclusions: ["Furniture moving", "Asbestos abatement", "Radiant heat systems", "Exterior hardscaping", "Area rugs"],
    defaultClarifications: ["Material selection TBD — pricing based on allowance", "Assumes ground-level access for material staging", "Moisture test required before hardwood install"],
    takeoffUnits: ["SF", "LF", "EA", "LS"],
    takeoffFocus: "Floor area square footage by material type, transition linear footage",
  },
  Concrete: {
    trade: "Concrete",
    quoteIncludes: { labor: true, material: true, equipment: true, permits: false, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M", "Cost-Plus"],
    recommendedPricingStyle: "Unit Rates",
    laborDefaults: { crewSize: 5, loadedRate: 58, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Concrete Waste", wastePercent: 5, taxToggle: true, allowanceDefault: "LS" },
    tradeCategories: ["Foundations", "Flatwork", "Walls / Stem Walls", "Footings", "Rebar / Reinforcement", "Forming", "Finishing", "General Conditions"],
    scopeResponsibility: [
      { label: "Forming & stripping", defaultIncluded: true },
      { label: "Rebar / reinforcement", defaultIncluded: true },
      { label: "Concrete pumping", defaultIncluded: true },
      { label: "Finishing — broom / float", defaultIncluded: true },
      { label: "Stamped / decorative finish", defaultIncluded: false },
      { label: "Excavation / grading", defaultIncluded: false },
      { label: "Anchor bolts / embeds", defaultIncluded: true },
      { label: "Curing compound", defaultIncluded: true },
    ],
    baselineAssumptions: [
      { label: "Concrete strength", value: "3,000 PSI (residential)" },
      { label: "Slab thickness", value: '4"' },
      { label: "Rebar", value: "#4 @ 18\" OC both ways" },
      { label: "Finish", value: "Broom finish (standard)" },
    ],
    defaultExclusions: ["Excavation / backfill", "Waterproofing", "Structural engineering", "Asphalt / paving", "Retaining walls over 4 ft"],
    defaultClarifications: ["PSI per structural specs", "Pump truck included for pours over 5 CY", "Cold/hot weather pours surcharged"],
    takeoffUnits: ["CY", "SF", "LF", "EA", "LS"],
    takeoffFocus: "Volume in cubic yards, slab square footage, footing linear footage",
  },
  Roofing: {
    trade: "Roofing",
    quoteIncludes: { labor: true, material: true, equipment: true, permits: true, cleanup: true },
    pricingStyleOptions: ["Fixed Price", "Unit Rates", "T&M"],
    recommendedPricingStyle: "Fixed Price",
    laborDefaults: { crewSize: 4, loadedRate: 55, burdenIncluded: true },
    materialDefaults: { wasteLabel: "Roofing Waste", wastePercent: 12, taxToggle: true, allowanceDefault: "%" },
    tradeCategories: ["Tear-Off", "Underlayment", "Shingles / Membrane", "Flashing", "Ridge & Hip", "Ventilation", "Gutters", "General Conditions"],
    scopeResponsibility: [
      { label: "Tear-off of existing roofing", defaultIncluded: true },
      { label: "Ice & water shield", defaultIncluded: true },
      { label: "Synthetic underlayment", defaultIncluded: true },
      { label: "Ridge vent", defaultIncluded: true },
      { label: "Gutters & downspouts", defaultIncluded: false },
      { label: "Skylights — install / reflash", defaultIncluded: false },
      { label: "Chimney flashing", defaultIncluded: true },
      { label: "Dumpster / debris removal", defaultIncluded: true },
    ],
    baselineAssumptions: [
      { label: "Material type", value: "Architectural shingles — 30 yr" },
      { label: "Roof pitch", value: "6:12" },
      { label: "Layers to remove", value: "1 layer" },
      { label: "Ventilation", value: "Ridge vent + soffit vents" },
    ],
    defaultExclusions: ["Structural repairs / decking replacement", "Solar panel removal / reinstall", "Standing seam metal roof", "Flat roof / TPO / EPDM", "Soffit / fascia replacement"],
    defaultClarifications: ["Price based on architectural shingles", "Decking replacement extra if rot found", "Permit and inspection included"],
    takeoffUnits: ["SQ", "SF", "LF", "EA", "LS"],
    takeoffFocus: "Roof squares, ridge/hip/valley linear footage, flashing points",
  },
};

export const allTradeNames: TradeName[] = ["Framing", "Electrical", "Plumbing", "HVAC", "Drywall", "Painting", "Flooring", "Concrete", "Roofing"];

export function getTradeProfile(trade: TradeName): TradeProfile {
  return tradeProfiles[trade];
}
