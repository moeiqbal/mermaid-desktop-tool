# YANG Explorer Guide - Mermaid & YANG Visualization Tool

## Overview

The YANG Explorer is a comprehensive feature for visualizing and analyzing YANG (Yet Another Next Generation) data modeling language files. YANG is used to model configuration and state data for network management protocols, making this tool invaluable for network engineers and developers working with NETCONF, RESTCONF, and other network management systems.

## Features

### YANG Model Parsing
- **Dual Parser System**: Primary node-yang library with basic regex-based fallback parser
- **Complete YANG Support**: All YANG 1.0 and 1.1 constructs including modules, containers, lists, leaves, RPCs, notifications
- **Dependency Analysis**: Import/include relationship mapping and validation
- **Error Reporting**: Line-by-line syntax error detection with detailed messages
- **Metadata Extraction**: Namespace, prefix, revision information extraction

### Interactive Tree Visualization
- **Hierarchical View**: Expandable/collapsible tree structure representing YANG model hierarchy
- **Visual Node Types**: Color-coded icons for different YANG constructs (modules, containers, lists, leaves, etc.)
- **Status Indicators**: Visual badges for mandatory fields, read-only configuration, deprecated status
- **Line Number References**: Direct mapping to source file line numbers for debugging
- **Search & Filter**: Real-time tree search with automatic expansion of matching nodes

### Comprehensive Properties Panel
- **Detailed Node Information**: Complete property display for selected YANG nodes
- **Type Constraints**: Range, length, pattern validation display
- **Metadata Display**: Description, default values, units, status information
- **Children Statistics**: Summary of child node types and counts
- **Debug Information**: Raw parsed data for development and troubleshooting

### File Management
- **Drag & Drop Upload**: Seamless .yang and .yin file upload interface
- **File Listing**: Organized view of all uploaded YANG models
- **Export Capabilities**: JSON export of parsed models and tree structures
- **Real-time Updates**: Immediate visualization updates after file operations

## How to Use

### Accessing YANG Explorer

1. **Navigate to YANG Explorer**: Click the "YANG Explorer" button in the main navigation
2. **Upload YANG Files**: Use the drag-and-drop area or click to browse for .yang/.yin files
3. **Select Model**: Click on any uploaded file to parse and visualize

### Exploring YANG Models

#### Tree Navigation
- **Expand Nodes**: Click the chevron icons (▶/▼) to expand/collapse containers
- **Select Nodes**: Click any node name to view its properties in the right panel
- **Search Tree**: Use the "Search in tree..." box to find specific nodes
- **Auto-expansion**: Search results automatically expand relevant tree branches

#### Properties Panel
- **Basic Properties**: View node type, line number, mandatory status, configuration state
- **Type Information**: See data types, constraints, default values, units
- **Constraints**: Visual display of range, length, and pattern restrictions
- **Children Summary**: Statistical overview of child nodes
- **Debug View**: Expandable raw data for technical analysis

#### Export Options
- **Export JSON**: Download complete parsed model data
- **Export Tree**: Download tree structure for external analysis
- **File Naming**: Automatic naming based on source file

### File Management Features

#### Upload Process
1. **Drag Files**: Drop .yang or .yin files onto the upload area
2. **Multi-file Support**: Upload multiple files simultaneously
3. **Progress Indication**: Visual feedback during upload process
4. **Error Handling**: Clear error messages for unsupported files or upload failures

#### File Operations
- **Search Files**: Filter file list by filename
- **Delete Files**: Hover over files to reveal delete button
- **File Information**: View file size and type indicators
- **Selection State**: Visual indication of currently selected file

## YANG Constructs Supported

### Core Elements
- **Module/Submodule**: Top-level YANG constructs with namespace and prefix support
- **Import/Include**: Dependency relationship parsing and visualization
- **Revision**: Version tracking and history display
- **Organization/Contact**: Metadata information extraction

