import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, MessageCircle, Clock, Flame, Users,
  LayersIcon, Heart, Share2, Twitter, Facebook, Printer,
  Star, BookmarkPlus, ThumbsUp, Timer, ChefHat, Scale,
  Utensils, Instagram, Copy, Check, Eye, EyeOff,
  Plus, Minus, AlertCircle
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import img from "../assets/blog1_optimized.png";

// Mock data service - replace with your actual API calls
const fetchBlogData = async (id) => {
  try {
    const response = await fetch(`http://localhost:8000/api/blogs/${id}`,{
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch blog data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching blog data: ${error.message}`);
  }
};

const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2">
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

const CustomButton = ({ variant = "default", size = "default", className = "", children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    icon: "h-10 w-10 p-0"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    icon: "h-10 w-10"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-6 border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children }) => (
  <h2 className="text-2xl font-bold tracking-tight">{children}</h2>
);

const CardContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

const Alert = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-blue-50 text-blue-900",
    destructive: "bg-red-50 text-red-900"
  };

  return (
    <div className={`p-4 rounded-lg flex items-center gap-2 ${variants[variant]}`}>
      {children}
    </div>
  );
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const BlogPage = () => {
  const { id } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [servingsCount, setServingsCount] = useState(4);
  const [showNutrition, setShowNutrition] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [cookingMode, setCookingMode] = useState(false);
  const [timers, setTimers] = useState({});
  const [timerIds, setTimerIds] = useState({});

  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchBlogData(id);
        setBlogData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogData();
  }, [id]);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / height) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  const startTimer = (stepIndex, duration) => {
    if (!duration) return;

    if (timerIds[stepIndex]) {
      clearInterval(timerIds[stepIndex]);
    }

    const timerId = setInterval(() => {
      setTimers(prev => {
        const newTime = (prev[stepIndex] || duration) - 1;
        if (newTime <= 0) {
          clearInterval(timerId);
          if (Notification.permission === "granted") {
            new Notification("Timer Complete!", {
              body: `Step ${stepIndex + 1} is ready!`
            });
          }
          return { ...prev, [stepIndex]: 0 };
        }
        return { ...prev, [stepIndex]: newTime };
      });
    }, 1000);

    setTimers(prev => ({ ...prev, [stepIndex]: duration }));
    setTimerIds(prev => ({ ...prev, [stepIndex]: timerId }));

    return () => clearInterval(timerId);
  };
  const stopTimer = (stepIndex) => {
    if (timerIds[stepIndex]) {
      clearInterval(timerIds[stepIndex]);
      setTimerIds(prev => ({...prev, [stepIndex]: null}));
      setTimers(prev => ({...prev, [stepIndex]: 0}));
    }
  };

  const scaleIngredient = (ingredient) => {
    if (!ingredient) return '';
    
    const baseServings = 4;
    const ratio = servingsCount / baseServings;
    const match = ingredient.match(/^([\d.]+)\s*(.+)/);
    
    if (match) {
      const [_, amount, rest] = match;
      return `${(parseFloat(amount) * ratio).toFixed(1)} ${rest}`;
    }
    return ingredient;
  };

  const copyToClipboard = async () => {
    if (!blogData?.ingredients) return;
    
    try {
      const ingredients = blogData.ingredients.join('\n');
      await navigator.clipboard.writeText(ingredients);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 max-w-4xl mx-auto px-4">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 max-w-4xl mx-auto px-4">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to load recipe: {error}</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <div className="fixed top-0 left-0 w-full z-50 bg-gray-200">
        <div 
          className="h-1 bg-red-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{blogData?.title}</CardTitle>
            {blogData?.image ? (
              <img src={blogData.image} alt={blogData.title} className="w-full h-72 object-cover"/>
            ) : (
              <img src={img} className="w-full h-72 object-cover" alt="Default"/>
            )}
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <LayersIcon className="w-5 h-5" />
                  Ingredients
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CustomButton
                      variant="outline"
                      size="sm"
                      onClick={() => setServingsCount(prev => Math.max(1, prev - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </CustomButton>
                    <span className="w-8 text-center">{servingsCount}</span>
                    <CustomButton
                      variant="outline"
                      size="sm"
                      onClick={() => setServingsCount(prev => prev + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </CustomButton>
                  </div>
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy List'}
                  </CustomButton>
                </div>
              </div>
              <ul className="space-y-2">
                {blogData?.ingredients?.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span>{scaleIngredient(ingredient)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5" />
                Instructions
              </h3>
              <div className="space-y-6">
                {blogData?.instructions?.map((instruction, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg transition-colors ${
                      activeStep === index ? 'bg-red-50' : 'bg-gray-50'
                    } ${completedSteps.has(index) ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white font-bold">
                        {index + 1}
                      </span>
                      <CustomButton
                        variant={completedSteps.has(index) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCompletedSteps(prev => {
                            const next = new Set(prev);
                            if (next.has(index)) {
                              next.delete(index);
                            } else {
                              next.add(index);
                            }
                            return next;
                          });
                        }}
                      >
                        {completedSteps.has(index) ? 'Completed' : 'Mark Complete'}
                      </CustomButton>
                      {instruction.includes('minutes') && (
                        <>
                          {!timers[index] ? (
                            <CustomButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const duration = parseInt(instruction.match(/\d+/)[0]) * 60;
                                startTimer(index, duration);
                              }}
                            >
                              Start Timer
                            </CustomButton>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-mono">
                                {Math.floor(timers[index] / 60)}:
                                {(timers[index] % 60).toString().padStart(2, '0')}
                              </span>
                              <CustomButton
                                variant="outline"
                                size="sm"
                                onClick={() => stopTimer(index)}
                              >
                                Stop Timer
                              </CustomButton>
                            </div>
                          )}
                        </>
                      )}
                    
                      
                    </div>
                    <p className="ml-12">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <Tooltip content="Print Recipe">
          <CustomButton
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={() => window.print()}
          >
            <Printer className="w-6 h-6" />
          </CustomButton>
        </Tooltip>

        <Tooltip content={activeStep === (blogData?.instructions?.length || 0) - 1 ? 'Recipe Complete' : 'Next Step'}>
          <CustomButton
            variant="default"
            size="icon"
            className="rounded-full"
            onClick={() => {
              setActiveStep(prev => 
                prev < (blogData?.instructions?.length || 0) - 1 ? prev + 1 : prev
              );
            }}
            disabled={activeStep === (blogData?.instructions?.length || 0) - 1}
          >
            <ChefHat className="w-6 h-6" />
          </CustomButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default BlogPage;