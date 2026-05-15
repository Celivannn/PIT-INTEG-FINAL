import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getRoomTypes } from '../api/rooms';

export default function HomePage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [roomTypeImages, setRoomTypeImages] = useState({});
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(0);
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Complete hotel experience photos with ALL amenities
  const experiencePhotos = [
    {
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&h=200&fit=crop",
      title: "Infinity Pool",
      description: "Stunning rooftop infinity pool with panoramic city views and swim-up bar",
      icon: "🏊",
      features: ["Heated pool", "Poolside service", "Sun loungers", "Evening lighting"]
    },
    {
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop",
      title: "Fine Dining",
      description: "Exquisite culinary journey at our signature restaurant featuring international cuisine",
      icon: "🍽️",
      features: ["Michelin-starred chefs", "Wine cellar", "Private dining", "Seasonal menus"]
    },
    {
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop",
      title: "Luxury Spa",
      description: "Rejuvenating spa treatments in a serene sanctuary with professional therapists",
      icon: "🧖",
      features: ["Massage therapy", "Facial treatments", "Sauna & steam", "Relaxation lounge"]
    },
    {
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop",
      title: "Fitness Center",
      description: "State-of-the-art fitness center with premium equipment and personal trainers",
      icon: "💪",
      features: ["Modern equipment", "Personal trainers", "Yoga studio", "24/7 access"]
    },
    {
      image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=300&h=200&fit=crop",
      title: "Rooftop Bar",
      description: "Signature cocktails and premium spirits with breathtaking sunset views",
      icon: "🍸",
      features: ["Craft cocktails", "Live DJ", "Panoramic views", "Happy hour specials"]
    },
    {
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=300&h=200&fit=crop",
      title: "Event Spaces",
      description: "Elegant venues for weddings, conferences, and special celebrations",
      icon: "🎉",
      features: ["Ballroom", "Meeting rooms", "A/V equipment", "Catering services"]
    },
    {
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop",
      title: "Business Center",
      description: "Fully-equipped business center for corporate travelers",
      icon: "💼",
      features: ["Workstations", "Printing services", "Meeting pods", "High-speed WiFi"]
    },
    {
  image: "https://images.pexels.com/photos/5699459/pexels-photo-5699459.jpeg?w=1200&h=800&fit=crop",
  thumbnail: "https://images.pexels.com/photos/5699459/pexels-photo-5699459.jpeg?w=300&h=200&fit=crop",
  title: "Concierge Service",
  description: "Dedicated concierge team for personalized guest services",
  icon: "🔑",
  features: ["Tour booking", "Transportation", "Restaurant reservations", "Luggage storage"]
   }
  ];

  // Room image mapping with actual beautiful room photos
  const roomImageMap = {
    standard: {
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
      mobileImage: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop",
      alt: "Luxury Standard Room with king bed and modern amenities"
    },
    deluxe: {
      image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
      mobileImage: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop",
      alt: "Spacious Deluxe Room with panoramic windows and premium furnishings"
    },
    suite: {
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
      mobileImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      alt: "Presidential Suite with separate living area and luxury amenities"
    },
    premier: {
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop",
      mobileImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop",
      alt: "Premier Room with elegant design and city views"
    },
    executive: {
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      mobileImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
      alt: "Executive Suite with workspace and premium amenities"
    },
    family: {
      image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop",
      mobileImage: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop",
      alt: "Family Room with multiple beds and kid-friendly amenities"
    }
  };

  // Fetch room types on component mount
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const { data } = await getRoomTypes();
        const types = data.results || data;
        setRoomTypes(types);
        
        // Generate images for each room type with actual photos
        const images = {};
        types.forEach(type => {
          const name = type.name.toLowerCase();
          const defaultImage = roomImageMap[name] || roomImageMap.standard;
          
          images[type.id] = {
            image: defaultImage.image,
            mobileImage: defaultImage.mobileImage,
            alt: defaultImage.alt,
            accent: name === 'standard' ? '#667eea' : name === 'deluxe' ? '#f5576c' : name === 'suite' ? '#4facfe' : '#43e97b',
            icon: name === 'standard' ? '🛏️' : name === 'deluxe' ? '✨' : name === 'suite' ? '👑' : '🏨'
          };
        });
        setRoomTypeImages(images);
      } catch (error) {
        console.error('Error fetching room types:', error);
      } finally {
        setTypesLoading(false);
      }
    };
    fetchRoomTypes();
  }, []);

  // Mouse move effect for hero section
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate experience photos
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedFeature((prev) => (prev + 1) % experiencePhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Format price
  const formatPrice = (price) => `₱${Number(price).toLocaleString()}/night`;

  // Get room description
  const getRoomDescription = (typeName) => {
    const name = typeName.toLowerCase();
    if (name === 'standard') {
      return 'Elegantly designed spaces that blend comfort with contemporary sophistication.';
    } else if (name === 'deluxe') {
      return 'Luxuriously appointed rooms featuring premium amenities and breathtaking vistas.';
    } else if (name === 'suite') {
      return 'The epitome of luxury with separate living areas and exclusive butler service.';
    }
    return `Experience unparalleled luxury in our ${typeName} rooms with bespoke amenities.`;
  };

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* Hero Section - Premium Glassmorphism */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 20% 50%, #0a0f2a 0%, #060914 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Animated gradient orbs */}
        <div style={{
          position: 'absolute',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)',
          top: '20%',
          left: '-10%',
          animation: 'floatOrb 8s ease-in-out infinite',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,87,108,0.3) 0%, transparent 70%)',
          bottom: '10%',
          right: '-5%',
          animation: 'floatOrb 10s ease-in-out infinite reverse',
          filter: 'blur(80px)'
        }} />
        <div style={{
          position: 'absolute',
          width: '30vw',
          height: '30vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,172,254,0.2) 0%, transparent 70%)',
          top: '50%',
          right: '20%',
          animation: 'floatOrb 12s ease-in-out infinite',
          filter: 'blur(60px)'
        }} />

        {/* Mouse-following glow */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.1s ease-out',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '900px'
        }}>
          {/* Premium badge */}
          <div style={{
            display: 'inline-block',
            padding: '8px 24px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px',
            animation: 'fadeInDown 0.8s ease'
          }}>
            <span style={{
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              color: '#c9a84c',
              textTransform: 'uppercase',
              fontWeight: 500
            }}>
              ★ Five-Star Hospitality ★
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 600,
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #ffffff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-0.02em',
            animation: 'fadeInUp 0.8s ease'
          }}>
            Where Luxury
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #c9a84c, #ffd700, #c9a84c)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontStyle: 'italic'
            }}>
              Meets Comfort
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
            maxWidth: '600px',
            margin: '0 auto 48px',
            animation: 'fadeInUp 0.8s ease 0.2s backwards'
          }}>
            Experience the pinnacle of elegance in the heart of Cagayan de Oro, 
            where every detail is crafted for your ultimate comfort.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.8s ease 0.4s backwards'
          }}>
            <button
              onClick={() => scrollToSection('rooms')}
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                border: 'none',
                borderRadius: '50px',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(201,168,76,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(201,168,76,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(201,168,76,0.3)';
              }}
            >
              Explore Suites
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{
                padding: '16px 40px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50px',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Discover More ↓
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          onClick={() => scrollToSection('features')}
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            cursor: 'pointer',
            animation: 'bounce 2s infinite'
          }}
        >
          <div style={{
            width: '30px',
            height: '50px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '30px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '4px',
              height: '10px',
              background: '#c9a84c',
              borderRadius: '2px',
              animation: 'scrollIndicator 2s infinite'
            }} />
          </div>
        </div>
      </section>

      {/* Features Section - With Complete Hotel Photos */}
      <section id="features" style={{
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(102,126,234,0.1)',
              borderRadius: '100px',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#667eea',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              Why Choose Us
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 600,
              color: '#1a1a2e',
              marginBottom: '16px'
            }}>
              The Grand Azure Experience
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Discover world-class amenities and unforgettable experiences
            </p>
          </div>

          {/* Main Feature Image Showcase */}
          <div style={{
            marginBottom: '60px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <div style={{
              position: 'relative',
              height: '500px',
              overflow: 'hidden'
            }}>
              <img
                src={experiencePhotos[selectedFeature].image}
                alt={experiencePhotos[selectedFeature].title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                padding: '40px 30px 30px',
                color: 'white'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '10px'
                }}>
                  {experiencePhotos[selectedFeature].icon}
                </div>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 600,
                  marginBottom: '10px'
                }}>
                  {experiencePhotos[selectedFeature].title}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  opacity: 0.9,
                  marginBottom: '15px'
                }}>
                  {experiencePhotos[selectedFeature].description}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}>
                  {experiencePhotos[selectedFeature].features.map((feature, idx) => (
                    <span key={idx} style={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      padding: '4px 12px',
                      borderRadius: '100px',
                      fontSize: '0.8rem'
                    }}>
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Thumbnails Gallery */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '60px'
          }}>
            {experiencePhotos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedFeature(idx)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  transform: selectedFeature === idx ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedFeature === idx ? '0 10px 30px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.1)',
                  border: selectedFeature === idx ? '2px solid #c9a84c' : '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  if (selectedFeature !== idx) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div style={{ position: 'relative', height: '130px', overflow: 'hidden' }}>
                  <img
                    src={photo.thumbnail}
                    alt={photo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    padding: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem' }}>{photo.icon}</div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'white',
                      fontWeight: 500,
                      marginTop: '4px'
                    }}>
                      {photo.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            {experiencePhotos.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '25px',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.2)',
                  animation: `fadeInUp 0.6s ease ${idx * 0.05}s backwards`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setSelectedFeature(idx)}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '15px',
                  display: 'inline-block',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0)'}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#1a1a2e',
                  marginBottom: '10px'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.9rem', marginBottom: '15px' }}>
                  {feature.description}
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  {feature.features.slice(0, 2).map((item, i) => (
                    <span key={i} style={{
                      fontSize: '0.7rem',
                      color: '#c9a84c',
                      background: 'rgba(201,168,76,0.1)',
                      padding: '3px 8px',
                      borderRadius: '100px'
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section - With Actual Room Images */}
      <section id="rooms" style={{
        padding: '100px 24px',
        background: '#ffffff',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(255,215,0,0.1))',
              borderRadius: '100px',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#c9a84c',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              Luxurious Accommodations
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 600,
              color: '#1a1a2e',
              marginBottom: '16px'
            }}>
              Our Signature Rooms
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Each room is meticulously designed for the discerning traveler
            </p>
          </div>

          {typesLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: '500px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                  animation: 'shimmer 2s infinite'
                }} />
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '40px'
            }}>
              {roomTypes.map((type, idx) => {
                const style = roomTypeImages[type.id] || {
                  image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
                  mobileImage: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop",
                  accent: '#667eea',
                  icon: '🏨',
                  alt: 'Luxury hotel room'
                };
                return (
                  <div
                    key={type.id}
                    style={{
                      borderRadius: '24px',
                      overflow: 'hidden',
                      background: 'white',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      cursor: 'pointer',
                      animation: `fadeInUp 0.6s ease ${idx * 0.1}s backwards`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-15px)';
                      e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                    }}
                  >
                    {/* Card Image Area - Actual Room Photos */}
                    <div style={{
                      height: '280px',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: '#f0f0f0'
                    }}>
                      <picture>
                        <source 
                          media="(max-width: 768px)" 
                          srcSet={style.mobileImage || style.image}
                        />
                        <img
                          src={style.image}
                          alt={style.alt || `${type.name} room at Grand Azure Hotel`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                      </picture>
                      
                      {/* Overlay Gradient */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '100px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                      }} />
                      
                      {/* Price Tag */}
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.95)',
                        padding: '8px 16px',
                        borderRadius: '100px',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}>
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#999',
                          textDecoration: 'line-through',
                          display: 'block'
                        }}>
                          ₱{(Number(type.base_price) * 1.3).toLocaleString()}
                        </span>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: style.accent
                        }}>
                          {formatPrice(type.base_price)}
                        </span>
                      </div>

                      {/* Badge */}
                      {idx === 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '20px',
                          left: '20px',
                          background: 'rgba(0,0,0,0.8)',
                          backdropFilter: 'blur(10px)',
                          padding: '6px 14px',
                          borderRadius: '100px',
                          fontSize: '0.7rem',
                          color: '#c9a84c',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}>
                          ★ MOST POPULAR
                        </div>
                      )}

                      {/* Room Icon Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>
                        {style.icon}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '30px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <h3 style={{
                          fontSize: '1.6rem',
                          fontWeight: 600,
                          color: '#1a1a2e',
                          textTransform: 'capitalize'
                        }}>
                          {type.name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#ffd700'
                        }}>
                          <span>★★★★★</span>
                          <span style={{ fontSize: '0.8rem', color: '#999' }}>({Math.floor(Math.random() * 200) + 50})</span>
                        </div>
                      </div>

                      <p style={{
                        color: '#666',
                        lineHeight: 1.7,
                        marginBottom: '20px',
                        fontSize: '0.95rem'
                      }}>
                        {type.description || getRoomDescription(type.name)}
                      </p>

                      {/* Key Features */}
                      <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '20px',
                        padding: '15px 0',
                        borderTop: '1px solid #f0f0f0',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>👥</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>{type.capacity} Guests</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>🛏️</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>King Bed</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>📶</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>Free WiFi</div>
                        </div>
                      </div>

                      {/* Amenities */}
                      {type.amenities && type.amenities.length > 0 && (
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                          marginBottom: '25px'
                        }}>
                          {type.amenities.slice(0, 3).map(amenity => (
                            <span key={amenity} style={{
                              padding: '4px 12px',
                              background: 'linear-gradient(135deg, #f5f5f5, #fafafa)',
                              borderRadius: '100px',
                              fontSize: '0.75rem',
                              color: '#666'
                            }}>
                              {amenity}
                            </span>
                          ))}
                          {type.amenities.length > 3 && (
                            <span style={{
                              fontSize: '0.75rem',
                              color: style.accent,
                              fontWeight: 500
                            }}>
                              +{type.amenities.length - 3} more amenities
                            </span>
                          )}
                        </div>
                      )}

                      <Link
                        to={`/rooms/${type.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '14px 28px',
                          background: `linear-gradient(135deg, ${style.accent}CC, ${style.accent})`,
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '100px',
                          fontWeight: 600,
                          transition: 'all 0.3s',
                          width: '100%',
                          justifyContent: 'center',
                          fontSize: '0.95rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.gap = '15px';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = `0 5px 15px ${style.accent}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.gap = '10px';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        View Room Details
                        <span style={{ fontSize: '1.2rem' }}>→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Premium CTA Section */}
      <section style={{
        padding: '120px 24px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23c9a84c" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1
        }} />

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '20px',
            animation: 'float 3s ease-in-out infinite'
          }}>
            ✨
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 600,
            color: 'white',
            marginBottom: '20px'
          }}>
            Begin Your Journey
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '40px',
            lineHeight: 1.8
          }}>
            Experience the height of luxury and create unforgettable memories at Grand Azure
          </p>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/rooms"
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #c9a84c, #b8923e)',
                borderRadius: '100px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(201,168,76,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View Available Rooms
            </Link>
            <Link
              to="/contact"
              style={{
                padding: '16px 40px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '100px',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Contact Concierge
            </Link>
          </div>

          {/* Trust indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginTop: '60px',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: '✓', text: 'Best Rate Guarantee' },
              { icon: '✓', text: 'Free Cancellation' },
              { icon: '✓', text: '24/7 Concierge' }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: '#c9a84c', fontWeight: 'bold' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes floatOrb {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          50% {
            transform: translateY(10px) translateX(-50%);
          }
        }
        
        @keyframes scrollIndicator {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>

      {/* Global styles */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Poppins', 'Roboto', sans-serif;
          overflow-x: hidden;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #c9a84c, #b8923e);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #b8923e, #a07d32);
        }
      `}</style>
    </div>
  );
}