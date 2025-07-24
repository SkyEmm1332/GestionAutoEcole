import './BusinessCard.css';
import logo from '../logo.png';

type BusinessCardProps = {
  photo: string; // base64 ou URL
  lastName: string;
  firstName: string;
  fonction: string;
  contact: string;
};

export default function BusinessCard({
  photo,
  lastName,
  firstName,
  fonction,
  contact,
}: BusinessCardProps) {
  return (
    <div className="card-container">
      <div className="logo-section">
        <img src={logo} alt="Logo" className="logo" />
        <h2 className="logo-text">EMMARY-AE</h2>
        <p className="slogan">Auto-école</p>
      </div>

      <div className="photo-wrapper">
        <img src={photo} alt={`${firstName} ${lastName}`} className="profile-photo" />
      </div>

      <div className="info-section">
        <h1 className="name">{`${lastName.toUpperCase()} ${firstName.toUpperCase()}`}</h1>
        <p className="title">{fonction.toUpperCase()}</p>

        <ul className="contact-list">
          <li><span className="square"></span> EMMARY-AE</li>
          <li><span className="square"></span> emmaryae@gmail.com</li>
          <li><span className="square"></span> Koumassi Remblais, entre la pharmacie Inchallah et la station des 3 ampoules</li>
          <li><span className="square"></span> {contact}</li>
        </ul>
      </div>
    </div>
  );
} 