### Data Definition Statements
- **Container**: Logical grouping of related data nodes
- **List**: Collection of similar data entries with key support
- **Leaf**: Individual data elements with type constraints
- **Leaf-list**: Collections of leaf elements
- **Choice/Case**: Alternative data structure selections
- **Uses/Grouping**: Reusable data structure definitions

### Schema Node Statements
- **Type**: Built-in and derived data types (int8-64, uint8-64, string, boolean, enumeration, etc.)
- **Default**: Default value specifications
- **Units**: Measurement unit descriptions
- **Description**: Human-readable documentation
- **Reference**: External documentation references

### Constraint Statements
- **Must**: XPath-based constraints
- **When**: Conditional presence statements
- **Mandatory**: Required field indicators
- **Config**: Configuration vs. state data classification
- **Status**: Current, deprecated, obsolete markings

### Operation Statements
- **RPC**: Remote procedure call definitions
- **Action**: Data node-specific operations
- **Notification**: Event and alarm definitions
- **Input/Output**: RPC parameter specifications

## Parser Architecture

### Primary Parser (node-yang)
- **Standards Compliant**: Full YANG 1.0/1.1 RFC compliance
- **Complete AST**: Abstract syntax tree with all language constructs
- **Type System**: Full type validation and constraint parsing
- **Error Detection**: Comprehensive syntax and semantic validation
- **Performance**: Optimized parsing for large models

### Fallback Parser (Basic Regex)
- **Robustness**: Handles malformed or non-standard YANG files
- **Fast Processing**: Lightweight parsing for quick previews
- **Essential Elements**: Covers core constructs (modules, containers, lists, leaves)
- **Error Recovery**: Continues parsing despite individual construct failures
- **Debugging Aid**: Useful for analyzing problematic YANG files

### Parsing Strategy
1. **Primary Attempt**: Try node-yang parser first for complete analysis
2. **Error Handling**: Capture and report detailed parser errors
3. **Fallback Activation**: Switch to basic parser if primary fails
4. **Result Merging**: Combine successful elements from both parsers when possible
5. **Quality Indication**: Show which parser was used for transparency

## Technical Implementation

### Frontend Architecture
- **React Components**: Modular tree and properties panel components
- **TypeScript**: Full type safety for YANG data structures
- **State Management**: Efficient handling of large tree structures
- **Virtual Scrolling**: Performance optimization for large models
- **Search Algorithms**: Optimized tree traversal for quick searches

### Backend Processing
- **Express Routes**: RESTful API for YANG operations
- **Node.js Integration**: Seamless integration with node-yang library
- **Error Handling**: Comprehensive error reporting and recovery
- **File Management**: Secure upload and storage handling
- **API Design**: Clean separation between parsing and visualization

### Data Structures
```typescript
interface YangNode {
  type: string                    // YANG construct type
  name: string                    // Node identifier
  line?: number                   // Source line reference
  description?: string            // Documentation
  mandatory?: boolean             // Required field flag
  config?: boolean               // Configuration vs state
  properties?: {                 // Type-specific properties
    type?: string                // Data type
    default?: string             // Default value
    units?: string               // Measurement units
    status?: string              // Current/deprecated/obsolete
    range?: string               // Numeric constraints
    length?: string              // String constraints
    pattern?: string             // Regex patterns
  }
  children?: YangNode[]          // Child nodes
}
```

## Best Practices

### YANG Model Development
1. **Use Descriptive Names**: Choose clear, meaningful names for all constructs
2. **Add Documentation**: Include description statements for all major elements
3. **Follow Conventions**: Use consistent naming patterns across modules
4. **Version Control**: Always include revision statements with dates
5. **Validate Early**: Use the explorer to catch syntax errors during development

### Model Analysis
1. **Start with Overview**: Use the tree view to understand overall structure
2. **Check Dependencies**: Review import/include relationships
3. **Validate Constraints**: Examine type restrictions and mandatory fields
4. **Search Strategically**: Use search to locate specific constructs quickly
5. **Export for Documentation**: Generate JSON exports for external tools

### Performance Optimization
1. **Large Models**: Use search to navigate large YANG files efficiently
2. **Batch Analysis**: Upload related models together for dependency analysis
3. **Regular Cleanup**: Remove unused files to improve interface responsiveness
4. **Export Strategy**: Export intermediate results for complex analysis workflows

