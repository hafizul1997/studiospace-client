import React from 'react';
import { Studio } from '@/app/Type/Studio';
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const StudioList = async() => {
     const response = await fetch(
    `${API_URL}/api/studios`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch studios");
  }

  const studios = await response.json();

    return (
        <div>
             {studios.map((studio:Studio) => (
        <div key={studio._id}>
          <h2>{studio.title}</h2>
          <p>{studio.category}</p>
          <p>{studio.location}</p>
        </div>
      ))}
        </div>
    );
}

export default StudioList;