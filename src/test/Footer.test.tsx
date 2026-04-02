import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Footer', () => {
  it('renders the MediCare brand', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText('MediCare')).toBeInTheDocument();
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
    expect(screen.getByText('info@medicare.com')).toBeInTheDocument();
  });
});