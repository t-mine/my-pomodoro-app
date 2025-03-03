import React from 'react';
import Header from '../components/Header';
import Timer from '../components/Timer';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <main>
        <Timer />
      </main>
    </div>
  );
};

export default Home;
