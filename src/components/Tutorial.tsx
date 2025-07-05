import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  BookOpen, 
  Upload, 
  Settings, 
  Brain, 
  Eye,
  Star,
  Palette,
  Filter,
  Grid,
  Download,
  Sparkles,
  Zap,
  Wand2,
  Circle,
  Search,
  CheckSquare,
  Lightbulb,
  Camera,
  Target,
  Award,
  Layers,
  RotateCw,
  Save,
  Folder,
  Users,
  Scissors,
  MousePointer,
  Keyboard,
  ArrowRight
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  category: 'getting-started' | 'analysis' | 'editing' | 'organization' | 'advanced';
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: Play, color: 'bg-green-500' },
    { id: 'analysis', label: 'AI Analysis', icon: Brain, color: 'bg-blue-500' },
    { id: 'editing', label: 'Photo Editing', icon: Palette, color: 'bg-purple-500' },
    { id: 'organization', label: 'Organization', icon: Folder, color: 'bg-orange-500' },
    { id: 'advanced', label: 'Advanced Features', icon: Target, color: 'bg-red-500' }
  ];

  const tutorialSteps: TutorialStep[] = [
    // Getting Started
    {
      id: 'welcome',
      title: 'Welcome to AI Photo Culling',
      description: 'Learn how to use our powerful AI-driven photo management system',
      icon: <Camera className="h-6 w-6" />,
      category: 'getting-started',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              What is AI Photo Culling?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our application uses advanced artificial intelligence to automatically analyze, score, and organize your photos. 
              It helps photographers quickly identify the best shots from large collections.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">AI-powered analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">Automatic scoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">Smart organization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">Batch processing</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'upload-photos',
      title: 'Uploading Your Photos',
      description: 'Learn how to upload and manage your photo collections',
      icon: <Upload className="h-6 w-6" />,
      category: 'getting-started',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <span>Supported File Formats</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Formats:</p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• JPEG (.jpg, .jpeg)</li>
                  <li>• PNG (.png)</li>
                  <li>• TIFF (.tiff, .tif)</li>
                  <li>• WebP (.webp)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">RAW Formats:</p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Canon (.cr2, .cr3)</li>
                  <li>• Nikon (.nef, .nrw)</li>
                  <li>• Sony (.arw, .srf)</li>
                  <li>• Adobe (.dng)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">How to Upload:</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm">Click the "Upload Photos" button on the main screen</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm">Select multiple photos using Ctrl+Click (Windows) or Cmd+Click (Mac)</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm">You can also drag and drop photos directly onto the upload area</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm">Add more photos later using "Add More Photos" button</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'workflow-overview',
      title: 'Understanding the Workflow',
      description: 'Learn about the four main stages of photo processing',
      icon: <ArrowRight className="h-6 w-6" />,
      category: 'getting-started',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold">1. Upload Photos</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your photos in various formats including RAW files. The system supports batch uploads.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold">2. Configure Analysis</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your event type and culling mode to optimize AI analysis for your specific photography style.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold">3. AI Analysis</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our AI analyzes each photo for quality, composition, faces, and content relevance.
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold">4. Review & Organize</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review AI suggestions, edit photos, organize into albums, and export your final selections.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Analysis
    {
      id: 'culling-modes',
      title: 'Understanding Culling Modes',
      description: 'Choose the right analysis mode for your workflow',
      icon: <Brain className="h-6 w-6" />,
      category: 'analysis',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">Fast Culling</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Quick analysis using basic analytics only (~30 seconds per 100 photos)
              </p>
              <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                <li>• Basic blur detection</li>
                <li>• Exposure analysis</li>
                <li>• Face/eyes detection</li>
                <li>• Quick tagging</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Deep Analysis</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Advanced AI analysis with event-specific prompts (~3 minutes per 100 photos)
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• All basic analytics</li>
                <li>• AI model scoring</li>
                <li>• Event-specific BLIP prompts</li>
                <li>• Smart color labeling</li>
                <li>• Advanced categorization</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-r-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MousePointer className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">Manual Review</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                Manual culling with optional AI suggestions
              </p>
              <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                <li>• No auto-scoring</li>
                <li>• Manual keep/reject</li>
                <li>• Optional AI suggestions</li>
                <li>• Full user control</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'event-types',
      title: 'Event Type Selection',
      description: 'Optimize AI analysis for your photography style',
      icon: <Camera className="h-6 w-6" />,
      category: 'analysis',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecting the right event type helps our AI understand the context and optimize analysis for your specific photography style.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💒</span>
              </div>
              <div>
                <h5 className="font-medium">Wedding</h5>
                <p className="text-xs text-gray-500">Optimized for ceremonies, receptions, and romantic moments</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👶</span>
              </div>
              <div>
                <h5 className="font-medium">Baptism</h5>
                <p className="text-xs text-gray-500">Religious ceremonies and family celebrations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h5 className="font-medium">Portrait</h5>
                <p className="text-xs text-gray-500">Individual and group portraits with focus on faces</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🏢</span>
              </div>
              <div>
                <h5 className="font-medium">Corporate</h5>
                <p className="text-xs text-gray-500">Business events, headshots, and professional photography</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Tip:</strong> You can change the event type later and re-analyze photos with the new context.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ai-scoring',
      title: 'Understanding AI Scores',
      description: 'Learn how our AI rates photo quality and composition',
      icon: <Star className="h-6 w-6" />,
      category: 'analysis',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>AI Scoring System</span>
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Our AI uses a 10-point scale (displayed as 5 stars) to rate photos based on multiple factors:
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <div>
                <h5 className="font-medium">Technical Quality</h5>
                <p className="text-xs text-gray-500">Sharpness, exposure, noise, and overall image quality</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Grid className="h-4 w-4 text-white" />
              </div>
              <div>
                <h5 className="font-medium">Composition</h5>
                <p className="text-xs text-gray-500">Rule of thirds, leading lines, and visual balance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h5 className="font-medium">Subject Detection</h5>
                <p className="text-xs text-gray-500">Face detection, eye contact, and subject prominence</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <h5 className="font-medium">Event Relevance</h5>
                <p className="text-xs text-gray-500">How well the photo fits the selected event type</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2">Star Rating Guide:</h5>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>⭐⭐⭐⭐⭐ (9-10 points)</span>
                <span className="text-green-600 font-medium">Exceptional</span>
              </div>
              <div className="flex items-center justify-between">
                <span>⭐⭐⭐⭐ (7-8 points)</span>
                <span className="text-blue-600 font-medium">Very Good</span>
              </div>
              <div className="flex items-center justify-between">
                <span>⭐⭐⭐ (5-6 points)</span>
                <span className="text-yellow-600 font-medium">Good</span>
              </div>
              <div className="flex items-center justify-between">
                <span>⭐⭐ (3-4 points)</span>
                <span className="text-orange-600 font-medium">Fair</span>
              </div>
              <div className="flex items-center justify-between">
                <span>⭐ (1-2 points)</span>
                <span className="text-red-600 font-medium">Poor</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Editing
    {
      id: 'photo-editing',
      title: 'Photo Editing Tools',
      description: 'Learn about the built-in photo editing capabilities',
      icon: <Palette className="h-6 w-6" />,
      category: 'editing',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Our built-in photo editor provides professional-grade tools for enhancing your images.
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Palette className="h-5 w-5 text-blue-600" />
                <span>Basic Adjustments</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Brightness</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Contrast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Saturation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Sharpness</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Settings className="h-5 w-5 text-green-600" />
                <span>Advanced Controls</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Temperature</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Gamma</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span>Vignette</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span>Rotation</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2 flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-green-600" />
              <span>Pro Tips:</span>
            </h5>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Use profiles to save your favorite editing settings</li>
              <li>• Try Auto-Correct for quick improvements</li>
              <li>• Use Auto-Enhance for AI-powered adjustments</li>
              <li>• Preview changes before applying them</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'ai-enhancement',
      title: 'AI Enhancement Tools',
      description: 'Discover automatic photo improvement features',
      icon: <Sparkles className="h-6 w-6" />,
      category: 'editing',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-r-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800 dark:text-purple-200">Auto-Correct</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                Automatically fixes common issues like exposure, white balance, and color correction.
              </p>
              <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                <li>• Exposure correction</li>
                <li>• White balance adjustment</li>
                <li>• Color temperature fix</li>
                <li>• Shadow/highlight recovery</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Auto-Enhance</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                AI-powered enhancement that improves overall image quality and visual appeal.
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Intelligent sharpening</li>
                <li>• Noise reduction</li>
                <li>• Dynamic range optimization</li>
                <li>• Color enhancement</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wand2 className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">AI Inpainting</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Remove unwanted objects or fill in missing parts using AI-powered inpainting.
              </p>
              <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                <li>• Object removal</li>
                <li>• Background cleanup</li>
                <li>• Content-aware fill</li>
                <li>• Smart reconstruction</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2">Batch Processing:</h5>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Select multiple photos and apply Auto-Correct or Auto-Enhance to all of them at once for efficient workflow.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'focus-map',
      title: 'Focus Map Analysis',
      description: 'Visualize focus areas and depth of field in your photos',
      icon: <Target className="h-6 w-6" />,
      category: 'editing',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>What is Focus Map?</span>
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Focus Map is an AI-powered tool that analyzes and visualizes the focus areas in your photos, 
              helping you understand depth of field and identify the sharpest regions.
            </p>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-medium">How to Use Focus Map:</h5>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm">Open any photo in the editor</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm">Click the "Show Focus Map" button</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm">View the heat map overlay showing focus intensity</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm">The yellow dot indicates the primary focus point</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <h6 className="font-medium text-red-800 dark:text-red-200 mb-1">Red Areas</h6>
              <p className="text-xs text-red-600 dark:text-red-400">Out of focus or blurry regions</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <h6 className="font-medium text-green-800 dark:text-green-200 mb-1">Green Areas</h6>
              <p className="text-xs text-green-600 dark:text-green-400">Sharp and in-focus regions</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Tip:</strong> Use Focus Map to identify photos with focus issues or to understand 
              the depth of field characteristics of your lens.
            </p>
          </div>
        </div>
      )
    },

    // Organization
    {
      id: 'color-labels',
      title: 'Color Label System',
      description: 'Organize photos using the color-coded labeling system',
      icon: <Circle className="h-6 w-6" />,
      category: 'organization',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use color labels to quickly categorize and organize your photos during the review process.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              <div>
                <h5 className="font-medium text-green-800 dark:text-green-200">Green - Approved</h5>
                <p className="text-xs text-green-600 dark:text-green-400">Photos you want to keep and deliver</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              <div>
                <h5 className="font-medium text-red-800 dark:text-red-200">Red - Rejected</h5>
                <p className="text-xs text-red-600 dark:text-red-400">Photos to delete or exclude</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
              <div>
                <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Yellow - Review</h5>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Photos that need further review</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Blue - Client</h5>
                <p className="text-xs text-blue-600 dark:text-blue-400">Special photos for client review</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
              <div>
                <h5 className="font-medium text-purple-800 dark:text-purple-200">Purple - Duplicate</h5>
                <p className="text-xs text-purple-600 dark:text-purple-400">Duplicate or similar photos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2">How to Apply Color Labels:</h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Click the color dot on any photo card</li>
              <li>• Use the color label filter to view specific categories</li>
              <li>• In manual mode, use keyboard shortcuts K (keep) and R (reject)</li>
              <li>• Batch select photos and apply labels to multiple photos at once</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'filtering-searching',
      title: 'Filtering and Searching',
      description: 'Find specific photos quickly using filters and search',
      icon: <Search className="h-6 w-6" />,
      category: 'organization',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <span>Quick Filters</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• Show All</div>
                <div>• AI Score {'>'}8</div>
                <div>• Blurry Photos</div>
                <div>• Eyes Closed</div>
                <div>• Duplicates</div>
                <div>• Event Highlights</div>
                <div>• Flagged Issues</div>
                <div>• Selected Photos</div>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Search className="h-5 w-5 text-green-600" />
                <span>Caption Search</span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Search through AI-generated captions to find specific content:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm font-mono">
                "bride and groom", "sunset", "group photo"
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Star Rating Filter</span>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Filter photos by AI-assigned star ratings:
              </p>
              <div className="space-y-1 text-sm">
                <div>• 5 Stars (Exceptional)</div>
                <div>• 4+ Stars (Very Good and above)</div>
                <div>• 3+ Stars (Good and above)</div>
                <div>• Custom range selection</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2">Pro Tips:</h5>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Combine multiple filters for precise results</li>
              <li>• Use the sidebar for quick access to filter statistics</li>
              <li>• Save time by filtering before manual review</li>
              <li>• Search captions work with AI-generated descriptions</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'albums-management',
      title: 'Albums and Collections',
      description: 'Organize photos into albums and manage collections',
      icon: <Folder className="h-6 w-6" />,
      category: 'organization',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <Folder className="h-5 w-5 text-blue-600" />
              <span>Album Management</span>
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Create albums to organize your photos into logical collections for different purposes or clients.
            </p>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-medium">Creating and Managing Albums:</h5>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm">Click "New Album" to create a new collection</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm">Give your album a descriptive name and optional description</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm">Add photos by clicking the folder icon on any photo</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm">Switch between albums using the album selector</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <h6 className="font-medium mb-1">Album Features:</h6>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Unlimited albums per project</li>
                <li>• Photos can belong to multiple albums</li>
                <li>• Edit album names and descriptions</li>
                <li>• Delete albums (photos remain in main collection)</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2">Use Cases:</h5>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Separate ceremony and reception photos</li>
              <li>• Create client preview collections</li>
              <li>• Organize by photo style or location</li>
              <li>• Group photos for different deliverables</li>
            </ul>
          </div>
        </div>
      )
    },

    // Advanced Features
    {
      id: 'manual-culling',
      title: 'Manual Culling Mode',
      description: 'Learn the manual review workflow and keyboard shortcuts',
      icon: <Keyboard className="h-6 w-6" />,
      category: 'advanced',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <MousePointer className="h-5 w-5 text-purple-600" />
              <span>Manual Review Workflow</span>
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Manual mode gives you complete control over the culling process, perfect for photographers 
              who prefer hands-on review with optional AI assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium mb-3 flex items-center space-x-2">
                <Keyboard className="h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">K</kbd>
                    <span className="text-sm">Keep photo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">R</kbd>
                    <span className="text-sm">Reject photo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">→</kbd>
                    <span className="text-sm">Next photo</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">←</kbd>
                    <span className="text-sm">Previous photo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Space</kbd>
                    <span className="text-sm">Skip photo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">?</kbd>
                    <span className="text-sm">Toggle help</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium mb-3">Review Process:</h5>
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-sm">Review each photo individually in the preview area</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-sm">Use keyboard shortcuts or buttons to keep, reject, or skip</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-sm">Track progress with the completion counter</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-sm">Review final selections using color label filters</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2">Benefits of Manual Mode:</h5>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Complete control over selection process</li>
              <li>• No waiting for AI analysis</li>
              <li>• Perfect for experienced photographers</li>
              <li>• Can still use AI suggestions and tips</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'ai-tips',
      title: 'AI Photo Tips',
      description: 'Get personalized improvement suggestions for your photos',
      icon: <Lightbulb className="h-6 w-6" />,
      category: 'advanced',
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span>AI Photo Tips</span>
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Get personalized suggestions from our AI to improve your photography skills and understand 
              what makes certain photos stand out.
            </p>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-medium">How to Get AI Tips:</h5>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm">Hover over any photo to reveal the action buttons</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm">Click the lightbulb icon to request an AI tip</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm">Read the personalized suggestion in the tooltip</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm">The tip is saved and can be viewed again later</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <h6 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Composition Tips</h6>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Suggestions about framing, rule of thirds, leading lines, and visual balance
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <h6 className="font-medium text-green-800 dark:text-green-200 mb-1">Technical Advice</h6>
              <p className="text-xs text-green-600 dark:text-green-400">
                Feedback on exposure, focus, depth of field, and camera settings
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <h6 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Creative Insights</h6>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Ideas for improving mood, storytelling, and artistic impact
              </p>
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>Learning Tool:</strong> Use AI tips to understand why certain photos score higher 
              and improve your photography skills over time.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'batch-operations',
      title: 'Batch Operations',
      description: 'Process multiple photos efficiently with batch tools',
      icon: <Layers className="h-6 w-6" />,
      category: 'advanced',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <Layers className="h-5 w-5 text-blue-600" />
              <span>Batch Processing</span>
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Save time by applying operations to multiple photos at once. Perfect for large collections 
              and consistent processing workflows.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium mb-3 flex items-center space-x-2">
                <CheckSquare className="h-4 w-4" />
                <span>Selection Methods</span>
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Click individual photos to select them</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Use "Select All" to choose all visible photos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Filter first, then select all filtered results</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Hold Ctrl/Cmd for multi-selection</span>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h5 className="font-medium mb-3">Available Batch Operations:</h5>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <div>
                    <span className="font-medium text-sm">Batch Auto-Correct</span>
                    <p className="text-xs text-gray-500">Fix exposure and color issues</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-medium text-sm">Batch Auto-Enhance</span>
                    <p className="text-xs text-gray-500">AI-powered quality improvements</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <Circle className="h-4 w-4 text-green-600" />
                  <div>
                    <span className="font-medium text-sm">Color Label Assignment</span>
                    <p className="text-xs text-gray-500">Apply labels to multiple photos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <Download className="h-4 w-4 text-orange-600" />
                  <div>
                    <span className="font-medium text-sm">Batch Export</span>
                    <p className="text-xs text-gray-500">Download multiple photos at once</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2">Workflow Tips:</h5>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Filter photos first to target specific groups</li>
              <li>• Process similar photos together for consistency</li>
              <li>• Use batch operations after AI analysis for best results</li>
              <li>• Monitor progress in the status indicators</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'ai-training',
      title: 'AI Training & Personalization',
      description: 'Train the AI to match your personal style and preferences',
      icon: <Brain className="h-6 w-6" />,
      category: 'advanced',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>Personalized AI Learning</span>
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Train our AI to understand your unique style and preferences. The more you use the system, 
              the better it becomes at predicting your choices.
            </p>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-medium">How AI Training Works:</h5>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm">Complete your photo review and apply color labels</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm">Adjust star ratings to match your preferences</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm">Click "Save & Train AI" and select your event type</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm">The AI learns from your choices for future sessions</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <h6 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Style Learning</h6>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                AI learns your preferences for composition, lighting, and subject matter
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <h6 className="font-medium text-green-800 dark:text-green-200 mb-1">Quality Standards</h6>
              <p className="text-xs text-green-600 dark:text-green-400">
                System adapts to your technical quality requirements and tolerances
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <h6 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Event Specialization</h6>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                AI becomes better at scoring photos for your specific event types
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <h5 className="font-medium mb-2">Training Benefits:</h5>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• More accurate AI scoring over time</li>
              <li>• Better duplicate detection for your style</li>
              <li>• Improved automatic color labeling</li>
              <li>• Personalized photo recommendations</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const filteredSteps = tutorialSteps.filter(step => {
    const matchesCategory = !selectedCategory || step.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      step.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepSelect = (index: number) => {
    setCurrentStep(index);
  };

  const resetToOverview = () => {
    setSelectedCategory(null);
    setCurrentStep(0);
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tutorial</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                         text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={resetToOverview}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedCategory
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All Topics
              </button>
              {categories.map((category) => {
                const Icon = category.icon;
                const count = tutorialSteps.filter(step => step.category === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentStep(0);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${category.color} rounded-full`} />
                        <span>{category.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.label 
                : 'All Topics'
              } ({filteredSteps.length})
            </h3>
            <div className="space-y-2">
              {filteredSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepSelect(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === index
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-lg ${
                      currentStep === index 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm ${
                        currentStep === index 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-xs mt-1 line-clamp-2 ${
                        currentStep === index 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {filteredSteps[currentStep]?.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {filteredSteps[currentStep]?.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filteredSteps[currentStep]?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentStep + 1} of {filteredSteps.length}
                </span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl">
              {filteredSteps[currentStep]?.content}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 
                         dark:hover:bg-gray-600 transition-colors disabled:opacity-50 
                         disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {filteredSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepSelect(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentStep === filteredSteps.length - 1}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white 
                         rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 
                         disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;