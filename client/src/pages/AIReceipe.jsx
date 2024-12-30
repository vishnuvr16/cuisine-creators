import React, { useState } from 'react';
import { ChefHat, Sparkles, Clock, Users, Search, Plus, X, Filter } from 'lucide-react';
import SummaryApi from '../common';

const AIKitchenPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [preferences, setPreferences] = useState({
    cuisine: '',
    dietary: '',
    difficulty: '',
    time: ''
  });
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      setError("Please add at least one ingredient");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SummaryApi.defaultUrl}/api/generate-recipe'`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients,preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      console.log("data",data);
      setGeneratedRecipe(data);
    } catch (err) {
      setError('Failed to generate recipe. Please try again.');
      console.error('Recipe generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Kitchen Assistant</h1>
              <p className="mt-2 text-lg text-orange-100">
                Turn your ingredients into delicious recipes with AI-powered suggestions
              </p>
            </div>
            <ChefHat className="w-16 h-16" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ingredients Input */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="Add an ingredient..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleAddIngredient}
                  className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{ingredient}</span>
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      className="ml-2 hover:text-orange-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Preferences</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine Type
                  </label>
                  <select
                    value={preferences.cuisine}
                    onChange={(e) => setPreferences({...preferences, cuisine: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Any Cuisine</option>
                    <option value="italian">Italian</option>
                    <option value="asian">Asian</option>
                    <option value="mexican">Mexican</option>
                    <option value="indian">Indian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Requirements
                  </label>
                  <select
                    value={preferences.dietary}
                    onChange={(e) => setPreferences({...preferences, dietary: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-free</option>
                    <option value="dairy-free">Dairy-free</option>
                    <option value="non-veg">Non-veg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cooking Time
                  </label>
                  <select
                    value={preferences.time}
                    onChange={(e) => setPreferences({...preferences, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Any Duration</option>
                    <option value="15">Under 15 minutes</option>
                    <option value="30">Under 30 minutes</option>
                    <option value="60">Under 1 hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={preferences.difficulty}
                    onChange={(e) => setPreferences({...preferences, difficulty: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Any Level</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Advanced</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateRecipe}
                disabled={loading || ingredients.length === 0}
                className={`w-full mt-6 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2 ${
                  (loading || ingredients.length === 0) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Recipe</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Recipe Section */}
          <div className="lg:col-span-2">
            {generatedRecipe ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">{generatedRecipe?.title}</h2>
                  
                  <div className="mt-4 flex items-center space-x-6">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{generatedRecipe?.cookingTime}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="w-5 h-5 mr-2" />
                      <span>{generatedRecipe?.servings}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <ChefHat className="w-5 h-5 mr-2" />
                      <span>{generatedRecipe?.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                    <ul className="space-y-2">
                      {generatedRecipe?.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                    <ol className="space-y-3">
                      {generatedRecipe?.instructions.map((step, index) => (
                        <li key={index} className="flex text-gray-700">
                          <span className="font-bold mr-2">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div> */}
                  <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                <div className="space-y-8">
                  {generatedRecipe?.instructions.map((step, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4">
                        <div className="flex items-start">
                          <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <p className="ml-4 text-gray-700">{step}</p>
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-b-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Chef's Notes</h3>
                  <p className="text-gray-700">
                    {generatedRecipe?.chefNotes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl">Add ingredients and preferences to generate a recipe</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIKitchenPage;

