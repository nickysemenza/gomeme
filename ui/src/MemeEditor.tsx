import React, { useState, useRef, useCallback } from "react";
import * as yaml from "js-yaml";
import Button from "./components/Button";

interface Point {
  x: number;
  y: number;
}

interface Target {
  friendly_name: string;
  top_left: Point;
  size: Point;
  deltas?: Point[];
}

interface Template {
  name: string;
  size: Point;
  targets: Target[];
  file: string;
}

interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize';
  targetIndex: number;
  startPos: Point;
  startSize: Point;
  startTopLeft: Point;
}

const MemeEditor: React.FC = () => {
  const [template, setTemplate] = useState<Template>({
    name: 'new_template',
    size: { x: 800, y: 600 },
    targets: [],
    file: ''
  });
  
  const [selectedTarget, setSelectedTarget] = useState<number>(-1);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [yamlInput, setYamlInput] = useState<string>('');
  const [existingTemplates, setExistingTemplates] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const loadSampleTemplate = () => {
    setTemplate({
      name: 'drake_sample',
      size: { x: 425, y: 365 },
      targets: [
        {
          friendly_name: 'panel 1',
          top_left: { x: 217, y: 0 },
          size: { x: 210, y: 170 }
        },
        {
          friendly_name: 'panel 2', 
          top_left: { x: 217, y: 174 },
          size: { x: 210, y: 170 }
        }
      ],
      file: 'templates/drake1.jpeg'
    });
    setImageUrl('https://imgflip.com/s/meme/Drake-Pointing.jpg');
    setSelectedTarget(-1);
  };

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    setTemplate(prev => ({
      ...prev,
      size: { x: img.naturalWidth, y: img.naturalHeight }
    }));
    setImageLoaded(true);
  }, []);

  const addTarget = () => {
    const newTarget: Target = {
      friendly_name: `Target ${template.targets.length + 1}`,
      top_left: { x: 50, y: 50 },
      size: { x: 200, y: 100 }
    };
    
    setTemplate(prev => ({
      ...prev,
      targets: [...prev.targets, newTarget]
    }));
    setSelectedTarget(template.targets.length);
  };

  const updateTarget = useCallback((index: number, updates: Partial<Target>) => {
    setTemplate(prev => ({
      ...prev,
      targets: prev.targets.map((target, i) => 
        i === index ? { ...target, ...updates } : target
      )
    }));
  }, []);

  const removeTarget = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index)
    }));
    setSelectedTarget(-1);
  };

  const handleMouseDown = (e: React.MouseEvent, targetIndex: number, dragType: 'move' | 'resize') => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const target = template.targets[targetIndex];
    setDragState({
      isDragging: true,
      dragType,
      targetIndex,
      startPos: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      startSize: { ...target.size },
      startTopLeft: { ...target.top_left }
    });
    setSelectedTarget(targetIndex);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const deltaX = currentPos.x - dragState.startPos.x;
    const deltaY = currentPos.y - dragState.startPos.y;

    if (dragState.dragType === 'move') {
      updateTarget(dragState.targetIndex, {
        top_left: {
          x: Math.max(0, Math.min(template.size.x - dragState.startSize.x, dragState.startTopLeft.x + deltaX)),
          y: Math.max(0, Math.min(template.size.y - dragState.startSize.y, dragState.startTopLeft.y + deltaY))
        }
      });
    } else if (dragState.dragType === 'resize') {
      const newWidth = Math.max(20, dragState.startSize.x + deltaX);
      const newHeight = Math.max(20, dragState.startSize.y + deltaY);
      
      updateTarget(dragState.targetIndex, {
        size: {
          x: Math.min(newWidth, template.size.x - dragState.startTopLeft.x),
          y: Math.min(newHeight, template.size.y - dragState.startTopLeft.y)
        }
      });
    }
  }, [dragState, template.size, updateTarget]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const generateYAML = () => {
    const yamlData = {
      [template.name]: {
        size: template.size,
        targets: template.targets.map(target => ({
          friendly_name: target.friendly_name,
          top_left: target.top_left,
          size: target.size,
          ...(target.deltas && target.deltas.length > 0 && { deltas: target.deltas })
        })),
        file: template.file
      }
    };

    try {
      const generatedYAML = yaml.dump(yamlData, {
        indent: 2,
        lineWidth: -1,
        quotingType: '"',
        forceQuotes: false
      });
      
      return `# Add this to your gomeme.yaml templates section:\n${generatedYAML}`;
    } catch (error) {
      console.error('Error generating YAML:', error);
      return 'Error generating YAML. Please check your template data.';
    }
  };

  const parseYAMLTemplate = (yamlText: string) => {
    try {
      const parsed = yaml.load(yamlText) as any;
      return parsed;
    } catch (error) {
      console.error('YAML parsing error:', error);
      return null;
    }
  };

  const loadTemplateFromYAML = (templateName: string) => {
    const parsed = parseYAMLTemplate(yamlInput);
    if (!parsed) {
      alert('Invalid YAML format');
      return;
    }

    // Handle both direct template format and nested under "templates" key
    const templateData = parsed[templateName] || (parsed.templates && parsed.templates[templateName]);
    
    if (!templateData) {
      alert(`Template "${templateName}" not found in YAML`);
      return;
    }

    const newTemplate: Template = {
      name: templateName,
      size: templateData.size || { x: 800, y: 600 },
      targets: (templateData.targets || []).map((t: any) => ({
        friendly_name: t.friendly_name || 'Unnamed Target',
        top_left: t.top_left || { x: 0, y: 0 },
        size: t.size || { x: 100, y: 100 },
        ...(t.deltas && { deltas: t.deltas })
      })),
      file: templateData.file || ''
    };

    setTemplate(newTemplate);
    setSelectedTarget(-1);
    
    // Try to construct a reasonable image URL from the file path
    if (templateData.file) {
      // Don't automatically set the image URL from file path since it won't work in dev
      // Instead, leave it empty so user can set a working URL manually
      setImageUrl('');
    }
    
    // Show success message
    alert(`Template "${templateName}" loaded successfully!`);
  };

  const extractTemplateNames = (yamlText: string) => {
    try {
      const parsed = yaml.load(yamlText) as any;
      if (!parsed) return [];
      
      // Handle both direct template format and nested under "templates" key
      if (parsed.templates) {
        return Object.keys(parsed.templates);
      } else {
        // Direct format - filter out non-template keys
        return Object.keys(parsed).filter(key => 
          parsed[key] && 
          typeof parsed[key] === 'object' && 
          (parsed[key].size || parsed[key].targets)
        );
      }
    } catch (error) {
      console.error('Error parsing YAML:', error);
      return [];
    }
  };

  const handleYAMLImport = () => {
    const names = extractTemplateNames(yamlInput);
    setExistingTemplates(names);
  };

  const loadSampleYAML = () => {
    // Provide sample YAML structure from actual gomeme.yaml
    const sampleYAML = `templates:
  office1:
    size:
      x: 1363
      y: 1524
    targets:
      - friendly_name: panel 1
        top_left:
          x: 19
          y: 42
        size:
          x: 709
          y: 505
        deltas:
          - x: 195
            y: 0
          - x: 0
            y: -98
          - x: 0
            y: 46
          - x: -173
            y: 0
      - friendly_name: panel 2
        top_left:
          x: 628
          y: 112
        size:
          x: 954
          y: 553
        deltas:
          - x: 233
            y: 0
          - x: 0
            y: -115
          - x: 0
            y: 87
          - x: -274
            y: 0
    file: templates/office1.jpg
  drake1:
    size:
      x: 425
      y: 365
    targets:
      - friendly_name: panel 1
        top_left:
          x: 217
          y: 0
        size:
          x: 210
          y: 170
      - friendly_name: panel 2
        top_left:
          x: 217
          y: 174
        size:
          x: 210
          y: 170
    file: templates/drake1.jpeg
  trade_deal:
    size:
      x: 607
      y: 794
    targets:
      - friendly_name: panel 1
        top_left:
          x: 14
          y: 181
        size:
          x: 250
          y: 250
      - friendly_name: panel 2
        top_left:
          x: 344
          y: 181
        size:
          x: 250
          y: 250
    file: templates/trade_deal.jpg
  bernie:
    size:
      x: 926
      y: 688
    targets:
      - friendly_name: bottom text
        top_left:
          x: 73
          y: 500
        size:
          x: 800
          y: 180
    file: templates/bernie.png`;
        
    setYamlInput(sampleYAML);
    const names = extractTemplateNames(sampleYAML);
    setExistingTemplates(names);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meme Template Editor</h1>
              <p className="text-lg text-gray-600">
                Create and edit meme templates visually, then export to YAML
              </p>
            </div>
            <Button
              onClick={() => window.history.back()}
              variant="secondary"
              icon="←"
            >
              Back
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Settings */}
          <div className="lg:col-span-1 space-y-6">
            <TemplateSettings 
              template={template} 
              setTemplate={setTemplate}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
            />

            <YAMLImport 
              yamlInput={yamlInput}
              setYamlInput={setYamlInput}
              existingTemplates={existingTemplates}
              onImport={handleYAMLImport}
              onLoadTemplate={loadTemplateFromYAML}
              onLoadSampleYAML={loadSampleYAML}
            />
            
            <TargetsList 
              targets={template.targets}
              selectedTarget={selectedTarget}
              setSelectedTarget={setSelectedTarget}
              updateTarget={updateTarget}
              removeTarget={removeTarget}
              addTarget={addTarget}
              loadSampleTemplate={loadSampleTemplate}
            />

            <YAMLExport template={template} generateYAML={generateYAML} />
          </div>

          {/* Visual Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Editor</h3>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative inline-block">
                {imageUrl && (
                  <div
                    ref={canvasRef}
                    className="relative cursor-crosshair"
                    onMouseMove={dragState ? handleMouseMove : undefined}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img
                      src={imageUrl}
                      alt="Template"
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        setImageLoaded(false);
                        e.currentTarget.style.display = 'none';
                      }}
                      className="block max-w-full max-h-96 object-contain"
                      draggable={false}
                    />
                    
                    {imageLoaded && template.targets.map((target, index) => (
                      <TargetOverlay
                        key={index}
                        target={target}
                        index={index}
                        isSelected={selectedTarget === index}
                        imageScale={1} // You might want to calculate actual scale
                        onMouseDown={handleMouseDown}
                        onClick={() => setSelectedTarget(index)}
                      />
                    ))}
                  </div>
                )}
                
                {!imageUrl && (
                  <div className="w-full h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🖼️</span>
                      <p className="mb-2">Enter an image URL above to start editing</p>
                      <p className="text-sm text-gray-400">Use publicly accessible URLs (https://...)</p>
                    </div>
                  </div>
                )}
                
                {imageUrl && !imageLoaded && (
                  <div className="w-full h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">⚠️</span>
                      <p className="mb-2">Failed to load image</p>
                      <p className="text-sm text-gray-400">Check that the URL is valid and publicly accessible</p>
                    </div>
                  </div>
                )}
              </div>
              
              {imageLoaded && (
                <div className="mt-4 text-sm text-gray-600">
                  Template Size: {template.size.x} × {template.size.y}px
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for template settings
interface TemplateSettingsProps {
  template: Template;
  setTemplate: (template: Template) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

const TemplateSettings: React.FC<TemplateSettingsProps> = ({ 
  template, setTemplate, imageUrl, setImageUrl 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Settings</h3>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template Name
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={template.name}
          onChange={(e) => setTemplate({ ...template, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <input
          type="url"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <div className="mt-2 text-sm text-gray-600">
          <p>💡 <strong>Tip:</strong> Use publicly accessible image URLs. Local file paths won't work in the editor.</p>
        </div>
        
        {/* Quick image URL suggestions */}
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Quick Examples:
          </label>
          <div className="flex flex-wrap gap-1">
            {[
              { name: 'Drake', url: 'https://imgflip.com/s/meme/Drake-Pointing.jpg' },
              { name: 'Distracted Boyfriend', url: 'https://imgflip.com/s/meme/Distracted-Boyfriend.jpg' },
              { name: 'Two Buttons', url: 'https://imgflip.com/s/meme/Two-Buttons.jpg' }
            ].map(({ name, url }) => (
              <button
                key={name}
                onClick={() => setImageUrl(url)}
                className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File Path (for gomeme.yaml)
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="templates/image.jpg"
          value={template.file}
          onChange={(e) => setTemplate({ ...template, file: e.target.value })}
        />
      </div>
    </div>
  </div>
);

// Component for targets list
interface TargetsListProps {
  targets: Target[];
  selectedTarget: number;
  setSelectedTarget: (index: number) => void;
  updateTarget: (index: number, updates: Partial<Target>) => void;
  removeTarget: (index: number) => void;
  addTarget: () => void;
  loadSampleTemplate: () => void;
}

const TargetsList: React.FC<TargetsListProps> = ({
  targets, selectedTarget, setSelectedTarget, updateTarget, removeTarget, addTarget, loadSampleTemplate
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Targets</h3>
      <div className="flex space-x-2">
        <Button onClick={addTarget} size="sm" icon="+" variant="secondary">
          Add Target
        </Button>
        <Button onClick={loadSampleTemplate} size="sm" icon="🎯" variant="secondary">
          Sample
        </Button>
      </div>
    </div>
    
    <div className="space-y-3">
      {targets.map((target, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedTarget === index 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedTarget(index)}
        >
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              className="font-medium bg-transparent border-none outline-none flex-1"
              value={target.friendly_name}
              onChange={(e) => updateTarget(index, { friendly_name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTarget(index);
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
            <div>Pos: {target.top_left.x}, {target.top_left.y}</div>
            <div>Size: {target.size.x} × {target.size.y}</div>
          </div>
        </div>
      ))}
      
      {targets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-2xl block mb-2">🎯</span>
          <p>No targets yet. Click "Add Target" to start.</p>
        </div>
      )}
    </div>
  </div>
);

// Component for YAML export
interface YAMLExportProps {
  template: Template;
  generateYAML: () => string;
}

const YAMLExport: React.FC<YAMLExportProps> = ({ template, generateYAML }) => {
  const [yamlText, setYamlText] = useState('');
  const [showYAML, setShowYAML] = useState(false);

  const handleExport = () => {
    const yaml = generateYAML();
    setYamlText(yaml);
    setShowYAML(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(yamlText);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export</h3>
      
      <div className="space-y-3">
        <Button 
          onClick={handleExport}
          disabled={!template.name || template.targets.length === 0}
          icon="📄"
        >
          Generate YAML
        </Button>
        
        {showYAML && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">YAML Output:</span>
              <Button onClick={copyToClipboard} size="sm" variant="secondary" icon="📋">
                Copy
              </Button>
            </div>
            <textarea
              className="w-full h-40 px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg resize-none"
              value={yamlText}
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Component for target overlays on the image
interface TargetOverlayProps {
  target: Target;
  index: number;
  isSelected: boolean;
  imageScale: number;
  onMouseDown: (e: React.MouseEvent, targetIndex: number, dragType: 'move' | 'resize') => void;
  onClick: () => void;
}

const TargetOverlay: React.FC<TargetOverlayProps> = ({
  target, index, isSelected, imageScale, onMouseDown, onClick
}) => (
  <div
    className={`absolute border-2 ${
      isSelected ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-red-500 bg-red-500 bg-opacity-10'
    } cursor-move`}
    style={{
      left: target.top_left.x * imageScale,
      top: target.top_left.y * imageScale,
      width: target.size.x * imageScale,
      height: target.size.y * imageScale,
    }}
    onClick={onClick}
    onMouseDown={(e) => onMouseDown(e, index, 'move')}
  >
    {/* Target label */}
    <div className={`absolute -top-6 left-0 px-2 py-1 text-xs font-medium rounded ${
      isSelected ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {target.friendly_name}
    </div>
    
    {/* Resize handle */}
    {isSelected && (
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown(e, index, 'resize');
        }}
      />
    )}
  </div>
);

// Component for YAML import
interface YAMLImportProps {
  yamlInput: string;
  setYamlInput: (value: string) => void;
  existingTemplates: string[];
  onImport: () => void;
  onLoadTemplate: (templateName: string) => void;
  onLoadSampleYAML: () => void;
}

const YAMLImport: React.FC<YAMLImportProps> = ({
  yamlInput, setYamlInput, existingTemplates, onImport, onLoadTemplate, onLoadSampleYAML
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Existing Template</h3>
    
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <Button 
          onClick={onLoadSampleYAML}
          size="sm"
          variant="secondary"
          icon="📄"
        >
          Load Sample YAML
        </Button>
      </div>
      
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>💡 How to use:</strong> Copy your <code className="bg-yellow-100 px-1 rounded">gomeme.yaml</code> content 
          from your server and paste it below, or click "Load Sample YAML" to see example templates.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YAML Content
        </label>
        <textarea
          className="w-full h-32 px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Paste your gomeme.yaml content or individual template YAML here..."
          value={yamlInput}
          onChange={(e) => setYamlInput(e.target.value)}
        />
      </div>
      
      <Button 
        onClick={onImport}
        disabled={!yamlInput.trim()}
        size="sm"
        variant="secondary"
        icon="🔍"
      >
        Parse Templates
      </Button>
      
      {existingTemplates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load Template ({existingTemplates.length} found)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {existingTemplates.map((templateName) => (
              <button
                key={templateName}
                onClick={() => onLoadTemplate(templateName)}
                className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-900">{templateName}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {yamlInput.trim() && existingTemplates.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          No templates found. Make sure your YAML is valid and contains template definitions.
        </div>
      )}
    </div>
  </div>
);

export default MemeEditor;