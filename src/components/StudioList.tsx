import React from 'react';
const StudioList = async() => {
      const response = await fetch(
    "http://localhost:5000/api/studios",
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch studios");
  }

  const studios = await response.json();

    return (
        <div>
             {studios.map((studio: any) => (
        <div key={studio._id}>
          <h2>{studio.title}</h2>
          <p>{studio.category}</p>
          <p>{studio.location}</p>
        </div>
      ))}
        </div>
    );
};

export default StudioList;