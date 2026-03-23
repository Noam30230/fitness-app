export interface FoodItem {
  name: string;
  aliases: string[];
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  default_portion_g: number;
}

export const FOOD_DATABASE: FoodItem[] = [
  // Céréales & féculents
  { name: "Pâtes cuites", aliases: ["pates", "pasta", "spaghetti", "tagliatelle", "penne", "fusilli"], calories_per_100g: 157, protein_per_100g: 5.8, carbs_per_100g: 30.9, fat_per_100g: 0.9, default_portion_g: 200 },
  { name: "Riz cuit", aliases: ["riz"], calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, default_portion_g: 180 },
  { name: "Pain", aliases: ["pain", "baguette", "tartine"], calories_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2, default_portion_g: 60 },
  { name: "Pomme de terre", aliases: ["pomme de terre", "patate", "pommes de terre"], calories_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1, default_portion_g: 200 },
  { name: "Flocons d'avoine", aliases: ["avoine", "flocons", "porridge", "muesli"], calories_per_100g: 367, protein_per_100g: 13.5, carbs_per_100g: 59, fat_per_100g: 6.5, default_portion_g: 80 },
  { name: "Pain de mie", aliases: ["pain de mie"], calories_per_100g: 270, protein_per_100g: 8.5, carbs_per_100g: 47, fat_per_100g: 4.2, default_portion_g: 50 },
  { name: "Quinoa cuit", aliases: ["quinoa"], calories_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21.3, fat_per_100g: 1.9, default_portion_g: 180 },
  // Protéines animales
  { name: "Poulet cuit", aliases: ["poulet", "blanc de poulet", "filet de poulet", "chicken"], calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, default_portion_g: 150 },
  { name: "Oeuf", aliases: ["oeuf", "oeufs", "œuf", "œufs"], calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, default_portion_g: 60 },
  { name: "Boeuf haché", aliases: ["boeuf", "viande hachee", "steak hache", "hamburger"], calories_per_100g: 254, protein_per_100g: 17.2, carbs_per_100g: 0, fat_per_100g: 20, default_portion_g: 120 },
  { name: "Thon en boite", aliases: ["thon", "tuna"], calories_per_100g: 116, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 1, default_portion_g: 140 },
  { name: "Saumon", aliases: ["saumon", "salmon"], calories_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13, default_portion_g: 150 },
  { name: "Jambon blanc", aliases: ["jambon", "jambon blanc"], calories_per_100g: 107, protein_per_100g: 18, carbs_per_100g: 1.3, fat_per_100g: 3, default_portion_g: 80 },
  { name: "Porc filet", aliases: ["porc", "cote de porc"], calories_per_100g: 143, protein_per_100g: 21.4, carbs_per_100g: 0, fat_per_100g: 6.3, default_portion_g: 150 },
  { name: "Dinde", aliases: ["dinde", "blanc de dinde"], calories_per_100g: 157, protein_per_100g: 29, carbs_per_100g: 0, fat_per_100g: 3.8, default_portion_g: 150 },
  { name: "Sardines", aliases: ["sardines", "sardine"], calories_per_100g: 208, protein_per_100g: 24.6, carbs_per_100g: 0, fat_per_100g: 11.5, default_portion_g: 100 },
  { name: "Crevettes", aliases: ["crevettes", "crevette"], calories_per_100g: 99, protein_per_100g: 21, carbs_per_100g: 0.9, fat_per_100g: 0.9, default_portion_g: 100 },
  // Produits laitiers
  { name: "Yaourt nature", aliases: ["yaourt", "yogurt", "yaourt nature"], calories_per_100g: 59, protein_per_100g: 3.8, carbs_per_100g: 4.7, fat_per_100g: 3.3, default_portion_g: 125 },
  { name: "Lait demi-écrémé", aliases: ["lait", "milk"], calories_per_100g: 46, protein_per_100g: 3.2, carbs_per_100g: 4.8, fat_per_100g: 1.5, default_portion_g: 200 },
  { name: "Fromage blanc", aliases: ["fromage blanc", "cottage"], calories_per_100g: 73, protein_per_100g: 7.4, carbs_per_100g: 4.5, fat_per_100g: 2.9, default_portion_g: 150 },
  { name: "Emmental", aliases: ["emmental", "gruyere", "fromage"], calories_per_100g: 382, protein_per_100g: 28, carbs_per_100g: 0.5, fat_per_100g: 29, default_portion_g: 30 },
  { name: "Skyr", aliases: ["skyr"], calories_per_100g: 65, protein_per_100g: 11, carbs_per_100g: 4, fat_per_100g: 0.2, default_portion_g: 150 },
  { name: "Whey protéine", aliases: ["whey", "proteine", "shaker"], calories_per_100g: 380, protein_per_100g: 80, carbs_per_100g: 5, fat_per_100g: 5, default_portion_g: 30 },
  // Légumes
  { name: "Brocoli", aliases: ["brocoli", "broccoli"], calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 6.6, fat_per_100g: 0.4, default_portion_g: 200 },
  { name: "Épinards", aliases: ["epinards", "spinach"], calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, default_portion_g: 150 },
  { name: "Salade verte", aliases: ["salade", "laitue", "mesclun"], calories_per_100g: 15, protein_per_100g: 1.4, carbs_per_100g: 2.2, fat_per_100g: 0.2, default_portion_g: 80 },
  { name: "Tomate", aliases: ["tomate", "tomato", "tomates"], calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2, default_portion_g: 150 },
  { name: "Courgette", aliases: ["courgette", "zucchini"], calories_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fat_per_100g: 0.3, default_portion_g: 200 },
  { name: "Carottes", aliases: ["carotte", "carottes"], calories_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 9.6, fat_per_100g: 0.2, default_portion_g: 100 },
  { name: "Champignons", aliases: ["champignon", "champignons"], calories_per_100g: 22, protein_per_100g: 3.1, carbs_per_100g: 3.3, fat_per_100g: 0.3, default_portion_g: 150 },
  { name: "Haricots verts", aliases: ["haricots verts", "haricot vert"], calories_per_100g: 31, protein_per_100g: 1.8, carbs_per_100g: 7, fat_per_100g: 0.1, default_portion_g: 200 },
  // Légumineuses
  { name: "Lentilles cuites", aliases: ["lentilles", "lentille"], calories_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4, default_portion_g: 200 },
  { name: "Pois chiches cuits", aliases: ["pois chiches", "pois chiche", "chickpeas"], calories_per_100g: 164, protein_per_100g: 8.9, carbs_per_100g: 27.4, fat_per_100g: 2.6, default_portion_g: 150 },
  { name: "Haricots rouges", aliases: ["haricots rouges", "haricot rouge"], calories_per_100g: 127, protein_per_100g: 8.7, carbs_per_100g: 22.8, fat_per_100g: 0.5, default_portion_g: 150 },
  // Fruits
  { name: "Banane", aliases: ["banane", "banana"], calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3, default_portion_g: 120 },
  { name: "Pomme", aliases: ["pomme", "apple"], calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, default_portion_g: 150 },
  { name: "Orange", aliases: ["orange"], calories_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12, fat_per_100g: 0.1, default_portion_g: 180 },
  { name: "Fraises", aliases: ["fraise", "fraises", "strawberry"], calories_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 7.7, fat_per_100g: 0.3, default_portion_g: 150 },
  { name: "Avocat", aliases: ["avocat", "avocado"], calories_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 9, fat_per_100g: 15, default_portion_g: 100 },
  { name: "Myrtilles", aliases: ["myrtilles", "myrtille", "blueberry"], calories_per_100g: 57, protein_per_100g: 0.7, carbs_per_100g: 14.5, fat_per_100g: 0.3, default_portion_g: 100 },
  // Corps gras
  { name: "Huile d'olive", aliases: ["huile", "huile d'olive", "olive oil"], calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, default_portion_g: 10 },
  { name: "Beurre", aliases: ["beurre", "butter"], calories_per_100g: 717, protein_per_100g: 0.9, carbs_per_100g: 0.1, fat_per_100g: 81, default_portion_g: 10 },
  { name: "Amandes", aliases: ["amandes", "amande", "almonds"], calories_per_100g: 579, protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 50, default_portion_g: 30 },
  { name: "Noix", aliases: ["noix", "walnuts"], calories_per_100g: 654, protein_per_100g: 15, carbs_per_100g: 14, fat_per_100g: 65, default_portion_g: 30 },
  // Divers
  { name: "Chocolat noir", aliases: ["chocolat", "chocolate"], calories_per_100g: 546, protein_per_100g: 5, carbs_per_100g: 60, fat_per_100g: 31, default_portion_g: 30 },
  { name: "Miel", aliases: ["miel", "honey"], calories_per_100g: 304, protein_per_100g: 0.3, carbs_per_100g: 82.4, fat_per_100g: 0, default_portion_g: 15 },
  { name: "Tofu", aliases: ["tofu"], calories_per_100g: 76, protein_per_100g: 8, carbs_per_100g: 1.9, fat_per_100g: 4.8, default_portion_g: 150 },
  { name: "Crème fraîche", aliases: ["creme fraiche", "crème"], calories_per_100g: 292, protein_per_100g: 2.6, carbs_per_100g: 3, fat_per_100g: 30, default_portion_g: 30 },
  { name: "Ketchup", aliases: ["ketchup"], calories_per_100g: 112, protein_per_100g: 1.5, carbs_per_100g: 26, fat_per_100g: 0.1, default_portion_g: 20 },
];

export function parseNaturalLanguage(text: string): { food: FoodItem; quantity: number }[] {
  const lowerText = text.toLowerCase();
  const results: { food: FoodItem; quantity: number }[] = [];

  for (const food of FOOD_DATABASE) {
    const allKeywords = [food.name.toLowerCase(), ...food.aliases.map((a) => a.toLowerCase())];
    const found = allKeywords.some((kw) => lowerText.includes(kw));
    if (found) {
      // Try to extract quantity
      let quantity = food.default_portion_g;
      const qtyRegex = /(\d+)\s*g/;
      const match = text.match(qtyRegex);
      if (match) {
        quantity = parseInt(match[1], 10);
      }
      results.push({ food, quantity });
    }
  }

  return results;
}

export function calculateNutrition(
  food: FoodItem,
  quantity_g: number
): { calories: number; protein: number; carbs: number; fat: number } {
  const factor = quantity_g / 100;
  return {
    calories: Math.round(food.calories_per_100g * factor),
    protein: Math.round(food.protein_per_100g * factor * 10) / 10,
    carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
    fat: Math.round(food.fat_per_100g * factor * 10) / 10,
  };
}
