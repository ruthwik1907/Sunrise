import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Footer', () => {
  it('renders the Sunrise Hospital brand', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('Sunrise Hospital')).toBeInTheDocument();
  });

  it('renders quick links', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Find a Doctor')).toBeInTheDocument();
  });

  it('renders departments', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
    expect(screen.getByText('Neurology')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('info@Sunrise Hospital.com')).toBeInTheDocument();
  });
});