## Troubleshooting

### Common Issues

#### "Failed to parse YANG file"
- **Syntax Errors**: Check for missing braces, semicolons, or quotes
- **Encoding Issues**: Ensure files are UTF-8 encoded
- **YANG Version**: Verify YANG version compatibility
- **Missing Dependencies**: Check if imported modules are available

#### "No modules found"
- **File Format**: Confirm files have .yang or .yin extensions
- **Module Declaration**: Verify module/submodule statements are present
- **Case Sensitivity**: Check for case-sensitive filename requirements
- **File Corruption**: Re-upload files if parsing consistently fails

#### "Search not working"
- **Query Length**: Ensure search terms are at least 2 characters
- **Special Characters**: Avoid special regex characters in searches
- **Tree State**: Manually expand nodes if auto-expansion fails
- **Case Matching**: Search is case-insensitive by default

#### "Properties panel empty"
- **Node Selection**: Ensure a tree node is actually selected
- **Parsing Status**: Check if the file parsed successfully
- **Browser Refresh**: Refresh page if panel becomes unresponsive
- **File Reselection**: Try selecting a different file and returning

### Debugging Tips

1. **Check Error Messages**: Read detailed error messages in the interface
2. **Use Debug View**: Expand debug information in properties panel
3. **Try Fallback Parser**: If node-yang fails, basic parser might work
4. **Validate Externally**: Use external YANG validators for comparison
5. **Check File Encoding**: Ensure proper character encoding
6. **Browser Console**: Check browser developer tools for JavaScript errors

### Performance Issues

1. **Large Files**: Break large YANG files into smaller modules
2. **Memory Usage**: Refresh page if interface becomes slow
3. **Network Speed**: Consider local installation for large file operations
4. **Browser Cache**: Clear cache if experiencing persistent issues

## API Reference

### Endpoints

#### GET /api/files
List all uploaded files including YANG models
```json
{
  "files": [
    {
      "id": "timestamp_filename.yang",
      "name": "filename.yang",
      "type": "yang",
      "size": 12345,
      "modified": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/yang/parse
Parse single YANG file
```json
{
  "content": "module example { ... }",
  "filename": "example.yang"
}
```

Response:
```json
{
  "valid": true,
  "tree": { "module_name": { ... } },
  "modules": [{ ... }],
  "errors": [],
  "metadata": {
    "imports": ["other-module"],
    "namespace": "http://example.com/yang/example",
    "prefix": "ex"
  },
  "parser": "node-yang"
}
```

#### POST /api/yang/parse-multiple
Parse multiple YANG files with dependency analysis
```json
{
  "files": [
    {
      "name": "module1.yang",
      "content": "module module1 { ... }"
    },
    {
      "name": "module2.yang",
      "content": "module module2 { ... }"
    }
  ]
}
```

## Integration Examples

### Network Configuration Management
- **NETCONF Analysis**: Visualize configuration schemas
- **RESTCONF API Design**: Understand data model structure
- **OpenConfig Exploration**: Navigate standardized models
- **Vendor Model Analysis**: Compare different vendor implementations

### Development Workflows
- **Model Design**: Interactive development and testing
- **Code Generation**: Prepare for automatic code generation tools
- **Documentation**: Generate visual documentation from models
- **Validation**: Pre-deployment model validation

### Educational Use
- **YANG Learning**: Interactive exploration of YANG concepts
- **Model Examples**: Study well-designed YANG modules
- **Syntax Reference**: Visual guide to YANG constructs
- **Best Practices**: Learn from standardized models

---

## Summary

The YANG Explorer provides comprehensive visualization and analysis capabilities for YANG data models, making it an essential tool for network engineers, developers, and anyone working with modern network management systems. Its intuitive interface, powerful parsing capabilities, and detailed property inspection make complex YANG models accessible and understandable.

For additional support or feature requests, refer to the project documentation or submit issues through the appropriate channels.