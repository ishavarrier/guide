# MidPoint Finder

## Overview

MidPoint Finder is a full-stack web application that helps users find the perfect meeting spot between two locations. Users can enter two addresses and discover nearby places like cafes, restaurants, parks, and entertainment venues at the calculated midpoint. The application provides a clean, modern interface with place type filtering and detailed location information including ratings and distances.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **UI Components**: Comprehensive set of Radix UI primitives wrapped in custom components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful endpoints with structured JSON responses
- **Validation**: Zod schemas shared between client and server for consistent data validation
- **Development Setup**: Hot module replacement and development middleware integrated

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **ORM**: Drizzle for type-safe database operations
- **Schema Management**: Centralized schema definitions in shared directory
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment

### Core Features Implementation
- **Geolocation Services**: Google Maps API integration for address geocoding and place search
- **Midpoint Calculation**: Mathematical calculation using spherical geometry for accurate midpoints
- **Place Discovery**: Google Places API for finding nearby businesses and points of interest
- **Filtering System**: Multi-select place type filters (cafes, restaurants, parks, gas stations, shopping, entertainment)
- **Distance Calculations**: Haversine formula implementation for calculating distances between coordinates

### Authentication and Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Security**: Environment-based API key management for external services

## External Dependencies

### Third-Party Services
- **Google Maps API**: Provides geocoding services to convert addresses to coordinates
- **Google Places API**: Returns nearby businesses and points of interest with ratings and details
- **Neon Database**: Serverless PostgreSQL database hosting

### Key Libraries
- **Drizzle ORM**: Type-safe database operations and migrations
- **React Query**: Efficient server state management and caching
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Form state management and validation
- **shadcn/ui**: Pre-built accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled accessible UI primitives

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking across the entire codebase
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clean separation between client and server concerns.