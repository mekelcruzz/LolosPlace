import React from 'react';
import { Link } from 'react-router-dom';
import './About.css'; // Update the stylesheet reference
import logo from '../../assets/logo.png';
import MainLayout from '../../components/MainLayout';

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="about-page"> {/* Change the class name to reflect the About page */}
        

        <section id="about" className="about-section"> {/* Updated section ID and class */}
          <h1>About Lolo's Place</h1>
          <p className="description">
            At Lolo's Place, we pride ourselves on offering a unique dining experience that combines culinary excellence with a warm, inviting atmosphere. Established in [Year], our restaurant has become a beloved destination for those seeking high-quality meals and exceptional service.
          </p>
          <p className="description">
            Whether you're joining us for an intimate dinner, a family gathering, or a special event, Lolo's Place is dedicated to making every moment memorable. From our seasonal green market to our in-house bake shop and winery, we bring the best of local ingredients and flavors to your table.
          </p>
        </section>

      </div>
    </MainLayout>
  );
};

export default AboutPage;
