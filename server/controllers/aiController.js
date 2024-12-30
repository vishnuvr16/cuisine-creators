const AIRecipe = require('../models/AI');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_KEY);

// Helper function to clean quantity values
const cleanQuantity = (quantity) => {
  if (typeof quantity === 'number') return quantity;
  if (quantity === 'to taste') return quantity;
  
  // Convert string quantity to number or fraction
  const cleanStr = quantity.toString().toLowerCase().trim();
  
  // Handle "to taste" variations
  if (cleanStr.includes('to taste')) return 'to taste';
  
  // Remove any units that might be in the quantity field
  const noUnits = cleanStr.replace(/(cup|tablespoon|teaspoon|tbsp|tsp|oz|pound|lb|g|ml)s?/gi, '').trim();
  
  // Handle fractions
  if (noUnits.includes('/')) {
    const [numerator, denominator] = noUnits.split('/').map(num => parseFloat(num.trim()));
    return numerator / denominator;
  }
  
  // Handle mixed numbers (e.g., "1 1/2")
  const mixedMatch = noUnits.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const [_, whole, numerator, denominator] = mixedMatch;
    return parseInt(whole) + (parseInt(numerator) / parseInt(denominator));
  }
  
  // Try parsing as regular number
  const parsed = parseFloat(noUnits);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to clean and parse the response text
const cleanJsonResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    text = text.replace(/```json\n/g, '').replace(/```/g, '');
    // Remove any leading/trailing whitespace
    text = text.trim();
    
    // First do a basic parse to get the structure
    let parsed = JSON.parse(text);
    
    // Clean up ingredient quantities
    if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
      parsed.ingredients = parsed.ingredients.map(ing => ({
        ...ing,
        quantity: cleanQuantity(ing.quantity)
      }));
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.error('Raw text:', text);
    throw new Error('Failed to parse recipe data');
  }
};

// Helper function to format fractions nicely
const formatQuantity = (quantity) => {
  if (quantity === 'to taste') return quantity;
  if (typeof quantity !== 'number') return quantity;
  
  // Common fractions map
  const fractions = {
    0.25: '¼',
    0.5: '½',
    0.75: '¾',
    0.333: '⅓',
    0.667: '⅔',
    0.2: '⅕',
    0.4: '⅖',
    0.6: '⅗',
    0.8: '⅘'
  };
  
  // Handle whole numbers
  if (Number.isInteger(quantity)) return quantity.toString();
  
  // Handle common fractions
  for (const [decimal, fraction] of Object.entries(fractions)) {
    if (Math.abs(quantity - parseFloat(decimal)) < 0.01) {
      return fraction;
    }
  }
  
  // Handle mixed numbers
  const whole = Math.floor(quantity);
  const decimal = quantity - whole;
  
  for (const [dec, frac] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(dec)) < 0.01) {
      return whole === 0 ? frac : `${whole} ${frac}`;
    }
  }
  
  // Fallback to decimal
  return quantity.toFixed(2);
};

// Helper function to transform recipe to frontend format
const transformRecipeFormat = (rawRecipe) => {
  try {
    // Format ingredients into strings
    const formattedIngredients = rawRecipe.ingredients.map(ing => {
      const quantity = formatQuantity(ing.quantity);
      const unit = ing.unit || '';
      return `${quantity} ${unit} ${ing.name}`.trim();
    });

    // Format instructions into strings
    const formattedInstructions = rawRecipe.instructions.map(inst => 
      inst.description || inst
    );

    return {
      title: rawRecipe.title,
      cookingTime: `${rawRecipe.duration} minutes`,
      servings: `${rawRecipe.servings} servings`,
      difficulty: rawRecipe.difficulty,
      ingredients: formattedIngredients,
      instructions: formattedInstructions,
      chefNotes: rawRecipe.chefNotes || ''
    };
  } catch (error) {
    console.error('Error transforming recipe:', error);
    throw new Error('Failed to format recipe data');
  }
};

exports.generateRecipe = async (req, res) => {
  try {
    const { ingredients, preferences } = req.body;
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Create a recipe using these ingredients: ${ingredients.join(', ')}. 
      Cuisine: ${preferences.cuisine || 'Any'}
      Dietary: ${preferences.dietary || 'None'}
      Difficulty: ${preferences.difficulty || 'Any'}
      Time: ${preferences.time || 'Any'} minutes

      Return ONLY a JSON object with this EXACT structure. For quantities, use ONLY numbers (like 0.25, 0.5, 1, 2) or "to taste" - DO NOT include units in the quantity field:
      {
        "title": "Recipe Name",
        "servings": number,
        "duration": number,
        "difficulty": "easy/medium/hard",
        "ingredients": [
          {"name": "ingredient name", "quantity": 0.25, "unit": "cup"},
          {"name": "another ingredient", "quantity": "to taste", "unit": "pinch"}
        ],
        "instructions": [
          {"step": 1, "description": "instruction text"}
        ],
        "chefNotes": "additional tips"
      }`;

    try {
      // Generate content using Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse and clean the JSON response
      const parsedRecipe = cleanJsonResponse(text);
      
      // Transform the recipe for frontend display
      const transformedRecipe = transformRecipeFormat(parsedRecipe);

      // Save the original recipe to database
      const aiRecipe = await AIRecipe.create({
        ingredients,
        preferences,
        generatedRecipe: parsedRecipe,
        user: req.user._id
      });

      // Send the transformed recipe to frontend
      res.json(transformedRecipe);
      
    } catch (error) {
      console.error('Error generating recipe:', error);
      res.status(500).json({ 
        error: 'Failed to generate recipe. Please try again.',
        details: error.message 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
};