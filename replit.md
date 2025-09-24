# Overview

This is a comprehensive AI chat platform called WhisperChat that enables users to create, discover, and interact with AI characters through immersive roleplay conversations. The platform features character creation tools, chat interfaces with advanced formatting systems, adventure game modes, and social features like following creators and favoriting characters.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 15 with TypeScript and React Server Components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React hooks with local component state and localStorage for persistence
- **Routing**: Next.js App Router for page-based navigation

## Core Features & Components

### Character Management
- **Character Creation**: Multi-step form with image upload, personality definition, and scenario setting
- **Character Storage**: localStorage-based persistence with import/export capabilities
- **Character Cards**: Lazy-loaded character previews with favorite/like functionality

### Chat System
- **Message Formatting**: Advanced text parsing system that distinguishes between actions (*text*), dialogue ("text"), thoughts (text), and narration
- **Real-time Chat**: Simulated AI responses with typing indicators and response regeneration
- **Chat History**: Persistent conversation storage with recent chats management
- **Response Variations**: Multiple AI response generation with navigation between variants

### Advanced Chat Features
- **Scene Management**: Customizable chat backgrounds and atmospheric settings
- **Persona System**: User persona creation and switching during conversations
- **Group Chat**: Multi-character conversation support
- **Memory System**: Conversation memory saving and retrieval with categorization

### Social Features
- **Creator Following**: Follow/unfollow character creators with notification system
- **Character Interactions**: Favorite, like, and review characters
- **Personal Collections**: Organize favorite characters and creators
- **Notification System**: Real-time notifications for follows, likes, and comments

### Adventure Mode
- **RPG Integration**: Text-based adventure game with character stats and inventory
- **OpenRouter AI**: Integration with multiple AI models for adventure narration
- **Game State**: Persistent player progression and quest management

## Performance Optimizations
- **Lazy Loading**: Images and components load on-demand using Intersection Observer
- **Infinite Scroll**: Progressive content loading with performance monitoring
- **Optimized Input**: Debounced input handling to prevent lag during typing
- **Memory Management**: Cleanup of event listeners and performance monitoring

## Theme System
- **Dark/Light Mode**: System-aware theme switching with next-themes
- **Custom Color Schemes**: Multiple predefined color palettes
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Persistence
- **localStorage**: Client-side storage for characters, chats, settings, and user preferences
- **Real-time Updates**: Event-driven updates across components using custom events
- **Settings Management**: Unified settings system for chat preferences and accessibility

# External Dependencies

## UI Framework
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **next-themes**: Theme provider for dark/light mode switching
- **lucide-react**: Icon library for consistent iconography

## Utilities
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx & tailwind-merge**: Utility for conditional CSS class composition
- **date-fns**: Date formatting and manipulation utilities

## Development Tools
- **TypeScript**: Static type checking for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **ESLint**: Code linting and style enforcement

## Future Integrations
- **OpenRouter API**: AI model access for enhanced chat responses (API key configuration ready)
- **Vercel Analytics**: Performance monitoring and user analytics
- **Database Integration**: Ready for migration from localStorage to proper database (Drizzle ORM configured)