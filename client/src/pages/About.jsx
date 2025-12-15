import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About NomadLand</h1>
        <p>Your global platform for travelers worldwide</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>What is NomadLand?</h2>
          <p>
            NomadLand is a comprehensive platform designed for travelers around the world. 
            We connect people with the best places to visit, explore, and experience authentic 
            local culture and adventures.
          </p>
          <p>
            NomadLand is built by travelers, for travelers. Every point of interest, review, 
            and recommendation comes from real experiences shared by our growing community. 
            Together, we're creating the most comprehensive resource for travelers worldwide.
          </p>
        </section>

        <section className="about-section">
          <h2>Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <h3>Interactive Maps</h3>
              <p>
                Explore regions worldwide with our interactive map system. Discover attractions, 
                restaurants, accommodation, and points of interest recommended by fellow travelers.
              </p>
            </div>
            <div className="feature-item">
              <h3>Personal Maps</h3>
              <p>
                Create and customize your own maps. Save your favorite spots, plan your routes, 
                and share your discoveries with the community.
              </p>
            </div>
            <div className="feature-item">
              <h3>Events & Meetups</h3>
              <p>
                Stay connected with the travel community. Find local events, cultural activities, 
                and social gatherings in your current or next destination.
              </p>
            </div>
            <div className="feature-item">
              <h3>Reviews & Ratings</h3>
              <p>
                Read authentic reviews from other travelers. Share your own experiences 
                to help others make informed decisions about where to visit and stay.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
