
# Data Alchemist 🧪✨

**AI-Powered Spreadsheet Cleanup Assistant for Non-Technical Users**

Data Alchemist is a modern web application that transforms messy spreadsheet data into clean, validated, and rule-governed datasets using the power of AI and intuitive user interfaces.

## 🎯 Features

### Core Functionality
- **Multi-Format File Support**: Upload and parse CSV and Excel files
- **Interactive Data Grids**: Real-time inline editing with validation feedback
- **Smart Validation**: Comprehensive error detection and reporting
- **AI-Powered Queries**: Natural language data filtering and search
- **Visual Rule Builder**: Create complex business rules through intuitive UI
- **Export System**: Generate clean data and structured rule configurations

### AI-Enhanced Capabilities
- **Natural Language Processing**: Query your data using plain English
- **Rule Generation**: Convert natural language descriptions into structured rules
- **Smart Suggestions**: AI-powered recommendations for data cleanup
- **Validation Intelligence**: Context-aware error detection and fixes

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **File Processing**: Papa Parse (CSV) + SheetJS (Excel)
- **AI Integration**: OpenAI API ready (requires API key)
- **State Management**: React Query + React Hooks
- **Build Tool**: Vite with Hot Module Replacement

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── FileUpload.tsx   # Drag & drop file handling
│   ├── DataGrid.tsx     # Interactive data table
│   ├── ValidationSummary.tsx  # Error reporting
│   ├── AIQueryInterface.tsx   # Natural language queries
│   └── RuleBuilder.tsx  # Visual rule creation
├── pages/
│   ├── Index.tsx        # Main application page
│   └── NotFound.tsx     # 404 page
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── types/               # TypeScript definitions

public/
└── samples/            # Example CSV files
    ├── clients.csv
    ├── workers.csv
    └── tasks.csv
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd data-alchemist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:8080`

## 📊 Sample Data

The application comes with three sample CSV files in `/public/samples/`:

- **clients.csv**: Client information with project assignments
- **workers.csv**: Employee data with skills and availability
- **tasks.csv**: Project tasks with dependencies and assignments

### Data Schema

#### Clients
- ClientID, Name, Email, Industry, ProjectType, ContactPerson, PhoneNumber, TaskIDs

#### Workers  
- WorkerID, Name, Email, Skills, MaxLoadPerPhase, CurrentLoad, Availability, Department, HourlyRate

#### Tasks
- TaskID, Name, ClientID, AssignedWorkerID, EstimatedHours, ActualHours, Status, Priority, Phases, PreferredPhase, Dependencies, Skills

## 🎨 Key Features Walkthrough

### 1. File Upload & Processing
- Drag & drop interface for CSV/Excel files
- Real-time processing with progress indicators
- Automatic data type detection and validation

### 2. Interactive Data Grid
- Inline editing capabilities
- Visual error highlighting
- Cell-level validation feedback
- Pagination for large datasets

### 3. Validation System
- Cross-file reference checking
- Duplicate ID detection
- Required field validation
- Data type validation
- Custom business rule validation

### 4. AI Query Interface
- Natural language data filtering
- Query suggestions and history
- Intelligent result presentation
- Context-aware search

### 5. Rule Builder
- Visual rule creation interface
- Natural language to rule conversion
- Rule prioritization and management
- JSON export functionality

## 🔮 AI Integration Setup

To enable full AI capabilities:

1. **Get OpenAI API Key**
   - Sign up at [OpenAI Platform](https://platform.openai.com)
   - Generate an API key

2. **Configure AI Features**
   - The app is ready for OpenAI integration
   - Add your API key through the interface
   - Enable natural language processing features

## 📦 Build & Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (Recommended)
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Alternative Deployment Options**
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront
   - Any static hosting service

## 🎯 Target Users

**Non-technical business users** who need to:
- Clean and validate complex spreadsheet data
- Create business rules without coding
- Query data using natural language
- Export clean, structured data for other systems

## 🚀 Getting Started

1. **Upload Data**: Start by uploading your CSV or Excel files
2. **Review Validation**: Check the validation summary for any errors
3. **Query Data**: Use natural language to explore your data
4. **Create Rules**: Build business rules using the visual interface
5. **Export Results**: Download clean data and rule configurations

## 📈 Future Enhancements

- Real-time collaboration features
- Advanced AI data correction suggestions
- Integration with popular business tools
- Custom validation rule scripting
- Data visualization dashboard
- Automated report generation

## 🤝 Contributing

This project was built as part of a Software Engineering Internship assignment. Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using React, TypeScript, and AI**
