import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LocationForm from "@/components/location-form";
import ResultsSection from "@/components/results-section";
import { type LocationRequest, type MidpointResponse } from "@shared/schema";

export default function Home() {
  const [searchData, setSearchData] = useState<LocationRequest | null>(null);
  const [results, setResults] = useState<MidpointResponse | null>(null);
  const [inputLocations, setInputLocations] = useState<
    { address: string; coordinates: { lat: number; lng: number } }[] | null
  >(null);

  const handleSearch = (data: LocationRequest) => {
    setSearchData(data);
  };

  const handleResults = (data: MidpointResponse) => {
    setResults(data);
  };

  const handleInputLocations = (
    locations: { address: string; coordinates: { lat: number; lng: number } }[]
  ) => {
    setInputLocations(locations);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-secondary mb-4">
            Find the Perfect Meeting Spot
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter two locations and discover cafes, restaurants, parks, and more
            at the perfect midpoint between you and your friends.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LocationForm
              onSearch={handleSearch}
              onResults={handleResults}
              onInputLocations={handleInputLocations}
            />
          </div>

          <div className="lg:col-span-2">
            <ResultsSection
              searchData={searchData}
              results={results}
              inputLocations={inputLocations}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
