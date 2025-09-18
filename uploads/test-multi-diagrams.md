# Multi-Diagram Test Document

This document contains multiple Mermaid diagrams to test the multi-diagram support feature.

## System Architecture

```mermaid
graph TB
    subgraph "Frontend"
        A[React App] --> B[Components]
        B --> C[Views]
        C --> D[MermaidViewer]
        C --> E[YangExplorer]
    end

    subgraph "Backend"
        F[Express Server] --> G[API Routes]
        G --> H[File Management]
        G --> I[Diagram Processing]
    end

    A -->|HTTP/REST| F
    D -->|Render| J[Mermaid Diagrams]
    E -->|Parse| K[YANG Models]
```

## User Flow Diagram

The following diagram shows the user interaction flow:

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as Storage

    U->>F: Upload file
    F->>B: POST /api/files/upload
    B->>S: Save file
    S-->>B: File saved
    B-->>F: Upload success
    F-->>U: Show file list

    U->>F: Select file
    F->>B: GET /api/files/:id/content
    B->>S: Read file
    S-->>B: File content
    B-->>F: Return content
    F->>F: Extract diagrams
    F-->>U: Display diagrams
```

## Database Schema

```mermaid
erDiagram
    FILE ||--o{ DIAGRAM : contains
    FILE {
        string id PK
        string name
        string type
        int size
        datetime modified
    }
    DIAGRAM {
        string id PK
        string file_id FK
        string content
        string title
        int index
        int startLine
        int endLine
    }
    USER ||--o{ FILE : uploads
    USER {
        string id PK
        string username
        string email
        datetime created
    }
```

## State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : Select File
    Loading --> Displaying : File Loaded
    Loading --> Error : Load Failed
    Displaying --> Idle : Clear Selection
    Displaying --> FullScreen : Open Full Screen
    FullScreen --> Displaying : Exit Full Screen
    Error --> Idle : Retry
    Error --> Loading : Select Different File
```

## Project Timeline

```mermaid
gantt
    title Enhancement Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Multi-Diagram Support    :done, p1, 2025-01-01, 3d
    Full-Screen Mode         :done, p2, after p1, 2d
    Testing                  :active, p3, after p2, 2d
    section Phase 2
    Responsive UI            :p4, after p3, 3d
    Text Management          :p5, after p4, 2d
    section Phase 3
    YANG Error Handling      :p6, after p5, 3d
    section Phase 4
    Swagger Integration      :p7, after p6, 2d
    Final Testing           :p8, after p7, 3d
```

## Component Hierarchy

```mermaid
flowchart TD
    App[App.tsx]
    App --> Header
    App --> Routes
    Routes --> MermaidViewer
    Routes --> YangExplorer
    Routes --> FullScreenDiagram

    MermaidViewer --> FileList
    MermaidViewer --> MultiDiagramViewer
    MermaidViewer --> MermaidDiagram

    MultiDiagramViewer --> DiagramNavigator
    MultiDiagramViewer --> DiagramItem
    DiagramItem --> MermaidDiagram

    FullScreenDiagram --> MermaidDiagram
    FullScreenDiagram --> NavigationControls
```

## Class Diagram

```mermaid
classDiagram
    class DiagramMetadata {
        +string content
        +number index
        +string title
        +number startLine
        +number endLine
        +string rawBlock
    }

    class MultiDiagramViewer {
        +DiagramMetadata[] diagrams
        +string fileId
        +string fileName
        +scrollToDiagram(index)
        +handleKeyPress(event)
    }

    class MermaidDiagram {
        +string definition
        +renderDiagram()
        +handleZoom()
        +handleExport()
    }

    class FullScreenDiagram {
        +string fileId
        +number diagramIndex
        +loadDiagrams()
        +navigateToDiagram()
    }

    MultiDiagramViewer --> DiagramMetadata : uses
    MultiDiagramViewer --> MermaidDiagram : renders
    FullScreenDiagram --> DiagramMetadata : loads
    FullScreenDiagram --> MermaidDiagram : displays
```

## Mind Map

```mermaid
mindmap
  root((Mermaid Tool))
    Features
      Multi-Diagram Support
      Full-Screen Mode
      Diagram Navigation
      Export Options
    Components
      MermaidViewer
      MultiDiagramViewer
      FullScreenDiagram
      DiagramNavigator
    Testing
      Unit Tests
      Integration Tests
      E2E Tests
      Performance Tests
```

## End of Document

This completes the test document with 8 different Mermaid diagrams of various types.