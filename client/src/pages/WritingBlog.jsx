import React, { useState } from 'react';
import { ChefHat, Clock, Users, Scale, Plus, Trash } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import SummaryApi from '../common';

const WriteBlogPage = () => {
  const [blogData, setBlogData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '1', 
    difficulty: 'Easy',
    ingredients: [''],
    instructions: [''],
    image: null,
    category: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      console.log('No file selected');
      return;
    }

    setIsUploading(true);
    const fileRef = ref(storage, `images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred * 100) / snapshot.totalBytes);
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading:', error);
        setError(`Error uploading image: ${error.message}`);
        setIsUploading(false);
        setUploadProgress(0);
      },
      async () => {
        const downloadURL = await getDownloadURL(fileRef);
        setBlogData((prev) => ({ ...prev, image: downloadURL }));
        setIsUploading(false);
        setUploadProgress(0);
      }
    );
  };

  const handleImageChange = (e) => handleFileUpload(e.target.files[0]);

  const handleArrayChange = (arrayName, index, value) => {
    const updatedArray = [...blogData[arrayName]];
    updatedArray[index] = value;
    setBlogData((prev) => ({ ...prev, [arrayName]: updatedArray }));
  };

  const addItemToArray = (arrayName) => {
    setBlogData((prev) => ({ ...prev, [arrayName]: [...prev[arrayName], ''] }));
  };

  const removeItemFromArray = (arrayName, index) => {
    const updatedArray = blogData[arrayName].filter((_, i) => i !== index);
    setBlogData((prev) => ({ ...prev, [arrayName]: updatedArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedBlogData = {
      ...blogData,
      ingredients: blogData.ingredients.filter((item) => item.trim() !== ''),
      instructions: blogData.instructions.filter((item) => item.trim() !== ''),
      prepTime: Number(blogData.prepTime) || 0,
      cookTime: Number(blogData.cookTime) || 0,
      servings: Number(blogData.servings) || 1,
    };

    try {
      const response = await fetch(`${SummaryApi.defaultUrl}/api/blogs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedBlogData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      alert('Blog posted successfully!');
      navigate('/blogs');
    } catch (err) {
      console.error('Error posting blog:', err);
      setError(err.message);
      alert('Failed to post blog: ' + err.message);
    }
  };

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <ChefHat className="w-8 h-8" />
          Write New Recipe Blog
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <label className="block">
                Title
                <input
                  type="text"
                  name="title"
                  value={blogData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Recipe Title"
                  required
                />
              </label>
              <label className="block">
                Description
                <textarea
                  name="description"
                  value={blogData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 border rounded"
                  placeholder="Short description of the recipe"
                  required
                />
              </label>
              <label className="block">
                Category
                <input
                  type="text"
                  name="category"
                  value={blogData.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Recipe Category"
                  required
                />
              </label>
              {/* Image Upload Section */}
<div className="bg-white p-6 rounded-lg shadow">
  <h2 className="text-xl font-semibold mb-4">Recipe Image</h2>
  <label className="block mb-4">
    <span className="block text-gray-700 mb-2">Upload Image</span>
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
    />
  </label>

  {/* Upload Progress */}
  {isUploading && (
    <div className="relative w-full bg-gray-200 rounded">
      <div
        className="absolute top-0 left-0 h-full bg-red-600 rounded transition-all"
        style={{ width: `${uploadProgress}%` }}
      ></div>
      <p className="text-center text-xs mt-2">{uploadProgress}% uploaded</p>
    </div>
  )}

  {/* Display uploaded image preview if available */}
  {blogData.image && (
    <div className="mt-4">
      <p className="text-sm text-gray-500">Image Preview:</p>
      <img src={blogData.image} alt="Uploaded Recipe" className="w-full h-48 object-cover rounded-lg" />
    </div>
  )}
</div>

              <label className="block">
                Prep Time (mins)
                <input
                  type="number"
                  name="prepTime"
                  value={blogData.prepTime}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="10"
                />
              </label>
              <label className="block">
                Cook Time (mins)
                <input
                  type="number"
                  name="cookTime"
                  value={blogData.cookTime}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="20"
                />
              </label>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            {blogData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleArrayChange('ingredients', index, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., 2 cups flour"
                />
                {blogData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemFromArray('ingredients', index)}
                    className="text-red-600"
                  >
                    <Trash />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addItemToArray('ingredients')} className="text-red-600">
              <Plus /> Add Ingredient
            </button>
          </div>

          {/* Instructions Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            {blogData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <textarea
                  value={instruction}
                  onChange={(e) => handleArrayChange('instructions', index, e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder={`Step ${index + 1}`}
                />
                {blogData.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemFromArray('instructions', index)}
                    className="text-red-600"
                  >
                    <Trash />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addItemToArray('instructions')} className="text-red-600">
              <Plus /> Add Step
            </button>
          </div>

          

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Publish Recipe
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteBlogPage;
