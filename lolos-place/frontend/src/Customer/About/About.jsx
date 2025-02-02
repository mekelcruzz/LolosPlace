import React from 'react';
import './About.css'; // Update the stylesheet reference
import MainLayout from '../../components/MainLayout';
import pic3 from '../../assets/lolos-place3.jpeg';

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="about-page"> {/* Scoped class name for the About page */}
  <section id="about" className="about-section"> {/* Updated section ID and class */}
    <div className="text-content">
      <h1>About Lolo's Place</h1>
      <p className="description">
        Welcome to Lolo's Place, your go-to spot for comfort food and good company in Sitio Maligaya, Cuta, Batangas City. Established in 2017, Lolo's Place started with a humble selection of Filipino comfort dishes and has since grown to cater to a wider audience while staying true to its roots.
      </p>
      <p className="description">
        In 2020, amidst the challenges of the pandemic, we embraced change by introducing delivery services, ensuring our community could still enjoy their favorite meals safely at home.
      </p>
      <p className="description">
        With over seven years of serving delicious meals and welcoming more than a thousand guests, we take pride in being a part of Batangas City's vibrant food scene. As a single-branch establishment, we focus on delivering exceptional service and unforgettable dining experiences, one plate at a time.
      </p>
    </div>
    <img src={pic3} alt="Lolo's Place" className="image-right" />
  </section>
</div>

    </MainLayout>
  );
};

export default AboutPage;
