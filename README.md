# Properties App

A modern Next.js application for property search and management with tenant and landlord dashboards.

## Features

- 🏠 **Property Search**: Advanced search functionality with filters for location, bedrooms, and price
- 👥 **User Authentication**: Sign up and sign in with role-based access (tenant/landlord)
- 📊 **Dashboard**: Separate views for tenants and landlords with relevant information
- 🎨 **Modern UI**: Beautiful, responsive design using Material-UI (MUI)
- 🔍 **Property Cards**: Detailed property information with images and key details
- 📱 **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: Material-UI (MUI) 5.x
- **Styling**: Emotion (CSS-in-JS)
- **Icons**: Material-UI Icons
- **Forms**: React Hook Form 7.x
- **HTTP Client**: Axios 1.x
- **Authentication**: NextAuth.js (ready for integration)
- **Database**: Prisma (ready for integration)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd properties-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
properties-app/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── dashboard/        # Dashboard page
│   │   ├── search/          # Property search page
│   │   ├── layout.tsx       # Root layout with MUI theme
│   │   └── page.tsx         # Homepage
│   ├── components/
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── TenantView.tsx
│   │   │   └── LandlordView.tsx
│   │   ├── Navigation.tsx   # Navigation component
│   │   └── PropertyCard.tsx # Property card component
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── lib/                 # Utility functions
├── public/                  # Static assets
└── package.json
```

## Key Features

### Homepage
- Hero section with search functionality
- Advanced search form with location, bedrooms, and price filters
- Feature highlights using MUI Cards

### Property Search
- Grid layout of property cards using MUI Grid
- Real-time filtering
- Responsive design
- Property details with images

### Authentication
- Sign in and sign up pages with React Hook Form
- Role-based registration (tenant/landlord)
- Form validation and error handling
- Demo credentials available

### Dashboard
- **Tenant View**:
  - Saved properties
  - Application status
  - Recent activity
  - Search history

- **Landlord View**:
  - Property management
  - Application reviews
  - Revenue tracking
  - Occupancy rates

## Demo Credentials

For testing purposes, you can use these demo credentials:

- **Email**: demo@example.com
- **Password**: password

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Pages**: Add them to the `src/app` directory
2. **Components**: Create reusable components in `src/components` using MUI
3. **Types**: Define TypeScript interfaces in `src/types`
4. **Styling**: Use MUI's `sx` prop or styled components for custom styling

## MUI Theme Customization

The application uses a custom MUI theme defined in `src/app/layout.tsx`. You can customize:

- Color palette (primary, secondary colors)
- Typography
- Component default props
- Custom breakpoints

## Deployment

The application can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
