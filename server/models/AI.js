const mongoose = require('mongoose');

const aiRecipeSchema = new mongoose.Schema({
    ingredients: [{ type: String }],
    preferences: {
      cuisine: { type: String },
      dietary: { type: String },
      difficulty: { type: String },
      time: { type: String }
    },
    generatedRecipe: {
      title: { type: String },
      servings: { type: Number },
      duration: { type: Number },
      difficulty: { type: String },
      ingredients: [{
        name: String,
        quantity: String,
        unit: String
      }],
      instructions: [{
        step: Number,
        description: String,
      }],
      chefNotes: { type: String }
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  });

  const aiModel = mongoose.model("aiReceipe",aiRecipeSchema);

  module.exports = aiModel;